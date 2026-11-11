/* Registered module: museum-biography-data */
(function (initialize) {
  if (window.VoicesModules) window.VoicesModules.define('museum-biography-data', initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error('Module loader is missing');
  else initialize();
})(function () {
  'use strict';

  const sources={
    'palmares-iphan':['Iphan · Dossiê da Serra da Barriga','https://portal.iphan.gov.br/uploads/ckfinder/arquivos/Dossie_serra-da-barriga.pdf'],
    'dandara-multirio':['MultiRio · Dandara e a luta pela liberdade','https://www.multirio.rj.gov.br/index.php/leia/reportagens-artigos/reportagens/16845-dandara-e-a-luta-pela-liberdade'],
    'carolina-ims-bio':['IMS · Cronologia de Carolina Maria de Jesus','https://carolinamariadejesus.ims.com.br/biografia/'],
    'carolina-ims-obra':['IMS · Quarto de despejo e suas adaptações','https://carolinamariadejesus.ims.com.br/quarto-de-despejo/'],
    'ruth-venezia-bn':['Hemeroteca Digital · Cobertura de Veneza em 1953','https://hemeroteca-pdf.bn.gov.br/312622/per312622_1953_00023.pdf'],
    'nina-smithsonian':['Smithsonian NMAAHC · Nina Simone','https://nmaahc.si.edu/nina-simone'],
    'king-chronology':['Stanford · Cronologia do Instituto Martin Luther King Jr.','https://kinginstitute.stanford.edu/king-resources/major-king-events-chronology-1929-1968'],
    'lelia-pbh':['Prefeitura de Belo Horizonte · Lélia Gonzalez','https://prefeitura.pbh.gov.br/cultura/ric/personalidades-negras/lelia-gonzalez'],
    'milton-usp':['USP · Milton Santos e a geografia crítica','https://sites.usp.br/portalatinoamericano/espanol-santos-milton'],
    'abdias-ten':['Ipeafro · Acervo do Teatro Experimental do Negro','https://ipeafro.org.br/acoes/acervo-ipeafro/secao-ten/'],
    'abdias-man':['Ipeafro · Museu de Arte Negra','https://man.ipeafro.org.br/sobre-abdias-nascimento/'],
    'elza-an':['Arquivo Nacional · Elza Soares','https://www.gov.br/arquivonacional/pt-br/canais_atendimento/imprensa/noticias/serie-mulheres-e-o-arquivo-elza-soares'],
    'katherine-nasa':['NASA Langley · Biografia de Katherine Johnson','https://www.nasa.gov/centers-and-facilities/langley/katherine-johnson-biography/'],
    'parks-loc':['Library of Congress · Papéis de Rosa Parks','https://www.loc.gov/collections/rosa-parks-papers/about-this-collection/'],
    'tubman-nps':['National Park Service · Harriet Tubman','https://www.nps.gov/hatu/learn/historyculture/htubman.htm'],
    'biko-bcp':['South African History Online · Black Community Programmes','https://sahistory.org.za/article/black-community-programmes-bcp'],
    'davis-ucsc':['UC Santa Cruz · Entrevista com Angela Davis','https://histcon.ucsc.edu/profiles/2019/08/you-have-the-right-to-be-brilliant-an-interview-with-dr-angela-davis/'],
    'greenbelt-history':['Green Belt Movement · História do movimento','https://www.greenbeltmovement.org/history/'],
    'sueli-usp':['USP · Enciclopédia de Antropologia, Sueli Carneiro','https://ea.fflch.usp.br/autor/sueli-carneiro'],
    'sueli-geledes':['Geledés · Textos de Sueli Carneiro','https://www.geledes.org.br/cadernos-geledes/'],
    'capoeira-iphan':['Iphan · Dossiê da roda e do ofício dos mestres de capoeira','https://bcr.iphan.gov.br/wp-content/uploads/tainacan-items/65968/66660/Capoeira_de_Dossie-corrigido-2014_.pdf'],
    'cassiano-dca':['Dicionário Cravo Albin · Cassiano e os créditos de Primavera','https://dicionariompb.com.br/artista/cassiano/'],
    'bimba-bahia':['Governo da Bahia · Mestre Bimba e a escola Regional','https://www.ba.gov.br/comunicacao/2009/11/noticias/aniversario-de-mestre-bimba-e-comemorado-no-forte-da-capoeira'],
    'pastinha-pbh':['Prefeitura de Belo Horizonte · Mestre Pastinha','https://prefeitura.pbh.gov.br/cultura/ric/personalidades-negras/mestre-pastinha'],
    'rosana-pina':['Pinacoteca · Rosana Paulino, A costura da memória','https://pinacoteca.org.br/programacao/exposicoes/rosana-paulino-a-costura-da-memoria/'],
    'adario-mab':['Museu Afro Brasil Emanoel Araujo · José Adário','https://museuafrobrasil.org.br/pessoas-grupos-instituicoes-organizacoes/jose-adario/'],
    'adario-exu':['Museu Afro Brasil Emanoel Araujo · Exu, ficha de acervo','https://museuafrobrasil.org.br/acervo/exu-17/'],
    'mansa-met':['The Met · Cronologia do Sudão ocidental e central','https://artistproject.metmuseum.org/toah/ht/07/afu.html'],
    'timbuktu-unesco':['UNESCO · Patrimônio Mundial de Tombuctu','https://whc.unesco.org/en/list/119'],
    'baldwin-smithsonian':['Smithsonian NMAAHC · Baldwin na França','https://nmaahc.si.edu/explore/stories/baldwin-france'],
    'marta-fifa':['FIFA · Trajetória de Marta em Copas do Mundo','https://www.fifa.com/en/the-best-fifa-football-awards/articles/incredible-marta-honoured-with-special-award']
  };

  const profiles={};
  const add=(id,portrait,name,area,period,sourceIds,sections,milestones,related)=>{
    profiles[id]={id,portrait,name,area,period,sourceIds,sections,milestones,related};
  };

  add('zumbi',136,'Zumbi dos Palmares','Direitos e sociedade','Século XVII · Brasil colonial',['research-palmares','palmares-iphan'],[
    ['Palmares por dentro','Na serra da Barriga e em áreas vizinhas, comunidades chamadas mocambos reuniram pessoas que construíram alternativas à escravização. Havia roças, redes de troca e formas de defesa. A liderança de Zumbi pertence a essa organização, sustentada pelo trabalho e pelas decisões de muitas famílias.'],
    ['Uma decisão em disputa','Em 1678, Ganga Zumba negociou um acordo com autoridades coloniais. A proposta dividiu Palmares. Zumbi se opôs aos termos e tornou-se uma liderança central na fase seguinte da resistência. O episódio ajuda a perceber as escolhas difíceis diante da violência colonial e dos limites da liberdade oferecida.'],
    ['O que chega ao museu','Grande parte da documentação escrita sobre Palmares veio de autoridades e forças que o combatiam. A arqueologia, os estudos do território e as memórias negras ampliam a leitura desses papéis. No Museu Esquecido, pergunte quem produziu a descrição e com qual interesse.']
  ],[['1678','Acordo negociado por Ganga Zumba.'],['1694','A ofensiva colonial destrói o principal núcleo de Palmares.'],['1695','Zumbi é morto em 20 de novembro.']],['dandara','luiz-gama']);

  add('dandara',137,'Dandara dos Palmares','Direitos e sociedade','Memória de Palmares · século XVII',['research-palmares','palmares-iphan','dandara-multirio'],[
    ['Uma liderança na memória','Dandara aparece na memória brasileira como uma mulher negra ligada à resistência de Palmares. Tradições orais e narrativas posteriores transmitem diferentes versões de sua história. Elas mostram a importância de lembrar a participação das mulheres na construção e na defesa dos mocambos.'],
    ['O que se consegue documentar','A documentação escrita conhecida sobre sua trajetória é escassa. Informações sobre nascimento, parentesco, ações específicas e morte têm graus diferentes de sustentação. Uma ficha de museu pode indicar de onde vem cada relato e deixar explícito o que permanece em investigação.'],
    ['As perguntas que ficam','Quem cultivava os alimentos, transmitia conhecimentos e cuidava das redes de apoio? Essas perguntas ajudam a ler a história coletiva de Palmares. Um arquivo colonial registra sobretudo o que interessava a quem o produziu. A memória e a pesquisa abrem outras perguntas.']
  ],[['Palmares','As comunidades enfrentam sucessivas ofensivas coloniais.'],['Memória oral','Diferentes narrativas preservam a presença de Dandara.'],['Pesquisa histórica','O acervo identifica quais datas ainda carecem de documentação.']],['zumbi','lelia']);

  add('machado',138,'Machado de Assis','Literatura','1839–1908 · Rio de Janeiro',['heritage_machado','bio-machado'],[
    ['Aprender entre tipos e jornais','Joaquim Maria Machado de Assis nasceu no Rio de Janeiro. Aprendeu o trabalho de tipógrafo na Imprensa Nacional e passou por funções de revisão e redação. A imprensa foi um espaço de formação e de publicação. Poesia, teatro, crônica e conto acompanharam sua carreira de romancista.'],
    ['O narrador faz escolhas','Em Memórias póstumas de Brás Cubas, o narrador morto reorganiza o passado com humor e tenta conduzir o julgamento de quem lê. Em Dom Casmurro, Bento Santiago seleciona as lembranças e apresenta suas suspeitas. Vale observar o que cada voz diz sobre si e as oportunidades de resposta que dá aos demais personagens.'],
    ['Literatura e instituição','Machado foi o primeiro presidente da Academia Brasileira de Letras. Sua obra acompanha uma sociedade marcada pela escravidão e pelas mudanças do fim do Império. Ler um trecho com sua data e sua voz narrativa ajuda a perceber como a ironia expõe relações de poder.']
  ],[['1856','Começa como aprendiz de tipógrafo na Imprensa Nacional.'],['1881','Memórias póstumas de Brás Cubas sai em livro.'],['1897','É eleito primeiro presidente da Academia Brasileira de Letras.']],['carolina','baldwin']);

  add('carolina',139,'Carolina Maria de Jesus','Literatura','1914–1977 · Minas Gerais e São Paulo',['carolina-ims-bio','carolina-ims-obra','carolina_an'],[
    ['Uma escritora antes do livro','Carolina nasceu em Sacramento, Minas Gerais. Em São Paulo, viveu na favela do Canindé, trabalhou na coleta de papel e sustentou os filhos. Registrava o cotidiano em cadernos e também elaborava poemas, narrativas e canções. Já escrevia e buscava publicar antes de conhecer o jornalista Audálio Dantas.'],
    ['Do manuscrito à edição','Quarto de despejo reúne entradas selecionadas dos diários do Canindé. A edição de 1960 levou a muitos leitores o modo como Carolina observava o trabalho, a fome, as notícias e a vida da cidade. A comparação com os cadernos permite investigar o que foi escolhido para a publicação e como ela trabalhava a linguagem.'],
    ['Uma obra em vários registros','Casa de alvenaria, publicado em 1961, continua a escrita de diário depois da mudança do Canindé. O acervo também guarda textos de outros gêneros e o registro de suas composições. Ruth de Souza interpretou Carolina numa adaptação teatral e visitou o Canindé com a autora para preparar a personagem.']
  ],[['1958','Conhece Audálio Dantas no Canindé e tem trechos do diário publicados na imprensa.'],['1960','Publica Quarto de despejo.'],['1961','Publica Casa de alvenaria.']],['ruth','conceicao']);

  add('luiz-gama',140,'Luiz Gama','Direitos e sociedade','1830–1882 · Bahia e São Paulo',['bio-luizgama'],[
    ['Da Bahia para São Paulo','Nascido livre em Salvador, Luiz Gama foi vendido pelo pai quando criança e levado para São Paulo. Aprendeu a ler e a escrever ainda jovem e recuperou a liberdade. Sua experiência com a escravização e com a escrita marcou o modo como atuou na imprensa e perante os tribunais.'],
    ['Imprensa e ações de liberdade','Gama escreveu poesia satírica e textos jornalísticos. Estudou as leis e atuou como advogado provisionado. Em ações de liberdade, contestou a manutenção ilegal da escravização, entre outros argumentos, com base em normas que proibiam o tráfico. O trabalho reunia testemunhos, documentos e debate público.'],
    ['A carta como fonte','Em 1880, escreveu a Lúcio de Mendonça sobre sua vida. A carta é uma fonte rara em primeira pessoa, com escolhas próprias do autor. Ao ler sua história junto à de André Rebouças, observe como duas trajetórias recorreram a ferramentas diferentes dentro do movimento abolicionista.']
  ],[['1830','Nasce em Salvador.'],['1859','Publica Primeiras trovas burlescas de Getulino.'],['1880','Escreve a carta autobiográfica a Lúcio de Mendonça.']],['reboucas','zumbi']);

  add('antonieta',141,'Antonieta de Barros','Direitos e sociedade','1901–1952 · Santa Catarina',['bio-antonieta'],[
    ['A escola e a cidade','Antonieta cresceu em Florianópolis e se formou professora. Criou um curso que levava a alfabetização também a pessoas adultas. O ensino era parte de sua atuação pública. O acesso à leitura e à formação profissional podia abrir caminhos para quem tinha poucas oportunidades.'],
    ['A assinatura Maria da Ilha','Na imprensa, Antonieta discutiu educação, participação das mulheres e desigualdade. Assinava textos como Maria da Ilha. Em Farrapos de ideias reuniu crônicas que permitem ler suas posições na própria escrita, além das informações registradas sobre sua carreira política.'],
    ['Da sala de aula à Assembleia','Eleita deputada estadual em 1934, tornou-se a primeira mulher negra eleita deputada no Brasil. Seu trabalho legislativo retomou questões da escola. Comparar um artigo de jornal e uma proposta parlamentar ajuda a ver como o mesmo assunto muda de forma conforme o público e a instituição.']
  ],[['1920–1930','Atua no ensino e na imprensa catarinense.'],['1934','É eleita deputada estadual em Santa Catarina.'],['1937','Publica Farrapos de ideias.']],['lelia','marielle']);

  add('milton',142,'Milton Santos','Ciência e território','1926–2001 · Brasil e outros países',['bio-milton','milton-usp'],[
    ['Pesquisa em muitos lugares','Milton Santos nasceu na Bahia e formou-se em Direito antes de consolidar a carreira na Geografia. Após o golpe de 1964, viveu no exílio e trabalhou em universidades de vários países. Esse percurso pôs em diálogo cidades, economias e condições de vida que ele pesquisava de perto.'],
    ['Como se produz uma cidade','Suas pesquisas examinam como a distribuição de trabalho, transporte, serviços e tecnologia organiza o espaço. Em O espaço do cidadão, a localização de uma moradia ajuda a explicar oportunidades diferentes de acesso. Use essa pergunta ao comparar dois trajetos para a escola em New Harmony.'],
    ['Ler a globalização','Em Por uma outra globalização, Milton Santos discute as narrativas sobre a integração mundial, a desigualdade produzida por ela e a possibilidade de organizá-la de outras formas. Sua geografia combina o que se observa na rua com decisões econômicas e políticas em escalas maiores.']
  ],[['1964','O golpe militar interrompe sua atuação no Brasil e antecede o exílio.'],['1994','Recebe o prêmio Vautrin Lud.'],['2000','Publica Por uma outra globalização.']],['wangari','marielle']);

  add('lelia',143,'Lélia Gonzalez','Direitos e sociedade','1935–1994 · Brasil e Américas',['bio-lelia','lelia-pbh'],[
    ['Formação e atuação pública','Nascida em Belo Horizonte, Lélia cresceu numa família trabalhadora e desenvolveu sua atuação como professora, pesquisadora e militante. Participou da fundação do movimento que se tornou o Movimento Negro Unificado. Também levou a experiência das mulheres negras a debates sobre trabalho, representação e violência.'],
    ['Amefricanidade','Com essa categoria, Lélia propôs pensar as Américas a partir das experiências e criações de povos indígenas e de populações negras da diáspora. Ao discutir o pretuguês, chamou atenção para as marcas de línguas e práticas africanas na fala brasileira e para o preconceito contra quem as carrega.'],
    ['Ler com o museu','Uma exposição de palavras pode cruzar o dicionário com a história de quem fala. Os ensaios de Lélia ajudam a perceber como racismo e sexismo aparecem juntos em situações cotidianas. Sua obra convida a reconhecer as pessoas que formulam essas interpretações e já atuam para mudar as condições de vida.']
  ],[['1978','Participa da fundação do Movimento Negro Unificado.'],['Década de 1980','Publica ensaios que articulam racismo, sexismo e linguagem.'],['1988','Publica A categoria político-cultural de amefricanidade.']],['sueli','conceicao']);

  add('abdias',144,'Abdias do Nascimento','Artes','1914–2011 · Brasil e diáspora',['bio-abdias','abdias-ten','abdias-man'],[
    ['O palco como espaço de formação','Abdias, nascido em Franca, fundou o Teatro Experimental do Negro no Rio de Janeiro em 1944. O grupo reuniu atores e organizou formação, incluindo alfabetização. A estreia de O imperador Jones, em 1945, colocou Aguinaldo Camargo como protagonista no Teatro Municipal. Ruth de Souza integrou a companhia.'],
    ['Do teatro ao museu','O projeto do Museu de Arte Negra ganhou impulso no 1º Congresso do Negro Brasileiro, em 1950. Abdias articulou contribuições de artistas e reuniu obras da África e da diáspora. O acervo teve uma primeira exposição em 1968. Durante sua permanência no exterior, continuou pintando, ensinando e mantendo redes culturais.'],
    ['Organizar o que será visto','Ao aproximar teatro, escrita, pintura e política, Abdias colocou a autoria negra no centro de instituições que historicamente a restringiam. Os documentos do Ipeafro permitem consultar os nomes das pessoas, os espetáculos e as iniciativas desse trabalho coletivo.']
  ],[['1944','Funda o Teatro Experimental do Negro.'],['1950','O Congresso do Negro Brasileiro propõe a criação do Museu de Arte Negra.'],['1968','A coleção tem sua primeira exposição.']],['ruth','rosana']);

  add('ruth',145,'Ruth de Souza','Artes','1921–2019 · Rio de Janeiro',['bio-ruth','ruth-venezia-bn','abdias-ten','carolina-ims-obra'],[
    ['A formação no teatro','Ruth de Souza começou a atuar no Teatro Experimental do Negro. O grupo formava artistas e criava oportunidades em um circuito que oferecia poucas personagens complexas a atrizes negras. Em sua carreira, Ruth passou dos palcos ao cinema e à televisão, construindo repertório em formatos diferentes.'],
    ['Trabalho de interpretação','A imprensa da época destacou sua atuação em Sinhá Moça na cobertura do Festival de Veneza de 1953. Para interpretar Carolina Maria de Jesus numa adaptação de Quarto de despejo, Ruth visitou o Canindé com a escritora. Essa etapa de pesquisa mostra como uma atriz desenvolve uma personagem a partir da escuta, do texto e do trabalho de cena.'],
    ['Olhar os créditos','Uma ficha de cinema pode citar direção, elenco, roteiro e adaptação. A trajetória de Ruth chama atenção para o trabalho de interpretar e para quem recebe os papéis centrais. O acervo do teatro e o do IMS mostram a atriz em relação com outras pessoas que abriram caminhos nas artes brasileiras.']
  ],[['Década de 1940','Integra o Teatro Experimental do Negro.'],['1953','Recebe destaque pela atuação em Sinhá Moça, exibido em Veneza.'],['Década de 1960','Interpreta Carolina em adaptação teatral de Quarto de despejo.']],['abdias','carolina']);

  add('conceicao',146,'Conceição Evaristo','Literatura','Nascida em 1946 · Brasil',['bio-conceicao','heritage_conceicao'],[
    ['Da leitura à pesquisa','Conceição Evaristo nasceu em Belo Horizonte. Mudou-se para o Rio de Janeiro, atuou como professora e se formou em Letras. Sua produção acadêmica também se voltou para a literatura negra. O trabalho com a palavra abrange poesia, contos, romances e reflexão sobre a própria escrita.'],
    ['Personagens, lembranças e lugares','Ponciá Vicêncio acompanha os deslocamentos e as lembranças de uma mulher negra. Becos da memória reúne vozes em torno de um lugar ameaçado de remoção. Em Olhos d’água, os contos mudam de personagens e pontos de vista, permitindo perceber experiências diversas dentro de um mesmo livro.'],
    ['Escrevivência','A autora formulou esse conceito ao aproximar criação, experiência e memória coletiva. Uma lembrança pode chegar ao texto por meio de escolhas de ritmo, imagem e voz. O caderno de leitura do museu pode reunir uma pergunta sobre essas escolhas, além dos dados de publicação.']
  ],[['1990','Publica nos Cadernos Negros.'],['2003','Publica Ponciá Vicêncio.'],['2014','Publica Olhos d’água.']],['carolina','chimamanda']);

  add('gil',147,'Gilberto Gil','Música','Nascido em 1942 · Brasil',['bio-gil'],[
    ['Rádio, acordeão e violão','Gilberto Gil nasceu em Salvador e passou parte da infância no interior da Bahia. A escuta de Luiz Gonzaga e a aprendizagem do acordeão marcaram seu começo. O violão e a canção se tornaram centrais quando se aproximou de outras formas de compor e de se apresentar.'],
    ['Da Tropicália ao exílio','A Tropicália colocou referências brasileiras e internacionais em diálogo com novas maneiras de gravar e fazer arranjos. Gil participou de discos coletivos e trabalhou com parceiros como Caetano Veloso. Durante a ditadura militar, foi preso e viveu em Londres. Retornou ao Brasil em 1972.'],
    ['Escutar um disco por inteiro','Em Refazenda, o arranjo, as vozes e o encadeamento das faixas fazem parte do projeto musical. A discografia de Gil permite acompanhar mudanças de repertório e parcerias ao longo do tempo. Ao ler os créditos no Distrito do Ritmo, procure os nomes de quem compôs, tocou e trabalhou no estúdio.']
  ],[['1967','Lança o álbum Louvação.'],['1968','Participa do disco coletivo Tropicália ou Panis et Circencis.'],['1975','Lança Refazenda.']],['tim','elza']);

  add('elza',148,'Elza Soares','Música','1930–2022 · Rio de Janeiro',['bio-elza','elza-an'],[
    ['Uma voz de muitas fases','Elza Soares construiu a carreira a partir do Rio de Janeiro. No começo, gravou sambas como Se acaso você chegasse, composição de Lupicínio Rodrigues e Felisberto Martins. Seu fraseado criava variações de ritmo e som sobre a melodia e dava forma própria a repertórios de autores diferentes.'],
    ['Gravar com outras gerações','Ao longo da carreira, Elza trabalhou com músicos de várias gerações. Em A Mulher do Fim do Mundo, o trabalho com compositores e instrumentistas de São Paulo aproximou samba e experimentação sonora. As letras enfrentam temas como violência contra mulheres e racismo, e a interpretação dá peso às histórias narradas.'],
    ['Um exercício de escuta','Escolha duas gravações da cantora e compare a entrada da voz, o espaço deixado para os instrumentos e as palavras que ela prolonga. Ao lado de Nina Simone e de outras intérpretes do acervo, Elza ajuda a perceber como uma gravação cria sentidos com a voz, o arranjo e o repertório.']
  ],[['1959–1960','Chega ao disco com Se acaso você chegasse.'],['2002','Lança Do cóccix até o pescoço.'],['2015','Lança A Mulher do Fim do Mundo.']],['nina','cartola']);

  add('nina',149,'Nina Simone','Música','1933–2003 · Estados Unidos e França',['heritage_nina','nina-smithsonian'],[
    ['O piano de Eunice Waymon','Nascida na Carolina do Norte, Eunice Waymon começou a tocar piano na infância e recebeu apoio da comunidade para estudar. Preparou-se para uma carreira de concertista e estudou na Juilliard. Depois que sua candidatura ao Curtis Institute foi recusada, passou a trabalhar como musicista e adotou o nome Nina Simone.'],
    ['Repertório e direitos civis','Seu modo de tocar e cantar aproximou formação clássica, gospel, jazz e blues. Após a violência racista de 1963, escreveu Mississippi Goddam. O ritmo vivo e a letra de denúncia criam tensão na canção. Ela também interpretou e compôs obras que colocam experiências de mulheres negras em primeiro plano.'],
    ['Ler uma apresentação','Uma biografia de Nina ganha profundidade quando se escutam apresentações diferentes da mesma música. A artista mudava o andamento, as pausas e o diálogo com a plateia. Em uma ficha, vale registrar se o trecho vem de uma gravação de estúdio, de um show ou de outro documento.']
  ],[['Década de 1950','Adota o nome artístico e começa a gravar.'],['1964','Mississippi Goddam é lançada em disco.'],['1965','Apresenta-se no contexto das marchas por direitos civis de Selma a Montgomery.']],['elza','rosetta','king']);

  add('katherine',150,'Katherine Johnson','Ciência e território','1918–2020 · Estados Unidos',['katherine-nasa','bio-katherine'],[
    ['Da sala de aula a Langley','Katherine Johnson estudou matemática e francês no West Virginia State College e trabalhou como professora. Em 1953, entrou no laboratório de Langley da NACA, antecessora da NASA. Chegou à equipe de matemáticas negras da West Area Computing, liderada por Dorothy Vaughan em um ambiente marcado pela segregação.'],
    ['As contas e seus autores','Katherine e Ted Skopinski assinaram em 1960 um relatório sobre como colocar um satélite em órbita sobre uma posição escolhida na Terra. Em 1962, ela refez os cálculos de trajetória para conferir os resultados do computador antes do voo orbital de John Glenn. Revisar um resultado era parte do trabalho científico.'],
    ['Um percurso maior que um voo','Katherine também trabalhou com trajetórias do projeto Apollo e participou de pesquisas ligadas a outros programas da NASA. Uma leitura do relatório de 1960 permite olhar para a pergunta, o procedimento e os nomes de quem assumiu responsabilidade pelas contas. É a mesma ideia usada no caderno de bancada de New Harmony.']
  ],[['1953','Começa a trabalhar em Langley.'],['1960','Assina com Ted Skopinski um relatório técnico sobre órbita.'],['1962','Confere os cálculos do voo orbital de John Glenn.']],['reboucas','wangari']);

  add('rosa',151,'Rosa Parks','Direitos e sociedade','1913–2005 · Estados Unidos',['bio-rosa','parks-loc'],[
    ['Anos de organização','Rosa Parks trabalhou como costureira e foi secretária da seção de Montgomery da NAACP, associação que combatia a discriminação racial. Antes da prisão de 1955, recolhia relatos, participava de campanhas e buscava formação em organização comunitária. Seus papéis documentam parte desse trabalho.'],
    ['O boicote de Montgomery','Depois que Parks se recusou a ceder o lugar no ônibus e foi presa, organizadoras como Jo Ann Robinson fizeram circular chamados ao boicote. Durante meses, a população negra de Montgomery sustentou alternativas de transporte. A ação coletiva e os processos judiciais pressionaram pelo fim da segregação nos ônibus.'],
    ['A vida depois da fotografia','Parks mudou-se para Detroit e continuou atuando por direitos civis. Anos depois, ajudou a criar um instituto para a formação de jovens. No acervo da Biblioteca do Congresso, fotografias convivem com cartas, programas e anotações que ampliam a história que costuma caber numa única imagem.']
  ],[['1943','Passa a atuar como secretária da NAACP de Montgomery.'],['1955','Sua prisão torna-se um dos marcos do início do boicote.'],['1987','Cria com Elaine Eason Steele um instituto voltado à formação de jovens.']],['king','harriet']);

  add('harriet',152,'Harriet Tubman','Direitos e sociedade','Século XIX e início do XX · Estados Unidos',['bio-harriet','tubman-nps'],[
    ['Caminhos para a liberdade','Harriet nasceu escravizada em Maryland, com o nome Araminta Ross. Depois de fugir em 1849, retornou ao sul para ajudar familiares e outras pessoas a escapar. A rede conhecida como Underground Railroad dependia de abrigos, guias, comunicação discreta e escolhas feitas sob risco.'],
    ['Trabalho durante a Guerra Civil','Tubman atuou junto às forças da União em diferentes funções, entre elas enfermagem e reconhecimento do território. Em 1863, participou do planejamento e da condução de uma operação no rio Combahee, na Carolina do Sul, que permitiu a fuga de centenas de pessoas escravizadas.'],
    ['Cuidado, direitos e memória','Em Auburn, no estado de Nova York, Harriet apoiou pessoas idosas e participou da luta pelo voto das mulheres. Seu percurso pode ser lido em documentos de serviço e registros comunitários. Mapas da Underground Railroad representam relações de confiança entre pessoas e lugares.']
  ],[['1849','Escapa da escravização em Maryland.'],['1863','Atua na expedição do rio Combahee.'],['1913','Morre em Auburn, onde ajudou a estabelecer um lar para idosos.']],['rosa','luiz-gama']);

  add('king',153,'Martin Luther King Jr.','Direitos e sociedade','1929–1968 · Estados Unidos',['king-chronology','heritage_king'],[
    ['Formação e primeiros anos','Martin Luther King Jr. nasceu em Atlanta, em uma família ligada à igreja batista. Estudou teologia e tornou-se pastor em Montgomery. Durante o boicote aos ônibus, assumiu a presidência da associação que coordenou parte da mobilização. Rosa Parks, Jo Ann Robinson e muitas pessoas da cidade já organizavam a luta contra a segregação.'],
    ['Ação não violenta e organização','Em Birmingham, manifestações confrontaram a segregação em espaços públicos e no comércio. Preso em 1963, King escreveu uma carta que discutia a urgência das ações e a responsabilidade diante de leis injustas. A Marcha sobre Washington daquele ano reuniu organizações que reivindicavam emprego e liberdade.'],
    ['Direitos, trabalho e pobreza','King recebeu o Nobel da Paz em 1964. Nos últimos anos, articulou campanhas sobre pobreza e trabalho e apoiou a greve de trabalhadores da limpeza urbana em Memphis. O instituto que reúne seus documentos permite ler discursos junto aos programas, cartas e decisões coletivas que sustentaram essas campanhas.']
  ],[['1955–1956','Ajuda a coordenar o boicote aos ônibus de Montgomery.'],['1963','Escreve a Carta da prisão de Birmingham e fala na Marcha sobre Washington.'],['1968','É assassinado em Memphis durante a mobilização dos trabalhadores da limpeza.']],['rosa','nina']);

  add('mandela',154,'Nelson Mandela','Direitos e sociedade','1918–2013 · África do Sul',['bio-mandela'],[
    ['Advocacia e organização','Nelson Rolihlahla Mandela nasceu em Mvezo. Em Joanesburgo, atuou no Congresso Nacional Africano, o ANC, e abriu com Oliver Tambo um escritório de advocacia. O apartheid impunha classificações raciais e restringia moradia, circulação, trabalho e direitos políticos. A atuação de Mandela passou por campanhas públicas, organização clandestina e defesa jurídica.'],
    ['Julgamento e prisão','No julgamento de Rivonia, Mandela e outros acusados receberam penas de prisão perpétua em 1964. Mandela passou parte da pena em Robben Island. Durante a prisão, a resistência ao apartheid seguiu por meio de movimentos, greves, campanhas internacionais e trabalho comunitário.'],
    ['A transição democrática','Libertado em 1990, Mandela participou de negociações para pôr fim ao regime. Em 1994, a população adulta pôde votar nas primeiras eleições nacionais democráticas com sufrágio universal, e ele assumiu a presidência. Os acervos do Cabo ajudam a estudar como os efeitos de remoções, desigualdade e segregação continuaram na vida dos bairros.']
  ],[['1964','É condenado no julgamento de Rivonia.'],['1990','É libertado após 27 anos de prisão.'],['1994','Assume a presidência após as eleições democráticas.']],['biko','king']);

  add('biko',155,'Steve Biko','Direitos e sociedade','1946–1977 · África do Sul',['bio-biko','biko-bcp'],[
    ['Organizar a partir da experiência negra','Stephen Bantu Biko estudou medicina em Durban. Ajudou a construir a South African Students’ Organisation, a SASO, e participou da formulação da Consciência Negra. O movimento incentivava estudantes e comunidades negras a desenvolver suas próprias organizações, interpretar suas experiências e agir diante da segregação.'],
    ['Clínicas, publicações e comunidades','Os Black Community Programmes apoiaram iniciativas de saúde, formação e produção de textos. Biko participou desse trabalho e se envolveu em projetos no Cabo Oriental, onde também atuou Mamphela Ramphele. Essas ações tornam visível uma dimensão cotidiana do movimento, feita de pesquisa, serviços e cooperação.'],
    ['A repressão e o arquivo','Em 1973, o governo restringiu a circulação e a atuação pública de Biko. Ele morreu em 1977 após violência sob custódia policial. Compare, na biblioteca do jogo, o modo como uma ordem do governo descreve uma pessoa e o modo como os documentos do próprio movimento descrevem suas atividades.']
  ],[['1969','É eleito primeiro presidente da SASO.'],['1973','Recebe uma ordem de restrição sob o apartheid.'],['1977','Morre sob custódia policial.']],['mandela','lelia']);

  add('angela',156,'Angela Davis','Direitos e sociedade','Nascida em 1944 · Estados Unidos',['bio-angela','davis-ucsc'],[
    ['Filosofia e atuação pública','Angela Davis nasceu em Birmingham, Alabama, durante a segregação. Estudou filosofia e desenvolveu uma carreira de pesquisa e ensino. Sua atuação pública inclui movimentos negros, feministas e campanhas em torno do sistema prisional. A docência na Universidade da Califórnia, em Santa Cruz, faz parte desse percurso.'],
    ['O que as instituições fazem','Em Mulheres, raça e classe, Davis examina relações entre trabalho, escravidão, emancipação e movimentos de mulheres nos Estados Unidos. Em obras sobre prisões, investiga como o encarceramento se liga a políticas públicas, desigualdade e interesses econômicos. Cada livro parte de um conjunto de documentos e perguntas históricas.'],
    ['A música como fonte','Em Blues Legacies and Black Feminism, Davis estuda as gravações de Gertrude “Ma” Rainey, Bessie Smith e Billie Holiday. A escuta é uma maneira de investigar como artistas negras trataram do trabalho, dos afetos e da autonomia. O Distrito do Ritmo oferece outra oportunidade de perguntar quem interpreta as canções e em que contexto.']
  ],[['1974','Publica sua autobiografia.'],['1981','Publica Mulheres, raça e classe.'],['1998','Publica Blues Legacies and Black Feminism.']],['sueli','nina']);

  add('wangari',157,'Wangari Maathai','Ciência e território','1940–2011 · Quênia',['bio-wangari','bio-greenbelt','greenbelt-history'],[
    ['Da ciência à escuta','Wangari Maathai nasceu no Quênia, estudou ciências biológicas e obteve o doutorado na Universidade de Nairóbi, onde ensinou anatomia veterinária. O trabalho com organizações de mulheres levou sua atenção a problemas relatados por moradoras rurais, como a escassez de água, lenha e alimentos.'],
    ['O trabalho dos viveiros','O Green Belt Movement começou em 1977. As participantes criaram viveiros, plantaram árvores e cuidaram das mudas. Aprender a produzir e manter as plantas localmente conectava recuperação ambiental com a renda e as decisões das comunidades. Sobreviver à primeira estação também fazia parte da avaliação do plantio.'],
    ['Ambiente e participação','Wangari relacionou a proteção de áreas públicas à participação política. Recebeu o Nobel da Paz em 2004 por uma atuação que aproximava desenvolvimento sustentável, democracia e paz. Na Horta Comunitária, pergunte quem escolhe as mudas, quem faz as regas e quem acompanha os resultados.']
  ],[['1971','Conclui o doutorado na Universidade de Nairóbi.'],['1977','Inicia o Green Belt Movement.'],['2004','Recebe o Prêmio Nobel da Paz.']],['milton','katherine']);

  add('marielle',158,'Marielle Franco','Direitos e sociedade','1979–2018 · Rio de Janeiro',['bio-marielle'],[
    ['Formação e trabalho comunitário','Marielle cresceu no Complexo da Maré. Passou pelo pré-vestibular comunitário, formou-se em Ciências Sociais na PUC-Rio e fez mestrado em Administração Pública na UFF. Em sua dissertação, estudou a política de segurança pública e o modo como a atuação do Estado era apresentada e vivida nas favelas.'],
    ['Direitos e representação','Atuou em organizações da sociedade civil e coordenou a Comissão de Defesa dos Direitos Humanos e Cidadania da Alerj. Eleita vereadora em 2016, presidiu a Comissão da Mulher da Câmara Municipal. Seu trabalho colocou em debate a vida de mulheres, pessoas negras e moradores de favelas.'],
    ['Ler os registros de um mandato','Marielle e o motorista Anderson Pedro Gomes foram assassinados em março de 2018. Os registros de sua atuação ajudam a conhecer projetos, debates e pessoas que deram forma ao mandato. Uma exposição pode reunir a dissertação, as propostas e as lembranças de quem trabalhou com ela.']
  ],[['Antes de 2016','Atua na Maré e na defesa dos direitos humanos na Alerj.'],['2016','É eleita vereadora do Rio de Janeiro.'],['2018','Marielle e Anderson Pedro Gomes são assassinados em 14 de março.']],['antonieta','milton']);

  add('pele',159,'Pelé','Esporte','1940–2022 · Brasil',['bio-pele'],[
    ['Do clube à seleção','Edson Arantes do Nascimento nasceu em Três Corações, Minas Gerais. Iniciou a carreira profissional no Santos. Em 1958, disputou a Copa do Mundo com 17 anos e marcou dois gols na final. A seleção reuniu jogadores de funções diferentes, e o torneio projetou mundialmente aquele grupo.'],
    ['Três Copas, papéis diferentes','Na Copa de 1962, Pelé se lesionou e ficou fora de boa parte da campanha. Seus companheiros deram continuidade à competição e conquistaram o título. Em 1970, voltou a ser decisivo em uma seleção conhecida pela combinação de jogadores criativos e pelo trabalho coletivo.'],
    ['O que os vídeos mostram','As imagens de partidas permitem observar desmarque, passe, cabeceio e movimentos sem a bola. A carreira de Pelé também inclui a longa passagem pelo Santos e a experiência no New York Cosmos. Ao montar uma ficha, registre o torneio e a data da imagem para situar a jogada.']
  ],[['1958','Conquista sua primeira Copa do Mundo.'],['1962','Integra a seleção campeã no Chile.'],['1970','Conquista a terceira Copa, no México.']],['marta','rebeca']);

  add('marta',160,'Marta Vieira da Silva','Esporte','Nascida em 1986 · Brasil',['bio-marta','marta-fifa'],[
    ['De Dois Riachos ao futebol profissional','Marta nasceu em Dois Riachos, Alagoas. Jogou desde criança, iniciou a carreira profissional no Brasil e passou por clubes no exterior, entre eles o Umeå IK, da Suécia. O percurso liga campos de formação, competições de clubes e a seleção brasileira em épocas de acesso desigual ao futebol.'],
    ['O torneio de 2007','Na Copa do Mundo de 2007, o Brasil chegou à final. Marta liderou a artilharia e recebeu o prêmio de melhor jogadora. A campanha oferece bons exemplos de mudança de ritmo, controle da bola e criação de oportunidades para as companheiras.'],
    ['O que fica para as equipes','A carreira de Marta atravessa diferentes gerações da seleção. Sua visibilidade abriu espaço para falar de formação, condições de trabalho e continuidade do futebol de mulheres. No ginásio de New Harmony, uma leitura possível é comparar quem tem acesso aos treinos e como as equipes conseguem se manter.']
  ],[['Década de 2000','Constrói parte da carreira de clubes na Suécia.'],['2007','É artilheira e melhor jogadora da Copa do Mundo.'],['2019','Chega a 17 gols em Copas do Mundo.']],['pele','serena']);

  add('rebeca',161,'Rebeca Andrade','Esporte','Nascida em 1999 · Brasil',['bio-rebeca'],[
    ['Do treino às equipes nacionais','Rebeca cresceu em Guarulhos e começou na ginástica ainda criança. A formação passou por clubes e equipes de treinamento, com um trabalho que combina força, flexibilidade e precisão. Enfrentou lesões no joelho e retomou a preparação com acompanhamento e adaptações.'],
    ['Cada aparelho, uma prova','O salto avalia a execução de movimentos em uma tentativa curta. O solo reúne acrobacias e composição ao longo de uma série. O individual geral soma notas em quatro aparelhos. Essas diferenças ajudam a entender por que suas medalhas em Tóquio e Paris registram conquistas de tipos distintos.'],
    ['A medalha da equipe','Em Paris, Rebeca também participou do bronze brasileiro por equipes. O resultado depende das séries de várias ginastas. Observe como uma ficha de competição registra tanto a execução de cada atleta quanto as notas que compõem a classificação da equipe.']
  ],[['2016','Disputa os Jogos Olímpicos do Rio.'],['Tóquio 2020','Conquista ouro no salto e prata no individual geral.'],['Paris 2024','Conquista ouro no solo, duas pratas individuais e bronze por equipes.']],['marta','serena']);

  add('serena',162,'Serena Williams','Esporte','Nascida em 1981 · Estados Unidos',['bio-serena'],[
    ['Uma formação compartilhada','Serena Williams cresceu treinando ao lado da irmã Venus. As duas chegaram ao circuito profissional e construíram carreiras próprias. Em algumas competições, estiveram em lados opostos da quadra. Em outras, dividiram a responsabilidade pelos pontos numa dupla.'],
    ['Da primeira à vigésima terceira conquista','Serena venceu seu primeiro Grand Slam de simples no US Open de 1999 e o 23º no Australian Open de 2017. Sua carreira atravessou mudanças de adversárias e de superfícies. Saque, devolução e leitura do ponto ajudam a explicar resultados em quadras duras, grama e saibro.'],
    ['Simples e duplas em Londres','Nos Jogos de Londres de 2012, conquistou ouro em simples e, com Venus, em duplas. A dupla envolve posicionamento e comunicação diferentes do jogo de simples. O acervo esportivo permite comparar os formatos e perguntar como a cobertura da imprensa distribui a atenção entre eles.']
  ],[['1999','Vence o US Open em simples.'],['2012','Ganha dois ouros olímpicos em Londres.'],['2017','Conquista o 23º Grand Slam de simples.']],['marta','rebeca']);

  add('chimamanda',163,'Chimamanda Ngozi Adichie','Literatura','Nascida em 1977 · Nigéria',['bio-chimamanda'],[
    ['Entre lugares de formação','Chimamanda nasceu na Nigéria e cresceu em Nsukka, numa cidade universitária. Estudou também nos Estados Unidos. A circulação entre países aparece em parte de sua ficção, que acompanha pessoas com relações diferentes com língua, família, migração e pertencimento.'],
    ['Três romances, três recortes','Hibisco roxo acompanha uma adolescente em uma família marcada pelo autoritarismo. Meio sol amarelo segue personagens durante a Guerra de Biafra. Americanah investiga, entre outros temas, a experiência de migração e a maneira como relações raciais mudam de sentido entre Nigéria e Estados Unidos.'],
    ['Quem ganha a palavra','Em sua palestra sobre o perigo de uma história única, Adichie pergunta o que acontece quando se repete apenas uma versão sobre pessoas ou lugares. Seus romances fazem essa pergunta na prática, abrindo espaço para personagens com desejos e pontos de vista diversos. A pergunta dialoga com o arquivo de New Harmony.']
  ],[['2003','Publica Hibisco roxo.'],['2006','Publica Meio sol amarelo.'],['2013','Publica Americanah.']],['conceicao','maya']);

  add('maya',164,'Maya Angelou','Literatura','1928–2014 · Estados Unidos',['bio-maya'],[
    ['Palcos e viagens','Marguerite Annie Johnson, que adotou o nome Maya Angelou, passou parte da infância no Arkansas. Trabalhou como cantora, dançarina e atriz. As viagens e os trabalhos em cena ampliaram sua experiência com ritmo, voz e público, elementos que reaparecem em suas leituras e apresentações de poesia.'],
    ['Escrever a própria juventude','Eu sei por que o pássaro canta na gaiola é o primeiro volume de sua série autobiográfica. O livro transforma lembranças de infância e adolescência em cenas construídas com voz, ritmo e ponto de vista. Em outros volumes, acompanha mudanças de trabalho, relações e lugares onde viveu.'],
    ['A voz em público','Angelou atuou em movimentos por direitos civis e trabalhou em diferentes formatos, entre eles roteiro e poesia. Em 1993, leu On the Pulse of Morning na posse presidencial de Bill Clinton. Uma ficha pode distinguir o poema escrito, a ocasião em que foi lido e a performance preservada em vídeo.']
  ],[['Década de 1950','Trabalha nos palcos como cantora e dançarina.'],['1969','Publica o primeiro volume da autobiografia.'],['1993','Lê um poema na posse presidencial.']],['carolina','baldwin']);

  add('baldwin',165,'James Baldwin','Literatura','1924–1987 · Estados Unidos e França',['bio-baldwin','baldwin-smithsonian'],[
    ['Harlem e Paris','Baldwin cresceu no Harlem, em Nova York. A experiência religiosa de juventude, a vida na cidade e a mudança para Paris em 1948 deram matéria a diferentes textos. Seu primeiro romance publicado, Go Tell It on the Mountain, trabalha a memória familiar e a vida de uma comunidade religiosa.'],
    ['Romance e ensaio','Giovanni’s Room acompanha personagens que lidam com desejo, medo e pertencimento. Em The Fire Next Time, Baldwin reúne ensaios que ligam experiências pessoais à história racial dos Estados Unidos. Cada forma literária lhe permite organizar perguntas e aproximar quem lê de conflitos diferentes.'],
    ['A linguagem de quem testemunha','Baldwin também participou de debates públicos no período dos direitos civis. No museu, vale comparar como um ensaio, um romance e uma entrevista constroem autoridade. Uma gravação guarda o tom e as pausas da voz, enquanto a edição escrita permite acompanhar o encadeamento de ideias.']
  ],[['1948','Muda-se para Paris.'],['1953','Publica Go Tell It on the Mountain.'],['1963','Publica The Fire Next Time.']],['maya','machado']);

  add('sueli',166,'Sueli Carneiro','Direitos e sociedade','Nascida em 1950 · Brasil',['bio-sueli','sueli-usp','sueli-geledes'],[
    ['Filosofia e organização','Sueli Carneiro estudou Filosofia na Universidade de São Paulo e se aproximou dos movimentos negro e feminista durante a ditadura. Em 1988, participou da criação do Geledés, que desenvolveu ações voltadas à saúde, à defesa de direitos e à autonomia das mulheres negras.'],
    ['Como se produz o apagamento','Em sua tese de 2005, Sueli investiga o dispositivo de racialidade e discute como instituições definem quem aparece como sujeito de conhecimento. O conceito de epistemicídio ajuda a nomear processos que desqualificam saberes e pessoas, inclusive por meio da escola, dos registros e dos critérios de reconhecimento.'],
    ['Textos de intervenção','Os Cadernos Geledés reúnem reflexões feitas no contexto de debates e movimentos concretos. Ler esses textos com as datas e as questões em pauta ajuda a ligar teoria e ação. Em New Harmony, uma ficha revisada também pode registrar quem propôs os critérios do acervo e quem pôde contestá-los.']
  ],[['Década de 1970','Estuda Filosofia e atua no movimento negro em São Paulo.'],['1988','Ajuda a fundar o Geledés.'],['2005','Defende sua tese na Faculdade de Educação da USP.']],['lelia','angela']);

  add('cartola',167,'Cartola','Música','1908–1980 · Rio de Janeiro',['bio-cartola'],[
    ['Mangueira e composição','Angenor de Oliveira, conhecido como Cartola, viveu no Rio de Janeiro e participou da fundação da Estação Primeira de Mangueira. Sua formação musical esteve ligada a rodas, ensaios e parcerias. Letras e melodias circulavam também em gravações de outras pessoas.'],
    ['A mesa de Zica e Cartola','Na década de 1960, Cartola e Dona Zica mantiveram o Zicartola, restaurante e ponto de encontro musical. O espaço aproximava comida, sociabilidade, trabalho e apresentações. Sua história ajuda a perguntar quem faz um lugar de música funcionar, do balcão às rodas e aos palcos.'],
    ['Gravações em nome próprio','Cartola lançou seu primeiro LP em 1974, depois de décadas compondo. Em canções como O mundo é um moinho, ritmo e escolha de palavras sustentam a narrativa da letra. A ficha de uma faixa pode indicar em separado seus compositores, intérpretes e o ano de gravação.']
  ],[['1928','Participa da fundação da Estação Primeira de Mangueira.'],['Década de 1960','Mantém com Dona Zica o restaurante Zicartola.'],['1974','Lança o primeiro álbum solo.']],['elza','tim']);

  add('tim',null,'Tim Maia','Música','1942–1998 · Brasil',['heritage_tim','cassiano-dca'],[
    ['O Rio e a experiência nos Estados Unidos','Sebastião Rodrigues Maia nasceu no Rio de Janeiro e cresceu na Tijuca. Tocou em grupos antes de viajar aos Estados Unidos em 1959, onde conviveu com outros modos de cantar e gravar. De volta ao Brasil, trabalhou como compositor e intérprete até consolidar a carreira em discos próprios.'],
    ['A construção de um som','O primeiro álbum, de 1970, reúne soul, balanços brasileiros e arranjos que destacam baixo, sopros e voz. Azul da cor do mar é de Tim, enquanto Primavera tem autoria de Cassiano e Sílvio Rochael. As duas faixas ajudam a distinguir interpretação, composição e trabalho de estúdio.'],
    ['Gravar de forma independente','Nos anos 1970, lançou os volumes de Tim Maia Racional por seu selo Seroma. Esse período mostra como convicções pessoais, escolhas de produção e condições de circulação podem afetar o que chega às lojas e ao rádio. O acervo pode comparar capas, créditos e versões das gravações.']
  ],[['1959','Viaja aos Estados Unidos.'],['1970','Lança seu primeiro LP.'],['Década de 1970','Publica os volumes de Tim Maia Racional de forma independente.']],['gil','cartola']);

  add('rosetta',null,'Sister Rosetta Tharpe','Música','1915–1973 · Estados Unidos',['heritage_rosetta'],[
    ['Gospel, voz e guitarra','Rosetta Tharpe cresceu na tradição pentecostal negra dos Estados Unidos e se apresentou cedo ao lado da mãe. Levou a voz e a guitarra a igrejas, gravações e palcos de grandes cidades. Suas apresentações colocavam o texto das canções em diálogo com ataques de guitarra, pausas e respostas melódicas.'],
    ['Palcos e gravações','Em 1938, chegou ao Cotton Club, em Nova York, e iniciou uma fase de gravações. Em Strange Things Happening Every Day, o acompanhamento dá impulso à interpretação e deixa espaço para a guitarra responder à voz. Suas escolhas influenciaram músicos associados à formação do rock.'],
    ['Autoria na história do rock','O Rock & Roll Hall of Fame reconheceu Tharpe na categoria de influência musical. Uma história que começa pelos artistas mais vendidos perde encontros anteriores entre gospel, blues e música popular. Compare o destaque dado à guitarra, ao canto e ao público na ficha de cada gravação.']
  ],[['1938','Apresenta-se no Cotton Club e inicia gravações comerciais.'],['Década de 1940','Grava Strange Things Happening Every Day.'],['2018','É incluída postumamente no Rock & Roll Hall of Fame.']],['nina','tim']);

  add('reboucas',null,'André Rebouças','Ciência e território','1838–1898 · Brasil e Atlântico',['reboucas_an','learning_reboucas_iphan'],[
    ['Do estudo às obras portuárias','Nascido em Cachoeira, Bahia, André Pinto Rebouças estudou engenharia e trabalhou em projetos de infraestrutura no Império. Participou das obras das Docas da Alfândega no Rio de Janeiro. Um projeto desse porte reúne cálculos, desenho, materiais e trabalho de equipes, além das decisões sobre quem pode usar o porto.'],
    ['Ensino e abolicionismo','Rebouças lecionou na Escola Politécnica e participou de associações abolicionistas. Defendeu mudanças que dessem condições materiais de vida às pessoas libertas. Seus textos ligavam a abolição a questões como acesso à terra e trabalho, temas que continuaram depois da lei de 1888.'],
    ['O arquivo do engenheiro','O Arquivo Nacional conserva impressos de obras e outras anotações de Rebouças. Comparar esses documentos com os textos do movimento abolicionista permite conhecer a mesma pessoa atuando em instituições diferentes. A ficha do porto pode registrar autoria técnica e o contexto em que a obra foi usada.']
  ],[['Décadas de 1860 e 1870','Trabalha em projetos de engenharia, entre eles obras portuárias.'],['1876','Ingressa como professor na Escola Politécnica.'],['Década de 1880','Amplia sua atuação no movimento abolicionista.']],['luiz-gama','katherine']);

  add('bimba',null,'Mestre Bimba','Capoeira','Século XX · Bahia e Goiás',['capoeira-iphan','bimba-bahia'],[
    ['Da roda à escola','Manoel dos Reis Machado, Mestre Bimba, cresceu em Salvador e aprendeu capoeira na juventude. Organizou a Luta Regional Baiana e criou um espaço regular de ensino. Sua escola recebeu praticantes de trajetórias diferentes e formou pessoas que depois levaram a Regional a outros lugares.'],
    ['Aprender com uma sequência','Bimba organizou sequências em dupla para treinar distância, defesa e resposta. As sequências preparavam para decisões durante o jogo. Seus ensinamentos também tratavam da música, da atenção ao parceiro e da responsabilidade que acompanha a participação na roda.'],
    ['Registrar uma linhagem','O reconhecimento da escola abriu novos espaços para a capoeira. No Pátio da Ginga, a história de Bimba ajuda a entender por que duas rodas podem ter modos de ensinar, toques e convenções próprios. A ficha de uma aula pode registrar o nome de quem ensinou e a linhagem em que aprendeu.']
  ],[['Década de 1930','Organiza sua escola de ensino da Regional em Salvador.'],['Século XX','Forma gerações de praticantes e mestres.'],['1974','Morre em Goiânia.']],['pastinha']);

  add('pastinha',null,'Mestre Pastinha','Capoeira','1889–1981 · Bahia',['capoeira-iphan','pastinha-pbh'],[
    ['Aprender e ensinar em Salvador','Vicente Ferreira Pastinha nasceu em Salvador e, segundo seu relato, aprendeu capoeira com Benedito, africano que o orientou na infância. Na década de 1940, tornou-se referência do Centro Esportivo de Capoeira Angola, construindo um espaço de ensino e roda com outros praticantes.'],
    ['Música, jogo e pensamento','Pastinha registrou em textos e depoimentos suas ideias sobre a Capoeira Angola. Seu trabalho chamou atenção para o ritmo, a atenção ao outro e a forma de jogar dentro da roda. A transmissão passava pelo corpo, pelo canto, pela observação e pela conversa entre gerações.'],
    ['Uma roda em Dacar','Em 1966, participou do Festival Mundial das Artes Negras em Dacar, no Senegal. A viagem colocou uma tradição afro-brasileira em diálogo com artistas e práticas de outros lugares. Ao estudar o festival, identifique a comitiva, o lugar da apresentação e o contexto cultural de cada participante.']
  ],[['Década de 1940','Assume papel de liderança no Centro Esportivo de Capoeira Angola.'],['1965','Publica Capoeira Angola.'],['1966','Participa do festival de artes negras em Dacar.']],['bimba','abdias']);

  add('rosana',null,'Rosana Paulino','Artes','Nascida em 1967 · São Paulo',['rosana-pina'],[
    ['O arquivo da família','Rosana Paulino é artista visual e pesquisadora. Em Parede da memória, multiplica retratos de seu acervo familiar em peças de tecido montadas em conjunto. A repetição põe em circulação rostos que costumam ter pouco espaço em coleções públicas e permite ver a família como parte da história.'],
    ['O que a costura faz à imagem','Na série Bastidores, fotografias de mulheres negras aparecem em aros usados para bordar. A artista costura regiões do rosto para que o gesto de interromper a imagem também faça parte da obra. Em trabalhos que usam imagens de arquivo, impressão, corte e costura interferem no modo de olhar.'],
    ['Obra e procedência','A ficha de uma obra pode indicar quem fez a imagem inicial, de onde ela veio e o que a artista fez com ela. A exposição da Pinacoteca permite comparar essas escolhas ao longo de sua produção. No Museu das Vozes, o verso de um retrato e o trabalho de quem o transforma merecem registro.']
  ],[['1994–2015','Desenvolve Parede da memória.'],['1997','Produz a série Bastidores.'],['2018','A Pinacoteca reúne sua produção em A costura da memória.']],['abdias','adario']);

  add('adario',null,'José Adário','Artes','Nascido em 1947 · Salvador',['adario-mab','adario-exu'],[
    ['A oficina na Ladeira da Conceição','José Adário dos Santos nasceu no bairro da Caixa d’Água, em Salvador. Começou a aprender o trabalho do ferro ainda menino com Maximiano Prates. Mais tarde, assumiu a oficina do mestre na Ladeira da Conceição da Praia, mantendo uma relação entre aprendizagem, ofício e vida da cidade.'],
    ['A forma e o contexto da peça','Adário produz esculturas de ferro e ferramentas ligadas a práticas do Candomblé. Em seu trabalho, o material, a forma e a finalidade fazem parte da história de cada peça. A coleção do Museu Afro Brasil documenta obras de sua autoria. O registro público pode indicar o que se sabe sobre o objeto e respeitar as informações reservadas pela comunidade.'],
    ['Autoria de quem faz','Uma peça pode atravessar a oficina, uma encomenda e uma exposição. Cada contexto tem pessoas e decisões próprias. Ao ler a ficha de uma escultura de Adário, procure o nome do artista, o material e a procedência e compare com o registro de uma peça cujo autor ainda não foi identificado.']
  ],[['1947','Nasce em Salvador.'],['Infância','Começa a aprender o ofício com Maximiano Prates.'],['Trajetória de oficina','Assume a oficina na Ladeira da Conceição da Praia.']],['rosana','abdias']);

  add('mansa-musa',null,'Mansa Musa','Direitos e sociedade','Século XIV · Império do Mali',['mansa-met','timbuktu-unesco'],[
    ['Governo e rotas no Sahel','Musa foi soberano do Império do Mali no século XIV. Mansa era um título de governante. Seu governo atuava em uma região ligada por rotas de comércio que cruzavam o Saara, com circulação de ouro, sal, pessoas e conhecimentos. As redes envolviam diferentes cidades e grupos de comerciantes e estudiosos.'],
    ['A peregrinação','A viagem de Musa a Meca, em 1324–1325, incluiu uma passagem pelo Cairo. Relatos da época destacaram a comitiva e o ouro distribuído durante a viagem. O episódio ajudou a difundir notícias do Mali fora da África Ocidental. Uma leitura histórica distingue relatos sobre a viagem de estimativas modernas sobre sua riqueza.'],
    ['Cidades e centros de estudo','Seu governo é associado ao apoio a construções religiosas e urbanas. Tombuctu se tornou um centro de estudo e circulação de manuscritos em diferentes períodos. A cidade e suas instituições tiveram uma história mais longa que um reinado. Compare no Museu Esquecido a época de Musa com a dos centros de estudo sob Songhai.']
  ],[['Século XIV','Governa o Império do Mali.'],['1324–1325','Realiza a peregrinação a Meca.'],['Séculos XV e XVI','Tombuctu consolida seu papel de centro intelectual em períodos posteriores.']],['zumbi']);

  window.V.MuseumBiographyData={profiles,sources};
});
