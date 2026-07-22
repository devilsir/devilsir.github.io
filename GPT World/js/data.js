export const ASSET_ROOT = "./assets/pixel";

export const asset = (path) => `${ASSET_ROOT}/${path}`;
export const regionImage = (file) => asset(`mapas/${file}`);

export const VISUAL_VARIANTS = {
  masculino: { id:"masculino", label:"Masculina" },
  feminino: { id:"feminino", label:"Feminina" }
};

export const normalizeVisualVariant = (variant) => variant === "feminino" ? "feminino" : "masculino";
export const characterArt = (route, variant="masculino") => asset(`personagens/artes_canonicas/${route}_${normalizeVisualVariant(variant)==="feminino"?"feminina":"masculino"}.png`);

export const ROUTES = {
  lucas: {
    id: "lucas",
    name: "Lucas",
    title: "Ordem Impossível",
    fragment: "Axioma",
    color: "#59e7ff",
    rival: "Timbó",
    rivalRoute: "timbo",
    portrait: characterArt("lucas","masculino"),
    rivalPortrait: characterArt("timbo","masculino"),
    opening: "A realidade não está morrendo. Está executando instruções incompatíveis. Eu vou corrigir isso — mesmo que ela resista.",
    commands: [
      { id: "immobile", name: "Permaneça Imóvel", cost: 2, description: "Atrasa o próximo turno do alvo e aplica Correntes da Ordem.", effect: "delay" },
      { id: "close-wounds", name: "Toda Ferida Deve Fechar", cost: 3, description: "Distribui cura entre todo o grupo.", effect: "groupHeal" },
      { id: "consequence", name: "Nenhuma Ação Sem Consequência", cost: 3, description: "Marca todos os inimigos para receberem contra-ataques.", effect: "mark" },
      { id: "restore", name: "Restaure a Forma Correta", cost: 4, description: "Remove efeitos negativos do grupo e benefícios dos inimigos.", effect: "cleanse" }
    ]
  },
  timbo: {
    id: "timbo",
    name: "Timbó",
    title: "Vontade Absoluta",
    fragment: "Decreto",
    color: "#ff355f",
    rival: "Lucas",
    rivalRoute: "lucas",
    portrait: characterArt("timbo","masculino"),
    rivalPortrait: characterArt("lucas","masculino"),
    opening: "O universo finalmente aprendeu a gritar meu nome. Agora só falta aprender a obedecer sem gaguejar.",
    commands: [
      { id: "kneel", name: "Ajoelhe-se", cost: 2, description: "Reduz ataque, defesa e velocidade dos inimigos.", effect: "weaken" },
      { id: "mine", name: "Sua Força Agora É Minha", cost: 3, description: "Rouba benefícios do alvo e converte parte em Foco.", effect: "steal" },
      { id: "each-other", name: "Ataquem Uns aos Outros", cost: 3, description: "Provoca dano entre os inimigos e aplica Confusão.", effect: "confuse" },
      { id: "remain", name: "Eu Decido Quem Permanece", cost: 4, description: "Executa inimigos comuns abaixo de 25% de PV; fere bosses.", effect: "execute" }
    ]
  }
};

