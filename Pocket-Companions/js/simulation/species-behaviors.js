const DOGS = new Set(['chica', 'kate', 'bolt', 'caramelo', 'kiara', 'pacoca', 'simba']);

export const PET_PHYSICAL_PROFILES = {
  apollo: { targetHeight: 1.08, radius: 0.31, size: 'cat' },
  lilith: { targetHeight: 1.08, radius: 0.31, size: 'cat' },
  pietro: { targetHeight: 1.12, radius: 0.33, size: 'cat' },
  // Dog sizes aligned with the reference app proportions:
  // small dogs ≈ 1.2x cat height, medium ≈ 1.35x, large ≈ 1.5x+
  bolt: { targetHeight: 1.22, radius: 0.34, size: 'small' },
  kate: { targetHeight: 1.24, radius: 0.35, size: 'small' },
  chica: { targetHeight: 1.44, radius: 0.41, size: 'medium' },
  caramelo: { targetHeight: 1.60, radius: 0.47, size: 'large' },
  kiara: { targetHeight: 1.62, radius: 0.48, size: 'large' },
  pacoca: { targetHeight: 1.58, radius: 0.46, size: 'large' },
  simba: { targetHeight: 1.62, radius: 0.48, size: 'large' }
};

export function speciesForPet(petId, configuredSpecies = null) {
  return configuredSpecies || (DOGS.has(petId) ? 'dog' : 'cat');
}

export function physicalProfile(petId) {
  return PET_PHYSICAL_PROFILES[petId] || { targetHeight: 1.12, radius: 0.34, size: 'medium' };
}

export function speciesBehaviorBias(species, behavior, traits = {}, physical = {}) {
  const cat = {
    climb: 28, 'high-rest': 24, scratch: 22, hunt: 24, 'chase-target': 18, hide: 12,
    'seek-solitude': 10, 'window-watch': 10, 'request-affection': -4, 'bring-toy': -9,
    'follow-scent': -6, dig: -20, 'wait-door': -12, 'trained-command': -5, 'guard-object': -5
  };
  const dog = {
    'follow-scent': 25, 'bring-toy': 24, 'wait-door': 20, 'seek-player': 14, 'social-play': 13,
    dig: 15, 'guard-object': 10, 'trained-command': 14, climb: -30, 'high-rest': -18,
    scratch: -24, hunt: -8, 'seek-solitude': -5
  };
  let bias = (species === 'cat' ? cat : dog)[behavior] || 0;
  if (species === 'cat') {
    bias += (traits.independent || 50) * (['seek-solitude', 'high-rest', 'window-watch'].includes(behavior) ? 0.08 : 0);
    bias += (traits.curious || 50) * (['hunt', 'climb', 'investigate-object'].includes(behavior) ? 0.07 : 0);
  } else {
    bias += (traits.sociable || 50) * (['seek-player', 'social-play', 'sleep-near-pet'].includes(behavior) ? 0.07 : 0);
    bias += (traits.brave || 50) * (behavior === 'guard-object' ? 0.06 : 0);
    if (physical.size === 'small' && behavior === 'dig') bias -= 3;
    if (physical.size === 'large' && behavior === 'guard-object') bias += 5;
  }
  return bias;
}

export function speciesAllows(species, behavior) {
  if (species === 'cat' && ['dig', 'wait-door'].includes(behavior)) return false;
  if (species === 'dog' && ['climb', 'high-rest', 'scratch', 'hunt'].includes(behavior)) return false;
  return true;
}
