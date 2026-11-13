/* Registered module: team-data */
(function(initialize){if(window.VoicesModules)window.VoicesModules.define('team-data',initialize);else initialize();})(function(){
  'use strict';
  const skill=(id,name,effect,target,power,cost,cooldown,duration,icon,fx,description)=>
    ({id:'team-'+id,name,effect,target,power,cost,cooldown,duration,icon,fx,description});
  const kit=(role,icon,stats,skills)=>({role,icon,stats,skills});
  const strike=(id,name,power,description)=>skill(id,name,'strike','enemy',power,9,2,1,0,0,description);
  const support=(id,name,power,description)=>skill(id,name,'heal','ally',power,12,2,1,2,2,description);
  const guard=(id,name,power,description)=>skill(id,name,'shield','ally',power,12,2,2,1,1,description);
  const delay=(id,name,power,description)=>skill(id,name,'delay','enemy',power,10,2,2,4,3,description);
  const mark=(id,name,description)=>skill(id,name,'mark','enemy',0,7,2,3,3,3,description);
  const kits={
    nia:kit('Investigação',3,{},[
      mark('nia-evidence','Olhar de perto','Revela o plano e expõe uma fraqueza por 3 turnos.'),
      skill('nia-thread','Fio da memória','link','enemy',12,13,3,2,6,3,'Causa dano de conhecimento e vincula os inimigos por 2 turnos.')
    ]),
    leo:kit('Atacante',0,{attack:1.10,agility:1.15,health:.75,knowledge:.70},[
      strike('leo-step','Passo incisivo',21,'Causa dano físico concentrado em um inimigo.'),
      skill('leo-feint','Mudança de passo','strikeMark','enemy',12,11,3,2,9,0,'Causa dano físico e expõe o inimigo por 2 turnos.')
    ]),
    sol:kit('Proteção',1,{health:1.06,defense:1.15,attack:.73,knowledge:.83,agility:.80},[
      guard('sol-shield','Abrigo de luz',24,'Concede um escudo a um aliado por 2 turnos.'),
      skill('sol-circle','Círculo de vigília','shieldAll','allies',12,17,4,2,8,1,'Concede um escudo leve a cada aliado de pé por 2 turnos.')
    ]),
    taina:kit('Apoio',2,{knowledge:1.02,attack:.76,agility:.95},[
      support('taina-breath','Pausa para respirar',24,'Recupera vida de um aliado de pé.'),
      skill('taina-signal','Sinal de confiança','chorus','allies',.16,12,3,2,6,2,'Aumenta ataque e conhecimento da equipe por 2 turnos.')
    ]),
    iris:kit('Investigação',3,{},[
      mark('iris-panel','Quadro a quadro','Revela a intenção e expõe uma fraqueza por 3 turnos.'),
      skill('iris-storyboard','Sequência ilustrada','link','enemy',12,13,3,2,6,3,'Causa dano de conhecimento e vincula os inimigos por 2 turnos.')
    ]),
    joca:kit('Apoio',5,{},[
      support('joca-side-b','Lado B',24,'Recupera vida de um aliado.'),
      skill('joca-sample','Batida compartilhada','chorus','allies',.16,12,3,2,5,0,'Aumenta ataque e conhecimento da equipe por 2 turnos.')
    ]),
    malu:kit('Controle',7,{},[
      mark('malu-listen','Escuta de campo','Revela a intenção e expõe uma fraqueza por 3 turnos.'),
      delay('malu-loop','Som em repetição',14,'Causa dano de conhecimento e reduz a agilidade do alvo por 2 turnos.')
    ]),
    luiza:kit('Investigação',3,{},[
      mark('luiza-question','Pergunta ao vivo','Revela a intenção e expõe uma fraqueza por 3 turnos.'),
      skill('luiza-report','Reportagem de campo','knowledgeStrike','enemy',21,11,2,1,11,3,'Concentra dano de conhecimento em um inimigo.')
    ]),
    breno:kit('Proteção',1,{},[
      guard('breno-brace','Reforço da oficina',24,'Concede um escudo a um aliado por 2 turnos.'),
      skill('breno-repair','Conserto de campo','cleanse','ally',17,10,2,1,10,2,'Remove efeitos negativos e recupera vida de um aliado.')
    ]),
    caue:kit('Atacante',0,{},[
      strike('caue-cut','Corte de cena',21,'Causa dano físico concentrado em um inimigo.'),
      skill('caue-credits','Créditos em destaque','credit','enemy',14,13,3,2,13,3,'Causa dano, reduz o ataque do inimigo e remove seu acúmulo de poder.')
    ]),
    ayla:kit('Proteção',8,{},[
      guard('ayla-watch','Vigília em grupo',24,'Concede um escudo a um aliado por 2 turnos.'),
      skill('ayla-constellation','Constelação de histórias','seal','allies',0,15,4,2,7,3,'Protege a equipe contra confusão, corrupção e obscurecimento por 2 turnos.')
    ]),
    tadeu:kit('Apoio',6,{},[
      support('tadeu-verse','Verso de resposta',24,'Recupera vida de um aliado.'),
      skill('tadeu-chorus','Refrão coletivo','chorus','allies',.16,12,3,2,6,2,'Aumenta ataque e conhecimento da equipe por 2 turnos.')
    ]),
    davia:kit('Apoio',8,{},[
      support('davia-color','Cores da roda',24,'Recupera vida de um aliado.'),
      skill('davia-poster','Cartaz coletivo','chorus','allies',.16,12,3,2,6,2,'Aumenta ataque e conhecimento da equipe por 2 turnos.')
    ]),
    librarian:kit('Controle',7,{knowledge:1.12,attack:.66,agility:.84},[
      delay('library-margin','Nota à margem',12,'Causa dano de conhecimento e reduz a agilidade do alvo por 2 turnos.'),
      skill('library-source','Fonte rastreada','seal','allies',0,15,4,2,7,3,'Protege a equipe contra confusão, corrupção e obscurecimento por 2 turnos.')
    ]),
    cora:kit('Atacante',5,{attack:1.04,agility:1.15,health:.77,knowledge:.82},[
      strike('cora-beat','Pulso de tambor',23,'Aplica um golpe físico no ritmo do ensaio.'),
      skill('cora-chorus','Chamada da roda','chorus','allies',.20,15,4,2,5,0,'Aumenta ataque e conhecimento dos aliados por 2 turnos.')
    ]),
    bento:kit('Controle',7,{knowledge:1.13,attack:.65,defense:.93,agility:.88},[
      delay('bento-time','Sequência dos fatos',16,'Causa dano de conhecimento e atrasa o alvo por 2 turnos.'),
      skill('bento-archive','Registro cotejado','break','enemy',13,15,3,2,7,3,'Desfaz o escudo inimigo e deixa o alvo vulnerável.')
    ]),
    ines:kit('Atacante',11,{knowledge:1.22,attack:.74,health:.72,agility:.97},[
      skill('ines-test','Hipótese testada','knowledgeStrike','enemy',23,11,2,1,11,3,'Concentra dano de conhecimento em um inimigo.'),
      skill('ines-repeat','Segunda medição','strikeAll','enemies',9,17,4,1,9,3,'Aplica dano de conhecimento em todos os inimigos.')
    ]),
    luzia:kit('Apoio',6,{knowledge:1.06,attack:.68,defense:.97,agility:.87},[
      support('luzia-listen','Escuta atenta',27,'Recupera vida de um aliado de pé.'),
      skill('luzia-assembly','Roda de cuidado','healAll','allies',11,19,4,1,12,2,'Recupera um pouco da vida de toda a equipe de pé.')
    ]),
    denis:kit('Controle',7,{knowledge:1.10,attack:.73,agility:1.03},[
      mark('denis-index','Índice cruzado','Revela a intenção e expõe uma fraqueza do inimigo por 3 turnos.'),
      skill('denis-provenance','Proveniência em rede','link','enemy',18,16,3,2,7,3,'Causa dano de conhecimento e vincula os inimigos por 2 turnos.')
    ]),
    dandara:kit('Proteção',10,{health:.98,defense:1.12,attack:.76,knowledge:.87,agility:.96},[
      guard('dandara-knit','Trama reforçada',26,'Protege um aliado com um escudo por 2 turnos.'),
      skill('dandara-patch','Remendo protetor','cleanse','ally',17,10,2,1,10,2,'Remove confusão, corrupção, obscurecimento e atraso e recupera vida.')
    ]),
    jaci:kit('Apoio',8,{knowledge:1.12,attack:.67,health:.83,agility:.92},[
      skill('jaci-pause','Pausa de escuta','cleanse','ally',24,11,2,1,8,2,'Remove efeitos negativos e recupera parte da vida de um aliado.'),
      skill('jaci-lantern','Memória acesa','seal','allies',0,14,4,3,8,1,'Protege os aliados contra confusão, corrupção e obscurecimento por 3 turnos.')
    ]),
    jamila:kit('Atacante',0,{attack:1.10,health:.82,knowledge:.81,agility:1.07},[
      strike('jamila-cut','Corte preciso',20,'Concentra dano físico em um inimigo.'),
      skill('jamila-credit','Autoria em destaque','credit','enemy',14,13,3,2,13,3,'Remove o acúmulo de poder, reduz o ataque do inimigo e causa dano.')
    ])
  };
  const mission=(id,map,title,brief,question,answers,right,feedback)=>({id,map,title,brief,question,answers,right,feedback});
  const recruits=[
    mission('jaci','museum','Uma legenda que escuta','Jaci quer preparar uma legenda para o museu e separar aquilo que a comunidade autorizou a tornar público.','Qual versão pode ir para a vitrine?',['O depoimento inteiro, com todas as informações pessoais.','A passagem revisada e autorizada pela pessoa entrevistada.','Uma frase inventada para representar todos os moradores.'],1,'O consentimento preserva a autoria e permite que cada pessoa escolha o que quer compartilhar.'),
    mission('dandara','market','De quem é esta trama?','Na feira, Dandara recebeu uma peça nova para a mostra e quer creditar quem criou o tecido.','O que ajuda a montar uma etiqueta confiável?',['Registrar quem fez, os materiais e o que a artesã contou.','Inferir a origem só pela cor da estampa.','Colocar o nome da loja como autora da peça.'],0,'A autoria e a descrição do processo situam a peça sem transformar uma impressão visual em fato.'),
    mission('cora','chapter-1','O ensaio compartilhado','Cora está organizando um ensaio no Distrito do Ritmo e quer que todo o grupo consiga entrar no mesmo pulso.','Como você organizaria a primeira passada?',['Aumentar a velocidade a cada erro.','Deixar cada pessoa entrar sem referência.','Marcar um pulso comum e combinar o sinal de entrada.'],2,'Um pulso comum deixa espaço para cada instrumento responder dentro da mesma roda.'),
    mission('bento','chapter-2','Uma caixa, duas datas','Duas etiquetas dão datas diferentes para uma fotografia. Bento quer identificar o que cada registro realmente informa.','Como organizar as datas?',['Escolher a mais antiga porque parece mais valiosa.','Comparar as fontes e distinguir a data da imagem da data do registro.','Apagar ambas as datas e fechar a ficha.'],1,'Uma fotografia e sua entrada em um catálogo podem ter datas diferentes. As duas merecem contexto.'),
    mission('ines','chapter-3','Medir de novo','Inês mediu duas vezes a mesma amostra e obteve resultados diferentes. Ajude a planejar uma terceira observação.','Qual procedimento torna os resultados comparáveis?',['Mudar o instrumento e a unidade ao mesmo tempo.','Anotar apenas o maior número.','Repetir nas mesmas condições e registrar todas as medições.'],2,'Repetir o procedimento nas mesmas condições ajuda a identificar a variação entre as medidas.'),
    mission('luzia','chapter-5','Lugar na roda','Luzia prepara uma assembleia com moradores que preferem falar, escrever ou ouvir antes de participar.','Como acolher mais contribuições?',['Reservar turnos de fala e disponibilizar contribuições escritas.','Aceitar apenas quem fala primeiro.','Pedir a uma pessoa que decida pelo grupo inteiro.'],0,'Turnos e registros escritos criam mais maneiras de participar da mesma decisão.'),
    mission('jamila','chapter-5','Crédito na mostra','Jamila está montando uma exposição comunitária. O cartaz precisa distinguir quem desenhou, costurou e autorizou cada peça.','Qual legenda valoriza o trabalho da equipe?',['Usar apenas o nome da mostra.','Creditar as contribuições e pedir a revisão das pessoas envolvidas.','Dar todo o crédito à primeira pessoa que entregou a peça.'],1,'Registrar contribuições específicas torna o trabalho coletivo visível.'),
    mission('denis','chapter-6','O caminho do arquivo','Denis encontrou uma cópia com uma anotação nova. Ele quer ligar a cópia ao registro preservado e à história da anotação.','O que deve ficar junto à cópia?',['Apenas a anotação mais recente.','Uma nova data estimada de criação.','A referência ao original, a data da cópia e a autoria da anotação, se confirmada.'],2,'A proveniência ajuda a acompanhar o percurso de um documento e as mudanças que ele recebeu.')
  ];
  window.V.TeamData={kits,recruits};
});