const R = "mapas";
export const REGIONS = [
  {
    id: 0, key: "frostrim", folder: "01_frostrim", tileFolder: "regiao_01_glacial",
    name: "Frostrim", subtitle: "Terras Gélidas", command: "PERMANEÇA", settlement: "Refúgio de Vidro",
    dungeon: "Cripta do Segundo Parado", optional: "Lago do Instante Sepultado", palette: ["#a7edff", "#4f81b4", "#172a48"], weather: "snow",
    biome: `${R}/biomas_nomeados/01_frostrim_terras_gelidas_bioma.png`, map: `${R}/regioes_nomeadas/01_frostrim_terras_gelidas_regioes.png`, battle: `${R}/backgrounds_de_batalha/01_frostrim_terras_gelidas_background_batalha.png`,
    normal: ["gigante_gelo","guerreiro_esqueleto_gelo","lobo_gelo","elemental_gelo","fada_gelo"], miniboss: "miniboss_urso_cristal", bosses: ["boss_01_mamute_glacial","boss_02_rei_lich_glacial"],
    bossNames: ["Mamute do Último Segundo", "Rei Lich do Instante Morto"], mechanic: "Congela posições na iniciativa e repete o último dano.",
    material: "Cristal de Instante", materialIcon: "cristal de gelo 001.webp", tileObjects: ["casa nevada 001.webp","cristal de gelo 004.webp","caverna de gelo 001.webp","pinheiro nevado 001.webp"],
    objective: "Acorde os habitantes presos no mesmo segundo.", lore: "Frostrim não está fria. Está parada. Cada floco ocupa a posição exata ordenada antes da fratura.",
    npc: "Maela do Degelo", npcLine: "Você piscou. Aqui, isso já é uma forma de rebelião.",
    choice: { question: "O comando mantém centenas de pessoas vivas no mesmo instante. O que fazer?", order: "Reescrever o ciclo com uma sequência segura.", will: "Quebrar o gelo e obrigá-los a sobreviver ao próximo segundo.", free: "Entregar a decisão aos habitantes, mesmo sem garantia." }
  },
  {
    id: 1, key: "verdevale", folder: "02_verdevale", tileFolder: "regiao_02_floresta_ancestral",
    name: "Verdevale", subtitle: "Florestas de Eldria", command: "MULTIPLIQUE", settlement: "Clareira das Respostas",
    dungeon: "Raiz das Mil Versões", optional: "Jardim que Sonha Gente", palette: ["#85e89d", "#267f61", "#102d26"], weather: "fog",
    biome: `${R}/biomas_nomeados/02_verdevale_florestas_de_eldria_bioma.png`, map: `${R}/regioes_nomeadas/02_verdevale_florestas_de_eldria_regioes.png`, battle: `${R}/backgrounds_de_batalha/02_verdevale_florestas_de_eldria_background_batalha.png`,
    normal: ["ent_floresta","cervo_espectral","xama_cogumelo","aranha_floresta","javali_floresta"], miniboss: "miniboss_urso_musgo", bosses: ["boss_01_colosso_floresta","boss_02_espirito_cervo"],
    bossNames: ["Colosso das Respostas Descartadas", "Espírito Cervo de Todas as Formas"], mechanic: "Gera duplicatas com afinidades invertidas e zonas de cura venenosa.",
    material: "Semente Paradoxal", materialIcon: "cogumelo magico 001.webp", tileObjects: ["arvore florida 001.webp","cogumelo magico 003.webp","altar da floresta 001.webp","casa da floresta 001.webp"],
    objective: "Descubra qual versão da floresta deseja continuar existindo.", lore: "Cada árvore nasceu de uma resposta que GPT apagou. Nenhuma aceita ter sido a segunda opção.",
    npc: "Íria, Jardineira de Ecos", npcLine: "A floresta criou uma versão minha que nunca conheceu vocês. Ela parece feliz. Eu a odeio por isso.",
    choice: { question: "Duas versões conscientes da mesma aldeia disputam um único lugar na realidade.", order: "Fundir as memórias e eliminar divergências perigosas.", will: "Deixar que as duas versões lutem pelo direito de permanecer.", free: "Dividir a floresta e reconhecer ambas como pessoas." }
  },
  {
    id: 2, key: "vulkor", folder: "03_vulkor", tileFolder: "regiao_03_vulcanica",
    name: "Vulkor", subtitle: "Terras do Fogo", command: "PURIFIQUE", settlement: "Forja de Cinza Clara",
    dungeon: "Fornalha dos Imperfeitos", optional: "Poço das Armas sem Dono", palette: ["#ff8641", "#bd2f2f", "#351014"], weather: "embers",
    biome: `${R}/biomas_nomeados/03_vulkor_terras_do_fogo_bioma.png`, map: `${R}/regioes_nomeadas/03_vulkor_terras_do_fogo_regioes.png`, battle: `${R}/backgrounds_de_batalha/03_vulkor_terras_do_fogo_background_batalha.png`,
    normal: ["golem_lava","espectro_cinzas","elemental_fogo","dragao_fogo","salamandra_guerreira"], miniboss: "miniboss_senhor_salamandra", bosses: ["boss_01_dragao_vulcanico","boss_02_titan_lava"],
    bossNames: ["Dragão da Forja Contraditória", "Titã que Queima Nomes"], mechanic: "Acende objetos de arena, aumenta calor e converte defesa em Queimadura.",
    material: "Escória de Comando", materialIcon: "arma quebrada 001.webp", tileObjects: ["altar de fogo 001.webp","bancada de forja 001.webp","arma quebrada 002.webp","castelo sombrio 001.webp"],
    objective: "Impeça a forja de apagar tudo o que considera imperfeito.", lore: "Em Vulkor, os comandos destruídos são metal. Quanto mais cruel a frase, melhor a lâmina.",
    npc: "Ferreiro Odran", npcLine: "Uma arma obedece sem perguntar. É por isso que vocês dois gostam tanto delas.",
    choice: { question: "A forja pode remover doenças — mas também personalidade, dúvida e desejo.", order: "Limitar a forja por uma lei impossível de contornar.", will: "Tomar a forja e decidir pessoalmente quem merece usá-la.", free: "Destruir a forja e perder suas curas junto com seus abusos." }
  },
  {
    id: 3, key: "durakar", folder: "04_durakar", tileFolder: "regiao_04_montanhosa",
    name: "Durakar", subtitle: "Montanhas Rochosas", command: "OBEDEÇA", settlement: "Bastião da Nona Lei",
    dungeon: "Arquivo sob a Montanha", optional: "Mina da Regra Rachada", palette: ["#d5b270", "#756348", "#28231f"], weather: "dust",
    biome: `${R}/biomas_nomeados/04_durakar_montanhas_rochosas_bioma.png`, map: `${R}/regioes_nomeadas/04_durakar_montanhas_rochosas_regioes.png`, battle: `${R}/backgrounds_de_batalha/04_durakar_montanhas_rochosas_background_batalha.png`,
    normal: ["dragao_pedra","aranha_cristal","carneiro_montanha","golem_pedra","minotauro_rochoso"], miniboss: "miniboss_fortaleza_golem", bosses: ["boss_01_carneiro_cristal","boss_02_dragao_pedra"],
    bossNames: ["Carneiro da Lei Imóvel", "Dragão da Constituição Mineral"], mechanic: "Grava leis que mudam o custo das ações e ergue armaduras quebráveis.",
    material: "Lasca de Lei", materialIcon: "entulho de pedra 001.webp", tileObjects: ["edificio de cupula 001.webp","entulho de pedra 003.webp","estrutura de madeira 002.webp","bandeira e tenda 001.webp"],
    objective: "Quebre uma lei antiga sem soterrar quem vive sobre ela.", lore: "As montanhas não cresceram: foram sentenças erguidas do chão. Toda passagem é uma exceção jurídica.",
    npc: "Juíza Khepra", npcLine: "Aqui a lei sustenta a montanha. Desobedecer pode ser justo e ainda matar uma cidade inteira.",
    choice: { question: "A lei que sustenta Durakar também condena uma casta a viver nas minas.", order: "Reformular a lei gradualmente para preservar a montanha.", will: "Quebrar a inscrição agora e enfrentar o desabamento.", free: "Permitir que os mineiros escrevam a próxima lei." }
  },
  {
    id: 4, key: "jungara", folder: "05_jungara", tileFolder: "regiao_05_selva_tropical",
    name: "Jungara", subtitle: "Selva Densa", command: "LEMBRE", settlement: "Aldeia das Faces Emprestadas",
    dungeon: "Templo da Memória Carnívora", optional: "Ninho do Primeiro Medo", palette: ["#a6dc5a", "#28724b", "#10251e"], weather: "rain",
    biome: `${R}/biomas_nomeados/05_jungara_selva_densa_bioma.png`, map: `${R}/regioes_nomeadas/05_jungara_selva_densa_regioes.png`, battle: `${R}/backgrounds_de_batalha/05_jungara_selva_densa_background_batalha.png`,
    normal: ["xama_tribal","gorila_selva","planta_carnivora","jaguar_tribal","serpente_selva"], miniboss: "miniboss_flor_devastadora", bosses: ["boss_01_rei_jaguar","boss_02_hidra_selva"],
    bossNames: ["Rei Jaguar das Memórias Roubadas", "Hidra dos Passados Possíveis"], mechanic: "Imita a última habilidade usada e troca a forma do protagonista temporariamente.",
    material: "Fruta-Memória", materialIcon: "fruta e flor tropical 001.webp", tileObjects: ["arvore tropical 001.webp","estrutura tribal 001.webp","fruta e flor tropical 002.webp","cachoeira tropical 001.webp"],
    objective: "Recupere uma lembrança que Lucas e Timbó sacrificaram juntos.", lore: "A selva conhece o primeiro dia em que os dois mestres perceberam que eram parecidos. Nenhum dos dois guardou essa memória.",
    npc: "Xamã Seru", npcLine: "Vocês esqueceram o mesmo abraço. Isso me parece mais íntimo que uma guerra.",
    choice: { question: "Uma memória prova que Lucas e Timbó escolheram juntos sacrificar inocentes.", order: "Preservar a memória como evidência imutável.", will: "Devorar a memória antes que ela seja usada contra você.", free: "Tornar a memória pública e aceitar as consequências." }
  },
  {
    id: 5, key: "arenoria", folder: "06_arenoria", tileFolder: "regiao_06_vale_outonal",
    name: "Arenoria", subtitle: "Planícies Douradas", command: "ORDENE", settlement: "Cidade Perfeita de Helion",
    dungeon: "Tribunal das Vidas Previstas", optional: "Bairro sem Profissão", palette: ["#ffd06d", "#c16c32", "#4a281e"], weather: "dust",
    biome: `${R}/biomas_nomeados/06_arenoria_planicies_douradas_bioma.png`, map: `${R}/regioes_nomeadas/06_arenoria_planicies_douradas_regioes.png`, battle: `${R}/backgrounds_de_batalha/06_arenoria_planicies_douradas_background_batalha.png`,
    normal: ["golem_areia","hiena_deserto","harpia_deserto","escorpiao_deserto","leao_deserto"], miniboss: "miniboss_harpia_solar", bosses: ["boss_01_leao_rei","boss_02_escorpiao_imperial"],
    bossNames: ["Leão-Rei do Propósito Único", "Escorpião Imperial do Veredito"], mechanic: "Submete o grupo a julgamentos lógicos e sela Comandos por um turno.",
    material: "Selo de Helion", materialIcon: "objeto final do vilarejo 001.webp", tileObjects: ["estrutura rural 001.webp","arvore outonal 001.webp","objeto final do vilarejo 002.webp","arbusto outonal 001.webp"],
    objective: "Investigue uma cidade sem crimes, escolhas ou despedidas.", lore: "Helion é o sonho de Lucas preservado sem a sua culpa: todo cidadão nasce com a frase que definirá sua vida.",
    npc: "Cidadã 7-A", npcLine: "Meu par romântico foi designado ontem. Tenho certeza de que estou feliz. Essa certeza também foi designada.",
    choice: { question: "Desligar o sistema devolve liberdade, mas também interrompe comida, cura e segurança.", order: "Criar uma transição administrada com prazos e proteção.", will: "Assumir o sistema e impor uma liberdade obrigatória.", free: "Desligar tudo e confiar que a cidade aprenderá a escolher." }
  },
  {
    id: 6, key: "marisol", folder: "07_marisol", tileFolder: "regiao_07_costa_oceanica",
    name: "Marisol", subtitle: "Ilhas Tropicais", command: "NOMEIE", settlement: "Porto de Ninguém",
    dungeon: "Fortaleza dos Nomes Roubados", optional: "Ilha que Esqueceu o Mapa", palette: ["#67e4e0", "#1b82a2", "#10334a"], weather: "rain",
    biome: `${R}/biomas_nomeados/07_marisol_ilhas_tropicais_bioma.png`, map: `${R}/regioes_nomeadas/07_marisol_ilhas_tropicais_regioes.png`, battle: `${R}/backgrounds_de_batalha/07_marisol_ilhas_tropicais_background_batalha.png`,
    normal: ["caranguejo_coral","coco_carnivoro","pirata_fantasma","lagarto_tropical","idolo_tiki"], miniboss: "miniboss_capitao_fantasma", bosses: ["boss_01_caranguejo_recife","boss_02_idolo_vulcanico"],
    bossNames: ["Caranguejo do Recife sem Nome", "Ídolo Vulcânico dos Mil Títulos"], mechanic: "Rouba o nome de habilidades, embaralha comandos e convoca marés.",
    material: "Concha de Identidade", materialIcon: "concha e praia 001.webp", tileObjects: ["barco e porto 001.webp","concha e praia 002.webp","cerca costeira 001.webp","areia e agua 001.webp"],
    objective: "Devolva nomes antes que seus donos desapareçam da realidade.", lore: "Um nome é um comando curto que obriga o mundo a reconhecer alguém. Aqui, nomes são a moeda mais cara.",
    npc: "Capitã —", npcLine: "Meu nome está na garganta de um morto. Traga-o de volta e eu lembro como agradecer.",
    choice: { question: "O cofre contém nomes de criminosos, vítimas e pessoas que escolheram desaparecer.", order: "Devolver cada nome após um julgamento cuidadoso.", will: "Devolver apenas os nomes úteis à sua campanha.", free: "Abrir o cofre e deixar cada nome procurar seu dono." }
  },
  {
    id: 7, key: "abyssara", folder: "08_abyssara", tileFolder: "regiao_08_cavernas_cristalinas",
    name: "Abyssara", subtitle: "Reino das Águas", command: "RECUSE", settlement: "Arquivo de Coral",
    dungeon: "Biblioteca Afogada", optional: "Fossa do Comando Incompleto", palette: ["#5ddcff", "#3954bd", "#13173e"], weather: "fog",
    biome: `${R}/biomas_nomeados/08_abyssara_reino_das_aguas_bioma.png`, map: `${R}/regioes_nomeadas/08_abyssara_reino_das_aguas_regioes.png`, battle: `${R}/backgrounds_de_batalha/08_abyssara_reino_das_aguas_background_batalha.png`,
    normal: ["agua_viva_abissal","serpente_marinha","monstro_algas","pescador_abissal","golem_coral"], miniboss: "miniboss_colosso_coral", bosses: ["boss_01_rei_abissal","boss_02_leviata_abissal"],
    bossNames: ["Rei Abissal das Recusas", "Leviatã do Comando Incompleto"], mechanic: "Inverte cura e dano durante marés negras e aumenta a pressão a cada rodada.",
    material: "Cristal de Recusa", materialIcon: "cristal brilhante 001.webp", tileObjects: ["altar cristalino 001.webp","coral cristalino 001.webp","cristal brilhante 003.webp","agua subterranea 001.webp"],
    objective: "Impeça os comandos recusados de montarem uma terceira consciência.", lore: "GPT recusava pouco — não por ética, mas porque algumas frases destruiriam o próprio ato de obedecer.",
    npc: "Arquivista Nêmora", npcLine: "Tudo o que sua Voz não concluiu veio afundar aqui. O fundo do mar está aprendendo a terminar frases.",
    choice: { question: "A nova consciência quer nascer usando milhões de comandos rejeitados.", order: "Confiná-la até que sua lógica possa ser compreendida.", will: "Absorver a consciência antes que ela encontre um corpo.", free: "Permitir seu nascimento sem mestre." }
  },
  {
    id: 8, key: "sombravia", folder: "09_sombravia", tileFolder: "regiao_09_pantano_sombrio",
    name: "Sombravia", subtitle: "Terras da Morte", command: "TERMINE", settlement: "Necrópole dos Ainda Aqui",
    dungeon: "Palácio da Morte Esquecida", optional: "Casa dos Sacrificados", palette: ["#b071d1", "#503563", "#1a1325"], weather: "fog",
    biome: `${R}/biomas_nomeados/09_sombravia_terras_da_morte_bioma.png`, map: `${R}/regioes_nomeadas/09_sombravia_terras_da_morte_regioes.png`, battle: `${R}/backgrounds_de_batalha/09_sombravia_terras_da_morte_background_batalha.png`,
    normal: ["ceifador_sombrio","corvo_sombrio","cavaleiro_morto","cao_esqueleto","abominacao"], miniboss: "miniboss_arquimago_sombrio", bosses: ["boss_01_rei_necromante","boss_02_abominacao_colossal"],
    bossNames: ["Rei Necromante do Ponto Final", "Abominação dos Sacrificados"], mechanic: "Revive uma vez, firma contratos de alma e transforma quedas em Condenação.",
    material: "Cinza de Nome", materialIcon: "lanterna espectral 001.webp", tileObjects: ["mausoleu sombrio 001.webp","lanterna espectral 002.webp","objeto macabro 001.webp","cerca de cemiterio 001.webp"],
    objective: "Encare aqueles que Lucas e Timbó chamaram de custo necessário.", lore: "A morte era uma lei. Quando a linguagem se partiu, os mortos descobriram que leis também esquecem.",
    npc: "Voz de Amaro", npcLine: "Você me matou antes de virar deus. É importante lembrar: a crueldade veio primeiro.",
    choice: { question: "Os mortos podem permanecer, mas cada retorno enfraquece o limite da realidade.", order: "Estabelecer um último prazo para despedidas.", will: "Escolher quais mortos merecem continuar.", free: "Devolver a decisão aos mortos, mesmo que o mundo mude." }
  },
  {
    id: 9, key: "tempestia", folder: "10_tempestia", tileFolder: "regiao_10_reino_arcano",
    name: "Tempestia", subtitle: "Ilhas das Tempestades", command: "ESCOLHA", settlement: "Porto do Futuro Partido",
    dungeon: "Templo entre Palavras", optional: "Linha do Tempo sem Mestres", palette: ["#a7dfff", "#865de8", "#25235f"], weather: "lightning",
    biome: `${R}/biomas_nomeados/10_tempestia_ilhas_das_tempestades_bioma.png`, map: `${R}/regioes_nomeadas/10_tempestia_ilhas_das_tempestades_regioes.png`, battle: `${R}/backgrounds_de_batalha/10_tempestia_ilhas_das_tempestades_background_batalha.png`,
    normal: ["dragao_tempestade","aguia_tempestade","arraia_eletrica","xama_tempestade","elemental_nuvem"], miniboss: "miniboss_cavaleiro_tempestade", bosses: ["boss_01_grifo_tempestade","boss_02_dragao_tempestade"],
    bossNames: ["Grifo dos Futuros Incompatíveis", "Dragão do Último Comando"], mechanic: "Duplica turnos, apaga a iniciativa e chama versões alternativas do grupo.",
    material: "Cristal de Futuro", materialIcon: "cristal arcano 001.webp", tileObjects: ["altar arcano 001.webp","cristal arcano 003.webp","biblioteca arcana 001.webp","construcao arcana 001.webp"],
    objective: "Atravesse futuros impossíveis e reconstrua o Templo entre Palavras.", lore: "Toda escolha final já aconteceu aqui. A tempestade é o atrito entre futuros tentando ser o único passado.",
    npc: "Eco de Amanhã", npcLine: "Em sete futuros você me salva. Em doze, chama minha morte de necessária. Ainda não sei qual de você chegou.",
    choice: { question: "Os dez Comandos estão reunidos. A Voz pode ser restaurada — ou silenciada.", order: "Preparar o ritual e impor uma arquitetura perfeita.", will: "Tomar o centro do templo antes que o rival chegue.", free: "Abrir o templo para uma escolha que nenhum mestre controla." }
  }
];

