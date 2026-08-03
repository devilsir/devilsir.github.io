export const LIVING_SCHEMA = 6;

export const TRAITS = ['playful', 'lazy', 'affectionate', 'brave', 'stubborn', 'foodMotivated', 'sociable', 'independent', 'curious', 'calm'];

export const PET_TRAIT_SEEDS = {
  apollo: { playful: 64, lazy: 25, affectionate: 58, brave: 72, stubborn: 42, foodMotivated: 48, sociable: 60, independent: 52, curious: 88, calm: 48 },
  lilith: { playful: 45, lazy: 44, affectionate: 67, brave: 55, stubborn: 49, foodMotivated: 40, sociable: 48, independent: 73, curious: 86, calm: 78 },
  pietro: { playful: 74, lazy: 48, affectionate: 88, brave: 50, stubborn: 45, foodMotivated: 86, sociable: 72, independent: 35, curious: 68, calm: 58 },
  chica: { playful: 63, lazy: 38, affectionate: 78, brave: 58, stubborn: 38, foodMotivated: 61, sociable: 75, independent: 38, curious: 71, calm: 66 },
  kate: { playful: 49, lazy: 42, affectionate: 68, brave: 61, stubborn: 52, foodMotivated: 46, sociable: 55, independent: 70, curious: 77, calm: 80 },
  bolt: { playful: 92, lazy: 12, affectionate: 64, brave: 78, stubborn: 61, foodMotivated: 55, sociable: 76, independent: 46, curious: 82, calm: 22 },
  caramelo: { playful: 70, lazy: 39, affectionate: 89, brave: 62, stubborn: 35, foodMotivated: 78, sociable: 90, independent: 28, curious: 70, calm: 65 },
  kiara: { playful: 58, lazy: 33, affectionate: 77, brave: 74, stubborn: 48, foodMotivated: 50, sociable: 69, independent: 60, curious: 76, calm: 72 },
  pacoca: { playful: 55, lazy: 63, affectionate: 92, brave: 42, stubborn: 36, foodMotivated: 73, sociable: 70, independent: 25, curious: 56, calm: 84 },
  simba: { playful: 86, lazy: 24, affectionate: 77, brave: 81, stubborn: 62, foodMotivated: 66, sociable: 78, independent: 52, curious: 80, calm: 38 }
};

export const EMOTIONS = {
  excited: { en: 'Excited', pt: 'Animado' }, bored: { en: 'Bored', pt: 'Entediado' }, frightened: { en: 'Frightened', pt: 'Assustado' },
  jealous: { en: 'Jealous', pt: 'Com ciúmes' }, sleepy: { en: 'Sleepy', pt: 'Sonolento' }, curious: { en: 'Curious', pt: 'Curioso' },
  irritated: { en: 'Irritated', pt: 'Irritado' }, content: { en: 'Content', pt: 'Contente' }, lonely: { en: 'Lonely', pt: 'Solitário' },
  proud: { en: 'Proud', pt: 'Orgulhoso' }, anxious: { en: 'Anxious', pt: 'Ansioso' }, playful: { en: 'Playful', pt: 'Brincalhão' }
};

export const FOOD_PREFERENCES = ['meal', 'snack', 'treat', 'water', 'pumpkin-bowl', 'fish-rice', 'berry-bites', 'garden-stew'];
export const TOY_PREFERENCES = ['rope-toy', 'ball', 'feather', 'puzzle-cube'];
export const ENVIRONMENT_PREFERENCES = ['living', 'garden', 'bedroom', 'kitchen', 'playroom', 'bathroom', 'park', 'training', 'beach', 'forest', 'snow-trail', 'night-park'];
export const AFFECTION_PREFERENCES = ['head', 'back', 'calm', 'playful'];
export const WEATHER_TYPES = ['clear', 'rain', 'thunderstorm', 'snow', 'fog', 'wind', 'sunshine', 'rainbow'];
export const SEASONS = ['spring', 'summer', 'autumn', 'winter'];

export const CONDITIONS = {
  cold: { name: { en: 'Mild cold', pt: 'Resfriado leve' }, causes: ['rain', 'exhaustion'], care: ['rest', 'water', 'medicine'], symptoms: { en: 'Sneezing and lower energy', pt: 'Espirros e menos energia' } },
  stomach: { name: { en: 'Upset stomach', pt: 'Estômago sensível' }, causes: ['treat', 'overeating'], care: ['rest', 'balanced-meal'], symptoms: { en: 'Lower appetite and restlessness', pt: 'Menos apetite e inquietação' } },
  fleas: { name: { en: 'Fleas', pt: 'Pulgas' }, causes: ['dirty', 'forest'], care: ['bath', 'brush'], symptoms: { en: 'Frequent scratching', pt: 'Coceira frequente' } },
  paw: { name: { en: 'Sore paw', pt: 'Patinha dolorida' }, causes: ['walk', 'agility'], care: ['rest', 'paw-clean'], symptoms: { en: 'Avoiding long movement', pt: 'Evita caminhar por muito tempo' } },
  stress: { name: { en: 'Stress', pt: 'Estresse' }, causes: ['thunderstorm', 'ignored'], care: ['calm-affection', 'rest'], symptoms: { en: 'Pacing and anxious posture', pt: 'Anda de um lado para outro e fica tenso' } },
  allergy: { name: { en: 'Mild allergy', pt: 'Alergia leve' }, causes: ['spring', 'garden'], care: ['clean', 'rest', 'medicine'], symptoms: { en: 'Sneezing and coat irritation', pt: 'Espirros e irritação no pelo' } },
  overeating: { name: { en: 'Overeating discomfort', pt: 'Desconforto por excesso de comida' }, causes: ['fullness'], care: ['rest', 'water'], symptoms: { en: 'Slower movement and low appetite', pt: 'Movimento lento e pouco apetite' } },
  dehydration: { name: { en: 'Low hydration', pt: 'Baixa hidratação' }, causes: ['water'], care: ['water'], symptoms: { en: 'Low energy and dry coat', pt: 'Pouca energia e pelo ressecado' } },
  dirtyCoat: { name: { en: 'Dirty coat irritation', pt: 'Irritação por sujeira' }, causes: ['dirty'], care: ['bath', 'brush'], symptoms: { en: 'Scratching and irritation', pt: 'Coceira e irritação' } },
  exhaustion: { name: { en: 'Exhaustion', pt: 'Exaustão' }, causes: ['energy'], care: ['sleep', 'water'], symptoms: { en: 'Very low energy', pt: 'Energia muito baixa' } }
};

