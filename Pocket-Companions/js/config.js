export const APP_VERSION = 25;
export const STORAGE_KEY = 'pocket-companions:saves:v1';
export const SETTINGS_KEY = 'pocket-companions:global-settings:v1';
export const ROBOT_COMPANIONS_ENABLED = false;

export const PETS = {
  apollo: {
    id: 'apollo',
    name: 'Apollo',
    model: 'assets/models/apollo_todas_animacoes.glb',
    accent: '#ff9b58',
    accent2: '#77c8ff',
    personality: 'Adventurous, bright, and always ready to explore. Apollo gains extra joy from running and obstacle games.',
    trait: 'Trailblazer',
    species: 'cat',
    voices: {
      call: 'voice-apollo-call',
      happy: 'voice-apollo-happy',
      calm: 'voice-apollo-calm'
    },
    voiceOptions: { volume: 0.82 },
    modifiers: { boredom: 1.12, obstacle: 1.2, calmBond: 0.95, foodJoy: 1.0 }
  },
  lilith: {
    id: 'lilith',
    name: 'Lilith',
    model: 'assets/models/lilith_todas_animacoes.glb',
    accent: '#a988ff',
    accent2: '#ff91bd',
    personality: 'Curious, graceful, and observant. Lilith loves hidden discoveries and builds a strong bond through calm attention.',
    trait: 'Quiet Wonder',
    species: 'cat',
    voices: {
      call: 'voice-lilith-call',
      happy: 'voice-lilith-happy',
      calm: 'voice-lilith-calm'
    },
    voiceOptions: { volume: 0.80 },
    modifiers: { boredom: 0.92, obstacle: 0.95, calmBond: 1.25, foodJoy: 0.95 }
  },
  pandora: {
    id: 'pandora',
    name: 'Pandora',
    model: 'assets/models/pandora_todas_animacoes.glb',
    accent: '#f2d8ee',
    accent2: '#b9d9ff',
    personality: 'Gentle, curious, and quietly mischievous. Pandora loves calm exploration, cozy hiding spots, and watching the world from a safe perch.',
    trait: 'Moonlit Curiosity',
    species: 'cat',
    voices: {
      call: 'voice-lilith-call',
      happy: 'voice-lilith-happy',
      calm: 'voice-lilith-calm'
    },
    voiceOptions: { volume: 0.78, rate: 1.04 },
    modifiers: { boredom: 0.96, obstacle: 1.02, calmBond: 1.22, foodJoy: 0.98 }
  },
  pietro: {
    id: 'pietro',
    name: 'Pietro',
    model: 'assets/models/pietro_todas_animacoes.glb',
    accent: '#78dfbd',
    accent2: '#ffd66b',
    personality: 'Affectionate, playful, and delightfully food-motivated. Pietro recovers happiness quickly when cared for.',
    trait: 'Big Heart',
    species: 'cat',
    voices: {
      call: 'voice-pietro-call',
      happy: 'voice-pietro-happy',
      calm: 'voice-pietro-calm'
    },
    voiceOptions: { volume: 0.84 },
    modifiers: { boredom: 1.0, obstacle: 1.0, calmBond: 1.08, foodJoy: 1.22 }
  },
  chica: {
    id: 'chica',
    name: 'Chica',
    model: 'assets/models/chica_todas_animacoes.glb',
    accent: '#f3a86f',
    accent2: '#ffd98a',
    personality: 'Warm, curious, and effortlessly charming. Chica loves gentle attention and turns everyday care into a happy little ritual.',
    trait: 'Sunny Spirit',
    species: 'dog',
    voices: {
      call: 'voice-chica-call',
      happy: 'voice-chica-happy',
      calm: 'voice-chica-calm'
    },
    voiceOptions: { volume: 0.82 },
    modifiers: { boredom: 0.96, obstacle: 1.0, calmBond: 1.18, foodJoy: 1.08 }
  },
  kate: {
    id: 'kate',
    name: 'Kate',
    model: 'assets/models/kate_todas_animacoes.glb',
    accent: '#d58fc4',
    accent2: '#91c8e8',
    personality: 'Poised, clever, and quietly affectionate. Kate notices every detail and builds trust through calm play and consistent care.',
    trait: 'Velvet Focus',
    species: 'dog',
    voices: {
      call: 'voice-kate-call',
      happy: 'voice-kate-happy',
      calm: 'voice-kate-calm'
    },
    voiceOptions: { volume: 0.74 },
    modifiers: { boredom: 0.9, obstacle: 1.02, calmBond: 1.24, foodJoy: 0.96 }
  },
  bolt: {
    id: 'bolt',
    name: 'Bolt',
    model: 'assets/models/bolt_todas_animacoes.glb',
    accent: '#67b9ff',
    accent2: '#ffe56f',
    personality: 'Fast, fearless, and bursting with playful energy. Bolt thrives on movement, agility challenges, and active adventures.',
    trait: 'Live Wire',
    species: 'dog',
    voices: {
      call: 'voice-bolt-call',
      happy: 'voice-bolt-happy',
      calm: 'voice-bolt-calm'
    },
    voiceOptions: { volume: 0.78 },
    modifiers: { boredom: 1.18, obstacle: 1.3, calmBond: 0.94, foodJoy: 1.0 }
  },
  caramelo: {
    id: 'caramelo',
    name: 'Caramelo',
    model: 'assets/models/caramelo_todas_animacoes.glb',
    accent: '#d99458',
    accent2: '#79d3b4',
    personality: 'Friendly, loyal, and impossible not to love. Caramelo is happiest near you and appreciates snacks almost as much as affection.',
    trait: 'Golden Heart',
    species: 'dog',
    voices: {
      call: 'voice-caramelo-call',
      happy: 'voice-caramelo-happy',
      calm: 'voice-caramelo-calm'
    },
    voiceOptions: { volume: 0.82 },
    modifiers: { boredom: 0.98, obstacle: 1.04, calmBond: 1.16, foodJoy: 1.2 }
  },
  kiara: {
    id: 'kiara',
    name: 'Kiara',
    model: 'assets/models/kiara_todas_animacoes.glb',
    accent: '#ae8cf2',
    accent2: '#f2a7bc',
    personality: 'Confident, attentive, and deeply loyal. Kiara enjoys exploring but forms her strongest bond through patient companionship.',
    trait: 'Loyal Spark',
    species: 'dog',
    voices: {
      call: 'voice-kiara-call',
      happy: 'voice-kiara-happy',
      calm: 'voice-kiara-calm'
    },
    voiceOptions: { volume: 0.84 },
    modifiers: { boredom: 1.0, obstacle: 1.1, calmBond: 1.2, foodJoy: 1.02 }
  },
  pacoca: {
    id: 'pacoca',
    name: 'Paçoca',
    model: 'assets/models/pacoca_todas_animacoes.glb',
    accent: '#d8a06f',
    accent2: '#fff0a6',
    personality: 'Sweet, cuddly, and full of cozy charm. Paçoca loves gentle affection, warm routines, and turns quiet moments into instant comfort.',
    trait: 'Cozy Crumb',
    species: 'dog',
    voices: {
      call: 'voice-pacoca-call',
      happy: 'voice-pacoca-happy',
      calm: 'voice-pacoca-calm'
    },
    voiceOptions: { volume: 0.78 },
    modifiers: { boredom: 0.94, obstacle: 0.98, calmBond: 1.28, foodJoy: 1.12 }
  },
  simba: {
    id: 'simba',
    name: 'Simba',
    model: 'assets/models/simba_todas_animacoes.glb',
    accent: '#e2a14b',
    accent2: '#9fd3ff',
    personality: 'Bold, playful, and proudly affectionate. Simba loves to show off, explore every corner, and reward your care with big, confident energy.',
    trait: 'Royal Bounce',
    species: 'dog',
    voices: {
      call: 'voice-simba-call',
      happy: 'voice-simba-happy',
      calm: 'voice-simba-calm'
    },
    voiceOptions: { volume: 0.80 },
    modifiers: { boredom: 1.08, obstacle: 1.16, calmBond: 1.05, foodJoy: 1.08 }
  }
};

