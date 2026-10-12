import json
import pathlib
import subprocess

ROOT = pathlib.Path(__file__).resolve().parents[1]
runtime = subprocess.run(["node", "-e", "const {V}=require('./tests/runtime-test');(async()=>{await V.Game.init();console.log(JSON.stringify({readings:V.learning.readings,residents:V.learning.residents,content:V.content,heritage:V.heritageContent,culture:V.culturalContent}))})()"], cwd=ROOT, capture_output=True, text=True, check=True)
original = json.loads(runtime.stdout)
readings = []
translations = []
dialogue_translations = []
figure_translations = []

def book(identifier, *paragraphs, en=None, pt=None):
    old = next(r for r in original["readings"] if r["id"] == identifier)
    readings.append({"id": identifier, "paragraphs": list(paragraphs), "en": en or old["en"], "pt": pt or old["pt"]})

book("book-01",
     "Sol percorre o programa do festival: há horários, instrumentos e cores, mas os nomes desapareceram. Lia faz uma pergunta simples: quem compôs, quem preparou o arranjo e quem vai tocar? Sem essas informações, o público conhece o som e perde parte da história de sua criação.",
     "Para refazer o programa, a equipe de New Harmony também pesquisa as referências da apresentação. Uma delas é o samba de roda do Recôncavo Baiano, que reúne música, dança e poesia, com protagonismo de comunidades negras. Conhecer essa prática exige reconhecer as pessoas que a mantêm viva.",
     "Lia reserva campos diferentes para nomes, funções e contexto cultural. O programa passa a explicar quem contribuiu e quais referências foram estudadas. Créditos e contexto se complementam: um apresenta o trabalho da equipe; o outro abre caminhos para conhecer histórias além do palco.")
book("book-02",
     "PIX encontra uma fotografia de capoeira e acha que já compreendeu a roda. Ivo pede que olhe de novo: o que aconteceu antes desse instante? Quem canta, toca, ensina e aprende? A imagem oferece pistas, mas deixa muitas relações fora do enquadramento.",
     "A capoeira é uma prática cultural afro-brasileira que articula canto, instrumentos, movimento e jogo. Mestres e mestras transmitem conhecimentos que não cabem numa lista de gestos. Por isso, estudar a roda também envolve escuta, convivência e os contextos de quem participa.",
     "No museu de New Harmony, a fotografia ganha uma legenda com suas informações e seus limites. A equipe busca outros registros e referências de praticantes. O desafio arcade de VOICES continua sendo uma atividade original do jogo; a leitura é um convite para aprender mais sobre a prática real.")
book("book-03",
     "Leo abre um mapa em que todos os caminhos viraram a mesma linha. Para reconstruí-lo, precisa descobrir quais lugares se conectavam e o que circulava entre eles. Um mapa útil relaciona percursos, pessoas e atividades; desenhar uma estrada não explica sozinho uma sociedade.",
     "O Mali participou de redes de comércio transaariano. Ouro e sal estão entre os produtos que circularam nessas trocas. Essa informação permite estudar relações entre regiões e cidades, em vez de imaginar comunidades isoladas umas das outras.",
     "A equipe separa os caminhos do mapa e anota a fonte de cada informação. Depois pergunta que outros registros podem contar sobre vida urbana e conhecimentos. O exemplo do Mali abre uma investigação específica: outras sociedades, regiões e períodos africanos têm suas próprias histórias.")
book("book-04",
     "Mara lê uma etiqueta que apresenta Kongo apenas pelo encontro com portugueses. Ísis percebe a pergunta que ficou de fora: com que sociedade esses visitantes entraram em contato? A chegada de alguém é um acontecimento dentro de uma história que já existia.",
     "Mbanza Kongo foi a capital política e espiritual do Reino do Kongo. O sítio está no atual território de Angola. Conhecer essa capital ajuda a reconhecer organização própria e a formular perguntas sobre pessoas, lugares e relações anteriores ao contato registrado.",
     "A nova etiqueta distingue a sociedade estudada do evento de contato. Ela informa lugar, contexto e fontes, e deixa espaço para outras pesquisas. Assim, o museu amplia a narrativa sem substituir a história de Kongo pela perspectiva de um visitante.")
book("book-05",
     "Caio encontra um relatório cujo título está legível, mas a autoria foi cortada. Antes de completar a ficha, procura o documento inteiro. Saber do que um texto trata é diferente de saber quem o escreveu: ambas as informações precisam ser conferidas.",
     "Um relatório técnico da NASA publicado em 1960 identifica T. H. Skopinski e Katherine G. Johnson como autores. Esses nomes documentam a autoria desse trabalho. O registro permite reconhecer uma contribuição concreta e o trabalho realizado em colaboração.",
     "No laboratório de New Harmony, os dois nomes voltam à ficha, junto da referência. Caio descreve o que o relatório sustenta, sem transformar essa autoria em uma afirmação sobre ter inventado sozinho toda uma tecnologia. Dar crédito com precisão torna a contribuição mais compreensível.")
book("book-06",
     "Luca quer montar uma vitrine de conhecimento só com máquinas. Davi coloca ao lado um caderno: há observações, palavras escolhidas e rasuras. Cada marca permite perguntar como uma pessoa registrou e trabalhou uma experiência. Escrever também produz conhecimento.",
     "A Biblioteca Nacional registra cadernos originais de Carolina Maria de Jesus na Divisão de Manuscritos. Esses documentos permitem investigar a escrita e sua autoria. Para compreender um texto, é importante conhecer quando, onde e em que condições ele foi produzido.",
     "A exposição de New Harmony passa a incluir textos, além de máquinas. A equipe identifica cada autora ou autor e explica o contexto disponível. Um caderno pode ampliar a investigação sobre uma experiência sem ser tratado como a voz de toda uma população.")
book("book-07",
     "Quatro mensagens aparecem na rede de New Harmony. Uma nega acesso por causa da cor da pele; outra afirma que todo um povo vive da mesma maneira. As duas restantes compartilham um aviso antigo e discutem uma preferência musical. Há problemas diferentes para investigar.",
     "A exclusão por cor da pele é discriminação racial e exige apoio à pessoa atingida e mudança no acesso. A Convenção sobre os Direitos da Criança reconhece direitos sem discriminação por raça, cor ou origem étnica. Esses direitos orientam a resposta da comunidade.",
     "A generalização precisa ser confrontada com a diversidade de pessoas e registros; o aviso antigo precisa de data e contexto. Já preferências musicais podem ser diferentes sem negar direitos a ninguém. A equipe explica o problema de cada caso antes de propor uma correção.")
book("book-08",
     "Bia recebe um recorte que anuncia o fechamento da biblioteca. A data não aparece, e a mensagem circula como se fosse atual. Antes de repassar, ela procura o aviso completo e o compara com o anúncio que está no mural hoje.",
     "O documento inteiro informa uma manutenção ocorrida no ano anterior. O anúncio atual confirma a reabertura. A comparação mostra como retirar a data pode mudar a interpretação. Verificar fonte, credibilidade, precisão e finalidade da informação é uma orientação da UNESCO para a pesquisa.",
     "Bia publica uma correção com a data e os dois registros. Ela sabe o que faltava na mensagem, mas ainda não sabe por que alguém retirou essa parte. Corrigir o contexto é possível; afirmar uma intenção de enganar exigiria outras evidências.")
book("book-09",
     "Joana organiza uma reunião sobre o centro comunitário. Luca propõe novos horários, mas sua ideia não entra na ata. Ele conseguiu falar; será que sua proposta foi considerada? A pergunta faz o grupo pensar no que acontece depois de ouvir uma pessoa.",
     "A Convenção sobre os Direitos da Criança prevê que suas opiniões sejam consideradas em assuntos que as afetam. Participar, portanto, envolve receber uma resposta e compreender como uma decisão foi construída. Não significa que toda proposta será automaticamente aprovada.",
     "A ata de New Harmony ganha campos para propostas, responsáveis e uma data de retorno. O grupo registra o que foi considerado e explica as escolhas. Na próxima reunião, Luca poderá acompanhar a decisão e fazer novas perguntas.")
book("book-10",
     "Tainá é convidada a gravar uma fala que explique todos os povos indígenas. Ela prefere contribuir com uma experiência identificada e convidar outras pessoas. Uma voz pode contar uma história importante sem ser transformada em resposta para todas as histórias.",
     "A Funai apresenta povos indígenas com línguas, características culturais e formas de organização diversas. Essa diversidade existe no presente. Uma mostra precisa reconhecer diferenças e consultar fontes e vozes que permitam ampliar a pesquisa.",
     "Em New Harmony, cada participante decide se quer contribuir e como seu relato será apresentado. Tainá autoriza sua própria contribuição, com nome e contexto. A exposição conserva a distinção entre uma experiência pessoal e uma afirmação sobre muitos povos.")
book("book-11",
     "Nia examina a avaliação do festival e encontra um problema: só foram ouvidos moradores próximos à praça. Mesmo assim, BIAS.EXE concluiu que toda a cidade chegava facilmente ao evento. A informação sobre um grupo foi ampliada para pessoas que não participaram da consulta.",
     "A equipe desenha um mapa com os trajetos que entraram na amostra e aqueles que ficaram de fora. Agora o público pode perceber o limite da conclusão. Os princípios da OCDE destacam a importância de informações compreensíveis sobre sistemas de IA e seus resultados.",
     "O relatório passa a dizer exatamente quem foi ouvido. Uma nova consulta inclui outros trajetos e experiências antes de produzir outra avaliação. Mostrar a seleção dos dados ajuda a perguntar de quem o resultado fala e quais vozes ainda precisam participar.")
book("book-12",
     "Depois do reboot, PIX sugere uma placa: “sem erros para sempre”. Celina prefere registrar a data da revisão e um caminho para enviar dúvidas. O arquivo voltou a funcionar, mas continuará recebendo documentos e decisões que precisam ser examinados.",
     "A OCDE trata responsabilidade e gestão de riscos ao longo do ciclo de vida de sistemas de IA. Isso ajuda a compreender por que corrigir uma versão não encerra o trabalho. Novos registros podem trazer descobertas, perguntas e também novos erros.",
     "New Harmony mantém responsáveis, critérios e encontros de revisão. Cada correção passa a ter fonte e motivo registrados. A vitória abre o arquivo para continuar aprendendo: quem consulta pode reconhecer os limites e participar da próxima pergunta.")
book("note-01",
     "Anotação de Davi: encontramos uma chave e uma etiqueta na biblioteca. A chave ajuda a investigar um mecanismo; a etiqueta ainda não prova quem o construiu. Registrei duas colunas: o que cada pista mostra e qual pergunta precisa de outra evidência.",
     "Museus também pesquisam e interpretam patrimônio, conforme a definição do ICOM. Nossa investigação segue esse cuidado: conservar um objeto é diferente de ter todas as respostas sobre ele. Próximo passo: procurar um registro que ligue o mecanismo a sua autoria.")
book("note-02",
     "Antes da gravação na praça, Tainá combina com Bia o que será registrado, quem poderá acessar e o que entrará na mostra. Bia aceita conversar, mas pede que um detalhe pessoal fique fora. Esse limite precisa continuar valendo quando o material for editado.",
     "A Convenção sobre os Direitos da Criança protege a privacidade e reconhece o direito de expressão. No caderno, anotamos a autorização e o pedido de Bia. Uma história interessante não elimina a escolha de quem a compartilhou.")
book("note-03",
     "Ivo trouxe uma lista de movimentos para a oficina. Sol acrescentou perguntas sobre canto, escuta e convivência na roda. O Ofício dos Mestres de Capoeira, reconhecido pelo Iphan, envolve conhecimentos transmitidos por pessoas que praticam e ensinam.",
     "Guardamos a lista como apoio de estudo, junto da referência. Ela ajuda a organizar uma parte do aprendizado; não substitui os saberes, as relações e os contextos da prática. A próxima pergunta deve ser feita também a quem conhece essa tradição.")