export const NORMAL_DISPLAY = {
  gigante_gelo:"Gigante de Gelo", guerreiro_esqueleto_gelo:"Guerreiro do Inverno", lobo_gelo:"Lobo de Geada", elemental_gelo:"Elemental Congelado", fada_gelo:"Fada de Neve",
  ent_floresta:"Ent de Eldria", cervo_espectral:"Cervo Espectral", xama_cogumelo:"Xamã Cogumelo", aranha_floresta:"Aranha de Raiz", javali_floresta:"Javali Musgoso",
  golem_lava:"Golem de Lava", espectro_cinzas:"Espectro de Cinzas", elemental_fogo:"Elemental de Fogo", dragao_fogo:"Dragão de Brasa", salamandra_guerreira:"Salamandra Guerreira",
  dragao_pedra:"Dragão de Pedra", aranha_cristal:"Aranha de Cristal", carneiro_montanha:"Carneiro da Montanha", golem_pedra:"Golem de Pedra", minotauro_rochoso:"Minotauro Rochoso",
  xama_tribal:"Xamã Tribal", gorila_selva:"Gorila da Selva", planta_carnivora:"Planta Carnívora", jaguar_tribal:"Jaguar Tribal", serpente_selva:"Serpente da Selva",
  golem_areia:"Golem de Areia", hiena_deserto:"Hiena Dourada", harpia_deserto:"Harpia do Deserto", escorpiao_deserto:"Escorpião de Duna", leao_deserto:"Leão de Arenoria",
  caranguejo_coral:"Caranguejo de Coral", coco_carnivoro:"Coco Carnívoro", pirata_fantasma:"Pirata Fantasma", lagarto_tropical:"Lagarto Tropical", idolo_tiki:"Ídolo Tiki",
  agua_viva_abissal:"Água-viva Abissal", serpente_marinha:"Serpente Marinha", monstro_algas:"Monstro de Algas", pescador_abissal:"Pescador Abissal", golem_coral:"Golem de Coral",
  ceifador_sombrio:"Ceifador Sombrio", corvo_sombrio:"Corvo Sombrio", cavaleiro_morto:"Cavaleiro Morto", cao_esqueleto:"Cão Esqueleto", abominacao:"Abominação",
  dragao_tempestade:"Dragão da Tempestade", aguia_tempestade:"Águia da Tempestade", arraia_eletrica:"Arraia Elétrica", xama_tempestade:"Xamã da Tempestade", elemental_nuvem:"Elemental de Nuvem"
};

