(function(){'use strict';
window.V.protestLearning={
 sources:[
 {id:'protest-origin',name:'Black Lives Matter · origem e princípios',url:'https://blacklivesmatter.com/about/',note:'Fonte do movimento para sua origem em 2013 e o reconhecimento de vidas, cultura e contribuições negras.'},
 {id:'protest-ferguson',name:'Black Lives Matter · Herstory',url:'https://blacklivesmatter.com/herstory/',note:'Relato histórico do movimento sobre a atuação coletiva em Ferguson em 2014 e a participação de mulheres e pessoas LGBTQ+.'},
 {id:'protest-museum-plaza',name:'Smithsonian NMAAHC · placa de Black Lives Matter Plaza',url:'https://nmaahc.si.edu/object/nmaahc_2025.32',note:'Registro de uma placa de 2020 e contexto das manifestações em Washington, D.C. A cena do jogo não reproduz esse lugar.'},
 {id:'protest-museum-signs',name:'Smithsonian NMAAHC · manifestações e cartazes de 2020',url:'https://nmaahc.si.edu/object/nmaahc_2021.31.70',note:'Registro de uma fotografia de Tommy Oliver em Los Angeles em 2020. A fotografia não foi copiada; os sprites e cartazes do jogo são originais.'}],
 topics:[
 {id:'origin',title:'O começo em 2013',sourceIds:['protest-origin'],en:'Alicia Garza, Patrisse Cullors and Opal Tometi created Black Lives Matter in 2013. It responded to George Zimmerman’s acquittal in the case of Trayvon Martin’s death.',pt:'Alicia Garza, Patrisse Cullors e Opal Tometi criaram Black Lives Matter em 2013. O movimento respondeu à absolvição de George Zimmerman no caso da morte de Trayvon Martin.'},
 {id:'ferguson',title:'Ferguson e o trabalho coletivo',sourceIds:['protest-ferguson'],en:'In 2014, the death of Michael Brown in Ferguson brought people together. Local organisers and supporters helped expand the movement.',pt:'Em 2014, a morte de Michael Brown em Ferguson reuniu pessoas. Organizadores locais e apoiadores ajudaram a ampliar o movimento.'},
 {id:'2020',title:'Novos registros em 2020',sourceIds:['protest-museum-plaza'],en:'Protests followed George Floyd’s death in 2020. The Smithsonian keeps a street sign that documents Black Lives Matter Plaza in Washington, D.C.',pt:'Manifestações aconteceram depois da morte de George Floyd em 2020. O Smithsonian guarda uma placa de rua que documenta Black Lives Matter Plaza em Washington, D.C.'},
 {id:'records',title:'Cartazes também guardam histórias',sourceIds:['protest-museum-signs'],en:'The museum catalog records photographs of signs at protests in Los Angeles in 2020. Date, place and authorship help us understand a record.',pt:'O catálogo do museu registra fotografias de cartazes em manifestações em Los Angeles em 2020. Data, lugar e autoria ajudam a compreender um registro.'},
 {id:'inclusion',title:'Muitas pessoas fazem um movimento',sourceIds:['protest-ferguson'],en:'The movement’s historical account recognises the leadership of Black women and queer and trans people. A collective history needs more than one voice.',pt:'O relato histórico do movimento reconhece a liderança de mulheres negras e pessoas queer e trans. Uma história coletiva precisa de mais de uma voz.'},
 {id:'culture',title:'Arte, cultura e vida cotidiana',sourceIds:['protest-origin'],en:'The movement also values Black creativity and contributions to society. Our music and shirt designs are original creations for this fictional gathering.',pt:'O movimento também valoriza a criatividade negra e as contribuições à sociedade. Nossa música e as estampas das camisetas são criações originais para este encontro fictício.'}],
 reading:{id:'protest-book-history',kind:'book',chapter:5,map:'chapter-5',title:'Black Lives Matter · datas, pessoas e registros',theme:'História, memória e participação',author:'Biblioteca de New Harmony · Vozes e direitos',sourceIds:['protest-origin','protest-ferguson','protest-museum-plaza','protest-museum-signs'],paragraphs:[
 'Black Lives Matter começou em 2013, com Alicia Garza, Patrisse Cullors e Opal Tometi, depois da absolvição de George Zimmerman no caso da morte de Trayvon Martin. O nome afirma a importância das vidas negras e se liga ao enfrentamento do racismo.',
 'Em Ferguson, em 2014, a morte de Michael Brown motivou mobilizações. O relato do movimento destaca o trabalho de pessoas da comunidade e de apoiadores. Reconhecer quem criou o projeto não apaga o trabalho de muitas outras pessoas.',
 'Em 2020, manifestações depois da morte de George Floyd produziram novos registros. Uma placa de Black Lives Matter Plaza e fotografias de cartazes estão documentadas no Smithsonian. Lugar, data e autoria permitem comparar esses objetos com outros registros.',
 'Na praça de VOICES, os participantes são moradores fictícios. As estampas, os cartazes e a música foram criados para o jogo. Suas escolhas de cabelo, roupa e turbante não são um uniforme nem uma prova de religião. Há quem fale, toque, organize, cuide ou escute. Você pode perguntar a cada pessoa sobre seu registro e voltar às fontes.'],en:'A movement has a history. A record needs a date, a place and a source.',pt:'Um movimento tem uma história. Um registro precisa de uma data, um lugar e uma fonte.'},
 personal:[
 ['I helped organise this meeting. We left room for people to walk.','Ajudei a organizar este encontro. Deixamos espaço para as pessoas passarem.'],
 ['I wrote the notice with my neighbours. I can show you its sources.','Escrevi o aviso com meus vizinhos. Posso mostrar suas fontes.'],
 ['I am taking a turn with the microphone. Then I will listen.','Estou usando o microfone na minha vez. Depois vou escutar.'],
 ['I chose the colours of my shirt. The design is my own.','Escolhi as cores da minha camiseta. A estampa é minha.'],
 ['I am calling out a short phrase. We also pause to listen.','Estou puxando uma frase curta. Também fazemos pausas para escutar.'],
 ['I am checking the names and dates on the panel.','Estou conferindo os nomes e as datas no painel.'],
 ['I am playing an original rhythm with the group.','Estou tocando um ritmo original com o grupo.'],
 ['I leave a pause between the musical phrases.','Deixo uma pausa entre as frases musicais.'],
 ['I chose this instrument for our rehearsal.','Escolhi este instrumento para nosso ensaio.'],
 ['I am listening to the other musicians before playing.','Estou escutando os outros músicos antes de tocar.'],
 ['We made this musical exercise together. It is not a historical recording.','Fizemos este exercício musical juntos. Ele não é uma gravação histórica.'],
 ['I put my instrument away when I take a break.','Guardo meu instrumento quando faço uma pausa.'],
 ['I made this sign. I chose large letters so people can read it.','Fiz este cartaz. Escolhi letras grandes para as pessoas poderem ler.'],
 ['My sign has a short message. Its context is in the notebook.','Meu cartaz tem uma mensagem curta. Seu contexto está no caderno.'],
 ['I painted the sign after checking the information.','Pintei o cartaz depois de conferir as informações.'],
 ['I wrote my name on the back of this sign.','Escrevi meu nome no verso deste cartaz.'],
 ['We compared two drafts before choosing this message.','Comparamos dois rascunhos antes de escolher esta mensagem.'],
 ['I lower the sign when someone wants to talk to me.','Abaixo o cartaz quando alguém quer conversar comigo.'],
 ['I came to listen. I can ask a question when I need to.','Vim para escutar. Posso fazer uma pergunta quando precisar.'],
 ['I brought water for our rest corner.','Trouxe água para nosso canto de descanso.'],
 ['I keep my notes beside the book. I compare them with the source.','Deixo minhas anotações ao lado do livro. Comparo as anotações com a fonte.'],
 ['I chose this headwrap for today. It is a personal choice.','Escolhi este turbante para hoje. É uma escolha pessoal.'],
 ['I saved a place for my friend. We can read the panel together.','Guardei um lugar para minha amiga. Podemos ler o painel juntas.'],
 ['I am helping visitors find the reading table.','Estou ajudando visitantes a encontrar a mesa de leitura.']],
 questions:[
 {id:'protest-history-6',chapter:5,grade:6,subject:'history',readingId:'protest-book-history',sourceIds:['protest-origin'],prompt:'Segundo a leitura, quem criou o projeto Black Lives Matter em 2013?',options:['Alicia Garza, Patrisse Cullors e Opal Tometi.','Os músicos fictícios de VOICES.','Uma única pessoa, sem colaboração.'],correct:0,explanation:'A leitura identifica as três criadoras. Os moradores do jogo discutem essa história; eles não são essas pessoas reais.'},
 {id:'protest-history-7',chapter:5,grade:7,subject:'history',readingId:'protest-book-history',sourceIds:['protest-origin','protest-ferguson','protest-museum-plaza'],prompt:'Que sequência corresponde aos registros apresentados?',options:['2020, criação; 2013, Ferguson; 2014, placa.','2013, criação; 2014, Ferguson; 2020, novas manifestações e registros.','2014, criação; 2020, Ferguson; 2013, placa.'],correct:1,explanation:'Compare as datas do texto: 2013, 2014 e 2020 identificam momentos diferentes, sem dizer que toda a história cabe nesses três registros.'},
 {id:'protest-history-8',chapter:5,grade:8,subject:'history',readingId:'protest-book-history',sourceIds:['protest-museum-signs'],prompt:'Qual legenda distingue uma criação do jogo de um registro histórico?',options:['Este sprite é uma fotografia autêntica de 2020.','Toda pessoa do movimento usa a mesma roupa.','Este cartaz é uma criação de VOICES; o catálogo do museu documenta outros cartazes, com data, lugar e autoria.'],correct:2,explanation:'Uma referência inspira o estudo sem transformar a criação em documento autêntico. Data, lugar e autoria ajudam a manter essa distinção.'}]
};})();