export const INGREDIENTS = {
  rice: { name: { en: 'Soft rice', pt: 'Arroz macio' }, cost: 7 }, pumpkin: { name: { en: 'Pumpkin cubes', pt: 'Cubos de abóbora' }, cost: 9 },
  fish: { name: { en: 'Pocket fish', pt: 'Peixinho de bolso' }, cost: 12 }, berries: { name: { en: 'Star berries', pt: 'Frutinhas estelares' }, cost: 10 },
  herbs: { name: { en: 'Garden herbs', pt: 'Ervas do jardim' }, cost: 8 }, chicken: { name: { en: 'Tender bites', pt: 'Pedacinhos macios' }, cost: 11 },
  water: { name: { en: 'Fresh water', pt: 'Água fresca' }, cost: 4 }
};

export const RECIPES = {
  'pumpkin-bowl': { name: { en: 'Pumpkin comfort bowl', pt: 'Tigela aconchegante de abóbora' }, ingredients: { rice: 1, pumpkin: 2, water: 1 }, effects: { hunger: 30, happiness: 8, health: 8, energy: 4, hydration: 8 } },
  'fish-rice': { name: { en: 'Fish and rice plate', pt: 'Prato de peixe com arroz' }, ingredients: { rice: 1, fish: 1, water: 1 }, effects: { hunger: 34, happiness: 10, health: 7, energy: 5, hydration: 6 } },
  'berry-bites': { name: { en: 'Star berry bites', pt: 'Bolinhas de frutas estelares' }, ingredients: { berries: 2, rice: 1 }, effects: { hunger: 18, happiness: 15, health: 3, energy: 8, hydration: 2 } },
  'garden-stew': { name: { en: 'Garden explorer stew', pt: 'Ensopado do explorador' }, ingredients: { pumpkin: 1, herbs: 1, chicken: 1, water: 1 }, effects: { hunger: 38, happiness: 9, health: 12, energy: 6, hydration: 12 } }
};

export const GROOMING = {
  brush: { name: { en: 'Fur brushing', pt: 'Escovar o pelo' }, cooldown: 30 * 60 * 1000, stat: 'hygiene', gain: 12 },
  nails: { name: { en: 'Nail trimming', pt: 'Cortar as unhas' }, cooldown: 3 * 60 * 60 * 1000, stat: 'health', gain: 5 },
  ears: { name: { en: 'Ear cleaning', pt: 'Limpar as orelhas' }, cooldown: 2 * 60 * 60 * 1000, stat: 'health', gain: 5 },
  teeth: { name: { en: 'Teeth brushing', pt: 'Escovar os dentes' }, cooldown: 2 * 60 * 60 * 1000, stat: 'health', gain: 6 },
  paws: { name: { en: 'Paw cleaning', pt: 'Limpar as patinhas' }, cooldown: 45 * 60 * 1000, stat: 'hygiene', gain: 8 },
  dry: { name: { en: 'Dry after bath', pt: 'Secar depois do banho' }, cooldown: 20 * 60 * 1000, stat: 'happiness', gain: 6 }
};

export const SHAMPOOS = {
  gentle: { name: { en: 'Gentle oat shampoo', pt: 'Shampoo suave de aveia' }, tolerance: 4, prevention: 1 },
  soothing: { name: { en: 'Soothing lavender shampoo', pt: 'Shampoo calmante de lavanda' }, tolerance: 7, prevention: 2 },
  fresh: { name: { en: 'Fresh garden shampoo', pt: 'Shampoo fresco de jardim' }, tolerance: 2, prevention: 1, happiness: 3 }
};

export const COMMANDS = {
  sit: {
    name: { en: 'Sit', pt: 'Sentar' },
    description: { en: 'Sit and remain seated.', pt: 'Sentar e permanecer na pose.' },
    behavior: 'sit',
    requiredAnimations: ['sit', 'sitting_idle']
  },
  lie: {
    name: { en: 'Lie down', pt: 'Deitar' },
    description: { en: 'Lie down and remain resting.', pt: 'Deitar e permanecer descansando.' },
    behavior: 'lie',
    requiredAnimations: ['lie_down', 'lying_down_idle']
  },
  paw: {
    name: { en: 'Give paw', pt: 'Dar a pata' },
    description: { en: 'Offer one paw once.', pt: 'Dar uma pata uma única vez.' },
    behavior: 'paw',
    requiredAnimations: ['give_paw']
  },
  jump: {
    name: { en: 'Jump', pt: 'Pular' },
    description: { en: 'Perform one complete jump.', pt: 'Executar um pulo completo.' },
    behavior: 'jump',
    requiredAnimations: ['jump']
  },
  come: {
    name: { en: 'Come here', pt: 'Vir até você' },
    description: { en: 'Walk to the player position.', pt: 'Ir até a posição do tutor.' },
    behavior: 'come'
  },
  bed: {
    name: { en: 'Go to bed', pt: 'Ir para a cama' },
    description: { en: 'Go to a usable bed in the current room.', pt: 'Ir até uma cama utilizável do ambiente atual.' },
    behavior: 'bed'
  },
  marker: {
    name: { en: 'Go to platform', pt: 'Ir para a plataforma' },
    description: { en: 'Go to the training platform.', pt: 'Ir até a plataforma da área de treinamento.' },
    behavior: 'marker',
    rooms: ['training']
  }
};

export const SKILL_PATHS = {
  companion: [
    { id: 'empathy', name: { en: 'Emotional reading', pt: 'Leitura emocional' }, effect: 'preference', value: 0.15 },
    { id: 'comfort', name: { en: 'Comforting presence', pt: 'Presença acolhedora' }, effect: 'loneliness', value: 0.2 },
    { id: 'deep-bond', name: { en: 'Deep bond', pt: 'Vínculo profundo' }, effect: 'bond', value: 0.15 }
  ],
  athlete: [
    { id: 'stamina', name: { en: 'Stamina', pt: 'Resistência' }, effect: 'energy', value: 0.15 },
    { id: 'agility', name: { en: 'Agility instinct', pt: 'Instinto de agilidade' }, effect: 'minigame', value: 0.12 },
    { id: 'fast-learner', name: { en: 'Fast learner', pt: 'Aprendizado rápido' }, effect: 'training', value: 0.18 }
  ],
  explorer: [
    { id: 'keen-nose', name: { en: 'Keen nose', pt: 'Faro apurado' }, effect: 'scent', value: 0.18 },
    { id: 'pathfinder', name: { en: 'Pathfinder', pt: 'Desbravador' }, effect: 'walk', value: 0.15 },
    { id: 'rare-finder', name: { en: 'Rare finder', pt: 'Caçador de raridades' }, effect: 'rare', value: 0.14 }
  ]
};

export const LIFE_STAGES = [
  { id: 'young', name: { en: 'Young', pt: 'Jovem' }, level: 1, bond: 0 },
  { id: 'adolescent', name: { en: 'Adolescent', pt: 'Adolescente' }, level: 4, bond: 35 },
  { id: 'adult', name: { en: 'Adult', pt: 'Adulto' }, level: 8, bond: 62 },
  { id: 'veteran', name: { en: 'Veteran', pt: 'Veterano' }, level: 14, bond: 82 }
];