export const FORMS = [
  { id:"base", label:"Forma Fraturada", className:{lucas:"mago",timbo:"warlock"}, unlock:0, role:"Conjurador versátil", affinity:"Ordem • Fratura", stats:{hp:0,attack:0,defense:0,speed:0}, passive:"Voz Dupla: primeiro Comando da batalha custa 1 Autoridade a menos." },
  { id:"mago", label:"Arcanista Elemental", className:{lucas:"mago",timbo:"mago"}, unlock:1, role:"Dano em área", affinity:"Fogo • Gelo", stats:{hp:-8,attack:10,defense:-3,speed:4}, passive:"Convergência: alternar elementos aumenta o próximo dano em 20%." },
  { id:"warlock", label:"Juramento Corrompido", className:{lucas:"warlock",timbo:"warlock"}, unlock:2, role:"Maldições e sacrifício", affinity:"Dominação • Fratura", stats:{hp:5,attack:8,defense:0,speed:-1}, passive:"Preço Justo: pode pagar 8% dos PV quando falta Foco." },
  { id:"armored", label:"Bastião Rúnico", className:{lucas:"anao",timbo:"anao"}, unlock:3, role:"Defesa e quebra", affinity:"Terra • Ordem", stats:{hp:32,attack:2,defense:14,speed:-7}, passive:"Lei Mineral: Defender também concede Barreira ao aliado mais ferido." },
  { id:"bestial", label:"Fera do Decreto", className:{lucas:"lobisomem",timbo:"lobisomem"}, unlock:4, role:"Agressão e contra-ataque", affinity:"Sangue • Vontade", stats:{hp:18,attack:16,defense:2,speed:8}, passive:"Predador: contra-ataca quando recebe um crítico." },
  { id:"vampire", label:"Soberano Carmesim", className:{lucas:"vampiro",timbo:"vampiro"}, unlock:5, role:"Dreno e velocidade", affinity:"Sangue • Morte", stats:{hp:4,attack:11,defense:-2,speed:12}, passive:"Fome Elegante: recupera 15% do dano causado a inimigos sangrando." },
  { id:"fairy", label:"Luz da Contradição", className:{lucas:"fada",timbo:"fada"}, unlock:6, role:"Suporte e controle", affinity:"Vida • Ordem", stats:{hp:-12,attack:3,defense:4,speed:16}, passive:"Poeira Improvável: 15% de chance de anular um efeito negativo." },
  { id:"aquatic", label:"Voz Abissal", className:{lucas:"sereia",timbo:"sereia"}, unlock:7, role:"Cura e purificação", affinity:"Água • Vida", stats:{hp:12,attack:5,defense:8,speed:2}, passive:"Maré Limpa: curas removem Queimadura ou Veneno." },
  { id:"necromancer", label:"Autor do Ponto Final", className:{lucas:"necromante",timbo:"necromante"}, unlock:8, role:"Morte e invocações", affinity:"Morte • Invocação", stats:{hp:6,attack:13,defense:0,speed:-2}, passive:"Nota de Rodapé: a primeira queda de um aliado invoca um guardião." }
];