book("note-04",
     "Ficha do ensaio: Sol e sua equipe criaram uma faixa eletrônica original para o festival. Vamos identificar composição, arranjo e interpretação, e separar esses créditos da nota sobre as referências que estudamos.",
     "A UNESCO descreve o patrimônio imaterial como transmitido e continuamente recriado por comunidades. Nosso exercício tem autoria própria e não reproduz uma tradição inteira. O anúncio deve dizer isso com clareza, para que o público conheça a criação e possa pesquisar suas referências.")
book("note-05",
     "Ísis revisou a galeria de trocas e percebeu que ela só mencionava produtos. Acrescentamos uma pergunta: por onde conhecimentos também circulavam? Tombuctu foi um importante centro intelectual e de circulação de manuscritos na África Ocidental, especialmente nos séculos XV e XVI.",
     "O painel agora relaciona estudo, textos e trocas à cidade. Esse registro amplia a investigação sobre uma sociedade específica. Para conhecer outros lugares e períodos, precisamos de outras fontes, em vez de fazer Tombuctu representar um continente inteiro.")
book("note-06",
     "Conferência da etiqueta: o túmulo de Askia fica em Gao e está ligado ao Império Songhai e a Askia Mohamed. A construção data de 1495. Registramos essas informações antes de escolher a imagem que acompanhará o texto.",
     "Um nome famoso não resolve uma legenda incompleta. Leo deve relacionar lugar, período e associação documentada. A ficha permanece aberta à consulta da fonte, para que cada informação possa ser conferida.")
book("note-07",
     "A oficina da cidade tem projetos com nomes apagados. Ao pesquisar uma referência para a mostra, a equipe encontrou André Rebouças: o Iphan o apresenta como engenheiro e abolicionista negro. Conhecer essa trajetória abre perguntas sobre trabalho e participação na sociedade.",
     "A revisão começa pelo que os documentos permitem atribuir. Vamos indicar fonte, pessoa e contribuição, sem inventar um feito para tornar a história mais impressionante. Crédito preciso permite que o trabalho real seja visto e investigado.")
book("note-08",
     "Registro de 13 de maio de 1888: a Lei nº 3.353 extinguiu legalmente a escravidão no Brasil. Joana guardou a referência da lei e destacou o que ela determina. Essa mudança legal é uma informação importante e delimitada.",
     "Para perguntar sobre direitos, trabalho e desigualdades depois da abolição, vamos consultar outros documentos e relatos. A lei não descreve sozinha todas as experiências posteriores. No jogo, essa investigação é educativa e não transforma o sofrimento das pessoas em desafio.")
book("note-09",
     "Rosa gosta de sintetizadores; Aisha prefere guitarras. Na conversa, cada uma explica o que aprecia, sem tratar um povo como inferior ou impedir alguém de participar. Aqui há uma diferença de gosto, e o contexto ajuda a compreender a situação.",
     "A UNESCO relaciona diversidade cultural, expressão e respeito aos direitos humanos. O palco pode acolher escolhas musicais diferentes. Outra situação — uma regra que negasse acesso por raça ou origem — exigiria uma resposta à discriminação, além de conversar sobre preferências.")
book("note-10",
     "O clube excluiu uma estudante por causa da cor da pele. Apagar o post do anúncio não garante que a regra mudou. Primeiro, vamos acolher a estudante e procurar um adulto de confiança, preservando o registro sem expô-la nas redes.",
     "Os Indicadores de Relações Raciais na Escola convidam a comunidade a avaliar práticas e enfrentar o racismo. A revisão precisa alcançar o critério de acesso. Mudar uma regra discriminatória é responsabilidade do clube e da instituição; a estudante não deve carregar esse trabalho sozinha.")
book("note-11",
     "Celina percorreu o caminho até a nova sala cultural e encontrou uma passagem bloqueada. O convite chegou a todos, mas o trajeto ainda impedia a participação de algumas pessoas. Registramos a barreira para que o projeto responda a um problema concreto.",
     "O artigo 27 da Declaração Universal dos Direitos Humanos reconhece a participação na vida cultural. Em New Harmony, vamos consultar moradores, ajustar o caminho e acompanhar o resultado. A inauguração é um primeiro passo; manutenção e outras necessidades continuam no plano.")
book("note-12",
     "Relatório de Nia: a seleção de registros deixou um bairro de fora. Esta revisão informa a fonte, a mudança realizada, quem ficou responsável e o que ainda não foi verificado. A próxima consulta deverá incluir as experiências ausentes.",
     "A OCDE trata a responsabilidade por sistemas de IA durante seu desenvolvimento e uso. Por isso, marcamos uma nova revisão. Mostrar uma lacuna ajuda outras pessoas a questionar a conclusão e colaborar com a correção; esconder o limite interrompe esse trabalho.")
book("cozy-book-01",
     "Tomás prepara a mesa de observação enquanto Amara lê uma ficha de Sônia Guimarães. O nome está completo, mas a área de pesquisa ficou em branco. A dupla quer que o visitante conheça uma cientista por seu trabalho, além de reconhecer seu retrato.",
     "Sônia Guimarães é uma física brasileira que pesquisa semicondutores e o desenvolvimento de sensores de calor. O perfil do ILAS, da Universidade Columbia, apresenta essa área de atuação. A ficha permite relacionar nome, campo de pesquisa e referência para consulta.",
     "Na atividade de New Harmony, Tomás compara leituras de sensores imaginários e registra as condições de cada observação. A experiência é uma criação simplificada do jogo. A turma completa a ficha com a contribuição documentada, sem afirmar que a cientista criou todos os sensores existentes.")
book("cozy-book-02",
     "Otávio quer montar um mural sobre colaboração científica. A manchete que recebeu mostra apenas um nome, mas o texto completo apresenta uma equipe e suas instituições. Antes de resumir o resultado, ele confere quem participou do trabalho.",
     "Em fevereiro de 2020, Jaqueline Góes de Jesus participou da coordenação da equipe que sequenciou o genoma do SARS-CoV-2 do primeiro caso confirmado no Brasil. A pesquisa reuniu Instituto Adolfo Lutz, USP e Oxford. Reconhecer sua contribuição também pede reconhecer essa colaboração.",
     "O mural distingue a atuação individual do resultado coletivo e mantém a referência da notícia. O recorte havia perdido informação; isso pode ser corrigido, embora a intenção de quem o recortou ainda não seja conhecida. A equipe de New Harmony registra as contribuições documentadas e as instituições participantes.")
book("cozy-book-03",
     "André traz um programa para o ensaio. Amara encontra o nome de quem toca, mas faltam composição e arranjo. Compor é criar a música; fazer um arranjo envolve organizá-la para uma apresentação. Interpretar é outra contribuição, e o programa precisa distinguir essas funções.",
     "Pixinguinha foi compositor, instrumentista, arranjador e maestro. Seu arquivo pessoal está no Instituto Moreira Salles desde 2000 e inclui partituras com arranjos feitos por ele. Esses documentos permitem investigar escolhas musicais, junto de outros registros e seus contextos.",
     "Na atividade fictícia, Lia compôs, André fez o arranjo e Sol tocou: cada função recebe o nome correspondente. A faixa de VOICES é original do jogo. Conhecer o acervo de Pixinguinha amplia a pesquisa sem apresentar nosso exercício como uma obra dele.")
book("cozy-book-04",
     "Elisa lê um cartão que apresenta Dona Ivone Lara apenas como cantora. André pede que ela consulte a referência: quais outras funções ficaram de fora? Uma legenda pode reconhecer diferentes formas de criação, em vez de reduzir uma artista à imagem mais conhecida.",
     "Dona Ivone Lara cantava, compunha sambas e tocava cavaquinho. A Ocupação do Itaú Cultural destaca sua atuação entre as mulheres que compuseram para escolas de samba cariocas. A leitura ajuda a acrescentar composição à ficha, com uma fonte identificada.",
     "Elisa redige um resumo próprio e registra de onde vieram as informações. A nova legenda distingue canto e composição, sem inventar uma frase da artista. Quem visitar poderá conhecer suas funções e seguir a referência para continuar a pesquisa.")
book("cozy-book-05",
     "Jamila organiza retratos feitos por moradores, mas uma etiqueta chama todas as pessoas apenas de “grupo”. Rui pergunta quais nomes e histórias podem ser documentados. Uma imagem apresenta indivíduos; a legenda deve cuidar de suas diferenças e das informações ainda desconhecidas.",
     "Em Parede da memória, Rosana Paulino trabalha com fotografias de família. A Pinacoteca relaciona a obra à memória, à identidade e à invisibilidade de pessoas negras. Essa referência ajuda a pensar como uma imagem recebe contexto e como pessoas passam a ser reconhecidas.",
     "Os desenhos de New Harmony são criações próprias, com outra autoria. A equipe acrescenta os nomes e contextos disponíveis, indica as lacunas e formula novas perguntas. A interpretação fica identificada como interpretação: não é uma citação da artista nem prova sobre todas as experiências negras.")
book("cozy-book-06",
     "Elisa desenha duas pessoas conversando no mercado. Jamila observa o banco, os gestos e as cores escolhidas. Mesmo uma cena cotidiana envolve decisões: o que ganhou destaque? O que ficou fora? Anotar essas escolhas ajuda outras pessoas a ler o desenho.",
     "Maria Auxiliadora da Silva pintou cenas do cotidiano e da cultura afro-brasileira. O MASP também destaca o uso de relevos em sua técnica. A referência mostra uma trajetória artística que permite estudar tema e maneira de pintar em conjunto.",
     "No ateliê, Elisa cria uma imagem original da vida no bairro. A turma compara suas escolhas e os registros da cena, mantendo separada a referência histórica. Conhecer uma artista em profundidade é um começo; outras produções ampliam a pesquisa sobre a diversidade da arte afro-brasileira.")
book("cozy-book-07",
     "Viviane prepara o tabuleiro e ajuda Rui a escrever uma ficha para a feira. Acarajé é o nome de uma comida, mas o visitante também precisa conhecer quem trabalha e quais saberes fazem parte do ofício. Ela participa da revisão e explica o que deseja apresentar.",
     "O Ofício das Baianas de Acarajé reúne saberes culinários, religiosos e culturais. O Iphan o registrou no Livro dos Saberes em 2005; o IPAC documenta o reconhecimento estadual de 2012. São registros de âmbitos diferentes, e suas datas não marcam o começo de uma prática já existente.",
     "A ficha relaciona preparo, trabalho e contextos, consultando as detentoras desses conhecimentos. Viviane é uma personagem fictícia com escolhas próprias. Sua banca permite conversar sobre um ofício vivo, em vez de tratar a cultura como uma lista de produtos sem pessoas.")
book("culture-book-01",
     "Bisa organiza pente, espelho e estudos de penteados em sua mesa de trancista. Antes de trabalhar, pergunta o que a pessoa deseja. O caderno apresenta formas para comparar e lembra que criar um penteado envolve planejamento, técnica, tempo e participação de quem vai usá-lo.",
     "Na pesquisa da UFU, a pedagoga e trancista Letícia Ramos Ferreira descreve nagô junto à raiz, box braids soltas e twists feitos com duas mechas enroladas entre si. Nagô e box braids usam três mechas. As descrições identificam técnicas; não determinam qual escolha cada pessoa deve fazer.",
     "Nos desenhos originais de Bisa, observe linhas próximas ao couro cabeludo e unidades que ficam soltas. Depois acompanhe três fios de demonstração: qual passa pelo centro? Sequência, direção e repetição ajudam a perceber diferenças, embora a imagem pequena não substitua a prática profissional.",
     "A turma registra o que observou e uma pergunta para Bisa. O mural reconhece o trabalho da personagem e identifica a referência técnica real. Valorizar uma criação também é reconhecer conhecimento e trabalho, sem exigir que todos usem o mesmo penteado para pertencer à comunidade.")