export const PET_QUESTS = {
  bolt: { title: { en: 'Brave Through Thunder', pt: 'Coragem na Tempestade' }, steps: [{ en: 'Stay close during a thunderstorm.', pt: 'Fique perto durante uma tempestade.' }, { en: 'Practice Stay in a safe room.', pt: 'Pratique Ficar em um lugar seguro.' }, { en: 'Take a calm walk after the rain.', pt: 'Faça um passeio calmo depois da chuva.' }] },
  pacoca: { title: { en: 'The Lost Cozy Toy', pt: 'O Brinquedo Aconchegante Perdido' }, steps: [{ en: 'Search the bedroom.', pt: 'Procure no quarto.' }, { en: 'Follow a scent trail.', pt: 'Siga uma trilha de cheiro.' }, { en: 'Return the toy to Paçoca.', pt: 'Devolva o brinquedo à Paçoca.' }] },
  chica: { title: { en: 'A Little More Trust', pt: 'Um Pouco Mais de Confiança' }, steps: [{ en: 'Offer calm affection.', pt: 'Ofereça carinho tranquilo.' }, { en: 'Complete gentle grooming.', pt: 'Complete um cuidado delicado.' }, { en: 'Visit the town square together.', pt: 'Visitem a praça juntos.' }] },
  simba: { title: { en: 'Friendly Champion', pt: 'Campeão Amigável' }, steps: [{ en: 'Practice Jump.', pt: 'Pratique Pular.' }, { en: 'Complete an agility game.', pt: 'Complete um jogo de agilidade.' }, { en: 'Celebrate without rivalry.', pt: 'Comemore sem rivalidade.' }] },
  kiara: { title: { en: 'The Place We Remember', pt: 'O Lugar que Lembramos' }, steps: [{ en: 'Find an old garden clue.', pt: 'Encontre uma pista antiga no jardim.' }, { en: 'Visit the forest.', pt: 'Visite a floresta.' }, { en: 'Take a memory photo.', pt: 'Tire uma foto de lembrança.' }] },
  apollo: { title: { en: 'The Garden Signal', pt: 'O Sinal do Jardim' }, steps: [{ en: 'Investigate the garden at sunset.', pt: 'Investigue o jardim ao pôr do sol.' }, { en: 'Find a hidden star seed.', pt: 'Encontre uma semente estelar.' }, { en: 'Unlock the secret photo spot.', pt: 'Desbloqueie o ponto secreto de foto.' }] },
  lilith: { title: { en: 'Moonlit Footprints', pt: 'Pegadas ao Luar' }, steps: [{ en: 'Visit the night park.', pt: 'Visite o parque noturno.' }, { en: 'Follow the silver clues.', pt: 'Siga as pistas prateadas.' }, { en: 'Meet the friendly apparition.', pt: 'Encontre a aparição amigável.' }] },
  pietro: { title: { en: 'The Curious Little Lock', pt: 'A Fechadura Curiosa' }, steps: [{ en: 'Find three puzzle marks.', pt: 'Encontre três marcas de quebra-cabeça.' }, { en: 'Solve the garden pattern.', pt: 'Resolva o padrão do jardim.' }, { en: 'Open the tiny secret door.', pt: 'Abra a pequena porta secreta.' }] },
  kate: { title: { en: 'A Helping Paw', pt: 'Uma Patinha Amiga' }, steps: [{ en: 'Meet a companion pet.', pt: 'Encontre outro pet.' }, { en: 'Share a toy peacefully.', pt: 'Compartilhe um brinquedo em paz.' }, { en: 'Complete a social memory.', pt: 'Complete uma memória social.' }] },
  caramelo: { title: { en: 'The Mysterious Trail', pt: 'A Trilha Misteriosa' }, steps: [{ en: 'Find the first scent clue.', pt: 'Encontre a primeira pista de cheiro.' }, { en: 'Track it through the town square.', pt: 'Siga pela praça.' }, { en: 'Discover the hidden picnic.', pt: 'Descubra o piquenique escondido.' }] }
};

export const PET_QUEST_TRIGGERS = {
  bolt: [
    { type: 'weather', key: 'weather', value: 'thunderstorm' },
    { type: 'command', key: 'commandId', value: 'stay' },
    { type: 'walk', any: [{ key: 'location', value: 'town-square' }, { key: 'room', value: 'garden' }] }
  ],
  pacoca: [
    { type: 'walk', key: 'room', value: 'bedroom' },
    { type: 'scent' },
    { type: 'secret', key: 'id', value: 'toy-under-bed' }
  ],
  chica: [
    { type: 'pet', key: 'kind', value: 'calm' },
    { type: 'groom' },
    { type: 'walk', key: 'location', value: 'town-square' }
  ],
  simba: [
    { type: 'command', key: 'commandId', value: 'jump' },
    { type: 'play', key: 'gameId', value: 'obstacle' },
    { type: 'social', key: 'kind', value: 'play' }
  ],
  kiara: [
    { type: 'secret', key: 'id', value: 'buried-chest' },
    { type: 'walk', key: 'location', value: 'forest' },
    { type: 'photo' }
  ],
  apollo: [
    { type: 'walk', key: 'room', value: 'garden' },
    { type: 'secret', any: [{ key: 'id', value: 'shooting-star' }, { key: 'id', value: 'rainbow' }] },
    { type: 'photo' }
  ],
  lilith: [
    { type: 'walk', key: 'location', value: 'night-park' },
    { type: 'scent' },
    { type: 'secret', key: 'id', value: 'apparition' }
  ],
  pietro: [
    { type: 'play', any: [{ key: 'gameId', value: 'hidden' }, { key: 'gameId', value: 'memory' }] },
    { type: 'scent' },
    { type: 'secret', key: 'id', value: 'secret-door' }
  ],
  kate: [
    { type: 'social' },
    { type: 'social', key: 'kind', value: 'share' },
    { type: 'social', any: [{ key: 'kind', value: 'rest' }, { key: 'kind', value: 'play' }] }
  ],
  caramelo: [
    { type: 'scent' },
    { type: 'walk', key: 'location', value: 'town-square' },
    { type: 'secret', key: 'id', value: 'hidden-picnic' }
  ]
};