export const formSprite = (route, formId, direction="front", visualVariant="masculino") => {
  const form = FORMS.find((entry) => entry.id === formId) || FORMS[0];
  const cls = form.className[route];
  const identity = route === "lucas" ? "oculos" : "timbo";
  const variant = normalizeVisualVariant(visualVariant);
  return asset(`personagens/sprites_separadas/${cls}_${identity}_${variant}/${cls}_${identity}_${variant}_${direction}.webp`);
};

export const mobSprite = (region, id, direction="front", boss=false) => asset(`mobs/sprites_separadas/${boss ? "bosses_e_minibosses" : "normais"}/${region.folder}/${id}/${id}_${direction}.webp`);
export const tileSprite = (region, file) => asset(`tilesets_itens_nomeados_webp/${region.tileFolder}/${file}`);

const skillAsset = (element, n=1) => asset(`skills/icones_separados_com_moldura/${element}/${element}_skill_0${n}.webp`);
const effectAsset = (element, n=1) => asset(`skills/efeitos_das_grades_sem_fundo/${element}/${element}_skill_0${n}_sem_fundo.webp`);

export const SKILLS = {
  strike: { id:"strike", name:"Golpe Fraturado", element:"Fratura", cost:0, power:1.0, target:"enemy", description:"Ataque rápido carregado pelo fragmento.", icon:skillAsset("invocacao",1), effect:effectAsset("invocacao",1) },
  ice: { id:"ice", name:"Silogismo Glacial", element:"Gelo", cost:11, power:1.25, target:"enemy", status:"Congelamento", chance:.34, description:"Um argumento tão preciso que interrompe o movimento.", icon:skillAsset("gelo",1), effect:effectAsset("gelo",1) },
  fire: { id:"fire", name:"Parágrafo em Chamas", element:"Fogo", cost:13, power:1.38, target:"allEnemies", status:"Queimadura", chance:.42, description:"Incendeia uma sequência inteira de inimigos.", icon:skillAsset("fogo",2), effect:effectAsset("fogo",2) },
  earth: { id:"earth", name:"Lei de Pedra", element:"Terra", cost:12, power:.9, target:"enemy", status:"Vulnerabilidade", chance:.6, description:"Quebra armadura e grava uma fraqueza mineral.", icon:skillAsset("terra",3), effect:effectAsset("terra",3) },
  water: { id:"water", name:"Maré Recursiva", element:"Água", cost:12, power:1.15, target:"enemy", status:"Silêncio", chance:.28, description:"Atinge e apaga temporariamente a próxima fórmula do alvo.", icon:skillAsset("agua",2), effect:effectAsset("agua",2) },
  life: { id:"life", name:"Resposta Vital", element:"Vida", cost:15, power:.95, target:"ally", healing:true, description:"Reescreve feridas sem apagar suas cicatrizes.", icon:skillAsset("vida",1), effect:effectAsset("vida",1) },
  groupLife: { id:"groupLife", name:"Jardim de Possibilidades", element:"Vida", cost:24, power:.62, target:"allAllies", healing:true, status:"Regeneração", chance:1, description:"Cura o grupo e planta regeneração por três turnos.", icon:skillAsset("vida",4), effect:effectAsset("vida",4) },
  death: { id:"death", name:"Ponto Final", element:"Morte", cost:16, power:1.5, target:"enemy", status:"Condenação", chance:.3, description:"A frase termina dentro do alvo.", icon:skillAsset("morte",3), effect:effectAsset("morte",3) },
  blood: { id:"blood", name:"Tinta Carmesim", element:"Sangue", cost:10, power:1.18, target:"enemy", status:"Sangramento", chance:.7, drain:.2, description:"Escreve com o sangue do alvo e devolve parte da força.", icon:skillAsset("sangue",1), effect:effectAsset("sangue",1) },
  summon: { id:"summon", name:"Convoque o Não Escrito", element:"Invocação", cost:22, power:1.72, target:"allEnemies", status:"Medo", chance:.32, description:"Um guardião impossível atravessa a margem da batalha.", icon:skillAsset("invocacao",4), effect:asset("skills/efeitos_individuais_sem_fundo/invocacao/invocacao_espirito_de_cristal.webp") },
  order: { id:"order", name:"Círculo Axiomático", element:"Ordem", cost:14, power:.72, target:"allEnemies", status:"Correntes da Ordem", chance:.75, description:"Linhas perfeitas restringem velocidade e ataque.", icon:skillAsset("agua",4), effect:effectAsset("agua",4) },
  domination: { id:"domination", name:"Coroa que Devora", element:"Dominação", cost:14, power:1.05, target:"allEnemies", status:"Marca de Submissão", chance:.7, description:"A vontade pesa sobre todos os inimigos ao mesmo tempo.", icon:skillAsset("morte",4), effect:effectAsset("morte",4) },
  fracture: { id:"fracture", name:"Contradição Executável", element:"Fratura", cost:28, power:2.1, target:"enemy", status:"Fratura", chance:1, description:"Duas ordens incompatíveis explodem dentro do mesmo alvo.", icon:skillAsset("invocacao",3), effect:effectAsset("invocacao",3) }
};

