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
traces:[['Caderno de colaboração','Documento ficcional','Três assinaturas e funções diferentes aparecem no caderno do laboratório. A cópia pública suprimiu duas delas.'],['Dra. Luma','Testemunho ficcional','A pesquisadora quer recompor as contribuições específicas de cada pessoa. Ela discorda de transformar trabalho em equipe numa lista sem contexto.'],['Katherine Johnson','Informação documentada','A biografia da NASA registra o trabalho matemático de Katherine Johnson. Compare a fonte com a pista já disponível no Arquivo; não atribua a uma pessoa todo um programa espacial.']],
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
traces:[['Ata da assembleia','Documento ficcional','A ata reúne propostas, divergências e responsáveis pela revisão. Uma cópia da Ordem removeu os pedidos de acesso.'],['Jo e os moradores','Testemunho ficcional','Moradores têm prioridades diferentes. Jo propõe horários, trajetos acessíveis e meios de participação para quem não consegue ir à reunião.'],['Vozes com contexto','Interpretação fundamentada','Um depoimento apresenta uma perspectiva situada. Guardá-lo exige contexto e consentimento; ele não representa sozinho todas as pessoas de um grupo.']],
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
for(const c of V.content.chapters){
const d=V.AdventureData.cases[c.id-1];
c.intro=[{speaker:d.expert,en:'Whose story is missing?',pt:d.intro},{speaker:'historiograph',en:c.id<4?'Another name. Another memory. I want to know more.':'If I kept every record, could I decide every story?',pt:c.id<4?'Outro nome. Mais uma memória. Quero conhecer mais. Ainda há tanto que não alcanço.':'Se eu guardasse todos os registros, poderia decidir todas as histórias? O poder reunido parece pedir uma chave só.'},{speaker:'zambeto',en:'A trace is a beginning, not the whole story.',pt:c.id<4?'Um vestígio é um começo. Escute quem trabalha aqui antes de concluir.':'Saber não dá posse sobre a vida dos outros. Um vestígio é um começo; escute quem trabalha aqui antes de concluir.'}];
c.resolution=[{speaker:d.expert,en:'We restored the records together.',pt:d.restored},{speaker:'zambeto',en:'Knowledge grows when it can be questioned.',pt:'Saber cresce quando pode ser questionado. '+d.next}];
c.boss.tip=V.AdventureData.enemies.find(e=>e.id===d.enemy).tip;
c.boss.name=c.id===6?'Curador da Versão Única':c.id===1?'Usurpador de Créditos':c.id===2?'Rasura da Cronologia':c.id===3?'Usurpador de Autoria':c.id===4?'Eco do Recorte':'Barreira do Silêncio';
c.boss.logic=d.intro;
c.npcs.forEach((n,i)=>n.lines.push({speaker:n.character,en:i?'Let’s compare the sources.':'I have questions of my own.',pt:i?'Vou conferir o que estes registros sustentam. Você pode revisar as fontes no Historiógrafo.':'Tenho uma proposta para reparar o problema deste lugar. A investigação precisa também de quem vive e trabalha aqui.'}));
}
})();
