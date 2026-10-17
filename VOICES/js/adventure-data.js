(function(){
'use strict';
const V=window.V;
const skill=(id,name,branch,cost,target,effect,power,duration,cooldown,level,requires,description)=>({id,name,branch,cost,target,effect,power,duration,cooldown,level,requires,description,maxRank:3});
V.AdventureData={
version:3,
skills:[
skill('critical','Leitura Crítica','Pesquisa',8,'enemy','mark',1,3,1,1,null,'Revela a intenção e marca uma fraqueza: o alvo recebe +25% de dano por 3 turnos.'),
skill('timeline','Linha do Tempo','Pesquisa',10,'enemy','delay',14,2,2,2,'critical','Causa dano de conhecimento e reduz a agilidade do alvo em 60% por 2 turnos. Reordena a próxima rodada.'),
skill('counter','Contraprova','Pesquisa',12,'enemy','break',20,2,2,3,'timeline','Desfaz toda a barreira do alvo, causa dano e aplica vulnerabilidade por 2 turnos.'),
skill('compare','Comparar Fontes','Pesquisa',16,'enemy','double',13,0,2,5,'counter','Dois impactos. Cada evidência do capítulo acrescenta +2 ao poder de cada impacto.'),
skill('chorus','Vozes em Coro','Memória',12,'allies','chorus',.25,3,3,1,null,'Aumenta ataque e conhecimento do grupo em 25% por 3 turnos de cada participante.'),
skill('restore','Restituir Memória','Memória',11,'ally','heal',30,0,1,1,null,'Recupera 30 + 0,8 × conhecimento de vida de um aliado. Não ultrapassa a vida máxima.'),
skill('erase','Quebra do Apagamento','Memória',10,'ally','cleanse',15,0,2,3,'restore','Remove confusão, corrupção e obscurecimento; recupera 15 de vida.'),
skill('links','Mapa de Vínculos','Memória',14,'enemy','link',16,3,3,5,'chorus','Revela a intenção, causa dano e liga os inimigos: 35% dos impactos alcançam outro alvo por 3 turnos.'),
skill('shield','Escudo do Arquivo','Vigília',10,'ally','shield',30,3,2,1,null,'Concede um escudo de 30 + 0,5 × conhecimento por 3 turnos do protegido.'),
skill('credit','Crédito Devido','Vigília',12,'enemy','credit',22,3,2,3,'shield','Causa dano e reduz o ataque do alvo em 30% por 3 turnos. Atribuições distorcidas recebem +35% de dano.'),
skill('seal','Selo de Proveniência','Vigília',13,'allies','seal',1,3,3,5,'credit','Protege o grupo contra novos efeitos de corrupção, confusão e obscurecimento por 3 turnos.'),
skill('convergence','Convergência dos Séculos','Vigília',22,'enemies','ultimate',45,0,4,8,'seal','Consome 60 de ressonância. Atinge todos os inimigos e recupera 15 de vida de cada aliado. +20 de Sobrecarga.')
],
passives:[
{id:'notes',name:'Anotações em Rede',branch:'Pesquisa',level:1,stat:'knowledge',value:4,description:'+4 de conhecimento por grau. Aprender no RPG não substitui os registros educativos.'},
{id:'method',name:'Método Cuidadoso',branch:'Pesquisa',level:3,requires:'notes',stat:'investigation',value:8,description:'+8 de XP por descoberta inédita e +1 no alcance do pulso por grau.'},
{id:'focus',name:'Pausa para Pensar',branch:'Pesquisa',level:5,requires:'method',stat:'focusRegen',value:3,description:'Recupera +3 de foco por turno do Forasteiro, por grau.'},
{id:'listening',name:'Escuta Ativa',branch:'Memória',level:1,stat:'healing',value:6,description:'+6 de cura e escudo por grau.'},
{id:'community',name:'Rede de Cuidado',branch:'Memória',level:3,requires:'listening',stat:'health',value:15,description:'+15 de vida máxima para o grupo por grau.'},
{id:'prepared',name:'Preparação Coletiva',branch:'Memória',level:5,requires:'community',stat:'resonance',value:8,description:'Começa cada confronto com +8 de ressonância por grau.'},
{id:'stance',name:'Base Firme',branch:'Vigília',level:1,stat:'defense',value:3,description:'+3 de defesa por grau.'},
{id:'lantern',name:'Olhar da Vigília',branch:'Vigília',level:3,requires:'stance',stat:'resolve',value:4,description:'+4 de determinação por grau. Determinação reduz dano de corrupção e aumenta a defesa.'},
{id:'restraint',name:'Saber Partilhar',branch:'Vigília',level:5,requires:'lantern',stat:'overload',value:3,description:'Reduz em 3 por grau a Sobrecarga de cada poder do Historiógrafo.'}
],
items:{
historiograph:{name:'Historiógrafo Ancestral',category:'quest',slot:'device',unique:true,icon:'device',description:'Um arquivo portátil de latão e vidro turquesa. Revela vestígios incompletos; exige fontes, contexto e escuta.',stats:{knowledge:5}},
lantern:{name:'Lanterna de exploração',category:'equipment',slot:'tool',icon:'lantern',description:'Luz prática de raio 170. +3 de determinação. Pode ser ligada no relógio.',stats:{resolve:3}},
notebook:{name:'Caderno de campo',category:'equipment',slot:'accessory',icon:'notebook',description:'Anotações organizadas: +4 de conhecimento e +8 de foco máximo.',stats:{knowledge:4,focus:8}},
coat:{name:'Casaco de pesquisador',category:'equipment',slot:'clothing',icon:'coat',description:'Bolsos para materiais e proteção: +4 de defesa e +12 de vida.',stats:{defense:4,health:12}},
badge:{name:'Broche das Muitas Vozes',category:'equipment',slot:'accessory',icon:'badge',description:'Lembrança de uma decisão compartilhada. +5 de determinação e +2 de agilidade.',stats:{resolve:5,agility:2}},
lens:{name:'Lente de proveniência',category:'equipment',slot:'tool',icon:'lens',description:'Ajuda a comparar marcas de procedência: +8 de conhecimento.',stats:{knowledge:8}},
water:{name:'Água e pausa',category:'consumable',icon:'water',stack:20,description:'Recupera 45 de vida. Em batalha, usa um turno.',effect:'heal',power:45},
tea:{name:'Chá do intervalo',category:'consumable',icon:'tea',stack:20,description:'Recupera 35 de foco. Em batalha, usa um turno.',effect:'focus',power:35},
kit:{name:'Kit de conservação',category:'consumable',icon:'kit',stack:15,description:'Remove efeitos prejudiciais e recupera 20 de vida. Usa um turno em batalha.',effect:'cleanse',power:20},
resonance:{name:'Anotações cruzadas',category:'consumable',icon:'notes',stack:10,description:'+25 de ressonância e −15 de Sobrecarga. Usa um turno em batalha.',effect:'resonance',power:25},
letter:{name:'Carta da mediação',category:'quest',unique:true,icon:'letter',description:'A equipe do museu pede uma investigação compartilhada dos nomes que desapareceram.'},
fragments:{name:'Fragmentos de evidência',category:'material',icon:'notes',stack:99,description:'Materiais ficcionais de investigação. Os registros educativos continuam no Arquivo.'}
},
support:[
{id:'watch',name:'Vigília Protetora',description:'Escudo de 38 + 0,5 × conhecimento em um aliado.',target:'ally',cost:1},
{id:'light',name:'Luz da Vigília',description:'Remove obscurecimento do grupo e barreiras inimigas.',target:'enemies',cost:1},
{id:'safe',name:'Caminho Seguro',description:'Remove confusão e corrupção do grupo; recupera 20 de vida.',target:'allies',cost:1},
{id:'guardian',name:'Ressonância do Guardião',description:'+30 de ressonância, −20 de Sobrecarga e escudo de 25 para o grupo. Disponível após o capítulo 4.',target:'allies',cost:2,chapter:4}
],
enemies:[
{id:'thief',name:'Ladrão de Evidências',row:0,health:55,attack:12,defense:3,agility:17,mechanic:'furto',tip:'É frágil e rápido. Defesa reduz o foco que ele consegue dispersar.'},
{id:'censor',name:'Censor de Lacunas',row:1,health:95,attack:11,defense:9,agility:7,mechanic:'barreira',tip:'Alterna golpes e barreiras. Contraprova e Luz da Vigília desfazem sua proteção.'},
{id:'echo',name:'Eco Enganoso',row:2,health:65,attack:14,defense:4,agility:13,mechanic:'confusao',tip:'Obscurece leituras. Selo de Proveniência impede o efeito; Quebra do Apagamento o remove.'},
{id:'attribution',name:'Atribuição Distorcida',row:3,health:90,attack:16,defense:5,agility:11,mechanic:'credito',tip:'Acumula força com autoria roubada. Crédito Devido é seu contraponto.'},
{id:'chronology',name:'Manipulador de Cronologia',row:4,health:80,attack:13,defense:6,agility:16,mechanic:'atraso',tip:'Muda a ordem da rodada. Linha do Tempo permite reorganizar a iniciativa.'},
{id:'archivist',name:'Sustentador da Rasura',row:5,health:85,attack:10,defense:7,agility:9,mechanic:'apoio',tip:'Repara o aliado mais ferido. Mapa de Vínculos atinge redes de sustentação.'}
],
cases:[
{id:1,title:'Os créditos que sumiram',map:'chapter-1',expert:'musician',enemy:'attribution',source:'samba_iphan',
intro:'Lia prepara o festival quando os créditos começam a trocar de lugar. Sol reconhece arranjos que agora aparecem assinados apenas pela Ordem da Rasura.',
traces:[['Programa original','Documento ficcional','O programa anterior lista composição, interpretação, arranjo e produção. Há mais de uma pessoa responsável.'],['Lia, organizadora','Testemunho ficcional','Lia guardou o caderno dos ensaios. Ela quer reconhecer o trabalho da equipe antes de reabrir o palco.'],['Tradição viva','Informação documentada','O registro do Iphan contextualiza o samba de roda do Recôncavo Baiano como prática de comunidades. A ficha não identifica os autores do festival ficcional.']],
question:'Qual proposta repara os créditos sem inventar autoria?',options:['Conferir programa e caderno com a equipe; distinguir o festival da tradição documentada.','Atribuir toda a produção a quem tem mais seguidores.','Deixar só o nome do Forasteiro, que encontrou as pistas.'],correct:0,
explanation:'As funções da produção precisam de registros e confirmação das pessoas envolvidas. Uma referência cultural não autoriza apagar quem criou o trabalho local.',
restored:'O palco reabre com os nomes e as funções da equipe. Lia organiza uma escuta pública; Sol acrescenta uma ficha de versões ao programa.',
next:'Mara encontrou legendas trocadas no Museu das Memórias.',choice:['Publicar os créditos com revisão da equipe.','Guardar uma cópia exclusiva no Historiógrafo.']},
{id:2,title:'Uma legenda fora do lugar',map:'museum',expert:'curator',enemy:'chronology',source:'mali_met',
intro:'Mara não aceita reabrir uma exposição que mistura lugares e períodos. Davi percebe que uma legenda foi cortada para esconder sua procedência.',
traces:[['Ficha de procedência','Documento ficcional','O número da peça não coincide com a legenda afixada. O arquivo de revisão conserva a versão anterior.'],['Mara, curadora','Testemunho ficcional','Mara propõe conferir cada legenda com pesquisadores e visitantes. Uma vitrine não pode representar todo um continente.'],['Regiões e tempos','Informação documentada','Os registros já reunidos distinguem Mali e Songhai, na África Ocidental, e Kongo, na África Central. São contextos próprios, não nomes intercambiáveis.']],
question:'O que fazer com a legenda deslocada?',options:['Apagar toda informação para a parede parecer mais limpa.','Conferir procedência, região, data e fonte; registrar o que ainda é incerto.','Escolher a versão mais antiga e proibir qualquer revisão.'],correct:1,
explanation:'Conservação também exige contexto e revisão documentada. Resistir a uma falsificação deliberada não impede a pesquisa histórica de rever interpretações.',
restored:'As quatro galerias reabrem com retratos nas paredes, legendas alinhadas e um registro de correções acessível. Mara mantém perguntas em aberto.',
next:'Dra. Luma identificou nomes apagados no laboratório e na biblioteca.',choice:['Abrir as fichas e registrar as dúvidas.','Concentrar as cópias apenas no dispositivo.']},
{id:3,title:'A assinatura e a equipe',map:'chapter-3',expert:'scientist',enemy:'thief',source:'johnson_nasa',
intro:'A Ordem apresenta uma descoberta coletiva como obra de um único proprietário. Dra. Luma cruza cálculos e cadernos; Davi acompanha os registros de literatura.',
traces:[['Caderno de colaboração','Documento ficcional','O caderno registra Luma nos cálculos, Caio nos testes do protótipo e Luca nas anotações de cada tentativa. A cópia pública mantém só a primeira assinatura e apaga as duas outras contribuições.'],['Dra. Luma','Testemunho ficcional','A pesquisadora quer recompor as contribuições específicas de cada pessoa. Ela discorda de transformar trabalho em equipe numa lista sem contexto.'],['Katherine Johnson','Informação documentada','A biografia da NASA registra o trabalho matemático de Katherine Johnson. Compare a fonte com a pista já disponível no Arquivo; não atribua a uma pessoa todo um programa espacial.']],
question:'Qual conclusão os registros sustentam?',options:['Reconhecer contribuições específicas e a colaboração; manter fonte e contexto da atribuição.','Qualquer pessoa parecida com o retrato deve ter escrito os cálculos.','Quem guardou o caderno passa a ser dono da descoberta.'],correct:0,
explanation:'Uma atribuição envolve autoria e contribuições verificáveis. O testemunho da equipe ajuda a contextualizar o caderno; a biografia institucional informa sobre Johnson, não sobre a ficção local.',
restored:'O laboratório publica contribuições com funções e versões. A biblioteca abre uma roda de Carolina Maria de Jesus, com espaço para escrita dos estudantes.',
next:'Ravi precisa verificar uma edição que está circulando pela rede.',choice:['Compartilhar as fichas com a equipe e a biblioteca.','Usar os nomes recuperados como troféus privados.']},
{id:4,title:'O recorte que enganou',map:'chapter-4',expert:'journalist',enemy:'echo',source:'media_unesco',
intro:'Ravi recebeu uma imagem sem data; Bia encontrou a versão completa. A Ordem tenta fazer uma correção parecer censura e uma montagem parecer prova.',
traces:[['Aviso integral','Documento ficcional','O aviso completo tem data, local e autoria. O recorte que circula omite esses três elementos.'],['Bia, clube de estudantes','Testemunho ficcional','Bia encontrou a cópia completa com a escola. Ela pede que a correção preserve a privacidade das pessoas citadas.'],['Critérios de verificação','Interpretação fundamentada','Comparar origem, data e contexto ajuda a avaliar a mensagem. Um erro no recorte, sozinho, não prova intenção de enganar. A atuação da Ordem é uma descoberta da ficção.']],
question:'Como responder ao aviso recortado?',options:['Repassar o recorte e acrescentar um ponto de interrogação.','Expor dados pessoais de quem compartilhou.','Publicar a versão contextualizada, explicar a alteração e proteger as pessoas envolvidas.'],correct:2,
explanation:'Uma correção mostra o que foi verificado, com contexto, sem ampliar a exposição das pessoas. Origem e intenção não são a mesma pergunta.',
restored:'A redação passa a mostrar versões, critérios de correção e fontes. Ravi e Bia combinam um canal de resposta para a comunidade.',
next:'Jo e Tainá chamam uma assembleia para que os registros permaneçam acessíveis.',choice:['Abrir a correção para revisão e retorno da comunidade.','Apagar o histórico das versões para ninguém questionar.']},
{id:5,title:'Quem pode entrar no arquivo?',map:'chapter-5',expert:'resident',enemy:'censor',source:'school_unicef',
intro:'Jo percebe que a Ordem não apagou apenas documentos: fechou caminhos de participação. Tainá quer guardar histórias orais com consentimento e espaço para diferenças.',
traces:[['Ata da assembleia','Documento ficcional','Dora pediu uma reunião à noite; Luan, consulta depois da aula; Vitor, uma entrada com passagem livre. A ata preserva os três pedidos. A cópia da Ordem apagou essa parte e manteve só a decisão final.'],['Jo e os moradores','Testemunho ficcional','Moradores têm prioridades diferentes. Jo propõe horários, trajetos acessíveis e meios de participação para quem não consegue ir à reunião.'],['Vozes com contexto','Interpretação fundamentada','Um depoimento apresenta uma perspectiva situada. Guardá-lo exige contexto e consentimento; ele não representa sozinho todas as pessoas de um grupo.']],
question:'Qual plano amplia a participação?',options:['Deixar só o portador do dispositivo decidir o que fica.','Combinar acesso, consentimento, diferentes perspectivas e uma data de revisão.','Juntar todos os relatos numa única fala anônima e proibir discordâncias.'],correct:1,
explanation:'Acesso e participação precisam de condições concretas. Um arquivo plural não elimina responsabilidades, diferenças ou consentimento.',
restored:'A escola abre encontros, a assembleia preserva divergências e a praça recebe um ponto de consulta. Os projetos escolhidos no capítulo continuam sob revisão dos moradores.',
next:'A Ordem se fecha no Arquivo Central. Seu curador quer uma única versão para sempre.',choice:['Distribuir acesso e responsabilidades com consentimento.','Usar o poder do dispositivo para decidir por todos.']},
{id:6,title:'A versão única',map:'chapter-6',expert:'nia',enemy:'archivist',source:'ai_unesco',
intro:'O Curador da Versão Única tomou o BIAS.EXE como ferramenta. Ele promete um arquivo sem erros porque pretende apagar todas as pessoas que o questionam.',
traces:[['Histórico de alterações','Documento ficcional','A Ordem removeu autores e testemunhos enquanto escondia quem editava as fichas. O histórico técnico permite demonstrar a manipulação.'],['Conselho de revisão','Testemunho ficcional','Educadores, artistas, pesquisadores e moradores querem fontes abertas e responsabilidade pelas decisões. Não pretendem fechar a pesquisa em uma verdade final.'],['Limites do Historiógrafo','Experiência sobrenatural ficcional','O dispositivo reconhece que mostra fragmentos. Seus ecos não são documentos históricos nem dão ao portador autoridade sobre as experiências dos outros.']],
question:'O que distingue proteção da memória de controle absoluto?',options:['Guardar evidências, permitir revisão responsável e tornar visíveis critérios e limites.','Excluir pessoas que discordam para evitar contradições.','Preservar toda opressão porque uma linha do tempo precisa continuar correta.'],correct:0,
explanation:'Proteger memória é enfrentar falsificação e apagamento. Pesquisa pode rever interpretações. Nenhuma pessoa precisa manter sofrimento para proteger uma suposta linha do tempo perfeita.',
restored:'O arquivo volta a mostrar autoria, fontes e versões. A cidade decide como distribuir o conhecimento reunido.',
next:'O poder acumulado precisa de uma decisão pública.',choice:['Preparar um arquivo público com governança compartilhada.','Manter a chave do arquivo sob uma única pessoa.']}
],
sources:[
{id:'zangbeto_museum',name:'Château Vodou — Zangbeto',url:'https://www.chateau-vodou.com/zangbeto/',note:'Instituição museal: contexto e forma de estruturas cobertas de ráfia. Aventura e poderes de VOICES são ficcionais.'},
{id:'zangbeto_benin',name:'Governo do Benim — Zangbéto em Ouidah',url:'https://www.gouv.bj/article/2945/vodun-days-2025-zangbeto-demonstration-esplanade-fort-francais-lieu-charge-histoire/',note:'Contexto contemporâneo no Benim, associado à vigília noturna. Não se trata de uma divindade universal africana.'}
],
culture:'Zangbeto fazem parte de contextos culturais e espirituais vivos no Benim e em comunidades de países vizinhos, com histórias próprias. Estruturas cobertas de ráfia são associadas à vigília e à vida comunitária. Zambeto, Guardião da Vigília, é uma interpretação narrativa original de VOICES. O Historiógrafo, seus diálogos e poderes são ficcionais. O jogo não reproduz cantos, instruções rituais ou conhecimentos reservados. A música e os sons desta aventura são composições originais do jogo.',
atlas:{hub:[610,530],library:[380,280],park:[950,320],market:[970,630],garden:[850,900],beach:[1180,910],school:[380,830],museum:[240,510],'chapter-1':[650,180],'room-1':[640,80],'chapter-2':[130,350],'room-2':[100,210],'chapter-3':[940,130],'room-3':[1120,100],'chapter-4':[1120,490],'room-4':[1270,420],'chapter-5':[590,900],'room-5':[600,1040],'chapter-6':[130,800],'room-6':[100,970]}
};
for(const s of V.AdventureData.sources)if(!V.content.sources.some(x=>x.id===s.id))V.content.sources.push(s);
V.content.characters.zambeto={name:'Zambeto',role:'Guardião da Vigília · personagem ficcional',accent:'#d8b165',quote:'Uma memória precisa de quem a escute. E de espaço para outra voz.'};
V.content.characters.historiograph={name:'Historiógrafo Ancestral',role:'Dispositivo ficcional · vestígios e perguntas',accent:'#83cfbf',quote:'Mais um nome. Outra lembrança. Quanto ainda falta conhecer?'};
for(const [en,pt,example,examplePt]of [['trace','vestígio','A trace can lead to a question.','Um vestígio pode levar a uma pergunta.'],['testimony','testemunho','This testimony offers one perspective.','Este testemunho apresenta uma perspectiva.'],['authorship','autoria','We check authorship and context.','Conferimos autoria e contexto.'],['credit','crédito; reconhecimento da contribuição','The programme gives credit to the team.','O programa reconhece a contribuição da equipe.'],['uncertainty','incerteza','We explain uncertainty in the record.','Explicamos a incerteza no registro.'],['archive','arquivo','The archive preserves sources and versions.','O arquivo preserva fontes e versões.'],['guard','guardar; vigiar','We guard the records together.','Vigiamos os registros juntos.']])if(!V.content.glossary.some(w=>w.en===en))V.content.glossary.push({en,pt,example,examplePt});
const chapterDialogue = [
  {
    "intro": [
      [
        "The festival poster changed overnight. My name and Sol’s arrangements are gone. The Order signed everything as its own.",
        "O cartaz do festival mudou durante a noite. Meu nome e os arranjos de Sol desapareceram. A Ordem assinou tudo como se fosse seu."
      ],
      [
        "The programme still has the songs, but someone changed the credits. Let me compare it with the earlier copy.",
        "O programa ainda tem as canções, mas alguém mudou os créditos. Deixe-me comparar com a cópia anterior."
      ],
      [
        "Find the original programme and listen to Lia. The names belong to people who can explain their work.",
        "Encontre o programa original e escute Lia. Os nomes pertencem a pessoas que podem explicar seu trabalho."
      ]
    ],
    "resolution": [
      [
        "The stage is ready! Sol and I restored the names and roles in the programme. Our audience can now see who made each part.",
        "O palco está pronto! Sol e eu restauramos os nomes e as funções no programa. Agora o público pode ver quem fez cada parte."
      ],
      [
        "The music has its credits again. Mara found another alteration in the museum captions. Take your notes to her.",
        "A música recuperou seus créditos. Mara encontrou outra alteração nas legendas do museu. Leve suas anotações até ela."
      ]
    ],
    "proposals": [
      [
        "I want the new programme to show performers, composers and organisers. Compare the three records before we print it.",
        "Quero que o novo programa mostre intérpretes, compositores e organizadores. Compare os três registros antes de imprimirmos."
      ],
      [
        "I will check the production notes. Use the Historiograph to compare the programme with Lia’s account.",
        "Vou conferir as notas de produção. Use o Historiógrafo para comparar o programa com o relato de Lia."
      ]
    ],
    "revisit": [
      [
        "The missing credits are our priority. Have you checked the mural, the shop and the archive?",
        "Nossa prioridade são os créditos apagados. Você já conferiu o mural, a loja e o arquivo?"
      ],
      [
        "The controller needs repair before rehearsal. Collect the records and listen to both of us before using the terminal.",
        "O controlador precisa de conserto antes do ensaio. Reúna os registros e escute nós dois antes de usar o terminal."
      ]
    ],
    "after": [
      [
        "The programme now lists the whole team. I am keeping both versions so nobody can quietly erase those names again.",
        "Agora o programa lista toda a equipe. Estou guardando as duas versões para que ninguém apague esses nomes de novo sem deixar rastro."
      ],
      [
        "The rehearsal can begin. You can practise at the terminal again or explore the instruments in the gallery.",
        "O ensaio pode começar. Você pode treinar no terminal outra vez ou explorar os instrumentos da galeria."
      ]
    ]
  },
  {
    "intro": [
      [
        "These captions mix places and dates. Davi found a cut in the provenance card. I need to compare it before reopening the galleries.",
        "Estas legendas misturam lugares e datas. Davi encontrou um corte na ficha de procedência. Preciso compará-la antes de reabrir as galerias."
      ],
      [
        "A date alone cannot tell me where an object came from. I need its place, its record and the history of the collection.",
        "Uma data sozinha não me diz de onde veio um objeto. Preciso do lugar, do registro e da história da coleção."
      ],
      [
        "Keep the map beside the timeline. Ask Mara what the exhibition included and what the altered caption removed.",
        "Mantenha o mapa ao lado da linha do tempo. Pergunte a Mara o que a exposição incluía e o que a legenda alterada retirou."
      ]
    ],
    "resolution": [
      [
        "The four galleries are open again. Each portrait has a caption, and visitors can check what we corrected.",
        "As quatro galerias estão abertas novamente. Cada retrato tem uma legenda, e os visitantes podem conferir o que corrigimos."
      ],
      [
        "You connected places, dates and sources. Dr Luma found missing names in the laboratory records. She needs your comparison notes.",
        "Você conectou lugares, datas e fontes. A doutora Luma encontrou nomes apagados nos registros do laboratório. Ela precisa das suas anotações de comparação."
      ]
    ],
    "proposals": [
      [
        "I will put the region and period beside each caption. Help me compare the provenance card with the altered version.",
        "Vou colocar a região e o período ao lado de cada legenda. Ajude-me a comparar a ficha de procedência com a versão alterada."
      ],
      [
        "I will keep the documents available for visitors. Compare the map and the dates before arranging the timeline.",
        "Vou manter os documentos disponíveis para os visitantes. Compare o mapa e as datas antes de organizar a linha do tempo."
      ]
    ],
    "revisit": [
      [
        "The provenance card is the next step. It can show which place and period the shortened caption left out.",
        "O próximo passo é a ficha de procedência. Ela pode mostrar qual lugar e período a legenda abreviada deixou de fora."
      ],
      [
        "The regional panels and the optional abolition record are separate readings. Choose one, then check its source.",
        "Os painéis regionais e o registro opcional sobre abolição são leituras separadas. Escolha uma e depois confira sua fonte."
      ]
    ],
    "after": [
      [
        "The corrected captions are on the walls. I kept the earlier version in the archive so visitors can follow our review.",
        "As legendas corrigidas estão nas paredes. Guardei a versão anterior no arquivo para que os visitantes acompanhem nossa revisão."
      ],
      [
        "The timeline is ready for consultation. The library has more readings if you want to compare another part of this history.",
        "A linha do tempo está pronta para consulta. A biblioteca tem outras leituras se você quiser comparar mais uma parte desta história."
      ]
    ]
  },
  {
    "intro": [
      [
        "Two signatures disappeared from this laboratory notebook. The public copy now gives one person credit for the whole project.",
        "Duas assinaturas desapareceram deste caderno de laboratório. Agora a cópia pública dá a uma pessoa o crédito pelo projeto inteiro."
      ],
      [
        "There are calculations, drafts and different handwriting here. I want to find out how each person contributed.",
        "Há cálculos, rascunhos e letras diferentes aqui. Quero descobrir como cada pessoa contribuiu."
      ],
      [
        "Compare the notebook with Dr Luma’s account. A famous name cannot replace the work recorded by a team.",
        "Compare o caderno com o relato da doutora Luma. Um nome famoso não pode substituir o trabalho registrado por uma equipe."
      ]
    ],
    "resolution": [
      [
        "The laboratory record now shows each contribution and its source. Davi is opening a reading circle about Carolina Maria de Jesus.",
        "Agora o registro do laboratório mostra cada contribuição e sua fonte. Davi está abrindo uma roda de leitura sobre Carolina Maria de Jesus."
      ],
      [
        "The signatures are visible again. Ravi found an edited image spreading through the network. Take the comparison to his newsroom.",
        "As assinaturas estão visíveis novamente. Ravi encontrou uma imagem editada circulando pela rede. Leve a comparação até a redação dele."
      ]
    ],
    "proposals": [
      [
        "I will rebuild the list of contributions from the notebook. Check which conclusion each document actually supports.",
        "Vou reconstruir a lista de contribuições a partir do caderno. Confira qual conclusão cada documento realmente sustenta."
      ],
      [
        "I will compare the library cards with the institutional biographies. Use the whole folder to decide whose work is described.",
        "Vou comparar as fichas da biblioteca com as biografias institucionais. Use a pasta inteira para decidir de quem é o trabalho descrito."
      ]
    ],
    "revisit": [
      [
        "The notebook has three signatures. Compare all three summaries before assigning the work to anyone.",
        "O caderno tem três assinaturas. Compare os três resumos antes de atribuir o trabalho a alguém."
      ],
      [
        "A book, an engineering project and a flight calculation need different descriptions. Check the role on each card.",
        "Um livro, um projeto de engenharia e um cálculo de voo precisam de descrições diferentes. Confira a função em cada ficha."
      ]
    ],
    "after": [
      [
        "The revised notebook keeps the team’s names and roles together. We can explain who calculated, tested and reviewed the project.",
        "O caderno revisado mantém juntos os nomes e as funções da equipe. Podemos explicar quem calculou, testou e revisou o projeto."
      ],
      [
        "The corrected cards are available in the library. You can read about another writer or return to the authorship workshop.",
        "As fichas corrigidas estão disponíveis na biblioteca. Você pode ler sobre outra escritora ou voltar à oficina de autoria."
      ]
    ]
  },
  {
    "intro": [
      [
        "This image has no date or signature. Bia found the complete notice at school. Help us compare what the circulating version removed.",
        "Esta imagem não tem data nem assinatura. Bia encontrou o aviso completo na escola. Ajude-nos a comparar o que a versão em circulação retirou."
      ],
      [
        "I can store every copy, but storing is not understanding. Which version came first, and what changed?",
        "Posso guardar cada cópia, mas guardar não é compreender. Qual versão veio primeiro e o que mudou?"
      ],
      [
        "Start with the complete notice. Explain the missing context without exposing the people mentioned in it.",
        "Comece pelo aviso completo. Explique o contexto que falta sem expor as pessoas mencionadas nele."
      ]
    ],
    "resolution": [
      [
        "The correction now shows the original notice, the missing context and our sources. Bia and I opened a channel for replies.",
        "Agora a correção mostra o aviso original, o contexto que faltava e nossas fontes. Bia e eu abrimos um canal para respostas."
      ],
      [
        "The edited image can be checked against the original. Jo and Tainá are calling a community meeting about access to the records.",
        "A imagem editada pode ser conferida com o original. Jo e Tainá estão chamando uma reunião da comunidade sobre o acesso aos registros."
      ]
    ],
    "proposals": [
      [
        "I will publish the full notice beside the correction. Help me check its author, date and context before it goes out.",
        "Vou publicar o aviso completo ao lado da correção. Ajude-me a conferir autoria, data e contexto antes da publicação."
      ],
      [
        "I will take the corrected club rule back to the students. We need support for the excluded student and a fair admission rule.",
        "Vou levar a regra corrigida do clube de volta aos estudantes. Precisamos apoiar a estudante excluída e ter uma regra justa de admissão."
      ]
    ],
    "revisit": [
      [
        "Look at the date on the complete notice. The cropped image hid it, so the headline cannot be checked on its own.",
        "Veja a data no aviso completo. A imagem recortada a escondeu, por isso a manchete não pode ser conferida sozinha."
      ],
      [
        "The full notice is our comparison copy. Keep personal details out of the public correction.",
        "O aviso completo é nossa cópia de comparação. Mantenha os dados pessoais fora da correção pública."
      ]
    ],
    "after": [
      [
        "The correction is published with a visible review history. Readers can send a reply if they find another missing detail.",
        "A correção está publicada com um histórico de revisão visível. Os leitores podem enviar uma resposta se encontrarem outro detalhe que falta."
      ],
      [
        "The students have the revised rule. I kept the original notice so we can explain how the correction was made.",
        "Os estudantes estão com a regra revisada. Guardei o aviso original para podermos explicar como a correção foi feita."
      ]
    ]
  },
  {
    "intro": [
      [
        "The Order removed our requests for access from the meeting notes. Some neighbours cannot reach the archive or attend at these hours.",
        "A Ordem retirou nossos pedidos de acesso da ata. Alguns vizinhos não conseguem chegar ao arquivo ou participar nesses horários."
      ],
      [
        "If I keep the only key, I decide who can read. That would repeat the barrier we came here to remove.",
        "Se eu ficar com a única chave, decido quem pode ler. Isso repetiria a barreira que viemos remover."
      ],
      [
        "Listen to the different proposals. A working plan needs routes, times and ways for people to respond.",
        "Escute as propostas diferentes. Um plano que funcione precisa de trajetos, horários e meios para as pessoas responderem."
      ]
    ],
    "resolution": [
      [
        "The school is hosting meetings, and the square has a consultation point. We kept the different proposals and set a date to review the projects.",
        "A escola está recebendo reuniões, e a praça tem um ponto de consulta. Mantivemos as propostas diferentes e marcamos uma data para revisar os projetos."
      ],
      [
        "More people can reach the records now. The Order has retreated to the Central Archive, where its curator is locking away every other version.",
        "Agora mais pessoas conseguem acessar os registros. A Ordem recuou para o Arquivo Central, onde seu curador está trancando todas as outras versões."
      ]
    ],
    "proposals": [
      [
        "I want residents to choose the priorities and review the results. Compare their requests before spending the project budget.",
        "Quero que os moradores escolham as prioridades e revisem os resultados. Compare seus pedidos antes de gastar o orçamento do projeto."
      ],
      [
        "I will prepare the interview agreements. Ask each person what they allow us to record and publish.",
        "Vou preparar os acordos das entrevistas. Pergunte a cada pessoa o que ela nos permite registrar e publicar."
      ]
    ],
    "revisit": [
      [
        "Our proposals need to fit the budget. Check which barriers each project removes and who can use it.",
        "Nossas propostas precisam caber no orçamento. Confira quais barreiras cada projeto remove e quem pode utilizá-lo."
      ],
      [
        "Keep the interview agreement beside the recording. Permission to speak is not automatically permission to publish.",
        "Mantenha o acordo da entrevista ao lado da gravação. Permitir uma conversa não significa permitir automaticamente sua publicação."
      ]
    ],
    "after": [
      [
        "The consultation point is open. Residents will compare the results at the next meeting and can change the priorities.",
        "O ponto de consulta está aberto. Os moradores vão comparar os resultados na próxima reunião e podem mudar as prioridades."
      ],
      [
        "The approved stories are in the archive with their recording agreements. Each person can check how their contribution appears.",
        "As histórias autorizadas estão no arquivo com seus acordos de registro. Cada pessoa pode conferir como sua contribuição aparece."
      ]
    ]
  },
  {
    "intro": [
      [
        "The curator used BIAS.EXE to hide edits and remove anyone who questioned him. We need the alteration history to show what he changed.",
        "O curador usou o BIAS.EXE para esconder edições e retirar quem o questionasse. Precisamos do histórico de alterações para mostrar o que ele mudou."
      ],
      [
        "I have collected so many fragments. If I close the archive now, nobody will be able to question my version either.",
        "Reuni tantos fragmentos. Se eu fechar o arquivo agora, ninguém poderá questionar minha versão também."
      ],
      [
        "Keep the evidence available. The council needs to see the edits, hear the witnesses and decide how the archive will be cared for.",
        "Mantenha as evidências disponíveis. O conselho precisa ver as edições, escutar as testemunhas e decidir como o arquivo será cuidado."
      ]
    ],
    "resolution": [
      [
        "The names, sources and earlier versions are visible again. Now we must decide who keeps access and who reviews the next changes.",
        "Os nomes, as fontes e as versões anteriores estão visíveis novamente. Agora precisamos decidir quem mantém o acesso e quem revisa as próximas mudanças."
      ],
      [
        "The archive is open for a public decision. What you learned can become a shared resource if the people in these records can help govern it.",
        "O arquivo está aberto para uma decisão pública. O que você aprendeu pode se tornar um recurso compartilhado se as pessoas desses registros puderem ajudar a cuidar dele."
      ]
    ],
    "proposals": [
      [
        "I will publish the sources and the alteration log. Help me check which neighbourhoods the old collection left out.",
        "Vou publicar as fontes e o registro de alterações. Ajude-me a conferir quais bairros a coleção antiga deixou de fora."
      ],
      [
        "I will invite the people missing from the earlier review. We need a way to question the archive after today’s repair.",
        "Vou convidar as pessoas ausentes da revisão anterior. Precisamos de um meio de questionar o arquivo depois do reparo de hoje."
      ]
    ],
    "revisit": [
      [
        "The alteration history links each edit to a record. Compare it with the council’s account before confronting the curator.",
        "O histórico de alterações liga cada edição a um registro. Compare-o com o relato do conselho antes de confrontar o curador."
      ],
      [
        "Some voices were missing before the programme ran. Compare who was included with who can take part in the next review.",
        "Algumas vozes já estavam ausentes antes de o programa funcionar. Compare quem foi incluído com quem pode participar da próxima revisão."
      ]
    ],
    "after": [
      [
        "The alteration log is available for consultation. A new record can be added without deleting the source of the previous one.",
        "O registro de alterações está disponível para consulta. Um novo registro pode ser acrescentado sem apagar a fonte do anterior."
      ],
      [
        "The next review will include people who were missing before. You can keep exploring and bring another source to the council.",
        "A próxima revisão incluirá pessoas que antes estavam ausentes. Você pode continuar explorando e levar outra fonte ao conselho."
      ]
    ]
  }
];
const speak = (speaker,pair)=>({speaker,en:pair[0],pt:pair[1]});
for(const c of V.content.chapters){
const d=V.AdventureData.cases[c.id-1],text=chapterDialogue[c.id-1];
c.intro=text.intro.map((pair,i)=>speak([d.expert,'historiograph','zambeto'][i],pair));
c.resolution=text.resolution.map((pair,i)=>speak(i?'zambeto':d.expert,pair));
c.boss.tip=V.AdventureData.enemies.find(e=>e.id===d.enemy).tip;
c.boss.name=c.id===6?'Curador da Versão Única':c.id===1?'Usurpador de Créditos':c.id===2?'Rasura da Cronologia':c.id===3?'Usurpador de Autoria':c.id===4?'Eco do Recorte':'Barreira do Silêncio';
c.boss.logic=d.intro;
c.npcs.forEach((n,i)=>{
 n.lines.push(speak(n.character,text.proposals[i]));
 n.repeat=speak(n.character,text.revisit[i]);
 n.completedRepeat=speak(n.character,text.after[i]);
});
}
})();