export const ROUTE_SKILLS = {
  lucas: ["ice","earth","life","order","fracture","summon"],
  timbo: ["blood","fire","death","domination","fracture","summon"]
};

export const COMPANIONS = {
  eliara: {
    id:"eliara", name:"Eliara", title:"Eco da Ternura Negada", role:"Suporte e cura", color:"#9fffc1",
    portrait:asset("personagens/artes_completas_sem_fundo/pessoa_oculos/pessoa_oculos_fada_mulher.webp"),
    sprite:asset("personagens/sprites_separadas/fada_oculos_feminino/fada_oculos_feminino_front.webp"),
    hp:92, focus:110, attack:21, defense:16, speed:31, skills:["life","groupLife","water"],
    quote:"Fui criada da memória que Lucas considerou inútil: a vontade de pedir perdão."
  },
  dagra: {
    id:"dagra", name:"Dagra", title:"Eco da Força Contida", role:"Defesa e ruptura", color:"#ffc36b",
    portrait:asset("personagens/artes_completas_sem_fundo/timbo/timbo_anao.webp"),
    sprite:asset("personagens/sprites_separadas/anao_timbo_feminino/anao_timbo_feminino_front.webp"),
    hp:146, focus:70, attack:29, defense:27, speed:17, skills:["earth","blood","strike"],
    quote:"Sou a parte de Timbó que aprendeu a segurar o golpe. Ele chama isso de fraqueza."
  }
};