export const WALK_LOCATIONS = {
  'town-square': { name: { en: 'Town square', pt: 'Praça da cidade' }, energy: 8, ambience: 'town', rewards: ['rice', 'berries'] },
  beach: { name: { en: 'Beach', pt: 'Praia' }, energy: 10, ambience: 'beach', rewards: ['fish', 'water'] },
  forest: { name: { en: 'Forest', pt: 'Floresta' }, energy: 12, ambience: 'forest', rewards: ['herbs', 'pumpkin'] },
  'city-street': { name: { en: 'City street', pt: 'Rua da cidade' }, energy: 9, ambience: 'city', rewards: ['rice', 'chicken'] },
  farm: { name: { en: 'Farm', pt: 'Fazenda' }, energy: 10, ambience: 'farm', rewards: ['pumpkin', 'chicken'] },
  'snow-trail': { name: { en: 'Snow trail', pt: 'Trilha na neve' }, energy: 13, ambience: 'snow', rewards: ['berries', 'water'] },
  'night-park': { name: { en: 'Night park', pt: 'Parque noturno' }, energy: 9, ambience: 'night', rewards: ['herbs', 'berries'] },
  'pet-fair': { name: { en: 'Pet fair', pt: 'Feira dos pets' }, energy: 7, ambience: 'fair', rewards: ['rice', 'treat'] }
};

export const SECRETS = {
  'buried-chest': { name: { en: 'Buried garden chest', pt: 'Baú enterrado no jardim' }, room: 'garden', reward: 45, condition: 'scent' },
  'toy-under-bed': { name: { en: 'Toy under the bed', pt: 'Brinquedo debaixo da cama' }, room: 'bedroom', reward: 25, condition: 'scent' },
  apparition: { name: { en: 'Friendly night apparition', pt: 'Aparição noturna amigável' }, room: 'night-park', reward: 60, condition: 'night' },
  'shooting-star': { name: { en: 'Shooting star', pt: 'Estrela cadente' }, room: 'park', reward: 35, condition: 'night' },
  'secret-door': { name: { en: 'Tiny secret door', pt: 'Pequena porta secreta' }, room: 'garden', reward: 40, condition: 'curious' },
  rainbow: { name: { en: 'Rainbow cache', pt: 'Esconderijo do arco-íris' }, room: 'garden', reward: 35, condition: 'rainbow' },
  'hidden-picnic': { name: { en: 'Hidden scent picnic', pt: 'Piquenique escondido pelo cheiro' }, room: 'town-square', reward: 55, condition: 'scent' }
};

export const ROOM_UPGRADES = {
  living: { name: { en: 'Living room', pt: 'Sala de estar' }, costs: [320, 720, 1450], scales: [1, 1.18, 1.38, 1.62] },
  bedroom: { name: { en: 'Bedroom', pt: 'Quarto' }, costs: [300, 680, 1380], scales: [1, 1.18, 1.38, 1.62] },
  kitchen: { name: { en: 'Kitchen', pt: 'Cozinha' }, costs: [340, 760, 1520], scales: [1, 1.18, 1.38, 1.62] },
  playroom: { name: { en: 'Playroom', pt: 'Sala de brincar' }, costs: [300, 700, 1420], scales: [1, 1.18, 1.38, 1.62] },
  bathroom: { name: { en: 'Bathroom', pt: 'Banheiro' }, costs: [320, 740, 1480], scales: [1, 1.18, 1.38, 1.62] },
  garden: { name: { en: 'Garden', pt: 'Jardim' }, costs: [360, 820, 1640], scales: [1, 1.2, 1.42, 1.68] },
  park: { name: { en: 'Park', pt: 'Parque' }, costs: [380, 860, 1720], scales: [1, 1.2, 1.42, 1.68] },
  training: { name: { en: 'Training yard', pt: 'Área de treino' }, costs: [360, 800, 1600], scales: [1, 1.2, 1.42, 1.68] }
};

