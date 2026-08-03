const shared = {
  player: { id: 'player-space', type: 'player', approach: [0, 1.75], actions: ['seek-player', 'request-affection'], exclusive: false },
  solitude: { id: 'quiet-corner', type: 'quiet', approach: [-2.5, 1.6], actions: ['seek-solitude', 'hide'], exclusive: true }
};

const ROOM_OBJECTS = {
  living: [
    { id: 'living-bed', type: 'bed', approach: [-1.55, -0.25], interaction: [-3.35, -1.7], surfaceY: 0.52, surfaceSize: [1.9, 1.22], surfaceYaw: -Math.PI / 2, actions: ['sleep', 'bed-rest', 'hide'], exclusive: true },
    { id: 'living-food-bowl', type: 'food', approach: [3.02, -0.68], interaction: [2.8, -1.8], actions: ['eat', 'ask-food', 'steal-food'], exclusive: true },
    { id: 'living-water-bowl', type: 'water', approach: [3.55, -0.68], interaction: [3.85, -1.8], actions: ['drink', 'ask-water'], exclusive: true },
    { id: 'living-window', type: 'window', approach: [1.65, -2.65], actions: ['window-watch', 'investigate-sound'], exclusive: true },
    { id: 'living-toy-basket', type: 'toy', approach: [2.45, 1.1], actions: ['toy-play', 'bring-toy', 'guard-object'], exclusive: true },
    { id: 'living-door', type: 'door', approach: [4.2, -1.5], actions: ['wait-door', 'investigate-sound'], exclusive: true },
    { id: 'living-shelf-perch', type: 'perch', approach: [-2.85, 0.72], interaction: [-4.35, 0.72], surfaceY: 2.24, surfaceSize: [1.72, 0.84], surfaceYaw: Math.PI / 2, actions: ['climb', 'high-rest'], species: ['cat'], exclusive: true }
  ],
  bedroom: [
    { id: 'bedroom-bed', type: 'bed', approach: [-0.25, 0.65], interaction: [-2.8, -1.4], surfaceY: 0.69, surfaceSize: [2.58, 1.72], surfaceYaw: -Math.PI / 2, actions: ['sleep', 'bed-rest', 'sleep-near-pet'], exclusive: true },
    { id: 'bedroom-under-bed', type: 'hide', approach: [-0.7, -0.2], actions: ['hide', 'seek-solitude'], exclusive: true },
    { id: 'bedroom-window', type: 'window', approach: [0.8, -2.6], actions: ['window-watch', 'investigate-sound'], exclusive: true },
    { id: 'bedroom-shelf-perch', type: 'perch', approach: [2.85, 0.32], interaction: [4.35, 0.32], surfaceY: 2.24, surfaceSize: [1.72, 0.84], surfaceYaw: Math.PI / 2, actions: ['climb', 'high-rest'], species: ['cat'], exclusive: true },
    { id: 'bedroom-pillow', type: 'movable', approach: [-1.3, -0.2], actions: ['investigate-object', 'misbehave'], exclusive: true }
  ],
  kitchen: [
    { id: 'kitchen-food-bowl', type: 'food', approach: [-2.55, -0.15], interaction: [-2.8, -1.3], actions: ['eat', 'ask-food', 'steal-food'], exclusive: true },
    { id: 'kitchen-water-bowl', type: 'water', approach: [-1.85, -0.15], interaction: [-1.75, -1.3], actions: ['drink', 'ask-water'], exclusive: true },
    { id: 'kitchen-cabinets', type: 'cabinet', approach: [3.2, -1.65], actions: ['investigate-object', 'follow-scent', 'steal-food'], exclusive: true },
    { id: 'kitchen-table', type: 'table', approach: [3.25, 1.55], actions: ['guard-object', 'investigate-object'], exclusive: true },
    { id: 'kitchen-table-perch', type: 'perch', approach: [3.1, 1.72], interaction: [0.8, 0.5], surfaceY: 1.07, surfaceSize: [3.0, 1.65], actions: ['climb', 'high-rest'], species: ['cat'], exclusive: true }
  ],
  garden: [
    { id: 'garden-bench', type: 'bench', approach: [2.05, 1.45], actions: ['sunlight-rest', 'bed-rest', 'window-watch'], exclusive: true },
    { id: 'garden-tree', type: 'tree', approach: [-2.6, -1.35], actions: ['scratch', 'investigate-sound'], exclusive: true },
    { id: 'garden-scent', type: 'scent', approach: [0.4, -1.8], actions: ['follow-scent', 'investigate-object'], exclusive: true },
    { id: 'garden-dig', type: 'soil', approach: [2.1, -1.65], actions: ['dig', 'follow-scent'], species: ['dog'], exclusive: true },
    { id: 'garden-insects', type: 'target', approach: [-0.7, 1.7], actions: ['chase-target', 'hunt'], exclusive: true },
    { id: 'garden-tree-perch', type: 'perch', approach: [-2.35, -1.05], interaction: [-3.35, -1.5], surfaceY: 0.98, surfaceSize: [1.28, 1.0], surfaceYaw: -Math.PI / 4, actions: ['climb', 'high-rest'], species: ['cat'], exclusive: true }
  ],
  playroom: [
    { id: 'playroom-toys', type: 'toy', approach: [-2.35, -1.2], actions: ['toy-play', 'bring-toy', 'guard-object'], exclusive: true },
    { id: 'playroom-moving-target', type: 'target', approach: [1.2, 0.4], actions: ['chase-target', 'hunt'], exclusive: true },
    { id: 'playroom-box', type: 'hide', approach: [2.6, 1.6], actions: ['hide', 'investigate-object'], species: ['cat'], exclusive: true },
    { id: 'playroom-puzzle', type: 'puzzle', approach: [0.4, -1.4], actions: ['investigate-object', 'toy-play'], exclusive: true }
  ],
  park: [
    { id: 'park-bench', type: 'bench', approach: [-2.0, 1.55], actions: ['sunlight-rest', 'bed-rest'], exclusive: true },
    { id: 'park-leaves', type: 'target', approach: [1.5, -1.35], actions: ['chase-target', 'hunt'], exclusive: true },
    { id: 'park-dig', type: 'soil', approach: [3.0, 1.55], actions: ['dig', 'follow-scent'], species: ['dog'], exclusive: true },
    { id: 'park-scent', type: 'scent', approach: [0.1, 1.8], actions: ['follow-scent', 'investigate-object'], exclusive: true }
  ],
  training: [
    { id: 'training-hurdles', type: 'obstacle', approach: [-4.0, -2.15], actions: ['trained-command', 'explore'], animationMapping: { 'trained-command': 'jump' }, holdMapping: { 'trained-command': 1900 }, exclusive: true },
    { id: 'training-platform', type: 'marker', approach: [1.72, 2.1], interaction: [3.4, 2.1], surfaceY: 0.46, surfaceSize: [2.25, 1.55], actions: ['trained-command', 'high-rest'], animationMapping: { 'trained-command': 'sit' }, holdMapping: { 'trained-command': 2200 }, exclusive: true },
    { id: 'training-wait', type: 'marker', approach: [0.2, -2], actions: ['wait-command', 'seek-player'], animationMapping: { 'trained-command': 'sit' }, holdMapping: { 'trained-command': 2200 }, exclusive: true }
  ]
};

