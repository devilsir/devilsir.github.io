(function () {
  "use strict";
  const exact = {
  "New Game": "Novo jogo",
  "Continue": "Continuar",
  "Settings": "Configurações",
  "Credits": "Créditos",
  "Back": "Voltar",
  "Close": "Fechar",
  "Cancel": "Cancelar",
  "Return": "Voltar",
  "Buy": "Comprar",
  "Sell": "Vender",
  "Use": "Usar",
  "Equip": "Equipar",
  "Equipped": "Equipado",
  "Unlock": "Desbloquear",
  "Lock": "Bloquear",
  "Favorite": "Favoritar",
  "Unfavorite": "Remover dos favoritos",
  "Empty": "Vazio",
  "Unknown": "Desconhecido",
  "More": "Mais",
  "Max": "Máx.",
  "Begin": "Começar",
  "End": "Fim",
  "Collect": "Coletar",
  "Train": "Treinar",
  "Upgrade": "Melhorar",
  "Dismantle": "Desmontar",
  "Craft": "Fabricar",
  "Claim Reward": "Resgatar recompensa",
  "Completed": "Concluída",
  "Claimed Today": "Resgatada hoje",
  "CLEARED": "CONCLUÍDO",
  "LOCKED": "BLOQUEADO",
  "OPEN": "ABERTO",
  "WIN": "VITÓRIA",
  "LOSS": "DERROTA",
  "Victory": "Vitória",
  "Defeat": "Derrota",
  "Enemy": "Inimigo",
  "Player": "Jogador",
  "Your move": "Sua jogada",
  "Unknown Entity": "Entidade desconhecida",
  "Unknown Witness": "Testemunha desconhecida",
  "Overview": "Visão geral",
  "Character": "Personagem",
  "Hunt": "Caçada",
  "City": "Cidade",
  "Arena": "Arena",
  "Missions": "Missões",
  "Inventory": "Inventário",
  "Merchant": "Mercador",
  "Hideout": "Refúgio",
  "Clan": "Clã",
  "Bestiary": "Bestiário",
  "Achievements": "Conquistas",
  "Ranking": "Ranking",
  "Messages": "Mensagens",
  "Home": "Início",
  "Gear": "Equipamento",
  "Rewards": "Recompensas",
  "Known Threats": "Ameaças conhecidas",
  "Known Abilities": "Habilidades conhecidas",
  "Weaknesses": "Fraquezas",
  "Resistances": "Resistências",
  "Possible Drops": "Possíveis recompensas",
  "Exclusive Loot": "Recompensa exclusiva",
  "Regional Boss": "Chefe regional",
  "Discoverable Secret": "Segredo descobrível",
  "Still hidden": "Ainda oculto",
  "Temporary Boon": "Bônus temporário",
  "No active temporary boon": "Nenhum bônus temporário ativo",
  "Weapon": "Arma",
  "Secondary Weapon": "Arma secundária",
  "Head": "Cabeça",
  "Chest": "Torso",
  "Hands": "Mãos",
  "Legs": "Pernas",
  "Feet": "Pés",
  "Amulet": "Amuleto",
  "Ring 1": "Anel 1",
  "Ring 2": "Anel 2",
  "Relic": "Relíquia",
  "Consumable": "Consumível",
  "Regional equipment": "Equipamento regional",
  "Common": "Comum",
  "Uncommon": "Incomum",
  "Rare": "Raro",
  "Epic": "Épico",
  "Legendary": "Lendário",
  "Mythic": "Mítico",
  "Cursed": "Amaldiçoado",
  "Strength": "Força",
  "Dexterity": "Destreza",
  "Defense": "Defesa",
  "Endurance": "Resistência",
  "Perception": "Percepção",
  "Presence": "Presença",
  "Luck": "Sorte",
  "Damage": "Dano",
  "Armor": "Armadura",
  "Accuracy": "Precisão",
  "Evasion": "Esquiva",
  "Initiative": "Iniciativa",
  "Maximum Health": "Vida máxima",
  "Regeneration": "Regeneração",
  "Critical Chance": "Chance crítica",
  "Critical Damage": "Dano crítico",
  "Block Chance": "Chance de bloqueio",
  "Resource Gain": "Ganho de recurso",
  "Faction Power": "Poder da facção",
  "Skin / fur": "Pele / pelagem",
  "Skin / fur tone": "Tom de pele / pelagem",
  "Hair / fur style": "Estilo de cabelo / pelagem",
  "Hair / fur color": "Cor do cabelo / pelagem",
  "Feral Crown": "Coroa Feral",
  "War Braids": "Tranças de Guerra",
  "Razor Crop": "Corte Navalha",
  "Cathedral Crest": "Crista de Catedral",
  "Velvet Lengths": "Longo de Veludo",
  "Ritual Shave": "Raspado Ritual",
  "Reliquary Knots": "Nós de Relicário",
  "Moon Mane": "Juba Lunar",
  "Noble Sweep": "Caimento Nobre",
  "Ash Stubble": "Barba Rala de Cinza",
  "Dagger Goatee": "Cavanhaque Adaga",
  "Court Beard": "Barba da Corte",
  "Chain Braids": "Tranças de Corrente",
  "Imperial Fang": "Presa Imperial",
  "Feral Ruff": "Juba Feral",
  "Moon Braids": "Tranças Lunares",
  "Eye color": "Cor dos olhos",
  "Eye radiance": "Brilho dos olhos",
  "Scars / markings": "Cicatrizes / marcas",
  "Scars and markings": "Cicatrizes e marcas",
  "Base outfit": "Traje base",
  "Mantle / cloak": "Manto / capa",
  "Heirloom": "Relíquia de família",
  "Heirloom accessory": "Acessório de família",
  "Metal finish": "Acabamento metálico",
  "Ritual color": "Cor ritual",
  "Origin scenery": "Cenário de origem",
  "Origin": "Origem",
  "Specialization": "Especialização",
  "Randomize appearance": "Sortear aparência",
  "A new silhouette answers the night.": "Uma nova silhueta responde à noite.",
  "Bloodline regalia restored.": "A indumentária da linhagem foi restaurada.",
  "A name is required before the night accepts you.": "Você precisa escolher um nome antes que a noite aceite você.",
  "Seal the Bloodline": "Selar a linhagem",
  "I am certain": "Tenho certeza",
  "Unnamed Scion": "Herdeiro sem nome",
  "◉ Full figure": "◉ Corpo inteiro",
  "◎ Portrait focus": "◎ Foco no retrato",
  "Your bloodline, immediate objectives and the living state of the night.": "Sua linhagem, objetivos imediatos e o estado vivo da noite.",
  "Refine your living portrait, train attributes, inspect combat values and build an active ability loadout.": "Refine seu retrato vivo, treine atributos, confira valores de combate e monte um conjunto ativo de habilidades.",
  "Spend energy to explore regions, trigger branching events, discover secrets and enter tactical combat.": "Gaste energia para explorar regiões, ativar eventos com escolhas, descobrir segredos e entrar em combates táticos.",
  "Advance the campaign, craft equipment and visit the districts that connect every system.": "Avance na campanha, fabrique equipamentos e visite os distritos que conectam todos os sistemas.",
  "Challenge simulated rival characters generated from the opposing bloodline. They are inhabitants of this offline chronicle, not online players.": "Desafie rivais simulados da linhagem oposta. Eles fazem parte desta crônica offline e não são jogadores reais.",
  "Track tutorial, story, faction, daily, clan and long-form objectives. Progress updates across every connected system.": "Acompanhe objetivos de tutorial, história, facção, diários, de clã e de longo prazo. O progresso é atualizado em todos os sistemas conectados.",
  "Compare, equip, lock, favorite, sell, dismantle and use every item. Equipment visibly changes the character portrait.": "Compare, equipe, bloqueie, favorite, venda, desmonte e use cada item. Os equipamentos alteram visivelmente o retrato do personagem.",
  "Buy, sell and compare rotating stock.": "Compre, venda e compare o estoque rotativo.",
  "Upgrade structures to improve energy, storage, merchant prices, training, loot, crafting and mission capacity.": "Melhore estruturas para ampliar energia, armazenamento, preços, treinamento, recompensas, fabricação e capacidade de missões.",
  "Create a faction clan, recruit authored NPC companions and build a shared fortress.": "Crie um clã de facção, recrute companheiros NPC e construa uma fortaleza compartilhada.",
  "Defeated creatures reveal weaknesses, resistances, abilities, drops and Hollow Eclipse lore.": "Criaturas derrotadas revelam fraquezas, resistências, habilidades, recompensas e histórias do Eclipse Oco.",
  "Fifty-four achievements reward combat, exploration, collection, progression, Arena, story, clan, secrets and faction mastery.": "Cinquenta e quatro conquistas recompensam combate, exploração, coleção, progressão, Arena, história, clã, segredos e domínio de facção.",
  "Generated rivals evolve with your progression. Your character is always highlighted inside the simulated world ranking.": "Os rivais gerados evoluem com seu progresso. Seu personagem aparece sempre destacado no ranking simulado do mundo.",
  "Story contacts, faction allies and rival characters send authored messages as the campaign evolves.": "Contatos da história, aliados de facção e rivais enviam mensagens conforme a campanha evolui.",
  "Tune audio, animation, accessibility, combat behavior and local save management.": "Ajuste áudio, animação, acessibilidade, comportamento de combate e gerenciamento dos salvamentos locais.",
  "Basic Attack": "Ataque básico",
  "Heavy Attack": "Ataque pesado",
  "Determine initiative": "Determinar iniciativa",
  "Attempt to escape": "Tentar escapar",
  "Cannot flee this encounter": "Não é possível fugir deste encontro",
  "Retreat failed.": "A fuga falhou.",
  "Retreated": "Retirada",
  "You escaped the encounter.": "Você escapou do encontro.",
  "You vanish into the night.": "Você desaparece na noite.",
  "Begin combat in automatic mode": "Iniciar combate no modo automático",
  "Skip combat animation": "Pular animação de combate",
  "Resolve actions immediately": "Resolver ações imediatamente",
  "Auto-battle default": "Combate automático por padrão",
  "Transform at maximum resource": "Transforme-se com o recurso no máximo",
  "Gain tactical bloodline power": "Obtenha poder tático da linhagem",
  "Choose attacks, defense, abilities and faction power.": "Escolha ataques, defesa, habilidades e o poder da facção.",
  "Spend energy in Blackthorn Village and resolve an event.": "Gaste energia na Vila Blackthorn e resolva um evento.",
  "Inspect loot in Inventory and equip it.": "Confira as recompensas no Inventário e equipe um item.",
  "Upgrade an attribute and claim tutorial missions.": "Melhore um atributo e resgate as missões do tutorial.",
  "1. Hunt": "1. Caçar",
  "2. Fight": "2. Lutar",
  "3. Equip": "3. Equipar",
  "4. Grow": "4. Evoluir",
  "NIGHT HUNT": "CAÇADA NOTURNA",
  "ARENA DUEL": "DUELO DE ARENA",
  "STORY ENCOUNTER": "ENCONTRO DA HISTÓRIA",
  "Hunt Complete": "Caçada concluída",
  "Hunt Energy": "Energia de caçada",
  "Quick Hunt": "Caçada rápida",
  "Careful Hunt": "Caçada cautelosa",
  "Dangerous Hunt": "Caçada perigosa",
  "A short pursuit with steady rewards.": "Uma perseguição curta com recompensas consistentes.",
  "Lower risk and improved event choices.": "Menor risco e melhores opções nos eventos.",
  "Hard enemies and significantly better loot.": "Inimigos difíceis e recompensas muito melhores.",
  "Fewer battles, more materials and secrets.": "Menos batalhas, mais materiais e segredos.",
  "Find elite creatures and regional bosses.": "Encontre criaturas de elite e chefes regionais.",
  "Follow the scent": "Seguir o rastro",
  "Search for Treasure": "Procurar tesouros",
  "Track a Monster": "Rastrear um monstro",
  "Challenge a rival character.": "Desafie um personagem rival.",
  "Find equipment": "Encontrar equipamento",
  "Complete two hunts": "Concluir duas caçadas",
  "Complete your first Blackthorn hunt": "Concluir sua primeira caçada em Blackthorn",
  "Win an Arena battle": "Vencer uma batalha na Arena",
  "Win faction battles": "Vencer batalhas de facção",
  "Earn equipment, experience and reveal your first event.": "Ganhe equipamento e experiência e revele seu primeiro evento.",
  "Bleeding": "Sangramento",
  "Poisoned": "Envenenado",
  "Burning": "Em chamas",
  "Stunned": "Atordoado",
  "Weakened": "Enfraquecido",
  "Marked": "Marcado",
  "Frightened": "Amedrontado",
  "Regenerating": "Regenerando",
  "Shielded": "Protegido",
  "Enraged": "Furioso",
  "Concealed": "Oculto",
  "Moon Blessed": "Abençoado pela Lua",
  "Blood Frenzy": "Frenesi de Sangue",
  "Loses health each turn.": "Perde vida a cada turno.",
  "Takes escalating damage.": "Sofre dano crescente.",
  "Takes fire damage each turn.": "Sofre dano de fogo a cada turno.",
  "Loses the next action.": "Perde a próxima ação.",
  "Deals reduced damage.": "Causa dano reduzido.",
  "More likely to be critically hit.": "Tem mais chance de sofrer um acerto crítico.",
  "Accuracy and initiative reduced.": "Precisão e iniciativa reduzidas.",
  "Restores health each turn.": "Restaura vida a cada turno.",
  "Reduces incoming damage.": "Reduz o dano recebido.",
  "Deals increased damage.": "Causa dano aumentado.",
  "Greatly increases evasion.": "Aumenta muito a esquiva.",
  "Healing is reduced.": "A cura é reduzida.",
  "Improved Moonborn power.": "Poder Moonborn aprimorado.",
  "Improved Bloodbound drain.": "Drenagem Bloodbound aprimorada.",
  "Telegraphed attacks": "Ataques previsíveis",
  "Control": "Controle",
  "Not enough gold.": "Ouro insuficiente.",
  "Not enough Hunt Energy.": "Energia de caçada insuficiente.",
  "Missing materials.": "Faltam materiais.",
  "No restorative item available.": "Nenhum item restaurador disponível.",
  "Your bloodline rejects this item.": "Sua linhagem rejeita este item.",
  "Unequip an ability first.": "Desequipe uma habilidade primeiro.",
  "Chronicle saved.": "Crônica salva.",
  "Chronicle exported.": "Crônica exportada.",
  "Chronicle imported safely.": "Crônica importada com segurança.",
  "The chronicle could not be saved.": "Não foi possível salvar a crônica.",
  "This save file is invalid or corrupted.": "Este arquivo de salvamento é inválido ou está corrompido.",
  "No valid chronicle was found.": "Nenhuma crônica válida foi encontrada.",
  "Save Slots": "Espaços de salvamento",
  "Erase Save": "Apagar salvamento",
  "Erase the Chronicle?": "Apagar a crônica?",
  "The active chronicle was erased.": "A crônica ativa foi apagada.",
  "Automatic saving": "Salvamento automático",
  "Save the chronicle every few seconds": "Salvar a crônica a cada poucos segundos",
  "Audio unavailable": "Áudio indisponível",
  "Mute": "Silenciar",
  "Silence all generated audio": "Silenciar todo o áudio gerado",
  "Reduced motion": "Movimento reduzido",
  "Minimize parallax and animation": "Reduzir paralaxe e animações",
  "High contrast": "Alto contraste",
  "Strengthen borders and text contrast": "Reforçar bordas e contraste do texto",
  "Screen shake": "Tremor de tela",
  "Impact feedback during critical hits": "Impacto visual em acertos críticos",
  "Damage numbers": "Números de dano",
  "Show floating combat values": "Exibir valores flutuantes de combate",
  "Tutorial guidance": "Orientações do tutorial",
  "Show contextual guidance during play": "Exibir orientações contextuais durante o jogo",
  "Opening Settings": "Configurações iniciais",
  "Grid view": "Visualização em grade",
  "List view": "Visualização em lista",
  "Search items": "Buscar itens",
  "Lithe": "Esbelto",
  "Lean": "Longilíneo",
  "Athletic": "Atlético",
  "Powerful": "Musculoso",
  "Broad": "Robusto",
  "Regal": "Imponente",
  "Scarred": "Cicatrizado",
  "Severe": "Austero",
  "Young": "Jovem",
  "Ancient": "Ancestral",
  "Masked": "Mascarado",
  "Noble": "Nobre",
  "Feral": "Feral",
  "Hollowed": "Esvaído",
  "Wild": "Selvagem",
  "Braided": "Trançado",
  "Cropped": "Curto",
  "Crested": "Com crista",
  "Long": "Longo",
  "Shorn": "Raspado",
  "Ritual Knots": "Nós rituais",
  "Moon Mane": "Juba lunar",
  "Swept": "Penteado para trás",
  "Ash": "Cinza",
  "Umber": "Terra escura",
  "Pale": "Pálido",
  "Onyx": "Ônix",
  "Russet": "Avermelhado",
  "Silver": "Prateado",
  "Sable": "Ébano",
  "Alabaster": "Alabastro",
  "Amber": "Âmbar",
  "Crimson": "Carmesim",
  "Ice": "Gelo",
  "Violet": "Violeta",
  "Emerald": "Esmeralda",
  "White": "Branco",
  "Gold": "Dourado",
  "Moonstone": "Pedra da lua",
  "Dormant": "Adormecido",
  "Gleaming": "Cintilante",
  "Radiant": "Radiante",
  "Eclipse": "Eclipse",
  "Raven": "Corvo",
  "Ashen": "Cinzento",
  "Blood": "Sangue",
  "Moonlight": "Luar",
  "Obsidian": "Obsidiana",
  "None": "Nenhum",
  "Moon Sigil": "Sigilo lunar",
  "Blood Sigil": "Sigilo de sangue",
  "Ritual Runes": "Runas rituais",
  "Claw Marks": "Marcas de garras",
  "Eclipse Cracks": "Fissuras do eclipse",
  "War Paint": "Pintura de guerra",
  "Silver Brands": "Marcas de prata",
  "Constellation": "Constelação",
  "Wanderer": "Errante",
  "Warplate": "Armadura de guerra",
  "Hunter": "Caçador",
  "Ritualist": "Ritualista",
  "Warden": "Guardião",
  "Bloodweave": "Trama de sangue",
  "Moonhide": "Couro lunar",
  "Silver Reliquary": "Relicário de prata",
  "Night Corsair": "Corsário noturno",
  "Tattered Mantle": "Manto esfarrapado",
  "Wolf Pelt": "Pele de lobo",
  "Crimson Court": "Corte carmesim",
  "Grave Shroud": "Mortalha sepulcral",
  "Moon Veil": "Véu lunar",
  "Bone Mantle": "Manto de ossos",
  "Eclipse Mantle": "Manto do eclipse",
  "Moonstone Torque": "Torques de pedra da lua",
  "Bone Charms": "Amuletos de osso",
  "Silver Ear Cuffs": "Brincos de prata",
  "Blood Crystal Earrings": "Brincos de cristal de sangue",
  "Ritual Veil": "Véu ritual",
  "Trophy Fangs": "Presas-troféu",
  "Raven Feather": "Pena de corvo",
  "Chain Halo": "Halo de correntes",
  "Reliquary Brooch": "Broche relicário",
  "Thorn Crown": "Coroa de espinhos",
  "Blackened Silver": "Prata enegrecida",
  "Grave Iron": "Ferro sepulcral",
  "Moon Silver": "Prata lunar",
  "Blood Bronze": "Bronze de sangue",
  "Ancient Gold": "Ouro ancestral",
  "Night Blue": "Azul noturno",
  "Bone": "Osso",
  "Moss": "Musgo",
  "Ember": "Brasa",
  "Teal": "Azul-petróleo",
  "Sentinel": "Sentinela",
  "Prowler": "Predador",
  "Sovereign": "Soberano",
  "Ritual": "Ritual",
  "Exile": "Exilado",
  "Survivor": "Sobrevivente",
  "Acolyte": "Acólito",
  "Outrider": "Batedor",
  "Heir": "Herdeiro",
  "Bell Warden": "Guardião dos Sinos",
  "Grave Pilgrim": "Peregrino dos Túmulos",
  "Rift Touched": "Tocado pela Fenda",
  "Rage": "Fúria",
  "Primal Form": "Forma Primal",
  "Crimson Ascendance": "Ascensão Carmesim",
  "Ravager": "Devastador",
  "Reaper": "Ceifador",
  "Shadow": "Sombra",
  "Stalker": "Espreitador",
  "Born beneath the first broken moon, the Moonborn survive through instinct, territory and the fierce memory carried in bone. Rage is not madness—it is an ancestral chorus.": "Nascidos sob a primeira lua partida, os Moonborn sobrevivem pelo instinto, pelo território e pela memória feroz gravada nos ossos. A Fúria não é loucura — é um coro ancestral.",
  "Critical hits and received damage generate additional Rage.": "Acertos críticos e dano recebido geram Fúria adicional.",
  "A brutal striker built around physical damage, critical attacks and escalating Rage.": "Um combatente brutal focado em dano físico, ataques críticos e Fúria crescente.",
  "A resilient guardian specializing in armor, regeneration, blocks and savage counterattacks.": "Um guardião resistente especializado em armadura, regeneração, bloqueios e contra-ataques selvagens.",
  "A relentless tracker with superior speed, evasion, accuracy and ambush pressure.": "Um rastreador implacável com velocidade, esquiva, precisão e pressão de emboscada superiores.",
  "The Bloodbound preserve empires through influence, ritual and hunger refined into art. Every drop of blood contains memory, and every memory may be commanded.": "Os Bloodbound preservam impérios por meio da influência, do ritual e de uma fome refinada em arte. Cada gota de sangue guarda uma memória, e toda memória pode ser comandada.",
  "Successful attacks, bleeding and defeated living enemies generate Blood.": "Ataques bem-sucedidos, sangramentos e inimigos vivos derrotados geram Sangue.",
  "A predatory duelist using direct damage, bleeding and ruthless life drain.": "Um duelista predatório que usa dano direto, sangramento e drenagem de vida impiedosa.",
  "A controller who excels at influence, gold, resource denial and defensive manipulation.": "Um controlador especialista em influência, ouro, negação de recursos e manipulação defensiva.",
  "An evasive assassin built around poison, concealment, initiative and precision.": "Um assassino evasivo focado em veneno, ocultação, iniciativa e precisão.",
  "Blackthorn Village": "Vila Blackthorn",
  "Ashen Forest": "Floresta Cinzenta",
  "The Abandoned Railway": "A Ferrovia Abandonada",
  "Bloodmarket District": "Distrito do Mercado de Sangue",
  "Hollowgrave Cemetery": "Cemitério Hollowgrave",
  "Silvermine Pass": "Passagem da Mina de Prata",
  "Crimson Harbor": "Porto Carmesim",
  "Moonfall Mountains": "Montanhas da Queda Lunar",
  "The Cursed Capital": "A Capital Amaldiçoada",
  "The Ancient Rift": "A Fenda Ancestral",
  "The Silver Inquisitor": "O Inquisidor de Prata",
  "Mother Hollow": "Mãe Oca",
  "The Bone Collector": "O Coletor de Ossos",
  "The Veiled Broker": "O Corretor Velado",
  "Saint Vesper": "Santo Vesper",
  "The Argent Widow": "A Viúva Argêntea",
  "The Red Harbor Butcher": "O Açougueiro do Porto Vermelho",
  "The Moon-Eater": "O Devorador da Lua",
  "Queen Without a Face": "A Rainha sem Rosto",
  "The Eclipse Heart": "O Coração do Eclipse",
  "A rain-soaked village where bells ring without hands and every locked door hides a witness.": "Uma vila encharcada pela chuva, onde sinos tocam sem mãos e cada porta trancada esconde uma testemunha.",
  "Charred trees whisper names stolen from travelers. Pale roots crawl beneath the ash.": "Árvores carbonizadas sussurram nomes roubados de viajantes. Raízes pálidas rastejam sob as cinzas.",
  "A dead railway carries phantom cargo through tunnels that were never excavated.": "Uma ferrovia morta transporta cargas fantasmagóricas por túneis que nunca foram escavados.",
  "Masks, favors and bottled memories are sold beneath red lanterns.": "Máscaras, favores e memórias engarrafadas são vendidos sob lanternas vermelhas.",
  "Graves open inward here. The dead fear something below them.": "Aqui, as covas se abrem para dentro. Os mortos temem algo abaixo deles.",
  "A frozen pass cut through silver veins and guarded by oath-bound hunters.": "Uma passagem congelada aberta entre veios de prata e guardada por caçadores presos a juramentos.",
  "Black ships arrive without crews, loaded with coffins and salt-stained chains.": "Navios negros chegam sem tripulação, carregados de caixões e correntes manchadas de sal.",
  "The moon appears fractured above peaks where ancient beasts still dream.": "A lua parece fraturada sobre picos onde feras ancestrais ainda sonham.",
  "An abandoned capital rehearses court life for an audience of ghosts.": "Uma capital abandonada ensaia a vida da corte para uma plateia de fantasmas.",
  "Reality folds around the wound where the third force waits beyond form and hunger.": "A realidade se dobra ao redor da ferida onde a terceira força espera além da forma e da fome.",
  "Bellkeeper’s cipher": "Cifra do guardião dos sinos",
  "The antler shrine": "O santuário dos chifres",
  "Carriage thirteen": "Vagão treze",
  "The silent auction": "O leilão silencioso",
  "Vesper’s true epitaph": "O verdadeiro epitáfio de Vesper",
  "The moonstone seam": "O veio de pedra da lua",
  "The drowned ledger": "O livro-caixa afogado",
  "First fang of winter": "A primeira presa do inverno",
  "The hollow throne": "O trono oco",
  "The name before night": "O nome anterior à noite",
  "Bells Beneath Blackthorn": "Sinos Sob Blackthorn",
  "Roots That Remember": "Raízes que se Lembram",
  "Carriage Thirteen": "Carruagem Treze",
  "The Court of Empty Masks": "A Corte das Máscaras Vazias",
  "A Crown Without a Face": "Uma Coroa sem Rosto",
  "The Hollow Eclipse": "O Eclipse Oco",
  "Investigate the bells ringing under the village and confront the Silver Inquisitor.": "Investigue os sinos que tocam sob a vila e enfrente o Inquisidor de Prata.",
  "Follow the ash-root network and learn why Mother Hollow knows your name.": "Siga a rede de raízes de cinzas e descubra por que a Mãe Oca conhece seu nome.",
  "Board the phantom train carrying bodies toward the Bloodmarket.": "Embarque no trem fantasma que transporta corpos para o Mercado de Sangue.",
  "Infiltrate a market auction where memories of the first eclipse are sold.": "Infiltre-se em um leilão onde memórias do primeiro eclipse são vendidas.",
  "Expose the force steering both factions toward the Cursed Capital.": "Revele a força que conduz as duas facções rumo à Capital Amaldiçoada.",
  "Enter the Ancient Rift and choose what the next age of night will become.": "Entre na Fenda Ancestral e escolha o destino da próxima era da noite.",
  "First Hunger": "Primeira Fome",
  "Steel and Instinct": "Aço e Instinto",
  "Shape the Beast": "Moldar a Fera",
  "Complete your first hunt.": "Conclua sua primeira caçada.",
  "Equip an item.": "Equipe um item.",
  "Upgrade any attribute.": "Melhore qualquer atributo.",
  "Act with force": "Agir com força",
  "Observe and bargain": "Observar e negociar",
  "Offer aid": "Oferecer ajuda",
  "Invoke your bloodline": "Invocar sua linhagem",
  "Protect the witness": "Proteger a testemunha",
  "Bargain for forbidden knowledge": "Negociar conhecimento proibido",
  "Read the blood memory": "Ler a memória do sangue",
  "The campaign adapts to your level and past choices.": "A campanha se adapta ao seu nível e às escolhas anteriores.",
  "Your final choice remains written in the rift.": "Sua escolha final permanece escrita na fenda.",
  "The evidence points farther into the night. Neither faction understands what it awakened.": "As evidências apontam para as profundezas da noite. Nenhuma facção entende o que despertou.",
  "The rift remembers your choice. The war will never return to its old shape.": "A fenda se lembra da sua escolha. A guerra jamais voltará à forma antiga.",
  "Black Forge": "Forja Negra",
  "Faction Quartermaster": "Intendente da Facção",
  "Quartermaster": "Intendente",
  "Alchemist’s Stair": "Escadaria do Alquimista",
  "Arena Gate": "Portão da Arena",
  "The Night City": "A Cidade Noturna",
  "The Arena": "A Arena",
  "Ancient Night Manor": "Solar da Noite Ancestral",
  "Hidden Forest Den": "Covil Oculto da Floresta",
  "War Table": "Mesa de Guerra",
  "Totem Circle": "Círculo de Totens",
  "Herbal Shelter": "Abrigo de Ervas",
  "Ritual Chamber": "Câmara Ritual",
  "Blood Cellar": "Adega de Sangue",
  "Deep Quarters": "Aposentos Profundos",
  "Eclipse Shrine": "Santuário do Eclipse",
  "Relic Vault": "Cofre de Relíquias",
  "Training Pit": "Campo de treinamento",
  "Trophy Hall": "Salão de Troféus",
  "Craft restorative tonics from materials.": "Fabrique tônicos restauradores com materiais.",
  "Upgrade, dismantle and reroll equipment.": "Melhore, desmonte e refaça atributos de equipamentos.",
  "Donate resources": "Doar recursos",
  "The clan needs a name.": "O clã precisa de um nome.",
  "The current fortress cannot house more companions.": "A fortaleza atual não comporta mais companheiros.",
  "The hall recognizes a new banner.": "O salão reconhece um novo estandarte.",
  "The hideout changes around you.": "O refúgio muda ao seu redor.",
  "Iron": "Ferro",
  "Leather": "Couro",
  "Blood Crystal": "Cristal de sangue",
  "Grave Dust": "Pó sepulcral",
  "Demon Ash": "Cinza demoníaca",
  "Shadow Silk": "Seda sombria",
  "Ancient Essence": "Essência ancestral",
  "Nightroot Tonic": "Tônico de Raiz Noturna",
  "Moonwake Draught": "Elixir do Despertar Lunar",
  "Eclipse Elixir": "Elixir do Eclipse",
  "A bitter tonic that forces the body to remember its original shape.": "Um tônico amargo que força o corpo a recordar sua forma original.",
  "A rare elixir condensed from eclipse rain.": "Um elixir raro condensado da chuva do eclipse.",
  "A useful object of the night.": "Um objeto útil da noite.",
  "Crafted in the city from volatile night materials.": "Fabricado na cidade com materiais noturnos voláteis.",
  "Restores 45 health • 2 Iron + 1 Leather": "Restaura 45 de vida • 2 Ferro + 1 Couro",
  "Restores 8 energy • 2 Moonstone + 1 Grave Dust": "Restaura 8 de energia • 2 Pedra da lua + 1 Pó sepulcral",
  "Daily tribute claimed.": "Tributo diário resgatado.",
  "Seven Nights of Tribute": "Sete Noites de Tributo",
  "A new path opens": "Um novo caminho se abre",
  "A promise carved into the night": "Uma promessa gravada na noite",
  "The first bell": "O primeiro sino",
  "The final echo": "O eco final",
  "The First Night": "A Primeira Noite",
  "Advance the Hollow Eclipse": "Avançar no Eclipse Oco",
  "Challenge the Ashen Forest": "Desafiar a Floresta Cinzenta",
  "Hunt the Rival Faction": "Caçar a facção rival",
  "The Balanced Night": "A Noite Equilibrada",
  "The Dawnless Accord": "O Acordo Sem Aurora",
  "The Sovereign Hunger": "A Fome Soberana",
  "The Bellkeeper": "O Guardião dos Sinos",
  "Unread omens": "Presságios não lidos",
  "Clanless": "Sem clã",
  "Name your clan": "Dê um nome ao seu clã",
  "We endure what the moon forgets.": "Resistimos ao que a lua esquece.",
  "Rage generation is heightened.": "A geração de Fúria está aumentada.",
  "Raises physical damage.": "Aumenta o dano físico.",
  "Raises evasion and initiative.": "Aumenta a esquiva e a iniciativa.",
  "Raises armor and block chance.": "Aumenta a armadura e a chance de bloqueio.",
  "Raises maximum health and regeneration.": "Aumenta a vida máxima e a regeneração.",
  "Raises accuracy and critical consistency.": "Aumenta a precisão e a consistência crítica.",
  "Raises critical chance and rare outcomes.": "Aumenta a chance crítica e os resultados raros.",
  "Improves influence and merchant discounts.": "Melhora a influência e os descontos com mercadores.",
  "A high-pressure faction duel.": "Um duelo intenso entre facções.",
  "Favorable": "Favorável",
  "Challenging": "Desafiadora",
  "Predatory": "Predatório",
  "Reckless": "Imprudente",
  "Merciful": "Misericordioso",
  "Scholarly": "Erudito",
  "Taciturn": "Taciturno",
  "Loyal": "Leal",
  "Restless": "Inquieto",
  "Unbound": "Desvinculado",
  "Balanced": "Equilibrado",
  "Off": "Desligado",
  "On": "Ligado",
  "MOONBORN CHRONICLE": "CRÔNICA DOS MOONBORN",
  "BLOODBOUND CHRONICLE": "CRÔNICA DOS BLOODBOUND",
  "Begin a Hunt": "Iniciar uma caçada",
  "Begin Hunt": "Iniciar caçada",
  "Experience": "Experiência",
  "CRITICAL": "CRÍTICO",
  "Night Conditions": "Condições da noite",
  "Noite Conditions": "Condições da noite",
  "New Moon": "Lua nova",
  "Waxing Crescent": "Lua crescente",
  "First Quarter": "Quarto crescente",
  "Waxing Gibbous": "Gibosa crescente",
  "Full Moon": "Lua cheia",
  "Waning Gibbous": "Gibosa minguante",
  "Last Quarter": "Quarto minguante",
  "Waning Crescent": "Lua minguante",
  "The sky changes hunt conditions.": "O céu altera as condições da caçada.",
  "Your combat chronicle is empty.": "Seu histórico de combate está vazio.",
  "No active missions.": "Nenhuma missão ativa.",
  "Suggested Action": "Ação sugerida",
  "Recommended": "Recomendado",
  "Active Missions": "Missões ativas",
  "Recent Combat": "Combates recentes",
  "Last encounters": "Últimos encontros",
  "Daily Objectives": "Objetivos diários",
  "Calendar": "Calendário",
  "Boss: The Silver Inquisitor": "Chefe: O Inquisidor de Prata",
  "SECRET: UNKNOWN": "SEGREDO: DESCONHECIDO",
  "Blackthorn equipment and materials": "Equipamentos e materiais de Blackthorn",
  "Blackthorn equipment and Materiais": "Equipamentos e materiais de Blackthorn",
  "Story Campaign": "Campanha da história",
  "História Campaign": "Campanha da história",
  "CHAPTER 1/6": "CAPÍTULO 1/6",
  "CHAPTER 2/6": "CAPÍTULO 2/6",
  "CHAPTER 3/6": "CAPÍTULO 3/6",
  "CHAPTER 4/6": "CAPÍTULO 4/6",
  "CHAPTER 5/6": "CAPÍTULO 5/6",
  "CHAPTER 6/6": "CAPÍTULO 6/6",
  "Begin Chapter": "Iniciar capítulo",
  "Chapter 1": "Capítulo 1",
  "Chapter 2": "Capítulo 2",
  "Chapter 3": "Capítulo 3",
  "Chapter 4": "Capítulo 4",
  "Chapter 5": "Capítulo 5",
  "Chapter 6": "Capítulo 6",
  "City Districts": "Distritos da cidade",
  "Merchant Row": "Alameda dos mercadores",
  "Daily battles": "Batalhas diárias",
  "Win streak": "Sequência de vitórias",
  "POWER ESTIMATE": "ESTIMATIVA DE PODER",
  "PODER ESTIMATE": "ESTIMATIVA DE PODER",
  "Challenge": "Desafiar",
  "No Arena matches yet.": "Nenhuma partida na Arena ainda.",
  "Side": "Secundária",
  "ACTIVE": "ATIVA",
  "Search inventory": "Buscar no inventário",
  "Buscar inventory": "Buscar no inventário",
  "Filter inventory by rarity": "Filtrar inventário por raridade",
  "Filter inventory by equipment slot": "Filtrar inventário por espaço de equipamento",
  "All slots": "Todos os espaços",
  "Six merchants rotate limited stock daily. Reputation and Presence reduce prices.": "Seis mercadores alternam estoques limitados diariamente. Reputação e Presença reduzem os preços.",
  "Six merchants rotate limited stock Diário. Reputation and Presence reduce prices.": "Seis mercadores alternam estoques limitados diariamente. Reputação e Presença reduzem os preços.",
  "Reduces attribute training costs.": "Reduz o custo de treinamento de atributos.",
  "Improves gold from victories.": "Aumenta o ouro obtido em vitórias.",
  "Improves Ouro from victories.": "Aumenta o ouro obtido em vitórias.",
  "Increases inventory capacity.": "Aumenta a capacidade do inventário.",
  "Improves Arena rewards.": "Melhora as recompensas da Arena.",
  "Improves rare reward chance.": "Aumenta a chance de recompensas raras.",
  "Improves rare Recompensas Chance.": "Aumenta a chance de recompensas raras.",
  "Adds mission capacity.": "Aumenta a capacidade de missões.",
  "Hideout Bonuses": "Bônus do refúgio",
  "Found a Clan": "Fundar um clã",
  "Choose a name, emblem and motto. Every member and chat message belongs to the game world and is clearly simulated.": "Escolha um nome, emblema e lema. Todos os membros e mensagens do chat pertencem ao mundo do jogo e são claramente simulados.",
  "Choose a name, emblem and motto. Every member and chat message belongs to o game Mundo and is clearly simulated.": "Escolha um nome, emblema e lema. Todos os membros e mensagens do chat pertencem ao mundo do jogo e são claramente simulados.",
  "CLAN NAME": "NOME DO CLÃ",
  "Create Clan": "Criar clã",
  "Defeat this creature to reveal its entry.": "Derrote esta criatura para revelar sua entrada.",
  "Derrote this creature to reveal its entry.": "Derrote esta criatura para revelar sua entrada.",
  "Kills": "Abates",
  "Hunts": "Caçadas",
  "Items": "Itens",
  "Bosses": "Chefes",
  "Wealth": "Riqueza",
  "YOU": "VOCÊ",
  "Inbox": "Caixa de entrada",
  "Read": "Lida",
  "Your Bloodline kit": "Seu kit de linhagem",
  "Your Linhagem kit": "Seu kit de linhagem",
  "Music volume": "Volume da música",
  "Generated ambient night layer": "Camada ambiente noturna gerada",
  "Generated ambient Noite layer": "Camada ambiente noturna gerada",
  "Sound effects": "Efeitos sonoros",
  "Combat and interface cues": "Sons de combate e interface",
  "Rank": "Posição",
  "Lv.": "Nv.",
  "Boss": "Chefe",
  "Equipment": "Equipamento",
  "equipment": "equipamentos",
  "shard": "fragmento",
  "shards": "fragmentos",
  "No missions match this filter.": "Nenhuma missão corresponde a este filtro.",
  "No items match your filters.": "Nenhum item corresponde aos filtros.",
  "No messages.": "Nenhuma mensagem.",
  "No achievements yet.": "Nenhuma conquista ainda.",
  "No ranking entries.": "Nenhuma posição no ranking.",
  "All rarities": "Todas as raridades",
  "Sort": "Ordenar",
  "Price": "Preço",
  "Stock": "Estoque",
  "Owned": "Possuído",
  "Purchase": "Comprar",
  "Daily stock": "Estoque diário",
  "Refreshes daily": "Atualiza diariamente",
  "Clan Hall": "Salão do clã",
  "Bestiary Entry": "Entrada do bestiário",
  "Achievement Progress": "Progresso de conquistas",
  "Arena Record": "Histórico da Arena",
  "Power estimate": "Estimativa de poder",
  "Win chance": "Chance de vitória",
  "Start Battle": "Iniciar batalha",
  "Continue Battle": "Continuar batalha",
  "Your turn": "Sua vez",
  "Enemy turn": "Vez do inimigo",
  "Skip turn": "Passar turno",
  "End turn": "Encerrar turno",
  "Claim": "Resgatar",
  "Mission complete": "Missão concluída",
  "Achievement unlocked": "Conquista desbloqueada",
  "Item acquired": "Item adquirido",
  "Level up": "Subiu de nível",
  "LIVE LAYERED PORTRAIT": "RETRATO VIVO EM CAMADAS",
  "THE NIGHT ATELIER": "O ATELIÊ DA NOITE",
  "THE Noite ATELIER": "O ATELIÊ DA NOITE",
  "Appearance & Regalia": "Aparência e regalia",
  "Cosmetic changes are free, save instantly and never alter combat stats. Equipped gear is rendered as a separate layer over this look.": "As mudanças cosméticas são gratuitas, salvas instantaneamente e nunca alteram os atributos de combate. O equipamento em uso aparece como uma camada separada sobre este visual.",
  "Randomize look": "Visual aleatório",
  "Restore Bloodline style": "Restaurar estilo da linhagem",
  "Restore Linhagem style": "Restaurar estilo da linhagem",
  "VISIBLE EQUIPMENT": "EQUIPAMENTO VISÍVEL",
  "VISIBLE equipamentos": "EQUIPAMENTO VISÍVEL",
  "Layered loadout": "Conjunto em camadas",
  "Every equipped slot contributes armor, jewelry, weapons, relic glow or engraved metal to the portrait.": "Cada espaço equipado adiciona armadura, joias, armas, brilho de relíquia ou metal gravado ao retrato.",
  "Attributes": "Atributos",
  "Derived Combat": "Combate derivado",
  "Ability Tree": "Árvore de habilidades",
  "Equip up to four active abilities": "Equipe até quatro habilidades ativas",
  "Max 4": "Máx. 4",
  "Max 6": "Máx. 6",
  "Rending Swipe": "Golpe Dilacerante",
  "Howl of Claim": "Uivo de Domínio",
  "Bonebreaker": "Quebra-Ossos",
  "Predator’s Step": "Passo do Predador",
  "Predator's Step": "Passo do Predador",
  "Lunar Hide": "Pele Lunar",
  "Savage Counter": "Contra-ataque Selvagem",
  "Blood Scent": "Faro de Sangue",
  "Pack Echo": "Eco da Alcateia",
  "Feral Rush": "Investida Feral",
  "Crushing Pounce": "Bote Esmagador",
  "Totem Ward": "Proteção Totêmica",
  "Night Tracker": "Rastreador Noturno",
  "Lunar Mend": "Cura Lunar",
  "Territory Mark": "Marca Territorial",
  "Razor Moon": "Lua Cortante",
  "Alpha’s Command": "Comando do Alfa",
  "Alpha's Command": "Comando do Alfa",
  "Worldfang": "Presa-Mundo",
  "Sanguine Cut": "Corte Sanguíneo",
  "Velvet Command": "Comando de Veludo",
  "Crimson Sip": "Gole Carmesim",
  "Shadow Passage": "Passagem Sombria",
  "Blood Aegis": "Égide de Sangue",
  "Courtly Ruin": "Ruína Cortesã",
  "Vein Mark": "Marca de Veia",
  "Night Poison": "Veneno Noturno",
  "Hypnotic Gaze": "Olhar Hipnótico",
  "Grave Elegance": "Elegância Sepulcral",
  "Scarlet Reversal": "Reversão Escarlate",
  "Ritual Feast": "Banquete Ritual",
  "Noble Decree": "Decreto Nobre",
  "Blood Moon Rite": "Rito da Lua de Sangue",
  "Throne of Thirst": "Trono da Sede",
  "Recommended Level 1": "Nível recomendado 1",
  "Recommended Nível 1": "Nível recomendado 1",
  "Region Intelligence": "Informações da região",
  "Frightened Villager": "Aldeão Apavorado",
  "Lantern Watchman": "Vigia da Lanterna",
  "Silver Trapper": "Armadilheiro de Prata",
  "Blackthorn Exorcist": "Exorcista de Blackthorn",
  "Ash Hound": "Cão de Cinzas",
  "Root-Woken Stag": "Cervo Desperto pelas Raízes",
  "Widow’s Acolyte": "Acólito da Viúva",
  "Harbor Drowner": "Afogado do Porto",
  "Salt Butcher": "Açougueiro de Sal",
  "Frost Maw": "Mandíbula de Geada",
  "Pale Harpy": "Harpia Pálida",
  "Courtless Knight": "Cavaleiro sem Corte",
  "Mirror Assassin": "Assassino do Espelho",
  "Eclipse Spawn": "Cria do Eclipse",
  "Starved Oracle": "Oráculo Faminto",
  "Bloodless Seraph": "Serafim sem Sangue",
  "Rift Devourer": "Devorador da Fenda",
  "Chain Alchemist": "Alquimista das Correntes",
  "Moonblind Seer": "Vidente Cego pela Lua",
  "Gravehorn Behemoth": "Beemote de Chifres Sepulcrais",
  "Chapter 1: Bells Beneath Blackthorn": "Capítulo 1: Sinos Sob Blackthorn",
  "Chapter 2: Roots That Remember": "Capítulo 2: Raízes que se Lembram",
  "Chapter 3: Carriage Thirteen": "Capítulo 3: Carruagem Treze",
  "Chapter 4: The Court of Empty Masks": "Capítulo 4: A Corte das Máscaras Vazias",
  "Chapter 5: A Crown Without a Face": "Capítulo 5: Uma Coroa sem Rosto",
  "Chapter 6: The Hollow Eclipse": "Capítulo 6: O Eclipse Oco",
  "Requires Level 1": "Requer nível 1",
  "Requires Level 6": "Requer nível 6",
  "Requires Level 12": "Requer nível 12",
  "Requires Level 19": "Requer nível 19",
  "Requires Level 28": "Requer nível 28",
  "Requires Level 36": "Requer nível 36",
  "Visit": "Visitar",
  "Forge": "Forja",
  "Enter": "Entrar",
  "Campaign Consequences": "Consequências da campanha",
  "Your choices alter reputation, alignment, dialogue and reward variants. No choice permanently locks the save; later chapters offer reconciliation paths.": "Suas escolhas alteram reputação, alinhamento, diálogos e variações de recompensa. Nenhuma escolha bloqueia o salvamento permanentemente; capítulos posteriores oferecem caminhos de reconciliação.",
  "REPUTATION": "REPUTAÇÃO",
  "ALIGNMENT": "ALINHAMENTO",
  "SECRETS": "SEGREDOS",
  "CHAPTERS": "CAPÍTULOS",
  "Hidden Stores": "Depósitos Ocultos",
  "Night Gate": "Portão Noturno",
  "Apothecary": "Boticário",
  "Watcher Post": "Posto de Vigia",
  "Improves potion crafting.": "Melhora a fabricação de poções.",
  "Increases accuracy while hunting.": "Aumenta a precisão durante caçadas.",
  "Improves rare loot chance.": "Aumenta a chance de recompensas raras.",
  "Adds passive health regeneration.": "Adiciona regeneração passiva de vida.",
  "Improves faction resource generation.": "Aumenta a geração do recurso da facção.",
  "tier": "nível",
  "ArenaWins": "vitórias na Arena",
  "StoryChapters": "capítulos da história",
  "ClanDonations": "doações ao clã",
  "Secrets": "segredos",
  "ResourceSpent": "recursos gastos",
  "The Velvet Fang": "A Presa de Veludo",
  "Ashen Howl": "Uivo Cinzento",
  "Court of Thorns": "Corte de Espinhos",
  "Silver Ruin": "Ruína de Prata",
  "Nocturne Pact": "Pacto Noturno",
  "Grave Lanterns": "Lanternas Sepulcrais",
  "Eclipse Ward": "Guarda do Eclipse",
  "Red Parliament": "Parlamento Vermelho",
  "Night Dispatch": "Despacho Noturno",
  "Messages unlock through story chapters, boss victories, Arena revenge opportunities and clan activity.": "As mensagens são desbloqueadas por capítulos da história, vitórias contra chefes, oportunidades de revanche na Arena e atividades do clã.",
  "Text Size": "Tamanho do texto",
  "CHRONICLE Management": "Gerenciamento da crônica",
  "CRÔNICA Management": "Gerenciamento da crônica",
  "Export JSON": "Exportar JSON",
  "Import JSON": "Importar JSON",
  "Fullscreen": "Tela cheia",
  "Reset Game": "Reiniciar jogo",
  "Refresh": "Atualizar",
  "Current Division": "Divisão atual",
  "Match History": "Histórico de partidas",
  "Seasonal simulation": "Simulação sazonal",
  "DISCOUNT 0%": "DESCONTO 0%",
  "Blacksmith": "Ferreiro",
  "Alchemist": "Alquimista",
  "Occult": "Ocultismo",
  "Traveling": "Viajante",
  "General Stock": "Estoque geral",
  "Buyback": "Recompra",
  "Sold Items appear here.": "Itens vendidos aparecem aqui.",
  "Wallet": "Carteira",
  "Rotates 2026-8-2": "Atualiza em 02/08/2026",
  "MOTTO": "LEMA",
  "EMBLEM": "EMBLEMA",
  "Bestiary & Codex": "Bestiário e códice",
  "Audio begins only after interaction. Music and sound can be muted from the note button. Reduced motion and accessibility options become available inside a chronicle.": "O áudio começa somente após uma interação. Música e sons podem ser silenciados pelo botão de nota. Movimento reduzido e opções de acessibilidade ficam disponíveis dentro de uma crônica.",
  "Your first three tutorial missions track these actions automatically.": "As três primeiras missões do tutorial acompanham essas ações automaticamente.",
  "Difficulty: Severe": "Dificuldade: alta",
  "Dificuldade: Severe": "Dificuldade: alta",
  "Critical": "Crítico",
  "Chapter": "Capítulo",
  "CHAPTER": "CAPÍTULO",
  "Bloodlust": "Sede de Sangue",
  "full": "completa",
  "Inspect": "Inspecionar",
  "GOLD": "OURO",
  "MATERIALS": "MATERIAIS",
  "EXPERIENCE": "EXPERIÊNCIA",
  "Bonebound": "Ligado aos Ossos",
  "Nightroot": "Raiz Noturna",
  "Tonic": "Tônico",
  "Bloodglass": "Vidro de Sangue",
  "Moonlit": "Banhado pela Lua",
  "Den": "Covil",
  "Chain": "Corrente",
  "Fang": "Presa",
  "Claw": "Garra",
  "Rain": "Chuva",
  "Sold items appear here.": "Itens vendidos aparecem aqui.",
  "Save slot": "Espaço de salvamento",
  "Not enough energy.": "Energia insuficiente.",
  "Not enough materials.": "Materiais insuficientes.",
  "Inventory is full.": "O inventário está cheio.",
  "Loot": "Recompensas",
  "Auto On": "Automático ligado",
  "Auto Off": "Automático desligado",
  "Animations On": "Animações ligadas",
  "Animations Off": "Animações desligadas",
  "Phase": "Fase",
  "Turn": "Turno",
  "Reliable strike • no cost": "Golpe confiável • sem custo",
  "High damage • lower accuracy": "Dano alto • precisão reduzida",
  "Defensive Stance": "Postura defensiva",
  "Armor and block until next turn": "Armadura e bloqueio até o próximo turno",
  "Item": "Item",
  "Use a restorative consumable": "Use um consumível restaurador",
  "Retreat": "Recuar",
  "Temporary effect": "Efeito temporário",
  "BLOCK": "BLOQUEIO",
  "critical": "crítico",
  "blocked": "bloqueado",
  "damage": "de dano",
  "Your body reforms within the hideout. Some health is restored and no equipment is lost.": "Seu corpo se recompõe no refúgio. Parte da vida é restaurada e nenhum equipamento é perdido.",
  "Secret discovered:": "Segredo descoberto:",
  "Achievement unlocked:": "Conquista desbloqueada:",
  "Worldfang Finisher": "Finalizador Presa-Mundo",
  "Boss Cataclysm": "Cataclismo do Chefe",
  "Boss Strike": "Golpe do Chefe",
  "Cruel Feint": "Finta Cruel",
  "Eclipse Strike": "Golpe do Eclipse",
  "Rending Blow": "Golpe Dilacerante",
  "Night Rush": "Investida Noturna",
  "Guarded Step": "Passo Protegido",
  "Hex Pulse": "Pulso Amaldiçoado",
  "Venom Cut": "Corte Venenoso",
  "Iron Prayer": "Prece de Ferro",
  "Soul Cry": "Grito da Alma",
  "HP": "PV",
  "CD": "REC",
  "HUNT EVENT": "EVENTO DE CAÇADA",
  "EVENTO DE CAÇADA": "EVENTO DE CAÇADA"
};
  const phrases = [
  [
    "Your character is always highlighted",
    "Seu personagem aparece sempre destacado"
  ],
  [
    "Regional sovereign of",
    "Soberano regional de"
  ],
  [
    "Its presence bends the rules of night",
    "Sua presença distorce as regras da noite"
  ],
  [
    "is a",
    "é um"
  ],
  [
    "shaped by the Hollow Eclipse",
    "moldado pelo Eclipse Oco"
  ],
  [
    "Advance the war by completing this",
    "Avance na guerra concluindo este objetivo de"
  ],
  [
    "objective",
    "objetivo"
  ],
  [
    "Reach",
    "Alcance"
  ],
  [
    "Complete",
    "Conclua"
  ],
  [
    "Defeat",
    "Derrote"
  ],
  [
    "Collect",
    "Colete"
  ],
  [
    "Discover",
    "Descubra"
  ],
  [
    "Survive",
    "Sobreviva"
  ],
  [
    "Explore",
    "Explore"
  ],
  [
    "Upgrade",
    "Melhore"
  ],
  [
    "Spend",
    "Gaste"
  ],
  [
    "Apply",
    "Aplique"
  ],
  [
    "Critical hits",
    "Acertos críticos"
  ],
  [
    "Heavy attacks",
    "Ataques pesados"
  ],
  [
    "rare items",
    "itens raros"
  ],
  [
    "dangerous hunts",
    "caçadas perigosas"
  ],
  [
    "boss phases",
    "fases de chefe"
  ],
  [
    "rival combatants",
    "combatentes rivais"
  ],
  [
    "faction resource",
    "recurso de facção"
  ],
  [
    "a regional secret",
    "um segredo regional"
  ],
  [
    "Strike with supernatural force",
    "Ataque com força sobrenatural"
  ],
  [
    "Raise a supernatural defense",
    "Erga uma defesa sobrenatural"
  ],
  [
    "Restore stolen vitality",
    "Restaure a vitalidade roubada"
  ],
  [
    "Impose a tactical condition",
    "Imponha uma condição tática"
  ],
  [
    "using",
    "usando"
  ],
  [
    "Forged from",
    "Forjado com"
  ],
  [
    "during a night without dawn",
    "durante uma noite sem amanhecer"
  ],
  [
    "In the dark of",
    "Na escuridão de"
  ],
  [
    "interrupts your hunt",
    "interrompe sua caçada"
  ],
  [
    "The choice may echo through future nights",
    "A escolha pode ecoar pelas noites futuras"
  ],
  [
    "A Price",
    "Um Preço"
  ],
  [
    "An Oath",
    "Um Juramento"
  ],
  [
    "A Warning",
    "Um Aviso"
  ],
  [
    "A Hunger",
    "Uma Fome"
  ],
  [
    "Level",
    "Nível"
  ],
  [
    "Night",
    "Noite"
  ],
  [
    "Health",
    "Vida"
  ],
  [
    "Energy",
    "Energia"
  ],
  [
    "Gold",
    "Ouro"
  ],
  [
    "Shards",
    "Fragmentos"
  ],
  [
    "Materials",
    "Materiais"
  ],
  [
    "Loot",
    "Recompensas"
  ],
  [
    "Power",
    "Poder"
  ],
  [
    "Rating",
    "Pontuação"
  ],
  [
    "Record",
    "Histórico"
  ],
  [
    "Division",
    "Divisão"
  ],
  [
    "Cost",
    "Custo"
  ],
  [
    "Chance",
    "Chance"
  ],
  [
    "Duration",
    "Duração"
  ],
  [
    "Cooldown",
    "Recarga"
  ],
  [
    "Turns",
    "Turnos"
  ],
  [
    "Turn",
    "Turno"
  ],
  [
    "Available",
    "Disponível"
  ],
  [
    "Locked",
    "Bloqueado"
  ],
  [
    "Unlocked",
    "Desbloqueado"
  ],
  [
    "New",
    "Novo"
  ],
  [
    "Current",
    "Atual"
  ],
  [
    "Next",
    "Próximo"
  ],
  [
    "Total",
    "Total"
  ],
  [
    "Reward",
    "Recompensa"
  ],
  [
    "Progress",
    "Progresso"
  ],
  [
    "Difficulty",
    "Dificuldade"
  ],
  [
    "Faction",
    "Facção"
  ],
  [
    "Bloodline",
    "Linhagem"
  ],
  [
    "Story",
    "História"
  ],
  [
    "Tutorial",
    "Tutorial"
  ],
  [
    "Daily",
    "Diário"
  ],
  [
    "Weekly",
    "Semanal"
  ],
  [
    "General",
    "Geral"
  ],
  [
    "All",
    "Todos"
  ],
  [
    "Any",
    "Qualquer"
  ],
  [
    "Search",
    "Buscar"
  ],
  [
    "Close dialog",
    "Fechar janela"
  ],
  [
    "First",
    "Primeiro"
  ],
  [
    "Immortal",
    "Imortal"
  ],
  [
    "Bronze",
    "Bronze"
  ],
  [
    "Iron",
    "Ferro"
  ],
  [
    "Silver",
    "Prata"
  ],
  [
    "Crimson",
    "Carmesim"
  ],
  [
    "Eclipse",
    "Eclipse"
  ],
  [
    "Weapon",
    "Arma"
  ],
  [
    "Blade",
    "Lâmina"
  ],
  [
    "Dagger",
    "Adaga"
  ],
  [
    "Cleaver",
    "Cutelo"
  ],
  [
    "Pistol",
    "Pistola"
  ],
  [
    "Hook",
    "Gancho"
  ],
  [
    "Claw",
    "Garra"
  ],
  [
    "Talons",
    "Garras"
  ],
  [
    "Helm",
    "Elmo"
  ],
  [
    "Hood",
    "Capuz"
  ],
  [
    "Mask",
    "Máscara"
  ],
  [
    "Visor",
    "Viseira"
  ],
  [
    "Crown",
    "Coroa"
  ],
  [
    "Cuirass",
    "Couraça"
  ],
  [
    "Harness",
    "Arreio"
  ],
  [
    "Vestment",
    "Vestimenta"
  ],
  [
    "Coat",
    "Casaco"
  ],
  [
    "Gloves",
    "Luvas"
  ],
  [
    "Grips",
    "Manoplas"
  ],
  [
    "Bindings",
    "Faixas"
  ],
  [
    "Wraps",
    "Envoltórios"
  ],
  [
    "Greaves",
    "Grevas"
  ],
  [
    "Legguards",
    "Perneiras"
  ],
  [
    "Trousers",
    "Calças"
  ],
  [
    "Chausses",
    "Calças de malha"
  ],
  [
    "Boots",
    "Botas"
  ],
  [
    "Treads",
    "Botas"
  ],
  [
    "Sabatons",
    "Sabatons"
  ],
  [
    "Striders",
    "Passos"
  ],
  [
    "Charm",
    "Amuleto"
  ],
  [
    "Locket",
    "Medalhão"
  ],
  [
    "Torque",
    "Torques"
  ],
  [
    "Rosary",
    "Rosário"
  ],
  [
    "Signet",
    "Sinete"
  ],
  [
    "Loop",
    "Argola"
  ],
  [
    "Coil",
    "Espiral"
  ],
  [
    "Idol",
    "Ídolo"
  ],
  [
    "Totem",
    "Totem"
  ],
  [
    "Talisman",
    "Talismã"
  ],
  [
    "Seal",
    "Selo"
  ],
  [
    "Heart",
    "Coração"
  ],
  [
    "Ash",
    "Cinza"
  ],
  [
    "Bone",
    "Osso"
  ],
  [
    "Blood",
    "Sangue"
  ],
  [
    "Moon",
    "Lua"
  ],
  [
    "Grave",
    "Túmulo"
  ],
  [
    "Night",
    "Noite"
  ],
  [
    "Dusk",
    "Crepúsculo"
  ],
  [
    "Frost",
    "Geada"
  ],
  [
    "Thorn",
    "Espinho"
  ],
  [
    "Fang",
    "Presa"
  ],
  [
    "Dread",
    "Pavor"
  ],
  [
    "Runed",
    "Rúnico"
  ],
  [
    "Ancient",
    "Ancestral"
  ],
  [
    "Black",
    "Negro"
  ],
  [
    "Red",
    "Vermelho"
  ],
  [
    "Hollow",
    "Oco"
  ],
  [
    "World",
    "Mundo"
  ],
  [
    "Soul",
    "Alma"
  ],
  [
    "Vein",
    "Veia"
  ],
  [
    "Rift",
    "Fenda"
  ],
  [
    "Court",
    "Corte"
  ],
  [
    "Velvet",
    "Veludo"
  ],
  [
    "Silent",
    "Silencioso"
  ],
  [
    "Broken",
    "Partido"
  ],
  [
    "Winter",
    "Inverno"
  ],
  [
    "Deep",
    "Profundo"
  ],
  [
    "Saints",
    "Santos"
  ],
  [
    "Oaths",
    "Juramentos"
  ],
  [
    "Bells",
    "Sinos"
  ],
  [
    "Rain",
    "Chuva"
  ],
  [
    "The Silver Inquisitor",
    "O Inquisidor de Prata"
  ],
  [
    "The Hollow Eclipse",
    "O Eclipse Oco"
  ],
  [
    "CHRONICLE",
    "CRÔNICA"
  ],
  [
    "Chronicle",
    "Crônica"
  ],
  [
    "Clanless",
    "Sem clã"
  ],
  [
    "Rank #",
    "Posição #"
  ],
  [
    "Lv.",
    "Nv."
  ],
  [
    "Boss:",
    "Chefe:"
  ],
  [
    "SECRET:",
    "SEGREDO:"
  ],
  [
    "UNKNOWN",
    "DESCONHECIDO"
  ],
  [
    "Begin a Hunt",
    "Iniciar uma caçada"
  ],
  [
    "Begin Chapter",
    "Iniciar capítulo"
  ],
  [
    "Daily battles",
    "Batalhas diárias"
  ],
  [
    "Win streak",
    "Sequência de vitórias"
  ],
  [
    "Power estimate",
    "Estimativa de poder"
  ],
  [
    "No Arena matches yet",
    "Nenhuma partida na Arena ainda"
  ],
  [
    "Filter inventory by rarity",
    "Filtrar inventário por raridade"
  ],
  [
    "Filter inventory by equipment slot",
    "Filtrar inventário por espaço de equipamento"
  ],
  [
    "Search inventory",
    "Buscar no inventário"
  ],
  [
    "Found a Clan",
    "Fundar um clã"
  ],
  [
    "Create Clan",
    "Criar clã"
  ],
  [
    "Music volume",
    "Volume da música"
  ],
  [
    "Sound effects",
    "Efeitos sonoros"
  ],
  [
    "Combat and interface cues",
    "Sons de combate e interface"
  ],
  [
    "Generated ambient night layer",
    "Camada ambiente noturna gerada"
  ],
  [
    "No active missions",
    "Nenhuma missão ativa"
  ],
  [
    "Your combat chronicle is empty",
    "Seu histórico de combate está vazio"
  ],
  [
    "the sky changes hunt conditions",
    "o céu altera as condições da caçada"
  ],
  [
    "equipment and materials",
    "equipamentos e materiais"
  ],
  [
    "equipment",
    "equipamentos"
  ],
  [
    "materials",
    "materiais"
  ],
  [
    "Uncommon",
    "Incomum"
  ],
  [
    "Common",
    "Comum"
  ],
  [
    "Rare",
    "Raro"
  ],
  [
    "Epic",
    "Épico"
  ],
  [
    "Legendary",
    "Lendário"
  ],
  [
    "Mythic",
    "Mítico"
  ],
  [
    "Kills",
    "Abates"
  ],
  [
    "Hunts",
    "Caçadas"
  ],
  [
    "Items",
    "Itens"
  ],
  [
    "Bosses",
    "Chefes"
  ],
  [
    "Wealth",
    "Riqueza"
  ],
  [
    "Inbox",
    "Caixa de entrada"
  ],
  [
    "Your Bloodline kit",
    "Seu kit de linhagem"
  ],
  [
    "Cosmetic changes are free, save instantly and never alter combat stats. Equipped gear is rendered as a separate layer over this look.",
    "As mudanças cosméticas são gratuitas, salvas instantaneamente e nunca alteram os atributos de combate. O equipamento em uso aparece como uma camada separada sobre este visual."
  ],
  [
    "Every equipped slot contributes armor, jewelry, weapons, relic glow or engraved metal to the portrait.",
    "Cada espaço equipado adiciona armadura, joias, armas, brilho de relíquia ou metal gravado ao retrato."
  ],
  [
    "Restore Bloodline style",
    "Restaurar estilo da linhagem"
  ],
  [
    "Randomize look",
    "Visual aleatório"
  ],
  [
    "THE NIGHT ATELIER",
    "O ATELIÊ DA NOITE"
  ],
  [
    "THE Noite ATELIER",
    "O ATELIÊ DA NOITE"
  ],
  [
    "VISIBLE EQUIPMENT",
    "EQUIPAMENTO VISÍVEL"
  ],
  [
    "VISIBLE equipamentos",
    "EQUIPAMENTO VISÍVEL"
  ],
  [
    "Equip up to four active abilities",
    "Equipe até quatro habilidades ativas"
  ],
  [
    "Rage",
    "Fúria"
  ],
  [
    "Mother Hollow",
    "Mãe Oca"
  ],
  [
    "The Bone Collector",
    "O Coletor de Ossos"
  ],
  [
    "The Veiled Broker",
    "O Corretor Velado"
  ],
  [
    "Saint Vesper",
    "Santo Vesper"
  ],
  [
    "The Argent Widow",
    "A Viúva Argêntea"
  ],
  [
    "The Red Harbor Butcher",
    "O Açougueiro do Porto Vermelho"
  ],
  [
    "The Moon-Eater",
    "O Devorador da Lua"
  ],
  [
    "Queen Without a Face",
    "A Rainha sem Rosto"
  ],
  [
    "The Eclipse Heart",
    "O Coração do Eclipse"
  ],
  [
    "Recommended Level",
    "Nível recomendado"
  ],
  [
    "Recommended Nível",
    "Nível recomendado"
  ],
  [
    "Region Intelligence",
    "Informações da região"
  ],
  [
    "Investigate the bells ringing under the village and confront the Silver Inquisitor.",
    "Investigue os sinos que tocam sob a vila e enfrente o Inquisidor de Prata."
  ],
  [
    "Chapter 1: Bells Beneath Blackthorn",
    "Capítulo 1: Sinos Sob Blackthorn"
  ],
  [
    "Chapter 2: Roots That Remember",
    "Capítulo 2: Raízes que se Lembram"
  ],
  [
    "Chapter 3: Carriage Thirteen",
    "Capítulo 3: Carruagem Treze"
  ],
  [
    "Chapter 4: The Court of Empty Masks",
    "Capítulo 4: A Corte das Máscaras Vazias"
  ],
  [
    "Chapter 5: A Crown Without a Face",
    "Capítulo 5: Uma Coroa sem Rosto"
  ],
  [
    "Chapter 6: The Hollow Eclipse",
    "Capítulo 6: O Eclipse Oco"
  ],
  [
    "Requires Level",
    "Requer nível"
  ],
  [
    "Your choices alter reputation, alignment, dialogue and reward variants. No choice permanently locks the save; later chapters offer reconciliation paths.",
    "Suas escolhas alteram reputação, alinhamento, diálogos e variações de recompensa. Nenhuma escolha bloqueia o salvamento permanentemente; capítulos posteriores oferecem caminhos de reconciliação."
  ],
  [
    "Improves potion crafting",
    "Melhora a fabricação de poções"
  ],
  [
    "Increases accuracy while hunting",
    "Aumenta a precisão durante caçadas"
  ],
  [
    "Improves rare loot chance",
    "Aumenta a chance de recompensas raras"
  ],
  [
    "Adds passive health regeneration",
    "Adiciona regeneração passiva de vida"
  ],
  [
    "Improves faction resource generation",
    "Aumenta a geração do recurso da facção"
  ],
  [
    "ArenaWins",
    "vitórias na Arena"
  ],
  [
    "StoryChapters",
    "capítulos da história"
  ],
  [
    "ClanDonations",
    "doações ao clã"
  ],
  [
    "ResourceSpent",
    "recursos gastos"
  ],
  [
    "The Velvet Fang",
    "A Presa de Veludo"
  ],
  [
    "Ashen Howl",
    "Uivo Cinzento"
  ],
  [
    "Court of Thorns",
    "Corte de Espinhos"
  ],
  [
    "Silver Ruin",
    "Ruína de Prata"
  ],
  [
    "Nocturne Pact",
    "Pacto Noturno"
  ],
  [
    "Grave Lanterns",
    "Lanternas Sepulcrais"
  ],
  [
    "Eclipse Ward",
    "Guarda do Eclipse"
  ],
  [
    "Red Parliament",
    "Parlamento Vermelho"
  ],
  [
    "Messages unlock through story chapters, boss victories, Arena revenge opportunities and clan activity",
    "As mensagens são desbloqueadas por capítulos da história, vitórias contra chefes, oportunidades de revanche na Arena e atividades do clã"
  ],
  [
    "The Bellkeeper",
    "O Guardião dos Sinos"
  ],
  [
    "Faction Quartermaster",
    "Intendente da Facção"
  ],
  [
    "Night Dispatch",
    "Despacho Noturno"
  ],
  [
    "Current Division",
    "Divisão atual"
  ],
  [
    "Match History",
    "Histórico de partidas"
  ],
  [
    "Seasonal simulation",
    "Simulação sazonal"
  ],
  [
    "Dificuldade: Severe",
    "Dificuldade: alta"
  ],
  [
    "Sold Items appear here",
    "Itens vendidos aparecem aqui"
  ],
  [
    "Bestiary & Codex",
    "Bestiário e códice"
  ],
  [
    "Text Size",
    "Tamanho do texto"
  ],
  [
    "CHRONICLE Management",
    "Gerenciamento da crônica"
  ],
  [
    "CRÔNICA Management",
    "Gerenciamento da crônica"
  ],
  [
    "General Stock",
    "Estoque geral"
  ],
  [
    "DISCOUNT",
    "DESCONTO"
  ],
  [
    "Rotates",
    "Atualiza em"
  ],
  [
    "Buyback",
    "Recompra"
  ],
  [
    "Wallet",
    "Carteira"
  ],
  [
    "CLAN NAME",
    "NOME DO CLÃ"
  ],
  [
    "MOTTO",
    "LEMA"
  ],
  [
    "EMBLEM",
    "EMBLEMA"
  ],
  [
    "tier",
    "nível"
  ],
  [
    "Reputation",
    "Reputação"
  ],
  [
    "Alignment",
    "Alinhamento"
  ],
  [
    "Chapters",
    "Capítulos"
  ],
  [
    "Frightened Villager",
    "Aldeão Apavorado"
  ],
  [
    "Lantern Watchman",
    "Vigia da Lanterna"
  ],
  [
    "Silver Trapper",
    "Armadilheiro de Prata"
  ],
  [
    "Blackthorn Exorcist",
    "Exorcista de Blackthorn"
  ],
  [
    "Ash Hound",
    "Cão de Cinzas"
  ],
  [
    "Root-Woken Stag",
    "Cervo Desperto pelas Raízes"
  ],
  [
    "Widow’s Acolyte",
    "Acólito da Viúva"
  ],
  [
    "Harbor Drowner",
    "Afogado do Porto"
  ],
  [
    "Salt Butcher",
    "Açougueiro de Sal"
  ],
  [
    "Frost Maw",
    "Mandíbula de Geada"
  ],
  [
    "Pale Harpy",
    "Harpia Pálida"
  ],
  [
    "Courtless Knight",
    "Cavaleiro sem Corte"
  ],
  [
    "Mirror Assassin",
    "Assassino do Espelho"
  ],
  [
    "Eclipse Spawn",
    "Cria do Eclipse"
  ],
  [
    "Starved Oracle",
    "Oráculo Faminto"
  ],
  [
    "Bloodless Seraph",
    "Serafim sem Sangue"
  ],
  [
    "Rift Devourer",
    "Devorador da Fenda"
  ],
  [
    "Chain Alchemist",
    "Alquimista das Correntes"
  ],
  [
    "Moonblind Seer",
    "Vidente Cego pela Lua"
  ],
  [
    "Gravehorn Behemoth",
    "Beemote de Chifres Sepulcrais"
  ],
  [
    "Difficulty: Severe",
    "Dificuldade: alta"
  ],
  [
    "Critical",
    "Crítico"
  ],
  [
    "Chapter",
    "Capítulo"
  ],
  [
    "Secrets",
    "segredos"
  ],
  [
    "shard",
    "fragmento"
  ],
  [
    "Ravager",
    "Devastador"
  ],
  [
    "Warden",
    "Guardião"
  ],
  [
    "Stalker",
    "Espreitador"
  ],
  [
    "Reaper",
    "Ceifador"
  ],
  [
    "Noble",
    "Nobre"
  ],
  [
    "Shadow",
    "Sombra"
  ],
  [
    "Bloodlust",
    "Sede de Sangue"
  ],
  [
    "Refresh",
    "Atualizar"
  ],
  [
    "next full",
    "carga completa"
  ],
  [
    "Chest",
    "Torso"
  ],
  [
    "Hands",
    "Mãos"
  ],
  [
    "Feet",
    "Pés"
  ],
  [
    "Consumable",
    "Consumível"
  ],
  [
    "Inspect",
    "Inspecionar"
  ],
  [
    "Ashen",
    "Cinzento"
  ],
  [
    "Bonebound",
    "Ligado aos Ossos"
  ],
  [
    "Nightroot",
    "Raiz Noturna"
  ],
  [
    "Tonic",
    "Tônico"
  ],
  [
    "Bloodglass",
    "Vidro de Sangue"
  ],
  [
    "Moonlit",
    "Banhado pela Lua"
  ],
  [
    "Obsidian",
    "Obsidiana"
  ],
  [
    "Den",
    "Covil"
  ],
  [
    "Chain",
    "Corrente"
  ],
  [
    "of the",
    "da"
  ],
  [
    "Sold items appear here",
    "Itens vendidos aparecem aqui"
  ],
  [
    "Save Slots",
    "Espaços de salvamento"
  ],
  [
    "Not enough gold",
    "Ouro insuficiente"
  ],
  [
    "Not enough energy",
    "Energia insuficiente"
  ],
  [
    "Not enough materials",
    "Materiais insuficientes"
  ],
  [
    "emerges from the night",
    "surge da noite"
  ],
  [
    "is stunned",
    "está atordoado"
  ],
  [
    "takes a defensive stance",
    "assume uma postura defensiva"
  ],
  [
    "enters phase",
    "entra na fase"
  ],
  [
    "A dangerous attack is telegraphed",
    "Um ataque perigoso está sendo anunciado"
  ],
  [
    "invokes a territorial howl",
    "invoca um uivo territorial"
  ],
  [
    "bends the enemy's pulse",
    "dobra o pulso do inimigo"
  ],
  [
    "surrounds",
    "envolve"
  ],
  [
    "restores stolen vitality",
    "restaura a vitalidade roubada"
  ],
  [
    "applies",
    "aplica"
  ],
  [
    "invokes a profane recovery",
    "invoca uma recuperação profana"
  ],
  [
    "raises a guard",
    "ergue a guarda"
  ],
  [
    "uses",
    "usa"
  ],
  [
    "critical",
    "crítico"
  ],
  [
    "blocked",
    "bloqueado"
  ],
  [
    "damage",
    "de dano"
  ],
  [
    "dodges",
    "esquiva de"
  ],
  [
    "suffers",
    "sofre"
  ],
  [
    "status damage",
    "de dano de efeito"
  ],
  [
    "Secret discovered:",
    "Segredo descoberto:"
  ],
  [
    "Achievement unlocked:",
    "Conquista desbloqueada:"
  ],
  [
    "Auto On",
    "Automático ligado"
  ],
  [
    "Auto Off",
    "Automático desligado"
  ],
  [
    "Animations On",
    "Animações ligadas"
  ],
  [
    "Animations Off",
    "Animações desligadas"
  ],
  [
    "Basic Attack",
    "Ataque básico"
  ],
  [
    "Heavy Attack",
    "Ataque pesado"
  ],
  [
    "Defensive Stance",
    "Postura defensiva"
  ],
  [
    "Faction Power",
    "Poder da facção"
  ],
  [
    "Reliable strike • no cost",
    "Golpe confiável • sem custo"
  ],
  [
    "High damage • lower accuracy",
    "Dano alto • precisão reduzida"
  ],
  [
    "Armor and block until next turn",
    "Armadura e bloqueio até o próximo turno"
  ],
  [
    "Gain tactical bloodline power",
    "Obtenha poder tático da linhagem"
  ],
  [
    "Transform at maximum resource",
    "Transforme-se com o recurso no máximo"
  ],
  [
    "Use a restorative consumable",
    "Use um consumível restaurador"
  ],
  [
    "Attempt to escape",
    "Tentar escapar"
  ],
  [
    "Cannot flee this encounter",
    "Não é possível fugir deste encontro"
  ],
  [
    "Turn ",
    "Turno "
  ],
  [
    "Determine initiative",
    "Determinar iniciativa"
  ],
  [
    "Phase ",
    "Fase "
  ],
  [
    "Challenging",
    "Desafiadora"
  ],
  [
    "Favorable",
    "Favorável"
  ],
  [
    "Temporary effect",
    "Efeito temporário"
  ],
  [
    "Worldfang Finisher",
    "Finalizador Presa-Mundo"
  ],
  [
    "Boss Cataclysm",
    "Cataclismo do Chefe"
  ],
  [
    "Boss Strike",
    "Golpe do Chefe"
  ],
  [
    "Rending Blow",
    "Golpe Dilacerante"
  ],
  [
    "Night Rush",
    "Investida Noturna"
  ],
  [
    "Guarded Step",
    "Passo Protegido"
  ],
  [
    "Hex Pulse",
    "Pulso Amaldiçoado"
  ],
  [
    "Venom Cut",
    "Corte Venenoso"
  ],
  [
    "Iron Prayer",
    "Prece de Ferro"
  ],
  [
    "Soul Cry",
    "Grito da Alma"
  ],
  [
    "Your move",
    "Sua jogada"
  ],
  [
    "Retreat",
    "Recuar"
  ],
  [
    " HP",
    " PV"
  ],
  [
    "CD ",
    "REC "
  ]
];

  function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  const phraseRules = phrases
    .slice()
    .sort((a, b) => b[0].length - a[0].length)
    .map(([from, to]) => {
      const wordLike = /^[\p{L}\p{N}'’ -]+$/u.test(from);
      const start = wordLike ? "(?<![\\p{L}\\p{N}_])" : "";
      const end = wordLike ? "(?![\\p{L}\\p{N}_])" : "";
      return [new RegExp(start + escapeRegExp(from) + end, "giu"), to];
    });

  function titleCase(value) {
    return String(value || "").replace(/(^|\s)(\w)/g, (_, gap, letter) => gap + letter.toUpperCase());
  }

  function translate(value) {
    if (value == null) return value;
    const original = String(value);
    const match = original.match(/^(\s*)([\s\S]*?)(\s*)$/);
    const lead = match ? match[1] : "";
    const core = match ? match[2] : original;
    const trail = match ? match[3] : "";
    if (!core || !/[A-Za-z]/.test(core)) return original;
    if (Object.prototype.hasOwnProperty.call(exact, core)) return lead + exact[core] + trail;
    let out = core;
    phraseRules.forEach(([regex, replacement]) => { out = out.replace(regex, replacement); });
    return lead + out + trail;
  }

  function label(value) {
    const raw = String(value == null ? "" : value);
    const titled = titleCase(raw);
    return exact[raw] || exact[titled] || translate(titled);
  }

  const translatedText = new WeakMap();

  function translateTextNode(node) {
    if (!node || node.nodeType !== Node.TEXT_NODE) return;
    const before = node.nodeValue;
    if (translatedText.get(node) === before) return;
    const after = translate(before);
    if (after !== before) node.nodeValue = after;
    translatedText.set(node, after);
  }

  function translateElement(element) {
    if (!element || element.nodeType !== 1) return;
    if (["SCRIPT", "STYLE", "NOSCRIPT"].includes(element.tagName)) return;
    ["aria-label", "title", "placeholder", "aria-description"].forEach((attr) => {
      if (element.hasAttribute(attr)) {
        const before = element.getAttribute(attr);
        const after = translate(before);
        if (after !== before) element.setAttribute(attr, after);
      }
    });
    for (const node of element.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        translateTextNode(node);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        translateElement(node);
      }
    }
  }

  function translateDocument() {
    document.documentElement.lang = "pt-BR";
    if (document.body) translateElement(document.body);
  }

  window.WB_I18N = { translate, label, exact };
  translateDocument();
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "characterData" && mutation.target.parentElement) {
        translateTextNode(mutation.target);
      }
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          translateTextNode(node);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          translateElement(node);
        }
      });
    }
  });
  if (document.body) observer.observe(document.body, { childList: true, subtree: true, characterData: true });
})();