export const FURNITURE = {
  sofa: { name: { en: 'Pocket sofa', pt: 'Sofá de bolso' }, cost: 90, size: [2.2, 1], comfort: 9, kind: 'sofa', rooms: ['living'] },
  'coffee-table': { name: { en: 'Round coffee table', pt: 'Mesa de centro redonda' }, cost: 72, size: [1.4, 1.0], comfort: 4, kind: 'coffee-table', rooms: ['living'] },
  armchair: { name: { en: 'Cozy armchair', pt: 'Poltrona aconchegante' }, cost: 82, size: [1.15, 1.05], comfort: 7, kind: 'armchair', rooms: ['living','bedroom'] },
  'media-console': { name: { en: 'Media console', pt: 'Rack de mídia' }, cost: 105, size: [1.8, .75], comfort: 4, kind: 'media-console', rooms: ['living'] },
  bookshelf: { name: { en: 'Low bookshelf', pt: 'Estante baixa' }, cost: 96, size: [1.6, .7], comfort: 5, kind: 'bookshelf', rooms: ['living','bedroom','bathroom'] },
  rug: { name: { en: 'Soft rug', pt: 'Tapete macio' }, cost: 42, size: [2.0, 1.4], comfort: 5, kind: 'rug', rooms: ['living','bedroom','playroom','bathroom'] },
  plant: { name: { en: 'Safe pocket plant', pt: 'Planta de bolso segura' }, cost: 48, size: [.7, .7], comfort: 3, kind: 'plant', rooms: ['living','bedroom','kitchen','playroom','bathroom','garden'] },
  lamp: { name: { en: 'Moon lamp', pt: 'Luminária lunar' }, cost: 58, size: [.7, .7], comfort: 4, kind: 'lamp', rooms: ['living','bedroom','playroom'] },

  'cozy-bed': { name: { en: 'Cozy bed', pt: 'Cama aconchegante' }, cost: 65, size: [1.8, 1.2], comfort: 8, kind: 'bed', rooms: ['bedroom','living','playroom','park'] },
  dresser: { name: { en: 'Three-drawer dresser', pt: 'Cômoda de três gavetas' }, cost: 98, size: [1.8, .75], comfort: 5, kind: 'dresser', rooms: ['bedroom'] },
  nightstand: { name: { en: 'Tiny nightstand', pt: 'Criado-mudo' }, cost: 54, size: [.75, .65], comfort: 3, kind: 'nightstand', rooms: ['bedroom'] },
  desk: { name: { en: 'Study desk', pt: 'Escrivaninha' }, cost: 110, size: [1.8, .95], comfort: 5, kind: 'desk', rooms: ['bedroom'] },
  'pet-wardrobe': { name: { en: 'Pet wardrobe', pt: 'Guarda-roupa do pet' }, cost: 125, size: [1.5, .8], comfort: 6, kind: 'wardrobe', rooms: ['bedroom'] },

  'dining-table': { name: { en: 'Dining table', pt: 'Mesa de jantar' }, cost: 120, size: [2.4, 1.45], comfort: 7, kind: 'dining-table', rooms: ['kitchen'] },
  'kitchen-island': { name: { en: 'Kitchen island', pt: 'Ilha de cozinha' }, cost: 145, size: [2.2, 1.15], comfort: 6, kind: 'kitchen-island', rooms: ['kitchen'] },
  pantry: { name: { en: 'Tall pantry', pt: 'Despensa alta' }, cost: 118, size: [1.15, .85], comfort: 4, kind: 'pantry', rooms: ['kitchen'] },
  'stool-pair': { name: { en: 'Pair of stools', pt: 'Par de banquetas' }, cost: 68, size: [1.3, .7], comfort: 4, kind: 'stools', rooms: ['kitchen'] },
  bowl: { name: { en: 'Color bowl station', pt: 'Estação de tigelas' }, cost: 30, size: [.9, .7], comfort: 2, kind: 'bowl', rooms: ['kitchen','living'] },

  bathtub: { name: { en: 'Pocket bathtub', pt: 'Banheira de bolso' }, cost: 140, size: [2.0, 1.15], comfort: 10, kind: 'bathtub', rooms: ['bathroom'] },
  toilet: { name: { en: 'Tiny toilet', pt: 'Privada compacta' }, cost: 78, size: [0.95, 0.8], comfort: 2, kind: 'toilet', rooms: ['bathroom'] },
  sink: { name: { en: 'Pet sink vanity', pt: 'Pia com gabinete' }, cost: 95, size: [1.35, 0.75], comfort: 4, kind: 'sink', rooms: ['bathroom'] },
  shower: { name: { en: 'Rain shower', pt: 'Chuveiro' }, cost: 118, size: [1.35, 1.0], comfort: 5, kind: 'shower', rooms: ['bathroom'] },
  hamper: { name: { en: 'Laundry hamper', pt: 'Cesto de roupa' }, cost: 42, size: [0.8, 0.65], comfort: 1, kind: 'hamper', rooms: ['bathroom','bedroom'] },
  mirror: { name: { en: 'Round mirror', pt: 'Espelho redondo' }, cost: 50, size: [0.9, 0.16], comfort: 3, kind: 'mirror', rooms: ['bathroom','bedroom'] },
  'bath-stool': { name: { en: 'Spa stool', pt: 'Banqueta de spa' }, cost: 56, size: [0.9, 0.72], comfort: 4, kind: 'bath-stool', rooms: ['bathroom'] },
  'towel-rack': { name: { en: 'Towel rack', pt: 'Toalheiro' }, cost: 52, size: [1.15, 0.32], comfort: 3, kind: 'towel-rack', rooms: ['bathroom'] },
  'bath-cabinet': { name: { en: 'Bathroom cabinet', pt: 'Armário de banheiro' }, cost: 112, size: [1.5, 0.62], comfort: 5, kind: 'bath-cabinet', rooms: ['bathroom'] },
  'bath-mat': { name: { en: 'Cloud bath mat', pt: 'Tapete de banho nuvem' }, cost: 46, size: [1.7, 1.0], comfort: 6, kind: 'bath-mat', rooms: ['bathroom'] },

  'scratch-post': { name: { en: 'Scratching post', pt: 'Arranhador' }, cost: 55, size: [.8, .8], comfort: 4, kind: 'post', rooms: ['playroom','living'] },
  'toy-box': { name: { en: 'Toy box', pt: 'Caixa de brinquedos' }, cost: 62, size: [1.1, .8], comfort: 5, kind: 'toy', rooms: ['playroom','living'] },
  'play-tunnel': { name: { en: 'Play tunnel', pt: 'Túnel de brincar' }, cost: 74, size: [1.8, 1.0], comfort: 6, kind: 'tunnel', rooms: ['playroom','training'] },
  'cat-tree': { name: { en: 'Climbing tower', pt: 'Torre de escalada' }, cost: 135, size: [1.35, 1.1], comfort: 10, kind: 'cat-tree', rooms: ['playroom'] },
  'low-play-table': { name: { en: 'Low play table', pt: 'Mesa baixa de brincar' }, cost: 70, size: [1.3, 1.3], comfort: 4, kind: 'low-table', rooms: ['playroom'] },
  'ball-pit': { name: { en: 'Pocket ball pit', pt: 'Piscina de bolinhas' }, cost: 128, size: [1.8, 1.45], comfort: 9, kind: 'ball-pit', rooms: ['playroom'] },

  'garden-bench': { name: { en: 'Garden bench', pt: 'Banco de jardim' }, cost: 86, size: [2.0, .75], comfort: 7, kind: 'bench', rooms: ['garden','park'] },
  planter: { name: { en: 'Flower planter', pt: 'Jardineira florida' }, cost: 64, size: [1.7, .65], comfort: 4, kind: 'planter', rooms: ['garden','park'] },
  fountain: { name: { en: 'Small fountain', pt: 'Fonte pequena' }, cost: 150, size: [1.4, 1.4], comfort: 9, kind: 'fountain', rooms: ['garden','park'] },
  pergola: { name: { en: 'Pocket pergola', pt: 'Pergolado de bolso' }, cost: 190, size: [2.4, 1.8], comfort: 11, kind: 'pergola', rooms: ['garden','park'] },
  'picnic-table': { name: { en: 'Picnic table', pt: 'Mesa de piquenique' }, cost: 128, size: [2.3, 1.65], comfort: 8, kind: 'picnic-table', rooms: ['garden','park'] },

  hurdle: { name: { en: 'Training hurdle', pt: 'Barreira de treino' }, cost: 58, size: [1.55, .45], comfort: 2, kind: 'hurdle', rooms: ['training'] },
  ramp: { name: { en: 'Agility ramp', pt: 'Rampa de agilidade' }, cost: 112, size: [2.2, 1.0], comfort: 5, kind: 'ramp', rooms: ['training'] },
  'training-platform': { name: { en: 'Training platform', pt: 'Plataforma de treino' }, cost: 96, size: [2.0, 1.5], comfort: 4, kind: 'platform', rooms: ['training'] },
  'trainer-bench': { name: { en: 'Trainer bench', pt: 'Banco do treinador' }, cost: 92, size: [2.0, .8], comfort: 5, kind: 'bench', rooms: ['training','park'] },
  'jump-ring': { name: { en: 'Jump ring', pt: 'Salto com aro' }, cost: 98, size: [1.8, .85], comfort: 3, kind: 'jump-ring', rooms: ['training'] },
  'weave-poles': { name: { en: 'Weave poles', pt: 'Postes de slalom' }, cost: 84, size: [2.4, .8], comfort: 2, kind: 'weave-poles', rooms: ['training'] },
  'trophy-shelf': { name: { en: 'Trophy shelf', pt: 'Estante de troféus' }, cost: 122, size: [1.65, .75], comfort: 4, kind: 'bookshelf', rooms: ['training'] },
  'cone-set': { name: { en: 'Cone set', pt: 'Kit de cones' }, cost: 42, size: [1.2, .9], comfort: 1, kind: 'cone-set', rooms: ['training'] }
};