export const ANIMATION_NAMES = [
  'idle', 'walk', 'run', 'jump_start', 'jump', 'jump_fall', 'jump_end'
];

export const NEEDS = [
  { key: 'hunger', label: 'Hunger', icon: 'meal', good: 'Well fed', low: 'Needs food' },
  { key: 'happiness', label: 'Happiness', icon: 'joy', good: 'Cheerful', low: 'Needs play' },
  { key: 'energy', label: 'Energy', icon: 'bolt', good: 'Rested', low: 'Tired' },
  { key: 'hygiene', label: 'Hygiene', icon: 'drop', good: 'Fresh', low: 'Needs cleaning' },
  { key: 'health', label: 'Health', icon: 'heart', good: 'Feeling good', low: 'Needs care' },
  { key: 'bond', label: 'Bond', icon: 'spark', good: 'Close friends', low: 'Getting acquainted' },
  { key: 'social', label: 'Sociability', icon: 'paw', good: 'Socially fulfilled', low: 'Needs company' }
];

export const FOODS = {
  meal: { id: 'meal', name: 'Balanced meal', description: 'A wholesome bowl that restores hunger and health.', hunger: 28, happiness: 3, health: 7, energy: 3, fullness: 30, sound: 'feed' },
  snack: { id: 'snack', name: 'Crunchy snack', description: 'A small bite with a happy little boost.', hunger: 12, happiness: 8, health: 0, energy: 1, fullness: 14, sound: 'crunch' },
  treat: { id: 'treat', name: 'Star treat', description: 'Pure joy, best enjoyed after a proper meal.', hunger: 7, happiness: 16, health: -1, energy: 2, fullness: 9, sound: 'treat' },
  water: { id: 'water', name: 'Fresh water', description: 'Hydration that supports health and energy.', hunger: 2, happiness: 2, health: 5, energy: 6, fullness: 5, sound: 'water' }
};