export function environmentObjects(room = 'living', species = 'dog') {
  const objects = [...(ROOM_OBJECTS[room] || ROOM_OBJECTS.park), shared.player, shared.solitude];
  return objects
    .filter((object) => !object.species || object.species.includes(species))
    .map((object) => ({
      requiredOrientation: null,
      occupancy: null,
      cooldown: 0,
      animationMapping: {},
      needEffects: {},
      emotionalEffects: {},
      memoryEvents: [],
      collisionBounds: null,
      surfaceSize: null,
      surfaceYaw: null,
      surfaceMargin: 0.06,
      navigationCost: 1,
      movable: object.type === 'movable',
      canBecomeDirty: ['bed', 'toy', 'soil', 'bench'].includes(object.type),
      canBecomeDamaged: object.type === 'movable',
      ...object,
      room,
      position: object.approach
    }));
}

export function objectsForBehavior(room, species, behavior) {
  return environmentObjects(room, species).filter((object) => object.actions.includes(behavior));
}

export function reserveObject(simulation, objectId, agentId, durationMs = 12000, exclusive = true) {
  if (!simulation?.environment || !objectId) return true;
  const now = Date.now();
  cleanupReservations(simulation, now);
  const current = simulation.environment.reservations[objectId];
  if (exclusive && current && current.agentId !== agentId && current.until > now) return false;
  simulation.environment.reservations[objectId] = { agentId, until: now + Math.max(1000, durationMs), exclusive };
  return true;
}

export function releaseObject(simulation, objectId, agentId = null) {
  if (!simulation?.environment?.reservations || !objectId) return;
  const current = simulation.environment.reservations[objectId];
  if (!current || (agentId && current.agentId !== agentId)) return;
  delete simulation.environment.reservations[objectId];
}

export function cleanupReservations(simulation, now = Date.now()) {
  const reservations = simulation?.environment?.reservations;
  if (!reservations) return;
  Object.entries(reservations).forEach(([id, reservation]) => {
    if (!reservation || reservation.until <= now) delete reservations[id];
  });
}

export function chooseAvailableObject(simulation, objects, agentId, preferredObjectId = null) {
  cleanupReservations(simulation);
  const available = objects.filter((object) => {
    const reservation = simulation.environment.reservations[object.id];
    return !object.exclusive || !reservation || reservation.agentId === agentId;
  });
  if (preferredObjectId) {
    const preferred = available.find((object) => object.id === preferredObjectId);
    if (preferred) return preferred;
  }
  return available[0] || null;
}

export function semanticObjectById(room, species, objectId) {
  return environmentObjects(room, species).find((object) => object.id === objectId) || null;
}