export const ACCESSORIES = {

  bandana: { name: { en: 'Violet bandana', pt: 'Bandana violeta' }, cost: 55, anchor: 'neck', fit: 'bandana', model: './assets/models/accessories/bandanas/bandanas_01.glb', modelScale: 1 },
  'bandana-2': { name: { en: 'Blue bandana', pt: 'Bandana azul' }, cost: 60, anchor: 'neck', fit: 'bandana', model: './assets/models/accessories/bandanas/bandanas_02.glb', modelScale: 1 },
  'bandana-3': { name: { en: 'Forest bandana', pt: 'Bandana floresta' }, cost: 65, anchor: 'neck', fit: 'bandana', model: './assets/models/accessories/bandanas/bandanas_03.glb', modelScale: 1 },

  bow: { name: { en: 'Coral bow', pt: 'Laço coral' }, cost: 50, anchor: 'head', fit: 'bow', model: './assets/models/accessories/lacos/lacos_01.glb', modelScale: 1.35 },
  'bow-2': { name: { en: 'Blue bow', pt: 'Laço azul' }, cost: 55, anchor: 'head', fit: 'bow', model: './assets/models/accessories/lacos/lacos_02.glb', modelScale: 1.35 },
  'bow-3': { name: { en: 'Green bow', pt: 'Laço verde' }, cost: 60, anchor: 'head', fit: 'bow', model: './assets/models/accessories/lacos/lacos_03.glb', modelScale: 1.35 },

  hat: { name: { en: 'Adventure hat I', pt: 'Chapéu aventureiro I' }, cost: 85, anchor: 'head', fit: 'hat', model: './assets/models/accessories/chapeus/chapeus_01.glb', modelScale: 2, modelOffset: [0, 0.08, 0] },
  'hat-2': { name: { en: 'Adventure hat II', pt: 'Chapéu aventureiro II' }, cost: 90, anchor: 'head', fit: 'hat', model: './assets/models/accessories/chapeus/chapeus_02.glb', modelScale: 2, modelOffset: [0, 0.08, 0] },
  'hat-3': { name: { en: 'Adventure hat III', pt: 'Chapéu aventureiro III' }, cost: 95, anchor: 'head', fit: 'hat', model: './assets/models/accessories/chapeus/chapeus_03.glb', modelScale: 2, modelOffset: [0, 0.08, 0] },

  glasses: { name: { en: 'Pink glasses', pt: 'Óculos rosa' }, cost: 75, anchor: 'head', fit: 'glasses', model: './assets/models/accessories/oculos/oculos_01.glb', modelScale: 1.7 },
  'glasses-2': { name: { en: 'Blue glasses', pt: 'Óculos azul' }, cost: 80, anchor: 'head', fit: 'glasses', model: './assets/models/accessories/oculos/oculos_02.glb', modelScale: 1.7 },
  'glasses-3': { name: { en: 'Classic glasses', pt: 'Óculos clássico' }, cost: 85, anchor: 'head', fit: 'glasses', model: './assets/models/accessories/oculos/oculos_03.glb', modelScale: 1.7 },

  backpack: { name: { en: 'Coral backpack', pt: 'Mochila coral' }, cost: 90, anchor: 'back', fit: 'backpack', model: './assets/models/accessories/mochilas/mochilas_01.glb', modelScale: 1.25 },
  'backpack-2': { name: { en: 'Blue backpack', pt: 'Mochila azul' }, cost: 95, anchor: 'back', fit: 'backpack', model: './assets/models/accessories/mochilas/mochilas_02.glb', modelScale: 1.25 },
  'backpack-3': { name: { en: 'Lilac backpack', pt: 'Mochila lilás' }, cost: 100, anchor: 'back', fit: 'backpack', model: './assets/models/accessories/mochilas/mochilas_03.glb', modelScale: 1.25 },

  cape: { name: { en: 'Crimson cape', pt: 'Capa carmesim' }, cost: 80, anchor: 'back', fit: 'cape', model: './assets/models/accessories/capas/capas_01.glb', modelScale: 1.9 },
  'cape-2': { name: { en: 'Blue cape', pt: 'Capa azul' }, cost: 85, anchor: 'back', fit: 'cape', model: './assets/models/accessories/capas/capas_02.glb', modelScale: 1.9 },
  'cape-3': { name: { en: 'Forest cape', pt: 'Capa floresta' }, cost: 90, anchor: 'back', fit: 'cape', model: './assets/models/accessories/capas/capas_03.glb', modelScale: 1.9 },

};

export const EVENTS = [
  { id: 'spring-festival', name: { en: 'Spring Garden Festival', pt: 'Festival do Jardim de Primavera' }, season: 'spring' },
  { id: 'spooky-week', name: { en: 'Friendly Spooky Week', pt: 'Semana Assustadora Amigável' }, season: 'autumn' },
  { id: 'winter-lights', name: { en: 'Winter Lights', pt: 'Luzes de Inverno' }, season: 'winter' },
  { id: 'pocket-carnival', name: { en: 'Pocket Carnival', pt: 'Carnaval de Bolso' }, season: 'summer' },
  { id: 'adoption-day', name: { en: 'Adoption Day', pt: 'Dia da Adoção' }, season: null },
  { id: 'space-week', name: { en: 'Space Garden Week', pt: 'Semana do Jardim Espacial' }, season: null },
  { id: 'beach-festival', name: { en: 'Summer Beach Festival', pt: 'Festival de Verão na Praia' }, season: 'summer' }
];

export const EVENT_MISSIONS = {
  'spring-festival': [
    { type: 'groom', target: 1, label: { en: 'Complete a gentle grooming action', pt: 'Complete um cuidado de higiene' } },
    { type: 'walk', target: 1, label: { en: 'Take a spring walk', pt: 'Faça um passeio de primavera' } },
    { type: 'photo', target: 1, label: { en: 'Take a festival photo', pt: 'Tire uma foto do festival' } }
  ],
  'spooky-week': [
    { type: 'secret', target: 1, label: { en: 'Discover a secret', pt: 'Descubra um segredo' } },
    { type: 'play', target: 2, label: { en: 'Complete two minigames', pt: 'Complete dois minijogos' } },
    { type: 'cook', target: 1, label: { en: 'Prepare a cozy meal', pt: 'Prepare uma refeição aconchegante' } }
  ],
  'winter-lights': [
    { type: 'walk', target: 1, label: { en: 'Visit the snow trail', pt: 'Visite a trilha na neve' }, detail: { key: 'location', value: 'snow-trail' } },
    { type: 'pet', target: 1, label: { en: 'Share calm affection', pt: 'Compartilhe carinho tranquilo' } },
    { type: 'photo', target: 1, label: { en: 'Capture the winter lights', pt: 'Fotografe as luzes de inverno' } }
  ],
  'pocket-carnival': [
    { type: 'play', target: 3, label: { en: 'Play three different games', pt: 'Jogue três jogos diferentes' } },
    { type: 'social', target: 1, label: { en: 'Celebrate with another pet', pt: 'Comemore com outro pet' } },
    { type: 'command', target: 1, label: { en: 'Perform a learned command', pt: 'Execute um comando aprendido' } }
  ],
  'adoption-day': [
    { type: 'feed', target: 1, label: { en: 'Share a favorite meal', pt: 'Compartilhe uma refeição favorita' } },
    { type: 'pet', target: 1, label: { en: 'Spend a calm moment together', pt: 'Passe um momento tranquilo juntos' } },
    { type: 'photo', target: 1, label: { en: 'Take an adoption-day photo', pt: 'Tire uma foto do dia da adoção' } }
  ],
  'space-week': [
    { type: 'dream', target: 1, label: { en: 'Enter a dream', pt: 'Entre em um sonho' } },
    { type: 'secret', target: 1, label: { en: 'Find a strange signal', pt: 'Encontre um sinal estranho' } },
    { type: 'play', target: 2, label: { en: 'Play two focus games', pt: 'Jogue dois jogos de foco' } }
  ],
  'beach-festival': [
    { type: 'walk', target: 1, label: { en: 'Visit the beach', pt: 'Visite a praia' }, detail: { key: 'location', value: 'beach' } },
    { type: 'cook', target: 1, label: { en: 'Prepare a fresh meal', pt: 'Prepare uma refeição fresca' } },
    { type: 'photo', target: 1, label: { en: 'Take a beach photo', pt: 'Tire uma foto na praia' } }
  ]
};

