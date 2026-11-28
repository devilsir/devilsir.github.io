/* Registered module: protest-learning */
(function(initialize) {
  if (window.VoicesModules) window.VoicesModules.define("protest-learning", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error("Module loader is missing");
  else initialize();
})(function() {
  (function() {
    "use strict";
    window.V.protestLearning = {
      sources: [
        { id: "protest-origin", name: "Black Lives Matter \xB7 origem e princ\xEDpios", url: "https://blacklivesmatter.com/about/", note: "Fonte do movimento para sua origem em 2013 e o reconhecimento de vidas, cultura e contribui\xE7\xF5es negras." },
        { id: "protest-ferguson", name: "Black Lives Matter \xB7 Herstory", url: "https://blacklivesmatter.com/herstory/", note: "Relato hist\xF3rico do movimento sobre a atua\xE7\xE3o coletiva em Ferguson em 2014 e a participa\xE7\xE3o de mulheres e pessoas LGBTQ+." },
        { id: "protest-museum-plaza", name: "Smithsonian NMAAHC \xB7 placa de Black Lives Matter Plaza", url: "https://nmaahc.si.edu/object/nmaahc_2025.32", note: "Registro de uma placa de 2020 e contexto das manifesta\xE7\xF5es em Washington, D.C. A cena do jogo n\xE3o reproduz esse lugar." },
        { id: "protest-museum-signs", name: "Smithsonian NMAAHC \xB7 manifesta\xE7\xF5es e cartazes de 2020", url: "https://nmaahc.si.edu/object/nmaahc_2021.31.70", note: "Registro de uma fotografia de Tommy Oliver em Los Angeles em 2020. A fotografia n\xE3o foi copiada; os sprites e cartazes do jogo s\xE3o originais." }
      ],
      topics: [
        { id: "origin", title: "O come\xE7o em 2013", sourceIds: ["protest-origin"], en: "Alicia Garza, Patrisse Cullors and Opal Tometi created Black Lives Matter in 2013. It responded to George Zimmerman\u2019s acquittal in the case of Trayvon Martin\u2019s death.", pt: "Alicia Garza, Patrisse Cullors e Opal Tometi criaram Black Lives Matter em 2013. O movimento respondeu \xE0 absolvi\xE7\xE3o de George Zimmerman no caso da morte de Trayvon Martin." },
        { id: "ferguson", title: "Ferguson e o trabalho coletivo", sourceIds: ["protest-ferguson"], en: "In 2014, the death of Michael Brown in Ferguson brought people together. Local organisers and supporters helped expand the movement.", pt: "Em 2014, a morte de Michael Brown em Ferguson reuniu pessoas. Organizadores locais e apoiadores ajudaram a ampliar o movimento." },
        { id: "2020", title: "Novos registros em 2020", sourceIds: ["protest-museum-plaza"], en: "Protests followed George Floyd\u2019s death in 2020. The Smithsonian keeps a street sign that documents Black Lives Matter Plaza in Washington, D.C.", pt: "Manifesta\xE7\xF5es aconteceram depois da morte de George Floyd em 2020. O Smithsonian guarda uma placa de rua que documenta Black Lives Matter Plaza em Washington, D.C." },
        { id: "records", title: "Cartazes tamb\xE9m guardam hist\xF3rias", sourceIds: ["protest-museum-signs"], en: "The museum catalog records photographs of signs at protests in Los Angeles in 2020. Date, place and authorship help us understand a record.", pt: "O cat\xE1logo do museu registra fotografias de cartazes em manifesta\xE7\xF5es em Los Angeles em 2020. Data, lugar e autoria ajudam a compreender um registro." },
        { id: "inclusion", title: "Muitas pessoas fazem um movimento", sourceIds: ["protest-ferguson"], en: "The movement\u2019s historical account recognises the leadership of Black women and queer and trans people. A collective history needs more than one voice.", pt: "O relato hist\xF3rico do movimento reconhece a lideran\xE7a de mulheres negras e pessoas queer e trans. Uma hist\xF3ria coletiva precisa de mais de uma voz." },
        { id: "culture", title: "Arte, cultura e vida cotidiana", sourceIds: ["protest-origin"], en: "The movement also values Black creativity and contributions to society. Our music and shirt designs are original creations for this fictional gathering.", pt: "O movimento tamb\xE9m valoriza a criatividade negra e as contribui\xE7\xF5es \xE0 sociedade. Nossa m\xFAsica e as estampas das camisetas s\xE3o cria\xE7\xF5es originais para este encontro fict\xEDcio." }
      ],
      reading: { id: "protest-book-history", kind: "book", chapter: 5, map: "chapter-5", title: "Black Lives Matter \xB7 datas, pessoas e registros", theme: "Hist\xF3ria, mem\xF3ria e participa\xE7\xE3o", author: "Biblioteca de New Harmony \xB7 Vozes e direitos", sourceIds: ["protest-origin", "protest-ferguson", "protest-museum-plaza", "protest-museum-signs"], paragraphs: [
        "Black Lives Matter come\xE7ou em 2013, com Alicia Garza, Patrisse Cullors e Opal Tometi, depois da absolvi\xE7\xE3o de George Zimmerman no caso da morte de Trayvon Martin. O nome afirma a import\xE2ncia das vidas negras e se liga ao enfrentamento do racismo.",
        "Em Ferguson, em 2014, a morte de Michael Brown motivou mobiliza\xE7\xF5es. O relato do movimento destaca o trabalho de pessoas da comunidade e de apoiadores. Reconhecer quem criou o projeto n\xE3o apaga o trabalho de muitas outras pessoas.",
        "Em 2020, manifesta\xE7\xF5es depois da morte de George Floyd produziram novos registros. Uma placa de Black Lives Matter Plaza e fotografias de cartazes est\xE3o documentadas no Smithsonian. Lugar, data e autoria permitem comparar esses objetos com outros registros.",
        "Na pra\xE7a de VOICES, os participantes s\xE3o moradores fict\xEDcios. As estampas, os cartazes e a m\xFAsica foram criados para o jogo. Suas escolhas de cabelo, roupa e turbante n\xE3o s\xE3o um uniforme nem uma prova de religi\xE3o. H\xE1 quem fale, toque, organize, cuide ou escute. Voc\xEA pode perguntar a cada pessoa sobre seu registro e voltar \xE0s fontes."
      ], en: "A movement has a history. A record needs a date, a place and a source.", pt: "Um movimento tem uma hist\xF3ria. Um registro precisa de uma data, um lugar e uma fonte." },
      personal: [
        ["I helped organise this meeting. We left room for people to walk.", "Ajudei a organizar este encontro. Deixamos espa\xE7o para as pessoas passarem."],
        ["I wrote the notice with my neighbours. I can show you its sources.", "Escrevi o aviso com meus vizinhos. Posso mostrar suas fontes."],
        ["I am taking a turn with the microphone. Then I will listen.", "Estou usando o microfone na minha vez. Depois vou escutar."],
        ["I chose the colours of my shirt. The design is my own.", "Escolhi as cores da minha camiseta. A estampa \xE9 minha."],
        ["I am calling out a short phrase. We also pause to listen.", "Estou puxando uma frase curta. Tamb\xE9m fazemos pausas para escutar."],
        ["I am checking the names and dates on the panel.", "Estou conferindo os nomes e as datas no painel."],
        ["I am playing an original rhythm with the group.", "Estou tocando um ritmo original com o grupo."],
        ["I leave a pause between the musical phrases.", "Deixo uma pausa entre as frases musicais."],
        ["I chose this instrument for our rehearsal.", "Escolhi este instrumento para nosso ensaio."],
        ["I am listening to the other musicians before playing.", "Estou escutando os outros m\xFAsicos antes de tocar."],
        ["We created this rhythm together. Listen to the next group response.", "Criamos este ritmo juntos. Agora escute a resposta do outro grupo."],
        ["I put my instrument away when I take a break.", "Guardo meu instrumento quando fa\xE7o uma pausa."],
        ["I made this sign. I chose large letters so people can read it.", "Fiz este cartaz. Escolhi letras grandes para as pessoas poderem ler."],
        ["My sign has a short message. Its context is in the notebook.", "Meu cartaz tem uma mensagem curta. Seu contexto est\xE1 no caderno."],
        ["I painted the sign after checking the information.", "Pintei o cartaz depois de conferir as informa\xE7\xF5es."],
        ["I wrote my name on the back of this sign.", "Escrevi meu nome no verso deste cartaz."],
        ["We compared two drafts before choosing this message.", "Comparamos dois rascunhos antes de escolher esta mensagem."],
        ["I lower the sign when someone wants to talk to me.", "Abaixo o cartaz quando algu\xE9m quer conversar comigo."],
        ["I came to listen. I can ask a question when I need to.", "Vim para escutar. Posso fazer uma pergunta quando precisar."],
        ["I brought water for our rest corner.", "Trouxe \xE1gua para nosso canto de descanso."],
        ["I keep my notes beside the book. I compare them with the source.", "Deixo minhas anota\xE7\xF5es ao lado do livro. Comparo as anota\xE7\xF5es com a fonte."],
        ["I chose this headwrap for today. It is a personal choice.", "Escolhi este turbante para hoje. \xC9 uma escolha pessoal."],
        ["I saved a place for my friend. We can read the panel together.", "Guardei um lugar para minha amiga. Podemos ler o painel juntas."],
        ["I am helping visitors find the reading table.", "Estou ajudando visitantes a encontrar a mesa de leitura."]
      ],
      questions: [
        { id: "protest-history-6", chapter: 5, grade: 6, subject: "history", readingId: "protest-book-history", sourceIds: ["protest-origin"], prompt: "Segundo a leitura, quem criou o projeto Black Lives Matter em 2013?", options: ["Alicia Garza, Patrisse Cullors e Opal Tometi.", "Os m\xFAsicos fict\xEDcios de VOICES.", "Uma \xFAnica pessoa, sem colabora\xE7\xE3o."], correct: 0, explanation: "A leitura identifica as tr\xEAs criadoras. Os moradores do jogo discutem essa hist\xF3ria; eles n\xE3o s\xE3o essas pessoas reais." },
        { id: "protest-history-7", chapter: 5, grade: 7, subject: "history", readingId: "protest-book-history", sourceIds: ["protest-origin", "protest-ferguson", "protest-museum-plaza"], prompt: "Que sequ\xEAncia corresponde aos registros apresentados?", options: ["2020, cria\xE7\xE3o; 2013, Ferguson; 2014, placa.", "2013, cria\xE7\xE3o; 2014, Ferguson; 2020, novas manifesta\xE7\xF5es e registros.", "2014, cria\xE7\xE3o; 2020, Ferguson; 2013, placa."], correct: 1, explanation: "Compare as datas do texto: 2013, 2014 e 2020 identificam momentos diferentes, sem dizer que toda a hist\xF3ria cabe nesses tr\xEAs registros." },
        { id: "protest-history-8", chapter: 5, grade: 8, subject: "history", readingId: "protest-book-history", sourceIds: ["protest-museum-signs"], prompt: "Qual legenda distingue uma cria\xE7\xE3o do jogo de um registro hist\xF3rico?", options: ["Este sprite \xE9 uma fotografia aut\xEAntica de 2020.", "Toda pessoa do movimento usa a mesma roupa.", "Este cartaz \xE9 uma cria\xE7\xE3o de VOICES; o cat\xE1logo do museu documenta outros cartazes, com data, lugar e autoria."], correct: 2, explanation: "Uma refer\xEAncia inspira o estudo sem transformar a cria\xE7\xE3o em documento aut\xEAntico. Data, lugar e autoria ajudam a manter essa distin\xE7\xE3o." }
      ]
    };
  })();
});