book("culture-book-02",
     "Aline escolhe um retrato com suas tranças. No álbum, uma amiga usa cabelo crespo curto; outro leitor usa um afro arredondado. As legendas apresentam nomes e escolhas. Um penteado participa de uma história, mas não revela sozinho tudo sobre alguém.",
     "A educadora e pesquisadora brasileira Nilma Lino Gomes estuda corpo e cabelo como símbolos da identidade negra. Sua pesquisa permite pensar relações entre aparência, convivência e pertencimento. A referência é identificada para que quem deseja aprofundar a leitura possa encontrá-la.",
     "O álbum também consulta o Smithsonian sobre experiências negras nos Estados Unidos, com afros, tranças e locs. Locs e tranças recebem cartões separados, pois não são nomes intercambiáveis. As duas pesquisas têm lugares e recortes diferentes: compará-las pede conservar esses contextos.",
     "Aline gosta de experimentar comprimentos; sua amiga prefere o corte curto. Nenhuma preferência se torna um teste de identidade. Para fotografar ou tocar no cabelo de alguém, peça consentimento. Diante de uma ofensa, acolha a pessoa e procure apoio responsável, sem exigir que exponha sua experiência.")
book("culture-book-03",
     "Dandara mostra três estudos de amarração: nó à frente, dobra lateral e composição mais baixa. Os desenhos são originais de VOICES e têm nomes descritivos. Ela escolheu um deles para trabalhar hoje, com sua blusa preferida. A imagem apresenta uma decisão da personagem.",
     "Negra Jhô idealizou Coroa de Ouro, exposição apresentada no Museu Udo Knoff, em Salvador, em 2011. A mostra reuniu turbantes estilizados e valorizou sua criação e relações com a ancestralidade africana. Essa é a referência de uma autora e de um projeto específicos.",
     "Tecidos e amarrações podem participar de usos pessoais, artísticos e religiosos. Observe dobra, volume e direção; depois consulte o cartão de autoria e contexto. A cor ou a forma de um nó não informa sozinha religião, cargo ou nacionalidade.",
     "No mural, os estudos de Dandara recebem seus créditos, enquanto a referência sobre Negra Jhô ocupa um campo próprio. Assim, a turma conhece uma trajetória real e aprecia uma criação nova. Nenhuma dessas peças vira uma vestimenta obrigatória para representar pessoas negras.")
book("culture-book-04",
     "Viviane ajuda a revisar o cartão ilustrado de sua roupa de trabalho. Antes de nomear detalhes, a turma observa a imagem inteira: como as peças se relacionam com a pessoa e a cena da banca? A personagem participa da descrição e decide o que deseja compartilhar.",
     "O IPAC Bahia descreve saia rodada, bata, torço na cabeça e pano da costa na indumentária de baianas tradicionais. O Centro Nacional de Folclore e Cultura Popular apresenta o pano da costa como peça retangular de tecido, ligada ao traje e a contextos religiosos afro-brasileiros.",
     "O registro do IPAC relaciona determinados colares às cores dos orixás pessoais de quem os usa. Esses vínculos precisam de contexto. Uma peça citada na referência não se torna adereço genérico de qualquer personagem, e a roupa não permite deduzir sozinha uma crença.",
     "A ficha final guarda nomes, referência e a participação de Viviane. Seu traje no jogo pertence à cena de um ofício; outros moradores têm outras escolhas. Olhar com atenção é relacionar material, uso e pessoa, em vez de transformar uma roupa num uniforme cultural.")
book("culture-book-05",
     "Viviane organiza três espaços no tabuleiro: acarajé, abará e cocadas. A turma observa as formas e consulta os cartões de nome e preparo. A ficha também deve reconhecer quem fez a comida e os saberes que participam desse trabalho.",
     "A referência da Ascom/Consea descreve acarajé como bolinho de massa de feijão-fradinho frito no azeite de dendê. O abará também leva feijão-fradinho, mas é envolvido em folha de bananeira e cozido no vapor. O ingrediente em comum não apaga a diferença no preparo.",
     "A Fundação Joaquim Nabuco apresenta cocadas feitas com coco e açúcar, com receitas variadas. O desenho do jogo inclui cocada clara e escura, mas a cor não revela sozinha os ingredientes daquela receita. Consulte o cartão e pergunte a quem preparou, inclusive antes de comer.",
     "A legenda da banca reúne nome, preparo, pessoa responsável e contexto. O IPAC documenta relações comunitárias e religiosas desse ofício vivo. A atividade é de observação e consulta; participar não exige cozinhar nem provar alimentos.")
book("culture-book-06",
     "Dandara coloca três desenhos na mesa: uma blusa estampada, um macacão com bolsos e um cardigan para uma tarde fresca. As roupas originais atendem a pessoas que trabalham, estudam e descansam. A primeira pergunta do projeto é como cada pessoa deseja usar a peça.",
     "O Senac apresenta Isa Silva, estilista baiana e fundadora da marca Isaac Silva, destacando moda autoral e roupas para corpos diversos. Sua trajetória é uma referência de criação no presente. Os desenhos de VOICES têm outra autoria e não copiam suas coleções.",
     "Na oficina, Dandara conversa sobre mangas, tecido e bolsos. Um personagem que leva caderno à biblioteca pode preferir um bolso útil; quem trabalha na banca pode escolher um avental. Preferências e atividades dão propósito aos detalhes, sem deduzir profissão ou crença por uma estampa.",
     "O painel identifica quem desenhou, quem costurou na história e quem contribuiu para as escolhas. A referência real aparece separadamente. Reconhecer pessoas negras na moda inclui ver pesquisa, criação e trabalho, além de observar a aparência de uma peça.")
book("culture-book-07",
     "Jaci recebe a turma no pátio do museu. É educadora, gosta de ler perto das plantas e se apresenta como praticante do Candomblé. Ela compartilha apenas o que escolheu tornar público. Trabalho, amizades e fé fazem parte de sua vida, sem que ela represente todas as comunidades.",
     "O material educativo do Museu Afro-Brasileiro da UFBA apresenta o Candomblé por diferentes tradições africanas recriadas no Brasil. Na descrição dessas crenças, divindades e ancestrais participam das relações entre comunidade, natureza e sagrado. Esses conhecimentos pertencem a comunidades vivas.",
     "O material distingue Congo e Angola, com inquices; Jeje, com voduns; Nagô e Ketu, com orixás. Línguas de cantigas e funções religiosas também variam. Aqui, “nação” identifica uma tradição religiosa, e não um Estado moderno ou um nome que sirva para todas as casas.",
     "Para a mostra, Jaci propõe uma contribuição pública combinada com a comunidade, com autoria e contexto. Uma programação educativa do Museu Afro Brasil, em 2025, apresentou mitologias dos orixás e diferenças entre nações com Cláudia de Oyá. Ouvir quem conhece a tradição também exige respeitar o que não foi autorizado compartilhar.")
book("culture-book-08",
     "Jaci e Rui encontram uma ficha que trata nomes de religiões como equivalentes. Eles consultam as referências e usam a identificação compartilhada pela comunidade. Aparência não é prova de crença; descrever com cuidado começa por ouvir como as pessoas se apresentam.",
     "A Agência Câmara apresenta a Umbanda como religião brasileira formada por relações entre matrizes, entre elas cultos africanos, espiritismo e catolicismo, com vertentes e influências indígenas. As comunidades têm diferenças internas. Essa formação não torna Umbanda e Candomblé a mesma religião.",
     "No Memorial de Curitiba, em 2023, seis terreiros participaram de um encontro de curimbas, responsáveis pela música e pelos cânticos sagrados na Umbanda. O evento mostra participação comunitária em um contexto público. Um encontro específico não descreve sozinho as práticas de todas as casas.",
     "O Ministério da Igualdade Racial relaciona respeito, autoidentificação e proteção contra discriminação nas comunidades de terreiro e matriz africana. No caso fictício, diante de uma ofensa, a equipe pergunta que ajuda a pessoa deseja e busca apoio responsável quando necessário. Ninguém precisa declarar sua religião ou aceitar uma ofensa para participar.")
book("heritage-book-nina",
     "Na estação de escuta, Mila começa pelo piano. A referência de hoje é Nina Simone, nascida Eunice Kathleen Waymon (1933–2003). Sua formação e sua criação aproximaram música clássica, jazz e blues: diferentes linguagens ajudam a conhecer seu percurso como pianista e cantora.",
     "A atuação de Nina Simone também se ligou à luta pelos direitos civis nos Estados Unidos. Música e posicionamento público fazem parte de sua história, sem que uma única etiqueta explique toda a artista. A ficha mantém a biografia consultada para quem quiser continuar a descoberta.",
     "Mila propõe comparar frase musical, instrumento e intenção num exercício original de VOICES. Os sons do jogo não são gravações nem canções de Nina Simone. Depois de ouvir, você pode perguntar o que percebeu e consultar a referência para distinguir nossa atividade da trajetória histórica.")
book("heritage-book-tim",
     "Mila coloca uma ficha de Tim Maia (1942–1998) ao lado do programa de ensaio. Cantor e compositor do Rio de Janeiro, ele é uma referência do soul no Brasil. Uma voz conhecida é um começo para investigar criação, banda e os caminhos de uma carreira.",
     "Tim Maia viveu nos Estados Unidos, estudou inglês e cantou com The Ideals. Em 1970, lançou seu primeiro LP e gravou com Elis Regina. Esses registros apresentam encontros e etapas de seu percurso, com fontes que permitem aprofundar a pesquisa.",
     "Na oficina, a ficha distingue quem compôs de quem interpretou: essas funções podem ser de pessoas diferentes. O grupo cria uma frase própria e registra seus créditos. O exercício não imita uma gravação de Tim Maia; usa a leitura para conversar sobre trabalho musical e autoria.")
book("heritage-book-king",
     "Na assembleia de New Harmony, um retrato apresenta Martin Luther King Jr. (1929–1968), liderança do movimento pelos direitos civis nos Estados Unidos. Ele defendeu ações não violentas contra a segregação racial. A ficha convida a relacionar essa atuação a direitos e participação.",
     "King recebeu o Nobel da Paz em 1964. Boicotes, campanhas e marchas foram construídos por muitas pessoas. Conhecer uma liderança também exige reconhecer um movimento coletivo: transformações sociais envolvem organização e contribuição de diferentes participantes.",
     "A atividade do jogo começa por escutar propostas e registrar quem participou da reunião. É uma criação educativa própria, e não uma reprodução de uma campanha histórica. As informações do retrato vêm de referências documentadas; nenhuma frase foi inventada como citação de King.")
book("heritage-book-machado",
     "Ravi abre uma ficha de Machado de Assis (1839–1908), que escreveu romances, contos, crônicas, poesia e teatro. Ele também trabalhou como tipógrafo, revisor e jornalista. Essa variedade permite observar criação literária e outros trabalhos com a palavra.",
     "Em 1897, Machado foi eleito primeiro presidente da Academia Brasileira de Letras. Memórias póstumas de Brás Cubas é um de seus romances. A referência apresenta autor e obra para quem deseja conhecer a literatura além do resumo desta estante.",
     "Ravi propõe uma pergunta de leitura: quem está contando a história? Autor é a pessoa que escreve; narrador é uma voz construída no texto. Você pode inventar uma cena do bairro e escolher essa voz. A atividade é de VOICES, sem reproduzir um trecho ou inventar uma fala de Machado.")
book("heritage-book-carolina",
     "Ravi coloca um caderno ao lado da ficha de Carolina Maria de Jesus (1914–1977), nascida em Sacramento, Minas Gerais. Quarto de despejo, publicado em 1960, reúne escrita de diário. Esse livro abre uma conversa sobre observar o cotidiano e trabalhar experiências por meio da escrita.",
     "A criação de Carolina vai além dessa obra: ela escreveu em diferentes gêneros e compôs músicas. Um álbum com suas composições foi lançado em 1961. Conhecer dificuldades históricas é importante, mas não deve reduzir sua trajetória à pobreza ou a um único livro.",
     "Na mesa de escrita, escolha uma cena de New Harmony e registre pessoas, ações e um detalhe que chamou sua atenção. Identifique sua autoria e o contexto. O exercício é original; a ficha e suas fontes convidam a conhecer a produção real de Carolina em sua diversidade.")
