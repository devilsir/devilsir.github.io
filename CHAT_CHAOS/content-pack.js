// CHAT CHAOS v0.4 — expanded classroom slang/content pack
const EXTRA_SLANGS = [
  {
    "term": "FYP",
    "meaning": "For You Page — a página 'Para Você' de plataformas como TikTok, onde conteúdos são recomendados pelo algoritmo.",
    "example": "This video showed up on my FYP.",
    "tag": "social"
  },
  {
    "term": "trend",
    "meaning": "Tendência — formato, áudio, meme, desafio ou comportamento que está popular no momento.",
    "example": "Everyone is doing this trend this week.",
    "tag": "social"
  },
  {
    "term": "viral",
    "meaning": "Viral — conteúdo que se espalha muito rapidamente e alcança muita gente.",
    "example": "Her video went viral overnight.",
    "tag": "social"
  },
  {
    "term": "it’s giving…",
    "meaning": "Expressão usada para dizer que algo transmite a vibe, energia ou aparência de outra coisa.",
    "example": "That outfit is giving main character energy.",
    "tag": "social"
  },
  {
    "term": "ate",
    "meaning": "Gíria de elogio: a pessoa fez algo muito bem, arrasou. Frequentemente aparece como “you ate”.",
    "example": "You ate that presentation!",
    "tag": "social"
  },
  {
    "term": "slay",
    "meaning": "Arrasar / mandar muito bem; elogio a uma performance, visual ou atitude.",
    "example": "That look? Slay.",
    "tag": "social"
  },
  {
    "term": "DM",
    "meaning": "Direct Message — mensagem privada enviada diretamente para alguém.",
    "example": "DM me the link later.",
    "tag": "chat"
  },
  {
    "term": "story",
    "meaning": "Post temporário, normalmente disponível por tempo limitado em redes sociais.",
    "example": "I posted the photo on my story.",
    "tag": "social"
  },
  {
    "term": "mutuals",
    "meaning": "Pessoas que se seguem mutuamente / seguidores em comum, dependendo da plataforma.",
    "example": "We’ve been mutuals for two years.",
    "tag": "social"
  },
  {
    "term": "close friends",
    "meaning": "Grupo restrito de pessoas escolhido para ver stories ou conteúdos mais privados.",
    "example": "I only posted it to close friends.",
    "tag": "social"
  },
  {
    "term": "soft launch",
    "meaning": "Revelar uma relação, projeto ou novidade de forma sutil, sem anunciar tudo explicitamente.",
    "example": "She soft launched her new relationship with a photo of two coffees.",
    "tag": "social"
  },
  {
    "term": "hard launch",
    "meaning": "Revelar uma relação, projeto ou novidade de forma clara e explícita.",
    "example": "They hard launched the relationship with a couple photo.",
    "tag": "social"
  },
  {
    "term": "server",
    "meaning": "Servidor — espaço/comunidade organizada em plataformas como Discord.",
    "example": "Join our class server after school.",
    "tag": "chat"
  },
  {
    "term": "VC",
    "meaning": "Voice chat / voice channel — chamada ou canal de voz.",
    "example": "We’re in VC right now.",
    "tag": "chat"
  },
  {
    "term": "ping",
    "meaning": "O sentido muda com o contexto: em chats, marcar/notificar alguém; em jogos, a latência da conexão medida em ms.",
    "example": "Ping me when class starts. / My ping is 180 ms.",
    "tag": "context"
  },
  {
    "term": "AFK",
    "meaning": "Away from keyboard — ausente por um momento, longe do teclado/dispositivo.",
    "example": "AFK for two minutes, brb.",
    "tag": "chat"
  },
  {
    "term": "BRB",
    "meaning": "Be right back — já volto.",
    "example": "BRB, I need some water.",
    "tag": "chat"
  },
  {
    "term": "@everyone",
    "meaning": "Menção que notifica todos os membros de um servidor/canal quando a plataforma permite.",
    "example": "@everyone the meeting starts in five minutes.",
    "tag": "chat"
  },
  {
    "term": "GGWP",
    "meaning": "Good game, well played — bom jogo, bem jogado; mensagem esportiva comum ao final de uma partida.",
    "example": "GGWP everyone, that was close.",
    "tag": "gaming"
  },
  {
    "term": "meta",
    "meaning": "Estratégia, composição ou build considerada dominante/mais eficiente naquele momento do jogo.",
    "example": "That build is the current meta.",
    "tag": "gaming"
  },
  {
    "term": "clutch",
    "meaning": "Jogada decisiva realizada sob pressão, especialmente quando salva a rodada ou a partida.",
    "example": "That last-second save was clutch.",
    "tag": "gaming"
  },
  {
    "term": "carry",
    "meaning": "Carregar/liderar o time, fazendo grande parte do trabalho para levar a equipe à vitória.",
    "example": "She carried the team in the final round.",
    "tag": "gaming"
  },
  {
    "term": "grind",
    "meaning": "Repetir tarefas para progredir, subir nível ou conseguir recursos/recompensas.",
    "example": "I need to grind for better gear.",
    "tag": "gaming"
  },
  {
    "term": "spawn",
    "meaning": "Aparecer/surgir no jogo, normalmente em um ponto definido.",
    "example": "Enemies spawn near the bridge.",
    "tag": "gaming"
  },
  {
    "term": "respawn",
    "meaning": "Reaparecer no jogo depois de morrer ou ser eliminado.",
    "example": "Wait five seconds and you’ll respawn.",
    "tag": "gaming"
  },
  {
    "term": "lag",
    "meaning": "Atraso ou travamento causado por problemas de desempenho ou conexão.",
    "example": "I can’t move because of lag.",
    "tag": "gaming"
  },
  {
    "term": "sweat / sweaty",
    "meaning": "Jogador que leva uma partida casual de forma extremamente competitiva; pode ser provocativo.",
    "example": "It’s a casual match, why are they so sweaty?",
    "tag": "gaming"
  },
  {
    "term": "toxic",
    "meaning": "Comportamento hostil, ofensivo, agressivo ou antidesportivo em uma comunidade/jogo.",
    "example": "The chat got toxic after the match.",
    "tag": "gaming"
  },
  {
    "term": "chat",
    "meaning": "Em streams, pode significar tanto o bate-papo ao vivo quanto o próprio público: “chat, what do you think?”",
    "example": "Chat, should I try this level again?",
    "tag": "stream"
  },
  {
    "term": "mod",
    "meaning": "Moderator — moderador responsável por ajudar a organizar e controlar uma comunidade/chat.",
    "example": "The mod removed the spam message.",
    "tag": "stream"
  },
  {
    "term": "clip",
    "meaning": "Trecho curto recortado de uma live ou vídeo para ser compartilhado.",
    "example": "Clip that moment!",
    "tag": "stream"
  },
  {
    "term": "raid",
    "meaning": "Em streaming, levar o público de uma live para outra live/canal ao terminar a transmissão.",
    "example": "We’re raiding another streamer now.",
    "tag": "stream"
  },
  {
    "term": "lurk",
    "meaning": "Assistir ou acompanhar sem interagir ativamente no chat.",
    "example": "I’m busy, so I’ll just lurk.",
    "tag": "stream"
  },
  {
    "term": "W / L",
    "meaning": "W = win, algo bom/uma vitória; L = loss, algo ruim/uma derrota. Também usados como avaliação rápida.",
    "example": "That update is a W. / Missing the event was an L.",
    "tag": "stream"
  },
  {
    "term": "thread",
    "meaning": "Tópico ou sequência organizada de posts/respostas em fóruns e redes sociais.",
    "example": "I explained everything in the thread.",
    "tag": "forum"
  },
  {
    "term": "ratio",
    "meaning": "Reação em que uma resposta recebe proporcionalmente muito mais apoio/engajamento do que o post original; também usado como tentativa de superar o post.",
    "example": "That reply ratioed the original post.",
    "tag": "forum"
  },
  {
    "term": "reply",
    "meaning": "Resposta a uma mensagem, post ou comentário.",
    "example": "I left a reply under the post.",
    "tag": "forum"
  },
  {
    "term": "mid",
    "meaning": "Mediano, sem graça ou abaixo das expectativas; avaliação informal e muitas vezes provocativa.",
    "example": "The movie was kind of mid.",
    "tag": "internet"
  }
];
const EXTRA_QUESTIONS = [
  {
    "chapter": 0,
    "mode": "Decode the Chat",
    "prompt": "O que AFK comunica nesta mensagem?",
    "chat": "“AFK for five minutes, I need to answer the door.”",
    "answers": [
      "A pessoa vai iniciar uma chamada de voz.",
      "A pessoa ficará ausente por alguns minutos.",
      "A pessoa quer que todos respondam.",
      "A pessoa está com conexão lenta."
    ],
    "correct": 1,
    "explain": "AFK = “away from keyboard”: a pessoa está temporariamente ausente.",
    "slang": "AFK"
  },
  {
    "chapter": 0,
    "mode": "Build the Reply",
    "prompt": "Qual resposta combina melhor?",
    "chat": "“BRB, my mom is calling me.”",
    "answers": [
      "“No problem, see you in a minute.”",
      "“That build is meta.”",
      "“Ratio.”",
      "“You should respawn.”"
    ],
    "correct": 0,
    "explain": "BRB = “be right back”, então uma resposta natural é reconhecer que a pessoa já volta.",
    "slang": "BRB"
  },
  {
    "chapter": 0,
    "mode": "Context Check",
    "prompt": "O que “DM me” significa?",
    "chat": "“I don’t want to post my phone number here. DM me.”",
    "answers": [
      "Marque todo mundo no servidor.",
      "Entre no canal de voz.",
      "Envie uma mensagem privada.",
      "Apague a mensagem."
    ],
    "correct": 2,
    "explain": "DM = direct message, uma mensagem privada enviada diretamente para alguém.",
    "slang": "DM"
  },
  {
    "chapter": 0,
    "mode": "Meaning Match",
    "prompt": "Neste contexto, o que é um “server”?",
    "chat": "“Our English class has a Discord server for homework and announcements.”",
    "answers": [
      "Uma conexão lenta.",
      "Um espaço/comunidade organizada no Discord.",
      "Uma conta alternativa.",
      "Um vídeo curto."
    ],
    "correct": 1,
    "explain": "No Discord, “server” é o espaço que reúne canais, membros e conversas de uma comunidade.",
    "slang": "server"
  },
  {
    "chapter": 0,
    "mode": "Decode the Chat",
    "prompt": "O que a pessoa está propondo?",
    "chat": "“Typing is slow. Wanna join VC?”",
    "answers": [
      "Entrar em um canal/chamada de voz.",
      "Sair do servidor.",
      "Publicar um story.",
      "Marcar todos com @everyone."
    ],
    "correct": 0,
    "explain": "VC = voice chat/voice channel.",
    "slang": "VC"
  },
  {
    "chapter": 0,
    "mode": "Meaning Match",
    "prompt": "Qual é o sentido de “ping” aqui?",
    "chat": "“Ping me when the teacher posts the file.”",
    "answers": [
      "Diminuir o volume do celular.",
      "Medir a velocidade do processador.",
      "Marcar/notificar a pessoa quando o arquivo aparecer.",
      "Sair e entrar novamente no jogo."
    ],
    "correct": 2,
    "explain": "Em chats, “ping” pode significar marcar ou notificar alguém. Em jogos, também pode significar latência.",
    "slang": "ping"
  },
  {
    "chapter": 0,
    "mode": "Slang Emergency",
    "prompt": "Quando @everyone faz sentido?",
    "chat": "Escolha o uso mais adequado.",
    "answers": [
      "“@everyone reminder: the server closes for maintenance in 10 minutes.”",
      "“@everyone I bought a sandwich.”",
      "“@everyone my pencil fell.”",
      "“@everyone I am AFK for 20 seconds.”"
    ],
    "correct": 0,
    "explain": "@everyone é melhor reservado para avisos que realmente precisam chegar a todos; uso excessivo pode incomodar.",
    "slang": "@everyone"
  },
  {
    "chapter": 0,
    "mode": "Context Check",
    "prompt": "O que “mutuals” quer dizer aqui?",
    "chat": "“We follow each other on Instagram, so we’re mutuals.”",
    "answers": [
      "Eles usam a mesma senha.",
      "Eles se seguem mutuamente.",
      "Eles fazem parte do mesmo time de jogo.",
      "Eles são moderadores."
    ],
    "correct": 1,
    "explain": "“Mutuals” normalmente indica pessoas que se seguem mutuamente ou têm conexão recíproca na rede.",
    "slang": "mutuals"
  },
  {
    "chapter": 0,
    "mode": "Meaning Match",
    "prompt": "Quem verá o conteúdo?",
    "chat": "“I posted the meme to close friends only.”",
    "answers": [
      "Somente o grupo restrito escolhido pela pessoa.",
      "Todos os usuários da plataforma.",
      "Somente moderadores.",
      "Ninguém; close friends apaga o post."
    ],
    "correct": 0,
    "explain": "“Close friends” é uma audiência restrita escolhida pelo usuário.",
    "slang": "close friends"
  },
  {
    "chapter": 0,
    "mode": "Impostor Slang",
    "prompt": "Qual uso está estranho?",
    "chat": "Encontre a mensagem que não combina com a expressão.",
    "answers": [
      "“BRB, grabbing water.”",
      "“DM me the address.”",
      "“We’re in VC if you want to join.”",
      "“My backpack is AFK because it is blue.”"
    ],
    "correct": 3,
    "explain": "AFK descreve alguém temporariamente ausente, não uma característica de um objeto.",
    "slang": "AFK"
  },
  {
    "chapter": 0,
    "mode": "Decode the Chat",
    "prompt": "Interprete a mensagem completa.",
    "chat": "“AFK. BRB in 2. LMK if the VC starts before I’m back.”",
    "answers": [
      "“Estou ausente. Volto em dois minutos. Me avise se a chamada de voz começar antes.”",
      "“Estou com lag. Vou sair do servidor e apagar a chamada.”",
      "“Vou postar um story e marcar todo mundo.”",
      "“Vou grindar por dois minutos e depois dar raid.”"
    ],
    "correct": 0,
    "explain": "AFK = ausente; BRB = já volto; LMK = me avise; VC = canal/chamada de voz.",
    "slang": "AFK"
  },
  {
    "chapter": 0,
    "mode": "Context Check",
    "prompt": "A palavra “ping” tem outro sentido em games. Qual?",
    "chat": "“My ping jumped to 280 ms and now the match feels delayed.”",
    "answers": [
      "Menção para chamar um amigo.",
      "Latência da conexão medida em milissegundos.",
      "Um tipo de recompensa.",
      "Uma mensagem privada."
    ],
    "correct": 1,
    "explain": "Em jogos online, “ping” costuma representar a latência da conexão; quanto maior, maior tende a ser o atraso.",
    "slang": "ping"
  },
  {
    "chapter": 1,
    "mode": "Gaming Lobby",
    "prompt": "O que “meta” significa aqui?",
    "chat": "“Everyone is using this strategy because it’s the current meta.”",
    "answers": [
      "É a estratégia/build dominante ou mais eficiente no momento.",
      "É um erro de conexão.",
      "É o ponto onde o personagem reaparece.",
      "É uma conta secundária."
    ],
    "correct": 0,
    "explain": "No gaming, “meta” descreve estratégias, personagens ou builds considerados mais eficientes naquele momento.",
    "slang": "meta"
  },
  {
    "chapter": 1,
    "mode": "Gaming Lobby",
    "prompt": "Qual jogada foi “clutch”?",
    "chat": "Final round, 1 vs 3. Alex defeats all three opponents with two seconds left.",
    "answers": [
      "Uma jogada decisiva sob pressão.",
      "Um erro de conexão.",
      "Uma partida abandonada por raiva.",
      "Um item coletado."
    ],
    "correct": 0,
    "explain": "“Clutch” é uma jogada decisiva em situação difícil, muitas vezes salvando a rodada.",
    "slang": "clutch"
  },
  {
    "chapter": 1,
    "mode": "Context Check",
    "prompt": "O que significa “carry” aqui?",
    "chat": "“Maya scored almost every point. She carried the team.”",
    "answers": [
      "Ela saiu do jogo.",
      "Ela levou o time à vitória fazendo grande parte do trabalho.",
      "Ela foi moderadora do chat.",
      "Ela mudou para uma conta alternativa."
    ],
    "correct": 1,
    "explain": "“Carry” é carregar/liderar o time, contribuindo muito para o resultado.",
    "slang": "carry"
  },
  {
    "chapter": 1,
    "mode": "Meaning Match",
    "prompt": "Qual situação é um “grind”?",
    "chat": "Escolha a melhor situação.",
    "answers": [
      "Repetir missões por horas para subir de nível e conseguir recursos.",
      "Ganhar uma partida em cinco segundos.",
      "Enviar uma DM para um amigo.",
      "Assistir uma live sem escrever no chat."
    ],
    "correct": 0,
    "explain": "“Grind” é repetir tarefas para progredir, obter níveis, moedas ou itens.",
    "slang": "grind"
  },
  {
    "chapter": 1,
    "mode": "Gaming Lobby",
    "prompt": "O que “spawn” quer dizer?",
    "chat": "“The enemies spawn near the castle every 30 seconds.”",
    "answers": [
      "Eles aparecem/surgem naquele local.",
      "Eles são enfraquecidos.",
      "Eles entram em um canal de voz.",
      "Eles enviam mensagens privadas."
    ],
    "correct": 0,
    "explain": "“Spawn” = aparecer/surgir no jogo.",
    "slang": "spawn"
  },
  {
    "chapter": 1,
    "mode": "Gaming Lobby",
    "prompt": "Qual é a diferença de “respawn”?",
    "chat": "“I died, but I’ll respawn in eight seconds.”",
    "answers": [
      "Receber um buff permanente.",
      "Reaparecer depois de morrer/eliminado.",
      "Trocar de servidor.",
      "Abandonar a partida."
    ],
    "correct": 1,
    "explain": "“Respawn” é reaparecer no jogo após ser eliminado.",
    "slang": "respawn"
  },
  {
    "chapter": 1,
    "mode": "Context Check",
    "prompt": "O que está acontecendo?",
    "chat": "“The game freezes every few seconds. I’m getting terrible lag.”",
    "answers": [
      "A conexão/desempenho está causando atraso ou travamentos.",
      "O personagem ficou forte demais.",
      "O jogador está coletando loot.",
      "O time venceu a partida."
    ],
    "correct": 0,
    "explain": "“Lag” descreve atraso/travamento, frequentemente ligado à conexão ou ao desempenho.",
    "slang": "lag"
  },
  {
    "chapter": 1,
    "mode": "Meaning Match",
    "prompt": "Qual frase usa “ping” no sentido gamer?",
    "chat": "Escolha a opção correta.",
    "answers": [
      "“Ping me on Discord later.”",
      "“My ping is 35 ms today, so the game feels responsive.”",
      "“I pinged a photo to my story.”",
      "“The boss dropped a ping.”"
    ],
    "correct": 1,
    "explain": "Em games, ping é latência; 35 ms é um valor de latência, não uma menção.",
    "slang": "ping"
  },
  {
    "chapter": 1,
    "mode": "Tone Check",
    "prompt": "O que “sweaty” sugere nesta frase?",
    "chat": "“It’s just a casual match, but that team is playing super sweaty.”",
    "answers": [
      "Eles estão jogando de forma extremamente competitiva.",
      "Eles estão todos AFK.",
      "Eles não conhecem as regras.",
      "Eles estão com ping baixo."
    ],
    "correct": 0,
    "explain": "“Sweaty” pode descrever alguém levando uma partida casual de forma muito competitiva.",
    "slang": "sweat / sweaty"
  },
  {
    "chapter": 1,
    "mode": "Tone Check",
    "prompt": "Qual comportamento é “toxic”?",
    "chat": "Escolha o exemplo mais adequado.",
    "answers": [
      "Parabenizar o adversário com “GGWP”.",
      "Insultar colegas e culpar o time agressivamente depois de perder.",
      "Perguntar qual é o meta atual.",
      "Ficar AFK por um minuto e avisar antes."
    ],
    "correct": 1,
    "explain": "“Toxic” descreve comportamento hostil, ofensivo ou antidesportivo.",
    "slang": "toxic"
  },
  {
    "chapter": 1,
    "mode": "Build the Reply",
    "prompt": "Qual mensagem demonstra esportividade?",
    "chat": "A partida terminou depois de uma disputa equilibrada.",
    "answers": [
      "“GGWP!”",
      "“Ratio!”",
      "“Hard launch!”",
      "“Lurk!”"
    ],
    "correct": 0,
    "explain": "GGWP = “good game, well played”, uma mensagem comum de respeito ao fim da partida.",
    "slang": "GGWP"
  },
  {
    "chapter": 1,
    "mode": "Impostor Slang",
    "prompt": "Qual interpretação está errada?",
    "chat": "Encontre o impostor.",
    "answers": [
      "meta = estratégia dominante",
      "clutch = jogada decisiva sob pressão",
      "grind = repetir tarefas para progredir",
      "carry = ficar ausente do teclado"
    ],
    "correct": 3,
    "explain": "“Carry” é carregar/liderar o time; “AFK” é que significa ficar ausente.",
    "slang": "carry"
  },
  {
    "chapter": 2,
    "mode": "Social Feed",
    "prompt": "O que é a FYP?",
    "chat": "“This dance keeps appearing on my FYP.”",
    "answers": [
      "A página de recomendações “For You”.",
      "Uma mensagem privada.",
      "Um canal de voz.",
      "Um fórum de suporte."
    ],
    "correct": 0,
    "explain": "FYP = For You Page, o feed de recomendações personalizado.",
    "slang": "FYP"
  },
  {
    "chapter": 2,
    "mode": "Context Check",
    "prompt": "O que “trend” significa?",
    "chat": "“That audio is part of a huge trend right now.”",
    "answers": [
      "Um erro de conexão.",
      "Um formato/áudio/comportamento popular naquele momento.",
      "Uma resposta a um post.",
      "Um personagem principal."
    ],
    "correct": 1,
    "explain": "“Trend” é uma tendência: algo que muitas pessoas estão reproduzindo ou comentando.",
    "slang": "trend"
  },
  {
    "chapter": 2,
    "mode": "Social Feed",
    "prompt": "Quando algo “goes viral”?",
    "chat": "“The clip got 8 million views in one day. It went viral.”",
    "answers": [
      "Quando se espalha muito rapidamente e alcança muita gente.",
      "Quando é enviado por DM.",
      "Quando fica disponível só para close friends.",
      "Quando recebe um nerf."
    ],
    "correct": 0,
    "explain": "“Go viral” = espalhar-se rapidamente e atingir grande audiência.",
    "slang": "viral"
  },
  {
    "chapter": 2,
    "mode": "Tone Check",
    "prompt": "Qual opção interpreta “it’s giving” corretamente?",
    "chat": "“The room has neon lights and arcade machines. It’s giving 80s sci-fi.”",
    "answers": [
      "O ambiente transmite uma vibe de ficção científica dos anos 80.",
      "O ambiente está sendo vendido.",
      "O ambiente está com lag.",
      "A sala está enviando uma DM."
    ],
    "correct": 0,
    "explain": "“It’s giving…” descreve a vibe/energia/associação que algo transmite.",
    "slang": "it’s giving…"
  },
  {
    "chapter": 2,
    "mode": "Social Feed",
    "prompt": "O que significa “you ate” aqui?",
    "chat": "“Your presentation was amazing. You ate!”",
    "answers": [
      "Você comeu durante a apresentação.",
      "Você arrasou / fez muito bem.",
      "Você esqueceu o trabalho.",
      "Você ficou AFK."
    ],
    "correct": 1,
    "explain": "“You ate” é um elogio informal: a pessoa mandou muito bem.",
    "slang": "ate"
  },
  {
    "chapter": 2,
    "mode": "Tone Check",
    "prompt": "Qual uso de “slay” é natural?",
    "chat": "Escolha o elogio mais natural.",
    "answers": [
      "“That performance was incredible — slay!”",
      "“Please slay my Wi-Fi latency.”",
      "“I found a slay in the loot chest.”",
      "“BRB, I need to slay the server settings.”"
    ],
    "correct": 0,
    "explain": "“Slay” pode funcionar como elogio para alguém que arrasou em uma performance, visual ou atitude.",
    "slang": "slay"
  },
  {
    "chapter": 2,
    "mode": "Decode the Chat",
    "prompt": "O que aconteceu nesse “soft launch”?",
    "chat": "“She posted a photo of two hands holding coffee but didn’t say who the other person was.”",
    "answers": [
      "Ela revelou algo de forma sutil, sem anunciar diretamente.",
      "Ela publicou um anúncio oficial com todos os detalhes.",
      "Ela saiu de uma partida por raiva.",
      "Ela marcou @everyone."
    ],
    "correct": 0,
    "explain": "Soft launch = revelar algo aos poucos/de forma indireta.",
    "slang": "soft launch"
  },
  {
    "chapter": 2,
    "mode": "Decode the Chat",
    "prompt": "Qual exemplo é um “hard launch”?",
    "chat": "Escolha a publicação mais explícita.",
    "answers": [
      "Uma foto misteriosa de duas sombras.",
      "“Officially together ❤️” com foto do casal e nome da pessoa.",
      "Um story sem texto mostrando duas xícaras.",
      "Curtir uma foto antiga."
    ],
    "correct": 1,
    "explain": "Hard launch = tornar algo público de maneira clara e explícita.",
    "slang": "hard launch"
  },
  {
    "chapter": 2,
    "mode": "Social Feed",
    "prompt": "O que é um “story”?",
    "chat": "“I don’t want this on my profile forever, so I’ll put it on my story.”",
    "answers": [
      "Um post temporário.",
      "Uma chamada de voz.",
      "Uma build dominante.",
      "Uma resposta com mais likes que o original."
    ],
    "correct": 0,
    "explain": "Story é um formato temporário de publicação em várias redes sociais.",
    "slang": "story"
  },
  {
    "chapter": 2,
    "mode": "Tone Check",
    "prompt": "O que “mid” quer dizer aqui?",
    "chat": "“Everyone hyped the movie, but I thought it was mid.”",
    "answers": [
      "Excelente e inesquecível.",
      "Mediano / abaixo das expectativas.",
      "Muito difícil de entender.",
      "Privado para close friends."
    ],
    "correct": 1,
    "explain": "“Mid” é uma avaliação informal de algo considerado mediano ou pouco impressionante.",
    "slang": "mid"
  },
  {
    "chapter": 2,
    "mode": "Decode the Chat",
    "prompt": "Interprete a legenda.",
    "chat": "“POV: your random video lands on the FYP and goes viral.”",
    "answers": [
      "Você imagina a situação de um vídeo recomendado que se espalha muito.",
      "Você entra em um canal de voz com lag.",
      "Você perde uma partida e dá rage quit.",
      "Você recebe uma mensagem privada de um moderador."
    ],
    "correct": 0,
    "explain": "POV apresenta a situação; FYP é o feed “For You”; viral indica grande disseminação.",
    "slang": "FYP"
  },
  {
    "chapter": 2,
    "mode": "Impostor Slang",
    "prompt": "Qual frase usa a expressão de forma inadequada?",
    "chat": "Encontre o impostor.",
    "answers": [
      "“That outfit is giving superhero.”",
      "“You absolutely ate that dance.”",
      "“The video went viral.”",
      "“My Wi-Fi soft launched to 300 ms.”"
    ],
    "correct": 3,
    "explain": "Soft launch é uma revelação sutil de algo, não uma mudança de latência.",
    "slang": "soft launch"
  },
  {
    "chapter": 3,
    "mode": "Stream Chat",
    "prompt": "Quem é “chat” nesta frase?",
    "chat": "“Chat, should I try the boss again?”",
    "answers": [
      "O público/bate-papo da live.",
      "Um item do jogo.",
      "Uma conta alternativa.",
      "O algoritmo da FYP."
    ],
    "correct": 0,
    "explain": "Streamers frequentemente chamam o público de “chat”.",
    "slang": "chat"
  },
  {
    "chapter": 3,
    "mode": "Stream Chat",
    "prompt": "O que faz um “mod”?",
    "chat": "“A mod deleted the spam and timed the user out.”",
    "answers": [
      "Ajuda a moderar/organizar o chat.",
      "Aumenta o dano de uma arma.",
      "Cria automaticamente clips.",
      "Reduz o ping da conexão."
    ],
    "correct": 0,
    "explain": "Mod = moderator, pessoa com funções de moderação na comunidade/chat.",
    "slang": "mod"
  },
  {
    "chapter": 3,
    "mode": "Stream Chat",
    "prompt": "O que significa “clip that”?",
    "chat": "O streamer faz uma jogada incrível e alguém escreve: “CLIP THAT!”",
    "answers": [
      "Salvar/recortar aquele trecho da live.",
      "Encerrar a transmissão.",
      "Banir todos do chat.",
      "Entrar no canal de voz."
    ],
    "correct": 0,
    "explain": "“Clip” é um trecho curto recortado da live para compartilhar depois.",
    "slang": "clip"
  },
  {
    "chapter": 3,
    "mode": "Stream Chat",
    "prompt": "O que é uma “raid” em streaming?",
    "chat": "“We’re ending the stream, so let’s raid another channel.”",
    "answers": [
      "Levar o público para outra live/canal.",
      "Atacar verbalmente outro streamer.",
      "Reiniciar o computador.",
      "Apagar os clips antigos."
    ],
    "correct": 0,
    "explain": "Em streaming, raid é direcionar o público para outra transmissão.",
    "slang": "raid"
  },
  {
    "chapter": 3,
    "mode": "Context Check",
    "prompt": "O que a pessoa quer dizer com “lurk”?",
    "chat": "“I’m doing homework, so I’ll lurk and keep the stream on.”",
    "answers": [
      "Vai assistir sem interagir muito.",
      "Vai virar moderador.",
      "Vai enviar @everyone.",
      "Vai abandonar a plataforma."
    ],
    "correct": 0,
    "explain": "Lurk = acompanhar silenciosamente, sem participar ativamente do chat.",
    "slang": "lurk"
  },
  {
    "chapter": 3,
    "mode": "Stream Chat",
    "prompt": "Qual interpretação de “W” é correta?",
    "chat": "“Free update with new maps? Massive W.”",
    "answers": [
      "A pessoa considera a atualização algo positivo/uma vitória.",
      "A pessoa está pedindo uma mensagem privada.",
      "A pessoa acha a atualização mediana.",
      "A pessoa está com latência alta."
    ],
    "correct": 0,
    "explain": "W vem de win e pode ser usado como avaliação positiva; L vem de loss e indica algo negativo.",
    "slang": "W / L"
  },
  {
    "chapter": 3,
    "mode": "Context Check",
    "prompt": "O que é um “thread”?",
    "chat": "“I wrote a thread explaining all the changes in the update.”",
    "answers": [
      "Uma sequência/tópico organizado de posts ou respostas.",
      "Uma chamada de voz.",
      "Um tipo de loot.",
      "Um personagem secundário."
    ],
    "correct": 0,
    "explain": "Thread é um tópico ou sequência conectada de posts/respostas.",
    "slang": "thread"
  },
  {
    "chapter": 3,
    "mode": "Meaning Changes",
    "prompt": "O que “OP” significa neste fórum?",
    "chat": "“OP updated the first post after reading the replies.”",
    "answers": [
      "Overpowered.",
      "Original poster — autor da postagem original.",
      "Official player.",
      "Online ping."
    ],
    "correct": 1,
    "explain": "Em fóruns, OP pode significar “original poster”; em jogos, normalmente significa “overpowered”. O contexto decide.",
    "slang": "OP"
  },
  {
    "chapter": 3,
    "mode": "Context Check",
    "prompt": "O que aconteceu neste “ratio”?",
    "chat": "“The original post got 30 likes, but one reply got 4,000. People said it was ratioed.”",
    "answers": [
      "A resposta recebeu muito mais apoio/engajamento que o post original.",
      "O post ficou disponível apenas para close friends.",
      "A resposta foi enviada por DM.",
      "O autor entrou em VC."
    ],
    "correct": 0,
    "explain": "“Ratio” descreve, entre outros usos, quando uma resposta supera muito o engajamento do post original.",
    "slang": "ratio"
  },
  {
    "chapter": 3,
    "mode": "Meaning Match",
    "prompt": "O que é uma “reply”?",
    "chat": "“I asked a question and got a helpful reply.”",
    "answers": [
      "Uma resposta a uma mensagem/post.",
      "Uma página de recomendações.",
      "Um moderador.",
      "Uma estratégia dominante."
    ],
    "correct": 0,
    "explain": "Reply = resposta.",
    "slang": "reply"
  },
  {
    "chapter": 3,
    "mode": "Decode the Chat",
    "prompt": "Qual é a função do TL;DR neste post?",
    "chat": "“Long thread about the update… TL;DR: the new patch is good but the servers need work.”",
    "answers": [
      "Dar um resumo curto da discussão longa.",
      "Marcar todos os usuários.",
      "Indicar que o post viralizou.",
      "Dizer que o autor está AFK."
    ],
    "correct": 0,
    "explain": "TL;DR pode introduzir um resumo curto depois de um texto longo.",
    "slang": "TL;DR"
  },
  {
    "chapter": 3,
    "mode": "Decode the Chat",
    "prompt": "Interprete a mensagem da live.",
    "chat": "“Chat, clip that! After this match we’re raiding Luna. Huge W.”",
    "answers": [
      "O streamer pede para recortar o momento, avisa que levará o público a outra live e considera isso positivo.",
      "O streamer pede uma DM e diz que está com lag.",
      "O streamer quer banir Luna e apagar o chat.",
      "O streamer vai ficar AFK e voltar em breve."
    ],
    "correct": 0,
    "explain": "Chat = público; clip = trecho salvo; raid = levar o público para outra live; W = algo positivo.",
    "slang": "raid"
  }
];
const EXTRA_BOSS_QUESTIONS = [
  {
    "chat": "“AFK for a sec, BRB. Ping me in the server if the raid starts.”",
    "answers": [
      "“Vou ficar ausente por um momento e já volto. Me marque/notifique no servidor se a raid começar.”",
      "“Minha conexão está lenta. Apague o servidor se o boss aparecer.”",
      "“Vou grindar. Dê buff no servidor e me envie loot.”",
      "“Estou em close friends. Publique a raid na FYP.”"
    ],
    "correct": 0,
    "explain": "AFK = ausente; BRB = já volto; ping = marcar/notificar; server = servidor; raid = levar público para outra live."
  },
  {
    "chat": "“That final play was clutch. You carried us. GGWP.”",
    "answers": [
      "“A jogada final foi decisiva, você carregou o time. Bom jogo, bem jogado.”",
      "“A jogada teve lag, você ficou AFK. Volte ao servidor.”",
      "“A jogada viralizou, você fez um soft launch.”",
      "“A jogada era meta, então dê ratio no adversário.”"
    ],
    "correct": 0,
    "explain": "Clutch = jogada decisiva; carry = levar o time; GGWP = good game, well played."
  },
  {
    "chat": "“The patch nerfed the meta build, so I’m grinding loot on my alt.”",
    "answers": [
      "“A atualização enfraqueceu a build dominante, então estou repetindo tarefas para conseguir itens na minha conta/personagem alternativo.”",
      "“A atualização tornou a build viral, então estou assistindo sem interagir.”",
      "“A atualização criou uma DM e eu respondi no thread.”",
      "“A atualização aumentou meu ping e eu fiz hard launch.”"
    ],
    "correct": 0,
    "explain": "Nerf = enfraquecer; meta = estratégia/build dominante; grind = repetir tarefas; loot = itens; alt = alternativa."
  },
  {
    "chat": "“OP added a TL;DR to the thread, but one reply got ratioed.”",
    "answers": [
      "“O autor original adicionou um resumo ao tópico, e uma resposta acabou recebendo proporcionalmente mais engajamento.”",
      "“O personagem forte recebeu um buff e venceu a partida.”",
      "“O moderador criou um clip e iniciou uma raid.”",
      "“O jogador ficou AFK porque o ping estava alto.”"
    ],
    "correct": 0,
    "explain": "Aqui OP = original poster; TL;DR = resumo; thread = tópico; reply = resposta; ratio = relação de engajamento que favorece a resposta."
  },
  {
    "chat": "“POV: your soft launch lands on the FYP, goes viral, and everyone says you ate.”",
    "answers": [
      "“Imagine a situação: sua revelação sutil aparece no feed recomendado, viraliza e todos dizem que você arrasou.”",
      "“Seu personagem reaparece no mapa e recebe um buff.”",
      "“Você entra em VC, fica AFK e dá rage quit.”",
      "“Seu thread recebe lag e precisa de um mod.”"
    ],
    "correct": 0,
    "explain": "POV apresenta a situação; soft launch = revelação sutil; FYP = feed recomendado; viral = espalha; ate = arrasou."
  },
  {
    "chat": "“I was lurking, then the streamer raided another channel. W.”",
    "answers": [
      "“Eu estava assistindo sem interagir, depois o streamer levou o público para outro canal. Foi algo positivo.”",
      "“Eu estava moderando, depois o streamer apagou outro canal. Foi uma derrota.”",
      "“Eu estava com lag e o streamer diminuiu meu ping.”",
      "“Eu estava em close friends e o streamer mandou uma DM.”"
    ],
    "correct": 0,
    "explain": "Lurk = assistir silenciosamente; raid = levar o público a outra live; W = win/avaliação positiva."
  },
  {
    "chat": "“My ping is 300 ms, I’m lagging, and the enemy spawned behind me. I’m cooked.”",
    "answers": [
      "“Minha latência está alta, o jogo está atrasando, o inimigo apareceu atrás de mim e estou em apuros.”",
      "“Alguém me marcou no Discord, o inimigo me enviou uma DM e eu venci.”",
      "“Minha live viralizou e o inimigo fez um soft launch.”",
      "“Meu moderador criou um thread e eu recebi loot.”"
    ],
    "correct": 0,
    "explain": "Em games, ping = latência; lag = atraso; spawn = aparecer; cooked = estar em apuros."
  }
];