export const PET_ACCESSORY_FITS = {
  default: {
    scale: 1,
    head: [0, 0, 0],
    neck: [0, 0, 0],
    back: [0, 0, 0],
    accessories: {
      bandana: { position: [0, -0.055, 0.08], rotation: [0, 0, 0], scale: 1 },
      bow: { position: [0.075, 0.105, 0.025], rotation: [0, 0, 0.32], scale: 1 },
      hat: { position: [0, 0.13, 0], rotation: [0, 0, 0], scale: 1 },
      glasses: { position: [0, -0.085, 0.115], rotation: [0, 0, 0], scale: 0.62 },
      backpack: { position: [0, 0.095, -0.065], rotation: [0.08, 0, 0], scale: 1 },
      cape: { position: [0, 0.08, -0.015], rotation: [0, 0, 0], scale: 1 }
    }
  },
  apollo: {
    scale: 1,
    bones: { head: 'head0', neck: 'neck0', back: 'body_top0' },
    accessories: {
      bandana: { position: [0, -0.055, 0.075], rotation: [0, 0, 0], scale: 0.88 },
      bow: { position: [0.075, 0.105, 0.02], rotation: [0, 0, 0.32], scale: 0.65 },
      hat: { position: [0, 0.135, -0.005], rotation: [0, 0, 0], scale: 0.64 },
      glasses: { position: [0, -0.04, 0.135], rotation: [0, 0, 0], scale: 0.62 },
      backpack: { position: [0, 0.095, -0.075], rotation: [0.08, 0, 0], scale: 0.86 },
      cape: { position: [0, 0.075, -0.02], rotation: [0, 0, 0], scale: 0.9 },
    }
  },
  lilith: {
    scale: 1,
    bones: { head: 'head0', neck: 'neck0', back: 'body_top0' },
    accessories: {
      bandana: { position: [0, -0.05, 0.07], rotation: [0, 0, 0], scale: 0.86 },
      bow: { position: [0.07, 0.1, 0.025], rotation: [0, 0, 0.3], scale: 0.58 },
      hat: { position: [0, 0.12, 0], rotation: [0, 0, 0], scale: 0.6 },
      glasses: { position: [0, 0.02, 0.18], rotation: [0, 0, 0], scale: 0.6 },
      backpack: { position: [0, 0.09, -0.055], rotation: [0.08, 0, 0], scale: 0.84 },
      cape: { position: [0, 0.075, -0.005], rotation: [0, 0, 0], scale: 0.88 },
    }
  },
  pietro: {
    scale: 1,
    bones: { head: 'head0', neck: 'neck0', back: 'body_top0' },
    accessories: {
      bandana: { position: [0, -0.05, 0.08], rotation: [0, 0, 0], scale: 0.92 },
      bow: { position: [0.08, 0.1, 0.02], rotation: [0, 0, 0.3], scale: 0.62 },
      hat: { position: [0, 0.135, 0], rotation: [0, 0, 0], scale: 0.68 },
      glasses: { position: [0, -0.04, 0.24], rotation: [0, 0, 0], scale: 0.66 },
      backpack: { position: [0, 0.1, -0.055], rotation: [0.08, 0, 0], scale: 0.9 },
      cape: { position: [0, 0.08, -0.01], rotation: [0, 0, 0], scale: 0.94 },
    }
  },
  chica: {
    scale: 1,
    bones: { head: 'head0', neck: 'neck0', back: 'body_top0' },
    accessories: {
      bandana: { position: [0, -0.06, 0.085], rotation: [0, 0, 0], scale: 0.92 },
      bow: { position: [0.08, 0.11, 0.025], rotation: [0, 0, 0.32], scale: 0.68 },
      hat: { position: [0, 0.14, 0], rotation: [0, 0, 0], scale: 0.71 },
      glasses: { position: [0, -0.105, 0.105], rotation: [0, 0, 0], scale: 0.59 },
      backpack: { position: [0, 0.1, -0.075], rotation: [0.08, 0, 0], scale: 0.92 },
      cape: { position: [0, 0.075, -0.02], rotation: [0, 0, 0], scale: 0.98 },
    }
  },
  kate: {
    scale: 1,
    bones: { head: 'head0', neck: 'neck0', back: 'body_top0' },
    accessories: {
      bandana: { position: [0, -0.055, 0.085], rotation: [0, 0, 0], scale: 0.96 },
      bow: { position: [0.085, 0.105, 0.02], rotation: [0, 0, 0.32], scale: 0.72 },
      hat: { position: [0, 0.13, 0], rotation: [0, 0, 0], scale: 0.78 },
      glasses: { position: [0, -0.1, 0.12], rotation: [0, 0, 0], scale: 0.64 },
      backpack: { position: [0, 0.105, -0.055], rotation: [0.08, 0, 0], scale: 0.96 },
      cape: { position: [0, 0.08, -0.01], rotation: [0, 0, 0], scale: 1 },
    }
  },
  bolt: {
    scale: 1,
    bones: { head: 'head0', neck: 'neck0', back: 'body_top0' },
    accessories: {
      bandana: { position: [0, -0.06, 0.085], rotation: [0, 0, 0], scale: 0.9 },
      bow: { position: [0.075, 0.11, 0.025], rotation: [0, 0, 0.32], scale: 0.65 },
      hat: { position: [0, 0.14, 0], rotation: [0, 0, 0], scale: 0.68 },
      glasses: { position: [0, -0.095, 0.115], rotation: [0, 0, 0], scale: 0.62 },
      backpack: { position: [0, 0.1, -0.06], rotation: [0.08, 0, 0], scale: 0.9 },
      cape: { position: [0, 0.08, -0.01], rotation: [0, 0, 0], scale: 0.94 },
    }
  },
  caramelo: {
    scale: 1,
    bones: { head: 'head0', neck: 'neck0', back: 'body_top0' },
    accessories: {
      bandana: { position: [0, -0.055, 0.09], rotation: [0, 0, 0], scale: 1 },
      bow: { position: [0.075, 0.105, 0.025], rotation: [0, 0, 0.32], scale: 0.72 },
      hat: { position: [0, 0.125, 0], rotation: [0, 0, 0], scale: 0.78 },
      glasses: { position: [0, -0.105, 0.115], rotation: [0, 0, 0], scale: 0.64 },
      backpack: { position: [0, 0.1, -0.07], rotation: [0.08, 0, 0], scale: 0.98 },
      cape: { position: [0, 0.08, -0.015], rotation: [0, 0, 0], scale: 1.02 },
    }
  },
  kiara: {
    scale: 1,
    bones: { head: 'head0', neck: 'neck0', back: 'body_top0' },
    accessories: {
      bandana: { position: [0, -0.055, 0.09], rotation: [0, 0, 0], scale: 0.99 },
      bow: { position: [0.075, 0.105, 0.025], rotation: [0, 0, 0.32], scale: 0.72 },
      hat: { position: [0, 0.12, 0], rotation: [0, 0, 0], scale: 0.78 },
      glasses: { position: [0, -0.1, 0.11], rotation: [0, 0, 0], scale: 0.62 },
      backpack: { position: [0, 0.1, -0.07], rotation: [0.08, 0, 0], scale: 0.97 },
      cape: { position: [0, 0.08, -0.015], rotation: [0, 0, 0], scale: 1.01 },
    }
  },
  pacoca: {
    scale: 1,
    bones: { head: 'head0', neck: 'neck0', back: 'body_top0' },
    accessories: {
      bandana: { position: [0, -0.06, 0.085], rotation: [0, 0, 0], scale: 0.92 },
      bow: { position: [0.07, 0.105, 0.025], rotation: [0, 0, 0.32], scale: 0.65 },
      hat: { position: [0, 0.13, 0], rotation: [0, 0, 0], scale: 0.72 },
      glasses: { position: [0, -0.095, 0.115], rotation: [0, 0, 0], scale: 0.6 },
      backpack: { position: [0, 0.1, -0.06], rotation: [0.08, 0, 0], scale: 0.88 },
      cape: { position: [0, 0.08, -0.01], rotation: [0, 0, 0], scale: 0.92 },
    }
  },
  simba: {
    scale: 1,
    bones: { head: 'head0', neck: 'neck0', back: 'body_top0' },
    accessories: {
      bandana: { position: [0, -0.055, 0.095], rotation: [0, 0, 0], scale: 1.04 },
      bow: { position: [0.08, 0.11, 0.03], rotation: [0, 0, 0.32], scale: 0.74 },
      hat: { position: [0, 0.14, 0], rotation: [0, 0, 0], scale: 0.82 },
      glasses: { position: [0, -0.105, 0.12], rotation: [0, 0, 0], scale: 0.68 },
      backpack: { position: [0, 0.105, -0.075], rotation: [0.08, 0, 0], scale: 1.02 },
      cape: { position: [0, 0.085, -0.02], rotation: [0, 0, 0], scale: 1.06 },
    }
  }
};