book("heritage-book-katherine",
     "O laboratório apresenta Katherine Johnson (1918–2020), matemática da NASA. Ela trabalhou com cálculos de trajetórias de voos espaciais, junto a equipes de pesquisa. Sua ficha ajuda a ver que ciência inclui calcular, conferir e colaborar.",
     "Antes do voo orbital de John Glenn, em 1962, Johnson conferiu resultados produzidos por computadores eletrônicos. A revisão humana foi parte desse trabalho documentado. Conhecer uma contribuição concreta permite reconhecer seu alcance sem inventar a autoria de toda uma tecnologia.",
     "Na mesa do jogo, compare dois resultados e anote qualquer diferença antes de concluir. O exercício é simplificado e não representa um cálculo real de missão espacial. A equipe discute o registro e consulta a referência histórica, mantendo a revisão como parte da investigação.")
book("heritage-book-rock",
     "Mila aproxima três cartões: blues, rhythm and blues e gospel. Essas tradições afro-americanas estão entre as influências do rock. Relacioná-las ajuda a conhecer encontros musicais e pessoas, sem dizer que são a mesma música ou que toda essa história nasceu de um artista só.",
     "Sister Rosetta Tharpe se destacou como cantora e guitarrista, aproximando gospel e guitarra elétrica. O Rock & Roll Hall of Fame reconhece sua influência. Sua trajetória abre uma pesquisa sobre músicos negros que participaram de caminhos hoje associados ao rock.",
     "No ensaio, Mila propõe uma sequência de pergunta e resposta: uma frase, uma pausa e uma resposta. Compare repetição, contraste e timbre. O som é original de VOICES; não é gravação histórica nem uma representação completa do blues. A referência continua disponível depois da atividade.")
book("heritage-book-conceicao",
     "Ravi reúne três títulos de Conceição Evaristo: Ponciá Vicêncio, Becos da Memória e Olhos d’água. A escritora brasileira oferece diferentes caminhos de leitura de experiências negras. Nome da autora e título da obra são o começo para encontrar um texto e reconhecer sua criação.",
     "A estante de VOICES apresenta uma síntese com referência para consulta, sem reproduzir contos ou inventar declarações da autora. Ravi convida a conhecer a obra completa. Um resumo situa uma descoberta, mas não substitui as escolhas de linguagem e de narrativa de um livro.",
     "Para criar sua própria cena cotidiana, escolha uma voz que conte e um detalhe que ela percebe. Que outra perspectiva poderia ser escutada? Identifique a autoria da atividade. Ela nasce da sua observação e permanece distinta da produção literária apresentada na estante.")
book("heritage-book-instruments",
     "A instrumentoteca reúne berimbau, atabaque, agogô, reco-reco, xequerê, cuíca, djembe e ilú. Antes de tocar, observe forma e material e consulte a ficha: que gesto faz o som começar? Instrumentos diferentes podem ser comparados por suas características sem perder seus contextos.",
     "No berimbau, uma corda vibra; no reco-reco, uma vareta raspa sulcos; no xequerê, contas encontram a cabaça. A cuíca utiliza a fricção de uma haste interna ligada à pele. Compare esses mecanismos: a haste da cuíca e a vareta externa do reco-reco têm funções diferentes.",
     "O djembe está ligado a tradições da região Mandé, na África Ocidental. Cada cartão registra a referência conhecida, em vez de fazer um instrumento representar todas as práticas africanas ou afro-brasileiras. Instrumento, comunidade e uso precisam ser relacionados com cuidado.",
     "As ilustrações e os timbres sintetizados de VOICES são aproximações educativas originais. Não demonstram uma técnica completa nem reproduzem toques de cerimônias. Você pode consultar imagem, descrição e mecanismo separadamente; o conteúdo também está disponível sem som.")
book("heritage-book-textiles",
     "Na mesa de tecidos, Dandara começa por como a peça é feita. Kente reúne tiras tecidas e se associa a tradições Asante e Ewe, especialmente no atual Gana. Ankara apresenta algodão estampado e uma história de circulação e escolhas africanas. Tecer tiras e estampar tecido são processos diferentes.",
     "A mesa também apresenta amarrações e adornos. Turbantes têm usos diversos; ojá tem sentidos específicos nos candomblés e não é sinônimo de qualquer amarração. Pano da costa, fios de contas e balangandãs precisam de referências sobre quem usa, como e em qual contexto.",
     "Na atividade, compare construção do tecido e estampa antes de escrever a legenda. Depois acrescente autoria, uso conhecido e fonte. Uma cor não define sozinha religião ou nacionalidade, e uma imagem não autoriza atribuir um significado universal a todas as comunidades.")
book("heritage-book-objects",
     "Jaci coloca uma máscara e sua ficha na mesa de curadoria. Madeira ou metal descrevem materiais; não identificam uma cultura universal. Algumas práticas com máscaras envolvem traje, música, dança e comunidade. A legenda precisa relacionar a peça a um contexto documentado.",
     "O Sankofa, associado a tradições Akan, pode aparecer como pássaro com a cabeça voltada para trás e os pés adiante. A mostra distingue esse símbolo, referências à ancestralidade e criações artísticas sobre orixás. Formas parecidas não tornam objetos ou tradições equivalentes.",
     "O Museu Afro Brasil cataloga uma ferramenta de Ogum em ferro criada por José Adário. Autoria, material e referência ajudam a conhecer uma peça específica. Quando a informação não é conhecida, a ficha registra a dúvida em vez de inventar uma associação.",
     "Na pesquisa do jogo, “Ibi” como nome de ferramentas e “Patachas” como nome de amuletos não foram confirmados. Por isso, não os tratamos como sinônimos de outros termos. Patuá é documentado. A legenda final mostra o que sabemos, de onde veio a informação e o que ainda precisa de investigação.")

