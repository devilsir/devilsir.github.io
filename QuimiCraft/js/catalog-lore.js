"use strict";

globalThis.QuimiCraftCatalogLore=(()=>{
  // Cada ficha possui [história única, curiosidades únicas]
  const notes={
    // === FOLCLORE ===
    curupira:[
      "Os guias mais antigos da mata falam de um protetor de cabelos em brasa e pés virados para trás. Quem abate árvores sem necessidade ou fere animais silvestres acaba seguindo rastros que dão voltas até o ponto de partida.",
      "O mito do Curupira tem origem tupi-guarani e aparece em registros desde o século XVI. Seus pés invertidos servem justamente para confundir caçadores que tentam rastreá-lo na floresta."
    ],
    saci:[
      "Sempre que um redemoinho ergue folhas secas em plena tarde calma, os moradores juram ver um gorro vermelho girando no meio da poeira. Ele apaga fogueiras descuidadas e desaparece antes que alguém chegue perto.",
      "Na tradição popular brasileira, o Saci-Pererê perde os poderes mágicos se alguém conseguir capturar seu gorro vermelho ou prendê-lo dentro de uma garrafa com uma peneira."
    ],
    boitata:[
      "Antes mesmo de existirem lampiões nas estradas, relatos indígenas já descreviam uma serpente luminosa guardando campos e várzeas. Ela desliza à noite sobre o capim úmido e apaga focos de incêndio.",
      "O nome Boitatá vem do tupi 'mbaê-tatá' (coisa de fogo) e costuma ser associado ao fenômeno real do fogo-fátuo — gases inflamáveis liberados pela decomposição de matéria orgânica em brejos."
    ],
    pink_boto:[
      "Nas noites de festa às margens dos grandes rios, os ribeirinhos contam de um visitante elegante de terno branco que nunca tira o chapéu. Antes de o sol raiar, ele some na névoa e um dorso rosado corta o remanso.",
      "Na biologia real, o boto-cor-de-rosa (Inia geoffrensis) nasce acinzentado e fica mais rosado com a idade devido a capilares próximos à pele e cicatrizes; além disso, suas vértebras cervicais não são fundidas, permitindo virar a cabeça quase 90°."
    ],
    headless_mule:[
      "Na passagem de quinta para sexta-feira, estradas desertas ecoam o galope metálico de cascos em disparada. Em vez de cabeça, uma labareda viva ilumina o caminho de quem cruza sua rota.",
      "A lenda da Mula sem Cabeça mistura tradições ibéricas e brasileiras. Segundo o folclore, suas ferraduras são de aço ou prata e seus relinchos podem ser ouvidos a quilômetros de distância."
    ],
    werewolf:[
      "Quando a lua cheia se eleva sobre as encostas e povoados, antigos currais amanhecem com tábuas arranhadas por dentro. Nenhuma arma comum parece deter a fera — somente a prata deixa marca em seu pelo.",
      "A associação entre prata e lobisomens popularizou-se na literatura europeia do século XIX, mas mitos de humanos que se transformam em lobos existem desde a Grécia Antiga (licantropia)."
    ],

    // === DRAGÕES ===
    ice_dragon:[
      "Expedições polares avistam primeiro a sombra azulada deslizando sob o céu cinzento dos fiordes. O Dragão Azul prefere planícies congeladas e só ataca quando seu território ou covil é invadido.",
      "Suas escamas cristalinas refletem a luz baixa do inverno como gelo glacial compacto. Seus cristais de saliva retêm reações endotérmicas capazes de resfriar ligas metálicas."
    ],
    fire_dragon:[
      "Nas caldeiras vulcânicas, o ar treme muito antes de o Dragão Vermelho surgir no horizonte. Ele defende os picos de basalto com rajadas incandescentes que derretem a rocha ao redor do ninho.",
      "Sua crista serrilhada dissipa o excesso de calor corporal após grandes rajadas. Apenas o Escudo Antidragão consegue conter sua baforada contínua sem falhar imediatamente."
    ],
    nature_dragon:[
      "Onde o Dragão Verde pousa para descansar, sementes presas entre suas escamas germinam na estação seguinte. Pacífico por natureza, prefere florestas antigas e aprecia mel e frutas silvestres.",
      "É o único dragão de temperamento calmo capaz de aceitar aproximação sem combate. Suas asas largas imitam o desenho de folhas nervuradas para planar suavemente entre copas altas."
    ],
    time_dragon:[
      "Observadores das salinas e cânions relatam que o Dragão Bronze parece surgir sempre na mesma curva do vento, como se medisse as horas pelo sol. Só entra em combate quando provocado.",
      "Os anéis dourados em sua coroa e cauda giram em cadência regular como um pêndulo. Sua saliva contém pigmentos oscilantes inspirados em reações químicas periódicas."
    ],
    earth_dragon:[
      "Antes mesmo de aparecer entre os rochedos, o Dragão Negro anuncia sua chegada com tremores surdos no subsolo. Sua carapaça espessa de pedra resiste a impactos que derrubariam muros inteiros.",
      "Apesar das asas curtas e pesadas, usa a cauda em forma de martelo como contrapeso para voos rasantes. Os minerais de sua saliva lembram silicatos usados para consolidar solos."
    ],

    // === ÁRVORES VIVAS ===
    living_tree:[
      "O Guardião de Casca desperta devagar quando o vento percorre as clareiras de carvalho. Caminha com passos graves entre os troncos e ajuda viajantes que oferecem mel puro.",
      "Suas raízes articuladas funcionam como pés capazes de escalar paredões verticais. Mesmo em repouso, sua copa abriga pequenos pássaros e insetos polinizadores."
    ],
    living_tree_warden:[
      "Coberto de musgo úmido desde os ombros até as raízes, o Vigia escuta vibrações no solo a dezenas de metros. Basta ferir uma árvore da aldeia para que ele desperte em defesa do bosque.",
      "O musgo vivo em sua casca retém umidade como uma esponja natural, mantendo suas juntas flexíveis mesmo durante estações secas."
    ],
    living_tree_elder:[
      "A Anciã da Copa guarda anéis de crescimento mais velhos que a própria Vila dos Elementos. Sua folhagem outonal brilha sob a luz da tarde enquanto orienta os guardiões mais jovens.",
      "Árvores milenares na natureza registram décadas de chuvas, secas e incêndios na largura de cada anel de madeira — ciência conhecida como dendrocronologia."
    ],
    living_tree_pine:[
      "Adaptado às encostas geladas da taiga, o Arvoroso Pinheiro sustenta camadas grossas de neve sem curvar os braços. Sua resina perfumada impede que a seiva congele durante nevascas.",
      "As folhas em forma de agulha das coníferas reduzem a perda de água no frio extremo e permitem que a neve escorregue antes de quebrar os galhos."
    ],
    living_tree_cherry:[
      "Nos bosques rosados, a Arvorosa Cerejeira marca o início de cada estação espalhando pétalas a cada passo. Costuma guiar viajantes pelas trilhas floridas quando ganha um pote de mel.",
      "A floração curta das cerejeiras concentra néctar em poucos dias, atraindo nuvens inteiras de polinizadores de uma só vez."
    ],
    living_tree_willow:[
      "O Arvoroso Salgueiro prefere as margens calmas onde seus ramos pendentes roçam a água. Quando para para descansar, parece uma árvore comum inclinada sobre o lago.",
      "A casca de salgueiros reais contém salicina, substância natural que inspirou a descoberta do ácido acetilsalicílico (aspirina)."
    ],
    living_tree_mangrove:[
      "Com raízes escoras que vencem a lama funda dos estuários, o Arvoroso do Mangue caminha por áreas onde qualquer outro gigante afundaria. Protege o berçário costeiro de invasores.",
      "Árvores de mangue reais filtram grande parte do sal marinho nas raízes e respiram por raízes aéreas chamadas pneumatóforos que emergem do lodo."
    ],

    // === SENTINELAS DE EXPEDIÇÃO ===
    den_sentinel:[
      "Erguido a partir de blocos de basalto escuro na entrada dos covis dracônicos, o Vigia de Basalto permanece imóvel até detectar passos invasores sobre a soleira.",
      "O basalto é uma rocha vulcânica densa e rica em ferro e magnésio, muito resistente ao desgaste mecânico e térmico."
    ],
    sapphire_sentinel:[
      "Guardando câmaras glaciais de dragões azuis, o Vigia de Safira condensa o frio do ambiente em sua armadura mineral. Seus golpes ressoam como gelo partindo.",
      "A safira é uma variedade do mineral coríndon (Al₂O₃) com dureza 9 na escala de Mohs — perdendo apenas para o diamante."
    ],
    ruby_sentinel:[
      "Forjado sob o calor dos covis vulcânicos, o Vigia de Rubi mantém o núcleo incandescente mesmo em cavernas fechadas. Avança sem recuar contra quem ameaça os depósitos de minério.",
      "Rubis e safiras são quimicamente o mesmo mineral (óxido de alumínio); o que dá a cor vermelha intensa ao rubi são traços de crômio na rede cristalina."
    ],
    emerald_sentinel:[
      "Nas clareiras ocultas dos dragões da natureza, o Vigia de Esmeralda protege os veios verdes encravados na rocha. Seus movimentos são ligeiramente mais ágeis que os de outros golens minerais.",
      "A esmeralda é uma variedade verde do berilo (Be₃Al₂Si₆O₁₈) colorida por pequenas quantidades de crômio ou vanádio."
    ],
    opal_sentinel:[
      "O Vigia de Opala patrulha covis em cânions e salinas, refletindo faixas furta-cor a cada movimento dos braços. Suas placas internas armazenam cargas sutis de energia.",
      "Diferente da maioria das gemas, a opala não forma cristais geométricos rígidos: é composta por microesferas de sílica hidratada que difratam a luz em cores vivas."
    ],
    amethyst_sentinel:[
      "Construído em torno de grandes geodos roxos, o Vigia de Ametista defende covis profundos em montanhas. Cada impacto no solo faz suas pontas de quartzo vibrarem em coro.",
      "A cor violeta da ametista surge da presença de impurezas de ferro submetidas à radiação natural no interior das rochas por milhões de anos."
    ],
    silver_sentinel:[
      "Esculpido em ligas de prata polida, o Vigia de Prata reflete a luz das tochas no fundo dos covis. Seus passos metálicos ecoam muito antes de surgir na curva da galeria.",
      "A prata é o metal com maior condutividade elétrica e térmica da natureza e já era usada na Antiguidade para fabricar espelhos."
    ],
    gold_sentinel:[
      "O mais pesado dos guardiões metálicos reveste seu núcleo com chapas espessas de ouro. Lento ao caminhar, compensa a baixa velocidade com golpes devastadores.",
      "O ouro é tão maleável que um único grama pode ser martelado até formar uma folha de cerca de um metro quadrado, e não oxida com o ar ou a água."
    ],
    dune_sentinel:[
      "Erguida entre colunas de arenito nos Templos das Dunas, esta sentinela desperta quando a areia cede sob os pés de exploradores em busca dos baús antigos.",
      "Grãos de areia carregados pelo vento do deserto podem esculpir rochas inteiras por abrasão ao longo de séculos, criando formações chamadas ventifactos."
    ],
    lab_sentinel:[
      "Programado em antigos laboratórios soterrados para conter vazamentos e invasões, o Autômato de Contenção continua patrulhando corredores esquecidos muito depois de seus criadores partirem.",
      "Seus circuitos de cobre e selos de borracha resistem à umidade subterrânea, preservando sua rotina mecânica por gerações."
    ],

    // === GRITADORES (PLANTAS) ===
    "screamer:forest":[
      "O Gritador da Mata permanece recolhido como um botão comum sob as copas sombreadas. Quando passos pesados ou golpes de picareta vibram no solo, suas pétalas se abrem de súbito num grito ensurdecedor.",
      "Algumas plantas reais, como a dormideira (Mimosa pudica), reagem quase instantaneamente a vibrações e toques usando rápidas mudanças de pressão da água nas células."
    ],
    "screamer:marsh":[
      "Nas bordas lamacentas dos brejos e manguezais, o Gritador do Brejo espalha raízes sensíveis às mínimas ondas na água parada. Sua câmara sonora amplia o som sobre o terreno plano.",
      "Plantas de áreas alagadas desenvolvem tecidos esponjosos cheios de canais de ar (aerênquima) que conduzem oxigênio até as raízes submersas — e aqui amplificam seu grito."
    ],
    "screamer:dry":[
      "Camuflado contra o arenito avermelhado das chapadas, o Gritador da Chapada conserva água em pétalas carnudas e se orienta pela vibração de pedras soltas antes de disparar seu aviso sonoro.",
      "Em cânions estreitos, as ondas sonoras refletem repetidamente nas paredes rochosas, multiplicando o alcance do eco em ambientes áridos."
    ],
    "screamer:cold":[
      "Rente ao solo congelado das serras, o Gritador da Serra desperta ao menor estalo da crosta de gelo. Suas pétalas pálidas quase se confundem com a neve ao redor.",
      "No ar frio e denso das montanhas, o som tende a curvar-se junto ao solo, permitindo que ruídos sejam ouvidos com nitidez a distâncias surpreendentes."
    ],

    // === ANIMAIS TERRESTRES ===
    cow:[
      "Os rebanhos de vacas acompanham os vales mais verdes da planície, memorizando o caminho até os melhores pastos e retornando juntos sempre que o tempo vira.",
      "Vacas possuem um estômago dividido em quatro compartimentos (rúmen, retículo, omaso e abomaso) e conseguem enxergar quase 330° ao redor sem virar a cabeça."
    ],
    pig:[
      "Com o focinho ágil, os porcos reviram a terra fofa das planícies em busca de raízes, tubérculos e larvas. Vivem em pequenas varas e se banham na lama para aliviar o calor.",
      "Porcos têm pouquíssimas glândulas sudoríparas — por isso rolam na lama para resfriar o corpo e proteger a pele do sol. Também estão entre os mamíferos mais inteligentes."
    ],
    rabbit:[
      "Os coelhos vivem em colônias próximas a tocas cheias de saídas de emergência. Alternam momentos imóveis pastando com corridas em zigue-zague ao menor sinal de predador.",
      "Os dentes incisivos do coelho crescem continuamente durante toda a vida e são desgastados ao roer gramíneas e fibras. Eles saltam em zigue-zague para confundir predadores velozes."
    ],
    chicken:[
      "Em bandos atentos, as galinhas ciscam sementes e insetos o dia inteiro e se abrigam sob coberturas ao anoitecer ou quando o vento anuncia tempestade.",
      "Galinhas possuem excelente visão em cores — inclusive enxergam espectro ultravioleta — e são parentes evolutivas vivas relativamente próximas dos dinossauros terópodes."
    ],
    sheep:[
      "As ovelhas sobem os prados em rebanhos unidos, seguindo sempre os indivíduos mais experientes na busca por pastos macios. Sua lã espessa as protege de noites frias.",
      "Ovelhas conseguem reconhecer e lembrar até 50 rostos diferentes (de outras ovelhas e de humanos) por mais de dois anos, e suas pupilas horizontais dão amplo campo de visão."
    ],
    deer:[
      "Nas clareiras frias da taiga, os cervos se movem em pequenos grupos silenciosos, levantando as orelhas ao menor estalo de galho antes de escapar em saltos longos.",
      "Os chifres (galhadas) dos cervos machos são feitos de osso verdadeiro que cai e cresce novamente todo ano — um dos tecidos de crescimento mais rápido do reino animal."
    ],
    owl:[
      "Quando o sol se esconde, a Coruja Boreal abandona seu poleiro camuflado e patrulha as trilhas florestais sem produzir ruído. Caça coelhos e pequenos animais com precisão noturna.",
      "As penas da borda das asas da coruja têm franjas serrilhadas que quebram a turbulência do ar, tornando seu voo quase totalmente silencioso. Além disso, seus ouvidos são assimétricos para localizar presas no escuro."
    ],
    capivara:[
      "As capivaras reúnem-se em grupos tranquilos perto de lagos e rios, deixando rampas marcadas no barro para mergulhar rapidamente se uma onça ou jacaré se aproximar.",
      "A capivara (Hydrochoerus hydrochaeris) é o maior roedor do mundo, podendo passar de 60 kg. Seus olhos, orelhas e narinas ficam no alto da cabeça para vigiar enquanto nada."
    ],
    cat:[
      "Os gatos rondam os beirais e praças das vilas, aquecendo-se nos telhados ao sol e vigiando pequenos roedores e aves ao entardecer. Apreciam peixe fresco e passos calmos.",
      "Gatos conseguem girar o corpo no ar para cair de pé graças ao reflexo de endireitamento e à coluna extremamente flexível. Seus bigodes medem se uma abertura é larga o suficiente para passar."
    ],
    dog:[
      "Companheiros fiéis dos povoados, os cães acompanham o movimento das estradas e reconhecem de longe o cheiro de quem retorna ao lar. São atentos, sociáveis e brincalhões.",
      "O olfato de um cão pode ser dezenas de milhares de vezes mais sensível que o humano, com até 300 milhões de receptores olfativos e uma área cerebral dedicada a identificar odores."
    ],
    jaguar:[
      "Soberana das selvas tropicais, manguezais e pântanos, a onça-pintada caminha sozinha sob a sombra das folhas. Excelente nadadora, embosca capivaras, antas e até jacarés nas margens.",
      "A onça-pintada (Panthera onca) é o maior felino das Américas e possui a mordida proporcionalmente mais forte entre todos os felinos, capaz de perfurar cascos de tartarugas e crânios de jacarés."
    ],
    tiger:[
      "Solitário e territorial, o tigre percorre taigas e bosques densos escondido entre faixas de luz e sombra. Abate grandes cervos e javalis em arrancadas curtas e fulminantes.",
      "O padrão de listras de cada tigre é tão único quanto uma impressão digital humana — e o desenho está gravado até na pele sob os pelos. Diferente de muitos felinos, tigres adoram nadar."
    ],
    lion:[
      "Os leões dominam as savanas abertas em bandos cooperativos. Passam as horas mais quentes descansando à sombra e coordenam cercos precisos contra gazelas, javalis e bisões ao cair da tarde.",
      "O leão (Panthera leo) é o único felino verdadeiramente social que vive em grandes bandos familiares. Seu rugido pode ser ouvido a até 8 km de distância na savana aberta."
    ],
    wolf:[
      "Em matilhas coordenadas, os lobos percorrem grandes distâncias pelas florestas e montanhas frias. Cercam presas rápidas pelos flancos e mantêm forte vínculo entre os membros do grupo.",
      "Lobos podem correr a até 60 km/h em arrancadas e trotar dezenas de quilômetros por dia. O uivo serve para reunir a matilha e demarcar território sem necessidade de confronto físico."
    ],
    lynx:[
      "Com tufos escuros nas pontas das orelhas e patas largas, o Lince das Geadas percorre silenciosamente a neve fofa da taiga e dos prados alpinos em busca de lebres e pequenas aves.",
      "As patas largas e peludas do lince funcionam como raquetes de neve naturais, distribuindo seu peso para não afundar. Seus tufos auriculares ajudam a captar sons mínimos sob a neve."
    ],
    fennec:[
      "Habitante dos desertos e salinas, o feneco escapa do calor escaldante dentro de tocas subterrâneas frescas durante o dia e sai à noite para caçar insetos, roedores e raízes.",
      "O feneco (Vulpes zerda) é a menor raposa do mundo, mas tem as maiores orelhas em proporção ao corpo: elas dissipam calor como radiadores e detectam presas se movendo debaixo da areia."
    ],
    rime_fox:[
      "A Raposa do Gelo Azul adapta-se aos ventos cortantes da tundra e dos fiordes. Sua cauda espessa serve de cobertor quando se encolhe sobre a neve para descansar.",
      "As raposas árticas suportam temperaturas abaixo de −50 °C graças à pelagem densa que muda de cor conforme a estação e às patas recobertas de pelo."
    ],
    opossum:[
      "O saruê atravessa matas, brejos e quintais durante a noite usando a cauda preênsil para se equilibrar nos galhos. É um onívoro valente que até enfrenta serpentes peçonhentas.",
      "O gambá-de-orelha-preta / saruê é um marsupial brasileiro naturalmente resistente ao veneno de jararacas e cascavéis, ajudando a controlar serpentes, carrapatos e escorpiões."
    ],
    anteater:[
      "O tamanduá-bandeira caminha devagar pelas chapadas e bordas da mata com o focinho rente ao chão, farejando cupinzeiros. Quando encurralado por onças, ergue-se nas patas traseiras e revida com garras enormes.",
      "O tamanduá-bandeira (Myrmecophaga tridactyla) não tem dentes, mas sua língua pegajosa chega a 60 cm e pode entrar e sair mais de 150 vezes por minuto para devorar até 30 mil formigas e cupins por dia."
    ],
    brown_bear:[
      "Solitário nas montanhas, taigas e sequoias, o urso-pardo alterna a busca por frutas, raízes e peixes com a caça de cervos e javalis. É territorial e impõe respeito até a matilhas de lobos.",
      "Apesar de pesar centenas de quilos, o urso-pardo pode correr a mais de 50 km/h por curtas distâncias e possui um olfato estimado como várias vezes mais apurado que o de um cão farejador."
    ],
    black_bear:[
      "O urso-negro percorre florestas temperadas e bosques de cerejeiras em busca de frutos, mel, insetos e brotos. Prefere evitar conflitos, mas defende-se com força se provocado.",
      "Diferente do urso-pardo, o urso-negro é um excelente escalador de árvores graças às garras mais curtas e curvadas, subindo troncos altos tanto para buscar frutos quanto para escapar de perigo."
    ],
    polar_bear:[
      "Majestoso e solitário nas costas árticas, o urso-polar percorre enormes distâncias sobre o gelo marinho aguardando focas-aneladas saírem das aberturas para respirar.",
      "O pelo do urso-polar não é branco: cada fio é translúcido e oco, refletindo a luz visível enquanto sua pele por baixo é preta para absorver calor solar."
    ],
    bison:[
      "As manadas de bisões abrem trilhas largas pelas pradarias e planícies floridas. Embora pastem calmamente, formam uma barreira poderosa e revidam com investidas pesadas se atacados.",
      "O bisão é o maior mamífero terrestre das Américas, podendo atingir quase uma tonelada. Mesmo tão pesado, consegue saltar cercas de quase 2 metros e correr a até 55 km/h."
    ],
    badger:[
      "Escavador incansável de cânions calcários e termas minerais, o Texugo-das-Pedras constrói galerias fundas sob rochas e sai à noite atrás de insetos, raízes, coelhos e serpentes.",
      "Texugos têm pele grossa e solta que dificulta mordidas fatais de predadores e serpentes, além de garras dianteiras longas capazes de cavar solo duro em segundos."
    ],
    iron_armadillo:[
      "O Tatu de Hematita vive em encostas ricas em óxido de ferro, onde cava tocas profundas. Sua carapaça escura ganha brilho metálico sob o sol e se fecha diante de vibrações bruscas.",
      "Tatus possuem carapaça formada por placas ósseas recobertas de queratina (osteodermas) e conseguem prender a respiração por até 6 minutos para cavar ou atravessar riachos caminhando no fundo."
    ],
    amber_ibis:[
      "Com o bico longo e curvo, o Íbis Âmbar sonda a lama dos deltas e brejos em busca de crustáceos, larvas e pequenos peixes. Costuma deslocar-se em pequenos bandos silenciosos.",
      "O formato curvado do bico dos íbis permite tatear no lodo turvo sem precisar enxergar a presa: sensores táteis na ponta detectam o menor movimento de invertebrados escondidos."
    ],
    lumen_moth:[
      "A Mariposa Lúmen repousa camuflada durante o dia e enche os bosques violetas de clarões esverdeados à noite, sobrevoando cogumelos luminosos em busca de néctar e esporos.",
      "Muitas mariposas noturnas usam antenas plumosas tão sensíveis que detectam uma única molécula de feromônio a quilômetros de distância, orientando-se também pela luz da lua."
    ],
    wild_boar:[
      "Em varas barulhentas pelas florestas e bosques, o Javali do Bosque fuça o solo em busca de raízes, fungos e insetos. Diferente do porco doméstico, enfrenta predadores com suas presas curvas.",
      "As presas do javali são dentes caninos que crescem continuamente e se afiam pelo atrito entre os superiores e inferiores. Javalis conseguem farejar raízes e trufas a dezenas de centímetros sob a terra."
    ],
    flower_hare:[
      "Ágil e desconfiada, a Lebre-dos-Prados se esconde entre flores altas e grama densa nas planícies floridas. Ao perceber movimento suspeito, dispara em saltos longos e rápidos.",
      "Diferente dos coelhos, as lebres não costumam cavar tocas fundas: seus filhotes já nascem com pelos e olhos abertos, prontos para correr poucas horas após o nascimento."
    ],
    snow_hare:[
      "Camuflada contra a neve dos prados alpinos, tundras e fiordes, a Lebre-da-Neve roe brotos e líquens sob o frio intenso enquanto vigia raposas, linces e corujas.",
      "Lebres das regiões geladas trocam a pelagem marrom do verão por um manto branco puro no inverno, guiadas pela diminuição das horas de luz solar (fotoperíodo)."
    ],
    salt_marsh_rabbit:[
      "Adaptada às salinas e deltas salobros, a Lebre das Salinas alimenta-se de plantas resistentes ao sal e aproveita os juncos costeiros para escapar de fenecos e corujas.",
      "Espécies de coelhos e lebres de áreas alagadas (como o coelho-do-pântano) são ótimas nadadoras e usam canais de água para cortar o rastro olfativo de predadores."
    ],
    mountain_goat:[
      "A Cabra-das-Cristas escala paredões íngremes de montanhas e cânions onde poucos predadores conseguem segui-la. Vive em pequenos rebanhos e defende seu espaço com cabeçadas firmes.",
      "Os cascos das cabras-montesas têm bordas externas duras e almofadas internas macias e aderentes que funcionam como sapatilhas de escalada em rochas quase verticais."
    ],
    scoria_ram:[
      "Habituado às encostas ásperas de regiões vulcânicas e caldeiras vítreas, o Carneiro da Escória pasta gramíneas resistentes entre as pedras quentes e disputa liderança em choques estrondosos de chifres.",
      "Carneiros selvagens possuem crânios com câmaras de ar esponjosas que absorvem o impacto de cabeçadas a mais de 30 km/h durante disputas territoriais."
    ],
    savanna_gazelle:[
      "Em manadas atentas pela savana e chapadas ocres, a Gazela da Savana alterna o pastoreio com saltos elásticos que avisam o grupo inteiro sobre leões à espreita.",
      "Gazelas executam um salto vertical rígido chamado 'stotting' para mostrar aos predadores que estão saudáveis e velozes demais para valer uma perseguição, podendo passar de 70 km/h."
    ],
    cacao_tapir:[
      "A Anta-do-Cacau abre trilhas permanentes na mata fechada das selvas tropicais, derrubando frutos maduros e refrescando-se em riachos sempre que o calor aperta.",
      "A anta é o maior mamífero terrestre nativo da América do Sul e é chamada de 'jardineira da floresta' porque dispersa sementes intactas por quilômetros. Seu pequeno focinho flexível é uma tromba preênsil."
    ],
    marsh_heron:[
      "Imóvel como uma estátua nas águas rasas de pântanos e estuários, a Garça-do-Estuário espera um peixe ou camarão passar ao alcance antes de disparar o bico como um arpão.",
      "As garças possuem vértebras cervicais especiais que dobram o pescoço em 'S', armazenando energia elástica para projetar a cabeça para frente em frações de segundo."
    ],
    crystal_heron:[
      "Ave elegante dos bosques de cristais, a Garça Cristalina pesca em poças minerais translúcidas, onde sua plumagem azulada quase se funde aos reflexos prismáticos da água.",
      "Garças produzem um pó fino a partir de penas especiais no peito ('plumas de pó') que usam para limpar muco de peixe e impermeabilizar a plumagem."
    ],
    lilac_songbird:[
      "Em bandos alegres nos bosques lilases, o Cantor-lilás salta entre ramos floridos colhendo sementes e insetos. Seu canto suave costuma anunciar o amanhecer.",
      "Pássaros canoros possuem um órgão vocal duplo chamado siringe, que lhes permite emitir duas notas musicais distintas ao mesmo tempo."
    ],
    forest_deer:[
      "Maior e de pelagem mais quente que o parente da taiga, o Cervo das Sequoias move-se em manadas discretas sob árvores gigantes, alimentando-se de brotos, folhas e fungos.",
      "Cervos florestais usam glândulas odoríferas perto dos olhos e entre os cascos para marcar trilhas seguras e avisar outros membros do grupo sobre perigos."
    ],
    mangrove_capivara:[
      "Adaptada aos manguezais e deltas salobros, a Capivara do Mangue convive em grupos coesos entre as raízes aéreas, nadando com facilidade entre canais de maré.",
      "Capivaras possuem membranas parciais entre os dedos que facilitam a natação e conseguem ficar totalmente submersas por até 5 minutos para escapar de predadores."
    ],
    frost_owl:[
      "Patrulhando fiordes glaciais, tundras e prados alpinos, a Coruja dos Fiordes caça lebres-da-neve sobre terreno aberto. Suas penas brancas densas cobrem até os dedos.",
      "Corujas árticas, ao contrário de muitas outras espécies de corujas, também caçam durante o dia no verão polar quando o sol quase não se põe."
    ],
    maned_wolf:[
      "O lobo-guará desliza silenciosamente com suas pernas longas pelo capim alto da savana e das chapadas ocres. Solitário e noturno, combina frutos do cerrado com a caça de pequenas presas.",
      "Apesar do nome, o lobo-guará (Chrysocyon brachyurus) não é um lobo verdadeiro nem uma raposa, mas um canídeo único da América do Sul. Até metade de sua dieta vem de frutos, especialmente a lobeira."
    ],
    hoary_fox:[
      "Pequena e discreta, a raposa-do-campo percorre savanas e planícies em casais durante a noite, farejando cupinzeiros, frutos e pequenos roedores com agilidade.",
      "A raposa-do-campo (Lycalopex vetulus) é o menor canídeo do Brasil e tem molares mais largos que outras raposas, adaptados especialmente para mastigar cupins e besouros."
    ],
    elephant:[
      "As manadas matriarcais de elefantes-africanos atravessam a savana guiadas pelas fêmeas mais velhas, que lembram a localização de fontes de água mesmo em secas severas.",
      "O elefante-africano é o maior animal terrestre vivo. Sua tromba reúne mais de 40 mil músculos, suas orelhas resfriam o sangue e ele se comunica por infrassons que viajam quilômetros pelo solo."
    ],
    rhinoceros:[
      "De porte maciço e temperamento territorial, o rinoceronte-branco pasta capim curto na savana aberta. Apesar de sua aparência calma, investe com força se um predador ameaçar seu espaço.",
      "O chifre do rinoceronte não é de osso nem de marfim: é formado inteiramente por fibras compactadas de queratina — a mesma proteína das unhas e dos cabelos humanos."
    ],
    hippopotamus:[
      "Durante o dia, os hipopótamos permanecem em grupos quase submersos nos pântanos e rios da savana para proteger a pele do sol; ao anoitecer, saem à terra firme para pastar.",
      "Hipopótamos secretam um fluido avermelhado chamado 'suor de sangue' que funciona como protetor solar e antibiótico natural. Apesar do peso, não flutuam — correm pelo fundo dos rios."
    ],
    golden_lion_tamarin:[
      "Em grupos familiares unidos na selva tropical e nas florestas, o mico-leão-dourado salta de galho em galho usando os dedos compridos para buscar insetos e frutos maduros.",
      "O mico-leão-dourado (Leontopithecus rosalia) é endêmico da Mata Atlântica brasileira. Em seus grupos, o pai e os irmãos mais velhos ajudam ativamente a carregar os filhotes nas costas."
    ],
    green_iguana:[
      "A iguana-verde aquece-se ao sol nos galhos altos e margens da selva tropical e dos manguezais, alimentando-se de folhas tenras e mergulhando na água se sentir ameaça.",
      "Iguanas-verdes possuem um 'terceiro olho' (olho parietal) no topo da cabeça que não forma imagens, mas detecta mudanças de luz e sombras de aves predadoras como a harpia."
    ],
    toco_toucan:[
      "Com seu bico alaranjado inconfundível, o tucano-toco percorre em pequenos bandos as copas das selvas e chapadas, alcançando frutos nas pontas de galhos finos.",
      "O bico gigante do tucano-toco (Ramphastos toco) é surpreendentemente leve por ser esponjoso por dentro — e funciona como um radiador térmico, liberando calor corporal pelo fluxo de sangue."
    ],
    hyacinth_macaw:[
      "Voando quase sempre em casais fiéis sobre pântanos e savanas, a arara-azul-grande anuncia sua passagem com vocalizações fortes e procura palmeiras carregadas de coquinhos.",
      "A arara-azul-grande (Anodorhynchus hyacinthinus) é o maior psitacídeo voador do mundo, chegando a 1 metro de comprimento. Seu bico tem força suficiente para quebrar cascas duríssimas de coco."
    ],
    harpy_eagle:[
      "Soberana das copas na selva tropical, a harpia observa pacientemente os galhos abaixo antes de mergulhar entre as árvores para capturar micos, quatis, iguanas e saruês.",
      "A harpia (Harpia harpyja) tem garras traseiras maiores que as de um urso-pardo e exerce uma pressão de esmagamento imensa. O disco de penas em seu rosto ajuda a direcionar sons para os ouvidos."
    ],
    jabiru:[
      "De plumagem branca e colar vermelho na base do pescoço, o tuiuiú caminha lentamente pelas águas rasas do pântano e dos deltas, capturando peixes com seu bico comprido.",
      "O tuiuiú (Jabiru mycteria) é a ave símbolo do Pantanal e uma das maiores aves voadoras das Américas, com envergadura que pode ultrapassar 2,6 metros. Constrói ninhos gigantes reaproveitados por décadas."
    ],
    rufous_bellied_thrush:[
      "O sabiá-laranjeira percorre bordas de florestas e planícies floridas saltitando no chão atrás de minhocas e frutos maduros. Seu canto melodioso marca as manhãs de primavera.",
      "O sabiá-laranjeira (Turdus rufiventris) é a ave símbolo oficial do Brasil e é famoso por começar a cantar ainda antes do amanhecer durante a época reprodutiva."
    ],
    three_banded_armadillo:[
      "Habitante discreto das savanas, chapadas e badlands, o tatu-bola sai à noite atrás de formigas e cupins. Diante de predadores, transforma-se numa esfera blindada quase impenetrável.",
      "O tatu-bola (Tolypeutes tricinctus) é endêmico do Brasil e é um dos únicos tatus do mundo capazes de se fechar completamente em uma bola perfeita, encaixando cabeça e cauda como um quebra-cabeça."
    ],
    pampas_deer:[
      "Elegante e veloz, o veado-campeiro forma pequenos grupos nos campos abertos e chapadas, erguendo o pescoço acima do capim para vigiar lobos e grandes felinos.",
      "Machos de veado-campeiro (Ozotoceros bezoarticus) possuem glândulas nas patas que liberam um odor marcante para demarcar território em grandes áreas abertas."
    ],
    greater_rhea:[
      "A ema percorre planícies e savanas em bandos ágeis, estendendo as asas abertas como leme para fazer curvas fechadas em alta velocidade quando escapa de predadores.",
      "A ema (Rhea americana) é a maior ave das Américas e não voa, mas corre a até 60 km/h. Na espécie, é o macho quem constrói o ninho, choca os ovos de várias fêmeas e cria os filhotes sozinho."
    ],
    coati:[
      "Com a cauda anelada sempre erguida como bandeira, os quatis vasculham o chão e os galhos das florestas em bandos barulhentos atrás de frutas, insetos, ovos e pequenos répteis.",
      "Quatis conseguem girar as articulações dos tornozelos em até 180°, o que lhes permite descer troncos de árvores de cabeça para baixo com total segurança."
    ],
    grass_snake:[
      "A Serpente da Mata desliza silenciosamente entre a vegetação baixa de florestas, campos floridos e manguezais, emboscando pequenos roedores e aves com botes rápidos.",
      "Serpentes não têm pálpebras móveis nem orelhas externas: sentem vibrações do chão através do maxilar inferior e 'cheiram' o ar usando a língua bifurcada ligada ao órgão de Jacobson."
    ],
    pit_viper:[
      "Camuflada entre folhas secas na selva tropical e nos pântanos, a jararaca permanece imóvel aguardando presas de sangue quente. Quando ameaçada, vibra a ponta da cauda antes do bote peçonhento.",
      "A jararaca (Bothrops spp.) possui fossetas loreais entre os olhos e as narinas capazes de detectar variações térmicas de milésimos de grau — uma verdadeira visão infravermelha natural."
    ],
    cave_spider:[
      "A Aranha de Caverna patrulha fendas sombreadas de montanhas, cânions e matas densas, aguardando presas descuidadas nas horas escuras e reagindo com saltos rápidos.",
      "A seda produzida pelas aranhas é proporcionalmente mais resistente à tração que o aço de mesma espessura, além de ser extremamente elástica."
    ],
    venom_spider:[
      "Escondida nas sombras úmidas de selvas, pântanos e caldeiras, a Aranha Venenosa injeta toxinas paralisantes em suas presas e ataca até rivais menores da própria espécie.",
      "Aranhas realizam digestão extracorpórea: injetam enzimas digestivas junto à peçonha para dissolver os tecidos da presa antes de sugar o alimento."
    ],
    scorpion:[
      "O Escorpião das Dunas atravessa areias e rochas secas à noite com as pinças erguidas e a cauda arqueada pronta para ferroar. Durante o dia, esconde-se sob pedras frescas.",
      "Quase todos os escorpiões brilham em verde-azulado sob luz ultravioleta devido a substâncias fluorescentes presentes em sua cutícula — uma característica que ainda intriga biólogos."
    ],
    glass_scorpion:[
      "O Escorpião Vítreo habita afloramentos de vidro vulcânico e caldeiras, onde sua carapaça translúcida reflete o brilho mineral ao redor. Sua ferroada tóxica exige atenção redobrada.",
      "Escorpiões estão entre os animais terrestres mais antigos do planeta, com fósseis de mais de 430 milhões de anos, e podem sobreviver meses sem comer reduzindo o metabolismo."
    ],
    pyrite_crawler:[
      "Entre galerias e encostas ricas em sulfetos metálicos, o Rastejante de Pirita confunde mineradores com o brilho dourado de sua carapaça antes de investir em bote.",
      "A pirita (FeS₂) é famosa como 'ouro de tolo' por seu brilho metálico amarelo, mas ao contrário do ouro verdadeiro é dura, quebradiça e solta cheiro de enxofre ao ser golpeada."
    ],

    // === CRIATURAS FANTÁSTICAS E DE EXTERMÍNIO ===
    slime:[
      "Nascido em poças de drenagem ácida, o Slime Ácido avança em saltos pesados e dissolve couro e metal desprotegidos onde encosta. A Armadura Tampônica neutraliza grande parte de seu dano.",
      "No jogo, seu gel corrosivo pode ser neutralizado na bancada química com reagentes alcalinos — ilustrando uma reação clássica de neutralização ácido-base."
    ],
    peat_slime:[
      "A Geleia de Turfa absorve a cor escura dos brejos ricos em matéria orgânica, misturando-se ao musgo das margens até saltar sobre viajantes distraídos.",
      "Turfeiras reais são naturalmente ácidas (pH baixo) porque o musgo Sphagnum libera íons H⁺ e ácidos húmicos que retardam a decomposição na água parada."
    ],
    cobrete:[
      "Construto autônomo montado com engrenagens de cobre exposto, o Cobrete vagueia por galerias e encostas minerais. Permanece pacífico até ser atacado, quando revida com golpes metálicos.",
      "Quando o cobre fica exposto à umidade e ao CO₂ do ar, forma uma película verde chamada azinhavre ou pátina (carbonato básico de cobre), que protege o metal interno da corrosão."
    ],
    cristalume:[
      "Pequena criatura alada de carapaça facetada, o Cristalume refrata a luz em arco-íris enquanto flutua perto de cavernas e geodos. Foge rapidamente se alguém se aproxima demais.",
      "A separação da luz branca em várias cores por um cristal ocorre pela dispersão óptica: cada comprimento de onda sofre um ângulo ligeiramente diferente de refração."
    ],
    golem:[
      "O Golem de Obsidiana ergue-se das camadas profundas como uma estátua viva de vidro vulcânico negro. Lento, mas de força descomunal, esmaga o solo com golpes que estremecem o entorno.",
      "A obsidiana se forma quando lava rica em sílica esfria tão depressa que os átomos não têm tempo de se organizar em cristais, criando um vidro natural de bordas extremamente cortantes."
    ],
    magma:[
      "O Elemental de Magma mantém um núcleo incandescente sob placas rachadas de basalto escuro. Onde caminha, o ar se aquece e seus golpes ateiam fogo a qualquer alvo próximo.",
      "A temperatura do magma basáltico na natureza varia entre 1.000 °C e 1.200 °C, brilhando em laranja-vivo pela radiação térmica do corpo negro."
    ],
    wisp:[
      "Flutuando com anéis giratórios em torno de um núcleo carregado, o Espectro da Tempestade surge em noites escuras e dispara descargas elétricas à distância.",
      "Relâmpagos reais aquecem o ar ao redor a cerca de 30.000 °C — cinco vezes mais quente que a superfície do Sol — provocando a expansão sonora que ouvimos como trovão."
    ],
    travertine_guard:[
      "Nos Jardins de Travertino, esta sentinela antiga acumula camadas de calcita a cada chuva mineral. Defende os terraços carbonatados com golpes lentos e pesadíssimos.",
      "O travertino forma-se quando águas ricas em bicarbonato de cálcio perdem CO₂ ao aflorar na superfície, precipitando carbonato de cálcio (CaCO₃) em faixas paralelas."
    ],
    cave_shade:[
      "Habitante silenciosa das minas e galerias sem luz, a Sombra de Mina flutua pelos túneis disparando faíscas arcanas contra quem se aventura no subsolo sem tochas.",
      "Em cavernas profundas sem luz solar, ecossistemas reais dependem de bactérias quimiossintetizantes ou da matéria orgânica trazida pela água infiltrada."
    ],
    basalt_husk:[
      "A Carcaça Basáltica percorre caldeiras e badlands com passos pesados, unindo placas vulcânicas rachadas em torno de um núcleo de brasa que pulsa a cada golpe.",
      "Colunas hexagonais de basalto, como na Calçada dos Gigantes, surgem naturalmente por contração térmica uniforme quando grandes derrames de lava esfriam devagar."
    ],
    bog_revenant:[
      "O Vulto do Brejo paira acima das águas escuras de pântanos e manguezais. Como ser espectral nativo, ignora lâminas comuns e só sofre dano de armas fantasmagóricas.",
      "A névoa luminosa que o envolve lembra a bioluminescência observada em certos fungos e microrganismos de matas úmidas durante noites sem lua."
    ],
    salt_specter:[
      "Deslizando acima das crostas brancas das salinas e fiordes, o Espectro da Salmoura dispara projéteis gelados à distância e só pode ser ferido por armas impregnadas de ectoplasma.",
      "A água salgada congela a temperaturas mais baixas que a água doce (abaixamento crioscópico): uma salmoura saturada só congela perto de −21 °C."
    ],
    amethyst_golem:[
      "O Golem de Ametista concentra drusas gigantes de quartzo roxo nos ombros e no peito, patrulhando bosques de cristais e montanhas com golpes sísmicos devastadores.",
      "Cristais de quartzo são piezoelétricos: geram uma pequena voltagem elétrica quando comprimidos, propriedade usada em relógios e sensores eletrônicos."
    ],
    garnet_golem:[
      "Erguido entre chapadas ocres e termas minerais, o Golem de Granada exibe facetas vermelho-vinho incrustadas na rocha escura e avança implacavelmente contra invasores.",
      "A granada não é um único mineral, mas uma família de silicatos com alta dureza (6,5 a 7,5 na escala de Mohs), muito usada como abrasivo industrial e em jatos d'água."
    ],
    copper_golem:[
      "Forjado com placas maciças de cobre e juntas articuladas, o Golem de Cobre percorre cânions e termas com passadas mais ágeis que os golens de pedra.",
      "O cobre foi um dos primeiros metais trabalhados pela humanidade há cerca de 10 mil anos, porque ocorre às vezes em estado metálico puro na natureza."
    ],
    iron_golem:[
      "O mais resistente dos golens metálicos reveste-se de blocos espessos de ferro nas montanhas e taigas. Seus golpes ressoam como bigornas batendo.",
      "O ferro compõe a maior parte do núcleo da Terra e é responsável pelo campo magnético planetário que protege nossa atmosfera dos ventos solares."
    ],
    cobalt_elemental:[
      "Nascido nas caldeiras vítreas e bosques de cristais, o Elemental de Escória Azul brilha em chamas azuladas intensas, combinando calor extremo e sais metálicos.",
      "Sais de cobalto são usados há milênios para produzir o célebre azul-cobalto em vidros e porcelanas; em chamas, diferentes metais produzem cores características (teste de chama)."
    ],
    salt_crab:[
      "O Caranguejo de Sal caminha de lado sobre as crostas das salinas e deltas, camuflando a carapaça branca entre os cristais até investir com pinças afiadas.",
      "Caranguejos reais crescem por meio de mudas (ecdises), abandonando o exoesqueleto de quitina antigo para expandir um novo ainda mole que endurece com cálcio."
    ],
    rust_crab:[
      "Habitante dos manguezais e termas ricas em ferro, o Caranguejo Ferrugem acumula óxidos avermelhados na carapaça e dispara ataques corrosivos com suas pinças.",
      "A ferrugem (óxido de ferro hidratado) se forma muito mais rápido em ambientes salinos como manguezais porque os íons do sal aceleram a corrosão eletroquímica."
    ],
    ruin_medusa:[
      "Entre colunas antigas de cânions e bosques de cristais, a Medusa das Ruínas transforma desavisados em pedra com um único olhar. Somente o Escudo de Espelho reflete sua maldição.",
      "Na mitologia grega, Perseu derrotou a Górgona Medusa usando o escudo de bronze polido de Atena como espelho para nunca encarar seus olhos diretamente."
    ],
    salt_medusa:[
      "Nos espelhos d'água das salinas e desertos, a Medusa de Sal esconde-se junto ao brilho claro do chão mineral. Seu olhar petrificante age mais depressa que o das irmãs.",
      "Superfícies lisas de salinas alagadas funcionam como gigantescos espelhos naturais — como o Salar de Uyuni, na Bolívia, usado até para calibrar satélites."
    ],
    obsidian_medusa:[
      "A mais poderosa das medusas desliza sobre campos de basalto e caldeiras vulcânicas. Seu olhar incandescente petrifica por mais tempo e exige reflexo rápido com o Escudo de Espelho.",
      "Espelhos antigos na Mesoamérica eram frequentemente polidos a partir de obsidiana negra, oferecendo um reflexo escuro e nítido antes da invenção do vidro espelhado."
    ],
    aurora_phantom:[
      "O Espectro da Aurora flutua silenciosamente sobre fiordes glaciais e campinas polares, disparando feixes luminosos azul-esverdeados à distância.",
      "Auroras boreais e austrais reais ocorrem quando partículas solares colidem com átomos de oxigênio e nitrogênio na alta atmosfera, emitindo luz verde e violeta."
    ],
    fractured_sentinel:[
      "Alvo clássico dos contratos de extermínio, a Sentinela de Travertino Fendido carrega placas espessas de carbonato de cálcio. Enfraquecida abaixo de 20% de vida, precisa ser finalizada com o Martelo de Fratura.",
      "O carbonato de cálcio (CaCO₃) de suas placas reage vigorosamente com ácido clorídrico liberando bolhas de gás carbônico (CO₂) — teste padrão de geólogos em campo."
    ],
    tide_ooze:[
      "O Limo de Maré desliza sobre manguezais e pântanos revestido de muco rico em alginato. Quando reduzido a 20% de vida, um Sachê Osmótico desidrata seu corpo e permite coletar o material.",
      "A osmose ocorre quando a água atravessa uma membrana em direção ao meio mais concentrado em sal; o alginato extraído de algas marinhas forma géis úteis até para filtrar água."
    ],
    ember_salamander:[
      "Aquecendo-se sobre escória vulcânica e desertos quentes, a Salamandra de Brasa ostenta manchas verdes de carbonato básico de cobre. Resfriá-la com uma Bolsa de Gelo Salino finaliza a caçada.",
      "Misturar sal ao gelo cria uma mistura frigorífica capaz de atingir temperaturas bem abaixo de 0 °C, princípio usado antes dos refrigeradores elétricos."
    ],
    glass_mycelium:[
      "O Fungo de Vidro caminha sobre raízes fibrosas e projeta esporos brilhantes por florestas e cânions. Uma Ampola Cúprica neutraliza seu micélio quando enfraquecido, rendendo tecido vítreo luminoso.",
      "Compostos de cobre, como o sulfato de cobre (calda bordalesa), são usados há mais de um século na agricultura como fungicidas eficazes. Na natureza, mais de 100 espécies de fungos são bioluminescentes."
    ],
    echo_burrower:[
      "O Escavador de Geodo perfura montanhas e cânions protegido por uma carapaça de quartzo e ametista. Quando enfraquecido, a frequência do Diapasão de Ruptura desfaz sua couraça.",
      "A ressonância mecânica acontece quando uma vibração coincide com a frequência natural de um objeto rígido, amplificando a oscilação até provocar fratura."
    ],
    soot_weaver:[
      "Tecendo teias escuras impregnadas de carbono nas caldeiras e pântanos, a Tecelã de Fuligem dispara nuvens de fumaça pelos poros do abdômen até ser finalizada com um Cartucho de Vedação.",
      "O carbono poroso (carvão ativado) tem tantos microporos internos que um único grama pode apresentar área superficial equivalente a vários campos de tênis, adsorvendo gases e impurezas."
    ],
    resonant_burrower:[
      "Variante rara procurada em contratos avançados de Mestre Gael, o Escavador Ressonante funde quartzo, ametista e granada em seu dorso. Cada golpe no chão faz ecoar toda a caverna.",
      "Seu nódulo contém quartzo piezoelétrico: ao aplicar pressão ou corrente elétrica, o cristal vibra com precisão, permitindo construir a Sonda de Veios."
    ],
    furnace_weaver:[
      "Temida caçada de alto nível nas regiões vulcânicas, a Tecelã da Fornalha endurece sua carapaça aluminosa a cada disparo de brasa. O Cartucho de Vedação encerra o combate quando está enfraquecida.",
      "Cerâmicas aluminosas (ricas em Al₂O₃) suportam temperaturas acima de 1.500 °C sem deformar, sendo usadas no revestimento interno de altos-fornos e escudos térmicos."
    ],

    // === BALEIAS, ORCAS E GOLFINHOS ===
    orca:[
      "A Orca Tipo A é o maior ecótipo antártico e patrulha águas polares abertas em bandos familiares cooperativos. Seus indivíduos coordenam cercos pelos flancos contra baleias-minke-antárticas.",
      "Embora chamada de 'baleia assassina', a orca (Orcinus orca) é na verdade o maior membro da família dos golfinhos. Cada bando tem seu próprio 'dialeto' sonoro passado de mãe para filhote."
    ],
    orca_b:[
      "A Orca Tipo B percorre a borda costeira do gelo marinho em grupos unidos, usando ondas sincronizadas para deslocar focas-de-Weddell e focas-leopardo de placas flutuantes.",
      "Seu tom ligeiramente amarelado não é pigmento próprio: vem de uma fina camada de microalgas diatomáceas das águas geladas que crescem sobre sua pele."
    ],
    orca_c:[
      "O menor dos quatro ecótipos polares navega com precisão pelos canais estreitos entre placas de gelo fechado, mergulhando em grupo atrás do bacalhau-da-Antártida.",
      "A Orca Tipo C mede cerca de 5,6 m — quase 3 metros menos que uma grande Tipo A — e distingue-se facilmente pela mancha ocular estreita e fortemente inclinada."
    ],
    orca_d:[
      "Reconhecida pela testa mais arredondada e pela minúscula mancha branca atrás do olho, a Orca Tipo D cruza mares subantárticos agitados em busca de merluza-negra e lulas.",
      "O Tipo D foi o último ecótipo de orca documentado pela ciência moderna: durante décadas era conhecido quase apenas por um encalhe na Nova Zelândia em 1955 até expedições recentes no Cabo Horn."
    ],
    sperm_whale:[
      "A cachalote reina nas fossas oceânicas profundas, mergulhando verticalmente na escuridão para travar batalhas épicas com lulas gigantes e lulas colossais antes de retornar à superfície para respirar.",
      "A cachalote (Physeter macrocephalus) tem o maior cérebro de qualquer animal que já existiu na Terra, realiza mergulhos de mais de 2.000 metros por até 90 minutos e produz cliques de ecolocalização acima de 230 decibéis."
    ],
    blue_whale:[
      "Com o dorso azul-acinzentado salpicado de manchas claras, a baleia-azul desliza majestosamente pelo alto-mar profundo acompanhando grandes concentrações de krill-antártico.",
      "A baleia-azul (Balaenoptera musculus) é o maior animal que já viveu no planeta — maior que qualquer dinossauro conhecido. Seu coração pesa cerca de 180 kg e sua língua pode pesar tanto quanto um elefante."
    ],
    southern_right_whale:[
      "De corpo encorpado, boca arqueada e dorso totalmente sem nadadeira dorsal, a baleia-franca-austral visita baías temperadas e mares subantárticos para filtrar nuvens de zooplâncton.",
      "As calosidades claras na cabeça da baleia-franca-austral formam um desenho único em cada indivíduo (como uma impressão digital) e abrigam pequenos crustáceos chamados ciâmidos."
    ],
    sei_whale:[
      "Esguia e veloz, a baleia-sei cruza o alto-mar temperado ostentando uma dorsal alta em forma de foice e uma crista central no focinho enquanto filtra krill e pequenos organismos.",
      "A baleia-sei (Balaenoptera borealis) está entre as baleias mais rápidas do oceano, podendo atingir até 50 km/h em arrancadas curtas. Seu nome vem do norueguês 'seje', peixe com o qual chegava junto à costa."
    ],
    common_minke:[
      "Ágil e curiosa, a baleia-minke-comum aproxima-se tanto de costas temperadas quanto de águas abertas atrás de cardumes de sardinhas e krill. Exibe faixas brancas claras nas nadadeiras peitorais.",
      "As faixas brancas nas nadadeiras peitorais — chamadas 'braçadeiras de minke' — diferenciam a minke-comum (Balaenoptera acutorostrata) da sua parente minke-antártica."
    ],
    fin_whale:[
      "Segunda maior criatura dos oceanos, a baleia-fin corta as águas temperadas e frias com elegância hidrodinâmica atrás de cardumes de krill, sardinhas e lulas costeiras.",
      "A baleia-fin (Balaenoptera physalus) possui coloração assimétrica na cabeça: o lado direito da mandíbula inferior é branco brilhante, enquanto o esquerdo é cinza-escuro — truque que ajuda a encurralar cardumes."
    ],
    brydes_whale:[
      "Diferente das grandes baleias que migram para os polos, a baleia-de-bryde prefere mares tropicais e subtropicais quentes o ano inteiro, perseguindo cardumes rápidos de sardinhas e tainhas.",
      "A baleia-de-bryde é facilmente identificada por três cristas longitudinais paralelas no topo do focinho, enquanto sua prima baleia-sei tem apenas uma crista central."
    ],
    minke:[
      "A baleia-minke-antártica navega pelos mares polares abertos em busca de enxames de krill. Quando percebe a aproximação de um bando de orcas Tipo A, acelera em fuga desesperada.",
      "A baleia-minke-antártica (Balaenoptera bonaerensis) pode usar o focinho pontiagudo para quebrar camadas finas de gelo marinho e abrir furos para respirar."
    ],
    humpback:[
      "Conhecida pelas nadadeiras peitorais enormes e pelos saltos acrobáticos fora d'água, a baleia-jubarte cruza bacias profundas cantando e chega a golpear orcas com a cauda para defender baleias ameaçadas.",
      "Os machos de jubarte compõem cantos complexos de até 20 minutos que evoluem a cada temporada e se espalham por oceanos inteiros. Suas nadadeiras peitorais chegam a um terço do comprimento do corpo."
    ],
    dolphin:[
      "Sociáveis e velozes, os golfinhos nadam em grupos cooperativos acompanhando embarcações e cercando cardumes. Quando um tubarão se aproxima do grupo, os golfinhos se unem para investi-lo e afastá-lo.",
      "Golfinhos dão a si mesmos 'assobios-assinatura' únicos que funcionam como nomes próprios, e dormem com apenas um hemisfério do cérebro de cada vez para não deixarem de subir para respirar."
    ],

    // === LULAS, POLVOS E CEFALÓPODES ===
    giant_squid:[
      "Nas profundezas escuras do mar aberto, a lula gigante estende seus dois longos tentáculos de captura para agarrar peixes e se defender bravamente das investidas da cachalote.",
      "A lula gigante (Architeuthis dux) tem olhos do tamanho de pratos (até 25–30 cm) para captar a mínima bioluminescência abissal, três corações, sangue azul rico em cobre e ventosas com anéis serrilhados."
    ],
    colossal_squid:[
      "Mais pesada e robusta que a lula gigante, a lula colossal espreita nas águas geladas da Antártida. Quando uma cachalote mergulha para caçá-la, revida agarrando-a com tentáculos armados de ganchos giratórios.",
      "A lula colossal (Mesonychoteuthis hamiltoni) é o invertebrado mais pesado da Terra (até ~500 kg) e possui os maiores olhos de todo o reino animal, além de ganchos giratórios afiados nas pontas dos tentáculos."
    ],
    coastal_squid:[
      "Em grupos ágeis na meia-água das plataformas costeiras, as lulas-da-costa aceleram em sincronia atrás de sardinhas e camarões, disparando nuvens de tinta escura quando atacadas por focas ou tubarões.",
      "As lulas têm oito braços e dois tentáculos retráteis mais longos. Conseguem mudar a cor e o padrão da pele em milissegundos usando células chamadas cromatóforos."
    ],
    common_octopus:[
      "Mestre da camuflagem nos fundos rochosos, o polvo-comum caça sozinho à noite atrás de mexilhões e camarões. Ameaçado, solta tinta escura e escorrega por fendas minúsculas.",
      "O polvo-comum (Octopus vulgaris) tem três corações, sangue azul e cerca de dois terços de seus neurônios distribuídos pelos oito braços, que conseguem sentir gostos e resolver problemas quase de forma independente."
    ],

    // === FOCAS, PINGUINS, TARTARUGAS, TUBARÕES, RAIAS E FAUNA DE ÁGUA DOCE ===
    weddell_seal:[
      "A foca-de-Weddell mergulha sob espessas camadas de gelo antártico atrás de bacalhau-da-Antártida e lulas, mantendo furos abertos para respirar enquanto vigia orcas Tipo B.",
      "Focas-de-Weddell conseguem mergulhar a mais de 600 metros por até 80 minutos e usam os dentes da frente para raspar o gelo novo e impedir que seus buracos de respiração congelem."
    ],
    harbor_seal:[
      "Nas costas temperadas, a foca-comum caça peixes e lulas costeiras e sobe em bancos rasos e rochas para descansar ao sol fora do alcance de tubarões e orcas.",
      "Focas-comuns conseguem detectar a esteira hidrodinâmica deixada por um peixe minutos antes usando apenas as vibrissas (bigodes) hipersensíveis, mesmo em água completamente turva."
    ],
    leopard_seal:[
      "Predadora solitária e veloz da borda do gelo antártico, a foca-leopardo patrulha as passagens onde pinguins-de-adélia saltam na água, mas também filtra enormes quantidades de krill.",
      "A foca-leopardo (Hydrurga leptonyx) possui molares especiais com três pontas que se encaixam como uma peneira para filtrar krill-antártico, além de caninos afiados para caçar pinguins e outras focas."
    ],
    ringed_seal:[
      "A foca-anelada vive nos canais gelados do Ártico, onde constrói abrigos de neve sobre buracos de respiração. Precisa estar sempre alerta, pois é a presa favorita do urso-polar.",
      "É a menor e mais abundante foca do Ártico; os anéis prateados que decoram seu dorso escuro dão origem ao seu nome popular."
    ],
    adelie_penguin:[
      "Os pinguins-de-adélia reúnem-se em bandos animados sobre o gelo antártico e mergulham juntos em busca de enxames de krill, fugindo em disparada sempre que uma foca-leopardo surge por perto.",
      "Pinguins-de-adélia (Pygoscelis adeliae) dormem em milhares de microcochilos de cerca de 4 segundos cada, somando mais de 11 horas de descanso por dia sem baixar a guarda contra predadores."
    ],
    leatherback:[
      "A tartaruga-de-couro gigante atravessa oceanos inteiros seguindo correntes ricas em águas-vivas. Sem carapaça óssea dura, seu dorso flexível de sete quilhas corta a água com facilidade.",
      "A tartaruga-de-couro (Dermochelys coriacea) é o maior réptil marinho do mundo, chega a mergulhar a mais de 1.200 metros e possui espinhos macios voltados para trás no esôfago para impedir que águas-vivas escapem."
    ],
    reef_shark:[
      "O cação patrulha recifes e águas abertas com movimentos contínuos, caçando peixes, raias, polvos e lulas. Apesar de temido, costuma recuar diante de bandos organizados de golfinhos ou orcas.",
      "Tubarões possuem órgãos chamados ampolas de Lorenzini no focinho que detectam os minúsculos campos elétricos gerados pelos batimentos cardíacos de presas escondidas na areia."
    ],
    ray:[
      "Deslizando rente ao leito arenoso do mar e dos estuários, a raia levanta nuvens sutis de sedimento para encontrar camarões e mexilhões escondidos no fundo.",
      "Raias são parentes próximas dos tubarões e têm esqueleto inteiramente cartilaginoso. Seus olhos ficam no topo do corpo, enquanto a boca e as brânquias ficam na face ventral."
    ],
    venom_ray:[
      "Quase invisível sobre a lama salobra dos estuários, a Arraia Venenosa só usa o ferrão serrilhado da cauda quando ameaçada ou encurralada por predadores e mergulhadores.",
      "O ferrão das raias venenosas é uma escama modificada recoberta por uma bainha de muco tóxico que se renova caso seja quebrada em defesa."
    ],
    caiman:[
      "Deixando apenas olhos e narinas acima da água calma dos pântanos, o jacaré-do-pantanal embosca peixes, piranhas e capivaras — e trava encontros tensos com onças-pintadas e sucuris.",
      "Jacarés conseguem controlar a temperatura corporal alternando banhos de sol nas margens com mergulhos. A temperatura do ninho determina se os filhotes nascerão machos ou fêmeas."
    ],
    green_anaconda:[
      "Submersa nas águas lentas da floresta tropical e dos pântanos, a sucuri-verde aguarda pacientemente antes de dar o bote e envolver peixes grandes, jacarés ou capivaras.",
      "A sucuri-verde (Eunectes murinus) é a serpente mais pesada do planeta, não possui peçonha e abate suas presas por constrição. Após uma grande refeição, pode passar semanas sem comer."
    ],
    arapaima:[
      "Gigante escamoso das várzeas tropicais, o pirarucu patrulha lagos e rios lentos caçando peixes menores e subindo regularmente à superfície para engolir ar atmosférico.",
      "O pirarucu (Arapaima gigas) é um dos maiores peixes de água doce do mundo (até 3 m) e possui respiração aérea obrigatória: sua bexiga natatória funciona como um pulmão primitivo."
    ],
    amazon_manatee:[
      "Dócil e vagaroso, o peixe-boi-da-amazônia desliza pelos lagos de água doce pastando plantas aquáticas como a elódea, sem demonstrar agressividade diante de outros animais.",
      "O peixe-boi-da-amazônia (Trichechus inunguis) é o único peixe-boi estritamente de água doce. Seus dentes molares são continuamente substituídos de trás para frente como uma esteira ao longo da vida."
    ],
    piranha:[
      "Em cardumes atentos nos rios e lagoas tropicais, as piranhas se abrigam entre raízes submersas e atacam em conjunto quando percebem movimento brusco ou presas feridas na água.",
      "Apesar da fama cinematográfica, muitas piranhas são onívoras e comem também sementes e frutos caídos. Suas mandíbulas curtas têm uma das maiores forças de mordida proporcionalmente ao peso entre os peixes."
    ],
    pufferfish:[
      "Nativo de águas costeiras rasas, o baiacu nada devagar até sentir-se ameaçado, quando engole água rapidamente para inflar o corpo e expor espinhos defensivos.",
      "Muitos baiacus acumulam tetrodotoxina — uma neurotoxina poderosa produzida por bactérias simbiontes — que os torna venenosos para quase todos os predadores."
    ],
    antarctic_toothfish:[
      "O bacalhau-da-Antártida vive perto do fundo gelado dos canais costeiros, escapando para os trechos mais profundos sempre que orcas Tipo C ou focas-de-Weddell mergulham atrás dele.",
      "O bacalhau-da-Antártida (Dissostichus mawsoni) produz proteínas anticongelantes no sangue que impedem a formação de cristais de gelo em águas abaixo de 0 °C."
    ],
    patagonian_toothfish:[
      "Habitante das águas fundas e frias do sul, a merluza-negra percorre o relevo submarino atrás de lulas e peixes menores, fugindo de cachalotes, lulas colossais e orcas Tipo D.",
      "A merluza-negra (Dissostichus eleginoides) pode viver mais de 50 anos, atingir mais de 2 metros de comprimento e habitar profundidades de até 2.500 metros."
    ],

    // === PEIXES, CAVALOS-MARINHOS E CAMARÕES ===
    seahorse_red:[
      "O cavalo-marinho vermelho espinhoso ancora a cauda preênsil na vegetação costeira e balança suavemente com a corrente enquanto aspira plâncton e minúsculos camarões.",
      "Nos cavalos-marinhos, é o macho quem engravida: a fêmea deposita os ovos numa bolsa incubadora na barriga dele, onde os filhotes se desenvolvem até o nascimento."
    ],
    seahorse_gold:[
      "De faixas douradas cintilantes nas águas rasas, o cavalo-marinho dourado rajado move os olhos de forma independente para vigiar predadores e localizar minúsculas presas.",
      "Cavalos-marinhos não têm estômago nem dentes — precisam se alimentar quase continuamente, usando sua pequena barbatana dorsal que bate até 35 vezes por segundo."
    ],
    shrimp_pink:[
      "O camarão-rosa repousa semienterrado na areia costeira de dia e sai à noite para vasculhar o fundo atrás de matéria orgânica e pequenos organismos.",
      "O camarão-rosa (Farfantepenaeus brasiliensis) passa a fase juvenil em estuários e manguezais protegidos antes de migrar para o mar aberto quando adulto."
    ],
    shrimp_seabob:[
      "Em grandes grupos sobre fundos rasos de areia e lama, o camarão-sete-barbas serve de base alimentar para peixes costeiros, raias e polvos.",
      "Seu nome popular vem das longas antenas e apêndices sensoriais frontais que lembram barbas e ajudam a farejar alimento em águas turvas."
    ],
    shrimp_white:[
      "O camarão-branco frequenta desembocaduras salobras e costas arenosas, mudando de carapaça periodicamente conforme cresce em águas ricas em nutrientes.",
      "Crustáceos decápodes como o camarão-branco possuem dez patas locomotoras e regeneram antenas ou patas perdidas durante as trocas de carapaça."
    ],
    shrimp_pitu:[
      "O camarão-pitu esconde-se sob pedras e raízes em remansos de água doce tropical, usando suas longas garras dianteiras para defender o abrigo e capturar alimento.",
      "O pitu (Macrobrachium carcinus) é um dos maiores camarões de água doce das Américas, podendo passar de 30 cm, mas suas larvas ainda precisam de água salobra perto do mar para se desenvolver."
    ],
    raw_fish:[
      "O peixe-comum forma pequenos cardumes tranquilos em rios e lagos, mudando de direção em uníssono ao sentir a vibração de barcos ou predadores.",
      "Os peixes possuem um órgão sensorial ao longo dos flancos chamado linha lateral, capaz de detectar variações mínimas de pressão e movimento na água ao redor."
    ],
    raw_carp:[
      "A carpa prefere bolsões calmos de rios e lagos, revolvendo o lodo macio com os barbilhões em busca de plantas aquáticas, sementes e pequenos invertebrados.",
      "Carpas conseguem tolerar águas com pouco oxigênio dissolvido e podem viver décadas; em cativeiro, carpas ornamentais (koi) já ultrapassaram 50 anos."
    ],
    raw_perch:[
      "De listras verticais marcantes nos flancos, a perca patrulha áreas entre pedras e vegetação submersa à espera de larvas, camarões e peixinhos menores.",
      "As faixas escuras verticais da perca funcionam como camuflagem disruptiva entre os talos de plantas aquáticas iluminados pelo sol."
    ],
    raw_mullets:[
      "As tainhas viajam em grandes cardumes prateados por estuários e costas, saltando frequentemente fora d'água quando fogem de golfinhos, cações ou barcos.",
      "A tainha possui uma moela muscular parecida com a das aves que tritura algas microscópicas e sedimentos filtrados do fundo arenoso."
    ],
    raw_trout:[
      "A truta prospera em águas frias, claras e bem oxigenadas, mantendo-se voltada contra a correnteza enquanto intercepta insetos e pequenos crustáceos levados pelo rio.",
      "Trutas têm visão aguçada capaz de calcular a refração da luz na superfície da água para saltar e apanhar insetos pousados em galhos baixos."
    ],
    raw_catfish:[
      "Habitante noturno dos fundos lodosos, o bagre tateia o leito escuro com seus longos barbilhões sob raízes e pedras à procura de peixes menores e detritos.",
      "Os 'bigodes' (barbilhões) do bagre não picam: são cobertos por milhares de papilas gustativas, transformando o corpo inteiro do peixe numa espécie de língua gigante."
    ],
    raw_char:[
      "De manchas claras no dorso escuro, o salvelino sobrevive sob placas de gelo em lagos e costas árticas, onde serve de presa para focas-aneladas e orcas Tipo C.",
      "O salvelino-ártico (Salvelinus alpinus) é o peixe de água doce que alcança latitudes mais ao norte na Terra, resistindo a temperaturas próximas do congelamento."
    ],
    raw_eel:[
      "De corpo longo e sinuoso, a enguia esconde-se de dia em fendas estreitas entre raízes e pedras, saindo à noite para caçar peixes de fundo e camarões.",
      "Enguias reais realizam migrações épicas de milhares de quilômetros entre rios de água doce e o mar profundo (como o Mar dos Sargaços) apenas para se reproduzir."
    ],
    raw_pike:[
      "Predador de emboscada de águas doces, o lúcio fica completamente imóvel entre juncos e ervas até disparar em linha reta contra percas, carpas e peixes menores.",
      "O lúcio possui centenas de dentes inclinados para trás que impedem a presa escorregadia de escapar — e se faltar alimento, pode atacar indivíduos menores da própria espécie."
    ],
    raw_whitefish:[
      "O peixe-branco nada em cardumes prateados por águas frias e profundas, alimentando-se de zooplâncton e pequenos organismos perto da meia-água.",
      "Peixes-brancos pertencem à mesma família das trutas e salmões (Salmonidae), identificável pela pequena nadadeira adiposa sem raios perto da cauda."
    ],
    raw_bream:[
      "De corpo alto e achatado lateralmente, a brema percorre fundos tranquilos em grupos sincronizados, filtrando pequenas partículas orgânicas e zooplâncton.",
      "Sua boca protátil estende-se como um pequeno tubo para sugar alimento diretamente da areia ou do lodo sem precisar inclinar todo o corpo."
    ],
    raw_loach:[
      "Pequena e ágil junto às pedras do leito, a bótia remexe o fundo em busca de larvas e algas, servindo de alimento para bagres, trutas e lúcios.",
      "Muitas espécies de bótias conseguem engolir ar na superfície e absorver oxigênio pelo intestino, além de ficarem agitadas quando a pressão atmosférica cai antes de tempestades."
    ],
    raw_pacu:[
      "O pacu nada sob árvores frutíferas às margens de rios tropicais, ouvindo o som de sementes e frutos caindo na água para disputar cada mordida em cardume.",
      "Parente vegetariano da piranha, o pacu tem dentes quadrados muito parecidos com molares humanos, perfeitos para esmagar sementes duras e coquinhos."
    ],
    raw_tilapia:[
      "Adaptável e resistente, a tilápia forma cardumes em lagos mornos, alimentando-se de fitoplâncton, algas e brotos de plantas submersas.",
      "Muitas espécies de tilápia praticam incubação bucal: a fêmea guarda os ovos e até os filhotes recém-nascidos dentro da própria boca para protegê-los de predadores."
    ],
    raw_seabass:[
      "Predador ágil das costas e estuários, o robalo embosca cardumes de sardinhas, tainhas e camarões nas mudanças de maré.",
      "O robalo é eurialino — consegue ajustar o equilíbrio de sais nas brânquias para transitar livremente entre o mar salgado e rios de água doce."
    ],
    raw_sole:[
      "O linguado repousa perfeitamente achatado sobre a areia do fundo marinho, combinando a cor do dorso com os grãos ao redor até quase desaparecer.",
      "Linguados nascem simétricos como qualquer peixe, mas durante o crescimento um dos olhos migra lentamente para o outro lado da cabeça para que ambos fiquem voltados para cima."
    ],
    raw_sardine:[
      "Em enormes cardumes reluzentes perto da superfície, as sardinhas filtram plâncton e movem-se como um único organismo prateado quando cercadas por baleias, golfinhos e lulas.",
      "Quando atacadas, sardinhas formam esferas compactas ('bolas de isca') que confundem predadores individuais graças à sincronia quase instantânea de milhares de peixes."
    ],
    raw_emberfish:[
      "Descoberto próximo às nascentes termais e bordas de caldeiras, o Peixe-de-Brasa ostenta escamas alaranjadas luminosas que resistem a águas mornas e ricas em minerais.",
      "Na natureza, peixes extremófilos como os pupfishes do deserto toleram temperaturas acima de 40 °C e salinidade elevada onde quase nenhuma outra espécie sobreviveria."
    ],

    // === PLÂNCTON, ÁGUAS-VIVAS, CORAIS, MOLUSCOS E PLANTAS AQUÁTICAS ===
    phytoplankton:[
      "Flutuando na camada mais iluminada dos oceanos e lagos, as nuvens de fitoplâncton transformam luz solar e CO₂ em matéria orgânica que sustenta toda a cadeia alimentar aquática.",
      "Embora microscópico, o fitoplâncton marinho produz mais da metade de todo o oxigênio liberado na atmosfera da Terra — mais que todas as florestas terrestres juntas."
    ],
    zooplankton:[
      "Composto por minúsculos crustáceos e larvas à deriva, o zooplâncton acompanha as correntes filtrando fitoplâncton e alimentando peixes, corais, águas-vivas e grandes baleias.",
      "Muitas espécies de zooplâncton realizam toda noite a maior migração animal do planeta: sobem à superfície para comer no escuro e descem às profundezas ao amanhecer para fugir de predadores."
    ],
    antarctic_krill:[
      "Formando densos enxames avermelhados nos mares gelados do sul, o krill-antártico é a peça-chave do ecossistema polar — alimento vital para baleias, pinguins, focas e peixes.",
      "O krill-antártico (Euphausia superba) tem uma das maiores biomassas de qualquer animal multicelular da Terra e possui órgãos bioluminescentes que emitem luz verde-azulada no escuro."
    ],
    moon_jelly:[
      "A água-viva-da-lua desliza suavemente por baías temperadas e estuários, pulsando a umbrela translúcida para capturar zooplâncton em seus tentáculos curtos.",
      "Os quatro anéis em forma de trevo visíveis sob o disco transparente da Aurelia são suas gônadas (órgãos reprodutivos). Águas-vivas são compostas por cerca de 95% de água e não têm cérebro nem coração."
    ],
    sea_nettle:[
      "Com a umbrela cor de cobre e tentáculos longos flutuando atrás, a urtiga-do-mar-do-Pacífico patrulha costas temperadas paralisando zooplâncton, pequenos peixes e outras águas-vivas.",
      "Seus tentáculos carregam milhões de células urticantes microscópicas chamadas cnidócitos, que disparam filamentos venenosos em menos de um milionésimo de segundo ao contato."
    ],
    jelly:[
      "Nas águas marinhas profundas, a água-viva pulsa em ritmo lento onde as correntes enfraquecem, brilhando suavemente na meia-água enquanto serve de presa para tartarugas-de-couro.",
      "Águas-vivas habitam os oceanos há mais de 500 milhões de anos — são muito mais antigas que tubarões, dinossauros e até árvores."
    ],
    sea_star:[
      "A estrela-do-mar-ocre rasteja lentamente pelas rochas costeiras temperadas em busca de bancos de mexilhões, exercendo papel fundamental no equilíbrio da zona entremarés.",
      "A Pisaster ochraceus originou na ecologia o conceito de 'espécie-chave': ao predar mexilhões, ela impede que dominem toda a rocha, mantendo espaço para dezenas de outras espécies. Ela consegue regenerar braços perdidos."
    ],
    rock_mussel:[
      "Presos firmemente às rochas costeiras por filamentos resistentes, os bancos de mexilhões filtram continuamente o fitoplâncton levado pelas marés e alimentam polvos e estrelas-do-mar.",
      "Mexilhões produzem fios proteicos chamados bissos que aderem firmemente à pedra mesmo debaixo d'água — um adesivo natural tão forte que inspira colas cirúrgicas modernas."
    ],
    branching_coral:[
      "Formando verdadeiras florestas submersas em recifes rasos e quentes, o coral ramificado cresce em galhos calcários que abrigam cardumes inteiros de pequenos peixes contra predadores.",
      "Corais não são pedras nem plantas: são colônias de milhares de pequenos animais (pólipos) que constroem esqueletos de carbonato de cálcio e vivem em simbiose com microalgas chamadas zooxantelas."
    ],
    brain_coral:[
      "Preso às rochas rasas de recifes iluminados, o coral-cérebro constrói um domo maciço de cristas calcárias brancas e vales sinuosos amarronzados que lembra um cérebro humano.",
      "O coral-cérebro (Diploria labyrinthiformis) cresce muito devagar — poucos milímetros por ano —, mas colônias grandes podem viver por centenas de anos. Seus sulcos ajudam a desviar sedimentos e abrigam microalgas simbiontes."
    ],
    sea_anemone:[
      "Fixada ao fundo rochoso de recifes e poças costeiras, a anêmona-do-mar ondula seus tentáculos coloridos na corrente para capturar zooplâncton e oferecer abrigo a pequenos peixes.",
      "Parentes próximas dos corais e águas-vivas, anêmonas são animais carnívoros que às vezes se soltam da rocha e 'nadam' lentamente para escapar de estrelas-do-mar predadoras."
    ],
    eelgrass:[
      "A erva-marinha forma extensos prados submersos sobre areia e lodo costeiros, estabilizando o sedimento e servindo de berçário e refúgio para peixes juvenis e cavalos-marinhos.",
      "Diferente das algas, a erva-marinha (Zostera marina) é uma planta com flores verdadeira que voltou a viver totalmente submersa no mar, sendo polinizada pelas próprias correntes."
    ],
    kelp:[
      "Ancorada em fundos rochosos de águas frias, a laminária ergue lâminas longas e flexíveis que acompanham as ondas e criam abrigos tridimensionais para a fauna costeira.",
      "As grandes algas kelp estão entre os organismos de crescimento mais rápido do planeta — certas espécies chegam a crescer mais de 50 centímetros em um único dia."
    ],
    waterweed:[
      "Nas margens rasas e iluminadas de lagos de água doce, a elódea forma moitas verdes que oxigenam a água, abrigam alevinos e servem de pasto para peixes-boi e pacus.",
      "A elódea (Elodea spp.) é muito usada em laboratórios de biologia para observar cloroplastos ao microscópio e medir a liberação de bolhas de oxigênio durante a fotossíntese."
    ],

    // === SERES AQUÁTICOS FANTÁSTICOS ===
    mermaid:[
      "Em manhãs tranquilas nas bacias marinhas, remadores juram ver uma sereia acompanhando a sombra do barco antes de mergulhar de volta para as ruínas submersas. É curiosa e pacífica.",
      "Mitos de sereias surgiram em quase todas as culturas marítimas do mundo; historiadores acreditam que avistamentos distantes de peixes-boi e dugongos ajudaram a inspirar relatos de marinheiros."
    ],
    fishfolk_tail:[
      "O Homem-peixe de Cauda patrulha estuários e costas rochosas com nado vigoroso. Observa mergulhadores à distância, mas golpeia com a cauda se for provocado.",
      "Sua musculatura caudal replica o movimento lateral em 'S' dos peixes pelágicos, garantindo aceleração instantânea em águas rasas."
    ],
    fishfolk_head:[
      "Com pernas adaptadas ao fundo lodoso e cabeça escamosa de predador, o Homem-peixe de Cabeça embosca intrusos nas margens de pântanos, manguezais e deltas.",
      "Suas brânquias amplas mantêm trocas gasosas eficientes mesmo em águas turvas e mornas típicas de estuários tropicais."
    ],
    fishwoman_tail:[
      "Coberta de escamas violetas reluzentes, a Mulher-peixe de Cauda acompanha as marés na boca dos estuários, virando com agilidade e defendendo seu território com golpes caudais.",
      "Os pigmentos estruturais em escamas aquáticas refletem comprimentos de onda azuis e violetas, ajudando a disfarçar o contorno em águas mais fundas."
    ],
    fishwoman_head:[
      "Escondida entre as raízes aéreas dos manguezais, a Mulher-peixe de Cabeça exibe nadadeiras douradas junto às brânquias e avança com mordida rápida contra quem invade seu esconderijo.",
      "Seus pés palmados distribuem o peso sobre a lama macia, permitindo movimentos ágeis tanto caminhando no fundo quanto nadando."
    ]
  };

  Object.assign(notes,{
    // === BLOCOS BASE, SOLOS, AREIAS E FLUIDOS ===
    "block:AIR":[
      "No levantamento original da Vila dos Elementos, os construtores registraram até o volume vazio das câmaras para calcular ventilação, iluminação e o deslocamento de vapores.",
      "O ar seco ao nível do mar é composto por cerca de 78% de nitrogênio (N₂), 21% de oxigênio (O₂), 0,9% de argônio e apenas ~0,04% de dióxido de carbono (CO₂)."
    ],
    "block:GRASS":[
      "A cobertura de grama das planícies regenera-se após cada estação de chuvas e sustenta os corredores naturais por onde passam rebanhos de bisões, vacas e ovelhas.",
      "Gramíneas crescem a partir da base da folha (meristema basal) em vez da ponta — é por isso que sobrevivem quando animais pastam ou quando cortamos a grama."
    ],
    "block:DIRT":[
      "A terra comum dos campos guarda raízes, microrganismos e minerais intemperizados que sustentam tanto as florestas selvagens quanto os primeiros canteiros dos povoados.",
      "Uma única colher de chá de solo fértil pode conter mais microrganismos vivos (bactérias, fungos e protozoários) do que o total de habitantes humanos da Terra."
    ],
    "block:FARMLAND":[
      "Lavrada com enxada para soltar torrões e abrir espaço às raízes, a terra arada marca o início de todas as hortas que alimentam a Vila dos Elementos.",
      "Revolver e aerar o solo melhora a infiltração de água e o acesso de oxigênio às raízes, acelerando a germinação das sementes."
    ],
    "block:WET_FARMLAND":[
      "Escurecida pela umidade constante próxima a canais de água, a terra irrigada garante colheitas mais rápidas e vigorosas durante qualquer estação.",
      "A água no solo dissolve nitratos, fosfatos e potássio, formando a 'solução do solo' pela qual as raízes absorvem nutrientes por osmose e transporte ativo."
    ],
    "block:STONE":[
      "Base silenciosa de quase todo o continente, a pedra comum aflora em encostas e cavernas, oferecendo o primeiro material durável para ferramentas e alicerces.",
      "As rochas da crosta terrestre pertencem a três grandes grupos: ígneas (formadas por magma), sedimentares (acúmulo de grãos) e metamórficas (transformadas por calor e pressão)."
    ],
    "block:SAND":[
      "Carregada pelo vento nas dunas e depositada pelas ondas nas praias, a areia clara brilha ao sol e serve de matéria-prima indispensável para fabricar vidro.",
      "A maior parte da areia comum é formada por grãos de quartzo (SiO₂) altamente resistentes ao desgaste físico e químico ao longo de milhões de anos."
    ],
    "block:RED_SAND":[
      "Nos desertos quentes e badlands, camadas de areia avermelhada cobrem o chão como pó de ferrugem, revelando solos antigos expostos a climas secos.",
      "A cor avermelhada intensa vem de uma fina película de óxido de ferro(III) — hematita — revestindo cada grão microscópico de quartzo."
    ],
    "block:SILICA_SAND":[
      "Recolhida em bancos claros e puros, a areia de sílica é a favorita dos vidreiros por fundir em chapas limpas, transparentes e livres de manchas escuras.",
      "O dióxido de silício (SiO₂) puro funde perto de 1.700 °C; na fabricação do vidro, adiciona-se barrilha (Na₂CO₃) e calcário para baixar essa temperatura."
    ],
    "block:SHELL_SAND":[
      "Nas margens marinhas rasas, ondas trituram conchas e esqueletos de corais durante séculos até formar faixas claras de areia biogênica.",
      "Diferente da areia de quartzo, a areia de conchas é rica em carbonato de cálcio (CaCO₃) e efervesce imediatamente em contato com vinagre ou ácido diluído."
    ],
    "block:PINK_SAND":[
      "Ao longo de certas enseadas tropicais, a areia assume um tom rosado suave que contrasta com a água turquesa das bacias marinhas.",
      "Praias de areia rosa reais, como nas Bahamas e em Creta, devem sua cor a minúsculas conchas avermelhadas de organismos marinhos chamados foraminíferos."
    ],
    "block:BLACK_SAND":[
      "Formada onde derrames de lava encontram o mar ou encostas vulcânicas, a areia negra aquece rapidamente sob o sol e guarda brilho metálico discreto.",
      "Areias vulcânicas negras consistem principalmente de fragmentos de basalto e magnetita — muitas vezes é possível erguer grãos inteiros com um ímã."
    ],
    "block:RIVER_SAND":[
      "Modelada pela correnteza contínua de rios de água doce, a areia de rio tem grãos arredondados e bem selecionados, ideais para argamassas e filtros naturais.",
      "O transporte constante pela água desgasta arestas vivas dos minerais; quanto mais longe da nascente, mais lisos e finos ficam os grãos."
    ],
    "block:MUD":[
      "A lama macia domina as margens dos pântanos, brejos e deltas, registrando com nitidez cada pegada de capivara, jacaré ou viajante que cruza a beira d'água.",
      "Lamas ricas em partículas coloidais retêm água fortemente entre microcamadas minerais, reduzindo o atrito e tornando o terreno escorregadio."
    ],
    "block:CLAY":[
      "Encontrada sob margens úmidas e leitos rasos, a argila molda-se facilmente com as mãos e endurece definitivamente quando assada no forno cerâmico.",
      "Argilas são compostas por lâminas microscópicas de silicatos de alumínio hidratados; ao serem aquecidas acima de 600 °C, perdem água estrutural e se tornam cerâmica irreversivelmente."
    ],
    "block:PEAT":[
      "Acumulada por séculos em brejos encharcados, a turfa escura conserva restos vegetais quase intactos graças à escassez de oxigênio sob a água.",
      "Turfeiras cobrem apenas cerca de 3% da superfície terrestre, mas armazenam aproximadamente o dobro de carbono de todas as florestas do mundo juntas."
    ],
    "block:PEAT_MAT":[
      "Nas partes mais alagadas dos pântanos, a turfa encharcada forma tapetes elásticos que afundam ligeiramente sob cada passo e retêm água cor de chá.",
      "A cor âmbar da água que escoa pela turfa encharcada vem de taninos e ácidos húmicos liberados lentamente pela vegetação em decomposição."
    ],
    "block:AMBER_PEAT":[
      "Característica do sub-bioma Brejo Âmbar, esta turfa rica em compostos orgânicos colore riachos vizinhos sem que a cor sozinha indique contaminação química.",
      "Taninos naturais presentes em turfas e folhas caídas funcionam como adstringentes e também são usados historicamente no curtimento de couro."
    ],
    "block:MOSS":[
      "O musgo cobre pedras sombreadas e raízes úmidas com um tapete aveludado que retém o orvalho da manhã e amortece o som dos passos na floresta.",
      "Musgos são briófitas sem raízes verdadeiras nem vasos condutores — absorvem água diretamente pelas folhinhas minúsculas e reproduzem-se por esporos."
    ],
    "block:SNOW":[
      "Nos picos alpinos e tundras, a neve cobre o terreno como um manto silencioso que isola tocas subterrâneas do vento gelado acima.",
      "A neve parece branca porque os cristais de gelo multifacetados espalham igualmente todas as cores da luz visível; cada floco segue simetria hexagonal ditada pela molécula de H₂O."
    ],
    "block:ICE":[
      "Formado sobre lagos glaciais e canais árticos, o gelo transparente sustenta ursos-polares, focas e viajantes enquanto mantém a água líquida protegida logo abaixo.",
      "A água é uma das poucas substâncias que se expande ao congelar: o gelo é cerca de 9% menos denso que a água líquida, por isso flutua e permite a vida aquática sob lagos congelados."
    ],
    "block:BLUE_ICE_VEIN":[
      "Nas Cristas de Gelo Azul, camadas antigas comprimidas pelo próprio peso expulsaram quase todas as bolhas de ar, revelando um azul translúcido profundo.",
      "Gelo glacial compacto absorve os comprimentos de onda vermelhos da luz e transmite os azuis; quanto menos bolhas de ar aprisionadas, mais intenso é o azul."
    ],
    "block:FROSTED_SOIL":[
      "Nas tundras e fiordes, o solo congelado endurece sob temperaturas negativas permanentes, exigindo picaretas resistentes para escavar camadas mais fundas.",
      "O permafrost (solo permanentemente congelado) cobre cerca de um quarto das terras do Hemisfério Norte e guarda fósseis e matéria orgânica preservados há dezenas de milhares de anos."
    ],
    "block:FROST_CRUST":[
      "A fina crosta de geada estala sob as botas nas manhãs gélidas das campinas polares, cobrindo o solo de agulhas brilhantes antes de o sol aquecer o ar.",
      "A geada não é orvalho congelado: forma-se por deposição direta, quando o vapor d'água do ar passa direto ao estado sólido sobre superfícies abaixo de 0 °C."
    ],
    "block:GLACIAL_GRAVEL":[
      "Depositado nas bordas onde antigas geleiras recuaram, este cascalho mistura seixos de várias cores e tamanhos arrastados por quilômetros pelo gelo.",
      "Em geologia, sedimentos mal selecionados carregados e abandonados pelo avanço de geleiras são chamados de tilito ou morena glacial."
    ],
    "block:GLACIAL_MORAINE":[
      "A morena glacial ergue lombadas pedregosas nos vales frios, preservando fragmentos de rochas arrancadas dos picos mais altos pela força lenta do gelo.",
      "O estudo das morenas permite aos geólogos reconstruir exatamente até onde se estenderam as grandes calotas de gelo da última Era Glacial."
    ],
    "block:WATER":[
      "A água corrente desenha rios, cachoeiras, estuários e oceanos profundos por todo o QuimiCraft, moldando o relevo e abrigando cadeias inteiras de vida aquática.",
      "Chamada de 'solvente universal', a água dissolve mais substâncias que qualquer outro líquido comum graças à polaridade da molécula H₂O e às ligações de hidrogênio."
    ],
    "block:LAVA":[
      "Escorrendo das fendas vulcânicas e cavernas profundas, a lava incandescente ilumina galerias escuras e solidifica em basalto ou obsidiana ao tocar água fria.",
      "A viscosidade da lava depende do teor de sílica: lavas basálticas fluem em rios rápidos, enquanto lavas ricas em sílica movem-se devagar e causam erupções explosivas."
    ],
    "block:MEADOW_SOIL":[
      "Escuro e rico em raízes finas de gramíneas, o solo de campina cobre pradarias abertas onde flores silvestres e herbívoros prosperam em abundância.",
      "Solos de pradaria (chernoziom / molissolos) estão entre os mais férteis da Terra graças à decomposição contínua de gramíneas profundas."
    ],
    "block:FOREST_LOAM":[
      "Sob copas fechadas, folhas e galhos caídos decompõem-se lentamente até formar o húmus florestal macio, escuro e aromático.",
      "O húmus atua como uma esponja nutritiva que retém umidade e libera minerais gradualmente graças à atividade de fungos, minhocas e bactérias."
    ],
    "block:PODZOL":[
      "Encontrado sob florestas frias de pinheiros e sequoias, o podzol exibe horizontes acinzentados onde a chuva ácida das agulhas lixiviou ferro e nutrientes para baixo.",
      "O nome 'podzol' vem do russo e significa 'sob as cinzas', referência à camada esbranquiçada de sílica que fica logo abaixo do húmus escuro."
    ],
    "block:LATERITE":[
      "Típica de savanas e regiões tropicais quentes, a laterita avermelhada endurece quando exposta ao sol e foi usada por povos antigos até como tijolo natural.",
      "Solos lateríticos perdem sílica por chuvas intensas durante milhões de anos, concentrando óxidos de ferro e alumínio (como a bauxita)."
    ],
    "block:LOESS":[
      "O loess forma barrancos verticais amarelados soprados pelo vento ao longo de milênios a partir de desertos e planícies glaciais.",
      "Apesar de ser um pó fino de silte, o loess sustenta paredões quase verticais porque seus grãos angulosos se travam com pequenas quantidades de calcita."
    ],
    "block:SALT_CRUST":[
      "Quando lagos rasos evaporam sob o sol das salinas, deixam para trás placas rígidas e poligonais de crosta salina que rangem sob os pés.",
      "Os polígonos naturais das salinas se formam quando a crosta de halita cristaliza, expande e empurra umas placas contra as outras formando cristas."
    ],
    "block:RED_EARTH":[
      "Famosa nas chapadas e selvas tropicais, a terra vermelha guarda vestígios de antigas rochas basálticas decompostas pelo clima quente e úmido.",
      "A célebre 'terra roxa' do Brasil (um latossolo derivado do basalto) é considerada um dos solos agrícolas mais produtivos do mundo."
    ],
    "block:BLACK_EARTH":[
      "Encontrada em manchas extremamente férteis de florestas antigas, a terra preta retém nutrientes e umidade mesmo sob chuvas fortes.",
      "A Terra Preta de Índio na Amazônia é um solo antrópico criado por povos indígenas pré-colombianos há milênios com carvão vegetal (biochar), ossos e cerâmica."
    ],
    "block:BROWN_EARTH":[
      "Comum sob planícies temperadas, a terra marrom equilibra areia, silte e argila em camadas bem drenadas que favorecem pastagens e bosques.",
      "A tonalidade marrom uniforme indica boa aeração e mistura constante promovida por raízes e pela fauna do solo."
    ],
    "block:GLOW_LOAM":[
      "O húmus violeta do Bosque Lúmen guarda filamentos microscópicos de micélio que dão ao solo sua cor arroxeada característica.",
      "Em florestas reais, redes subterrâneas de fungos micorrízicos conectam raízes de árvores diferentes, trocando nutrientes e sinais químicos."
    ],

    // === ROCHAS E MINERAIS ===
    "block:BEDROCK":[
      "No fundo absoluto das minas, a rocha-mãe interrompe qualquer escavação. Nenhuma picareta conhecida consegue riscar sua superfície compacta e indestrutível.",
      "Na geologia real, 'rocha-mãe' (embasamento cristalino) é a rocha sólida contínua que jaz sob todo solo e sedimento superficial."
    ],
    "block:DEEPSTONE":[
      "Mais escura e densa que a pedra superficial, a pedra profunda forma o teto das grandes galerias subterrâneas onde brotam os veios mais valiosos.",
      "Quanto maior a profundidade na crosta terrestre, maiores a pressão e a temperatura, compactando rochas em estruturas mais densas e resistentes."
    ],
    "block:BASALT":[
      "Escuro e pesado, o basalto ergue paredões vulcânicos inteiros onde derrames antigos de lava esfriaram rapidamente ao ar livre ou em contato com a água.",
      "O basalto é a rocha mais abundante na crosta oceânica da Terra — e também forma os vastos mares escuros visíveis na superfície da Lua."
    ],
    "block:OBSIDIAN":[
      "Escura e reluzente como um espelho sombrio, a obsidiana nasce do resfriamento brusco de lavas ricas em sílica e exige picaretas de ferro para ser extraída.",
      "Lâminas lascadas de obsidiana têm fio de espessura quase molecular — várias vezes mais afiado que bisturis de aço cirúrgico — e já foram usadas por civilizações antigas."
    ],
    "block:BASALT_GLASS":[
      "O vidro basáltico acumula-se nas bordas das caldeiras vítreas, onde a lava escura vitrificou sem cristalizar, criando fragmentos cortantes e azulados.",
      "Na vulcanologia, vidros basálticos naturais como a taquilita e os 'cabelos de Pele' se formam quando gotículas de lava fluida congelam no ar."
    ],
    "block:MAGMA_ROCK":[
      "Ainda quente ao toque nas encostas vulcânicas, a rocha magmática guarda fendas alaranjadas que irradiam calor muito depois de a erupção silenciar.",
      "Rochas vulcânicas são excelentes isolantes térmicos: uma crosta sólida pode caminhar fria por cima enquanto o interior permanece incandescente por anos."
    ],
    "block:ASH":[
      "As cinzas vulcânicas cobrem encostas ao redor de caldeiras como uma poeira cinzenta fina que fertiliza novas plantas assim que a chuva assenta o solo.",
      "Cinza vulcânica não é fuligem queimada: consiste em fragmentos microscópicos de vidro e rocha pulverizada por explosões de gás no magma."
    ],
    "block:SCORIA":[
      "Leve e cheia de cavidades escuras, a escória vulcânica forma cones ásperos nas bordas das caldeiras e abriga carneiros adaptados ao terreno abrasivo.",
      "Os furos (vesículas) da escória são bolhas de gás aprisionadas enquanto a lava basáltica endurecia; ao contrário da pedra-pomes, ela geralmente afunda na água."
    ],
    "block:PUMICE":[
      "Espumosa e surpreendentemente leve, a pedra-pomes nasce de erupções explosivas ricas em gás e é muito procurada como abrasivo delicado.",
      "A pedra-pomes tem tantos poros fechados cheios de ar que é a única rocha vulcânica comum capaz de flutuar na água — formando até 'jangadas' oceânicas após erupções."
    ],
    "block:TUFF":[
      "O tufo vulcânico surge quando espessas camadas de cinzas quentes se compactam e se soldam em uma rocha macia, fácil de esculpir em blocos de construção.",
      "Os famosos moais da Ilha de Páscoa foram esculpidos quase todos em tufo vulcânico retirado da cratera Rano Raraku."
    ],
    "block:MARBLE":[
      "Com veios claros e toque frio, o mármore aflora em serras antigas e empresta elegância durável a bancadas, pisos e praças do laboratório.",
      "O mármore é uma rocha metamórfica nascida quando o calcário sofre calor e pressão intensos no subsolo, recristalizando a calcita em grãos entrelaçados."
    ],
    "block:SLATE":[
      "A ardósia parte-se naturalmente em placas planas e impermeáveis, tornando-se o material favorito dos telhadores de regiões chuvosas e geladas.",
      "A ardósia deriva da compactação metamórfica do folhelho argiloso; sua clivagem paralela permite lascá-la em lâminas finíssimas usadas desde telhados até mesas de bilhar."
    ],
    "block:LIMESTONE":[
      "Os paredões claros dos cânions calcários preservam em suas camadas a história de antigos mares rasos e fornecem matéria-prima para cal e cimento.",
      "O calcário é composto principalmente de carbonato de cálcio (CaCO₃); a água da chuva ligeiramente ácida dissolve-o devagar, esculpindo cavernas, estalactites e rios subterrâneos."
    ],
    "block:CHALK":[
      "Branco, macio e fácil de riscar, o giz calcário desfaz-se em pó fino entre os dedos e desenha falésias claras em trechos costeiros e cânions.",
      "O giz natural é formado por trilhões de carapaças calcárias microscópicas de algas marinhas chamadas cocolitóforos depositadas no fundo do mar há milhões de anos."
    ],
    "block:TRAVERTINE":[
      "Depositado em faixas suaves nos Jardins de Travertino e termas minerais, este calcário bandado registra cada camada deixada pela água carbonatada ao evaporar.",
      "O Coliseu de Roma foi erguido com cerca de 100 mil metros cúbicos de travertino — uma das rochas ornamentais mais clássicas da arquitetura."
    ],
    "block:147":[
      "Encontrada em terraços minerais de cânions e bacias alcalinas, esta variedade compacta de travertino exibe bandas cremes assentadas pela precipitação lenta de cálcio.",
      "Águas termais ricas em bicarbonato perdem CO₂ ao esfriar e agitar-se ao ar livre, formando piscinas naturais em degraus como as de Pamukkale, na Turquia."
    ],
    "block:OCHRE_STONE":[
      "O arenito ocre pinta as chapadas com tons quentes de amarelo e cobre, conservando o brilho do entardecer muito depois de o sol descer atrás das serras.",
      "O pigmento ocre — rico em óxidos de ferro hidratados como a goethita — foi um dos primeiros pigmentos usados pela humanidade em pinturas rupestres há mais de 40 mil anos."
    ],
    "block:IRON_TERRACE":[
      "O arenito ferruginoso das Encostas de Hematita une grãos de quartzo com um cimento natural rico em óxido de ferro, criando degraus cor de ferrugem.",
      "Em formações sedimentares antigas, a infiltração de água rica em ferro cria faixas coloridas chamadas anéis de Liesegang na rocha."
    ],
    "block:GRANITE":[
      "Salpicado de grãos visíveis de quartzo, feldspato e mica, o granito ergue cristas montanhosas resistentes que desafiam o vento e a chuva por eras.",
      "O granito é uma rocha ígnea intrusiva: esfria muito devagar a quilômetros de profundidade, dando tempo para seus minerais crescerem em cristais visíveis a olho nu."
    ],
    "block:GNEISS":[
      "De bandas alternadas claras e escuras, o gnaisse domina encostas alpinas e subsolos profundos, revelando forças tectônicas colossais que dobraram antigas montanhas.",
      "O Pão de Açúcar, no Rio de Janeiro, é um gigantesco monolito de gnaisse moldado por centenas de milhões de anos de erosão."
    ],
    "block:BLACK_SHALE":[
      "O folhelho escuro separa-se em lâminas finas no fundo de antigas bacias e regiões vulcânicas, guardando abundante matéria orgânica petrificada.",
      "Folhelhos negros depositam-se em águas antigas pobres em oxigênio e frequentemente preservam fósseis detalhados além de constituir rochas geradoras de petróleo e gás."
    ],
    "block:QUARTZITE":[
      "Mais duro que o aço de ferramentas simples, o quartzito brilha com aparência açucarada em picos montanhosos e resiste à erosão quase sem se desgastar.",
      "O quartzito nasce quando o arenito de quartzo é submetido a calor e pressão metamórficos até os grãos se fundirem em um mosaico extremamente resistente."
    ],
    "block:AMBER_SHALE":[
      "Em camadas sedimentares antigas, o xisto âmbar guarda tons dourados quentes e resinas fossilizadas de florestas que existiram há milhões de anos.",
      "O âmbar verdadeiro é resina fossilizada de árvores antigas que às vezes aprisiona insetos e pólen com preservação microscópica."
    ],
    "block:HORNBLENDE_ROCK":[
      "A rocha de anfibólio destaca-se pelo tom verde-escuro quase negro e pelo brilho alongado de seus cristais prismáticos em afloramentos montanhosos.",
      "A hornblenda é um silicato complexo rico em cálcio, magnésio e ferro muito comum em rochas metamórficas como o anfibolito."
    ],
    "block:SALT":[
      "Cúbico e brilhante sob a luz das salinas, o bloco de sal é colhido tanto para conservar alimentos quanto como reagente essencial nas bancadas do laboratório.",
      "O sal-gema (halita, NaCl) cristaliza naturalmente em cubos perfeitos por causa do arranjo alternado dos íons Na⁺ e Cl⁻ em sua rede cristalina."
    ],
    "block:COAL":[
      "O carvão mineral alimenta fornos, forjas e caldeiras desde os primeiros dias da vila, fornecendo calor intenso e carbono para reduzir minérios metálicos.",
      "O carvão formou-se há cerca de 300 milhões de anos (Período Carbonífero), quando imensas florestas pantanosas foram soterradas e comprimidas sob sedimentos."
    ],
    "block:IRON":[
      "Veio fundamental para a metalurgia do vale, o minério de ferro rende lingotes resistentes na forja para picaretas, espadas, escudos e mecanismos de veículos.",
      "O ferro (Fe, número atômico 26) é o metal mais utilizado pela civilização moderna e também é essencial no sangue humano, onde transporta oxigênio na hemoglobina."
    ],
    "block:MAGNETITE":[
      "Escura e pesada no subsolo das montanhas, a magnetita atrai limalhas metálicas e pode ser reduzida na forja para render ótimo ferro.",
      "A magnetita (Fe₃O₄) é o mineral mais fortemente magnético da natureza e deu origem às primeiras bússolas da história, chamadas pedras-ímã."
    ],
    "block:HEMATITE":[
      "Apesar do brilho cinza-metálico ou avermelhado na rocha, a hematita revela sua identidade ao deixar um risco vermelho-ferrugem característico na porcelana.",
      "O nome hematita vem do grego 'haima' (sangue), referência à cor vermelha intensa de seu pó (Fe₂O₃), o principal minério de ferro do planeta."
    ],
    "block:HEMATITE_VEIN":[
      "Nas Encostas de Hematita, veios concentrados de óxido de ferro cortam o arenito avermelhado e fornecem excelentes amostras para a coleção de mineralogia.",
      "Em Marte, extensos depósitos de hematita e óxidos de ferro na poeira são justamente o que confere ao planeta sua famosa coloração vermelha."
    ],
    "block:WET_IRONSTONE":[
      "Nascida no Brejo Âmbar, a concreção ferruginosa acumula ferro precipitado na água rica em matéria orgânica em nódulos duros sob a turfa.",
      "O chamado 'minério de ferro de pântano' (bog iron) se regenera ao longo de décadas pela ação de bactérias oxidantes de ferro e foi a principal fonte de ferro dos vikings."
    ],
    "block:COPPER":[
      "De veios alaranjados espalhados pelas encostas, o minério de cobre é o primeiro metal facilmente fundível para ferramentas, fios e ligas como bronze e latão.",
      "O cobre (Cu) conduz eletricidade quase tão bem quanto a prata e possui propriedades antimicrobianas naturais que eliminam bactérias em contato com sua superfície."
    ],
    "block:MALACHITE":[
      "Inconfundível pelas faixas verdes concêntricas, a malaquita aflora em zonas oxidadas de depósitos de cobre e rende tanto pigmentos quanto metal na forja.",
      "Quimicamente um carbonato básico de cobre — Cu₂CO₃(OH)₂ —, a malaquita era moída no Egito Antigo para fabricar maquiagem verde para os olhos."
    ],
    "block:GOLD":[
      "Raro e reluzente em veios profundos, o minério de ouro não perde o brilho com a umidade e serve para instrumentos de precisão, moedas e talismãs.",
      "Quase todo o ouro acessível na crosta terrestre chegou por bombardeios de meteoritos há bilhões de anos, após o metal original afundar para o núcleo da Terra."
    ],
    "block:SILVER_ORE":[
      "Os veios prateados das profundezas brilham sob a luz das tochas e rendem prata pura, indispensável para espelhos protetores contra medusas e armas contra lobisomens.",
      "A prata (Ag) escurece com o tempo não por enferrujar com oxigênio, mas por reagir com traços de compostos de enxofre no ar formando sulfeto de prata (Ag₂S)."
    ],
    "block:TIN":[
      "O minério de estanho acompanha veios claros nas montanhas e se combina ao cobre na forja para criar o bronze — marco tecnológico de ligas resistentes.",
      "Ao dobrar uma barra de estanho puro, ouve-se um estalo curioso chamado 'grito do estanho', causado pelo atrito entre os cristais internos se deformando."
    ],
    "block:CASSITERITE":[
      "Escura, pesada e de brilho quase metálico, a cassiterita é o minério clássico de óxido de estanho garimpado tanto em rochas quanto em leitos de rios.",
      "A cassiterita (SnO₂) impulsionou o comércio marítimo da Idade do Bronze porque depósitos de cobre e estanho raramente ocorrem próximos na natureza."
    ],
    "block:ZINC":[
      "O minério de zinco apresenta brilho cinza-azulado e se funde com o cobre para produzir latão, além de ser peça-chave em células eletroquímicas no laboratório.",
      "O zinco (Zn) protege o aço da ferrugem por galvanização: por oxidar mais facilmente que o ferro, ele age como 'metal de sacrifício'."
    ],
    "block:SPHALERITE":[
      "De brilho resinoso em tons de mel e âmbar, a esfalerita acompanha depósitos de sulfetos e é a maior fonte natural de zinco para a oficina de ligas.",
      "O nome esfalerita vem do grego 'sphaleros' (enganoso), porque antigamente mineradores a confundiam facilmente com a galena, minério de chumbo."
    ],
    "block:BAUXITE":[
      "Com aspecto terroso cheio de pequenas esferas avermelhadas, a bauxita concentra hidróxidos de alumínio em regiões quentes e chuvosas.",
      "A bauxita não é um mineral único, mas uma rocha rica em alumínio — metal tão difícil de extrair antes da eletrólise que no século XIX valia mais que o ouro."
    ],
    "block:PYRITE":[
      "Com cristais cúbicos de brilho dourado perfeito, a pirita enganou gerações de garimpeiros apressados, mas fornece ferro e enxofre preciosos para a química.",
      "A pirita (FeS₂) produz faíscas intensas quando golpeada contra aço, razão pela qual foi usada em armas de fogo antigas e para acender fogueiras (seu nome vem do grego 'pyr', fogo)."
    ],
    "block:SULFUR":[
      "Nos arredores vulcânicos, cristais amarelos de enxofre acumulam-se junto a fumarolas e alimentam reações químicas, remédios térmicos e armas de brasa.",
      "O enxofre puro quase não tem cheiro — o famoso odor de ovo podre vem de seus compostos gasosos, como o gás sulfídrico (H₂S)."
    ],
    "block:NITER":[
      "Encontrado em paredes secas de cavernas e climas áridos, o minério de nitrato dissolve-se facilmente em água e serve tanto para fertilizantes quanto para sais laboratoriais.",
      "O salitre (nitrato de potássio ou sódio) era tão valioso na agricultura e na química que gerou disputas históricas no deserto do Atacama, no século XIX."
    ],
    "block:COBALT_ORE":[
      "De reflexos metálicos azulados, o minério de cobalto fornece pigmentos de vidro profundos e ligas extremamente resistentes ao calor e ao magnetismo.",
      "O nome cobalto vem dos 'kobolds', duendes das lendas de mineradores alemães que acreditavam que espíritos enfeitiçavam o minério ao fundi-lo."
    ],
    "block:NICKEL_ORE":[
      "Encontrado em veios esverdeados profundos, o minério de níquel entra na composição de ligas inoxidáveis, moedas de cuproníquel e catalisadores químicos.",
      "O níquel (Ni) é um dos poucos elementos naturalmente ferromagnéticos à temperatura ambiente, ao lado do ferro e do cobalto, e é abundante em meteoritos metálicos."
    ],
    "block:RUTILE":[
      "Com finos cristais prismáticos vermelho-acastanhados, o rutilo é um minério raro rico em titânio procurado por mineralogistas de campo.",
      "O rutilo (TiO₂) tem um dos maiores índices de refração entre os minerais naturais e sua forma refinada é o pigmento branco mais brilhante usado em tintas."
    ],
    "block:DOLOMITE":[
      "Parente próxima do calcário, a dolomita ergue paredões pálidos em serras e cânions e ajuda a corrigir a acidez de solos agrícolas.",
      "A dolomita — CaMg(CO₃)₂ — contém tanto cálcio quanto magnésio e deu nome à espetacular cadeia montanhosa das Dolomitas, na Itália."
    ],
    "block:FLUORITE":[
      "Famosa pelos cristais octaédricos translúcidos em tons de azul, verde e violeta, a fluorita ilumina coleções minerais e auxilia na fundição como fundente.",
      "A palavra 'fluorescência' foi batizada em homenagem à fluorita (CaF₂), que brilha intensamente em azul ou violeta sob luz ultravioleta."
    ],
    "block:BANDED_CALCITE":[
      "A calcita mel dos Jardins de Travertino cristaliza em camadas douradas translúcidas que deixam a luz atravessar suas faces clivadas.",
      "Cristais transparentes de calcita (espato-da-Islândia) apresentam dupla refração: um texto colocado atrás do cristal aparece duplicado."
    ],
    "block:LUMEN_GEODE":[
      "O geodo de calcita violeta do Bosque Lúmen guarda cristais arroxeados dentro de cavidades rochosas, atraindo mariposas e mineralogistas.",
      "Muitos espécimes reais de calcita exibem fluorescência rosa, vermelha ou violeta sob UV devido a pequenas impurezas de manganês ou terras-raras."
    ],
    "block:CRYSTAL":[
      "O cristal prismático cresce em cavernas energizadas e bosques cristalinos, servindo de foco para cajados, orbes e instrumentos ópticos do laboratório.",
      "A geometria externa de faces planas de um cristal reflete diretamente o padrão ordenado e repetitivo dos átomos em seu interior microscópico."
    ],
    "block:AMETHYST":[
      "Quebrar um geodo de ametista revela dezenas de pontas violetas voltadas para o centro da cavidade, muito valorizadas tanto na joalheria quanto na pesquisa mineral.",
      "O Brasil — especialmente o Rio Grande do Sul — abriga alguns dos maiores geodos de ametista do mundo, chegando a vários metros de altura."
    ],
    "block:AQUAMARINE_ORE":[
      "Escondida em pegmatitos e veios próximos a cânions e bacias, a água-marinha brilha com o mesmo azul-esverdeado claro das águas rasas tropicais.",
      "A água-marinha pertence à família do berilo (irmã da esmeralda) e ganha seu tom celeste por traços de ferro na estrutura cristalina."
    ],
    "block:DIAMOND_ORE":[
      "Escondido nas camadas mais fundas próximas à rocha-mãe, o minério de diamante resiste a quase toda ferramenta e guarda o cristal mais duro conhecido.",
      "O diamante e a grafite do lápis são feitos exatamente do mesmo elemento (carbono puro): a diferença extrema de dureza vem apenas do modo como os átomos se ligam."
    ],
    "block:EMERALD_ORE":[
      "Cravado em rochas de montanhas e cânions profundos, o minério de esmeralda fascina expedicionários pelo verde profundo que contrasta contra a pedra cinzenta.",
      "Esmeraldas naturais quase sempre trazem pequenas inclusões internas chamadas 'jardin' (jardim), que ajudam gemólogos a distinguir pedras naturais de sintéticas."
    ],
    "block:RUBY_ORE":[
      "Encontrado sob encostas vulcânicas e chapadas quentes, o minério de rubi libera reflexos carmesins à luz das tochas subterrâneas.",
      "O primeiro laser óptico funcional da história, construído em 1960 por Theodore Maiman, usava um bastão de rubi sintético para emitir luz vermelha coerente."
    ],
    "block:SAPPHIRE_ORE":[
      "O minério de safira repousa no subsolo glacial e sob grandes bacias profundas, oferecendo cristais azuis usados em cajados de geada e lentes resistentes.",
      "Vidro de safira sintética (coríndon transparente) é usado em mostradores de relógios de mergulho e janelas de naves espaciais por ser quase impossível de riscar."
    ],
    "block:OPAL_ORE":[
      "Depositado em termas minerais, cânions e ruínas submersas, o minério de opala espalha reflexos multicoloridos que mudam conforme o ângulo da luz.",
      "A opala contém até 20% de água presa entre esferas microscópicas de sílica — e a NASA já detectou depósitos de opala em Marte, forte indício de água passada."
    ],
    "block:GARNET_ORE":[
      "Com grãos vermelho-escuros incrustados em veios profundos, o minério de granada serve tanto para gemas quanto para abrasivos industriais e armaduras especiais.",
      "Granadas naturais têm hábito dodecaédrico tão perfeito que frequentemente saem da rocha já parecendo pequenas pedras lapidadas com doze faces."
    ],
    "block:GLOWSTONE":[
      "A pedra luminosa emite um clarão dourado constante sem consumir combustível nem soltar fumaça, iluminando túneis profundos e tetos de oficinas.",
      "Fenômenos reais de emissão de luz fria em minerais incluem a fosforescência, na qual cristais absorvem energia e continuam brilhando no escuro por minutos ou horas."
    ],
    "block:SPECTRAL":[
      "A luz espectral nasce da condensação de energia etérea em cristal e ilumina cantos sombrios com um brilho azul-esverdeado que afasta monstros comuns.",
      "Diferente de uma chama quente (incandescência), fontes luminescentes emitem fótons diretamente por transições eletrônicas sem desperdiçar energia em calor."
    ],

    // === BLOCOS METÁLICOS, CONSTRUÇÃO, PORTAS, CERCAS, ILUMINAÇÃO E TESOUROS ===
    "block:BRONZE_BLOCK":[
      "Fundido pela combinação de cobre e estanho, o bloco de bronze reveste monumentos e oficinas com um dourado quente que resiste ao tempo e à maresia.",
      "O bronze é mais duro que o cobre puro e funde a uma temperatura menor, razão pela qual revolucionou armas, sinos e estátuas há mais de 5 mil anos."
    ],
    "block:STEEL_BLOCK":[
      "Maciço e cinza-azulado, o bloco de aço simboliza o auge da metalurgia na forja de ligas, suportando impactos e cargas muito acima do ferro comum.",
      "O aço é uma liga de ferro com pequenas porcentagens de carbono (geralmente 0,2% a 2%), o que multiplica drasticamente sua dureza e resistência mecânica."
    ],
    "block:BRASS_BLOCK":[
      "De brilho dourado claro, o bloco de latão nasce da liga de cobre com zinco e é muito apreciado em engrenagens, instrumentos musicais e acabamentos náuticos.",
      "O latão possui excelente propriedade acústica e baixo atrito metálico, sendo usado em trompetes, fechaduras e peças que não podem gerar faíscas."
    ],
    "block:NICKEL_BLOCK":[
      "Polido em tom prateado suave, o bloco de níquel resiste à oxidação mesmo em climas úmidos e é guardado nos estoques avançados dos fundidores.",
      "O níquel mantém alta resistência mecânica mesmo em temperaturas extremas, sendo peça fundamental nas chamadas superligas de turbinas."
    ],
    "block:PEWTER_BLOCK":[
      "O bloco de liga de estanho (peltre) apresenta brilho fosco elegante e baixa temperatura de fusão, facilitando a moldagem de peças detalhadas na oficina.",
      "Historicamente, o peltre (cerca de 85% a 99% de estanho com cobre e antimônio) era o material preferido para canecas, pratos e instrumentos antes da porcelana barata."
    ],
    "block:CUPRONICKEL_BLOCK":[
      "Unindo cobre e níquel em proporções precisas, o bloco de cuproníquel combina tom prateado rosado com resistência excepcional à corrosão da água do mar.",
      "O cuproníquel é amplamente usado na cunhagem de moedas prateadas modernas e em tubulações navais porque resiste à água salgada e impede incrustação de cracas."
    ],
    "block:COBALT_BLOCK":[
      "Denso e de reflexo metálico azulado frio, o bloco de cobalto representa reservas valiosas dos pavilhões de ligas e laboratórios de materiais.",
      "O cobalto é componente essencial dos ímãs de samário-cobalto e de muitas baterias recarregáveis de íons de lítio usadas hoje em eletrônicos."
    ],
    "block:MAGNESIUM_CEMENT":[
      "Desenvolvido no Refinador de Amostras a partir de óxido de magnésio e ácido fosfórico, este cimento claro endurece depressa com altíssima resistência química.",
      "Cimentos reais de fosfato de magnésio (MPC) curam em minutos mesmo no frio e são usados em reparos rápidos de pontes, pistas de aeroportos e até implantes ósseos."
    ],
    "block:PLANK":[
      "Serradas de troncos maduros e aplainadas na oficina, as tábuas formam pisos, paredes, barcos, pontes e camas em todas as comunidades do mundo.",
      "Cortar a madeira no sentido das fibras (grão longitudinal) aproveita a resistência natural da celulose — que pode ser mais forte por peso que certos aços."
    ],
    "block:GLASS":[
      "O vidro de laboratório nasce da fusão da areia de sílica em fornos altos e permite construir estufas, janelas e paredes transparentes sem abrir mão da proteção.",
      "Quimicamente, o vidro é um sólido amorfo: seus átomos ficam travados em posição rígida, mas sem formar a rede cristalina ordenada de um cristal de quartzo."
    ],
    "block:GLASS_AMBER":[
      "Colorido por traços de ferro e enxofre durante a fusão no forno de vidro, o vidro âmbar aquece o interior de oficinas e protege frascos sensíveis à luz.",
      "Frascos reais de remédios e reagentes são feitos de vidro âmbar porque essa cor bloqueia radiação ultravioleta que degradaria substâncias químicas sensíveis."
    ],
    "block:GLASS_COBALT":[
      "Com um azul profundo inconfundível, o vidro cobalto decora janelas e estufas alquímicas, filtrando a claridade do sol em tons serenos.",
      "Basta menos de 0,1% de óxido de cobalto na mistura de sílica fundida para tingir todo o vidro de um azul-cobalto vibrante e permanente."
    ],
    "block:WINDOW_LEADED":[
      "Montada com divisórias metálicas que unem pequenos painéis de vidro, a janela com caixilho deixa o sol atravessar as oficinas resistindo melhor ao vento.",
      "Janelas antigas usavam quadriculados de chumbo ou ferro porque, antes das técnicas industriais de vidro float, era muito difícil produzir chapas grandes perfeitas."
    ],
    "block:CERAMIC":[
      "Moldada em argila úmida e cozida em forno quente, a cerâmica reveste bancadas, telhados e armaduras protetoras graças à sua resistência ao calor e a ácidos.",
      "A cerâmica é uma das tecnologias químicas mais antigas da humanidade, com vestígios de mais de 20 mil anos — muito antes da própria agricultura."
    ],
    "block:ALCHEMY_BRICK":[
      "De tom verde-azulado característico, o tijolo alquímico mistura argila cozida com minerais de cobre para revestir laboratórios e casas de estudo.",
      "Adicionar óxidos metálicos a esmaltes cerâmicos produz cores permanentes após a queima: cobre gera verde ou turquesa, cobalto gera azul e ferro gera tons terrosos."
    ],
    "block:VILLAGE_BRICK":[
      "Assentado em fileiras firmes nas casas e muros da Vila dos Elementos, o tijolo da vila guarda o calor do forno de barro em sua cor terracota.",
      "O tom alaranjado-avermelhado do tijolo comum vem da oxidação do ferro presente na argila durante a queima em temperaturas entre 900 °C e 1.050 °C."
    ],
    "block:FIELDSTONE":[
      "A pedra aparelhada reúne blocos cortados e ajustados com precisão pelos pedreiros para erguer fundações sólidas, pontes e praças duradouras.",
      "Muros de alvenaria bem encaixados distribuem o peso por compressão — técnica que permitiu a arcos e aquedutos romanos permanecerem de pé por dois milênios."
    ],
    "block:COBBLE_PATH":[
      "Os seixos de caminho desenham as estradas que ligam casas, lojas e mirantes, evitando que a lama da chuva prenda botas e carrinhos.",
      "Pavimentos de pedras arredondadas drenam a água da chuva pelas frestas entre os blocos, reduzindo poças e erosão nas encostas."
    ],
    "block:CLAY_PLASTER":[
      "O reboco de argila reveste paredes externas com um tom terroso acolhedor que ajuda a equilibrar a umidade interna das casas.",
      "Rebocos naturais de barro regulam naturalmente a umidade do ar dentro de construções, absorvendo excesso em dias chuvosos e liberando em dias secos."
    ],
    "block:LIME_PLASTER":[
      "Claro e respirável, o reboco de cal ilumina as fachadas das vilas e reflete o calor do sol nas praças abertas.",
      "A argamassa de cal endurece por carbonatação: o hidróxido de cálcio (Ca(OH)₂) absorve CO₂ do ar e volta a se transformar lentamente em pedra calcária (CaCO₃)."
    ],
    "block:OCHRE_PLASTER":[
      "Tingido com pigmentos minerais das chapadas, o reboco ocre confere às construções de regiões secas um amarelo-dourado que combina com o horizonte.",
      "Os óxidos de ferro presentes no ocre são extremamente estáveis à luz solar, mantendo fachadas vibrantes por décadas sem desbotar."
    ],
    "block:TEAL_PLASTER":[
      "Preferido nas vilas costeiras e bosques úmidos, o reboco verde-petróleo combina pigmentos minerais de cobre com cal para proteger fachadas contra a maresia.",
      "Pigmentos azul-esverdeados à base de cobre e silicatos, como o azul egípcio, estão entre os primeiros pigmentos sintéticos criados pela química antiga."
    ],
    "block:WINE_PLASTER":[
      "Com tom bordô profundo inspirado em óxidos de ferro calcinados, o reboco vinho destaca oficinas de serra e pavilhões vulcânicos.",
      "Aquecer ocre amarelo desidrata a goethita e a transforma em hematita vermelha ou arroxeada — truque usado desde a pré-história para mudar a cor da tinta mineral."
    ],
    "block:ROOF_RED":[
      "Moldadas em barro cozido, as telhas vermelhas escoam tempestades com eficiência e mantêm as casas da vila frescas sob o sol forte.",
      "Telhas cerâmicas têm alta inércia térmica: absorvem calor lentamente durante o dia e criam um colchão de ar ventilado sob o telhado."
    ],
    "block:ROOF_BLUE":[
      "Lascadas em ardósia cinza-azulada, estas telhas suportam o peso de nevascas intensas e ventos fortes nas serras e vilas glaciais.",
      "Telhados bem construídos de ardósia natural podem durar mais de 100 anos sem perder a impermeabilidade."
    ],
    "block:ROOF_MOSS":[
      "As telhas verdes integram-se à copa das florestas e zonas costeiras, evocando telhados antigos colonizados por líquens e musgos protetores.",
      "Telhados vegetados modernos reduzem a temperatura interna de edifícios e retêm parte da água da chuva, aliviando enxurradas."
    ],
    "block:THATCH":[
      "Trançada em feixes densos de palha seca, esta cobertura leve e tradicional oferece ótimo isolamento térmico em chalés de campo e estufas.",
      "A água da chuva escorre pelas camadas inclinadas de palha sem penetrar fundo, enquanto o ar aprisionado entre os talos isola tanto o frio quanto o calor."
    ],
    "block:WOVEN_AWNING":[
      "Costurado pelas tecelãs com lã tingida em faixas alternadas, o toldo tecido oferece sombra fresca nas feiras e varandas ensolaradas.",
      "Tecidos de lã natural repelem respingos leves graças à lanolina das fibras e resistem bem ao estiramento causado pelo vento."
    ],
    "block:GARDEN_BOX":[
      "Montada com tábuas encaixadas junto às janelas da vila, a floreira de madeira traz flores, ervas e cor para o coração das ruas pavimentadas.",
      "Canteiros elevados aquecem mais rápido no início da primavera e permitem controlar com precisão o tipo de solo e a drenagem de cada planta."
    ],
    "block:FENCE_WOOD":[
      "A cerca de madeira delimita currais, hortas e trilhas com simplicidade, impedindo que o rebanho se afaste enquanto deixa a paisagem visível.",
      "Estacas de madeira duram muito mais quando suas pontas enterradas são levemente carbonizadas, criando uma camada de carvão que resiste a fungos."
    ],
    "block:FENCE_BAMBOO":[
      "Leve, flexível e rápida de erguer, a cerca de bambu cerca pomares e galinheiros vergando ao vento sem quebrar.",
      "Os nós ocos do bambu funcionam como anéis estruturais de reforço, combinando leveza extrema com incrível resistência à flexão."
    ],
    "block:FENCE_IRON":[
      "Forjada em barras metálicas verticais, a grade de ferro protege oficinas, varandas e recintos contra invasões sem bloquear a passagem de ar ou luz.",
      "Estruturas em grade reduzem a área exposta ao vento, suportando rajadas fortes muito melhor que muros maciços da mesma espessura."
    ],
    "block:STONE_WALL":[
      "A mureta de pedra acompanha encostas, pontes e praças com blocos baixos e firmes que barram criaturas terrestres sem fechar o horizonte.",
      "Muros de pedra seca — construídos sem cimento apenas pelo encaixe inteligente das pedras — resistem há séculos a chuvas e pequenos tremores."
    ],
    "block:BRICK_WALL":[
      "Ergue-se em torno de jardins e pátios da vila, combinando o tom terracota dos tijolos com a solidez necessária para proteger canteiros.",
      "A amarração alternada dos tijolos (juntas desencontradas) impede que rachaduras avancem em linha reta pela parede."
    ],
    "block:GATE_WOOD":[
      "Instalado nas entradas de currais e hortas, o portão de madeira abre e fecha com um toque para deixar viajantes passarem enquanto mantém os animais seguros.",
      "Uma travessa diagonal em portões de madeira forma triângulos rígidos que impedem a folha do portão de ceder com o próprio peso."
    ],
    "block:GATE_BAMBOO":[
      "Construído com colmos leves e dobradiças simples, o portão de bambu abre silenciosamente nos jardins e caminhos ventilados da vila.",
      "O bambu atinge maturidade estrutural em apenas 3 a 5 anos, enquanto árvores de madeira de lei levam décadas para crescer."
    ],
    "block:GATE_IRON":[
      "Pesado e confiável, o portão de ferro protege depósitos de minérios e fortalezas de expedição contra criaturas hostis que rondam à noite.",
      "Dobradiças bem lubrificadas reduzem o atrito metal-metal, permitindo que um portão de dezenas de quilos gire com apenas uma mão."
    ],
    "block:DOOR":[
      "Entalhada em madeira firme com maçaneta metálica, a porta protege casas e oficinas do vento, da chuva e de criaturas noturnas.",
      "A maçaneta fica sempre no lado oposto às dobradiças para maximizar o braço de alavanca, exigindo menos força (torque) para abrir a folha."
    ],
    "block:DOOR_OPEN":[
      "Aberta para receber luz natural e visitantes, a porta articulada gira sobre o batente liberando a passagem entre o abrigo e o mundo exterior.",
      "Quando aberta em lados opostos de uma casa, portas e janelas criam ventilação cruzada por diferença de pressão atmosférica."
    ],
    "block:BED":[
      "Montada com armação de tábuas e cobertor de lã macia, a cama marca seu ponto de retorno seguro e permite atravessar noites escuras e tempestades descansado.",
      "Durante o sono profundo, o cérebro humano consolida memórias aprendidas durante o dia e o organismo acelera a reparação celular."
    ],
    "block:TORCH":[
      "A tocha acesa é a primeira aliada de qualquer explorador de cavernas: espanta a escuridão e reduz o surgimento de criaturas hostis ao seu redor.",
      "A luz amarela da chama vem de minúsculas partículas de carbono incandescentes aquecidas pela combustão incompleta antes de se queimarem por completo."
    ],
    "block:FIRE":[
      "O fogo aceso aquece acampamentos em noites frias, ilumina clareiras e deve ser vigiado de perto — pois tanto o Saci quanto o Boitatá costumam apagá-lo.",
      "Para existir, o fogo exige os três lados do triângulo da combustão: combustível, comburente (oxigênio) e calor suficiente para atingir a ignição."
    ],
    "block:VILLAGE_LANTERN":[
      "Suspenso em postes ao longo das ruas da Vila dos Elementos, o lampião protege a chama do vento e da chuva, mantendo o povoado seguro durante a noite.",
      "Vidros fechados com aberturas inferiores e superiores aproveitam a convecção: o ar quente sobe e puxa ar fresco rico em oxigênio por baixo para manter a chama estável."
    ],
    "block:MYCELIUM_LAMP":[
      "Frasco selado contendo o extrato luminescente do Fungo de Vidro, esta luminária ilumina cavernas e oficinas sem fogo, fumaça ou risco de incêndio.",
      "A bioluminescência converte energia química quase inteiramente em luz visível (eficiência próxima de 90% ou mais), por isso é chamada de 'luz fria'."
    ],
    "block:SUNKEN_BRICK":[
      "Assentado há gerações em estruturas hoje submersas no fundo das bacias profundas, o tijolo submerso resiste à pressão da água coberto por limo azulado.",
      "Certos concretos romanos antigos feitos com cinza vulcânica (pozolana) ficavam ainda mais fortes quando submersos em água do mar pela cristalização de minerais internos."
    ],
    "block:SUNKEN_MOSAIC":[
      "Padrões geométricos delicados ainda revestem o piso das ruínas submersas, preservados sob a água calma onde baleias passam cantando.",
      "Mosaicos feitos de pedras e vidro vitrificado resistem por milênios debaixo d'água porque pigmentos minerais não apodrecem nem se dissolvem facilmente."
    ],
    "block:SUNKEN_BEACON":[
      "Erguido no alto das colunas das ruínas profundas, o Farol das Ruínas continua emitindo uma claridade esverdeada que guia mergulhadores no escuro do fundo.",
      "A luz vermelha é absorvida já nos primeiros metros de profundidade na água do mar; comprimentos de onda azul-esverdeados são os que viajam mais longe debaixo d'água."
    ],
    "block:EXPEDITION_CHEST":[
      "Encontrado em covis dracônicos, templos, laboratórios soterrados e aldeias das copas, o baú de expedição guarda suprimentos raros e minerais valiosos.",
      "Fechos metálicos reforçados nas quinas protegem os cantos mais vulneráveis de um baú de madeira contra umidade e impactos no transporte."
    ],
    "block:EXPEDITION_CHEST_OPEN":[
      "Depois que seu tesouro é recolhido, o baú aberto permanece como marco silencioso de que aquela expedição já foi desbravada.",
      "Na arqueologia real, o próprio recipiente vazio — sua madeira, pregos e resíduos internos — costuma revelar tanto sobre uma época quanto o conteúdo guardado nele."
    ],
    "block:CIVIC_STONE":[
      "O piso de mosaico reveste o coração das praças cívicas dos povoados, unindo pedras claras e escuras em desenhos ordenados.",
      "Padrões geométricos repetitivos em pisos (tesselação) permitem cobrir grandes áreas sem sobras usando poucas formas simples."
    ],
    "block:CIVIC_MARKER":[
      "Assentado no ponto central das comunidades, o Brasão dos Ofícios sinaliza o encontro entre o mercado, as oficinas e as rotas regionais.",
      "Em vilas históricas, o marco zero da praça central servia tanto como ponto de encontro quanto como referência oficial para medir distâncias das estradas."
    ],
    "block:LAB_GUIDE_GOLD":[
      "A faixa dourada no chão do Laboratório Carbono conduz visitantes diretamente à ala de Mineralogia, onde amostras de rochas e minérios são catalogadas.",
      "Sinalizações cromáticas no piso (gestão visual) são amplamente usadas em laboratórios reais para orientar fluxos de segurança e setores especializados."
    ],
    "block:LAB_GUIDE_BLUE":[
      "Seguindo os azulejos azuis do laboratório, os pesquisadores chegam rapidamente à ala das Águas, dedicada a testes de salinidade, pH e destilação.",
      "Em análises ambientais, a cor azul padroniza linhas de água potável e sistemas hidráulicos em plantas técnicas e laboratórios."
    ],
    "block:LAB_GUIDE_GREEN":[
      "A trilha verde atravessa o piso até o setor de Ecologia, conectando microscópios, herbários e registros da fauna observada em campo.",
      "A ecologia estuda tanto os organismos vivos (fatores bióticos) quanto solo, luz, água e clima (fatores abióticos) que moldam cada habitat."
    ],

    // === ESTAÇÕES DE TRABALHO, LABORATÓRIO E ALQUIMIA ===
    "block:LAB":[
      "A Bancada Química é o coração da ciência no QuimiCraft: nela se misturam reagentes, preparam-se soluções e investigam-se transformações da matéria.",
      "Bancadas químicas reais usam tampos resistentes a ácidos e solventes, como resina epóxi, ardósia ou cerâmica, para suportar derramamentos com segurança."
    ],
    "block:FURNACE":[
      "O forno de pedra concentra o calor das brasas dentro de uma câmara fechada para assar alimentos, queimar argila e fundir os primeiros minérios.",
      "Paredes espessas de pedra reduzem a perda de calor por condução e irradiação, alcançando temperaturas muito maiores que uma fogueira aberta."
    ],
    "block:ASSAY_BENCH":[
      "Equipada com lupas, martelos e cadernos de ensaio, a Bancada de Mineração permite analisar minérios, preparar compostos e planejar o refino de gemas.",
      "Na mineralogia prática, identifica-se um mineral testando dureza (escala de Mohs), cor do traço em porcelana, brilho, densidade e reação com ácido."
    ],
    "block:SEED_BENCH":[
      "Na Mesa de Cultivo, hortelãos separam sementes, preparam mudas enraizadas e organizam o calendário das colheitas da vila.",
      "Muitas sementes permanecem em dormência até encontrar a combinação exata de umidade, temperatura e luz necessária para germinar com sucesso."
    ],
    "block:FISH_RACK":[
      "Instalada perto dos cais e margens, a Estação de Pesca organiza varas, iscas e a preparação do pescado trazido de rios, lagos e oceanos.",
      "Escolher a isca e a profundidade corretas depende do hábito alimentar de cada espécie — peixes de superfície, meia-água e fundo reagem a estímulos diferentes."
    ],
    "block:KITCHEN_STOVE":[
      "O fogão de pedra reúne chapas quentes e forno para transformar pescados, carnes, frutas e raízes em refeições nutritivas para longas expedições.",
      "O cozimento provoca a reação de Maillard entre açúcares e aminoácidos, criando aromas complexos, melhorando a digestibilidade e eliminando microrganismos."
    ],
    "block:GLASS_KILN":[
      "Construído para suportar calor intenso, o forno de vidro funde areia de sílica e pigmentos minerais em vidraças claras, âmbar e cobalto.",
      "Após moldado, o vidro quente precisa passar por recozimento (resfriamento lento e controlado) para aliviar tensões internas e não trincar sozinho."
    ],
    "block:METAL_FORGE":[
      "Na Forja de Ligas, fundidores combinam cobre, estanho, zinco, ferro e níquel em proporções controladas para criar bronze, latão, aço e cuproníquel.",
      "Ligas metálicas costumam ser mais duras que metais puros porque átomos de tamanhos diferentes dificultam o deslizamento das camadas cristalinas."
    ],
    "block:FIELD_ANALYZER":[
      "Equipamento de dois blocos do laboratório de campo, o Analisador de Amostras mede composição, pH, pureza, densidade e ponto de ebulição com precisão.",
      "Medir propriedades físicas como densidade e ponto de ebulição permite identificar substâncias puras e detectar misturas ou impurezas sem destruí-las."
    ],
    "block:FIELD_EXTRACTOR":[
      "Com três módulos integrados, o Extrator Químico separa substâncias ativas de tecidos, salivas dracônicas, lágrimas de medusa e carapaças de extermínio.",
      "Na química real, técnicas de extração aproveitam diferenças de solubilidade entre fases (como água e solvente orgânico) para isolar compostos desejados."
    ],
    "block:FIELD_BOILER":[
      "A Estação de Ebulição aquece e condensa líquidos em circuito controlado para destilar água pura e concentrar soluções químicas em campo.",
      "Na destilação, o líquido de menor ponto de ebulição vaporiza primeiro e volta ao estado líquido no condensador, deixando sais e impurezas sólidas para trás."
    ],
    "block:FIELD_REFINER":[
      "Ocupando quatro blocos de bancada, o Refinador de Amostras sintetiza compósitos avançados, filtros, cimentos especiais e reagentes purificados.",
      "Muitas sínteses químicas exigem etapas sequenciais de purificação e controle de proporção (estequiometria) para evitar excesso de reagentes."
    ],
    "block:FUME_HOOD":[
      "A Capela de Exaustão ocupa uma bancada ampla sob oito módulos de sucção, capturando gases e vapores perigosos antes que atinjam quem trabalha no laboratório.",
      "Capelas reais mantêm fluxo contínuo de ar para dentro (pressão negativa), protegendo o cientista contra inalação de vapores ácidos, tóxicos ou inflamáveis."
    ],
    "block:ALCHEMY_BORDER":[
      "O tijolo da guilda delimita os pátios e entradas das casas alquímicas espalhadas pelo mundo, sinalizando um posto dedicado ao estudo experimental.",
      "Símbolos de guildas medievais e renascentistas identificavam oficinas especializadas em vidro, metalurgia, tinturaria e botica."
    ],
    "block:ALCHEMY_SIGN":[
      "Gravado com insígnias geométricas douradas, o brasão alquímico marca a fachada das cinco especialidades de estudo presentes no mundo.",
      "Antes da notação química moderna criada por Berzelius, alquimistas usavam símbolos geométricos para representar metais, planetas e operações laboratoriais."
    ],
    "block:ALCHEMY_SAMPLE":[
      "O posto de coleta guarda frascos etiquetados com amostras locais de água, salmoura, pigmentos ou ligas trazidas pelos aprendizes da região.",
      "Na pesquisa de campo, registrar data, coordenadas e condições climáticas de cada amostra é tão importante quanto a própria amostra coletada."
    ],
    "block:ALCHEMY_BENCH":[
      "Coberta por frascos e anotações, a bancada de poções serve para formular soluções úteis em campo — de névoa de fuga a compostos de mergulho.",
      "A antiga palavra 'alquimia' compartilhou raízes com a química moderna, que herdou dela vidrarias essenciais como o alambique, o almofariz e o banho-maria."
    ],
    "block:ALCHEMY_VIAL_RACK":[
      "A estante de frascos mantém tubos e soluções organizados por cor, pH e densidade para facilitar comparações rápidas durante os ensaios.",
      "Armazenar reagentes incompatíveis separados (como ácidos fortes longe de bases e oxidantes) é uma regra básica de segurança laboratorial."
    ],
    "block:ALCHEMY_BALANCE":[
      "A balança de laboratório garante medidas exatas de massa antes de cada reação ou fundição, evitando desperdício de reagentes limitantes.",
      "Foi usando balanças extremamente precisas no século XVIII que Antoine Lavoisier demonstrou a Lei da Conservação das Massas nas reações químicas."
    ],
    "block:ALCHEMY_FILTER":[
      "O filtro de bancada separa areia, argila e partículas sólidas em suspensão de águas turvas antes de seguirem para a destilação.",
      "A filtração retém sólidos insolúveis conforme o tamanho dos poros do filtro, mas sais dissolvidos (íons microscópicos) atravessam o papel normalmente."
    ],
    "block:ALCHEMY_STILL":[
      "Com serpentina resfriada e balão de aquecimento, o alambique de bancada separa água pura de sais dissolvidos por evaporação e condensação.",
      "O alambique foi aperfeiçoado por estudiosos medievais como Jabir ibn Hayyan e é a base dos destiladores modernos de água, óleos essenciais e combustíveis."
    ],
    "block:ALCHEMY_MOLD":[
      "O molde de ligas recebe metais fundidos em proporções exatas, permitindo testar como a mistura de cobre e estanho altera dureza e ductilidade.",
      "A velocidade com que um metal fundido esfria dentro do molde determina o tamanho de seus grãos cristalinos e influencia diretamente sua resistência."
    ],
    "block:ALCHEMY_CELL":[
      "A bancada eletroquímica conecta eletrodos de zinco e cobre por uma ponte salina, transformando reações químicas de oxirredução em corrente elétrica.",
      "Esse arranjo clássico é a Pilha de Daniell (1836), capaz de gerar cerca de 1,10 volt estável graças ao fluxo de elétrons do zinco para o cobre."
    ],
    "block:ALCHEMY_CRYSTAL_TRAY":[
      "Na cuba de cristalização, soluções saturadas evaporam lentamente até os sais excedentes formarem cristais geométricos nítidos no fundo.",
      "Quanto mais lenta e tranquila a evaporação de uma solução saturada, maiores e mais bem formados crescem os cristais resultantes."
    ],
    "block:ALCHEMY_CALORIMETER":[
      "O calorímetro mede com precisão se uma reação libera calor (exotérmica) ou absorve calor do meio (endotérmica), registrando cada grau de variação.",
      "Calorímetros reais têm paredes termicamente isoladas para impedir troca de calor com o ambiente externo e medir exatamente a energia envolvida na reação."
    ],

    // === MADEIRAS, COPAS E VEGETAÇÃO NATURAL ===
    "block:WOOD":[
      "O tronco robusto das árvores comuns forma a espinha dorsal das florestas temperadas e fornece a madeira versátil que ergue casas, pontes e ferramentas.",
      "Apenas uma fina camada logo abaixo da casca (o câmbio) cresce ativamente em uma árvore; o cerne interno é madeira morta que oferece sustentação mecânica."
    ],
    "block:LEAVES":[
      "As folhas formam copas sombreadas que filtram a luz do sol, regulam a umidade do bosque e liberam oxigênio enquanto produzem alimento para a árvore.",
      "A cor verde das folhas vem da clorofila, pigmento que absorve fortemente luz azul e vermelha para a fotossíntese e reflete a luz verde."
    ],
    "block:PINE_LOG":[
      "Reto e aromático, o tronco de pinheiro domina taigas e encostas frias, oferecendo madeira leve e rica em resina natural resistente à umidade.",
      "A resina das coníferas cicatriza ferimentos na casca, aprisionando insetos perfuradores e impedindo a entrada de fungos no tronco."
    ],
    "block:PINE_LEAVES":[
      "Com folhas finas em forma de agulhas escuras, os pinheiros mantêm a fotossíntese ativa mesmo no inverno rigoroso sem perder toda a copa.",
      "A camada cerosa (cutícula) espessa nas agulhas de pinheiro reduz drasticamente a evaporação de água quando o solo está congelado."
    ],
    "block:DRY_LEAVES":[
      "As folhas secas tingem bosques outonais de dourado e ferrugem antes de cair e enriquecer o húmus do chão florestal.",
      "No outono, árvores decíduas reabsorvem a clorofila verde das folhas antes de soltá-las, revelando pigmentos amarelos e alaranjados (carotenoides) que já estavam ali."
    ],
    "block:CHERRY_LOG":[
      "De casca avermelhada e lisa, o tronco de cerejeira ergue-se nos bosques floridos e oferece uma madeira fina de grão elegante para marcenaria.",
      "A madeira de cerejeira escurece gradualmente ao longo dos anos quando exposta à luz solar, adquirindo um brilho castanho-avermelhado rico."
    ],
    "block:CHERRY_LEAVES":[
      "Na floração, as folhas e flores de cerejeira cobrem bosques inteiros de rosa suave, atraindo aves, insetos e olhares de viajantes.",
      "No Japão, a tradição secular do 'hanami' celebra justamente a beleza breve das cerejeiras em flor, cuja floração plena dura cerca de uma semana."
    ],
    "block:PALM_LOG":[
      "O tronco anelado das palmeiras verga diante de ventos costeiros sem partir, acompanhando praias arenosas e oásis quentes.",
      "Botanicamente, palmeiras são monocotiledôneas e não têm madeira com anéis de crescimento como carvalhos; seu caule (estipe) é um feixe fibroso extremamente elástico."
    ],
    "block:PALM_LEAVES":[
      "Abertas em leque no alto do estipe, as folhas de palmeira criam sombra fresca na areia quente e deixam a brisa marinha passar entre os folíolos rasgados.",
      "Os recortes naturais nas folhas grandes das palmeiras reduzem a resistência ao vento durante tempestades tropicais, evitando que a copa seja arrancada."
    ],
    "block:REDWOOD_LOG":[
      "Imenso e de casca fibrosa avermelhada, o tronco de sequoia eleva-se acima de todas as outras árvores da floresta, suportando até incêndios rasteiros.",
      "Sequoias (Sequoia sempervirens) são as árvores mais altas da Terra, ultrapassando 115 metros, e sua casca espessa sem resina funciona como escudo natural contra o fogo."
    ],
    "block:REDWOOD_LEAF":[
      "A copa altíssima das sequoias intercepta a neblina das montanhas e faz gotas de água choverem continuamente sobre samambaias e musgos no solo.",
      "Sequoias gigantes absorvem até 30% de toda a água de que precisam diretamente da neblina através das próprias folhas no alto da copa."
    ],
    "block:REDWOOD_END":[
      "O corte transversal de uma sequoia revela centenas de anéis concêntricos de madeira avermelhada, testemunhando séculos de estações úmidas e secas.",
      "O alto teor de taninos no cerne das sequoias torna a madeira naturalmente resistente a cupins e ao apodrecimento por fungos."
    ],
    "block:MANGROVE_LOG":[
      "Retorcido e apoiado em raízes aéreas firmes, o tronco de mangue resiste diariamente ao avanço da água salobra e às marés dos estuários.",
      "A madeira de mangue é tão densa e pesada que pedaços recém-cortados frequentemente afundam na água em vez de flutuar."
    ],
    "block:MANGROVE_LEAF":[
      "Brilhantes e espessas, as folhas de mangue filtram a luz quente dos estuários e eliminam excessos de sal marinho absorvido pelas raízes.",
      "Muitas espécies de mangue possuem glândulas secretoras nas folhas que expelem cristais microscópicos de sal, visíveis ao sol na superfície foliar."
    ],
    "block:MANGROVE_END":[
      "O topo do tronco de mangue exibe madeira escura e compacta marcada pelos desafios contínuos da salinidade e das correntes costeiras.",
      "Os manguezais funcionam como berçários marinhos essenciais e protegem a costa amortecendo a energia de ressacas e tempestades."
    ],
    "block:BIRCH_LOG":[
      "Fácil de reconhecer pela casca clara marcada por listras horizontais escuras, o tronco de bétula destaca-se em bosques luminosos e encostas frias.",
      "A casca da bétula contém betulina, uma substância branca impermeável e rica em óleos que era usada por povos nórdicos para construir canoas e acender fogo mesmo na chuva."
    ],
    "block:BIRCH_LEAF":[
      "Pequenas e vibrantes, as folhas de bétula balançam à menor brisa criando um jogo de luz cintilante no chão dos bosques temperados.",
      "Bétulas são árvores pioneiras: germinam rapidamente em áreas abertas e ajudam a preparar o solo sombreado para outras espécies florestais."
    ],
    "block:BIRCH_END":[
      "O corte do tronco de bétula mostra uma madeira clara, uniforme e macia de trabalhar, muito apreciada para móveis e utensílios leves.",
      "As pequenas marcas horizontais na casca da bétula chamam-se lenticelas e funcionam como poros para a troca de gases do tronco."
    ],
    "block:ACACIA_LOG":[
      "De casca áspera e galhos esgalhados, o tronco de acácia resiste ao sol intenso das savanas e chapadas, oferecendo sombra rara aos rebanhos.",
      "Muitas acácias africanas vivem em mutualismo com formigas agressivas que moram em seus espinhos ocos e atacam herbívoros que tentam comer a árvore."
    ],
    "block:ACACIA_LEAF":[
      "Formando copas largas em guarda-chuva sobre a savana, as folhas miúdas da acácia economizam água sob o calor seco do meio-dia.",
      "Quando girafas ou antílopes começam a comer uma acácia, ela libera gás etileno no ar alertando acácias vizinhas para produzirem taninos amargos nas folhas em minutos."
    ],
    "block:ACACIA_END":[
      "O miolo alaranjado e resistente do tronco de acácia suporta bem climas secos e fornece madeira durável para construções de savana.",
      "A goma-arábica usada na indústria alimentícia e em aquarelas é obtida da seiva endurecida de espécies de acácia."
    ],
    "block:JACARANDA_LOG":[
      "De casca escura e madeira perfumada, o tronco de jacarandá ergue-se nos bosques lilases e é valorizado há gerações por artesãos e carpinteiros.",
      "A madeira de jacarandá é famosa pela ressonância acústica excepcional, sendo tradicionalmente usada em violões e pianos de concerto."
    ],
    "block:JACARANDA_LEAF":[
      "A florada roxo-azulada do jacarandá cobre copas inteiras nos bosques lilases e forra as trilhas abaixo com um tapete violeta perfumado.",
      "O jacarandá-mimoso (Jacaranda mimosifolia) é nativo da América do Sul e suas flores tubulares atraem abelhas, mamangavas e beija-flores."
    ],
    "block:JACARANDA_END":[
      "O corte do jacarandá revela veios escuros elegantes e alta densidade natural, marca registrada das madeiras nobres do bosque.",
      "O gênero Jacaranda tem nome de origem tupi-guarani que significa 'árvore perfumada' ou 'madeira de cerne duro'."
    ],
    "block:BAMBOO":[
      "Crescendo em moitas altas e verdes perto de margens úmidas, o bambu fornece colmos ocos e resistentes para cercas, arcos recurvos e andaimes.",
      "O bambu não é uma árvore, mas uma gramínea gigante — e detém o recorde de planta terrestre de crescimento mais rápido, chegando a crescer até 90 cm em um único dia."
    ],
    "block:CACTUS":[
      "Adaptado aos desertos e badlands, o cacto guarda reservas preciosas de água dentro do caule verde e protege-se de herbívoros com fileiras de espinhos.",
      "Os espinhos do cacto são folhas modificadas que reduzem a perda de água e criam micro-sombras, enquanto o caule verde assume a fotossíntese (metabolismo CAM à noite)."
    ],
    "block:TALL_GRASS":[
      "Os tufos de grama alta balançam ao vento nas planícies, servindo de esconderijo para coelhos, lebres e aves pequenas e fornecendo sementes silvestres.",
      "O polen das gramíneas é levado pelo vento (anemofilia), por isso suas flores são discretas e não precisam de pétalas chamativas para atrair insetos."
    ],
    "block:POPPY":[
      "Com pétalas vermelho-vivo que pontilham planícies floridas, a papoula rubra é colhida por botânicos e alquimistas para estudos de pigmentos naturais.",
      "As sementes de papoula podem ficar dormentes no solo por décadas até a terra ser revolvida e a luz solar disparar sua germinação."
    ],
    "block:BLUE_FLOWER":[
      "A Flor-cobalto colore campinas e margens frescas com pétalas azul-intenso, ajudando coletores a identificar solos bem irrigados.",
      "O azul verdadeiro é uma das cores mais raras nas flores da natureza — geralmente produzido por antocianinas combinadas a íons metálicos e pH celular específico."
    ],
    "block:WHITE_FLOWER":[
      "A Estrela-das-neves floresce perto de prados alpinos e encostas frias, abrindo pétalas alvas que refletem a luz suave da serra.",
      "Flores alpinas frequentemente possuem pelos finos prateados que funcionam como um casaco térmico e bloqueiam excesso de radiação ultravioleta nas altitudes."
    ],
    "block:FERN":[
      "Desenrolando frondes verdes sob a sombra úmida das sequoias e florestas densas, a samambaia prospera onde pouca luz direta alcança o chão.",
      "Samambaias são plantas vasculares ancestrais que surgiram há mais de 360 milhões de anos e se reproduzem por esporos dispostos em pontinhos sob as folhas (soros)."
    ],
    "block:REED":[
      "O junco ergue talos flexíveis nas margens rasas de rios, lagoas e manguezais, dobrando-se suavemente com as cheias e abrigando garças e peixes.",
      "Plantas de junco funcionam como filtros biológicos naturais: suas raízes absorvem excesso de nutrientes e retêm sedimentos nas margens."
    ],
    "block:RUST_REED":[
      "O junco ferrugíneo cresce nas bordas do Brejo Âmbar, absorvendo ferro do solo alagado em talos cor de bronze e abrigando o Íbis Âmbar.",
      "Plantas de áreas ricas em ferro formam frequentemente uma 'placa de ferro' alaranjada ao redor das raízes que impede o excesso do metal de intoxicar a planta."
    ],
    "block:CALCITE_REED":[
      "A ceríntia das termas prospera nos Jardins de Travertino, tolerando águas alcalinas carregadas de cálcio onde outras plantas murchariam.",
      "Plantas adaptadas a solos ricos em calcário são chamadas de calcícolas e ajustam a química das raízes para continuar absorvendo ferro e fósforo em pH alto."
    ],
    "block:SALT_REED":[
      "A juncália salina resiste às brisas salgadas das salinas e deltas salobros, oferecendo abrigo e alimento à Lebre das Salinas.",
      "Plantas tolerantes ao sal (halófitas) acumulam sais em vacúolos celulares seguros para continuar puxando água por osmose mesmo em solo salgado."
    ],
    "block:ORCHID":[
      "De pétalas delicadas e simétricas, a orquídea silvestre surge em florestas úmidas e manguezais, atraindo polinizadores específicos com formas e aromas sutis.",
      "A família das orquídeas (Orchidaceae) é uma das maiores do reino vegetal, com mais de 28 mil espécies — e suas sementes minúsculas dependem de fungos para germinar."
    ],
    "block:LAVENDER":[
      "Perfumando os bosques lilases com espigas roxas, a lavanda atrai abelhas e aves pequenas e é muito procurada para extratos aromáticos.",
      "O aroma relaxante da lavanda vem de óleos essenciais como linalol e acetato de linalila produzidos em minúsculas glândulas nas flores para afastar insetos herbívoros."
    ],
    "block:WATER_LILY":[
      "A ninféia estende folhas redondas flutuantes sobre lagos serenos, abrindo flores rosadas ao sol enquanto cria sombra fresca para peixes e anfíbios abaixo.",
      "Os estômatos (poros respiratórios) das folhas de ninféia ficam na face superior voltada para o ar, ao contrário das plantas terrestres que os concentram embaixo."
    ],
    "block:BERRY_BUSH":[
      "O arbusto de bagas colore clareiras temperadas com frutos vermelhos suculentos que alimentam ursos, pássaros, raposas e viajantes famintos.",
      "A cor vibrante das bagas maduras evoluiu como um anúncio visual para aves e mamíferos, que comem a polpa doce e espalham as sementes intactas longe da planta-mãe."
    ],
    "block:BLUE_MUSHROOM":[
      "Sob o dossel sombrio das sequoias, o cogumelo índigo destaca-se pelo chapéu azul-arroxeado e pelo papel silencioso na decomposição de troncos caídos.",
      "Cogumelos não são plantas: pertencem ao Reino Fungi, não fazem fotossíntese e possuem parede celular de quitina — a mesma substância da carapaça dos insetos."
    ],
    "block:FOREST_MUSHROOM":[
      "O cogumelo do bosque surge após chuvas quentes sobre o húmus úmido das florestas, formando às vezes círculos perfeitos no gramado.",
      "O cogumelo visível é apenas o corpo de frutificação; sob a terra espalha-se uma rede imensa de filamentos chamada micélio — o maior organismo vivo da Terra é um fungo."
    ],
    "block:GLOW_FUNGUS":[
      "Símbolo do Bosque Lúmen, o cogumelo-lúmen emite luz própria esverdeada durante toda a noite, servindo de ponto de referência e alimento para a Mariposa Lúmen.",
      "Em fungos bioluminescentes reais (como Neonothopanus gardneri, o 'flor-de-coco' brasileiro), a luz verde atrai insetos noturnos que ajudam a dispersar seus esporos."
    ],
    "block:LICHEN":[
      "O líquen dourado adere diretamente a rochas nuas e troncos frios onde nenhuma raiz consegue penetrar, iniciando lentamente a formação de solo novo.",
      "O líquen não é um único organismo, mas uma simbiose íntima entre um fungo (que dá abrigo e umidade) e uma alga ou cianobactéria (que produz alimento pela fotossíntese)."
    ],
    "block:FROST_LICHEN":[
      "O líquen-azul das Cristas de Gelo Azul suporta congelamentos repetidos e fornece alimento vital para herbívoros polares durante o inverno.",
      "Certos líquens são tão extremos que sobreviveram à exposição direta ao vácuo, frio e radiação do espaço sideral em experimentos fora da Estação Espacial Internacional."
    ],
    "block:MINT_PATCH":[
      "A hortelã silvestre espalha-se rápido em solos úmidos com aroma refrescante, servindo de ingrediente culinário e erva aromática para o laboratório.",
      "A sensação de frescor causada pelo mentol da hortelã não baixa a temperatura da boca: ele ativa quimicamente o mesmo receptor nervoso (TRPM8) que detecta o frio."
    ],
    "block:ALPINE_BUSH":[
      "Os frutos da serra crescem em arbustos baixos e resistentes ao vento nos prados alpinos, concentrando açúcares durante o verão curto das montanhas.",
      "Muitas frutas de climas frios ficam ainda mais doces após a primeira geada, pois a planta converte amido em açúcares que atuam como anticongelante celular."
    ],
    "block:RICE_REED":[
      "O arroz de várzea silvestre prospera em margens inundadas de rios e planícies alagáveis, inclinando espigas douradas sobre a água rasa.",
      "O arroz consegue crescer em solos completamente alagados graças a canais internos de ar que conduzem oxigênio das folhas até as raízes submersas."
    ],
    "block:PRICKLY_PEAR":[
      "A palma frutífera ergue raquetes espinhosas nos desertos e chapadas secas, produzindo frutos doces e suculentos que saciam a sede sob o sol forte.",
      "Palmas do gênero Opuntia (como o figo-da-índia) armazenam água em mucilagem espessa e abrem seus poros para absorver CO₂ apenas durante a noite fresca."
    ],
    "block:CACAO_BRANCH":[
      "Pendente em ramos sombreados da selva tropical, o cacaueiro oferece frutos aromáticos muito apreciados por antas, macacos e cozinheiros da vila.",
      "O cacaueiro (Theobroma cacao, 'alimento dos deuses') é polinizado quase exclusivamente por minúsculos mosquitos chamados maruins que vivem na serrapilheira úmida."
    ],
    "block:CHERRY_BRANCH":[
      "Carregado de frutos rubros nos bosques de cerejeiras, este ramo oferece cerejas doces para colheita direta e receitas de cozinha.",
      "A cereja pertence à família das rosas (Rosaceae) — a mesma de maçãs, pêssegos, morangos e amêndoas."
    ],
    "block:PINE_CONE":[
      "As pinhas guardam pinhões nutritivos entre escamas lenhosas no alto dos pinheiros, soltando as sementes quando o ar fica seco.",
      "As escamas da pinha abrem em dias secos e fecham na chuva por um mecanismo puramente físico (higroscópico), mesmo depois que a pinha já caiu da árvore."
    ],
    "block:SALTWORT":[
      "A salicórnia cresce em terrenos salinos e costeiros com ramos carnudos verde-brilhantes que concentram minerais do mar.",
      "Conhecida como 'aspargo-do-mar', a salicórnia era queimada antigamente para produzir cinzas ricas em carbonato de sódio (barrilha), usadas para fabricar vidro e sabão."
    ],
    "block:VERMILION_AGAVE":[
      "A agave rubra abre rosetas pontiagudas nas Encostas de Hematita, armazenando água nas folhas grossas durante meses de sol intenso.",
      "Muitas espécies de agave florescem apenas uma única vez na vida após 10 a 30 anos de crescimento, erguendo um pendão floral gigante antes de morrer."
    ]
  });

  Object.assign(notes,{
    // === ARMAS ===
    iron_sword:[
      "Primeira lâmina confiável de quem sai do Laboratório Carbono para explorar o continente, a espada curta de ferro equilibra peso leve e corte seguro.",
      "Espadas curtas foram populares por milênios justamente por permitirem movimentos rápidos em espaços fechados como cavernas e trilhas estreitas."
    ],
    dagger:[
      "Forjada com aço fino e cabo envolto em couro, a adaga sacrifica alcance para entregar golpes extremamente rápidos em combates corpo a corpo.",
      "Por ter centro de gravidade bem junto à mão do usuário, uma lâmina curta acelera muito mais depressa do que espadas longas de mesma massa."
    ],
    longsword:[
      "Mais comprida e balanceada que a lâmina inicial, a espada longa estende o alcance do explorador mantendo a outra mão livre para escudos ou focos arcanos.",
      "O sulco central presente em muitas espadas longas (goteira ou 'fuller') não servia para escorrer sangue: sua função real era reduzir o peso sem perder rigidez estrutural."
    ],
    greatsword:[
      "Empunhada com as duas mãos e forjada em aço temperado com detalhes de bronze, a espada de duas mãos varre até três inimigos em um único arco poderoso.",
      "Espadas montantes históricas pesavam menos do que parece — geralmente entre 2 e 3,5 kg — para continuar manobráveis em giros contínuos."
    ],
    scimitar:[
      "Inspirada nas oficinas das regiões áridas, a cimitarra usa uma curva elegante para deslizar por até dois alvos à frente com golpes ágeis e contínuos.",
      "Lâminas curvas concentram o contato do corte em um ponto menor enquanto deslizam, aumentando a eficiência do corte em movimento."
    ],
    mace:[
      "Com a cabeça flangeada de ferro e bronze sobre cabo reforçado, a maça de guerra esmaga carapaças pesadas, empurrando e desacelerando qualquer criatura atingida.",
      "A maça foi projetada historicamente para enfrentar armaduras de placas: mesmo sem cortar o metal, a transferência de energia cinética atordoava o oponente."
    ],
    bronze_sword:[
      "Moldada em liga de cobre e estanho na forja da vila, a espada de bronze destaca-se pela agilidade entre golpes e resistência natural à ferrugem.",
      "Diferente do ferro forjado a martelo, espadas de bronze eram fundidas diretamente em moldes de pedra ou argila e endurecidas nas bordas por martelamento a frio."
    ],
    obsidian_sword:[
      "Reunindo lâminas afiadas de vidro vulcânico negro sobre núcleo de ferro, a espada de obsidiana troca cadência por cortes profundos e grande alcance.",
      "Os antigos guerreiros astecas usavam o macuahuitl, uma arma de madeira incrustada com lâminas afiadíssimas de obsidiana lascada."
    ],
    wand:[
      "Construída com madeira seca, cobre condutor e fragmento de cristal, a varinha de centelha lança disparos rápidos com baixo consumo de mana.",
      "O cobre ao longo da haste atua como guia de energia para o cristal na ponta, permitindo disparos sucessivos sem superaquecer o foco."
    ],
    wind_staff:[
      "Símbolo dos exploradores das serras, o Cajado do Vento canaliza essência eólica para projetar rajadas precisas e ciclones expansivos que afastam ameaças.",
      "Um vórtice de ar estável reduz a pressão atmosférica no núcleo, puxando poeira e partículas leves para o centro do redemoinho."
    ],
    frost_staff:[
      "Coroado por safira e gelo compacto, o Cajado de Geada dispara orbes e pulsos congelantes que reduzem a velocidade de criaturas velozes em campo.",
      "Mudanças bruscas de temperatura absorvem calor sensível do alvo, diminuindo a mobilidade muscular de criaturas expostas ao frio."
    ],
    prism_staff:[
      "Montado com opala furta-cor e fluorita translúcida, o Cajado Prismático divide a energia arcana em um leque luminoso de três orbes simultâneos.",
      "Em óptica, um prisma refrata e decompõe um feixe único em múltiplos raios conforme o ângulo de incidência e o índice de refração do cristal."
    ],
    silver_staff:[
      "A haste de prata polida do Cajado de Prata carrega pulsos lunares circulares concebidos especialmente para proteger viajantes nas noites de lua cheia contra lobisomens.",
      "A prata possui o maior índice de refletância óptica no espectro visível entre todos os metais, devolvendo quase toda a luz lunar que toca sua superfície."
    ],
    bow:[
      "Entalhado em madeira flexível com corda bem esticada, o arco comum oferece ataques seguros à distância contra monstros hostis e sentinelas.",
      "Ao puxar a corda, o arqueiro armazena energia potencial elástica nas hastes curvadas do arco — que se converte em energia cinética na flecha em milissegundos."
    ],
    bamboo_bow:[
      "Leve e elástico, o arco recurvo de bambu permite cadência de disparos mais rápida graças à flexibilidade natural dos colmos curvados.",
      "O tradicional arco japonês yumi e muitos arcos compostos asiáticos utilizam lâminas de bambu por sua excelente relação entre leveza e força de retorno."
    ],
    steel_bow:[
      "Tensionado com aço da forja de ligas, este arco exige puxada firme, mas dispara flechas em altíssima velocidade com impacto muito superior ao arco de madeira.",
      "A maior rigidez elástica do aço permite armazenar muito mais energia de deformação antes de atingir o limite do material."
    ],
    crossbow:[
      "Com coronha reforçada, estribo frontal e trava mecânica, a balestra mantém a corda armada sem cansar o atirador e dispara virotes de altíssimo impacto.",
      "A balestra já era utilizada na China Antiga há mais de 2.400 anos graças a gatilhos de bronze fundidos com precisão mecânica surpreendente."
    ],
    spectral_sword:[
      "Forjada com ectoplasma condensado sobre lâmina de ferro, a espada fantasmagórica atravessa a névoa etérea e consegue ferir criaturas na forma fantasma.",
      "No QuimiCraft, criaturas espectrais permanecem imunes ao aço comum, exigindo armas impregnadas de ectoplasma obtido em combates sobrenaturais."
    ],
    spectral_bow:[
      "O arco fantasmagórico reveste instantaneamente cada flecha disparada com uma película luminosa de ectoplasma capaz de atingir fantasmas à distância.",
      "Qualquer munição comum disparada por este arco adquire ressonância espectral durante o voo sem precisar criar flechas especiais separadas."
    ],
    spectral_staff:[
      "Encimado por cristal envolto em ectoplasma azulado, o cajado fantasmagórico conjura um orbe concentrado ou três orbes do véu contra aparições espectrais.",
      "Seu núcleo luminoso oscila na mesma frequência etérea dos Vultos do Brejo e dos Espectros da Salmoura, rompendo sua intangibilidade."
    ],
    gauntlets_fire:[
      "Forradas de couro reforçado e impregnadas de enxofre inflamável, as Luvas de Fogo transformam socos rápidos em golpes que incendeiam o alvo com brasas.",
      "O atrito súbito com compostos de enxofre reduz a energia de ativação necessária para produzir faíscas incandescentes no impacto."
    ],
    gauntlets_magma:[
      "Revestidas por rocha magmática sobre placas de bronze, as Luvas de Magma são mais pesadas que as de fogo, espalhando respingos ardentes de longa duração.",
      "O revestimento interno espesso de couro isola o calor da pedra vulcânica para que o lutador não queime as próprias mãos durante o combate."
    ],
    gauntlets_stone:[
      "Construídas com blocos lapidados de pedra firme, as Luvas de Pedra entregam pancadas sísmicas que empurram e atordoam criaturas resistentes.",
      "Aumentar a massa na extremidade do punho eleva consideravelmente o momento linear transferido ao alvo a cada golpe."
    ],
    gauntlets_ice:[
      "Com placas de gelo seladas sobre bronze e couro, as Luvas de Gelo lançam estilhaços congelantes que desaceleram inimigos a cada sequência de golpes.",
      "O gelo sob pressão pontual derrete uma película microscópica e volta a congelar imediatamente (regelo), mantendo as arestas frias e cortantes."
    ],
    gauntlets_lightning:[
      "Alimentadas por células voltaicas compactas, as Luvas de Raio liberam faíscas elétricas no instante do impacto, paralisando brevemente o alvo.",
      "Descargas elétricas breves interferem nos impulsos nervosos musculares, explicando o breve atordoamento causado em combate."
    ],
    gauntlets_venom:[
      "Equipadas com microcanais carregados de toxina biológica, as Luvas de Veneno aplicam veneno por contato direto em socos velozes.",
      "Na natureza, animais como o sapo-flecha armazenam toxinas defensivas diretamente na pele para afastar predadores ao menor toque."
    ],
    spectral_gauntlets:[
      "Manoplas leves tecidas com prata e ectoplasma brilhante, criadas para combatentes corpo a corpo enfrentarem fantasmas e até lobisomens espectrais com socos.",
      "A combinação de prata estrutural e ectoplasma torna este par versátil contra ameaças sobrenaturais que ignoram armas comuns."
    ],
    bolt:[
      "Curto, pesado e estável no ar, o virote foi calibrado especialmente para suportar a enorme aceleração inicial da corda da balestra.",
      "Virotes são mais curtos e grossos que flechas de arco para não envergarem nem partirem sob a tensão brusca de uma balestra."
    ],
    venom_arrow:[
      "Seis flechas comuns banhadas em uma dose de veneno coletado de serpentes ou aracnídeos; arcos selecionam automaticamente esta munição primeiro.",
      "Pequenas ranhuras atrás da ponta de flechas envenenadas históricas ajudavam a reter a toxina durante o voo em alta velocidade."
    ],
    petrifying_vial:[
      "Frasco de laboratório preenchido com Lágrima de Medusa refinada: arremessado contra criaturas hostis, imobiliza o alvo em pedra por preciosos segundos.",
      "No laboratório de campo, a Lágrima de Medusa decompõe-se em óxido de magnésio e ácido fosfórico — os mesmos ingredientes do cimento de pega ultrarrápida."
    ],
    fracture_hammer:[
      "Ferramenta reutilizável de ferro pesado usada pelos caçadores de Mestre Gael para romper a crosta de carbonato da Sentinela de Travertino Fendido.",
      "Materiais rígidos e quebradiços como o carbonato de cálcio resistem bem à compressão lenta, mas fraturam de imediato sob impacto concentrado em uma fissura."
    ],
    osmotic_salt:[
      "Sachê de sal refinado pronto para desidratar o Limo de Maré quando enfraquecido, permitindo recolher seu muco rico em alginato com segurança.",
      "Aplicar sal concentrado cria um forte gradiente osmótico que extrai água de tecidos gelatinosos ricos em umidade."
    ],
    brine_cold_pack:[
      "Bolsa portátil de gelo misturado a sal que provoca resfriamento brusco na Salamandra de Brasa enfraquecida, solidificando suas escamas de cobre.",
      "A mistura de gelo com cloreto de sódio forma uma mistura eutética capaz de baixar a temperatura até cerca de −21 °C."
    ],
    copper_ampoule:[
      "Ampola de vidro contendo solução de sulfato de cobre usada para neutralizar o micélio do Fungo de Vidro e preservar seu tecido bioluminescente.",
      "Os íons Cu²⁺ em solução azulada bloqueiam enzimas vitais de fungos sem destruir as moléculas luminescentes usadas depois na luminária."
    ],
    echo_fork:[
      "Diapasão metálico de cobre e ferro reutilizável que emite a frequência exata capaz de estilhaçar a carapaça cristalina do Escavador de Geodo.",
      "Diapasões reais mantêm uma frequência sonora quase pura por causa da simetria de seus dois ramos vibrando em oposição de fase."
    ],
    sealing_cartridge:[
      "Cartucho de argila, óleo vegetal e madeira projetado para vedar os poros incandescentes das tecelãs de Fuligem e da Fornalha no desfecho da caçada.",
      "Vedar a entrada de oxigênio em poros de combustão sufoca a chama instantaneamente por abafamento — um dos métodos básicos de combate a incêndios."
    ],

    // === ESCUDOS E FOCOS ===
    shield_oval:[
      "Leve e fácil de manobrar na mão secundária, o escudo oval de madeira e bronze oferece alta chance de aparar ataques sem atrasar a caminhada.",
      "O formato oval elimina cantos pesados desnecessários e ajuda a desviar golpes inclinados para longe do centro do corpo."
    ],
    shield_tower:[
      "Grande placa retangular reforçada com barras de ferro, pensada para resistir a investidas pesadas em corredores estreitos e encontros com golens.",
      "O 'scutum' romano seguia princípio semelhante: uma parede portátil capaz de absorver impactos frontais de grande energia."
    ],
    shield_dragon:[
      "Forjado com placas de obsidiana, aço e bronze, o Escudo Antidragão foi criado para suportar o calor e a força das baforadas e rajadas elementais dos dragões.",
      "É o único escudo capaz de bloquear a rajada contínua de um dragão enquanto conservar durabilidade, dissipando o impacto sobre sua face vulcânica."
    ],
    shield_mirror:[
      "Montado com vidro claro polido sobre lâmina de prata, o Escudo de Espelho ergue-se automaticamente diante do olhar petrificante das medusas e o devolve à origem.",
      "Espelhos reais funcionam porque uma camada finíssima de prata ou alumínio atrás do vidro reflete mais de 95% da luz incidente de forma especular."
    ],
    grimoire:[
      "Encadernado em couro com fechos de bronze e anotações de laboratório, o Grimório dos Selos conjura um círculo arcano que empurra e desacelera inimigos ao redor.",
      "Na mão secundária, livros e focos ampliam o repertório tático de magos sem precisar guardar a arma principal."
    ],
    resonant_orb:[
      "Esfera de cristal e cobre animada por essência eólica que gira suavemente na mão secundária e dispara pulsos concentrados de energia à distância.",
      "Sua rotação contínua mantém a carga eólica equilibrada, permitindo disparos rápidos entre golpes de cajado ou espada."
    ],

    // === EQUIPAMENTOS E ARMADURAS ===
    hunt_badge:[
      "Concedida por Mestre Gael aos caçadores dedicados da Vila dos Elementos, esta insígnia reconhece quem domina as técnicas científicas de extermínio.",
      "Carregar a Insígnia do Batedor no inventário melhora a coleta do material principal ao finalizar criaturas de contrato."
    ],
    quartz_whetstone:[
      "Consolidada no Refinador com grãos de quartzo extraídos do Escavador de Geodo, esta pedra recupera até 25% da durabilidade da picareta mais gasta em campo.",
      "O quartzo (dureza 7 na escala de Mohs) é mais duro que o ferro e o aço comum, conseguindo remover rebarbas e realinhar o gume da ferramenta."
    ],
    soot_filter:[
      "Cartucho portátil preenchido com carbono poroso da Tecelã de Fuligem, ideal para renovar o filtro da máscara respiratória no meio de uma expedição.",
      "O processo de adsorção prende moléculas de gases nocivos na superfície microscópica dos poros de carbono sem precisar de energia elétrica."
    ],
    vein_probe:[
      "Instrumento reutilizável construído com quartzo piezoelétrico do Escavador Ressonante que envia pulsos pelas rochas e revela as coordenadas do veio mais próximo em 12 m.",
      "Na geofísica real, sondas sísmicas e piezoelétricas medem o eco de vibrações subterrâneas para mapear camadas de rocha e depósitos minerais."
    ],
    refractory_boots:[
      "Botas de ferro revestidas com cerâmica aluminosa sinterizada a partir da Tecelã da Fornalha, protegendo os pés contra brasas, lava e calor extremo.",
      "Materiais refratários têm baixíssima condutividade térmica e altíssimo ponto de fusão, impedindo que o calor do solo chegue ao interior da bota."
    ],
    mage_circlet:[
      "Aro delicado de bronze e cristais prismáticos usado por conjuradores para alinhar o foco mental e intensificar o poder de cada feitiço.",
      "Por não bloquear a visão periférica nem pesar sobre a cabeça, o diadema é preferido por magos que precisam manter agilidade em campo."
    ],
    mage_hat:[
      "Clássico chapéu de feltro de aba larga com detalhe de cristal que protege da chuva e do sol enquanto amplia o dano mágico e economiza mana.",
      "O feltro é um dos tecidos mais antigos do mundo: em vez de fiado e tecido, é produzido entrelaçando fibras de lã com calor, umidade e pressão."
    ],
    mage_vestment:[
      "Túnica longa bordada com fios cristalinos que reduz consideravelmente o gasto de mana e ajuda a dissipar descargas elétricas de espectros.",
      "A lã tratada com minerais isolantes cria uma camada protetora leve que não restringe os gestos das mãos ao conjurar."
    ],
    mage_mantle:[
      "Manto leve tecido com lã e essência eólica que acompanha a brisa nas costas do conjurador e acelera a regeneração natural de mana.",
      "Capas amplas criam uma camada de ar aprisionado sob o tecido, ajudando o viajante a conservar calor em serras ventosas."
    ],
    mage_trousers:[
      "Calças flexíveis de lã reforçada com microcristais discretos nas costuras, reduzindo o consumo de mana durante combates prolongados.",
      "Combinar peças da mesma especialidade de classe soma seus bônus, formando conjuntos altamente eficientes para cada estilo de exploração."
    ],
    mage_boots:[
      "Botas macias de couro e lã alinhadas com essência eólica que suavizam a passada em trilhas longas e aceleram a recuperação de mana.",
      "Solas flexíveis de couro reduzem ruído ao caminhar por florestas, ajudando a não espantar animais ariscos."
    ],
    archer_hood:[
      "Capuz verde-musgo forrado de couro que disfarça a silhueta entre as árvores e agiliza a cadência de arcos e balestras.",
      "Tons verde-oliva e terrosos misturam-se naturalmente à folhagem sob luz filtrada da mata — princípio básico da camuflagem natural."
    ],
    archer_jerkin:[
      "Gibão ajustado de couro curtido com reforços de bronze no ombro que dá firmeza ao puxar a corda e aumenta o dano de flechas e virotes.",
      "Arqueiros históricos usavam protetores de couro no peito e no antebraço para evitar que o retorno rápido da corda machucasse o braço."
    ],
    archer_quiver:[
      "Aljava rígida de couro e madeira estruturada nas costas que mantém flechas e virotes alinhados e permite disparos 20% mais velozes.",
      "Manter as penas estabilizadoras (empenagem) secas e retas dentro da aljava é crucial para a flecha girar de forma estável no voo."
    ],
    archer_trousers:[
      "Calças resistentes de couro e lã projetadas para caminhar por matas espinhosas mantendo postura firme ao mirar disparos rápidos.",
      "Costuras duplas nos joelhos prolongam muito a vida útil de roupas usadas em terreno acidentado e escaladas."
    ],
    archer_boots:[
      "Botas leves de cano médio com solado aderente que equilibram velocidade na trilha e rapidez ao recarregar arcos e balestras.",
      "Um bom apoio no tornozelo estabiliza a base corporal do arqueiro mesmo em encostas inclinadas ou terreno irregular."
    ],
    melee_helm:[
      "Elmo fechado de aço e bronze forjado para a linha de frente, capaz de desviar golpes pesados de golens e criaturas subterrâneas.",
      "A forma abobadada de um elmo faz impactos diretos escorregarem para os lados em vez de transferir toda a força para o crânio."
    ],
    melee_plate:[
      "Couraça articulada de aço temperado da vanguarda: oferece altíssima defesa física e amplia a força dos golpes com espadas e maças.",
      "Armaduras de placas bem articuladas distribuíam o peso por todo o corpo, permitindo até correr e subir escadas com surpreendente mobilidade."
    ],
    melee_mantle:[
      "Manto vermelho-vinho de lã grossa preso por fivela de bronze que marca os combatentes da vanguarda e fortalece ataques corpo a corpo.",
      "Mantos pesados usados sobre placas metálicas ajudavam historicamente a proteger o aço da chuva, do barro e do calor direto do sol."
    ],
    melee_trousers:[
      "Perneiras articuladas de aço sobre forro de couro que protegem coxas e joelhos em confrontos diretos sem travar a passada.",
      "Rótulas metálicas convexas (poleyns) protegiam a articulação vulnerável do joelho enquanto deslizavam sobre o couro ao dobrar a perna."
    ],
    melee_boots:[
      "Botas blindadas de aço e bronze com amortecimento reforçado no calcanhar, reduzindo em 22% o dano de quedas em encostas e cavernas.",
      "Sabatões articulados sobrepunham lâminas metálicas como escamas para proteger o pé sem impedir o movimento natural dos dedos."
    ],
    spectral_hood:[
      "Elmo etéreo tecido com ectoplasma condensado que amortece golpes de criaturas fantasma na cabeça do explorador.",
      "Somente equipamentos fantasmagóricos oferecem redução efetiva contra ataques vindos do plano espectral."
    ],
    spectral_coat:[
      "Peitoral luminoso de ectoplasma que cria um escudo translúcido ao redor do tronco, reduzindo em 34% o dano de aparições fantasmagóricas.",
      "Usar o conjunto espectral completo soma a proteção de todas as peças, tornando caçadas contra espectros muito mais seguras."
    ],
    spectral_leggings:[
      "Perneiras fantasmagóricas leves cujo brilho ciano oscila quando uma criatura espectral se aproxima no escuro.",
      "Diferente das perneiras de aço, o ectoplasma entrelaçado na lã quase não adiciona peso à caminhada."
    ],
    spectral_boots:[
      "Botas etéreas silenciosas que completam o conjunto espectral e protegem os passos contra ataques de fantasmas e vultos.",
      "Sua aura azulada suave facilita acompanhar os passos do explorador em cavernas profundas e brejos noturnos."
    ],
    buffer_armor:[
      "Criada no laboratório para enfrentar Slimes Ácidos e Geleias de Turfa, esta armadura carrega reservatórios de solução tampão que reduzem em 75% o dano corrosivo.",
      "Uma solução tampão real contém um ácido fraco e sua base conjugada, resistindo a mudanças bruscas de pH mesmo quando recebe ácidos ou bases fortes."
    ],
    ear_protectors:[
      "Abafadores acolchoados com lã densa, couro e arco de ferro desenvolvidos pelos hortelãos para bloquear 86% do dano sonoro do grito dos Gritadores.",
      "Materiais porosos como lã absorvem ondas sonoras convertendo a vibração do ar em quantidades minúsculas de calor por atrito entre as fibras."
    ],
    travel_tunic:[
      "Túnica prática de lã e couro preferida por exploradores que cruzam climas variados, oferecendo leve proteção e bom isolamento térmico contra o frio.",
      "A lã continua isolando o calor corporal mesmo quando levemente úmida porque suas fibras onduladas retêm bolsões microscópicos de ar."
    ],
    archmage_robe:[
      "Veste cerimonial bordada com fios prismáticos e essência eólica, destinada a mestres da magia que buscam máximo poder arcano com economia de mana.",
      "Unir cristais ressonantes e essência eólica na trama da veste amplifica feitiços em 20% enquanto reduz em 14% o gasto de energia."
    ],
    dragonhide_coat:[
      "Costurado com escamas recuperadas de dragões, este casaco protege contra chamas e temperaturas extremas — do calor de caldeiras ao vento glacial.",
      "Escamas queratinizadas sobrepostas formam uma barreira flexível que desvia calor radiante e respingos incandescentes."
    ],
    dragonhide_trousers:[
      "Calças maleáveis reforçadas com escamas dracônicas sobre as coxas, ideais para caminhar perto de fluxos de lava sem perder mobilidade.",
      "A disposição em camadas das escamas permite dobrar os joelhos livremente sem abrir brechas na proteção térmica."
    ],
    dragonhide_boots:[
      "Botas forradas de couro dracônico que isolam os pés tanto da neve profunda das tundras quanto do chão quente das regiões vulcânicas.",
      "O isolamento bidirecional funciona igual nos dois extremos: reduz a transferência de calor, seja para fora no frio ou para dentro no calor."
    ],
    copper_cuirass:[
      "Primeira armadura metálica fundida nas oficinas da vila, o peitoral de cobre rebitado sobre couro oferece defesa confiável nas expedições iniciais.",
      "Rebites metálicos unem placas de metal permanentemente sem precisar de solda moderna, técnica usada desde armaduras antigas até pontes de aço."
    ],
    copper_leggings:[
      "Perneiras de cobre moldadas sobre forro de couro macio para proteger as pernas contra mordidas e golpes durante a mineração inicial.",
      "Por ser bastante maleável, o cobre pode ser conformado a martelo em chapas curvas mesmo em forjas simples."
    ],
    copper_boots:[
      "Botas reforçadas com biqueiras e caneleiras de cobre, resistentes à umidade das cavernas e fáceis de reparar na oficina.",
      "Com o uso em ambientes úmidos, chapas de cobre ganham naturalmente tons esverdeados que selam o metal contra corrosão profunda."
    ],
    bronze_cuirass:[
      "Peitoral fundido em liga de cobre e estanho que supera largamente o cobre puro em dureza e durabilidade durante combates longos.",
      "A passagem do cobre para o bronze permitiu fabricar armaduras mais finas e resistentes, marcando toda uma era da história humana."
    ],
    bronze_leggings:[
      "Perneiras de bronze polido presas com correias de couro, equilibrando proteção sólida e boa resistência ao desgaste em viagens longas.",
      "O bronze sofre muito menos corrosão em ambientes costeiros e salinos do que o ferro comum."
    ],
    bronze_boots:[
      "Botas com placas de bronze bem ajustadas para marchas longas por serras, cânions e ruínas antigas.",
      "As ligas de bronze possuem baixo atrito entre peças móveis, evitando desgaste rápido nas juntas articuladas da bota."
    ],
    steel_cuirass:[
      "Obra-prima da forja de ligas, o peitoral de aço temperado oferece proteção metálica de elite contra os maiores perigos do continente.",
      "Na têmpera do aço, aquecer a peça ao rubro e resfriá-la rapidamente rearranja os cristais de ferro e carbono, multiplicando sua dureza."
    ],
    steel_leggings:[
      "Perneiras de aço rebitadas sobre couro grosso que absorvem impactos pesados em covis profundos e caçadas de alto risco.",
      "Aço de boa qualidade combina dureza para resistir a perfurações com tenacidade suficiente para não quebrar como vidro ao sofrer impacto."
    ],
    steel_boots:[
      "Botas pesadas de aço forjado feitas para durar por expedições inteiras sobre terreno pedregoso, cavernas e ruínas.",
      "Distribuir a rigidez em placas articuladas protege o peito do pé sem impedir a flexão natural do passo."
    ],

    // === MATERIAIS DE EXTERMÍNIO E QUÍMICA DE CAMPO ===
    sentinel_crust:[
      "Fragmento arrancado da Sentinela de Travertino Fendido após a finalização com o Martelo de Fratura; segue para o Extrator Químico para purificação.",
      "Sua composição é essencialmente carbonato de cálcio mineralizado em camadas compactas pelo gotejamento das águas termais."
    ],
    tide_mucus:[
      "Gel esverdeado recolhido do Limo de Maré desidratado pelo Sachê Osmótico, servindo de matéria-prima biológica para a produção de alginato.",
      "Na natureza, algas pardas como as laminárias produzem alginatos na parede celular para se manterem flexíveis diante do impacto das ondas."
    ],
    ember_scale:[
      "Escama metálica esverdeada obtida ao resfriar a Salamandra de Brasa com a Bolsa de Gelo Salino; no forno de laboratório rende óxido de cobre.",
      "A calcinação do carbonato básico de cobre (como a malaquita) decompõe o mineral em óxido de cobre negro (CuO), CO₂ e vapor d'água."
    ],
    shell_carbonate:[
      "Carbonato de cálcio purificado no Extrator Químico a partir das placas da sentinela, pronto para gerar cloreto de cálcio ao reagir com HCl.",
      "O CaCO₃ é um dos compostos mais versáteis da Terra: forma cascas de ovos, conchas, corais, giz, calcário e mármore."
    ],
    sodium_alginate:[
      "Polímero natural extraído do muco do Limo de Maré, solúvel em água e capaz de formar esferas gelatinosas instantâneas ao encontrar íons de cálcio.",
      "Na gastronomia molecular, o alginato de sódio e o cloreto de cálcio são usados na técnica de esferificação para criar pequenas esferas com centro líquido."
    ],
    alginate_beads:[
      "Grânulos firmes de alginato de cálcio sintetizados no Refinador; combinados com carvão ativado, filtram partículas em suspensão de água contaminada.",
      "Os íons Ca²⁺ possuem carga +2 e atuam como pontes ligando duas cadeias de alginato ao mesmo tempo — estrutura conhecida como 'caixa de ovos'."
    ],
    glass_myc_field_sample:[
      "Amostra translúcida coletada do Fungo de Vidro após a neutralização com Ampola Cúprica, misturando sílica fina e compostos bioluminescentes.",
      "Separar a fase líquida da sílica sólida no Extrator aproveita a diferença de solubilidade entre os pigmentos orgânicos e o mineral."
    ],
    fungal_lumen:[
      "Extrato líquido verde-esmeralda isolado do tecido vítreo do fungo, usado para encapsular a luz fria da Luminária de Micélio.",
      "A bioluminescência fúngica real ocorre quando a enzima luciferase oxida uma molécula chamada luciferina (derivada do ácido cafeico), emitindo luz verde."
    ],
    geode_carapace:[
      "Casca cristalina recuperada do Escavador de Geodo depois de fraturada pelo Diapasão de Ruptura, rica em quartzo e ametista.",
      "O quartzo é o segundo mineral mais abundante da crosta terrestre e possui excelente estabilidade química e mecânica."
    ],
    quartz_abrasive:[
      "Grãos finos e angulosos de dióxido de silício (SiO₂) separados da carapaça do geodo e prontos para fabricar a Pedra de Afiar de Quartzo.",
      "Lixas comuns e pedras de amolar usam grãos minerais duros presos a uma matriz para desgastar microcamadas de metal e restaurar o fio."
    ],
    soot_silk:[
      "Seda resistente impregnada de fuligem recolhida da Tecelã após o uso do Cartucho de Vedação, ponto de partida para filtros respiratórios.",
      "Fibras proteicas naturais podem suportar grande tração e reter nanopartículas de carbono entre seus filamentos."
    ],
    soot_adsorbent:[
      "Fração de carbono altamente poroso separada da seda de fuligem no Extrator, capaz de prender gases tóxicos em sua superfície interna.",
      "Diferente da absorção (como uma esponja), na adsorção as moléculas ficam retidas na superfície externa e interna dos microporos do carbono."
    ],
    resonance_nodule:[
      "Nódulo raro obtido do Escavador de Geodo Ressonante nos contratos avançados de Mestre Gael, unindo quartzo piezoelétrico e granada.",
      "Isolar seus componentes no Extrator rende tanto o cristal piezoelétrico da Sonda de Veios quanto minério de granada."
    ],
    resonant_quartz:[
      "Cristal de quartzo piezoelétrico purificado que converte vibrações mecânicas em sinais elétricos precisos no interior da Sonda de Veios.",
      "Praticamente todos os relógios de pulso e computadores modernos usam um minúsculo cristal de quartzo vibrando 32.768 vezes por segundo para marcar o tempo."
    ],
    furnace_carapace:[
      "Fragmento aluminoso retirado da temida Tecelã da Fornalha, pronto para ser sinterizado a 1.250 °C no forno de laboratório.",
      "A sinterização aquece pós cerâmicos abaixo do ponto de fusão total até os grãos se soldarem por difusão atômica em uma placa densa e duríssima."
    ],
    refractory_plate:[
      "Placa cerâmica refratária produzida em alta temperatura que mantém a forma intacta sob calor intenso e reveste as Botas Refratárias.",
      "Placas cerâmicas refratárias protegem até o ventre de espaçonaves durante a reentrada atmosférica a milhares de graus Celsius."
    ],

    // === VEÍCULOS ===
    cart:[
      "O Carrinho de Engenhocas nasceu nas oficinas do laboratório para levar exploradores e amostras rapidamente por estradas, planícies e trilhas longas.",
      "Com suspensão ágil, salto curto e impulso de nitro, é o veículo terrestre mais veloz para cruzar grandes distâncias entre vilas e biomas."
    ],
    drill:[
      "Montada sobre esteiras firmes com uma broca helicoidal na dianteira, a Escavadeira de Broca abre túneis inteiros de três blocos de altura pelas montanhas.",
      "Esteiras contínuas distribuem o peso de máquinas pesadas sobre uma área muito maior que pneus comuns, garantindo tração em rocha solta e lama."
    ],
    bucket:[
      "Irmã da broca de túnel, a Escavadeira de Caçamba cava trincheiras amplas para baixo e recolhe rapidamente terra, areia e cascalho em grandes obras.",
      "Braços articulados de escavadeiras reais aplicam o princípio de Pascal em cilindros hidráulicos, multiplicando força com óleo pressurizado."
    ],
    glider:[
      "Homenagem direta ao pioneiro da aviação Alberto Santos-Dumont, o 14-bis de Campo decola de rampas e pistas abertas para planar sobre cordilheiras inteiras.",
      "O verdadeiro 14-bis realizou em Paris, em 23 de outubro de 1906, o primeiro voo homologado de um aparelho mais pesado que o ar decolando por meios próprios."
    ],
    glider_motor:[
      "Equipada com o módulo de pedal, correia e hélice, esta versão do 14-bis ganha empuxo próprio para ganhar altitude mesmo quando o vento falha.",
      "As pás de uma hélice funcionam como pequenas asas giratórias que empurram o ar para trás, gerando força de tração para frente pela 3ª Lei de Newton."
    ],
    dinghy:[
      "Leve, compacto e de calado raso, o Bote com vela latina ocre atravessa rios estreitos, manguezais e lagoas onde barcos maiores encalhariam.",
      "A vela triangular latina, muito usada no Mediterrâneo e no Oceano Índico há mais de mil anos, permite navegar bem mais próximo contra o vento do que velas quadradas."
    ],
    boat:[
      "Com espaço edificável no convés, baú de bordo e vela de gafo verde, o Barco médio equilibra boa capacidade de carga com manobrabilidade costeira.",
      "Um barco flutua pelo Princípio de Arquimedes: mesmo pesado, seu casco oco desloca um volume de água cujo peso iguala ou supera o da embarcação."
    ],
    ship:[
      "Majestoso e estável em bacias profundas, o Barco grande ergue uma imponente vela quadrada azul e oferece amplo convés para construir um laboratório flutuante.",
      "Navios de vela quadrada aproveitavam os ventos alísios constantes dos oceanos para cruzar milhares de quilômetros carregando grandes volumes de carga."
    ],
    speedboat:[
      "De casco esguio e vela de asa rubra impulsionada por células voltaicas, a Lancha corta bacias extensas em alta velocidade acompanhada por golfinhos curiosos.",
      "Cascos planadores erguem a proa acima da água em alta velocidade para diminuir a área de contato e reduzir drasticamente o arrasto hidrodinâmico."
    ],
    dinghy_tractor:[
      "O Bote adaptado com grandes rodas de trator dispensa o cais: sai da água sozinho e sobe margens e desníveis de até três blocos levando sua carga.",
      "Veículos anfíbios combinam flutuabilidade de casco estanque com tração de rodas largas de baixa pressão para vencer areia fofa e barrancos."
    ],
    boat_tractor:[
      "Versão anfíbia do Barco médio com quatro rodas robustas de ferro e couro, permitindo cruzar lagos e continuar a viagem diretamente pelas estradas da planície.",
      "O formato de garras profundas nos pneus agrícolas empurra tanto a terra solta quanto a água rasa durante a transição entre margem e lago."
    ],
    ship_tractor:[
      "O gigantesco Barco grande sobre rodas de trator transforma um verdadeiro navio-oficina em fortaleza móvel capaz de vencer terrenos irregulares entre duas bacias.",
      "Apesar de mais lento em terra firme por causa da enorme massa, seu convés inteiro com baú e bancadas acompanha a expedição sem precisar desmontar nada."
    ],
    speedboat_tractor:[
      "A Lancha equipada com rodas de trator une a velocidade náutica no mar aberto à liberdade de atravessar ilhas e línguas de terra sem abandonar o leme.",
      "A folga elevada sob o casco protege o leme e os pedais de rochas baixas durante travessias terrestres curtas."
    ]
  });

  // === CULTIVOS: 14 culturas × (alimento, semente/muda, silvestre, broto, crescimento, maduro) ===
  const cropDetails={
    strawberry:{
      food:[
        "O morango amadurece junto ao chão sob folhas recortadas, recompensando os hortelãos das planícies floridas e bosques de cerejeiras com seu aroma doce.",
        "Botanicamente, o morango não é uma fruta verdadeira, mas um pseudofruto: os verdadeiros frutos são aqueles pontinhos amarelos (aquênios) na casca — cerca de 200 por morango!"
      ],
      seed:[
        "A muda de morangueiro nasce de estolões rasteiros que se enraízam sozinhos ao tocar terra fofa, multiplicando o canteiro estação após estação.",
        "Propagar morangos por estolões produz clones geneticamente idênticos à planta-mãe, preservando o sabor e o tamanho dos frutos."
      ],
      wild:[
        "O morangueiro silvestre espalha-se por clareiras ensolaradas de prados alpinos e planícies floridas, anunciando solo fértil e úmido.",
        "Morangos silvestres (Fragaria vesca) são menores que os cultivados modernos, mas concentram compostos aromáticos muito mais intensos."
      ],
      sprout:[
        "Recém-plantada com a coroa acima da terra arada, a muda de morangueiro estende raízes finas antes de lançar suas primeiras folhas trifoliadas.",
        "Se a coroa central do morangueiro ficar enterrada fundo demais, a muda pode apodrecer — manter essa parte rente à superfície é segredo clássico de cultivo."
      ],
      growing:[
        "Na floração, o morangueiro abre pequenas flores brancas de miolo amarelo que atraem abelhas para garantir frutos grandes e bem formados.",
        "Cada flor de morango possui dezenas de pistilos; quanto mais completa a polinização por insetos, mais simétrico cresce o morango."
      ],
      ripe:[
        "Carregado de morangos vermelho-rubi junto às folhas baixas, o canteiro maduro perfuma toda a horta e já está pronto para a colheita.",
        "Morangos não continuam amadurecendo depois de colhidos (são frutos não climatéricos), por isso o sabor máximo só aparece quando colhidos bem vermelhos."
      ]
    },
    dragon_fruit:{
      food:[
        "A pitaya destaca-se pela casca magenta escamosa e polpa refrescante salpicada de sementinhas crocantes, muito apreciada por viajantes das savanas e chapadas.",
        "A pitaya é o fruto de cactos trepadores nativos das Américas (gênero Selenicereus) e é rica em antioxidantes chamados betalaínas."
      ],
      seed:[
        "Em vez de esperar anos por sementes minúsculas, os cultivadores plantam uma estaca de cladódio da pitaieira encostada a um tutor firme.",
        "Estacas de cactos cicatrizam o corte formando um calo protetor em poucos dias e enraízam rapidamente ao tocar solo levemente úmido."
      ],
      wild:[
        "Nas savanas e chapadas ocres, a pitaieira silvestre apoia seus caules triangulares verdes em rochas quentes e troncos de acácia.",
        "Por ser um cacto hemiepífito, a pitaieira desenvolve raízes aéreas ao longo do caule para se agarrar a suportes e captar umidade do orvalho."
      ],
      sprout:[
        "Fixada ao lado do suporte no canteiro, a muda de pitaieira emite brotos triangulares vigorosos que começam a subir buscando sol pleno.",
        "Como outros cactos, a pitaieira realiza fotossíntese diretamente nos ramos verdes suculentos (cladódios) para economizar água."
      ],
      growing:[
        "Ao cair da noite, a pitaieira em floração abre enormes flores brancas perfumadas conhecidas como 'dama-da-noite', que se fecham ao amanhecer.",
        "Cada flor de pitaya abre por apenas uma única noite na vida, dependendo de morcegos e mariposas noturnas para ser polinizada."
      ],
      ripe:[
        "Com frutos rosados pesados pendendo das pontas dos ramos, a pitaieira madura transforma qualquer canteiro árido em reserva de alimento e hidratação.",
        "Um único pé adulto de pitaieira pode produzir frutos por mais de 20 anos quando bem apoiado e ensolarado."
      ]
    },
    blackberry:{
      food:[
        "A amora madura tinge de roxo-escuro as mãos de quem colhe nos bosques lilases e florestas de sequoias, oferecendo energia rápida em viagens.",
        "A amora-preta é uma fruta agregada: cada bolinha brilhante (drupéola) resulta de um ovário separado dentro da mesma flor."
      ],
      seed:[
        "A muda enraizada de amoreira-preta adapta-se rápido a solos florestais, lançando ramos arqueados que logo formam uma cerca viva produtiva.",
        "Na natureza, quando a ponta de um ramo comprido de amoreira-preta encosta no chão úmido, ela cria raízes novas e origina outra planta."
      ],
      wild:[
        "A amoreira-preta silvestre coloniza bordas de trilhas e clareiras ensolaradas nas florestas, oferecendo alimento vital para pássaros, ursos e raposas.",
        "Os pigmentos roxos intensos da amora são antocianinas — as mesmas substâncias usadas no laboratório como indicadores naturais de pH!"
      ],
      sprout:[
        "Ainda jovem na terra arada, a muda de amoreira-preta desenvolve folhas serrilhadas e espinhos macios enquanto firma suas raízes.",
        "As folhas da amoreira-preta acumulam taninos que afastam muitos insetos mastigadores enquanto a planta estabelece seus ramos."
      ],
      growing:[
        "Coberta por cachos de flores brancas e rosadas, a amoreira em floração atrai abelhas e outros insetos de toda a redondeza.",
        "Os frutos da amora mudam de cor em sequência curiosa antes de ficarem prontos: passam de verde a vermelho vivo e só no final escurecem para roxo-negro."
      ],
      ripe:[
        "Os ramos da amoreira-preta curvam-se sob o peso de cachos escuros e brilhantes, prontos para encher cestos ou alimentar animais da mata.",
        "Antigamente, o suco concentrado de amoras maduras era usado como tinta natural para tingir lãs e tecidos em tons de violeta e azul-marinho."
      ]
    },
    jabuticaba:{
      food:[
        "Redonda, brilhante e de polpa doce translúcida, a jabuticaba é um tesouro das florestas e selvas tropicais disputado por aves, saruês e viajantes.",
        "O nome jabuticaba vem do tupi 'îabutikaba' ('fruto em botão' ou 'fruto apreciado pelo jabuti'). A espécie é nativa da Mata Atlântica brasileira."
      ],
      seed:[
        "A muda de jabuticabeira exige paciência e solo úmido, mas compensa formando uma árvore duradoura capaz de frutificar várias vezes ao ano.",
        "Árvores jovens de jabuticabeira desenvolvem casca lisa que se descama em placas claras à medida que o tronco engrossa."
      ],
      wild:[
        "Nas selvas tropicais e matas úmidas, a jabuticabeira silvestre chama atenção mesmo de longe quando o tronco inteiro escurece coberto de frutos.",
        "A jabuticabeira pode florescer e frutificar até quatro ou cinco vezes por ano sempre que chuvas abundantes seguem períodos mais secos."
      ],
      sprout:[
        "Pequena e de folhas novas avermelhadas, a muda plantada de jabuticabeira firma um tronco esguio antes de abrir sua copa arredondada.",
        "Folhas jovens avermelhadas protegem a clorofila delicada contra excesso de radiação solar nas primeiras semanas de vida."
      ],
      growing:[
        "Na floração, milhares de pequenas flores brancas felpudas brotam diretamente da casca do tronco e dos galhos grossos, envolvendo a árvore num manto claro.",
        "Esse fenômeno curioso — flores e frutos nascendo direto no tronco — chama-se caulifloria e facilita o acesso de polinizadores e dispersores sob o dossel fechado."
      ],
      ripe:[
        "Do pé do tronco até os ramos principais, a jabuticabeira carregada exibe esferas roxo-escuras estalando de doces prontas para a colheita.",
        "A casca roxa da jabuticaba concentra antioxidantes poderosos e fermenta tão depressa após colhida que os frutos são melhores consumidos frescos no mesmo dia."
      ]
    },
    acerola:{
      food:[
        "Pequena, vermelha e levemente ácida, a acerola de três lobos refresca exploradores nas travessias quentes de savanas e selvas tropicais.",
        "A acerola (Malpighia emarginata) está entre as frutas mais ricas em vitamina C do planeta — pode conter de 20 a 30 vezes mais vitamina C que uma laranja!"
      ],
      seed:[
        "A muda de aceroleira enraíza com vigor em solos bem drenados e ensolarados, crescendo rápido até formar um arbusto copado.",
        "Como o sabor dos frutos varia muito de semente para semente, hortelãos costumam multiplicar aceroleiras produtivas por estaquia ou enxertia."
      ],
      wild:[
        "Encontrada em bordas quentes de selvas e savanas, a aceroleira silvestre suporta períodos secos curtos e volta a florir logo após as primeiras chuvas.",
        "Abelhas coletoras de óleo (família Centridini) são as polinizadoras especializadas das flores de acerola, recolhendo óleos florais em vez de néctar."
      ],
      sprout:[
        "Com folhinhas brilhantes verde-escuras, a muda de aceroleira aproveita o sol direto para engrossar rapidamente sua base lenhosa.",
        "A aceroleira desenvolve raízes ramificadas que exploram com eficiência a água das chuvas rápidas de climas tropicais."
      ],
      growing:[
        "Durante a floração, ramos inteiros da aceroleira enchem-se de delicadas flores rosadas com cinco pétalas franzidas.",
        "Do florescimento até o amadurecimento total da acerola passam-se apenas cerca de três semanas — um dos ciclos frutíferos mais rápidos entre árvores frutíferas."
      ],
      ripe:[
        "Salpicada de pontinhos vermelho-vivo sob o sol, a aceroleira carregada oferece frutos suculentos que matam tanto a fome quanto a sede.",
        "Apesar de ser chamada em inglês de 'Barbados cherry', a acerola não tem parentesco próximo com a cereja verdadeira — pertence à família Malpighiaceae."
      ]
    },
    lime:{
      food:[
        "Aromático e cítrico, o limão das encostas ensolaradas serve tanto na cozinha da vila quanto em experimentos simples de acidez no laboratório.",
        "O sabor azedo intenso do limão vem do ácido cítrico (pH em torno de 2 a 2,5), capaz de mudar instantaneamente a cor de indicadores de antocianina para rosa."
      ],
      seed:[
        "A muda de limoeiro — muitas vezes preparada por enxertia na mesa de cultivo — traz o aroma fresco das folhas cítricas antes mesmo da primeira flor.",
        "Na enxertia, une-se um galho de copa produtiva a uma raiz resistente a pragas, combinando as melhores qualidades de duas plantas."
      ],
      wild:[
        "Crescendo em clareiras quentes de planícies e bordas de selva, o limoeiro silvestre guarda espinhos finos nos ramos para afastar herbívoros.",
        "Os pontinhos translúcidos visíveis ao olhar uma folha de limão contra a luz são bolsas de óleos essenciais ricos em limoneno."
      ],
      sprout:[
        "A muda jovem de limoeiro prefere locais bem iluminados e solo fofo, erguendo hastes verdes perfumadas em direção ao sol.",
        "Folhas cítricas recém-brotadas exalam cheiro marcante ao serem esfregadas porque rompem glândulas microscópicas de óleo essencial."
      ],
      growing:[
        "O limoeiro em floração enche o pomar com flores brancas estreladas de perfume adocicado que atraem enxames inteiros de abelhas.",
        "O perfume da flor de limoeiro e laranjeira (neroli) é um dos ingredientes mais tradicionais da perfumaria clássica."
      ],
      ripe:[
        "Com limões verdes reluzindo entre as folhas lustrosas da copa, o limoeiro pronto para colher renova o estoque cítrico de qualquer expedição.",
        "No século XVIII, o médico escocês James Lind provou que frutas cítricas como limões e limas curavam o escorbuto dos marinheiros em longas viagens oceânicas."
      ]
    },
    pomegranate:{
      food:[
        "Sob a casca firme coroada pelo cálice da flor, a romã guarda centenas de sementes envolvidas em polpa rubra suculenta e nutritiva.",
        "Cada romã madura contém em média de 400 a 800 sementes (arilos) separadas por membranas brancas esponjosas ricas em taninos."
      ],
      seed:[
        "A muda de romãzeira resiste notavelmente bem ao calor seco das chapadas e savanas, enraizando fundo em busca de umidade.",
        "A romãzeira (Punica granatum) é cultivada há mais de 5 mil anos desde o Oriente Médio até o Mediterrâneo, onde simbolizava fertilidade e fartura."
      ],
      wild:[
        "Encontrada em encostas secas de savanas e chapadas ocres, a romãzeira silvestre sobrevive onde muitas outras frutíferas não resistiriam à estiagem.",
        "A casca seca da romã é tão rica em taninos que foi usada durante séculos para curtir couros finos e produzir tintas naturais douradas e pretas."
      ],
      sprout:[
        "Plantada sob sol pleno, a muda de romãzeira ergue ramos finos com folhas estreitas que brilham com reflexo avermelhado na ponta.",
        "Mesmo ainda pequena, a romãzeira tolera solos calcários e secos graças às folhas estreitas que reduzem a perda de água."
      ],
      growing:[
        "Na floração, a romãzeira acende o pomar com flores vermelho-alaranjadas em forma de sino que chamam atenção de aves e insetos.",
        "Diferente da maioria das flores, o cálice rígido da flor de romã não cai após a polinização: ele endurece e forma a famosa 'coroa' no topo do fruto."
      ],
      ripe:[
        "Carregada de frutos rubros pesados que começam a rachar quando muito maduros, a romãzeira oferece uma das colheitas mais nutritivas da horta.",
        "As granadas (gemas minerais vermelho-escuras) ganharam esse nome justamente por lembrar a cor e a forma dos grãos brilhantes da romã (em latim, 'granatum')."
      ]
    },
    grapes:{
      food:[
        "Colhidas em cachos pesados nos pomares de planícies floridas e bosques, as uvas combinam doçura rápida com boa hidratação para trilhas longas.",
        "A película esbranquiçada opaca que recobre uvas frescas chama-se pruína — uma cera natural protetora que abriga leveduras selvagens responsáveis pela fermentação."
      ],
      seed:[
        "A muda de videira cresce como trepadeira vigorosa e precisa de um tutor ou caramanchão para conduzir seus ramos ao sol.",
        "Gavinhas em espiral brotam dos ramos da videira e enrolam-se automaticamente em qualquer suporte que tocam (tigmotropismo)."
      ],
      wild:[
        "Nos bosques lilases e de cerejeiras, a videira silvestre sobe por troncos e cercas antigas até abrir seus cachos acima da sombra.",
        "Videiras são extremamente longevas: existem exemplares reais cultivados na Europa que ultrapassam 400 anos e ainda produzem uvas todos os anos."
      ],
      sprout:[
        "Logo após o plantio, a muda de videira lança brotos flexíveis com gavinhas em busca de apoio vertical para erguer a folhagem.",
        "Guiar a videira em suportes melhora a circulação de ar entre as folhas, evitando fungos e expondo os cachos ao sol por igual."
      ],
      growing:[
        "Durante a floração, cachos delicados de minúsculas flores esverdeadas exalam perfume suave antes de se transformarem em bagas jovens.",
        "A mudança de cor das uvas verdes para roxas chama-se 'véraison' e marca o instante em que os açúcares sobem rapidamente dentro do cacho."
      ],
      ripe:[
        "Os cachos maduros pendem pesados sob a sombra das folhas largas da videira, prontos para encher a mochila ou a mesa da vila.",
        "Uvas secas ao sol (passas) conservam-se por meses sem estragar porque a perda de água concentra tanto os açúcares que impede bactérias de crescer."
      ]
    },
    starfruit:{
      food:[
        "Amarela, crocante e refrescante, a carambola revela uma estrela perfeita de cinco pontas sempre que fatiada transversalmente.",
        "Nativa do Sudeste Asiático, a carambola (Averrhoa carambola) é rica em água e vitamina C, sendo muito cultivada em regiões tropicais do Brasil."
      ],
      seed:[
        "A muda de caramboleira aprecia climas amenos ou tropicais e solo fértil, formando uma árvore elegante de copa cheia.",
        "Os folíolos compostos da caramboleira são sensíveis ao toque e à luz: eles se dobram para baixo suavemente à noite para 'dormir' (nictinastia)."
      ],
      wild:[
        "Em clareiras úmidas de selvas tropicais e planícies, a caramboleira silvestre derruba frutos estrelados que atraem aves e pequenos mamíferos.",
        "Cada fruto tem geralmente cinco gomos longitudinais (às vezes quatro ou seis), o que explica seu apelido mundial de 'starfruit'."
      ],
      sprout:[
        "A muda plantada de caramboleira desenvolve folhas pinadas delicadas que balançam ao vento enquanto o tronco se fortalece.",
        "O sol suave da manhã estimula a abertura plena das folhas jovens da caramboleira, maximizando a captação de luz."
      ],
      growing:[
        "Na floração, pequenos cachos de flores lilases e rosadas surgem ao longo dos ramos e até em galhos mais grossos da caramboleira.",
        "As flores da caramboleira produzem néctar abundante e costumam florir em ondas sucessivas, permitindo ver flores e frutos na mesma árvore."
      ],
      ripe:[
        "Quando as bordas dos gomos ganham tom dourado-âmbar, a caramboleira madura está no ponto exato de doçura e suculência para a colheita.",
        "A casca fina e cerosa da carambola é inteiramente comestível, dispensando descascar durante as viagens."
      ]
    },
    wheat:{
      food:[
        "Base do pão assado na Vila dos Elementos e alimento favorito de vacas, ovelhas, bisões e cervos, o trigo acompanha a história de toda comunidade agrícola.",
        "O trigo foi uma das primeiras plantas domesticadas pela humanidade há cerca de 10 mil anos no Crescente Fértil, transformando grupos nômades em cidades."
      ],
      seed:[
        "Os pequenos grãos dourados de semente de trigo germinam depressa em terra arada e garantem tanto o próximo pão quanto a criação de rebanhos.",
        "Cada grão de trigo guarda endosperma rico em amido para nutrir o embrião nas primeiras semanas de vida."
      ],
      wild:[
        "O trigo silvestre balança em touceiras douradas nas planícies abertas, oferecendo as primeiras sementes para iniciar qualquer fazenda.",
        "Trigos selvagens soltam seus grãos facilmente ao vento para se espalhar; a domesticação selecionou espigas que permaneciam inteiras até a colheita."
      ],
      sprout:[
        "Poucos dias após semeado, o broto de trigo rompe o solo em lâminas verde-vivo finas e eretas que logo fecham todo o canteiro.",
        "O trigo pertence à família das gramíneas (Poaceae) e lança vários perfilhos laterais a partir de uma única semente."
      ],
      growing:[
        "Em pleno crescimento, os colmos do trigo alongam-se e formam espigas ainda verdes que se inclinam suavemente com a brisa do campo.",
        "As finas cerdas na ponta da espiga (aristas) ajudam na fotossíntese final dos grãos e dificultam o ataque de aves granívoras."
      ],
      ripe:[
        "Dourado sob o sol, o trigo maduro inclina as espigas cheias de grãos prontos para a foice, para o moinho e para o forno da padaria.",
        "A cor dourada aparece quando a planta seca naturalmente os tecidos e transfere quase todos os nutrientes das folhas para os grãos."
      ]
    },
    carrot:{
      food:[
        "Crocante, alaranjada e adorada por coelhos, capivaras e porcos, a cenoura cresce escondida sob o solo enquanto suas folhas rendilhadas balançam ao sol.",
        "A cor laranja vibrante da cenoura vem do betacaroteno, pigmento que o corpo humano converte em vitamina A — essencial para a visão noturna."
      ],
      seed:[
        "Minúsculas e aromáticas, as sementes de cenoura exigem terra bem arada e solta para que a raiz cresça reta e sem bifurcações.",
        "Um único grama contém cerca de 800 sementes de cenoura, que podem levar até duas semanas para brotar na agricultura real."
      ],
      wild:[
        "A cenoura silvestre exibe flores brancas em guarda-chuva nos campos abertos e guarda sob a terra raízes finas que revelam a origem da hortaliça.",
        "Até o século XVII, a maioria das cenouras cultivadas era roxa, amarela ou branca; agricultores holandeses ajudaram a popularizar a variedade laranja atual."
      ],
      sprout:[
        "O broto de cenoura emerge com duas folhinhas finas enquanto envia uma raiz principal reta para o fundo da terra arada.",
        "A raiz da cenoura é uma raiz pivotante tuberosa que funciona como despensa subterrânea de açúcares para a planta sobreviver ao inverno."
      ],
      growing:[
        "Com a folhagem rendilhada já exuberante, a cenoura em crescimento engrossa rapidamente abaixo do solo acumulando açúcares e carotenoides.",
        "Os solos pedregosos ou compactados fazem a raiz da cenoura se dividir em formatos tortos divertidos enquanto contorna obstáculos."
      ],
      ripe:[
        "Quando o topo alaranjado desponta discretamente rente à terra arada, a cenoura madura está pronta para ser arrancada inteira.",
        "As folhas verdes da cenoura também são comestíveis e ricas em clorofila, potássio e vitamina K."
      ]
    },
    beans:{
      food:[
        "Nutritivo e fácil de conservar seco na mochila, o feijão fornece energia duradoura em receitas de fogão e enriquece o solo da própria horta.",
        "Feijões são leguminosas riquíssimas em proteínas vegetais e ferro — combinados com cereais como arroz ou trigo, fornecem todos os aminoácidos essenciais."
      ],
      seed:[
        "A semente de feijão é famosa pela germinação rápida e vigorosa, servindo de modelo clássico até nas primeiras aulas de botânica.",
        "O pequeno 'olho' claro na lateral do grão de feijão chama-se hilo e marca o ponto onde a semente ficava presa dentro da vagem."
      ],
      wild:[
        "O feijão silvestre enrosca-se em arbustos e margens férteis, espalhando suas sementes quando as vagens secas se abrem num estalo.",
        "Vagens secas de leguminosas possuem camadas fibrosas com orientações opostas que se torcem ao secar e lançam as sementes para longe."
      ],
      sprout:[
        "Ao germinar, o broto de feijão ergue os dois cotilédones acima da terra antes de abrir as primeiras folhas verdadeiras em forma de coração.",
        "Bactérias do gênero Rhizobium associam-se às raízes do feijoeiro formando pequenos nódulos que capturam nitrogênio do ar e adubam o solo naturalmente."
      ],
      growing:[
        "O feijão em crescimento escala rapidamente ramos e cercas, abrindo pequenas flores delicadas que logo originam dezenas de vagens verdes.",
        "A rotação de culturas intercalando feijão e trigo devolve naturalmente ao solo o nitrogênio consumido pelos cereais."
      ],
      ripe:[
        "Com as vagens cheias e cor de palha balançando nos ramos, o feijão maduro garante uma colheita farta para a cozinha da vila.",
        "Existem milhares de variedades tradicionais de feijão no mundo — preto, carioca, branco, vermelho e roxo — todas originárias das Américas."
      ]
    },
    beet:{
      food:[
        "De polpa vermelho-púrpura intensa e sabor adocicado, a beterraba cresce sob o solo e serve tanto na culinária quanto como fonte de corante natural.",
        "O vermelho profundo da beterraba vem da betanina, pigmento tão concentrado que é usado comercialmente como corante alimentício natural (E162)."
      ],
      seed:[
        "A muda de beterraba desenvolve rapidamente folhas de talos avermelhados enquanto começa a formar seu bulbo subterrâneo.",
        "O que chamamos de 'semente' de beterraba na verdade é um glomérulo — um pequeno fruto seco contendo de 2 a 5 sementes juntas."
      ],
      wild:[
        "A beterraba silvestre descende de plantas costeiras tolerantes à brisa salgada, com folhas carnudas e raízes ricas em minerais.",
        "Todas as beterrabas cultivadas (de mesa, açucareira e até a acelga) descendem da mesma planta costeira selvagem: Beta vulgaris subsp. maritima."
      ],
      sprout:[
        "Ainda jovem na terra arada, a muda plantada de beterraba já revela os pecíolos avermelhados característicos que distinguem a espécie no canteiro.",
        "As folhas da beterraba acumulam nitratos naturais e cálcio, sendo altamente nutritivas mesmo antes de a raiz crescer."
      ],
      growing:[
        "Em crescimento, a beterraba amplia a coroa de folhas largas para captar luz e bombear sacarose diretamente para o órgão subterrâneo.",
        "Variedades específicas de beterraba-açucareira chegam a acumular quase 20% de seu peso em açúcar puro (sacarose)."
      ],
      ripe:[
        "Arredondada e pronta para colher logo sob a base das folhas rubras, a beterraba madura oferece alimento vigoroso e pigmento vivo.",
        "Diferente das antocianinas das amoras, as betalaínas da beterraba mantêm sua cor avermelhada estável em uma faixa muito mais ampla de pH."
      ]
    },
    potato:{
      food:[
        "Versátil e substanciosa, a batata colhida sob a terra alimenta expedições inteiras — especialmente quando assada no fogão de pedra.",
        "A batata não é uma raiz, mas um tubérculo — um caule subterrâneo espessado cheio de amido; seus 'olhos' são na verdade gemas de onde nascem novos brotos."
      ],
      seed:[
        "Em vez de sementes florais, os hortelãos plantam uma muda de batata brotada diretamente na terra arada para multiplicar rapidamente o canteiro.",
        "Domesticada há cerca de 8 mil anos nos Andes (Peru e Bolívia), a batata possui hoje mais de 4.000 variedades nativas de formatos e cores incríveis."
      ],
      wild:[
        "A batata silvestre cresce em campos frescos e encostas altas, escondendo tubérculos discretos sob a folhagem baixa.",
        "Batatas silvestres e partes verdes expostas ao sol produzem solanina — um alcaloide amargo de defesa contra insetos; por isso nunca se deve comer batatas esverdeadas."
      ],
      sprout:[
        "A muda plantada de batata rompe o solo com hastes vigorosas e folhas compostas enquanto começa a emitir estolões subterrâneos.",
        "Cobrir a base dos caules jovens com mais terra ('amontoa') protege os futuros tubérculos da luz solar e aumenta a produtividade."
      ],
      growing:[
        "Sob a folhagem verde cerrada, a batata em crescimento infla vários tubérculos ao mesmo tempo em bolsões abaixo da superfície.",
        "A batata pertence à família Solanaceae — mesma família do tomate, do pimentão e da berinjela — e foi a primeira planta cultivada com sucesso no espaço (em 1995)."
      ],
      ripe:[
        "Quando as folhas começam a amarelar nas pontas, a batata pronta para colher esconde um cacho generoso de tubérculos sob cada planta.",
        "Em 1995, a NASA e a Universidade de Wisconsin cultivaram as primeiras batatas no ônibus espacial Columbia como teste de alimentação espacial."
      ]
    }
  };

  // === NPCS PRINCIPAIS E DA VILA DOS ELEMENTOS (32) ===
  Object.assign(notes,{
    npc_carbon:[
      "Fundador do Laboratório Carbono, o Prof. Carbono coordena o Projeto da Tabela Periódica e orienta exploradores a transformar amostras de campo em descobertas científicas.",
      "O nome do laboratório homenageia o elemento carbono (C, nº 6), capaz de formar quatro ligações covalentes e estruturar milhões de moléculas orgânicas — base de toda a vida conhecida."
    ],
    npc_ranger:[
      "A Guardiã Íris patrulha os arredores da Vila dos Elementos com arco em punho, protegendo moradores de criaturas hostis e mapeando trilhas por biomas distantes.",
      "Íris tem excelente pontaria à distância e costuma deixar suprimentos de agradecimento quando um explorador ajuda a repelir ameaças perto da vila."
    ],
    npc_extermination_master:[
      "Mestre Gael mantém o mural de contratos de extermínio na praça central, premiando caçadores que usam química aplicada e ferramentas específicas para finalizar criaturas anômalas.",
      "Gael defende que força bruta sozinha não resolve monstros químicos: cada contrato exige compreender a composição da criatura — de osmose a piezoelétricos."
    ],
    npc_villager:[
      "Os moradores da Vila dos Elementos constroem o ritmo cotidiano do povoado, cuidando das casas, trocando histórias na praça e formando novas famílias quando recebem pão.",
      "Comunidades estáveis prosperam graças à divisão de ofícios: enquanto uns cultivam e cozinham, outros forjam ligas, pesquisam minerais e mantêm as rotas seguras."
    ],
    npc_seed_curator:[
      "Responsável pela estufa comunitária, a Curadoria de Sementes seleciona variedades adaptadas a cada estação e ensina como conduzir mudas delicadas na mesa de cultivo.",
      "Bancos de sementes reais, como o de Svalbard no Ártico, preservam milhões de amostras de culturas agrícolas em câmaras frias para garantir a biodiversidade futura."
    ],
    npc_water_keeper:[
      "A Guarda das Águas monitora cisternas, cais e nascentes, comparando cor, salinidade e pH depois de cada chuva para garantir água segura à comunidade.",
      "Água cristalina nem sempre é potável e água escura de turfa nem sempre é tóxica — apenas testes físicos e químicos revelam o que está realmente dissolvido nela."
    ],
    npc_cartographer:[
      "Do alto dos mirantes meteorológicos, o Cartógrafo anota fronteiras entre biomas, mudanças no vento e novas rotas de exploração pelo continente.",
      "A cartografia moderna combina medições de altitude, orientação magnética e observação climática para prever frentes frias e tempestades."
    ],
    npc_metalsmith:[
      "No Pavilhão dos Metais, o Mestre das Ligas testa amostras antes da fundição, lembrando sempre aos aprendizes que dois minérios de cor parecida podem ter composições bem diferentes.",
      "Na metalurgia, pequenas variações na proporção de estanho, zinco ou carbono mudam radicalmente a dureza, o ponto de fusão e a resistência à corrosão de uma liga."
    ],
    npc_herbal_trader:[
      "O Mercador da Feira reúne frutas, raízes, especiarias e ingredientes de cultivo vindos de várias regiões, abastecendo tanto viajantes quanto a cozinha local.",
      "Feiras regionais historicamente funcionaram como centros de troca de sementes, permitindo que plantas de um bioma fossem testadas e aclimatadas em outros."
    ],
    npc_lab_hydrologist:[
      "Na ala azul do Laboratório Carbono, Iara Maré investiga como sais, sedimentos e taninos alteram o comportamento da água em rios, pântanos e oceanos.",
      "A hidrologia estuda o ciclo completo da água — evaporação, condensação, precipitação, infiltração e escoamento — que renova continuamente rios e aquíferos."
    ],
    npc_lab_mineralogist:[
      "Noemi Cristal cataloga rochas, gemas e minérios dos cinco sub-biomas especiais na ala dourada do laboratório, identificando cada amostra pela dureza e pelo traço.",
      "O teste do traço consiste em riscar um mineral em uma placa de porcelana não esmaltada: a cor do pó costuma ser muito mais confiável que a cor externa da pedra."
    ],
    npc_lab_ecologist:[
      "Maya Musgo coordena a ala verde de Ecologia, analisando fungos luminescentes, pigmentos vegetais e relações entre predadores e presas ao microscópio.",
      "Ecólogos acompanham redes tróficas inteiras porque alterar a população de um único predador ou presa pode gerar efeitos em cascata em todo o ecossistema."
    ],
    npc_alchemist:[
      "Os alquimistas itinerantes erguem oficinas especializadas longe da vila central para testar separações, indicadores de pH, pilhas galvânicas e calorimetria.",
      "Cada oficina alquímica adapta sua arquitetura aos materiais locais — do vidro âmbar das estufas de pigmentos à ardósia dos observatórios térmicos."
    ],
    npc_weaver:[
      "A Tecelã transforma lã de ovelhas e pigmentos naturais em toldos coloridos, roupas de viagem e mantos resistentes ao vento das estradas.",
      "Fibras naturais como lã e algodão exigem mordentes minerais (como alúmen) para que corantes vegetais se fixem firmemente sem desbotar na chuva."
    ],
    npc_cook:[
      "Junto ao fogão de pedra, a Cozinheira combina pescados, carnes, frutas e raízes para criar pratos que restauram fome e sede em longas jornadas.",
      "A cozinha é um verdadeiro laboratório químico cotidiano: emulsões, fermentações, caramelizações e cozimentos alteram proteínas e amidos pelo calor."
    ],
    npc_smith:[
      "Diante das brasas da forja, o Fundidor molda bronze, latão e aço, convertendo minérios brutos em lâminas, escudos e peças de veículos.",
      "A cor do metal aquecido indica sua temperatura aproximada — do vermelho-escuro (~600 °C) ao amarelo-brilhante (~1.100 °C) — técnica usada por ferreiros há séculos."
    ],
    npc_gardener:[
      "A Jardineira organiza os canteiros ornamentais e produtivos da vila ao longo dos caminhos irrigados, preservando flores raras mesmo em temporadas secas.",
      "Plantas companheiras cultivadas lado a lado — como ervas aromáticas junto a hortaliças — atraem polinizadores e ajudam a reduzir pragas naturalmente."
    ],
    npc_food:[
      "Dona Canela comanda a loja de alimentos da Vila dos Elementos, oferecendo mel, frutas da floresta, queijos e pães quentes para quem parte em expedição.",
      "Alimentos ricos em açúcares simples como mel e frutas oferecem energia rápida, enquanto grãos e proteínas liberam energia de forma gradual durante a caminhada."
    ],
    npc_armor:[
      "Ferreiro Cobalto administra a oficina de equipamentos metálicos e armaduras, calibrando cada placa rebitada na bigorna até encontrar o equilíbrio entre defesa e peso.",
      "O martelamento a frio ('encruamento') reorganiza defeitos microscópicos nos cristais do metal, deixando chapas de cobre e bronze sensivelmente mais duras."
    ],
    npc_solid:[
      "Dra. Sílica comanda a loja de sólidos e reagentes minerais, ajudando exploradores a comparar cristais, calcários, nitratos e silicatos pela estrutura.",
      "Mais de 90% da crosta terrestre é formada por minerais silicatos — compostos construídos a partir de tetraedros de silício e oxigênio (SiO₄)."
    ],
    npc_liquid:[
      "Mestre Solvente cuida da loja de líquidos, frascos e soluções aquosas, demonstrando como substâncias dissolvidas ganham liberdade para reagir em meio líquido.",
      "Em soluções aquosas, compostos iônicos se separam em íons livres (dissociação), permitindo que reações ocorram quase instantaneamente ao misturar dois frascos."
    ],
    npc_trinket:[
      "Luma Prismática reúne amuletos, gemas lapidadas e berloques especiais em sua loja, explicando como cada cristal interage com a luz e a energia arcana.",
      "O brilho intenso de pedras lapidadas resulta da reflexão interna total: os ângulos das facetas são calculados para devolver a luz que entra de volta aos olhos."
    ],
    npc_farmer:[
      "Ari do Campo conhece cada palmo das planícies floridas ao redor da vila, cuidando das safras de trigo, cenoura e feijão e lembrando sempre de replantar.",
      "Alternar plantios diferentes no mesmo canteiro evita o esgotamento de nutrientes específicos e mantém a fertilidade da terra por gerações."
    ],
    npc_miner:[
      "Nilo Ardósia passa os dias explorando camadas profundas de ardósia, ametista e nitrato, guiando-se pelo som da rocha antes de abrir uma nova galeria.",
      "Mineradores experientes batem suavemente na parede de pedra para ouvir o eco: som oco pode indicar uma cavidade de geodo ou uma galeria escondida logo atrás."
    ],
    npc_botanist:[
      "Flora Rubra coleta e cataloga flores silvestres de todos os biomas — de papoulas rubras a estrelas-das-neves — mantendo vivo o herbário da vila.",
      "Herbários científicos preservam plantas prensadas e secas por séculos; espécimes coletados há mais de 200 anos ainda fornecem DNA e dados climáticos valiosos."
    ],
    npc_glazier:[
      "Vitro trabalha diante do forno de vidro moldando frascos, lentes e vidraças coloridas, fascinado pela transparência da sílica fundida.",
      "Apesar de antigos boatos dizerem que vidros velhos de janelas 'escorrem' com o tempo, na verdade o vidro é rígido à temperatura ambiente; a diferença de espessura vinha do método antigo de sopro."
    ],
    npc_ceramist:[
      "Maya Argila modela vasos, telhas e placas refratárias com argila úmida e calor controlado, testando diferentes tempos de queima para cada uso.",
      "Adicionar grãos finos de areia ou cerâmica moída ('chamote') à argila crua reduz o encolhimento na secagem e evita rachaduras no forno."
    ],
    npc_teacher:[
      "Prof. Íon leciona na vila sobre átomos, cargas elétricas e ligações químicas, mostrando como cargas opostas se combinam para formar materiais inteiramente novos.",
      "Quando o sódio (um metal reativo) se une ao cloro (um gás tóxico), a transferência de um elétron cria íons Na⁺ e Cl⁻ — o inofensivo sal de cozinha!"
    ],
    npc_mayor:[
      "Alcalina administra a Vila dos Elementos, coordenando as cinco lojas, a manutenção das praças e a recepção aos novos exploradores que chegam do laboratório.",
      "Substâncias alcalinas (básicas, com pH acima de 7) têm nome derivado do árabe 'al-qaly', que se referia às cinzas vegetais ricas em carbonatos usadas para fazer sabão."
    ],
    npc_baker:[
      "Pão de Mel acorda antes do sol para preparar massas fermentadas e assar fornadas aromáticas de pão que abastecem moradores e viajantes.",
      "O pão cresce porque leveduras (Saccharomyces cerevisiae) consomem açúcares da farinha e liberam bolhas de gás carbônico (CO₂) presas na rede elástica do glúten."
    ],
    npc_fisher:[
      "Maré conhece cada remanso e bacia ao redor dos povoados, observando correntes e profundidades para saber exatamente onde cada peixe se esconde.",
      "A temperatura da água influencia diretamente o nível de oxigênio dissolvido: águas mais frias retêm mais oxigênio, atraindo espécies ativas como trutas e salvelinos."
    ],
    npc_geologist:[
      "Dra. Geodo dedica-se ao estudo das formações rochosas e cavidades cristalinas, lendo nas camadas de pedra a história antiga dos mares e vulcões do mundo.",
      "Geodos se formam dentro de bolhas gasosas de rochas vulcânicas ou cavidades em calcário, onde águas ricas em minerais depositam cristais camada após camada por milênios."
    ],

    // === MESTRES E APRENDIZES DE ALQUIMIA (10) ===
    "alchemy:pigment":[
      "Lia Vidral dirige a Estufa de Pigmentos, extraindo corantes de flores e frutos para estudar como indicadores naturais mudam de cor em meios ácidos e básicos.",
      "As antocianinas do repolho-roxo, amoras e hibiscos mudam de cor do vermelho-rosa em ácidos para violeta em meio neutro e verde-azulado em bases."
    ],
    "apprentice:pigment":[
      "O aprendiz da Estufa de Pigmentos testa gotas de extratos florais sobre tiras de papel filtro, registrando cada mudança de tom ao lado da escala de pH.",
      "Tiras indicadoras de papel funcionam como versões portáteis de laboratório usadas há séculos, inspiradas originalmente no extrato do líquen tornassol."
    ],
    "alchemy:crystal":[
      "Nilo Salfer comanda a Casa de Cristalização, controlando evaporação e temperatura em salmouras para obter cristais puros e medir o rendimento real das reações.",
      "A solubilidade da maioria dos sais sólidos aumenta com a temperatura; ao resfriar lentamente uma solução saturada quente, o excesso cristaliza em formas geométricas puras."
    ],
    "apprentice:crystal":[
      "Na Casa de Cristalização, o aprendiz pesa reagentes na balança com cuidado extremo para descobrir qual substância acaba primeiro e limita o rendimento da reação.",
      "Em qualquer reação química, o reagente limitante é aquele que se esgota primeiro e determina a quantidade máxima de produto que pode ser formada."
    ],
    "alchemy:alloy":[
      "Brás da Liga gerencia a Forja das Ligas, unindo metalurgia experimental e eletroquímica para testar tanto bronze fundido quanto pilhas galvânicas.",
      "Em uma liga de cobre e estanho, manter o teor de estanho entre 8% e 16% produz o bronze clássico equilibrado entre dureza elevada e resistência a fraturas."
    ],
    "apprentice:alloy":[
      "O aprendiz da Forja das Ligas aprende a montar pontes salinas entre soluções de zinco e cobre e a observar quando a lâmpada da bancada acende.",
      "Sem a ponte salina, cargas elétricas se acumulam rapidamente nos dois frascos de uma pilha e a corrente elétrica para quase no mesmo instante."
    ],
    "alchemy:water":[
      "Tami do Delta lidera a Oficina das Águas, ensinando exploradores a combinar decantação, filtração e destilação para purificar águas turvas e salobras.",
      "Cada método de separação explora uma propriedade física distinta: a filtração separa pelo tamanho das partículas, enquanto a destilação separa pelo ponto de ebulição."
    ],
    "apprentice:water":[
      "O aprendiz da Oficina das Águas compara frascos coletados antes e depois da filtração para provar que água transparente ainda pode conter muito sal dissolvido.",
      "Enquanto partículas de areia e argila têm micrômetros de tamanho e ficam no filtro, íons de sal medem frações de nanômetro e atravessam filtros comuns livremente."
    ],
    "alchemy:thermal":[
      "Aya da Geada opera o Observatório Térmico nas regiões frias, investigando reações que liberam ou absorvem calor para desenvolver bolsas térmicas e compostos de campo.",
      "Reações exotérmicas liberam calor para o ambiente (aquecendo o frasco), enquanto reações endotérmicas absorvem calor ao redor (esfriando o frasco ao toque)."
    ],
    "apprentice:thermal":[
      "No Observatório Térmico, o aprendiz acompanha o termômetro do calorímetro minuto a minuto, comparando cada cápsula testada com um frasco de controle.",
      "Usar um grupo de controle sem alteração permite ao cientista ter certeza de que a variação de temperatura veio da reação química e não do clima externo."
    ],

    // === MORADORES DAS 6 VILAS REGIONAIS (36) ===
    "planície:central:oficio:market":[
      "Olívia da Feira ergue sua barraca colorida nos Campos logo cedo, trazendo sementes da planície, queijos frescos e frutas para os viajantes que cruzam a estrada.",
      "Nos mercados de campo, a troca direta entre produtores de grãos e pastores ajuda a equilibrar os estoques antes de mudanças bruscas de estação."
    ],
    "planície:central:oficio:orchard":[
      "Estela das Sementes cuida da estufa comunitária dos Campos, selecionando mudas de morango, trigo e videira que brotam com vigor sob o sol aberto da planície.",
      "Estufas bem orientadas captam luz solar durante todo o dia e protegem brotos jovens das rajadas de vento típicas das planícies abertas."
    ],
    "planície:central:child:0":[
      "Rael dos Campos adora correr entre os corredores de grama observando bisões ao longe e coletando flores silvestres para levar até a praça da vila.",
      "Crianças das comunidades regionais passam o dia brincando nas praças centrais e retornam para perto de casa assim que o entardecer começa."
    ],
    "planície:central:child:1":[
      "Nina dos Campos conhece cada ninho de pássaro perto das cercas de madeira e gosta de contar quantas ovelhas descem dos prados antes da chuva.",
      "Observar aves e o comportamento dos rebanhos era uma das formas tradicionais de moradores do campo perceberem a chegada de frentes frias."
    ],
    "planície:central:child:2":[
      "Luan dos Campos acompanha o movimento das nuvens sobre a planície e coleciona pequenos seixos lisos encontrados ao longo dos caminhos da vila.",
      "Formas diferentes de nuvens — como cúmulos altos e estratos baixos — indicam correntes de ar ascendentes e níveis de umidade na atmosfera."
    ],
    "planície:central:villager:0":[
      "Salomé dos Campos ajuda na manutenção dos canteiros e cercados da comunidade da planície, recebendo exploradores com dicas sobre as estradas vizinhas.",
      "Nas planícies amplas, construir muros baixos e cercas de madeira protege as hortas sem bloquear a brisa que seca o orvalho das folhas."
    ],
    "floresta:central:oficio:orchard":[
      "Na comunidade do Bosque, Estela das Sementes cultiva mudas adaptadas à sombra filtrada das árvores, valorizando frutas silvestres como amoras e jabuticabas.",
      "Plantas de sub-bosque desenvolvem folhas mais largas e ricas em clorofila para aproveitar cada raio de luz que atravessa a copa acima."
    ],
    "floresta:central:oficio:lookout":[
      "Alva do Mirante observa o céu acima das copas no posto meteorológico do Bosque, registrando chuvas, neblinas e a direção do vento sobre a floresta.",
      "Florestas densas liberam enormes volumes de vapor d'água por evapotranspiração, criando microclimas mais úmidos e amenos que campos abertos."
    ],
    "floresta:central:child:0":[
      "Caíque do Bosque explora as bordas seguras da mata observando esquilos, sabiás e cogumelos que nascem após noites de chuva.",
      "O solo sombreado da floresta guarda umidade por dias após uma chuva, criando condições perfeitas para cogumelos e samambaias brotarem."
    ],
    "floresta:central:child:1":[
      "Yasmin do Bosque coleciona folhas secas de diferentes árvores — bétulas, carvalhos e cerejeiras — comparando o desenho das nervuras de cada uma.",
      "A rede de nervuras de uma folha funciona ao mesmo tempo como esqueleto estrutural e sistema de transporte de água e açúcares."
    ],
    "floresta:central:child:2":[
      "Tainá do Bosque adora escutar o canto do sabiá-laranjeira ao amanhecer e acompanhar o voo silencioso das corujas quando as lanternas se acendem.",
      "Em florestas fechadas, aves tendem a usar cantos mais melódicos e pausados porque sons muito agudos e rápidos se dispersam demais nos troncos."
    ],
    "floresta:central:villager:0":[
      "Salomé do Bosque mantém os caminhos de seixos limpos de galhos caídos e compartilha histórias sobre os Guardiões de Casca que vivem nas matas mais antigas.",
      "Troncos caídos deixados no chão da floresta servem de berçário ('troncos-mãe') para musgos, insetos e novas mudas de árvores."
    ],
    "manguezal:central:oficio:quay":[
      "Bia do Cais administra o entreposto das águas na vila da Costa, medindo a altura das marés e separando amostras de água doce e salobra no manguezal.",
      "Nos estuários, a água doce menos densa dos rios costuma deslizar por cima da água salgada mais densa que entra com a maré — fenômeno chamado cunha salina."
    ],
    "manguezal:central:oficio:orchard":[
      "Nuri das Sementes testa na estufa da Costa plantas que toleram ventos úmidos e solos ricos em matéria orgânica perto do manguezal.",
      "Jardins costeiros exigem cuidado especial com a salinidade transportada pela maresia, que pode ressecar folhas sensíveis se não forem protegidas."
    ],
    "manguezal:central:child:0":[
      "Nina das Marés observa caranguejos, garças e capivaras-do-mangue da beira segura do cais sempre que o nível da água baixa.",
      "O ritmo das marés é governado principalmente pela atração gravitacional da Lua (e em menor grau do Sol) sobre as massas de água da Terra."
    ],
    "manguezal:central:child:1":[
      "Luan das Marés constrói barquinhos de casca e acompanha a direção em que a correnteza carrega folhas de mangue pelo estuário.",
      "As sementes de muitas árvores de mangue (propágulos) já germinam presas à árvore-mãe e flutuam na água por semanas até fincar raízes em outro banco de lama."
    ],
    "manguezal:central:child:2":[
      "Bia das Marés guarda conchas trazidas pela água salobra e aprende com os pescadores a reconhecer tainhas e camarões nas águas rasas.",
      "Conchas marinhas crescem em espirais logarítmicas perfeitas porque o molusco deposita carbonato de cálcio na borda mantendo sempre a mesma proporção."
    ],
    "manguezal:central:villager:0":[
      "Salomé das Marés ajuda a conservar as passagens de madeira e o reboco verde-petróleo da vila costeira contra a umidade constante do mangue.",
      "Construções sobre pisos elevados de madeira protegem casas ribeirinhas contra cheias sazonais e melhoram a ventilação sob o assoalho."
    ],
    "deserto:central:oficio:cistern":[
      "Miro da Cisterna guarda com zelo a reserva de água da comunidade da Chapada, recolhendo cada chuva rara e filtrando sedimentos sob o calor árido.",
      "Cisternas subterrâneas mantêm a água fresca e bloqueiam a luz solar, impedindo tanto a evaporação quanto o crescimento de algas."
    ],
    "deserto:central:oficio:market":[
      "No posto seco da Chapada, Olívia da Feira abastece caravanas com romãs, pitayas, palmas frutíferas e frascos cheios para atravessar as dunas.",
      "Frutos adaptados a regiões áridas costumam ter cascas espessas e cerosas que conservam a polpa hidratada por dias mesmo sob ar muito seco."
    ],
    "deserto:central:child:0":[
      "Bia da Chapada segue pegadas leves de fenecos na areia fria da manhã e observa como o vento redesenha as ondulações das dunas todo dia.",
      "As ondulações paralelas na areia do deserto ('marcas de onda') formam-se sempre perpendiculares à direção do vento predominante."
    ],
    "deserto:central:child:1":[
      "Caíque da Chapada procura pedras ocres e cristais de sal perto das margens secas, testando o eco da própria voz nos paredões do cânion.",
      "No deserto, a falta de nuvens e umidade faz a temperatura despencar rapidamente à noite, gerando enorme amplitude térmica diária."
    ],
    "deserto:central:child:2":[
      "Yasmin da Chapada admira as flores noturnas das pitaieiras e observa lagartos e tatus-bola escondendo-se do sol forte do meio-dia.",
      "A maioria dos animais do deserto evita o calor extremo adotando hábitos noturnos ou abrigando-se em tocas onde a temperatura quase não muda."
    ],
    "deserto:central:villager:0":[
      "Salomé da Chapada reforça paredes de reboco ocre e toldos de sombra na comunidade seca, orientando exploradores rumo aos templos e salinas.",
      "Paredes grossas de barro ou pedra clara em climas desérticos retardam a entrada do calor durante o dia e devolvem calor suave durante a madrugada fria."
    ],
    "tundra:central:oficio:lookout":[
      "Ícaro do Mirante vigia o horizonte gelado da Serra, anotando auroras, tempestades de neve e os períodos em que os lagos congelam por completo.",
      "Em altas latitudes frias, o ar seco e limpo produz céus noturnos excepcionalmente nítidos para observar estrelas e fenômenos atmosféricos."
    ],
    "tundra:central:oficio:orchard":[
      "Na Serra gelada, Estela das Sementes mantém canteiros abrigados do vento polar para garantir verduras frescas e sementes resistentes ao frio.",
      "Coberturas de vidro criam o efeito estufa em pequena escala: a luz solar entra, aquece o solo interno e o vidro retém o calor irradiado."
    ],
    "tundra:central:child:0":[
      "Rael da Serra modela bonecos na neve compacta e procura marcas de lebres-da-neve e raposas azuis ao redor das lanternas da vila.",
      "A neve fofa recém-caída pode conter mais de 90% de ar preso entre os cristais, funcionando como excelente isolante térmico para tocas e iglus."
    ],
    "tundra:central:child:1":[
      "Nina da Serra adora observar flocos de neve sobre a manga escura do casaco e acompanhar o voo branco das corujas-dos-fiordes ao entardecer.",
      "A forma exata de cada cristal de neve — placas, estrelas ou colunas — depende diretamente da temperatura e da umidade da nuvem onde ele cresceu."
    ],
    "tundra:central:child:2":[
      "Luan da Serra escuta os estalos do gelo nos lagos rasos e guarda seixos glaciais coloridos recolhidos nas encostas da tundra.",
      "O som grave que lagos congelados fazem às vezes vem da dilatação e contração térmica do gelo quando a temperatura muda depressa."
    ],
    "tundra:central:villager:0":[
      "Salomé da Serra cuida dos telhados inclinados de ardósia azul e das reservas de lenha que mantêm a comunidade da tundra aquecida o ano todo.",
      "Telhados bem inclinados em regiões de neve existem por engenharia prática: impedem o acúmulo de toneladas de neve que poderiam derrubar a estrutura."
    ],
    "vulcânico:central:oficio:kiln":[
      "Raul da Forja dirige o pavilhão metálico da Caldeira, aproveitando rochas refratárias e escória local para fundir ligas de alta resistência.",
      "Altas temperaturas em regiões vulcânicas historicamente inspiraram a mitologia das forjas — como o deus romano Vulcano, que deu nome aos próprios vulcões."
    ],
    "vulcânico:central:oficio:cistern":[
      "Na Caldeira, Miro da Cisterna monitora cuidadosamente a acidez das águas próximas às fumarolas para garantir água neutra e segura aos moradores.",
      "Gases vulcânicos como dióxido de enxofre (SO₂) dissolvem-se na água formando soluções ácidas, exigindo neutralização ou destilação antes do consumo."
    ],
    "vulcânico:central:child:0":[
      "Davi da Caldeira compara pedras-pomes que flutuam na água com escórias escuras que afundam, curioso com os segredos das rochas vulcânicas.",
      "Comparar se uma rocha flutua ou afunda é um experimento imediato de densidade: objetos menos densos que a água (1 g/cm³) flutuam."
    ],
    "vulcânico:central:child:1":[
      "Nalu da Caldeira coleciona lascas foscas de vidro basáltico à distância segura da lava e observa os carneiros-da-escória escalando encostas escuras.",
      "Solos vulcânicos antigos, depois que as cinzas se decompõem, tornam-se alguns dos terrenos mais férteis do mundo por serem ricos em potássio e fósforo."
    ],
    "vulcânico:central:child:2":[
      "Joana da Caldeira acompanha as nuvens de vapor que sobem das fendas mornas ao amanhecer e desenha cristais de enxofre no caderno da vila.",
      "O vapor visível sobre nascentes quentes na verdade não é gás invisível, mas milhões de microgotículas de água líquida condensadas no ar mais frio."
    ],
    "vulcânico:central:villager:0":[
      "Salomé da Caldeira coordena a manutenção das paredes de reboco vinho e das rotas seguras ao redor das fendas quentes da região vulcânica.",
      "Regiões geotérmicas reais como a Islândia aproveitam o calor natural do subsolo vulcânico para aquecer casas, estufas e gerar eletricidade limpa."
    ]
  });

  // === FILHOTES: textos e curiosidades específicos por espécie ===
  const babyFacts={
    cow:["bezerro","Fica sempre junto à mãe no pasto enquanto aprende o caminho seguro do rebanho.","Bezerros conseguem ficar de pé e caminhar menos de uma hora após nascer, adaptação vital de herbívoros de campo aberto."],
    sheep:["cordeiro","Acompanha de perto o rebanho nos prados, reconhecendo imediatamente o balido único da mãe.","Ovelhas e cordeiros identificam-se mutuamente pelo timbre da voz e pelo cheiro poucas horas após o nascimento."],
    pig:["leitão","Corre em pequenos grupos atrás da mãe fuçando raízes macias nas bordas dos campos.","Leitões recém-nascidos escolhem uma teta preferida nos primeiros dias de vida e aprendem a reconhecer seus irmãos rapidamente."],
    wild_boar:["filhote de javali","Esconde-se entre arbustos e folhas secas acompanhando a vara durante o forrageio.","Filhotes de javali nascem com listras claras longitudinais ('pijama') que oferecem camuflagem perfeita na luz filtrada da floresta."],
    chicken:["pintinho","Segue a galinha ciscando migalhas e insetos miúdos sob proteção constante do bando.","Pintinhos já se comunicam com a mãe por piados suaves ainda dentro do ovo, um dia antes de romper a casca."],
    rabbit:["láparo","Permanece perto da entrada da toca, pronto para correr ao menor sinal de alerta dos adultos.","Coelhos nascem cegos e sem pelos dentro de ninhos forrados com pelo macio da mãe, desenvolvendo-se rapidamente em poucas semanas."],
    flower_hare:["filhote de lebre-dos-prados","Agacha-se imóvel entre flores altas, confiando na camuflagem até a mãe voltar para amamentar.","Diferente dos coelhos, filhotes de lebre nascem totalmente peludos e de olhos abertos, conseguindo correr quase imediatamente."],
    snow_hare:["filhote de lebre-da-neve","Cresce rapidamente durante o verão curto da tundra sob a pelagem camuflada de filhote.","Lebres jovens em climas polares ganham peso em ritmo acelerado para acumular reservas antes da primeira nevasca."],
    salt_marsh_rabbit:["filhote de lebre das salinas","Abriga-se sob tufos densos de juncália salina enquanto aprende a nadar nos canais rasos.","Filhotes de espécies costeiras aprendem cedo a reconhecer o ritmo das marés para escolher abrigos secos."],
    deer:["cervo jovem","Acompanha a mãe pelos caminhos da taiga, mantendo-se imóvel no capim quando há predadores.","Filhotes de cervos nascem quase sem odor corporal e com manchas brancas no dorso que imitam raios de sol na mata."],
    forest_deer:["cervo jovem das sequoias","Desliza entre as samambaias sob a guarda da manada nas florestas densas.","Nas primeiras semanas, a mãe deixa o filhote escondido em silêncio absoluto enquanto pasta, retornando apenas para alimentá-lo."],
    savanna_gazelle:["filhote de gazela","Esconde-se no capim dourado da savana antes de ganhar velocidade para acompanhar a manada.","Com poucos dias de vida, uma gazela jovem já supera em velocidade muitos humanos adultos para escapar de predadores."],
    mountain_goat:["cabrito-das-cristas","Equilibra-se com surpreendente destreza nas rochas íngremes logo ao lado da mãe.","Cabritos-monteses já escalam encostas rochosas no primeiro dia de vida graças aos cascos aderentes."],
    scoria_ram:["cordeiro da escória","Treina pequenas cabeçadas brincando sobre pedras vulcânicas antes de os chifres crescerem.","As brincadeiras de empurrar entre filhotes de carneiros desenvolvem equilíbrio e coordenação para futuras disputas territoriais."],
    bison:["bezerro de bisão","Caminha protegido bem no centro da manada, cercado pelos adultos mais fortes da pradaria.","Bezerros de bisão nascem com pelagem alaranjada viva ('red dogs') que só escurece para marrom após alguns meses."],
    capivara:["filhote de capivara","Nada grudado às costas ou ao flanco dos adultos e acompanha qualquer adulto do grupo.","Nas capivaras, várias fêmeas do mesmo grupo compartilham o cuidado e até a amamentação dos filhotes."],
    mangrove_capivara:["filhote de capivara do mangue","Atravessa raízes aéreas e canais salobros sempre sob vigilância coletiva do grupo.","Filhotes de capivara já nascem bem desenvolvidos e começam a beliscar gramíneas na primeira semana de vida."],
    cacao_tapir:["filhote de anta","Segue a mãe pelas trilhas sombreadas da selva tropical com uma pelagem pintada bem diferente da adulta.","Filhotes de anta nascem marrom-escuros com listras e pintas brancas que imitam folhas sob o sol, desaparecendo por volta dos 6 meses."],
    iron_armadillo:["filhote de tatu de hematita","Explora a entrada da toca ainda com a carapaça macia enquanto aprende a farejar larvas.","Tatus nascem com carapaça mole e flexível que só mineraliza e endurece por completo semanas após o nascimento."],
    rime_fox:["filhote de raposa do gelo","Brinca na entrada da toca glacial aprimorando saltos de caça sob o olhar dos pais.","Pais de raposas árticas trazem alimento incansavelmente para a toca durante o verão curto até os filhotes ficarem independentes."],
    fennec:["filhote de feneco","Permanece abrigado nas tocas frescas de areia durante o dia e ensaia saltos ágeis ao anoitecer.","Filhotes de feneco nascem com as orelhas dobradas e pequenas, que crescem rapidamente nas primeiras semanas."],
    cat:["gatinho","Descobre o mundo perseguindo folhas ao vento e exercitando o equilíbrio em muros baixos da vila.","Gatinhos nascem com olhos azuis fechados que só se abrem após cerca de uma semana e mudam para a cor definitiva mais tarde."],
    dog:["filhote de cachorro","Trota curioso perto das casas da vila abanando a cauda para qualquer explorador que ofereça alimento.","Filhotes de cães aprendem regras sociais e controle da mordida justamente durante as brincadeiras com irmãos da ninhada."],
    wolf:["lobinho","Cresce cuidado por toda a matilha — não só pelos pais, mas também por tios e irmãos mais velhos.","Lobinhos nascem cegos e surdos dentro da toca e treinam o primeiro uivo ainda bem jovens para manter contato com a matilha."],
    jaguar:["filhote de onça","Acompanha a mãe por quase dois anos pela selva aprendendo a emboscar presas e nadar em rios.","Onças filhotes nascem com manchas mais densas que vão se abrindo em rosetas largas à medida que o corpo cresce."],
    tiger:["filhote de tigre","Segue a mãe nas matas frias praticando saltos silenciosos sobre folhas secas até dominar a caça solitária.","Os filhotes de tigre já nascem com o desenho definitivo das listras, que apenas se expandem proporcionalmente conforme crescem."],
    lion:["filhote de leão","Brinca com outros filhotes da mesma idade sob a proteção conjunta das leoas do bando.","Filhotes de leão nascem com manchas claras (rosetas discretas) no pelo que ajudam na camuflagem na savana e somem na fase adulta."],
    lynx:["filhote de lince","Treina saltos longos na neve sob supervisão da mãe antes de assumir seu próprio território solitário.","Os tufos escuros nas orelhas do lince jovem aparecem cedo e crescem junto com a audição aguçada do predador."],
    brown_bear:["filhote de urso-pardo","Acompanha a mãe em montanhas e rios por até três anos aprendendo onde encontrar frutas e peixes.","Ursos-pardos nascem minúsculos — pesando menos de meio quilo — durante o repouso de inverno da mãe na toca."],
    black_bear:["filhote de urso-negro","Sobe rapidamente em troncos altos ao menor grunhido de aviso da mãe na floresta.","Filhotes de urso-negro escalam árvores desde muito cedo para escapar de predadores enquanto a mãe vigia na base."],
    polar_bear:["filhote de urso-polar","Sai da toca de neve na primavera seguindo fielmente os passos da mãe sobre o gelo ártico.","O leite da ursa-polar tem mais de 30% de gordura — um dos mais nutritivos entre mamíferos — para fazer o filhote crescer rápido no frio extremo."],
    badger:["filhote de texugo","Escava pequenos túneis de treino perto da toca principal dos pais nos cânions calcários.","Filhotes de texugo permanecem semanas dentro de câmaras subterrâneas forradas com grama seca antes de explorar a superfície à noite."]
  };

  function describeCrop(entry){
    const {food,seed,phase}=entry.loreData;
    const pack=cropDetails[food];
    if(pack){
      const slot=phase?phase:entry.key===seed?"seed":"food";
      if(pack[slot])return pack[slot];
    }
    return [
      entry.name+" integra os cultivos acompanhados na horta da Vila dos Elementos.",
      "O ciclo agrícola depende de solo aerado, luz solar adequada e irrigação equilibrada."
    ];
  }

  function describeBaby(entry,lookup){
    const base=entry.key.slice(0,-5);
    const adultName=lookup.get(base)?.name||entry.name.replace(/^Filhote\s*·\s*/,"");
    const info=babyFacts[base];
    if(info){
      const [label,storyPart,curiosity]=info;
      return [
        `O ${label} de ${adultName} cresce gradualmente ao lado dos adultos da espécie. ${storyPart}`,
        curiosity
      ];
    }
    return [
      `Filhote jovem de ${adultName} ainda em desenvolvimento sob proteção dos adultos de seu habitat.`,
      `Oferecer o alimento favorito de ${adultName} acelera seu crescimento até atingir o porte adulto.`
    ];
  }

  function describeGhost(entry,lookup){
    const base=entry.key.slice(0,-6);
    const target=lookup.get(base);
    const baseName=target?.name||entry.name.replace(/\s*·.*$/,"");
    const baseRec=notes[base];
    const aquatic=entry.category==="aquatic";
    const silver=base==="werewolf";
    const story=aquatic?
      `Aparição fantasmagórica de ${baseName} que desliza silenciosamente sob as águas escuras envolta em brilho ciano. Mantém o nado e o porte da forma viva, mas atravessa armas comuns sem sofrer arranhões.`:
      `Forma espectral de ${baseName} avistada em rondas noturnas e regiões sombreadas, cercada por névoa luminosa azul-esverdeada. Repete os movimentos da criatura original, mas ignora qualquer aço comum.`;
    const extra=silver?" Por unir maldição lunar e natureza espectral, só pode ser ferido com armas fantasmagóricas que carreguem prata.":
      " Apenas armas fantasmagóricas impregnadas de ectoplasma causam dano a esta aparição, e somente armaduras fantasmagóricas reduzem seus ataques.";
    const hint=baseRec?` Na forma viva, ${baseName.toLocaleLowerCase("pt-BR")} destaca-se por um fato curioso: ${baseRec[1][0].toLocaleLowerCase("pt-BR")+baseRec[1].slice(1)}`:"";
    return [story,`${extra.trim()}${hint}`];
  }

  function describe(entry,lookup=new Map()){
    const {key,name}=entry;
    let pair=entry.loreData?.food?describeCrop(entry):Object.hasOwn(notes,key)?notes[key]:null;
    if(!pair&&key.endsWith(":baby"))pair=describeBaby(entry,lookup);
    if(!pair&&key.endsWith(":ghost"))pair=describeGhost(entry,lookup);
    if(!pair){
      pair=[
        `${name} faz parte dos registros levantados pelos exploradores e cientistas do QuimiCraft.`,
        `Observe ${name} no visualizador 3D interativo para examinar seus detalhes estruturais de todos os ângulos.`
      ];
    }
    const [story,curiosity]=pair;
    return {story,curiosity,clue:curiosity,links:[]};
  }
  return {describe,extend:extra=>Object.assign(notes,extra)};
})();