export const SHOP_OFFERS = [
  { id: 'meal', name: 'Balanced meal', description: 'A complete meal for hunger and health.', cost: 12, amount: 1, symbol: '◆' },
  { id: 'snack', name: 'Crunchy snack', description: 'A quick snack with a happiness boost.', cost: 8, amount: 1, symbol: '◇' },
  { id: 'treat', name: 'Star treat', description: 'A special treat for extra happiness.', cost: 10, amount: 1, symbol: '★' },
  { id: 'water', name: 'Fresh water', description: 'Restores hydration, health, and energy.', cost: 5, amount: 1, symbol: '◒' },
  { id: 'medicine', name: 'Gentle medicine', description: 'A care supply for moments of low health.', cost: 20, amount: 1, symbol: '+' },
];

export const ROOMS = {
  living: { id: 'living', name: 'Living room', unlockLevel: 1, cost: 0, description: 'A warm home base with everything close by.' },
  garden: { id: 'garden', name: 'Garden', unlockLevel: 2, cost: 80, description: 'Soft grass, flowers, and hidden discoveries.' },
  bedroom: { id: 'bedroom', name: 'Bedroom', unlockLevel: 2, cost: 70, description: 'A peaceful place for deeper rest.' },
  kitchen: { id: 'kitchen', name: 'Kitchen', unlockLevel: 3, cost: 110, description: 'A bright spot for meals and food discoveries.' },
  playroom: { id: 'playroom', name: 'Playroom', unlockLevel: 3, cost: 130, description: 'Extra room for toys and quick games.' },
  bathroom: { id: 'bathroom', name: 'Bathroom', unlockLevel: 4, cost: 150, description: 'A polished bath space with tubs, storage, and fresh routines.' },
  park: { id: 'park', name: 'Pocket park', unlockLevel: 4, cost: 170, description: 'A tiny outdoor park made for running.' },
  training: { id: 'training', name: 'Training area', unlockLevel: 5, cost: 220, description: 'A compact course for jumping and movement.' }
};



export const ROBOT_COMPANIONS = {
  'robot-dog': { id: 'robot-dog', name: 'Unitree Buddy', model: 'assets/models/robot_dog_unitree_go1.glb', targetHeight: 0.92, accent: '#89c4ff' },
  'robot-cat': { id: 'robot-cat', name: 'Circuit Cat', model: 'assets/models/robotic_cat.glb', targetHeight: 0.76, accent: '#ffb7d1' }
};

export const OUTDOOR_WILDLIFE = {
  rabbit: { id: 'rabbit', model: 'assets/models/rabbit_rigged.glb', targetHeight: 0.52 },
  butterfly: { id: 'butterfly', model: 'assets/models/ulysses_butterfly.glb', targetHeight: 0.12, yawOffset: Math.PI },
  butterfly2: { id: 'butterfly2', model: 'assets/models/animated_butterfly.glb', targetHeight: 0.18, yawOffset: 0 }
};