campaign_pt = r"""
O palco está pronto. Os nomes estão faltando.|O cartaz do festival perdeu os nomes dos artistas ontem à noite.|Embora o palco esteja pronto, o cartaz corrompido esconde as pessoas por trás da música.
Vamos encontrar os créditos.|Quem fez a música? Vamos seguir as evidências.|Precisamos de mais do que uma batida marcante: precisamos de evidências sobre seus criadores e seu contexto.
Ouço uma batida. Não ouço uma beterraba.|Uma batida é um ritmo. Uma beterraba é um vegetal.|Tradução concluída: beat significa uma pulsação musical aqui. Meu detector de vegetais pode descansar.
Os nomes voltaram. Obrigada!|Restauramos os nomes e acrescentamos notas culturais.|O cartaz agora identifica os criadores e explica as referências culturais, para que o público possa aprender mais.
Nossa música nova tem créditos claros.|Fizemos uma faixa nova para o jogo, não uma apresentação tradicional.|Nossa faixa original do jogo acompanha o festival; ela não pretende reproduzir uma tradição autêntica.
Um arquivo estranho aponta para o museu.|Os créditos desaparecidos vieram do arquivo da cidade.|O mesmo erro do arquivo afeta o museu, então nossa próxima investigação começa lá.
A música tem pessoas e histórias.|O cartaz manteve o som, mas removeu as pessoas.|Quando um cartaz remove criadores e contexto, os ouvintes perdem parte da história.
Olhe o mural e o pequeno arquivo.|Você pode encontrar três pistas perto do mural, da loja e do arquivo.|Compare os três registros perto do mural, da loja e do arquivo antes de consertar o palco.
O painel explica as referências.|Vamos colocar o painel ao lado do palco.|Um painel ao lado do palco pode explicar as referências sem substituir as próprias vozes dos criadores.
O programa mostra os criadores.|Vamos acrescentar os criadores e suas funções ao programa.|O programa pode tornar a autoria visível; as notas culturais vão acompanhá-lo.
Tradições diferentes têm histórias diferentes.|Samba de roda e capoeira têm histórias e práticas diferentes.|Ambos se relacionam com histórias afro-brasileiras, mas não devemos reduzi-los a um único som ou a uma única prática.
Ajude-me a consertar a máquina de batidas.|Vamos usar a máquina consertada para fazer nossa própria faixa.|Depois de consertarmos o controlador, poderemos compor uma faixa original com referências claramente identificadas.
Nomes, funções e agradecimentos. Pronto!|Acrescentei cada criador e sua função.|Acrescentei os criadores e suas funções porque o trabalho de uma equipe merece uma atribuição precisa.
Faixa nova. Identificação clara. Vamos lá!|Identifiquei a faixa como música original do jogo.|A identificação distingue nossa música original do jogo das práticas culturais discutidas no arquivo.
O samba de roda reúne música, dança e poesia.|O samba de roda se desenvolveu no Recôncavo Baiano e reúne música, dança e poesia.|O samba de roda conecta música, dança e poesia no Recôncavo Baiano; suas comunidades mantêm a prática viva.
A capoeira é uma prática cultural afro-brasileira.|A capoeira combina movimento e música em uma prática cultural afro-brasileira.|A capoeira combina movimento, música e aprendizagem compartilhada; sua história cultural é mais ampla do que um movimento de luta.
Este cartão do festival mostra nomes e funções.|O cartão do festival listava os criadores antes de a falha remover seus nomes.|O cartão fictício restaurado identifica criadores e referências culturais, porque um som sozinho não explica sua história.
Este museu tem páginas faltando.|A primeira galeria perdeu muitas histórias africanas.|A galeria agora começa pela escravização, apagando sociedades anteriores e muitas outras histórias.
A África tem muitos povos e histórias.|Mali, Songhai e Kongo existiram em lugares e períodos diferentes.|Mali, Songhai e Kongo pertencem a histórias regionais diferentes; uma etiqueta não explica toda a África.
Vamos conferir lugares e datas.|Vamos comparar datas e localizações antes de consertar a linha do tempo.|Uma lista cronológica é útil, mas também precisamos manter visíveis a localização e o contexto de cada evento.
Os painéis voltaram. A história está mais ampla.|Restauramos três painéis regionais e corrigimos as datas.|A galeria restaurada apresenta sociedades africanas específicas junto de eventos posteriores, em vez de tratá-los como uma história só.
Essas datas são pistas, não a história inteira.|Seis eventos não podem mostrar todas as histórias da África ou do Brasil.|Esta pequena linha do tempo é uma seleção para comparação; suas lacunas são um motivo para investigar mais.
Novo sinal: o laboratório.|O arquivo restaurado aponta para um laboratório com nomes faltando.|Um segundo erro de atribuição aparece no laboratório, então vamos seguir esse sinal.
Um museu escolhe o que mostrar.|Alguém removeu os painéis mais antigos e encurtou as etiquetas.|Uma exposição é uma seleção de registros; precisamos examinar o que ela inclui e o que deixa de fora.
Confira o mapa junto da linha do tempo.|Não coloque Kongo na mesma região que Mali.|Mantenha o mapa ao lado da linha do tempo: Kongo fica na África Central, enquanto Mali e Songhai ficam na África Ocidental.
O mapa mostra regiões diferentes.|Acrescentei etiquetas regionais ao mapa da galeria.|Etiquetas regionais impedem que uma única linha do tempo sugira que todas as sociedades ocupavam o mesmo lugar.
Cada cartão tem uma data e uma fonte.|Acrescentei datas e nomes de fontes aos painéis.|Os leitores podem conferir datas e nomes de fontes e perguntar o que outros registros poderiam acrescentar.
As pessoas preservam a memória de muitas maneiras.|Encontramos registros escritos, arte e tradições orais.|Documentos escritos, objetos materiais e tradições orais podem oferecer evidências diferentes; historiadores os comparam.
Um pequeno registro complementar discute a abolição.|Você pode ler um registro curto sobre a abolição ou se concentrar nos painéis regionais.|O registro complementar opcional discute a abolição legal e barreiras que continuaram, sem mostrar violência.
Vamos ler os três registros regionais.|Comece pelos registros de Mali, Songhai e Kongo.|Os registros regionais recuperam histórias apagadas pela exposição com falhas; você pode voltar ao registro complementar depois.
O tráfico atlântico levou à força pessoas africanas para as Américas. Este registro também mostra a lei brasileira de 1888.|O tráfico atlântico levou à força pessoas africanas para as Américas. A lei de 1888 extinguiu legalmente a escravidão no Brasil.|O tráfico atlântico levou à força pessoas africanas para as Américas; embora a escravidão legal tenha terminado no Brasil em 1888, barreiras sociais permaneceram.
Este registro mostra Mali e a viagem de Mansa Musa em 1324.|Mansa Musa, governante de Mali, fez uma peregrinação a Meca em 1324.|A peregrinação de Mansa Musa em 1324 conectou Mali a redes mais amplas; a história de Mali também inclui comércio, cidades e estudos.
O reinado de Sonni Ali começa em 1464 nesta linha do tempo.|Sonni Ali começou seu reinado em 1464 na história de Songhai.|O início do reinado de Sonni Ali em 1464 é um marco da história política de Songhai, ligado a redes comerciais regionais.
Kongo tem sua própria história. Este cartão marca o contato em 1483.|Na cronologia do museu, Diogo Cão chegou à foz do rio Congo em 1483.|O contato com Portugal em 1483 diz respeito a uma sociedade já existente da África Central; ele não marca o começo da história de Kongo.
O tráfico atlântico levou à força pessoas africanas para as Américas. Este registro também mostra a lei brasileira de 1888.|O tráfico atlântico levou à força pessoas africanas para as Américas. A lei de 1888 extinguiu legalmente a escravidão no Brasil.|O tráfico atlântico levou à força pessoas africanas para as Américas; embora a escravidão legal tenha terminado no Brasil em 1888, barreiras sociais permaneceram.
As etiquetas confundem três pessoas.|A exposição confundiu uma matemática, uma escritora e um engenheiro.|As máquinas ainda funcionam, mas as etiquetas corrompidas confundem as pessoas por trás de contribuições diferentes.
Quais pistas apoiam cada nome?|Quem conferiu os cálculos de voo? Quem escreveu o livro?|Devemos relacionar contribuições documentadas a nomes sem inventar feitos ou citações.
Sou um robô. Não invento biografias.|Conferi meu scanner. Ele encontra fontes, não biografias mágicas.|Meu scanner pode organizar registros, mas as pessoas ainda precisam avaliar o que esses registros sustentam.
Três nomes. Três registros claros.|Relacionamos as contribuições e restauramos as etiquetas.|A exposição agora dá crédito preciso a diferentes tipos de trabalho, da matemática à escrita e à engenharia.
Um nome famoso não é a única voz.|Podemos continuar procurando pessoas ausentes de outros registros.|Estes perfis ampliam a exposição, mas algumas pessoas celebradas não podem representar todas as contribuições ignoradas.
A falha agora se espalha pelos posts.|O próximo sinal vem da rede de mensagens da cidade.|O mesmo erro está se espalhando pela rede de mensagens; precisamos examinar como as afirmações circulam.
Uma pista sustenta uma afirmação específica.|Um caderno sobre matemática de voos não é evidência sobre todas as invenções.|Um registro sustenta uma conclusão específica; não devemos transformar uma contribuição documentada em uma invenção sem apoio.
Leia os três documentos de cada pasta.|O nome correto corresponde à pasta inteira, não a uma palavra familiar.|Compare os três resumos de documentos antes de escolher uma atribuição; uma palavra familiar sozinha é uma evidência mais fraca.
Três pistas. Uma correspondência sustentada.|Agrupei os três resumos para sua comparação.|Agrupar os resumos ajuda a comparar o apoio que oferecem a uma conclusão específica.
Um nome precisa de um motivo.|Vamos acrescentar uma explicação curta ao lado de cada nome.|Uma explicação curta torna visível aos outros leitores a ligação entre o registro e a atribuição.
Nem todo trabalho importante é uma máquina.|Escritoras, engenheiros e matemáticas contribuíram de maneiras diferentes.|O trabalho de uma escritora não vale menos por não ser uma máquina; uma exposição pode reconhecer contribuições diferentes.
Estes cartões são resumos, não citações.|Escrevemos os cartões a partir de fontes institucionais.|Os cartões resumem fontes institucionais; não colocam palavras inventadas na boca de pessoas históricas.
Livros e cálculos são importantes.|Vamos conectar livros, cálculos e projetos de engenharia.|A exposição vai conectar formas diferentes de conhecimento, mantendo distintas suas contribuições.
Cada nome tem uma fonte.|Vamos mostrar a fonte ao lado de cada perfil.|Os leitores podem rastrear a atribuição até uma fonte, em vez de aceitar uma etiqueta só porque ela parece oficial.
Este cartão é sobre Katherine Johnson e matemática espacial.|Katherine Johnson conferiu os cálculos de voo para a missão orbital de John Glenn em 1962.|Embora computadores eletrônicos tenham calculado a órbita, Katherine Johnson conferiu seus resultados antes do voo de John Glenn em 1962.
Este cartão mostra uma escritora e seu livro, publicado em 1960.|Carolina Maria de Jesus escreveu Quarto de despejo, publicado em 1960.|Quarto de despejo, de Carolina Maria de Jesus, foi publicado em 1960; seu trabalho literário merece atribuição precisa de autoria.
Este cartão mostra um engenheiro e seu trabalho público.|André Rebouças trabalhou em projetos portuários e participou do movimento abolicionista.|André Rebouças combinou trabalho de engenharia com atuação abolicionista e defendeu condições para a vida depois da liberdade.
"""
campaign_pt += r"""
A rede espalha mensagens com falhas.|Alguns posts perderam datas. Outros generalizaram comunidades inteiras.|A rede mistura afirmações incorretas, estereótipos e discriminação; precisamos distinguir seus efeitos.
Vamos conferir antes de compartilhar.|Devemos conferir a fonte antes de compartilhar um post.|Antes de compartilhar, examine a fonte, a data e o contexto; depois considere o que a afirmação causa às pessoas.
Um desacordo nem sempre é discriminação.|As pessoas podem discordar sobre uma música sem negar os direitos de ninguém.|Uma diferença de gosto musical não equivale a excluir alguém por causa da raça; o contexto importa.
Os posts corrigidos mostram o contexto.|Restauramos datas, acrescentamos fontes e sinalizamos regras discriminatórias de acesso.|Cada correção responde ao problema identificado, em vez de chamar todos os desacordos da mesma coisa.
Posso pedir ajuda.|Aprendi a guardar um registro e a pedir ajuda a um adulto de confiança.|Quando um post ataca alguém, apoio e participação de um adulto de confiança podem importar mais do que vencer uma discussão online.
Nova mensagem: o centro comunitário.|A próxima missão vem do centro comunitário.|Moradores enviaram convites para discutir o acesso, então nossa investigação passa das telas para o bairro.
Um título chamativo não é uma fonte.|A manchete mais chamativa não incluía sua data.|Uma manchete pode atrair atenção enquanto esconde informações necessárias para avaliar sua afirmação.
Pergunte: quem, quando, onde e por quê?|Quem publicou? Quando? O que foi removido?|Pergunte quem produziu o post, quando ele apareceu, que contexto foi removido e quais evidências o sustentam.
Fontes e datas continuam visíveis.|Acrescentei campos de fonte e data aos cartões de correção.|Campos visíveis de fonte e data ajudam os leitores a examinar a afirmação sem depender apenas de nossa autoridade.
O contexto completo está aqui.|Acrescentei uma nota curta sobre o contexto ausente.|A nota explica por que o contexto removido muda a afirmação, preservando o registro original para revisão.
Podemos apoiar as pessoas e pedir ajuda.|Uma regra do clube excluiu uma estudante por causa da cor da pele.|A exclusão por raça no clube fictício é discriminatória; exige apoio à estudante e mudança na regra.
Não precisamos compartilhar histórias pessoais aqui.|Podemos discutir os casos fictícios sem expor colegas.|Podemos analisar estes registros fictícios sem pedir a ninguém que prove ou conte uma experiência pessoal.
Apoio primeiro. Um adulto de confiança pode ajudar.|Vamos apoiar a estudante e envolver um adulto de confiança da escola.|Apoio e participação responsável de adultos podem ajudar a enfrentar a regra discriminatória sem expor a estudante online.
Guardamos a regra e pedimos mudança.|Vamos preservar o registro e pedir uma revisão com apoio de adultos.|Preservar o registro ajuda a pedir uma revisão com apoio; a responsabilidade não deve recair apenas sobre a estudante excluída.
Excluir por raça nega acesso justo.|O clube fictício excluiu uma estudante por causa da cor da pele: isso é discriminação racial.|A exclusão por raça é discriminatória; é diferente de uma divergência de gosto e exige resposta ao acesso negado.
Uma pessoa não é um povo inteiro.|Um post afirmou que todos os povos indígenas viviam da mesma maneira.|O post trata povos diversos como idênticos; diferentes vozes e informações atuais questionam seu estereótipo.
Leia a data e a mensagem completa.|Um aviso antigo do festival perdeu a data e pareceu atual.|O aviso fictício recortado parece atual, mas restaurar a data muda seu sentido; não podemos deduzir apenas disso a intenção de quem o enviou.
Nosso centro precisa de acesso melhor.|O centro teve um festival, mas alguns moradores não puderam participar.|Um festival pode acolher todos em palavras enquanto mantém barreiras práticas à participação.
Pergunte às pessoas do que precisam.|Moradores descreveram necessidades diferentes. Devemos ouvir antes de construir.|Membros da comunidade podem identificar barreiras diferentes; precisamos de sua participação antes de escolher projetos.
Temos um orçamento e vários projetos.|Não podemos financiar todos os projetos de uma vez, então vamos comparar prioridades.|Um orçamento limitado exige escolhas, mas cada primeiro passo também precisa de manutenção e de um plano para necessidades não atendidas.
Os primeiros projetos estão prontos. Continuamos conferindo.|Construímos os primeiros projetos e combinamos revisá-los com os moradores.|Os primeiros projetos removem algumas barreiras; moradores acompanharão resultados e identificarão o que ainda precisa de trabalho.
Muitos povos vivem no presente.|Nossa exposição inclui vozes indígenas contemporâneas.|Vozes indígenas contemporâneas fazem parte da vida cultural da cidade; elas não estão restritas a um passado imaginado.
Agora podemos examinar o arquivo principal.|Nossos registros de acesso liberam o arquivo principal da cidade.|Os registros restaurados agora revelam como BIAS.EXE selecionou seus dados, então podemos examinar o próprio sistema.
Um degrau e um trajeto longo podem impedir o acesso.|Moradores relataram barreiras na entrada e nos trajetos.|Neste bairro fictício, a entrada e os trajetos criam barreiras diferentes; os projetos devem responder às prioridades dos moradores.
Pergunte a nós antes de escolher.|Queremos ajudar a escolher e revisar os projetos.|Moradores precisam participar das prioridades e da revisão; a cidade não deve tratá-los apenas como quem recebe ajuda.
Nós nos reunimos e compartilhamos opiniões.|Vamos nos reunir para discutir o acesso depois que os primeiros projetos abrirem.|Uma reunião de avaliação acessível pode mostrar quem se beneficiou e quais barreiras permanecem.
Registramos necessidades e próximos passos.|Vamos listar necessidades, prioridades e datas de acompanhamento.|Um registro público pode tornar visíveis as necessidades não atendidas e as datas de acompanhamento, com os dados pessoais protegidos.
Pessoas indígenas estão aqui hoje.|Diferentes povos indígenas vivem em contextos diferentes hoje.|Povos indígenas têm vidas contemporâneas diversas, dentro e fora de Terras Indígenas.
Minha história é uma história. Pergunte antes de gravar.|Minha história não representa todos os povos. Peça autorização antes de gravar.|Posso compartilhar minha experiência, mas ela não representa todos os povos; gravação e publicação precisam de consentimento.
Escolhemos a exposição juntos.|Participantes vão ajudar a escolher o que a exposição inclui.|Participantes podem ajudar a decidir a exposição e como são representados, em vez de apenas fornecer material.
Pergunte primeiro. Dê crédito a cada pessoa que fala.|Vamos pedir autorização e identificar quem contou cada relato.|Autorização e atribuição clara preservam a distinção entre um relato pessoal e uma afirmação sobre todas as comunidades.
Povos indígenas têm línguas e modos de vida diferentes.|O censo mostra pessoas indígenas vivendo dentro e fora de Terras Indígenas.|Registros contemporâneos do censo mostram povos indígenas, línguas e contextos diversos; uma personagem fictícia não pode representar todos eles.
Um convite precisa de um trajeto acessível.|Moradores marcaram barreiras antes de a cidade escolher projetos.|O mapa fictício de acesso conecta relatos dos moradores a projetos; escolher um projeto é um primeiro passo, não prova de que toda barreira desapareceu.
As pessoas ajudam a decidir e revisar o plano.|Moradores pediram para participar das decisões e das revisões posteriores.|A participação comunitária ajuda a identificar prioridades e revisar práticas, enquanto as instituições públicas continuam responsáveis por suas ações.
O arquivo tem vozes ausentes.|BIAS.EXE aprendeu com registros que já excluíam pessoas.|BIAS.EXE reproduziu padrões de registros incompletos; o programa não criou sozinho todas as exclusões.
Conferimos os dados e as regras.|Precisamos corrigir os registros e revisar as regras de seleção.|Mais registros podem ajudar, mas também precisamos examinar como as pessoas selecionam dados e avaliam os efeitos do sistema.
As pessoas continuam responsáveis.|Um reboot não pode substituir a responsabilidade humana contínua.|Um reboot é apenas um passo: as pessoas devem continuar responsáveis, ouvir as comunidades afetadas e revisar decisões.
Estou pronto. Nossas fontes também.|Meu scanner está pronto, e nossos cartões de evidências estão organizados.|Posso ajudar a organizar as evidências, mas nossa equipe decidirá o que o sistema precisa mudar.
O arquivo funciona de novo. O trabalho continua.|Corrigimos o arquivo e mantivemos um processo de revisão ativo.|Restauramos o arquivo, mas um processo contínuo de revisão importa à medida que surgem novos registros e decisões.
Créditos claros. Mais vozes. Música nova!|O festival voltou com créditos e espaço para novos artistas.|O festival agora tem créditos claros e convida novos participantes; o arquivo continuará aprendendo com seu trabalho.
Conferimos a cidade juntos.|Moradores vão revisar o acesso e enviar opiniões.|Moradores e instituições acompanharão o acesso juntos; participar faz parte do trabalho contínuo da cidade.
Sistema restaurado. A curiosidade continua ligada.|Sistema restaurado. A próxima boa pergunta é sua.|Sistema restaurado. Um arquivo confiável nunca está pronto, então a próxima pergunta cuidadosa é sua.
Esta amostra esconde parte da cidade.|A amostra fictícia de dados incluiu apenas alguns bairros.|A amostra fictícia deixa bairros de fora, então suas conclusões não podem descrever toda a cidade sem novas evidências.
Precisamos de fontes e de um registro de revisão.|Nosso registro de correções anota cada fonte e cada mudança.|Um registro rastreável de correções permite examinar fontes, motivos e efeitos das mudanças ao longo do tempo.
Fontes e mudanças continuam visíveis.|Vamos manter fontes e um registro datado de mudanças.|Um registro datado de mudanças apoia a revisão e deixa nossas escolhas abertas a perguntas.
As pessoas podem pedir uma revisão.|Vamos abrir um canal acessível de revisão.|Um canal acessível de revisão ajuda as pessoas afetadas a questionar decisões, enquanto a equipe continua responsável por responder.
Um registro pode deixar uma voz de fora.|Algumas pessoas já estavam ausentes antes de BIAS.EXE ler o arquivo.|Um arquivo já pode refletir exclusões; corrigir um algoritmo também exige examinar como os registros foram reunidos.
Pergunte quem está faltando e quem decide.|Quem ficou de fora? Quem escolheu os registros?|Pergunte quem está ausente, quem selecionou os registros e como as comunidades podem participar da próxima revisão.
Revisamos o arquivo juntos.|Vamos programar revisões com participantes diferentes.|Revisões programadas com participantes diferentes podem identificar lacunas que uma equipe deixa passar.
Mostramos limites e corrigimos erros.|Vamos indicar limites e corrigir novos erros quando surgirem evidências.|Reconhecer limites e documentar correções torna a responsabilidade uma prática contínua, em vez de uma declaração de vitória final.
Esta amostra deixa pessoas de fora.|A amostra fictícia de treinamento omitiu algumas comunidades e seus registros.|A amostra fictícia contém exclusões; acrescentar registros ajuda apenas se as pessoas também examinarem regras de seleção e efeitos.
Um sistema pode repetir um padrão com viés.|Um sistema de IA pode reproduzir padrões de dados e decisões com viés.|Sistemas de IA podem reproduzir ou ampliar vieses por meio de seus dados, projeto e uso; uma correção técnica não substitui a responsabilidade humana.
As pessoas conferem fontes e revisam decisões.|A equipe criou um registro de fontes e um meio de pedir revisão.|O plano fictício de revisão combina fontes, participação comunitária e responsabilidade humana à medida que o arquivo muda.
"""