// Update context-sensitive entries already present in the original pack.
const opEntry = SLANGS.find(s => s.term === 'OP');
if (opEntry) {
  opEntry.meaning = 'O sentido depende do contexto: em games, overpowered (forte/desequilibrado); em fóruns, original poster (autor da postagem original).';
  opEntry.example = 'That hero is OP. / OP updated the first post.';
  opEntry.tag = 'context';
}
const tldrEntry = SLANGS.find(s => s.term === 'TL;DR');
if (tldrEntry) tldrEntry.meaning = 'Too long; didn’t read — pode reagir a um texto longo ou introduzir um resumo curto dele.';

EXTRA_SLANGS.forEach(item => {
  if (!SLANGS.some(s => s.term.toLowerCase() === item.term.toLowerCase())) SLANGS.push(item);
});
QUESTIONS.push(...EXTRA_QUESTIONS);
BOSS_QUESTIONS.push(...EXTRA_BOSS_QUESTIONS);

// CHAT CHAOS v0.4 — additional question bank for higher replayability
const V04_QUESTIONS = [
  {
    "chapter": 0,
    "mode": "Context Check",
    "prompt": "Por que a pessoa prefere uma DM?",
    "chat": "“Don’t post the answer publicly. Send it to me in a DM.”",
    "answers": [
      "Porque ela quer uma mensagem privada.",
      "Porque ela quer iniciar uma live.",
      "Porque ela quer aumentar o ping.",
      "Porque ela quer marcar @everyone."
    ],
    "correct": 0,
    "explain": "DM = direct message, uma conversa privada entre usuários.",
    "slang": "DM"
  },
  {
    "chapter": 0,
    "mode": "Build the Reply",
    "prompt": "Qual resposta é mais natural?",
    "chat": "“I’ll be AFK for ten minutes. Can you ping me when I’m back?”",
    "answers": [
      "“Sure, I’ll tag you when you return.”",
      "“GGWP, your ping is overpowered.”",
      "“I’ll hard launch the server.”",
      "“Ratio.”"
    ],
    "correct": 0,
    "explain": "AFK indica ausência; aqui ping significa marcar/notificar a pessoa no chat.",
    "slang": "ping"
  },
  {
    "chapter": 0,
    "mode": "Tone Check",
    "prompt": "Qual uso de @everyone é mais responsável?",
    "chat": "Um servidor escolar tem 80 alunos.",
    "answers": [
      "“@everyone look at my new profile picture.”",
      "“@everyone reminder: tomorrow’s deadline changed to 8 a.m.”",
      "“@everyone I’m bored.”",
      "“@everyone who likes pizza?”"
    ],
    "correct": 1,
    "explain": "@everyone chama todos; em comunidades grandes, deve ser reservado para avisos realmente relevantes.",
    "slang": "@everyone"
  },
  {
    "chapter": 0,
    "mode": "Decode the Chat",
    "prompt": "O que aconteceu nessa conversa?",
    "chat": "“BRB — joining VC after I finish dinner.”",
    "answers": [
      "A pessoa vai abandonar o servidor.",
      "A pessoa vai voltar depois e então entrar no canal de voz.",
      "A pessoa está reclamando de lag.",
      "A pessoa quer postar um story."
    ],
    "correct": 1,
    "explain": "BRB = be right back; VC = voice chat/voice channel.",
    "slang": "BRB"
  },
  {
    "chapter": 0,
    "mode": "Impostor Slang",
    "prompt": "Qual frase usa “server” em um sentido diferente do Discord?",
    "chat": "Observe o contexto de cada frase.",
    "answers": [
      "“Our study group has a private server.”",
      "“The server has channels for each subject.”",
      "“Join the server and read the rules.”",
      "“The restaurant server brought our food.”"
    ],
    "correct": 3,
    "explain": "Em inglês, server também pode ser atendente/servidor; as três primeiras frases usam o sentido digital.",
    "slang": "server"
  },
  {
    "chapter": 0,
    "mode": "Context Check",
    "prompt": "Qual interpretação de “mutuals” é mais provável?",
    "chat": "“I don’t know her personally, but we’ve been mutuals on TikTok for months.”",
    "answers": [
      "Elas dividem a mesma conta.",
      "Elas se seguem reciprocamente na plataforma.",
      "Elas são parentes.",
      "Elas jogam no mesmo servidor."
    ],
    "correct": 1,
    "explain": "Mutuals são usuários com uma relação recíproca de follow/conexão na rede.",
    "slang": "mutuals"
  },
  {
    "chapter": 0,
    "mode": "Meaning Match",
    "prompt": "O que “close friends” muda nessa situação?",
    "chat": "“I won’t put this on my public story — only close friends.”",
    "answers": [
      "O conteúdo ficará visível a um grupo restrito selecionado.",
      "O conteúdo será enviado por e-mail.",
      "O conteúdo ficará automaticamente viral.",
      "O conteúdo só poderá ser visto por moderadores."
    ],
    "correct": 0,
    "explain": "Close friends limita a audiência a pessoas escolhidas pelo usuário.",
    "slang": "close friends"
  },
  {
    "chapter": 0,
    "mode": "Slang Emergency",
    "prompt": "Qual frase resolve melhor o erro de BOOMER.EXE?",
    "chat": "BOOMER.EXE: “AFK means Always Find Knowledge.”",
    "answers": [
      "“AFK means Away From Keyboard.”",
      "“AFK means After Final Kill.”",
      "“AFK means A Funny Keyword.”",
      "“AFK means Add Friends Kindly.”"
    ],
    "correct": 0,
    "explain": "AFK = Away From Keyboard, usado quando alguém ficará temporariamente ausente.",
    "slang": "AFK"
  },
  {
    "chapter": 0,
    "mode": "Decode the Chat",
    "prompt": "Qual resumo preserva o sentido da mensagem?",
    "chat": "“LMK when you’re online. I’ll DM you the invite so we don’t spam the server.”",
    "answers": [
      "“Me avise quando estiver online; enviarei o convite em privado para não encher o servidor.”",
      "“Entre no voice chat e marque todos.”",
      "“Quando o jogo travar, aumente meu ping.”",
      "“Publique o convite no story para viralizar.”"
    ],
    "correct": 0,
    "explain": "LMK = me avise; DM = mensagem privada; server = comunidade/espaço digital.",
    "slang": "LMK"
  },
  {
    "chapter": 0,
    "mode": "Meaning Match",
    "prompt": "Qual opção é realmente um TL;DR?",
    "chat": "Um aluno escreveu seis parágrafos explicando por que perdeu o prazo.",
    "answers": [
      "“TL;DR: my internet went down and I submitted it late.”",
      "“TL;DR: good luck, have fun!”",
      "“TL;DR: join VC.”",
      "“TL;DR: you ate.”"
    ],
    "correct": 0,
    "explain": "TL;DR introduz um resumo curto de uma explicação longa.",
    "slang": "TL;DR"
  },
  {
    "chapter": 0,
    "mode": "Context Check",
    "prompt": "Neste chat, “ping” NÃO fala de latência. Como sabemos?",
    "chat": "“If I forget the meeting, ping me at 3.”",
    "answers": [
      "Porque há uma medida em milissegundos.",
      "Porque a pessoa está pedindo uma notificação/lembrete no chat.",
      "Porque a frase fala de respawn.",
      "Porque ping significa sair do servidor."
    ],
    "correct": 1,
    "explain": "O verbo “ping me” em chats significa chamar, marcar ou notificar alguém.",
    "slang": "ping"
  },
  {
    "chapter": 0,
    "mode": "Build the Reply",
    "prompt": "Qual resposta mostra que você entendeu a mensagem?",
    "chat": "“BRB. If the teacher arrives, LMK.”",
    "answers": [
      "“Sure — I’ll tell you when the teacher gets here.”",
      "“I’ll nerf the teacher.”",
      "“You should grind.”",
      "“W ratio.”"
    ],
    "correct": 0,
    "explain": "BRB = já volto; LMK = me avise. A resposta correta promete avisar.",
    "slang": "LMK"
  },
  {
    "chapter": 1,
    "mode": "Gaming Lobby",
    "prompt": "Por que “GGWP” funciona aqui?",
    "chat": "The match ends 12–11 after a close final round.",
    "answers": [
      "Porque reconhece uma boa partida e o esforço dos jogadores.",
      "Porque pede para nerfar o adversário.",
      "Porque avisa que o jogador está AFK.",
      "Porque significa que a conexão está ruim."
    ],
    "correct": 0,
    "explain": "GGWP = good game, well played; é uma mensagem esportiva comum ao fim da partida.",
    "slang": "GGWP"
  },
  {
    "chapter": 1,
    "mode": "Context Check",
    "prompt": "Qual frase descreve melhor o “meta”?",
    "chat": "A atualização fez quase todos os times competitivos adotarem a mesma composição.",
    "answers": [
      "“That composition became the meta.”",
      "“That composition is AFK.”",
      "“That composition is a DM.”",
      "“That composition got ratioed.”"
    ],
    "correct": 0,
    "explain": "Meta é a estratégia/build/composição dominante ou mais eficiente naquele momento.",
    "slang": "meta"
  },
  {
    "chapter": 1,
    "mode": "Gaming Lobby",
    "prompt": "Qual situação é realmente “clutch”?",
    "chat": "Escolha a jogada decisiva.",
    "answers": [
      "Um jogador coleta moedas no tutorial.",
      "Um jogador vence sozinho a rodada final com 1 HP restante.",
      "Um jogador fica AFK no lobby.",
      "Um jogador muda a foto de perfil."
    ],
    "correct": 1,
    "explain": "Clutch descreve uma jogada decisiva sob muita pressão.",
    "slang": "clutch"
  },
  {
    "chapter": 1,
    "mode": "Tone Check",
    "prompt": "Qual frase é menos agressiva com um iniciante?",
    "chat": "Um colega começou a jogar hoje e está aprendendo os controles.",
    "answers": [
      "“What a noob, uninstall.”",
      "“You’re a newbie — I can show you the basics.”",
      "“You’re toxic.”",
      "“Rage quit already.”"
    ],
    "correct": 1,
    "explain": "Newbie costuma ser mais neutro que noob, que pode soar depreciativo dependendo do tom.",
    "slang": "newbie"
  },
  {
    "chapter": 1,
    "mode": "Gaming Lobby",
    "prompt": "O que “sweaty” sugere nessa frase?",
    "chat": "“It’s a casual match, but they’re playing like a championship. So sweaty.”",
    "answers": [
      "O time está com calor literalmente.",
      "O time está jogando de forma extremamente competitiva em uma partida casual.",
      "O time está com ping baixo.",
      "O time acabou de respawnar."
    ],
    "correct": 1,
    "explain": "Sweaty pode criticar alguém que leva uma partida casual competitivamente demais.",
    "slang": "sweat / sweaty"
  },
  {
    "chapter": 1,
    "mode": "Slang Emergency",
    "prompt": "Qual comportamento é “toxic”?",
    "chat": "Escolha o exemplo mais claro.",
    "answers": [
      "Dizer “GGWP” depois da partida.",
      "Insultar colegas repetidamente e culpar todos pelos próprios erros.",
      "Perguntar como usar uma habilidade.",
      "Ficar AFK por dois minutos e avisar antes."
    ],
    "correct": 1,
    "explain": "Toxic descreve comportamento hostil, ofensivo ou antidesportivo.",
    "slang": "toxic"
  },
  {
    "chapter": 1,
    "mode": "Context Check",
    "prompt": "Qual é o problema descrito?",
    "chat": "“My ping is 240 ms. I press jump and the character reacts late.”",
    "answers": [
      "A latência está alta, causando atraso.",
      "O personagem recebeu um buff.",
      "O jogador está fazendo grind.",
      "O loot está raro."
    ],
    "correct": 0,
    "explain": "Em games, ping mede latência; valores altos podem produzir resposta atrasada.",
    "slang": "ping"
  },
  {
    "chapter": 1,
    "mode": "Meaning Match",
    "prompt": "O que diferencia “spawn” de “respawn” aqui?",
    "chat": "“Monsters spawn at night. Players respawn after being defeated.”",
    "answers": [
      "Spawn é surgir; respawn é reaparecer após ser eliminado.",
      "Spawn é ganhar loot; respawn é perder loot.",
      "Spawn é buff; respawn é nerf.",
      "Não há diferença."
    ],
    "correct": 0,
    "explain": "Spawn = aparecer; respawn = aparecer novamente, normalmente após morte/eliminação.",
    "slang": "respawn"
  },
  {
    "chapter": 1,
    "mode": "Gaming Lobby",
    "prompt": "Qual frase mostra “carry” sem ser literal?",
    "chat": "Escolha o uso gamer.",
    "answers": [
      "“Can you carry this box?”",
      "“Rafa scored 30 points and carried the team to the win.”",
      "“Carry means open a DM.”",
      "“The server carried the file.”"
    ],
    "correct": 1,
    "explain": "No gaming, carry é fazer grande parte do trabalho e conduzir o time ao resultado.",
    "slang": "carry"
  },
  {
    "chapter": 1,
    "mode": "Decode the Chat",
    "prompt": "O que o jogador pretende fazer?",
    "chat": "“I’m going to grind tonight until I get enough loot for the upgrade.”",
    "answers": [
      "Repetir atividades para conseguir recompensas suficientes.",
      "Abandonar o jogo por raiva.",
      "Entrar em uma chamada de voz.",
      "Fazer uma postagem viral."
    ],
    "correct": 0,
    "explain": "Grind = repetir tarefas para progredir; loot = itens/recompensas obtidos.",
    "slang": "grind"
  },
  {
    "chapter": 1,
    "mode": "Context Check",
    "prompt": "Qual mudança é um buff?",
    "chat": "Patch notes:",
    "answers": [
      "Damage reduced from 80 to 60.",
      "Cooldown increased from 5s to 8s.",
      "Health increased from 500 to 650.",
      "Item removed from the game."
    ],
    "correct": 2,
    "explain": "Aumentar a vida torna o personagem mais forte: isso é um buff.",
    "slang": "buff"
  },
  {
    "chapter": 1,
    "mode": "Context Check",
    "prompt": "Qual mudança é um nerf?",
    "chat": "Patch notes:",
    "answers": [
      "Range increased by 20%.",
      "Damage reduced by 25%.",
      "Movement speed increased.",
      "Healing doubled."
    ],
    "correct": 1,
    "explain": "Reduzir dano diminui a eficácia do elemento, portanto é um nerf.",
    "slang": "nerf"
  },
  {
    "chapter": 2,
    "mode": "Social Feed",
    "prompt": "O que significa aparecer na FYP?",
    "chat": "“I only had 200 followers, but the video reached thousands of people on the FYP.”",
    "answers": [
      "O vídeo foi recomendado no feed “For You”.",
      "O vídeo foi enviado apenas aos close friends.",
      "O vídeo foi apagado por um mod.",
      "O vídeo virou uma DM."
    ],
    "correct": 0,
    "explain": "FYP = For You Page, o feed de recomendação algorítmica.",
    "slang": "FYP"
  },
  {
    "chapter": 2,
    "mode": "Context Check",
    "prompt": "Qual diferença faz sentido entre “trend” e “viral”?",
    "chat": "Escolha a explicação mais precisa.",
    "answers": [
      "Trend é algo popular que muitas pessoas reproduzem; viral é conteúdo que se espalha rapidamente e alcança muita gente.",
      "Trend é privado; viral é sempre pago.",
      "Trend significa DM; viral significa VC.",
      "São exatamente a mesma palavra em qualquer contexto."
    ],
    "correct": 0,
    "explain": "Uma trend é um padrão/tendência coletiva; viral descreve principalmente a velocidade e o alcance da circulação de um conteúdo.",
    "slang": "trend"
  },
  {
    "chapter": 2,
    "mode": "Meaning Match",
    "prompt": "O que “it’s giving…” faz nessa frase?",
    "chat": "“The dark lighting and dramatic music? It’s giving horror movie.”",
    "answers": [
      "Diz que o conjunto transmite uma vibe de filme de terror.",
      "Diz que alguém está doando um filme.",
      "Diz que o vídeo foi deletado.",
      "Diz que a música está com lag."
    ],
    "correct": 0,
    "explain": "It’s giving… compara a vibe/energia/aparência com outra referência.",
    "slang": "it’s giving…"
  },
  {
    "chapter": 2,
    "mode": "Tone Check",
    "prompt": "Qual frase usa “ate” como elogio?",
    "chat": "Escolha o uso de internet slang.",
    "answers": [
      "“She ate lunch at noon.”",
      "“Your presentation was amazing — you ate!”",
      "“The phone ate the charger.”",
      "“Ate means AFK.”"
    ],
    "correct": 1,
    "explain": "Na slang, “you ate” significa que alguém arrasou ou fez algo muito bem.",
    "slang": "ate"
  },
  {
    "chapter": 2,
    "mode": "Social Feed",
    "prompt": "Qual comentário usa “slay” de modo natural?",
    "chat": "Uma amiga publica o look que criou para uma apresentação.",
    "answers": [
      "“Slay! That look is incredible.”",
      "“Please slay the Wi‑Fi.”",
      "“My homework is slay 200 ms.”",
      "“I will respawn the slay.”"
    ],
    "correct": 0,
    "explain": "Slay é usado como elogio: arrasar, mandar muito bem.",
    "slang": "slay"
  },
  {
    "chapter": 2,
    "mode": "Context Check",
    "prompt": "Isso é soft launch ou hard launch?",
    "chat": "A pessoa posta uma foto de duas mãos dadas, sem mostrar o rosto nem marcar ninguém.",
    "answers": [
      "Soft launch.",
      "Hard launch.",
      "Raid.",
      "Ratio."
    ],
    "correct": 0,
    "explain": "Soft launch revela algo de forma indireta/sutil, deixando pistas sem anúncio explícito.",
    "slang": "soft launch"
  },
  {
    "chapter": 2,
    "mode": "Context Check",
    "prompt": "Isso é soft launch ou hard launch?",
    "chat": "A pessoa posta uma foto do casal, marca o parceiro e escreve: “Meet my boyfriend.”",
    "answers": [
      "Soft launch.",
      "Lurk.",
      "Hard launch.",
      "FOMO."
    ],
    "correct": 2,
    "explain": "Hard launch é a revelação explícita e direta.",
    "slang": "hard launch"
  },
  {
    "chapter": 2,
    "mode": "Meaning Match",
    "prompt": "Qual situação combina com “story”?",
    "chat": "Escolha o uso típico de rede social.",
    "answers": [
      "Um post temporário que fica disponível por um período limitado.",
      "Um canal de voz permanente.",
      "Uma medida de latência.",
      "Uma estratégia dominante em games."
    ],
    "correct": 0,
    "explain": "Story é um formato temporário de publicação em várias redes sociais.",
    "slang": "story"
  },
  {
    "chapter": 2,
    "mode": "Decode the Chat",
    "prompt": "O que a pessoa quer dizer?",
    "chat": "“That chorus has been living rent free in my head all week.”",
    "answers": [
      "Ela não consegue parar de pensar/lembrar do refrão.",
      "Ela mora de graça em um estúdio.",
      "Ela removeu a música da playlist.",
      "Ela acha a música muito fraca."
    ],
    "correct": 0,
    "explain": "Live rent free in my head = ocupar os pensamentos repetidamente.",
    "slang": "rent free"
  },
  {
    "chapter": 2,
    "mode": "Tone Check",
    "prompt": "Qual interpretação de “mid” é correta?",
    "chat": "“The trailer looked amazing, but the movie was mid.”",
    "answers": [
      "O filme foi considerado mediano/decepcionante.",
      "O filme foi proibido.",
      "O filme viralizou automaticamente.",
      "O filme estava no meio da tela."
    ],
    "correct": 0,
    "explain": "Mid é uma avaliação informal de algo mediano, sem graça ou abaixo da expectativa.",
    "slang": "mid"
  },
  {
    "chapter": 2,
    "mode": "Context Check",
    "prompt": "Onde está o FOMO?",
    "chat": "Quatro amigos descrevem a noite.",
    "answers": [
      "“I stayed home and I’m happy I skipped it.”",
      "“Everyone is at the concert except me; I keep checking their stories and wish I were there.”",
      "“The concert was mid.”",
      "“I posted a clip.”"
    ],
    "correct": 1,
    "explain": "FOMO é a sensação de estar perdendo uma experiência da qual outros estão participando.",
    "slang": "FOMO"
  },
  {
    "chapter": 2,
    "mode": "Impostor Slang",
    "prompt": "Qual legenda usa POV de maneira menos coerente?",
    "chat": "Encontre o uso estranho.",
    "answers": [
      "“POV: you open the fridge for the fifth time hoping new food appears.”",
      "“POV: the teacher says ‘pair work’ and your friend is absent.”",
      "“POV: you realize the deadline was yesterday.”",
      "“POV is a type of Wi‑Fi latency measured in milliseconds.”"
    ],
    "correct": 3,
    "explain": "POV = point of view; não é uma medida de conexão.",
    "slang": "POV"
  },
  {
    "chapter": 3,
    "mode": "Stream Chat",
    "prompt": "Quem é “chat” nessa frase?",
    "chat": "A streamer says: “Chat, should I try the challenge again?”",
    "answers": [
      "O público que está acompanhando/interagindo na live.",
      "Somente os moderadores.",
      "Um personagem do jogo.",
      "O servidor físico da plataforma."
    ],
    "correct": 0,
    "explain": "Streamers frequentemente chamam o próprio público/bate-papo ao vivo de “chat”.",
    "slang": "chat"
  },
  {
    "chapter": 3,
    "mode": "Context Check",
    "prompt": "Qual ação combina com um mod?",
    "chat": "O chat está cheio de spam e insultos.",
    "answers": [
      "Incentivar mais spam.",
      "Ajudar a moderar, remover mensagens e aplicar regras.",
      "Aumentar o ping dos usuários.",
      "Criar loot para a live."
    ],
    "correct": 1,
    "explain": "Mod = moderator, pessoa que ajuda a organizar e aplicar regras da comunidade/chat.",
    "slang": "mod"
  },
  {
    "chapter": 3,
    "mode": "Stream Chat",
    "prompt": "Por que alguém escreveria “clip that”?",
    "chat": "O streamer acabou de fazer uma jogada muito improvável.",
    "answers": [
      "Para pedir que o momento seja recortado em um vídeo curto compartilhável.",
      "Para pedir que a live termine.",
      "Para diminuir a latência.",
      "Para marcar todos no servidor."
    ],
    "correct": 0,
    "explain": "Clip é um trecho curto recortado de uma live ou vídeo.",
    "slang": "clip"
  },
  {
    "chapter": 3,
    "mode": "Meaning Match",
    "prompt": "O que acontece em uma raid de streaming?",
    "chat": "“Thanks for watching! Let’s raid Luna’s channel.”",
    "answers": [
      "O público é direcionado para outra live/canal.",
      "O streamer apaga o próprio canal.",
      "Todos ficam AFK.",
      "O chat é transformado em thread."
    ],
    "correct": 0,
    "explain": "Raid é enviar/levar a audiência de uma live para outra.",
    "slang": "raid"
  },
  {
    "chapter": 3,
    "mode": "Context Check",
    "prompt": "O que significa “lurk”?",
    "chat": "“I’m studying, so I won’t type, but I’ll lurk in the stream.”",
    "answers": [
      "Assistir sem interagir ativamente.",
      "Assumir o papel de moderador.",
      "Criar clips automaticamente.",
      "Fazer uma raid."
    ],
    "correct": 0,
    "explain": "Lurk = acompanhar silenciosamente, sem participar ativamente do chat.",
    "slang": "lurk"
  },
  {
    "chapter": 3,
    "mode": "Tone Check",
    "prompt": "O que “W” comunica?",
    "chat": "“The update fixed the bugs and added the feature everyone wanted. Huge W.”",
    "answers": [
      "Uma avaliação positiva: foi uma vitória/acerto.",
      "Uma derrota grave.",
      "Uma mensagem privada.",
      "Um pedido de resumo."
    ],
    "correct": 0,
    "explain": "W vem de win e é usado como avaliação positiva; L vem de loss e indica algo negativo.",
    "slang": "W / L"
  },
  {
    "chapter": 3,
    "mode": "Meaning Match",
    "prompt": "O que é um “thread”?",
    "chat": "“I put all five explanations in one thread so the discussion stays organized.”",
    "answers": [
      "Um tópico/sequência organizada de posts e respostas.",
      "Uma chamada de voz.",
      "Um tipo de loot.",
      "Um medidor de ping."
    ],
    "correct": 0,
    "explain": "Thread organiza uma discussão em uma sequência/tópico conectado.",
    "slang": "thread"
  },
  {
    "chapter": 3,
    "mode": "Context Check",
    "prompt": "O que “ratioed” sugere aqui?",
    "chat": "“The original post got 200 likes, but the reply got 8,000. It got ratioed.”",
    "answers": [
      "A resposta recebeu proporcionalmente muito mais apoio/engajamento que o post original.",
      "A resposta foi apagada automaticamente.",
      "O autor ficou AFK.",
      "O post entrou em close friends."
    ],
    "correct": 0,
    "explain": "Ratio descreve uma relação de engajamento em que uma resposta supera fortemente o post original.",
    "slang": "ratio"
  },
  {
    "chapter": 3,
    "mode": "Context Check",
    "prompt": "Quem é “OP” neste fórum?",
    "chat": "“OP edited the first post to add the solution.”",
    "answers": [
      "O personagem mais forte do jogo.",
      "O autor da postagem original.",
      "O moderador principal.",
      "O usuário com maior ping."
    ],
    "correct": 1,
    "explain": "Em fóruns, OP pode significar original poster; em games, pode significar overpowered.",
    "slang": "OP"
  },
  {
    "chapter": 3,
    "mode": "Impostor Slang",
    "prompt": "Em qual frase OP significa “overpowered”?",
    "chat": "O sentido muda conforme o contexto.",
    "answers": [
      "“OP updated the thread with more details.”",
      "“Ask OP where the photo came from.”",
      "“This boss can one-shot the whole team; it’s OP.”",
      "“OP replied to my comment.”"
    ],
    "correct": 2,
    "explain": "Somente a terceira fala de algo forte demais; nas outras, OP = original poster.",
    "slang": "OP"
  },
  {
    "chapter": 3,
    "mode": "Build the Reply",
    "prompt": "Qual resposta mostra que você entendeu “TL;DR”?",
    "chat": "“This thread is huge. Can you give me a TL;DR?”",
    "answers": [
      "“Sure: the update was delayed until Friday.”",
      "“Sure: GGWP.”",
      "“Sure: I’ll increase your ping.”",
      "“Sure: I’ll raid the server.”"
    ],
    "correct": 0,
    "explain": "A pessoa pediu um resumo curto do conteúdo longo.",
    "slang": "TL;DR"
  },
  {
    "chapter": 3,
    "mode": "Decode the Chat",
    "prompt": "Interprete a sequência.",
    "chat": "“I lurked for an hour, clipped the funniest moment, then joined the raid.”",
    "answers": [
      "A pessoa assistiu sem falar, salvou um trecho curto e depois foi com o público para outra live.",
      "A pessoa moderou o chat, ficou AFK e perdeu a conexão.",
      "A pessoa fez grind, conseguiu loot e respawnou.",
      "A pessoa publicou um story para close friends."
    ],
    "correct": 0,
    "explain": "Lurk = assistir silenciosamente; clip = trecho curto; raid = migrar a audiência para outra live.",
    "slang": "lurk"
  }
];