export const DREAMS = {
  treats: { name: { en: 'Giant Treat Chase', pt: 'Caçada aos Petiscos Gigantes' } }, clouds: { name: { en: 'Cloud Flight', pt: 'Voo entre Nuvens' } },
  space: { name: { en: 'Space Garden', pt: 'Jardim Espacial' } }, vacuum: { name: { en: 'The Playful Vacuum', pt: 'O Aspirador Brincalhão' } },
  ocean: { name: { en: 'Ocean of Toys', pt: 'Oceano de Brinquedos' } }, stars: { name: { en: 'Following Stars', pt: 'Seguindo Estrelas' } },
  memory: { name: { en: 'A Remembered Place', pt: 'Um Lugar Lembrado' } }, friends: { name: { en: 'Symbolic Friends', pt: 'Amigos Simbólicos' } }
};

export const ANIMATION_CAPABILITIES = {
  apollo: ['bite_attack','get_up_from_lying_down','idle','jump','jump_end','jump_fall','jump_start','lie_down','lying_down_idle','paw_attack','run','walk'],
  lilith: ['bite_attack','get_up_from_lying_down','idle','jump','jump_end','jump_fall','jump_start','lie_down','lying_down_idle','paw_attack','run','walk'],
  pietro: ['bite_attack','get_up_from_lying_down','idle','jump','jump_end','jump_fall','jump_start','lie_down','lying_down_idle','paw_attack','run','walk'],
  caramelo: ['bite_attack','get_up_from_lying_down','get_up_from_sitting','give_paw','idle','jump','jump_end','jump_fall','jump_start','lie_down','lying_down_idle','paw_attack','run','sit','sitting_idle','sleep','threaten','walk'],
  bolt: ['bite_attack','get_up_from_lying_down','get_up_from_sitting','give_paw','idle','jump','jump_end','jump_fall','jump_start','lie_down','lying_down_idle','paw_attack','run','sit','sitting_idle','sleep','threaten','walk'],
  chica: ['bite_attack','get_up_from_lying_down','get_up_from_sitting','give_paw','idle','jump','jump_end','jump_fall','jump_start','lie_down','lying_down_idle','paw_attack','run','sit','sitting_idle','sleep','threaten','walk'],
  kate: ['bite_attack','get_up_from_lying_down','get_up_from_sitting','give_paw','idle','jump','jump_end','jump_fall','jump_start','lie_down','lying_down_idle','paw_attack','run','sit','sitting_idle','sleep','threaten','walk'],
  kiara: ['bite_attack','get_up_from_lying_down','get_up_from_sitting','give_paw','idle','jump','jump_end','jump_fall','jump_start','lie_down','lying_down_idle','paw_attack','run','sit','sitting_idle','sleep','threaten','walk'],
  pacoca: ['bite_attack','get_up_from_lying_down','get_up_from_sitting','give_paw','idle','jump','jump_end','jump_fall','jump_start','lie_down','lying_down_idle','paw_attack','run','sit','sitting_idle','sleep','threaten','walk'],
  simba: ['bite_attack','get_up_from_lying_down','get_up_from_sitting','give_paw','idle','jump','jump_end','jump_fall','jump_start','lie_down','lying_down_idle','paw_attack','run','sit','sitting_idle','sleep','threaten','walk']
};