def walk_pairs(value, path=()):
    if isinstance(value, dict):
        if isinstance(value.get("en"), dict) and "pt" in value:
            yield list(path), value
        for key, child in value.items():
            yield from walk_pairs(child, (*path, key))
    elif isinstance(value, list):
        for index, child in enumerate(value):
            yield from walk_pairs(child, (*path, index))

campaign_pairs = list(walk_pairs(original["content"]))
campaign_rows = [line.split("|") for line in campaign_pt.strip().splitlines() if line.strip()]
assert len(campaign_pairs) == len(campaign_rows) == 105
for (path, old), row in zip(campaign_pairs, campaign_rows):
    assert len(row) == 3
    by_grade = dict(zip(["6", "7", "8"], row))
    translations.append({"scope": "content", "path": path, "expectedEn": old["en"], "pt": row[2], "ptByGrade": by_grade})

resident_pt = r"""
Este caminho precisa de espaço.|Moradores pediram um caminho mais livre.|Moradores apontaram barreiras, então o plano do nosso parque fictício inclui uma revisão dos caminhos.
Ouvimos antes de mudar isso.|Ouvimos antes de mover os bancos.|Antes de mover os bancos, perguntamos como pessoas diferentes usam este espaço.
Confira também o caminho.|O convite não consertou o caminho.|Um convite claro ajuda, mas o trajeto ainda precisa de atenção.
Este cartaz precisa de nomes.|O cartaz perdeu os nomes dos criadores.|Um cartaz bonito ainda precisa de nomes e funções precisos; enviei o meu à equipe do festival.
Meu gosto é meu gosto.|Meu amigo preferiu uma música diferente.|Meu amigo e eu preferimos músicas diferentes, mas nenhuma preferência decide quem pertence a este lugar.
Os nomes devem estar no cartaz.|Colocamos os nomes de volta no cartaz.|O cartaz atualizado mostra quem contribuiu, em vez de esconder o trabalho atrás do desenho.
Confira o mapa e a data.|As etiquetas perderam lugares e datas.|Uma linha do tempo precisa de lugares e datas; caso contrário, sociedades diferentes podem parecer uma história só.
Uma exposição é uma seleção.|Selecionamos alguns registros para esta exposição.|Esta exposição fictícia usa alguns registros; sua seleção não pode representar todas as histórias africanas.
Pergunte o que está faltando.|Você perguntou o que a exposição deixou de fora.|Perguntar o que uma exposição deixa de fora nos ajuda a planejar a próxima investigação.
Este resumo não é uma citação.|Escrevemos um resumo a partir de fontes identificadas.|Nosso resumo educativo identifica suas fontes; ele não inventa palavras de uma pessoa histórica.
Mantenha a fonte junto do registro.|A identificação da fonte nos ajudou a conferir a afirmação.|Manter fonte, data e contexto juntos facilita a investigação de perguntas posteriores.
Leia o que a pista sustenta.|A pista sustentou uma afirmação específica.|Uma pista pode sustentar uma afirmação limitada e deixar outras perguntas abertas.
Uma máquina não trabalha sozinha.|Várias pessoas ajudaram em nosso projeto.|Várias pessoas ajudaram nosso projeto fictício, então a nova etiqueta identifica funções diferentes.
Não adivinhe quem é o autor.|Conferimos os registros antes de acrescentar nomes.|Conferimos os registros antes de acrescentar nomes porque uma palavra familiar não estabelece autoria.
Encontre o registro para o nome.|O registro nos ajudou a restaurar os nomes.|Atribuição precisa exige uma ligação entre a pessoa nomeada e o trabalho documentado.
Sua pergunta pode abrir uma porta.|Sua pergunta ajudou a turma a examinar uma etiqueta.|Uma boa pergunta pode revelar uma data ausente, uma afirmação sem apoio ou uma voz deixada de fora.
Usamos casos fictícios aqui.|Discutimos casos fictícios sem expor colegas.|Podemos discutir estes casos fictícios sem pedir que colegas revelem experiências pessoais.
Pergunte por que a resposta faz sentido.|Explicamos por que uma resposta correspondia às evidências.|Uma explicação mostra como a resposta decorre das evidências, em vez de pedir apenas confiança.
Esta mensagem precisa de uma data.|Entreguei um aviso antigo sem sua data.|Um aviso antigo pareceu atual depois que sua data foi cortada; encontrei a versão completa.
Confiro antes de compartilhar.|Conferi o anúncio atual antes de compartilhar.|Comparo o aviso completo com o anúncio atual antes de enviar uma correção.
Velocidade não é uma fonte.|O post mais rápido não era o mais claro.|Um post rápido ainda pode não ter contexto, então velocidade sozinha não sustenta uma afirmação.
Minha memória é um relato.|Lembrei desta praça de uma maneira diferente.|Minha memória oferece um relato desta praça fictícia; outros registros podem acrescentar ou questionar detalhes.
Pergunte antes de gravar minha história.|Combinamos o que poderia ser gravado.|Antes de gravar, combinamos acesso e publicação, em vez de supor que todo detalhe era público.
O primeiro projeto precisa de revisão.|O primeiro projeto mudou parte do trajeto.|O primeiro projeto melhorou parte do trajeto; nossa próxima revisão vai conferir o que ainda precisa de trabalho.
Pergunto quem e quando.|Perguntei quem fez o cartão e quando.|Pergunto quem fez um registro e quando, porque um cartão bem acabado ainda pode estar sem contexto.
Um livro pode ser uma pista.|O caderno mudou o plano de nossa exposição.|Um caderno pode contribuir com evidências sobre escrita e experiência, embora não represente todas as vozes.
Posso explicar minha resposta.|Expliquei qual pista apoiava minha resposta.|Posso explicar qual pista apoia minha resposta e qual pergunta ainda permanece aberta.
Nossa faixa é original.|Sol e eu fizemos uma faixa nova para o jogo.|Sol e eu fizemos uma faixa original do jogo e identificamos suas referências com clareza.
Um ritmo também tem pessoas.|O programa acrescentou os nomes dos músicos.|O programa identifica criadores e funções para que o público possa acompanhar o trabalho por trás do som.
Leia a nota cultural.|Acrescentamos contexto ao lado dos créditos.|Os créditos e a nota cultural têm propósitos diferentes, e ambos ajudam o público a investigar.
Guardei um lugar na sombra para nossa leitura.|Guardei um lugar na sombra para nossa leitura.|Há um lugar na sombra que guardei para nossa leitura.
Um retrato pode suscitar perguntas sobre uma pessoa e sua história.|Um retrato pode nos ajudar a perguntar sobre uma pessoa e sua história.|Quando olhamos um retrato, podemos perguntar sobre a pessoa e sua história.
Você gostaria de escolher um livro comigo e olhar a referência?|Você gostaria de escolher um livro comigo e conferir sua referência?|Vamos escolher um livro juntos e olhar a referência que ele oferece?
O banco está livre; podemos continuar nossa leitura.|O banco está livre, então podemos continuar nossa leitura.|Agora que o banco está livre, podemos voltar à nossa leitura.
Organizei minhas anotações antes de abrir a mesa de observação.|Organizei minhas anotações antes de abrir a mesa de observação.|Antes de abrir a mesa de observação, organizei minhas anotações.
Uma ficha de cientista deve mostrar seu nome e o que ela estuda.|Uma ficha de cientista deve incluir seu nome e o que ela pesquisa.|Quando fazemos uma ficha de cientista, incluímos seu nome e sua pesquisa.
Venha comparar as leituras dos sensores imaginários comigo.|Você gostaria de comparar as leituras dos sensores imaginários comigo?|Vamos comparar juntos as leituras dos sensores imaginários.
As anotações estão aqui para que possamos continuar comparando.|As anotações estão aqui para continuarmos a comparação.|Podemos continuar nossa comparação com as anotações que temos aqui.
Trouxe meu caderno para desenhar o movimento da praça.|Trouxe meu caderno para esboçar o movimento da praça.|Trouxe meu caderno para poder esboçar o que está acontecendo na praça.
Minha memória ajuda a contar a cena; podemos compará-la com outros registros.|Minha memória ajuda a descrever a cena, e podemos compará-la com outros registros.|Podemos usar minha memória para descrever a cena e compará-la com outros registros.
Sente aqui e escolha um detalhe para desenhar comigo.|Você gostaria de sentar aqui e escolher um detalhe para desenhar comigo?|Junte-se a mim aqui e escolha um detalhe para desenharmos juntos.
Deixei uma página em branco para nosso próximo desenho.|Deixei uma página em branco para nosso próximo desenho.|Há uma página em branco que deixei para nosso próximo desenho.
O ensaio começa depois que eu ajustar este banco.|O ensaio vai começar depois que eu tiver ajustado este banco.|Assim que eu tiver ajustado este banco, poderemos começar o ensaio.
Compor, fazer um arranjo e tocar são contribuições diferentes.|Compor, fazer um arranjo e interpretar são contribuições diferentes.|A música reúne contribuições diferentes, incluindo compor, fazer arranjos e interpretar.
Você gostaria de me ajudar a conferir os créditos de nosso programa?|Você gostaria de me ajudar a conferir os créditos no nosso programa?|Vamos conferir nosso programa juntos para ver se os créditos estão claros?
O programa está na mesa; podemos conferir mais um nome.|O programa está na mesa, então podemos conferir outro nome.|Podemos conferir outro nome no programa que está na mesa.
Organizei o tabuleiro para poder conversar com quem chega.|Organizei o tabuleiro para conversar com as pessoas quando elas chegam.|Com o tabuleiro organizado, posso conversar com as pessoas que estão chegando.
Este ofício tem conhecimentos transmitidos entre gerações.|Este ofício inclui conhecimentos que são transmitidos entre gerações.|Conhecimentos passam entre gerações por meio deste ofício.
Vamos ler a ficha juntos e pensar no que está faltando?|Você gostaria de ler a ficha juntos e pensar no que ainda falta contar?|Vamos ler a ficha juntos e considerar quais partes ainda precisam ser contadas.
A ficha está ao lado do tabuleiro; podemos continuar nossa conversa.|A ficha está ao lado do tabuleiro, então podemos continuar nossa conversa.|Podemos continuar nossa conversa com a ficha ao lado do tabuleiro.
Hoje encontrei a pasta na prateleira de cima.|Hoje encontrei a pasta que estava na prateleira de cima.|Encontrei a pasta hoje; ela estava na prateleira de cima.
Guardo o título, o criador e a fonte de cada registro.|Para cada registro, guardo seu título, quem o fez e de onde veio.|Quando organizo um registro, guardo seu título, seu criador e sua fonte.
Você gostaria de abrir uma ficha comigo e encontrar essa informação?|Você gostaria de abrir uma ficha comigo e procurar essa informação?|Vamos abrir uma ficha juntos e ver onde essa informação aparece.
A pasta ainda está na mesa para consultarmos.|A pasta ainda está na mesa para nossa consulta.|Podemos consultar a pasta que ainda está na mesa.
Separei lápis e papel para nosso grupo de desenho.|Separei lápis e papel para o grupo de desenho.|Os lápis e o papel estão prontos porque os separei para nosso grupo de desenho.
As cores e as pessoas que escolhemos mostrar ajudam a ler uma imagem.|As cores e as pessoas que escolhemos mostrar fazem parte de como lemos uma imagem.|Lemos uma imagem considerando, entre outras coisas, as cores e as pessoas escolhidas nela.
Venha olhar um desenho comigo antes de escrevermos a legenda.|Você gostaria de olhar um desenho juntos antes de escrever sua legenda?|Antes de escrevermos a legenda, vamos observar o desenho juntos.
Ainda há papel para outra observação.|Ainda há papel para fazermos outra observação.|Temos papel suficiente para fazer outra observação.
Prendi os avisos para que o vento não leve nossas anotações.|Prendi os avisos para que o vento não leve nossas anotações.|Para impedir que o vento leve nossas anotações, prendi os avisos.
Se uma legenda afirma demais, confiro a fonte e reviso o texto.|Quando uma legenda afirma demais, volto à fonte e reviso o texto.|Se uma legenda vai além das evidências, volto à sua fonte e reviso o texto.
Você gostaria de revisar um recorte e seu artigo completo comigo?|Você gostaria de comparar um recorte com seu artigo completo comigo?|Vamos revisar um recorte junto do artigo completo de onde ele veio.
O artigo completo está aqui para conferirmos de novo.|O artigo completo está aqui para consultarmos de novo.|Podemos consultar novamente o artigo completo que está aqui.
"""
resident_rows = [line.split("|") for line in resident_pt.strip().splitlines() if line.strip()]
resident_pairs = []
for resident in original["residents"]:
    if isinstance(resident["lines"][0]["en"], dict):
        for index, line in enumerate(resident["lines"]):
            resident_pairs.append((resident["id"], ["lines", index], line))
        if resident.get("repeat"):
            resident_pairs.append((resident["id"], ["repeat"], resident["repeat"]))
