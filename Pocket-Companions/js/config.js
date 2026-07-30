export const APP_VERSION = 1;
export const STORAGE_KEY = 'pocket-companions:saves:v1';
export const SETTINGS_KEY = 'pocket-companions:global-settings:v1';

export const PETS = {
  apollo: {
    id: 'apollo',
    name: 'Apollo',
    model: 'assets/models/apollo_todas_animacoes.glb',
    accent: '#ff9b58',
    accent2: '#77c8ff',
    personality: 'Adventurous, bright, and always ready to explore. Apollo gains extra joy from running and obstacle games.',
    trait: 'Trailblazer',
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
    modifiers: { boredom: 0.92, obstacle: 0.95, calmBond: 1.25, foodJoy: 0.95 }
  },
  pietro: {
    id: 'pietro',
    name: 'Pietro',
    model: 'assets/models/pietro_todas_animacoes.glb',
    accent: '#78dfbd',
    accent2: '#ffd66b',
    personality: 'Affectionate, playful, and delightfully food-motivated. Pietro recovers happiness quickly when cared for.',
    trait: 'Big Heart',
    modifiers: { boredom: 1.0, obstacle: 1.0, calmBond: 1.08, foodJoy: 1.22 }
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
  { key: 'bond', label: 'Bond', icon: 'spark', good: 'Close friends', low: 'Getting acquainted' }
];

export const FOODS = {
  meal: { id: 'meal', name: 'Balanced meal', description: 'A wholesome bowl that restores hunger and health.', hunger: 28, happiness: 3, health: 7, energy: 3, fullness: 30, sound: 'feed' },
  snack: { id: 'snack', name: 'Crunchy snack', description: 'A small bite with a happy little boost.', hunger: 12, happiness: 8, health: 0, energy: 1, fullness: 14, sound: 'crunch' },
  treat: { id: 'treat', name: 'Star treat', description: 'Pure joy, best enjoyed after a proper meal.', hunger: 7, happiness: 16, health: -1, energy: 2, fullness: 9, sound: 'treat' },
  water: { id: 'water', name: 'Fresh water', description: 'Hydration that supports health and energy.', hunger: 2, happiness: 2, health: 5, energy: 6, fullness: 5, sound: 'water' }
};

export const ROOMS = {
  living: { id: 'living', name: 'Living room', unlockLevel: 1, cost: 0, description: 'A warm home base with everything close by.' },
  garden: { id: 'garden', name: 'Garden', unlockLevel: 2, cost: 80, description: 'Soft grass, flowers, and hidden discoveries.' },
  bedroom: { id: 'bedroom', name: 'Bedroom', unlockLevel: 2, cost: 70, description: 'A peaceful place for deeper rest.' },
  kitchen: { id: 'kitchen', name: 'Kitchen', unlockLevel: 3, cost: 110, description: 'A bright spot for meals and food discoveries.' },
  playroom: { id: 'playroom', name: 'Playroom', unlockLevel: 3, cost: 130, description: 'Extra room for toys and quick games.' },
  park: { id: 'park', name: 'Pocket park', unlockLevel: 4, cost: 170, description: 'A tiny outdoor park made for running.' },
  training: { id: 'training', name: 'Training area', unlockLevel: 5, cost: 220, description: 'A compact course for jumping and movement.' }
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
  captions: true
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