export const MINIGAMES = [
  { id: 'chase', name: 'Toy Dash', description: 'Spot the real glowing toy among fast-moving decoys and build a combo.', reward: 22, xp: 20, type: 'Reflex & focus', difficulty: 'Medium', controls: 'Tap or click the glowing toy' },
  { id: 'stars', name: 'Starlight Scoop', description: 'Move the catcher, collect falling stars, grab golden bonuses, and dodge storm clouds.', reward: 24, xp: 22, type: 'Arcade', difficulty: 'Medium', controls: 'Pointer, A/D, or arrow keys' },
  { id: 'light', name: 'Lantern Trail', description: 'Memorize an expanding sequence of lanterns and repeat it without losing the trail.', reward: 24, xp: 23, type: 'Memory sequence', difficulty: 'Progressive', controls: 'Tap the lanterns in order' },
  { id: 'hidden', name: 'Treat Detective', description: 'Use hot-and-cold clues to uncover the hidden treat with as few guesses as possible.', reward: 21, xp: 20, type: 'Logic', difficulty: 'Medium', controls: 'Choose hiding spots' },
  { id: 'rhythm', name: 'Pawbeat Studio', description: 'Play a four-lane rhythm track, chase perfect timing, and protect your combo.', reward: 28, xp: 27, type: 'Rhythm', difficulty: 'Hard', controls: 'A/S/K/L, arrows, or touch lanes' },
  { id: 'obstacle', name: 'Pocket Agility', description: 'Read each obstacle, jump over crates, and duck under ribbons in a full agility run.', reward: 30, xp: 28, type: 'Action', difficulty: 'Hard', controls: 'Jump and duck buttons or arrows' },
  { id: 'memory', name: 'Toybox Memory', description: 'Flip beautifully animated cards, match every toy pair, and keep a memory streak.', reward: 23, xp: 22, type: 'Memory match', difficulty: 'Medium', controls: 'Tap or click cards' },
  { id: 'maze', name: 'Garden Maze', description: 'Guide a tiny glow through a freshly generated maze and reach the garden gate.', reward: 29, xp: 27, type: 'Puzzle adventure', difficulty: 'Progressive', controls: 'Swipe, arrows, WASD, or direction buttons' }
];

export const COLLECTION_ITEMS = [
  { id: 'starter-bowl', type: 'Decor', name: 'Sunny bowl', description: 'The first bowl in every new home.', condition: 'Start a companion save.' },
  { id: 'rope-toy', type: 'Toy', name: 'Twist rope', description: 'A bouncy toy for energetic moments.', condition: 'Play any minigame.' },
  { id: 'moon-bed', type: 'Bed', name: 'Moon cushion', description: 'A soft bed with a sleepy crescent shape.', condition: 'Reach level 2.' },
  { id: 'garden-lamp', type: 'Lamp', name: 'Firefly lamp', description: 'A warm glow inspired by the garden.', condition: 'Visit the garden.' },
  { id: 'sparkle-pose', type: 'Photo', name: 'Sparkle pose', description: 'A celebratory pose for photo mode.', condition: 'Reach bond 70.' },
  { id: 'stargazer-memory', type: 'Memory', name: 'First stargazing', description: 'A quiet memory under the night sky.', condition: 'Visit the park at night.' }
];

export const DEFAULT_SETTINGS = {
  language: 'pt-BR',
  masterVolume: 0.75,
  musicVolume: 0.4,
  effectsVolume: 0.8,
  ambientVolume: 0.45,
  muted: false,
  reducedMotion: false,
  highContrast: false,
  textScale: 1,
  interactionSensitivity: 1,
  realTimeDecay: true,
  realTimeLighting: true,
  fixedVisualTime: 'day',
  simplifiedGames: false,
  captions: true,
  reducedWeatherEffects: false,
  emotionHints: true,
  bodyLanguageDescriptions: true,
  multiPetRendering: true,
  dynamicWeather: true,
  weatherMode: 'dynamic',
  seasonMode: 'automatic',
  lowPerformanceMode: false,
  routineLearning: true,
  routineAnticipation: 0.65,
  contextualCamera: true,
  advancedDirtEffects: true,
  simulationDebug: false
};

export const DECAY_PER_HOUR = {
  hunger: 4.2,
  happiness: 2.4,
  energy: 3.1,
  hygiene: 2.2,
  health: 0.3,
  bond: 0.08
};

export const MAX_OFFLINE_HOURS = 12;