assert len(resident_pairs) == len(resident_rows) == 62
for (identifier, path, old), row in zip(resident_pairs, resident_rows):
    assert len(row) == 3
    translations.append({"scope": "resident", "id": identifier, "path": path, "expectedEn": old["en"], "pt": row[2], "ptByGrade": dict(zip(["6", "7", "8"], row))})

cultural_pt = r"""
Sou Bisa. Faço tranças. Podemos olhar os desenhos antes de escolher.|Sou Bisa, trancista. Podemos conversar sobre os desenhos antes de escolher.|Sou Bisa, trancista; os desenhos ajudam a conversar sobre uma escolha antes de eu começar.
Você gostaria de observar um cartão? O livro pode ajudar.|O livro na mesa nos ajuda a comparar os desenhos.|Podemos consultar o livro na mesa enquanto comparamos os cartões ilustrados.
Posso mostrar um desenho. Você pode escolher.|Posso mostrar o desenho, mas sua preferência importa.|Posso explicar o desenho, deixando espaço para sua própria preferência.
Qual cartão você gostaria de ver?|Qual cartão você gostaria de observar? Podemos compará-los devagar.|Podemos comparar sem pressa o cartão que você gostaria de observar.
Sou Dandara. Crio roupas para pessoas e suas atividades cotidianas.|Sou Dandara. Crio roupas pensando em quem veste e em seus planos.|Sou Dandara; penso nas preferências e nas atividades de quem veste ao criar roupas.
Este turbante é minha escolha cotidiana. Estes desenhos são meus.|Meu turbante é uma escolha cotidiana, e os desenhos no painel são meus estudos originais.|O turbante que escolhi para hoje é de uso cotidiano; o painel mostra meus estudos originais de criação.
O livro apresenta a estilista Isa Silva. Meus desenhos têm seus próprios créditos.|O livro apresenta Isa Silva. Mantenho a referência separada de meus próprios desenhos.|O livro apresenta Isa Silva, enquanto meu caderno distingue a referência pesquisada de meus próprios desenhos.
Você gostaria de ver o bolso ou as dobras?|Você gostaria de examinar o bolso ou comparar as dobras?|Podemos examinar o detalhe do bolso ou comparar as dobras, como você preferir.
Sou Jaci. Trabalho no museu e pratico Candomblé. Esta é minha própria história.|Sou Jaci, educadora de museu e praticante do Candomblé. Posso compartilhar minha própria experiência.|Sou Jaci, educadora de museu que pratica Candomblé; minha experiência não fala por todas as comunidades.
As leituras apresentam religiões e comunidades diferentes. Podemos ler juntos.|As leituras distinguem Candomblé e Umbanda e reconhecem diferenças entre comunidades.|Podemos consultar leituras que distinguem Candomblé e Umbanda, reconhecendo a diversidade dentro das comunidades.
Usamos informações públicas. Você não precisa compartilhar sua religião.|Nossa ficha usa o que a comunidade escolheu compartilhar publicamente. Participantes não precisam revelar sua religião.|Respeitamos o que a comunidade escolheu tornar público, sem pedir que participantes revelem suas próprias crenças.
Podemos escrever uma pergunta primeiro.|Se você tiver uma pergunta, podemos registrá-la antes de procurar uma resposta.|Podemos registrar uma pergunta antes de buscar uma resposta e decidir qual fonte consultar.
"""
cultural_pairs = []
for index, resident in enumerate(original["culture"]["residents"]):
    for number, line in enumerate(resident["lines"]):
        cultural_pairs.append((["residents", index, "lines", number], line))
    cultural_pairs.append((["residents", index, "repeat"], resident["repeat"]))
cultural_rows = [line.split("|") for line in cultural_pt.strip().splitlines() if line.strip()]
assert len(cultural_pairs) == len(cultural_rows) == 12
for (path, old), row in zip(cultural_pairs, cultural_rows):
    translations.append({"scope": "culturalContent", "path": path, "expectedEn": old["en"], "pt": row[2], "ptByGrade": dict(zip(["6", "7", "8"], row))})

addition_pt = r"""
Vamos comparar os dois cartões?|Os cartões descrevem o preparo. Vamos compará-los?|Podemos consultar os cartões de preparo enquanto comparamos os dois alimentos.
Pergunte a mim sobre os ingredientes. A cor não basta.|Você pode perguntar a mim sobre os ingredientes das cocadas de hoje; a cor sozinha não basta.|Posso explicar o que usei nas cocadas de hoje, em vez de deixar que você deduza os ingredientes apenas pela cor.
Meu retrato está no álbum da biblioteca. Escolhi a legenda.|Escolhi a legenda e concordei em acrescentar meu retrato ao álbum da biblioteca.|O álbum da biblioteca inclui o retrato e a legenda que escolhi compartilhar.
Este livro apresenta Nilma Lino Gomes. Vamos encontrar a referência?|O livro sobre cabelo apresenta a pesquisa de Nilma Lino Gomes. Vamos encontrar a referência juntos?|Podemos localizar a referência à pesquisa de Nilma Lino Gomes no livro sobre cabelo e identidade.
Conferimos a legenda e explicamos a correção.|Revisamos uma legenda que deduzia a religião pela roupa e explicamos a correção.|A legenda revisada usa informações autorizadas e explica por que a suposição anterior baseada na roupa foi corrigida.
Este desenho é de Dandara. Cada criador tem um crédito.|Este desenho é de Dandara, e a exposição real tem uma referência separada.|Mantivemos o desenho de Dandara e a referência à exposição real em campos separados para que cada criador receba crédito.
A ficha pública está aqui. Combinamos o que compartilhar.|Esta ficha pública registra os participantes e o que concordaram em compartilhar.|A ficha pública identifica os participantes e as condições que combinaram para compartilhar suas informações.
Escolhi roupas confortáveis para o ensaio.|Guardei meu instrumento e escolhi roupas confortáveis para o ensaio.|Antes do ensaio, guardei o instrumento e escolhi roupas adequadas ao que eu iria fazer.
"""
addition_pairs = []
for index, resident in enumerate(original["culture"]["residentAdditions"]):
    for number, line in enumerate(resident["lines"]):
        addition_pairs.append((["residentAdditions", index, "lines", number], line))