const V04_BOSS_QUESTIONS = [
  {
    "chat": "“BRB. Ping me when VC starts; I’ll DM you if I can’t join.”",
    "answers": [
      "“Já volto. Me notifique quando a chamada de voz começar; mando mensagem privada se eu não conseguir entrar.”",
      "“Bom jogo. Aumente minha latência e publique meu story.”",
      "“Vou ficar no FYP e fazer uma raid.”",
      "“Me nerfe quando o loot aparecer.”"
    ],
    "correct": 0,
    "explain": "BRB = já volto; ping = notifique/marque; VC = chamada de voz; DM = mensagem privada."
  },
  {
    "chat": "“The patch nerfed my main, buffed the boss, and now the old meta is dead. We’re cooked.”",
    "answers": [
      "“A atualização enfraqueceu meu personagem principal, fortaleceu o boss, mudou a estratégia dominante e agora estamos em apuros.”",
      "“A atualização criou uma DM, apagou o boss e melhorou o Wi‑Fi.”",
      "“Meu alt viralizou e recebeu uma raid.”",
      "“O moderador publicou um story para close friends.”"
    ],
    "correct": 0,
    "explain": "Nerf, buff, main, meta e cooked aparecem juntos em contexto gamer."
  },
  {
    "chat": "“That clutch play carried the team. GGWP — huge W.”",
    "answers": [
      "“A jogada decisiva levou o time à vitória. Bom jogo, bem jogado — grande acerto.”",
      "“O jogador ficou ausente e aumentou o ping.”",
      "“O vídeo viralizou e virou uma trend.”",
      "“O autor do fórum recebeu um ratio.”"
    ],
    "correct": 0,
    "explain": "Clutch = decisivo; carry = carregar o time; GGWP = good game, well played; W = avaliação positiva."
  },
  {
    "chat": "“I was grinding for loot, got lag, died before the checkpoint and had to respawn. L.”",
    "answers": [
      "“Eu estava repetindo tarefas por recompensas, tive atraso, morri e precisei reaparecer. Foi ruim.”",
      "“Eu estava em uma live, fiz raid e recebi um elogio.”",
      "“Eu postei uma DM e fiz hard launch.”",
      "“Eu estava moderando um thread viral.”"
    ],
    "correct": 0,
    "explain": "Grind, loot, lag, respawn e L formam uma sequência coerente de jogo."
  },
  {
    "chat": "“It’s giving final boss energy. That edit ate, the clip went viral, and now it’s all over my FYP.”",
    "answers": [
      "“Tem vibe de boss final. A edição arrasou, o trecho viralizou e agora aparece no meu feed recomendado.”",
      "“O boss recebeu um nerf e o jogador ficou AFK.”",
      "“O autor do fórum criou uma DM privada.”",
      "“A conexão ficou lenta e o conteúdo foi removido.”"
    ],
    "correct": 0,
    "explain": "It’s giving = transmite uma vibe; ate = arrasou; clip = trecho; viral e FYP descrevem alcance/recomendação."
  },
  {
    "chat": "“She soft launched it for weeks, then hard launched yesterday. Her mutuals already knew. IYKYK.”",
    "answers": [
      "“Ela deu pistas por semanas e depois revelou explicitamente; quem a seguia reciprocamente já sabia. Quem sabe, sabe.”",
      "“Ela fez grind por semanas e depois recebeu loot.”",
      "“Ela ficou AFK e depois entrou em VC.”",
      "“Ela nerfou o post e aumentou o ping.”"
    ],
    "correct": 0,
    "explain": "Soft launch é sutil; hard launch é explícito; mutuals = follows recíprocos; IYKYK = referência compartilhada."
  },
  {
    "chat": "“OP posted a long thread. TL;DR: the update is mid. One reply disagreed and ratioed the post.”",
    "answers": [
      "“O autor original escreveu um tópico longo; resumindo, achou a atualização mediana. Uma resposta discordou e recebeu muito mais engajamento.”",
      "“O personagem forte fez uma live e recebeu loot.”",
      "“O moderador entrou em VC e ficou AFK.”",
      "“O jogador ganhou uma partida e escreveu GGWP.”"
    ],
    "correct": 0,
    "explain": "Aqui OP = original poster; thread, TL;DR, mid, reply e ratio pertencem ao contexto de fórum/rede."
  },
  {
    "chat": "“Chat, I’m gonna lurk while the mod cleans the spam. Clip anything funny, then we’ll raid someone. W plan?”",
    "answers": [
      "“Pessoal do chat, vou assistir quieto enquanto o moderador limpa o spam; salvem momentos engraçados e depois iremos para outra live. Bom plano?”",
      "“Vou aumentar o ping, respawnar e fazer grind.”",
      "“Vou postar apenas para close friends e dar hard launch.”",
      "“Vou nerfar o servidor e abandonar a partida.”"
    ],
    "correct": 0,
    "explain": "Chat = público; lurk = assistir sem interagir; mod = moderador; clip = recorte; raid = migrar audiência; W = positivo."
  }
];

QUESTIONS.push(...V04_QUESTIONS);
BOSS_QUESTIONS.push(...V04_BOSS_QUESTIONS);

// Make the chapter cards reflect the broader material.
CHAPTERS[0].desc = 'Mensagens privadas, Discord, chamadas, presença e notificações.';
CHAPTERS[0].modes = 'DM • AFK • BRB • server • VC • ping';
CHAPTERS[1].desc = 'Gameplay, balanceamento, conexão, progressão e comportamento.';
CHAPTERS[1].modes = 'meta • clutch • carry • grind • lag • GGWP';
CHAPTERS[2].desc = 'TikTok, Instagram, trends, posts e linguagem de redes.';
CHAPTERS[2].modes = 'FYP • viral • ate • slay • soft/hard launch';
CHAPTERS[3].desc = 'Streaming, live chat, fóruns e palavras que mudam com o contexto.';
CHAPTERS[3].modes = 'mod • clip • raid • lurk • thread • ratio';

// Boot only after the expanded database is loaded.