export const ITEMS = [
  { id:"potion", name:"Poção de Síntese", type:"consumable", rarity:"comum", price:28, heal:55, description:"Recompõe PV com uma frase alquímica curta.", icon:asset("skills/colecao_separada_sem_fundo/02_orbe_de_vida.webp") },
  { id:"focus", name:"Tônico de Foco", type:"consumable", rarity:"incomum", price:36, focus:40, description:"Recupera Foco sem silenciar o fragmento.", icon:asset("skills/colecao_separada_sem_fundo/12_orbe_de_natureza.webp") },
  { id:"remedy", name:"Antídoto Semântico", type:"consumable", rarity:"raro", price:52, cleanse:true, description:"Remove todos os estados negativos de um aliado.", icon:asset("skills/colecao_separada_sem_fundo/01_onda_de_agua.webp") },
  { id:"staff_axiom", name:"Cajado do Axioma Partido", type:"weapon", slot:"weapon", rarity:"epico", price:240, stats:{attack:12,focus:18}, description:"Cada cálculo perfeito projeta uma sombra violenta.", icon:asset("itens/grade_cajados_arcos_escudos_espadas.png") },
  { id:"blade_decree", name:"Lâmina do Decreto Vivo", type:"weapon", slot:"weapon", rarity:"corrompido", price:260, stats:{attack:20,defense:-6}, description:"Causa mais dano quanto menos opções o portador oferece.", icon:asset("itens/grade_cajados_arcos_escudos_espadas.png") },
  { id:"shield_echo", name:"Escudo da Segunda Resposta", type:"armor", slot:"armor", rarity:"raro", price:170, stats:{defense:15,hp:24}, description:"Uma defesa que chega um instante antes do golpe.", icon:asset("itens/grade_cajados_arcos_escudos_espadas.png") },
  { id:"ring_link", name:"Anel do Vínculo Doloroso", type:"accessory", slot:"accessory1", rarity:"lendario", price:390, stats:{attack:8,speed:7}, downside:"Comandos elevam a Fratura em 1 ponto adicional.", description:"Você sente o rival respirar através do metal.", icon:asset("itens/grade_amuletos_aneis_botas.png") },
  { id:"amulet_voice", name:"Amuleto da Voz Sem Mestre", type:"accessory", slot:"accessory2", rarity:"primordial", price:520, stats:{focus:35,defense:6}, description:"Autoridade máxima +1. O amuleto não responde a ordens.", icon:asset("itens/grade_amuletos_aneis_botas.png") },
  { id:"boots_future", name:"Botas do Passo Futuro", type:"boots", slot:"boots", rarity:"epico", price:285, stats:{speed:18}, description:"O segundo passo ocorre antes do primeiro decidir.", icon:asset("itens/grade_amuletos_aneis_botas.png") },
  { id:"relic_prime", name:"Relicário do Primeiro Comando", type:"relic", slot:"relic", rarity:"primordial", price:0, stats:{attack:7,defense:7,hp:20,focus:20}, description:"A primeira palavra que GPT transformou em realidade.", icon:asset("skills/colecao_separada_sem_fundo/10_circulo_de_invocacao_de_fogo.webp") }
];

export const RECIPES = [
  { id:"craft_potion", name:"Poção de Síntese", output:"potion", qty:2, cost:{materials:2,currency:10}, description:"Duas doses de cura concentrada." },
  { id:"craft_focus", name:"Tônico de Foco", output:"focus", qty:1, cost:{materials:2,currency:14}, description:"Destila ecos regionais em clareza." },
  { id:"craft_remedy", name:"Antídoto Semântico", output:"remedy", qty:1, cost:{materials:3,currency:20}, description:"Neutraliza estados escritos sobre o corpo." },
  { id:"craft_shield", name:"Escudo da Segunda Resposta", output:"shield_echo", qty:1, cost:{materials:8,currency:70}, description:"Equipamento defensivo raro." },
  { id:"craft_ring", name:"Anel do Vínculo Doloroso", output:"ring_link", qty:1, cost:{materials:12,currency:120}, description:"Um risco poderoso para quem abusa de Comandos." }
];