addition_rows = [line.split("|") for line in addition_pt.strip().splitlines() if line.strip()]
assert len(addition_pairs) == len(addition_rows) == 8
for (path, old), row in zip(addition_pairs, addition_rows):
    translations.append({"scope": "culturalContent", "path": path, "expectedEn": old["en"], "pt": row[2], "ptByGrade": dict(zip(["6", "7", "8"], row))})

heritage_resident_pt = {
    "mila": [
        "Vamos tocar uma frase e deixar espaço para uma resposta.",
        "A leitura apresenta Sister Rosetta Tharpe e influências musicais.",
        "Os registros mostram caminhos musicais diferentes.",
        "Este som é nosso exercício original. Os registros dão crédito às referências históricas."],
    "ravi": [
        "Guardei um lugar para uma leitura sem pressa. Qual história chamou sua atenção?",
        "Machado trabalhou como revisor. Quem está contando esta história?",
        "Carolina também compôs canções. Um livro não mostra todo o trabalho de uma pessoa.",
        "Os registros apontam para fontes para que você possa continuar explorando."]}
for resident in original["residents"]:
    if resident["id"] in heritage_resident_pt:
        for index, pt in enumerate(heritage_resident_pt[resident["id"]]):
            old = resident["lines"][index]
            translations.append({"scope": "resident", "id": resident["id"], "path": ["lines", index], "expectedEn": old["en"], "pt": pt})

historical_en = {
    "nina": [
        "Nina Simone (1933–2003) was born Eunice Kathleen Waymon. She studied piano and developed a style that brought classical music, jazz and blues together.",
        "Her work was also connected to the struggle for civil rights in the United States. Her musical education and public stance are distinct parts of her story."],
    "tim": [
        "Tim Maia (1942–1998), a singer and composer from Rio de Janeiro, is a reference in Brazilian soul. His career brought together singing, composition and work with a band.",
        "He lived in the United States, studied English and sang with The Ideals. In 1970, he released his first LP and recorded with Elis Regina."],
    "king": [
        "Martin Luther King Jr. (1929–1968) was a leader in the civil rights movement in the United States. He advocated nonviolent action against racial segregation.",
        "In 1964, he received the Nobel Peace Prize. Campaigns, boycotts and marches were built by many people; one leader does not achieve a transformation alone."],
    "machado": [
        "Machado de Assis (1839–1908) wrote novels, short stories, chronicles, poetry and plays. He also worked as a typesetter, proofreader and journalist.",
        "He was elected the first president of the Brazilian Academy of Letters in 1897. Memórias póstumas de Brás Cubas is one of his novels."],
    "carolina": [
        "Carolina Maria de Jesus (1914–1977) was born in Sacramento, Minas Gerais. Her book Quarto de despejo, published in 1960, brings together diary writing.",
        "Her work is not limited to that book: she wrote in different genres and also composed music. An album of her compositions was released in 1961."],
    "katherine": [
        "Katherine Johnson (1918–2020) was a mathematician at NASA. Her work involved calculating spaceflight trajectories with research teams.",
        "Before John Glenn’s orbital flight in 1962, she checked calculations made by electronic computers. This shows why human review and collaboration matter."]}
for figure in original["heritage"]["figures"]:
    figure_translations.append({"id": figure["id"], "expectedFacts": figure["facts"], "enFacts": historical_en[figure["id"]]})

timeline_pt = [
    "Mansa Musa, de Mali, faz uma peregrinação a Meca.",
    "Sonni Ali começa seu reinado em Songhai.",
    "Diogo Cão chega à foz do rio Congo, nesta cronologia do museu.",
    "A lei de 13 de maio extingue legalmente a escravidão no Brasil.",
    "Quarto de despejo, de Carolina Maria de Jesus, é publicado.",
    "Katherine Johnson confere cálculos para a missão orbital de John Glenn."]
for index, pt in enumerate(timeline_pt):
    old = original["content"]["timeline"][index]
    translations.append({"scope": "content", "path": ["timeline", index], "expectedEn": old["en"], "pt": pt, "contextPt": old.get("contextPt", old["pt"])})

def dynamic(en, pt, corrected_en=None, corrected_pt=None, pt_by_grade=None):
    record = {"en": en, "pt": pt}
    if corrected_en:
        record["correctedEn"] = corrected_en
    if corrected_pt:
        record["correctedPt"] = corrected_pt
    if pt_by_grade:
        record["ptByGrade"] = pt_by_grade
    dialogue_translations.append(record)

dynamic("The seeds have labels.", "Organizei as sementes. Quer conferir as etiquetas comigo?", "I organized the seeds. Would you like to check the labels with me?")
dynamic("We take turns in the garden.", "Aisha cuida da rega, e eu preparo o próximo turno.", "Aisha does the watering, and I prepare the next shift.")
dynamic("Let’s take a break.", "Depois de guardar as ferramentas, a gente pode descansar.", "After putting the tools away, we can rest.")
dynamic("There is a place for you here.", "Vamos tentar esse trecho mais devagar?", "Shall we try this passage more slowly?")
dynamic("There is a place for you here.", "Olha o passarinho ali! Vou anotar onde pousou.", "Look at the little bird over there! I’ll write down where it landed.")
dynamic("There is a place for you here.", "Esse registro já tem origem e data. Vamos conferir o próximo?", "This record already has a source and a date. Shall we check the next one?")
dynamic("There is a place for you here.", "Vou registrar minha proposta. Deixamos a passagem livre?", "I’ll record my proposal. Shall we leave the passage clear?")
dynamic("There is a place for you here.", "Esse livro voltou hoje. Quer uma indicação?", "This book came back today. Would you like a recommendation?")
dynamic("There is a place for you here.", "Guardei um lugar pra você.", "I saved a place for you.")
dynamic("We can share our ideas.", "Depois podemos comparar nossas ideias.", "Later we can compare our ideas.")
dynamic("Let’s continue together.", "Bom te ver de novo. A gente pode continuar daqui.", "Good to see you again. We can continue from here.")
dynamic("Let’s look together.", "Guardei um lugar perto da fonte.", "I saved a place near the fountain.")
dynamic("I have a question too.", "Depois podemos passar na biblioteca.", "Later we can stop by the library.")
dynamic("We can compare our notes.", "Combinado. Vou terminar essa anotação.", "Agreed. I’ll finish this note.")
dynamic("Let’s look together.", "Esse livro voltou hoje.", "This book came back today.")
dynamic("I have a question too.", "Então vou deixar uma indicação no caderno.", "Then I’ll leave a recommendation in the notebook.")
dynamic("We can compare our notes.", "Me conta qual parte chamou sua atenção.", "Tell me which part caught your attention.")
dynamic("Let’s look together.", "Esse canteiro já recebeu água.", "This garden bed has already been watered.")
dynamic("I have a question too.", "Eu organizo as sementes para o próximo turno.", "I organize the seeds for the next shift.")
dynamic("We can compare our notes.", "Depois a gente descansa ali.", "Later we can rest over there.")
dynamic("Let’s look together.", "Vamos conferir este registro juntos?", "Shall we check this record together?")
dynamic("I have a question too.", "Sim. Também anotei uma pergunta.", "Yes. I wrote down a question too.")
dynamic("We can compare our notes.", "Depois a gente compara com a fonte.", "Then we can compare it with the source.")
dynamic("Our work is displayed with its context.", "O caderno já está exposto com as técnicas identificadas. Obrigada por cuidar das descrições.", "The notebook is now on display with the techniques identified. Thank you for taking care of the descriptions.")
dynamic("Our work is displayed with its context.", "As peças ganharam legendas com contexto. Agora cada escolha tem espaço na mostra.", "The pieces now have captions with context. Each choice now has a place in the exhibition.")
dynamic("Our work is displayed with its context.", "A entrevista está no mural, com as diferenças e a revisão que combinamos.", "The interview is on the noticeboard, with the differences and the review we agreed on.")
dynamic("Our labels are ready. Let’s listen to a new phrase.", "As fichas ficaram claras. Vamos ouvir uma frase e deixar espaço pra resposta?", "The cards are clear now. Shall we listen to a phrase and leave room for an answer?")
dynamic("We checked the captions. I saved more books for you.", "Conferimos a autoria das legendas. Separei mais leituras pra você.", "We checked the authorship of the captions. I set aside more reading for you.")
dynamic({"6": "We keep our story alive.", "7": "We kept the records together.", "8": "Our records are stronger because we listen to different voices."}, "Nosso trabalho continua. As pistas ficam no seu diário.", pt_by_grade={"6": "Mantemos nossa história viva.", "7": "Mantivemos os registros juntos.", "8": "Nossos registros são mais fortes porque ouvimos vozes diferentes."})

assert len(readings) == 50 and len({r["id"] for r in readings}) == 50
assert {r["id"] for r in readings} == {r["id"] for r in original["readings"]}
assert all(len(r["paragraphs"]) >= 2 and all(isinstance(p, str) and p for p in r["paragraphs"]) for r in readings)
content = {"version": "1.7", "readings": readings, "translations": translations, "dialogueTranslations": dialogue_translations, "figureTranslations": figure_translations}
(ROOT / "js/editorial-content.js").write_text("(function(){'use strict';const V=window.V=window.V||{};V.editorialContent=" + json.dumps(content, ensure_ascii=False, separators=(",", ":")) + ";})();\n", encoding="utf-8")
review = {
    "version": "1.7",
    "readingsReviewed": 50,
    "paragraphs": sum(len(r["paragraphs"]) for r in readings),
    "bilingualRecordsReviewed": len(translations),
    "gradeSpecificPairs": sum(3 for t in translations if t.get("ptByGrade")),
    "dynamicDialoguePairs": len(dialogue_translations),
    "historicalPortraitPairs": sum(len(f["enFacts"]) for f in figure_translations),
    "preserved": ["IDs", "fontes", "autoria", "fatos necessários às 108 questões", "campanha", "ramificações e flags", "inglês por ano escolar"],
    "editorialRules": ["Abertura situada, explicação conectada e consequência compreensível", "Ficção e referência histórica identificadas", "EN e PT exprimem o mesmo conteúdo", "Contexto adicional separado de tradução", "Sem citações históricas inventadas"],
    "integration": {"load": "Load after heritage-content.js, before initialization; apply after Living.initContent has merged the 50 readings.", "readings": "Match by id and copy paragraphs, en, pt without changing remaining metadata.", "translations": "Resolve scope content -> V.content, resident -> V.learning.residents by id, culturalContent -> V.culturalContent; validate expectedEn, then copy pt and ptByGrade. contextPt is separate educational context.", "dialogue": "Before original Dialogue.start, clone each line and resolve ptByGrade with V.lang; match dialogueTranslations by existing en and pt, replace correctedEn/correctedPt or ptByGrade while preserving speaker, choices and callbacks.", "figures": "Match V.heritageContent.figures by id, validate expectedFacts, then copy enFacts."},
    "verificationLimits": "Text and schema reviewed locally; browser interaction and visual typography belong to the main integration checks."
}
(ROOT / "data/editorial-review.json").write_text(json.dumps(review, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps({k: review[k] for k in ["readingsReviewed", "paragraphs", "bilingualRecordsReviewed", "gradeSpecificPairs", "dynamicDialoguePairs", "historicalPortraitPairs"]}, ensure_ascii=False))
