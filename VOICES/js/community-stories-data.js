/* Registered module: community-stories-data */
(function (initialize) {
  if (window.VoicesModules) window.VoicesModules.define("community-stories-data", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error('Module loader is missing');
  else initialize();
})(function () {
(function () {
  'use strict';
  const V = window.V;
  const sources = {
    tabuleiro: ['IPHAN · Ofício das Baianas de Acarajé', 'https://www.gov.br/iphan/pt-br/superintendencias/bahia/patrimonio-imaterial'],
    roda: ['IPHAN · Roda e saberes dos mestres', 'https://www.gov.br/iphan/pt-br/superintendencias/bahia/patrimonio-imaterial'],
    shweshwe: ['Da Gama · Shweshwe', 'https://www.dagama.co.za/shweshwe-african-cultural-fabrics/'],
    bokaap: ['Iziko · Bo-Kaap Museum', 'https://www.iziko.org.za/museums/bo-kaap-museum/'],
    seaBR: ['ICMBio · Parque Nacional Marinho dos Abrolhos', 'https://www.gov.br/icmbio/pt-br/assuntos/biodiversidade/unidade-de-conservacao/unidades-de-biomas/marinho/lista-de-ucs/parna-marinho-dos-abrolhos/downloads/material_de_apoio_2019.pdf'],
    seaSA: ['SANParks · Vida marinha do Cabo', 'https://www.sanparks.org/parks/table-mountain/explore/fauna-flora/marine-life']
  };
  const talk = (id, label, en, pt) => ({kind:'story-talk', targets:[id], label, en, pt});
  const inspect = (targets, label) => ({kind:'story-inspect', targets, label});
  const report = (id, label, prompt, answers, correct, explanation) => ({kind:'story-report', targets:[id], label, prompt, answers, correct, explanation});
  const missions = [
    {
      id:'story-tabuleiro', owner:'food-museum-curator', map:'food-museum', title:'A legenda que saiu do tabuleiro',
      brief:'Celina recebeu duas fichas sem a técnica de preparo. Antes da visita de uma turma, ela quer ouvir quem trabalha com o tabuleiro e devolver o nome certo a cada prato.',
      context:'O ofício das baianas de acarajé reúne preparo, venda, saberes transmitidos e vínculos religiosos afro-brasileiros. Conhecer só os ingredientes deixa parte dessa história de fora.', sources:['tabuleiro'], words:['label','source','steam','fry'],
      steps:[talk('market-vendor-dandara','Converse com Dandara, na Feira das Histórias, sobre acarajé e abará.','My acarajé is fried in palm oil. My abará is steamed in a leaf. The work also carries knowledge between generations.','Meu acarajé é frito no dendê. Meu abará é cozido no vapor, na folha. O trabalho também transmite saberes entre gerações.'),inspect(['food-panel-acaraje','food-panel-abara'],'Registre as fichas de acarajé e abará no Museu da Comida.'),report('food-museum-curator','Volte à curadora Celina e revise a legenda.','Como completar a legenda sem apagar os modos de fazer?',['Acarajé frito no dendê; abará cozido na folha.','Os dois são assados e têm a mesma técnica.','Basta escrever “comida africana”, sem contexto.'],0,'A técnica distingue os pratos. A legenda também reconhece o ofício e as pessoas que transmitem esses saberes.')]
    },
    {
      id:'story-recipe', owner:'kitchen-chef', map:'kitchen', title:'Uma receita, duas gerações',
      brief:'Dandara está preparando uma oficina com Bento. A folha de instruções conta os gestos, mas esqueceu as pessoas. Ajude a transformar uma receita em um encontro de saberes.',
      context:'Receitas afro-brasileiras e africanas têm histórias regionais e familiares. A adaptação de uma oficina deve indicar o contexto do prato e reconhecer quem compartilhou o preparo.', sources:['tabuleiro'], words:['recipe','chef','handwashing','cook'],
      steps:[talk('restaurant-chef','Escute Bento no Restaurante.','A family recipe can change in another kitchen. I write down who taught me and what I adapted.','Uma receita de família pode mudar em outra cozinha. Anoto quem me ensinou e o que adaptei.'),inspect(['professional-handwash'],'Lave as mãos no lavatório da cozinha.'),{kind:'story-cook',targets:['kitchen-welcome'],label:'Conclua uma receita na oficina Cozinha dos Saberes.'},report('kitchen-chef','Conte a Dandara como apresentar a receita.','O que deve acompanhar o prato da oficina?',['Somente o tempo de jogo.','O lugar, as pessoas e as adaptações do preparo.','Uma única origem para todas as cozinhas africanas.'],1,'Anotar contexto, autoria compartilhada e adaptações permite cozinhar e aprender com respeito às diferenças.')]
    },
    {
      id:'story-caption', owner:'university-professor', map:'university', title:'Quem cabe numa ficha?',
      brief:'Jamila está organizando uma pequena mostra de patrimônio alimentar. Inês encontrou uma legenda que mistura a história do prato com a origem da palavra. A turma precisa de uma revisão cuidadosa.',
      context:'Uma comida pode circular entre territórios, enquanto seu nome tem outra trajetória. Dicionários e depoimentos respondem a perguntas diferentes; dúvidas de pesquisa também merecem aparecer.', sources:['tabuleiro'], words:['research','source','label','collection'],
      steps:[talk('university-researcher','Pergunte a Inês como ela confere as fontes.','A dish and its name do not always have the same history. Compare sources and keep uncertain information visible.','Um prato e seu nome nem sempre têm a mesma história. Compare as fontes e deixe as incertezas visíveis.'),inspect(['food-panel-vatapa'],'Registre a ficha do vatapá no Museu da Comida e compare os dois campos.'),report('university-professor','Volte a Jamila para fechar a ficha.','Como organizar uma ficha responsável?',['Transformar uma hipótese em certeza.','Apagar a origem da palavra.','Separar história do prato, etimologia e fontes.'],2,'Cada campo responde a uma pergunta. A pesquisa fica mais clara quando mostra suas fontes e seus limites.')]
    },
    {
      id:'story-makers', owner:'market-vendor-solange', map:'market', title:'O nome de quem fez',
      brief:'Solange prepara uma banca coletiva para uma festa do bairro. As peças chegaram com etiquetas de preço, mas sem espaço para os nomes de quem criou cada uma. Ela quer mudar isso antes da abertura.',
      context:'Nesta história ficcional, artesãs negras do bairro decidem como apresentar seu trabalho. Escutar e creditar cada pessoa evita tratar peças, usos e escolhas diferentes como se fossem todos iguais.', sources:[], words:['market','label','source'],
      steps:[talk('market-vendor-joana','Peça a Joana uma sugestão para a banca coletiva.','Ask each maker how she wants her work presented. A fair can share names as well as products.','Pergunte a cada criadora como ela quer apresentar seu trabalho. Uma feira pode compartilhar nomes, além de produtos.'),inspect(['market-stall-solange'],'Examine as peças e a nova ficha na banca Tramas da Solange.'),report('market-vendor-solange','Ajude Solange a escolher o texto das etiquetas.','Qual ficha respeita as criadoras da banca?',['Nome de quem fez, material e uso informado pela pessoa.','“Artesanato exótico”, sem nome de ninguém.','Só a cor, porque todas as peças contam a mesma história.'],0,'A banca ganhou espaço para as autoras, seus materiais e suas próprias palavras. Solange pode completar as fichas com cada participante.')]
    },
    {
      id:'story-shweshwe', owner:'market-vendor-zola', map:'cape-market', title:'Uma estampa com endereço',
      brief:'Zola recebeu tecidos para a oficina de costura. Uma caixa veio com a descrição vaga “tecido de África”. Ela quer uma etiqueta que diga de onde vem o shweshwe e que abra espaço para as escolhas de quem costura.',
      context:'O shweshwe tem uma história ligada à África do Sul e à produção no Cabo Oriental. Circulação, fabricação e usos culturais fazem parte dessa história; uma estampa não representa todo um continente.', sources:['shweshwe'], words:['label','source','market'],
      steps:[inspect(['market-stall-zola'],'Examine a ficha do shweshwe na banca de Zola.'),talk('market-vendor-amina','Converse com Amina sobre dar nome e contexto aos produtos.','I name the food and the community connected to it. Different traditions deserve their own stories.','Eu nomeio a comida e a comunidade ligada a ela. Tradições diferentes merecem suas próprias histórias.'),report('market-vendor-zola','Volte a Zola e revise a etiqueta do tecido.','Qual descrição ajuda a reconhecer o tecido?',['Estampa única de todos os povos africanos.','Shweshwe, com procedência e informações de quem produziu e costurou.','Tecido sem história, identificado apenas pelo preço.'],1,'Zola guardou a procedência e deixou um campo para cada costureira apresentar sua criação.')]
    },
    {
      id:'story-roda', owner:'story-mediator-ivo', map:'capoeira-courtyard', title:'Antes do primeiro toque',
      brief:'Ivo organiza uma roda de apresentação para visitantes. Um cartaz descreve a capoeira apenas como uma sequência de golpes. Ajude o mediador a mostrar o que também se aprende ao escutar a roda.',
      context:'A roda de capoeira articula jogo, canto, instrumentos e conhecimentos transmitidos por mestres. Essa prática afro-brasileira se aprende em relação com outras pessoas.', sources:['roda'], words:['listen','share','source'],
      steps:[inspect(['story-roda-plaque'],'Leia a placa “A roda e seus saberes”, no pátio.'),talk('story-mediator-ivo','Escute Ivo sobre os turnos e a participação.','Listen to the song and the instruments. A circle is also a place to learn from other people.','Escute o canto e os instrumentos. A roda também é um lugar para aprender com outras pessoas.'),report('story-mediator-ivo','Revise o cartaz da apresentação com Ivo.','O que o cartaz precisa incluir?',['Só quem executa o golpe mais rápido.','Só os movimentos, sem as pessoas.','Jogo, música, escuta e transmissão de saberes.'],2,'O cartaz passou a apresentar a roda como uma prática coletiva, com seus mestres, sua música e seus modos de aprender.')]
    },
    {
      id:'story-neighbourhood', owner:'sea-person-zola', map:'cape-town', title:'As casas também escutam',
      brief:'Zola está preparando um passeio com estudantes. O primeiro roteiro só fala das cores das casas. Ele procura relatos e lugares de encontro que ajudem a apresentar o bairro como uma comunidade viva.',
      context:'O Bo-Kaap tem fortes vínculos com a comunidade muçulmana do Cabo e com histórias de pessoas libertas da escravidão. Os stoeps, varandas de entrada, também são lugares de encontro.', sources:['bokaap'], words:['listen','share','source'],
      steps:[inspect(['sea-note-bo-kaap','sea-note-architecture'],'Visite os registros Bo-Kaap e Casas, janelas e encontros, na Cidade do Cabo.'),talk('sea-person-ayesha','Pergunte a Ayesha como o bairro vive hoje.','These houses are homes. We work, make new things and meet our neighbours here.','Estas casas são moradias. Trabalhamos, criamos coisas novas e encontramos nossos vizinhos aqui.'),report('sea-person-zola','Leve a Zola uma proposta para o passeio.','Como melhorar o roteiro?',['Falar só da pintura das fachadas.','Incluir a memória local e as pessoas que vivem no bairro.','Tratar o bairro como um cenário vazio.'],1,'O roteiro agora combina arquitetura, memória e vida cotidiana, com espaço para as vozes de quem mora ali.')]
    },
    {
      id:'story-mar-br', owner:'sea-person-joana', map:'harbor', title:'O caderno das marés',
      brief:'A Capitã Joana quer um caderno para a próxima turma que vai conhecer o porto. Davi oferece suas observações da baía. Falta registrar os animais sem interromper a passagem deles.',
      context:'O saber de quem trabalha no litoral pode dialogar com a observação científica. Nesta comunidade ficcional, a escuta dos trabalhadores acompanha o cuidado com o mar e seus animais.', sources:['seaBR'], words:['whale','dolphin','observe','conservation'],
      steps:[talk('sea-person-davi-port','Converse com Davi no cais de pesca.','I watch the bay before leaving the quay. We can share what we notice without chasing the animals.','Observo a baía antes de sair do cais. Podemos compartilhar o que percebemos sem perseguir os animais.'),{kind:'story-marine',targets:['marine-watch-harbor'],count:2,label:'No mirante do porto, observe e registre a jubarte e o boto-cinza.',species:['humpback','guiana-dolphin']},report('sea-person-joana','Entregue as observações à Capitã Joana.','Que orientação vai para o caderno?',['Perseguir os animais para vê-los melhor.','Oferecer comida para aproximá-los.','Observar com calma, manter distância e compartilhar registros.'],2,'A turma recebeu um caderno de escuta e observação. O boto-cinza é um animal costeiro, e o Banco dos Abrolhos é uma importante área de reprodução de jubartes.')]
    },
    {
      id:'story-mar-sa', owner:'sea-person-lindiwe', map:'cape-town', title:'Um encontro nas águas do Cabo',
      brief:'Lindiwe quer apresentar a costa aos novos aprendizes do porto. Sipho está reunindo dicas de navegação tranquila. Ajude os dois a montar uma página sobre os animais que compartilham essas águas.',
      context:'A costa do Cabo abriga peixes, golfinhos, lobos-marinhos e baleias. Lugares de trabalho, lazer e observação também são habitats; reconhecer essa convivência faz parte do passeio.', sources:['seaSA'], words:['seal','whale','habitat','observe'],
      steps:[talk('sea-person-sipho','Escute Sipho no cais da Cidade do Cabo.','Slow down near the shore. A quiet observation tells us more than chasing an animal.','Diminua perto da costa. Uma observação tranquila ensina mais do que perseguir um animal.'),{kind:'story-marine',targets:['marine-watch-cape-town'],count:2,label:'No mirante do Cabo, registre a baleia-franca-austral e o lobo-marinho-do-cabo.',species:['southern-right','cape-fur-seal']},report('sea-person-lindiwe','Ajude Lindiwe a terminar a página do porto.','Como apresentar esses encontros?',['Animais, habitats e observação respeitosa.','Animais como obstáculos para os barcos.','As mesmas espécies em todos os mares.'],0,'A página ganhou nomes e habitats próprios da região. A jubarte também ocorre na costa sul-africana.')]
    },
    {
      id:'story-museum-voices', owner:'story-mediator-ines', map:'african-words', title:'Palavras com endereço',
      brief:'Inês recebeu sugestões para uma visita escolar. Em uma delas, todos os registros aparecem como “uma língua africana”. Ela quer refazer a placa e mostrar que o continente abriga muitas línguas e histórias.',
      context:'Nomear a língua e indicar a fonte ajuda a reconhecer trajetórias específicas. Palavras viajam e mudam; sem evidência, uma semelhança de som não prova uma origem.', sources:[], words:['source','research','label'],
      steps:[inspect(['story-language-plaque'],'Leia a placa sobre língua, contexto e fonte, no Museu das Palavras.'),talk('story-mediator-ines','Pergunte a Inês como ela evita generalizações.','Name the language when the source supports it. Similar sounds alone do not prove where a word came from.','Nomeie a língua quando houver apoio na fonte. Sons parecidos, sozinhos, não comprovam a origem de uma palavra.'),report('story-mediator-ines','Ajude Inês a revisar a placa da visita.','Qual cuidado deve orientar o texto?',['Dizer que a África inteira fala a mesma língua.','Indicar língua, contexto, fonte e eventuais dúvidas.','Adivinhar a origem pelo som de cada palavra.'],1,'A placa agora convida a pesquisar e a reconhecer a diversidade linguística, com espaço para dúvidas documentadas.')]
    }
  ];
  for (const q of missions) {
    Object.assign(q, {culturalStory:true, reward:'40 moedas, 20 XP e um registro de história da comunidade'});
    for (const step of q.steps) {
      if (step.targets.includes('professional-handwash')) step.targets = ['kitchen-industrial-handwash'];
      if (step.kind === 'story-marine') { step.guideTarget = step.targets[0]; step.targets = step.species; }
    }
  }
  V.CommunityStoriesData = {sources, missions};
})();

});