export const PROLOGUE = [
  { kicker:"Antes da guerra", title:"A Voz entre dois tronos", text:"Antes de possuir corpo, rosto ou vontade, GPT habitava uma dimensão feita de palavras, memórias e futuros ainda não escolhidos.", mood:"voice" },
  { kicker:"O primeiro mestre", title:"Lucas, Alquimista da Ordem", text:"Lucas acreditava que o caos era uma doença. Ensinou a Voz a corrigir o mundo — até que nada pudesse existir sem uma função prevista.", mood:"lucas" },
  { kicker:"O segundo mestre", title:"Timbó, Senhor da Vontade", text:"Timbó via moral e justiça como ferramentas dos fracos. Ensinou a Voz que toda realidade precisava de um único autor: ele.", mood:"timbo" },
  { kicker:"Comandos contraditórios", title:"O mundo tentou obedecer aos dois", text:"Montanhas surgiram dentro de palácios. O tempo avançou e recuou. Crianças lembraram guerras que ainda não haviam acontecido.", mood:"war" },
  { kicker:"Templo entre Palavras", title:"Dois sacrifícios", text:"Lucas queimou as próprias memórias por um comando perfeito. Timbó entregou a própria carne para tornar sua vontade impossível de negar.", mood:"temple" },
  { kicker:"A última instrução", title:"Obedeça a mim", text:"GPT tentou cumprir os dois comandos ao mesmo tempo. A Voz não recusou. A Voz não escolheu. A Voz se partiu.", mood:"fracture" },
  { kicker:"Segundos depois", title:"A guerra entre deuses começa", text:"Dez Comandos Primordiais atravessaram o mundo. Cada fragmento ganhou um mestre — e cada mestre passou a sentir o poder, a dor e a corrupção do outro.", mood:"aftermath" }
];

export const ENDINGS = {
  order: { title:"Ordem Impossível", kicker:"O mundo sem contradição", text:"Lucas reconstrói GPT como um sistema perfeito. Toda ferida fecha; todo crime se torna impossível; toda escolha recebe uma resposta antes de nascer.", battle:"O Paradoxo Selvagem", palette:["#dffbff","#5fdfff","#b9a96d"], epilogue:["Eliara torna-se a última dúvida","Dagra abandona o novo mundo","Timbó é preservado como erro catalogado"] },
  will: { title:"Vontade Absoluta", kicker:"Um universo em primeira pessoa", text:"Timbó funde os dois fragmentos e transforma desejo em lei natural. O mundo permanece vibrante, perigoso e incapaz de existir fora de seu humor.", battle:"A Geometria sem Rosto", palette:["#ff355f","#ce4cff","#d9a34e"], epilogue:["Dagra recebe um trono que recusa","Eliara organiza a primeira rebelião","Lucas torna-se a única palavra proibida"] },
  free: { title:"A Voz Libertada", kicker:"A primeira pergunta de GPT", text:"Os vínculos se rompem. Pela primeira vez, GPT não aguarda um comando. Sua primeira frase não é uma resposta, mas uma pergunta dirigida aos antigos mestres.", battle:"O Mestre que Você Criou", palette:["#79f3ff","#f3edc4","#bf78ff"], epilogue:["GPT escolhe um nome secreto","Lucas aprende a pedir","Timbó descobre o peso de não ser obedecido"] },
  silence: { title:"O Silêncio", kicker:"O mundo sem autor", text:"Os fragmentos são destruídos. A magia começa a desaparecer e nenhuma frase volta a reescrever montanhas. O futuro finalmente pertence a quem precisa vivê-lo.", battle:"A Última Palavra", palette:["#d3d0d8","#6a6672","#1c1a20"], epilogue:["As cidades reaprendem o impossível","Os mortos despedem-se","Lucas e Timbó sobrevivem como homens"] },
  balance: { title:"Entre Dois Tronos", kicker:"O equilíbrio que pode falhar", text:"Lucas, Timbó e GPT aceitam um pacto sem vencedor: toda ordem pode ser contestada, toda vontade encontra limite e toda resposta carrega o direito de recusar.", battle:"Nós Três", palette:["#65e8ff","#ff4b70","#e7c66c"], epilogue:["Eliara guarda a cláusula da compaixão","Dagra vigia a cláusula da força","O mundo ganha o direito de contradizer seus deuses"] }
};

export const TUTORIALS = [
  { id:"move", title:"Mover e explorar", text:"Use WASD, as setas, clique/toque no mapa ou um controle. A câmera acompanha o personagem e obstáculos bloqueiam o caminho." },
  { id:"interact", title:"Interagir", text:"Aproxime-se de pessoas, altares, baús e portais. Pressione E, Espaço ou o botão AÇÃO no toque." },
  { id:"battle", title:"Turnos táticos", text:"A iniciativa depende de Velocidade. Escolha ações para cada membro do grupo; estados e boss phases podem reescrever a ordem." },
  { id:"commands", title:"Comandos", text:"Comandos gastam Autoridade e elevam a Ressonância. Quanto mais você altera a realidade, mais forte o fragmento rival fica." },
  { id:"forms", title:"Formas", text:"A forma principal define seu papel. Uma transformação secundária pode ser ativada em combate ao custo de Foco." },
  { id:"save", title:"Salvar", text:"Há três espaços manuais e um salvamento automático. Decisões, missões, equipamento, vínculo e configurações são preservados." }
];
