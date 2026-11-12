/* Registered module: fragment-data */
(function(init){if(window.VoicesModules)window.VoicesModules.define('fragment-data',init);else init();})(function(){
  'use strict';
  const V=window.V, map='fragment-forest';
  const skill=(id,name,target,power,cost,cooldown,spell,effect,description,turns=2)=>({
    id:'fragment-'+id,name,target,power,cost,cooldown,spell,effect,description,duration:turns,icon:spell%16,fx:null
  });
  const people=[
    ['dalva-escudo','Dalva','Tanque · Provocação','hub',{health:1.30,defense:1.24,attack:.70,agility:.77},[
      skill('baluarte','Baluarte de madeira','allies',14,13,3,6,'bulwark','Escuda o grupo e atrai os próximos ataques de alvo único por 2 turnos.'),
      skill('resposta','Resposta do escudo','ally',.32,9,2,9,'counter','O aliado devolve 32% do dano recebido por 2 turnos.')]],
    ['mae-celina','Celina','Cura · Regeneração','garden',{knowledge:1.22,focus:1.10,attack:.61,agility:.87},[
      skill('infusao','Infusão de folhas','ally',24,12,2,5,'cleanse','Remove condições negativas e recupera vida.'),
      skill('jardim','Jardim restaurador','allies',8,17,4,8,'renew','Cura imediatamente e regenera a equipe por 3 turnos.',3)]],
    ['joaquim-trilha','Joaquim','Dano · Veneno','park',{attack:1.22,agility:1.16,health:.73},[
      skill('flecha','Flecha de seiva','enemy',18,10,2,0,'poison','Fere e envenena por 3 turnos.',3),
      skill('mira','Disparo de precisão','enemy',30,14,3,12,'strikeMark','Causa dano concentrado e expõe a defesa do inimigo.')]],
    ['yara-centelha','Yara','Controle · Choque',map,{knowledge:1.24,agility:1.07,health:.75},[
      skill('centelha','Centelha de cobre','enemy',17,11,2,1,'shock','Eletrifica o alvo, reduz a agilidade e drena foco por 2 turnos.'),
      skill('pararraio','Para-raio','enemies',12,19,4,2,'stun','Causa dano em área e atordoa o alvo principal por 1 turno.',1)],'storm'],
    ['augusto-acervo','Augusto','Suporte · Resistência','library',{knowledge:1.18,resolve:1.32,attack:.60},[
      skill('folio','Fólio de proteção','allies',0,13,3,6,'ward','A equipe resiste a efeitos negativos por 2 turnos.'),
      skill('legenda','Legenda em voz alta','allies',.25,14,3,7,'chorus','Aumenta ataque e conhecimento da equipe em 25%.')]],
    ['brasa-oliveira','Brasa','Dano · Incêndio',map,{attack:1.19,knowledge:1.11,health:.70},[
      skill('labareda','Passo da labareda','enemy',20,11,2,4,'burn','Queima um alvo por 3 turnos e descongela alvos congelados.',3),
      skill('roda-fogo','Roda de brasas','enemies',14,19,4,4,'burn','Fere e incendeia o grupo inimigo por 2 turnos.')],'embers'],
    ['vicente-muralha','Vicente','Tanque · Guarda','market',{health:1.44,defense:1.32,agility:.65,attack:.76},[
      skill('muralha','Muralha de ombro','ally',25,11,2,6,'fortify','Protege um aliado com escudo e reduz o dano recebido.'),
      skill('carga-pedra','Carga de pedra','enemy',20,15,3,2,'stun','Impacto físico que impede uma ação do inimigo.',1)]],
    ['lina-nascente','Lina','Cura · Escudo',map,{focus:1.25,knowledge:1.19,agility:1.02,attack:.64},[
      skill('nascente','Água da nascente','ally',34,12,2,5,'heal','Recupera bastante vida de um aliado.'),
      skill('nevoa','Névoa de proteção','allies',11,17,3,6,'shieldAll','Escuda todos os aliados de pé por 2 turnos.')],'spring'],
    ['nilo-geada','Nilo','Controle · Congelamento',map,{knowledge:1.27,agility:.93,defense:1.06},[
      skill('geada','Geada de arquivo','enemy',15,12,3,3,'freeze','Congela o alvo por 1 turno. Uma labareda desfaz o gelo.',1),
      skill('inverno','Inverno curto','enemies',10,17,4,11,'slow','Causa dano em área e reduz a iniciativa inimiga.')],'frost'],
    ['sara-pegadas','Sara','Dano · Ruptura',map,{attack:1.30,health:.76,agility:1.20},[
      skill('lanca','Lança de travessia','enemy',26,11,2,12,'strike','Ataque físico concentrado em um alvo.'),
      skill('fenda','Abrir a fenda','enemy',18,13,3,14,'break','Desfaz o escudo e deixa o inimigo vulnerável.')],'hunt'],
    ['malik-tambor','Malik','Suporte · Agilidade','chapter-1',{focus:1.06,agility:1.14,attack:1.02},[
      skill('cadencia','Cadência compartilhada','allies',.26,12,3,13,'haste','Aumenta a agilidade da equipe na ordem da próxima rodada.'),
      skill('grave','Pulso grave','enemies',12,15,3,15,'strikeAll','Onda de conhecimento que atinge todos os inimigos.')]],
    ['raquel-fontes','Raquel','Suporte · Foco','museum',{knowledge:1.19,resolve:1.20,focus:1.16},[
      skill('pausa-nota','Pausa anotada','allies',13,12,3,15,'focusAll','Restaura foco dos aliados em pé.'),
      skill('fontes','Revisão de fontes','enemy',18,12,3,10,'weaken','Causa dano e reduz ataque e conhecimento inimigos.')]]
  ];
  const proposals=[
    ['Um caminho por vez','Ajude Dalva a liberar a passagem para o grupo.','Qual decisão protege quem vem depois?',['Retirar o obstáculo e sinalizar o trecho.','Fechar toda a passagem sem avisar.','Correr antes que chegue mais gente.'],0],
    ['A dose da terra','Celina está catalogando as plantas da horta.','Que registro preserva o que foi realmente observado?',['Supor o efeito das plantas pela cor.','Anotar local, data e condições de observação.','Apagar os casos diferentes.'],1],
    ['Marcas no barro','Joaquim quer distinguir trilhas de observações de fauna.','Como registrar as pegadas?',['Copiar o registro de outra trilha.','Identificar o animal sem comparar.','Registrar tamanho, direção e local para comparar.'],2],
    ['Depois do clarão','Yara estuda como os ecos elétricos percorrem o bosque.','Qual observação ajuda a reconstruir a sequência?',['Marcar onde e quando cada clarão surgiu.','Registrar só o último clarão.','Ignorar a distância entre os pontos.'],0],
    ['Ficha sem atalhos','Augusto encontrou uma folha sem número de entrada.','Como guardar essa folha?',['Inventar um número antigo.','Preservar a folha e anotar que a origem é incerta.','Reescrever a folha e descartar a original.'],1],
    ['O último calor','Brasa encontrou carvão perto de uma página.','O que é seguro concluir?',['Que sabemos quem acendeu a fogueira.','Que toda a página foi escrita no mesmo dia.','Que os vestígios ainda precisam ser comparados.'],2],
    ['Levar junto','Vicente precisa transportar um caixote de registros.','Qual plano divide o trabalho?',['Combinar a rota e distribuir o peso entre a equipe.','Pedir que só a pessoa mais rápida leve tudo.','Usar os documentos para calçar o caixote.'],0],
    ['Água no caminho','Lina encontrou um caderno úmido perto da nascente.','Como preservar o que ainda dá para ler?',['Forçar as folhas a abrir.','Isolar o caderno e registrar onde foi encontrado.','Colocar o caderno em outra margem sem avisar.'],1],
    ['Uma marca de gelo','Nilo quer comparar sinais de duas noites.','O que permite comparar os registros?',['Escolher a folha mais bonita.','Usar a anotação mais antiga como verdade única.','Anotar horário, lugar e condições em ambas.'],2],
    ['Rastro ou suposição','Sara precisa localizar a origem de um ruído.','Qual relato separa observação de hipótese?',['Descrever o ruído e indicar o que ainda é hipótese.','Atribuir o ruído ao primeiro inimigo conhecido.','Apagar os registros que discordam.'],0],
    ['O ritmo de todos','Malik quer que a roda inteira consiga acompanhar.','Como começar o ensaio?',['Trocar o pulso sem avisar.','Combinar um pulso comum e testar com a roda.','Deixar só a pessoa mais rápida tocar.'],1],
    ['Dois registros','Raquel encontrou versões diferentes do mesmo episódio.','Como apresentar as duas?',['Escolher a versão mais longa.','Unir tudo em uma voz anônima.','Identificar quem registrou cada versão e seu contexto.'],2]
  ];
  people.forEach(([id,name,role,place,stats,skills,unlock],index)=>{
    V.content.characters[id]={name,role,accent:['#91d3ad','#cfabd6','#f2bc7f','#91caee'][index%4]};
    V.TeamData.kits[id]={role,icon:skills[0].icon,stats,skills,fragmentArt:index};
    const [title,brief,question,answers,right]=proposals[index];
    V.TeamData.recruits.push({id,map:place,title,brief,question,answers,right,unlock,
      feedback:name+' vai ajudar na próxima expedição. Abra a equipe para escolher sua vaga.'});
  });
  const conditions={
    poison:['Envenenado',0,'Perde vida ao fim de cada turno.'],shock:['Eletrificado',1,'Perde foco e agilidade.'],
    stun:['Atordoado',2,'Perde a próxima ação.'],freeze:['Congelado',3,'Perde a próxima ação. Fogo derrete o gelo.'],
    burn:['Em chamas',4,'Perde vida a cada turno e tem o ataque reduzido.'],renew:['Regeneração',8,'Recupera vida ao fim do turno.'],
    ward:['Proteção de status',6,'Resiste a condições negativas.'],
    fortify:['Fortificação',6,'Reduz o dano recebido.'],taunt:['Provocação',6,'Atrai ataques inimigos de alvo único.'],
    counter:['Contra-ataque',9,'Devolve parte do dano recebido.'],weak:['Enfraquecido',10,'Causa menos dano.'],
    haste:['Agilidade aumentada',13,'Age mais cedo na próxima rodada.'],slow:['Lentidão',11,'Age mais tarde na próxima rodada.']
  };
  const masks={
    default:['Ancestral','Vigília','Começa com +8 de ressonância.'],
    plumagem:['Plumagem','Passo leve','+20% de agilidade.'],
    'coroa-solar':['Coroa solar','Brasas da memória','+15% de dano e imunidade a queimadura.'],
    totem:['Totem','Raízes firmes','+20% de defesa e um escudo inicial de 12.'],
    'sol-e-lua':['Sol e lua','Ritmo duplo','+4 de foco regenerado por turno.'],
    felino:['Felino','Bote inicial','+22% de ataque físico no primeiro turno e +8% depois.'],
    leque:['Leque','Vento protetor','+30% de força dos escudos gerados pelo portador.'],
    chifres:['Chifres','Firmeza','+18% de vida máxima e imunidade a atordoamento.'],
    hibisco:['Hibisco','Cuidado que floresce','+25% de cura feita pelo portador.'],
    mosaico:['Mosaico','Fontes entrelaçadas','+18% de conhecimento e imunidade a confusão.'],
    caveira:['Caveira','Memória resistente','Imunidade a veneno e resistência de 25% a dano contínuo.']
  };
  const spirits=[
    {id:'raiz',name:'Rugido de Raiz',art:0,unlock:'first',spell:14,effect:'bulwark',target:'allies',power:13,cost:1,description:'Escuda a equipe e atrai ataques para quem chama.'},
    {id:'riacho',name:'Lontra do Riacho',art:1,unlock:'spring',spell:5,effect:'cleanseAll',target:'allies',power:16,cost:1,description:'Limpa condições negativas e cura os aliados.'},
    {id:'faisca',name:'Pássaro Faísca',art:2,unlock:'storm',spell:1,effect:'shock',target:'enemies',power:11,cost:1,description:'Eletrifica todos os inimigos.'},
    {id:'fagulha',name:'Raposa Fagulha',art:3,unlock:'embers',spell:4,effect:'burn',target:'enemies',power:13,cost:1,description:'Incendeia o grupo inimigo por 2 turnos.'},
    {id:'musgo',name:'Casco de Musgo',art:4,unlock:'care',spell:6,effect:'wardShield',target:'allies',power:14,cost:1,description:'Protege contra condições negativas e concede escudo.'},
    {id:'lamparina',name:'Mariposa Lamparina',art:5,unlock:'archive',spell:15,effect:'focusAll',target:'allies',power:18,cost:1,description:'Restaura o foco da equipe.'}
  ].map(s=>({...s,id:'fragment-spirit-'+s.id,duration:2}));
  const enemy=(id,name,art,health,attack,defense,agility,move,spell,tip)=>
    ({id,name,art,health,attack,defense,agility,move,spell,tip});
  const enemies={
    wolf:enemy('wolf','Lobo de Tinta',6,67,18,9,19,'poison',0,'O lobo deixa veneno. Leve alguém que possa limpar condições.'),
    beetle:enemy('beetle','Besouro de Espinhos',7,92,17,18,9,'barrier',6,'O besouro ergue um escudo. Ruptura abre uma janela para atacar.'),
    lantern:enemy('lantern','Lamparina Oca',8,62,19,8,14,'burn',4,'A chama da lamparina continua causando dano após o impacto.'),
    clock:enemy('clock','Relógio Partido',9,92,21,13,12,'stun',2,'O relógio anuncia um golpe de atordoamento. Use proteção no alvo indicado.'),
    heron:enemy('heron','Garça da Geada',10,79,18,10,20,'freeze',3,'A garça congela o alvo. Cura com limpeza ajuda a recuperar a vez.'),
    archivist:enemy('archivist','Arquivista Vazio',11,182,24,15,13,'shock',1,'Na segunda fase, o arquivista espalha ondas elétricas pelo grupo.')
  };
  const encounters=[
    ['pegadas','Pegadas de tinta',['wolf'],'hunt',30,1],['casca','Casca que se move',['beetle'],'care',35,1],
    ['chama','Chama sem sombra',['lantern'],'embers',35,1],['tempo','Pêndulo na trilha',['clock','wolf'],'storm',60,2],
    ['geada','Clareira congelada',['heron','beetle'],'frost',65,2],['rastro','Patrulha da rasura',['wolf','lantern','clock'],'hunt',75,3],
    ['coro','Ruínas do coro',['lantern','heron','beetle'],'embers',78,3],['arquivo','O Arquivista Vazio',['archivist','heron'],'archive',130,4]
  ].map(([id,title,foes,mark,xp,shards])=>({id,title,foes,mark,xp,shards}));
  const stories=[
    ['nascente','O caderno da nascente','Uma folha úmida prende-se numa pedra. Ainda dá para ler a data.',
      [['Secar à sombra e registrar o local','Lina consegue reconstruir o caminho da folha.','spring',30,1],['Deixar um aviso para o próximo grupo','A equipe marca a margem para proteger o achado.','care',20,1],['Investigar o brilho na água','Uma garça de gelo surge na margem.','geada']]],
    ['marcas','Os nomes da ponte','Um aviso recente cobre uma placa antiga com nomes da comunidade.',
      [['Registrar as duas camadas','As duas versões entram no caderno com suas datas.','archive',35,1],['Pedir ajuda na clareira','A equipe guarda o local e prepara uma leitura em grupo.','care',20,1],['Seguir as pegadas atrás da placa','As manchas de tinta ganham forma.','pegadas']]],
    ['brasas','A fogueira apagada','As brasas estão frias, mas uma luz se move entre as pedras.',
      [['Comparar o carvão com a página','A comparação revela que os materiais chegaram em momentos diferentes.','embers',28,1],['Cobrir a área e seguir','Vocês preservam os vestígios para outra visita.','care',15,1],['Seguir a luz laranja','Uma lamparina oca atravessa a trilha.','chama']]],
    ['vento','Uma gravação entre as folhas','Uma fita presa no galho tem duas vozes e um trecho difícil de ouvir.',
      [['Anotar a dúvida junto ao trecho','A equipe registra a parte audível e guarda a dúvida.','archive',30,1],['Reconstituir a ordem dos sons','O ruído do metal revela a direção do vento.','storm',25,1],['Procurar o som mais forte','O pêndulo de um relógio bate nas raízes.','tempo']]],
    ['bicho','O caminho do besouro','As cascas no chão parecem ter sido movidas de propósito.',
      [['Desviar e sinalizar a passagem','O caminho fica aberto sem deslocar o abrigo.','care',28,1],['Desenhar o rastro','Sara encontra um padrão nas marcas sem tocar no abrigo.','hunt',25,1],['Chegar mais perto da carapaça','A carapaça responde ao movimento.','casca']]],
    ['frio','Cartas sob o gelo','O gelo prende uma carta ao chão da clareira.',
      [['Registrar sem arrancar a carta','Nilo desenha a posição e a camada de gelo.','frost',34,1],['Proteger o local e anotar a rota','A próxima equipe poderá voltar com os materiais.','care',22,1],['Atravessar para ver o outro lado','A garça observa do outro lado da ruína.','geada']]],
    ['cobre','O clarão de cobre','Uma haste antiga estala ao lado de uma caixa de fichas.',
      [['Observar de longe e marcar os clarões','A sequência dos clarões ajuda Yara a comparar as fichas.','storm',34,1],['Recolher as fichas fora do alcance','O grupo registra o que conseguiu encontrar.','archive',22,1],['Seguir os estalos pela trilha','O eco desperta uma patrulha de rasuras.','rastro']]],
    ['vozes','A parede de vozes','A ruína repete duas versões da mesma frase, com palavras que faltam.',
      [['Identificar as duas vozes','Cada voz recebe espaço no caderno.','archive',36,1],['Marcar as lacunas para outra visita','O grupo preserva as palavras que conseguiu ouvir.','care',24,1],['Acompanhar o coro até a clareira','As vozes ganham forma entre as pedras.','coro']]],
    ['semente','O banco de sementes','Um recipiente de sementes carrega a etiqueta de um antigo viveiro.',
      [['Registrar a etiqueta antes de mover','O registro preserva o vínculo com o viveiro.','care',30,1],['Procurar a procedência na trilha','A caixa ao lado explica de onde veio a coleta.','spring',27,1],['Abrir a caixa escura','Um besouro de tinta protege a caixa.','casca']]]
  ].map(([id,title,body,choices])=>({id,title,body,choices}));
  V.FragmentData={map,people,conditions,masks,spirits,enemies,encounters,stories};
});
