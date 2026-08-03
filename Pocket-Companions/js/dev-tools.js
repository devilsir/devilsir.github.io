import { COLLECTION_ITEMS, PETS, ROOMS } from './config.js';
import {
  ACCESSORIES, COMMANDS, FURNITURE, ROOM_UPGRADES, INGREDIENTS, RECIPES,
  SEASONS, SECRETS, SKILL_PATHS, WALK_LOCATIONS, WEATHER_TYPES
} from './living-data.js';
import { EMERGENT_EVENTS, eventLabel } from './simulation/events.js';
import { BEHAVIORS } from './simulation/utility-ai.js';

const SECRET = 'nardelli';
const DEV_LEVEL = 99;
const DEV_CURRENCY = 999999;
const DEV_STOCK = 999;
const OUTDOOR_ROOMS = new Set(['garden', 'park', 'training']);

const BEHAVIOR_LABELS = {
  'idle-observe': 'Observar parado', sleep: 'Dormir', 'bed-rest': 'Descansar na cama', eat: 'Comer', drink: 'Beber água',
  'ask-food': 'Pedir comida', 'ask-water': 'Pedir água', 'seek-player': 'Procurar tutor', 'request-affection': 'Pedir carinho',
  'avoid-affection': 'Evitar carinho', 'toy-play': 'Brincar com brinquedo', 'bring-toy': 'Buscar brinquedo',
  'social-play': 'Brincar com outro pet', explore: 'Explorar ambiente', 'favorite-place': 'Ir ao lugar favorito', hide: 'Se esconder',
  'window-watch': 'Observar pela janela', 'sunlight-rest': 'Descansar no sol', 'avoid-rain': 'Procurar abrigo',
  'investigate-sound': 'Investigar som', 'fear-response': 'Reagir ao medo', 'trained-command': 'Usar plataforma de treino',
  misbehave: 'Aprontar', groom: 'Se limpar', scratch: 'Arranhar árvore', dig: 'Cavar', climb: 'Subir em superfície',
  'high-rest': 'Descansar no alto', 'follow-scent': 'Seguir cheiro', 'guard-object': 'Guardar objeto',
  'sleep-near-pet': 'Dormir perto do outro pet', 'seek-solitude': 'Ir ao canto tranquilo', 'chase-target': 'Perseguir alvo',
  hunt: 'Caçar alvo', 'wait-door': 'Esperar na porta', 'investigate-object': 'Investigar objeto'
};

const WEATHER_LABELS = {
  dynamic: 'Dinâmico', clear: 'Céu limpo', rain: 'Chuva', thunderstorm: 'Temporal', snow: 'Neve', fog: 'Neblina',
  sunshine: 'Sol forte', rainbow: 'Arco-íris', wind: 'Vento'
};

const SEASON_LABELS = { automatic: 'Automática', spring: 'Primavera', summer: 'Verão', autumn: 'Outono', winter: 'Inverno' };
const TIME_LABELS = { automatic: 'Horário real', morning: 'Manhã', day: 'Dia', sunset: 'Pôr do sol', night: 'Noite' };

const $ = (selector, root = document) => root.querySelector(selector);

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function option(value, label) {
  const entry = document.createElement('option');
  entry.value = value;
  entry.textContent = label;
  return entry;
}

export class DevTools {
  constructor({ store, scene, living, toast = () => {}, refreshMain = () => {} }) {
    this.store = store;
    this.scene = scene;
    this.living = living;
    this.toast = toast;
    this.refreshMain = refreshMain;

    this.enabled = sessionStorage.getItem('pocket-companions-dev-mode') === '1';
    this.sequenceIndex = 0;
    this.randomTimer = null;
    this.randomEnabled = false;
    this.randomInterval = 2400;
    this.previousAutonomy = true;
    this.worldSnapshot = null;

    this.panel = $('#dev-panel');
    this.petLabel = $('#dev-pet-name');
    this.animationSelect = $('#dev-animation-select');
    this.currentAnimation = $('#dev-current-animation');
    this.randomToggle = $('#dev-random-toggle');
    this.randomSpeed = $('#dev-random-speed');
    this.randomSpeedValue = $('#dev-random-speed-value');
    this.behaviorSelect = $('#dev-behavior-select');
    this.weatherSelect = $('#dev-weather-select');
    this.seasonSelect = $('#dev-season-select');
    this.roomSelect = $('#dev-room-select');
    this.timeSelect = $('#dev-time-select');
    this.eventSelect = $('#dev-event-select');
    this.worldSummary = $('#dev-world-summary');
    this.status = $('#dev-status');

    this.populateControls();
    this.bind();
    this.renderVisibility();
  }

  populateControls() {
    if (this.behaviorSelect) {
      this.behaviorSelect.innerHTML = '';
      BEHAVIORS.forEach((behavior) => this.behaviorSelect.append(option(behavior.id, BEHAVIOR_LABELS[behavior.id] || behavior.id)));
      this.behaviorSelect.value = 'explore';
    }
    if (this.weatherSelect) {
      this.weatherSelect.innerHTML = '';
      ['dynamic', ...WEATHER_TYPES].forEach((id) => this.weatherSelect.append(option(id, WEATHER_LABELS[id] || id)));
    }
    if (this.seasonSelect) {
      this.seasonSelect.innerHTML = '';
      ['automatic', ...SEASONS].forEach((id) => this.seasonSelect.append(option(id, SEASON_LABELS[id] || id)));
    }
    if (this.roomSelect) {
      this.roomSelect.innerHTML = '';
      Object.values(ROOMS).forEach((room) => this.roomSelect.append(option(room.id, room.name)));
    }
    if (this.timeSelect) {
      this.timeSelect.innerHTML = '';
      Object.entries(TIME_LABELS).forEach(([id, label]) => this.timeSelect.append(option(id, label)));
    }
    if (this.eventSelect) {
      this.eventSelect.innerHTML = '';
      EMERGENT_EVENTS.forEach((event) => this.eventSelect.append(option(event.id, eventLabel(event.id, 'pt-BR'))));
    }
  }

  bind() {
    window.addEventListener('keydown', (event) => this.handleSecret(event), true);
    $('#dev-close')?.addEventListener('click', () => this.deactivate());
    $('#dev-maximize')?.addEventListener('click', () => this.applyMaximums({ announce: true }));
    $('#dev-play-once')?.addEventListener('click', () => this.playSelected(false));
    $('#dev-play-loop')?.addEventListener('click', () => this.playSelected(true));
    $('#dev-play-idle')?.addEventListener('click', () => this.playIdle());
    $('#dev-trigger-behavior')?.addEventListener('click', () => this.triggerSelectedBehavior());
    $('#dev-stop-behavior')?.addEventListener('click', () => this.stopBehaviorTest());
    $('#dev-apply-weather')?.addEventListener('click', () => this.applyWeather(this.weatherSelect?.value || 'dynamic', { ensureVisible: true }));
    $('#dev-apply-season')?.addEventListener('click', () => this.applySeason(this.seasonSelect?.value || 'automatic'));
    $('#dev-go-room')?.addEventListener('click', () => this.changeRoom(this.roomSelect?.value || 'living'));
    $('#dev-apply-time')?.addEventListener('click', () => this.applyTime(this.timeSelect?.value || 'automatic'));
    $('#dev-restore-world')?.addEventListener('click', () => this.restoreWorldSnapshot({ announce: true }));
    $('#dev-trigger-event')?.addEventListener('click', () => this.triggerEmergentEvent(this.eventSelect?.value));
    $('#dev-clear-event')?.addEventListener('click', () => this.clearEmergentEvent());

    document.querySelectorAll('[data-dev-behavior]').forEach((button) => {
      button.addEventListener('click', () => this.triggerBehaviorPreset(button.dataset.devBehavior));
    });
    document.querySelectorAll('[data-dev-weather]').forEach((button) => {
      button.addEventListener('click', () => this.applyWeather(button.dataset.devWeather, { ensureVisible: true }));
    });

    this.randomToggle?.addEventListener('change', () => this.setRandomAnimations(this.randomToggle.checked));
    this.randomSpeed?.addEventListener('input', () => {
      this.randomInterval = Number(this.randomSpeed.value) || 2400;
      if (this.randomSpeedValue) this.randomSpeedValue.textContent = `${(this.randomInterval / 1000).toFixed(1)} s`;
      if (this.randomEnabled) this.restartRandomTimer();
    });

    this.scene.addEventListener?.('pet-changed', () => {
      if (!this.enabled) return;
      this.refreshAnimations();
      this.updatePetLabel();
      this.syncWorldControls();
    });
    this.scene.addEventListener?.('autonomous-arrived', (event) => {
      if (!this.enabled || !event.detail?.action?.devForced) return;
      this.setStatus(`${BEHAVIOR_LABELS[event.detail.action.id] || event.detail.action.id}: pet chegou ao alvo físico.`);
    });
    this.scene.addEventListener?.('autonomous-complete', (event) => {
      if (!this.enabled || !event.detail?.action?.devForced) return;
      this.setStatus(`${BEHAVIOR_LABELS[event.detail.action.id] || event.detail.action.id}: teste concluído (${event.detail.outcome || 'completed'}).`);
    });
    this.scene.addEventListener?.('path-blocked', (event) => {
      if (!this.enabled || !event.detail?.action?.devForced) return;
      this.setStatus(`Rota bloqueada para ${BEHAVIOR_LABELS[event.detail.action.id] || event.detail.action.id}. A colisão impediu o pet de atravessar o cenário.`);
    });
    this.scene.addEventListener?.('dayphase', () => this.syncWorldControls());
    this.living.addEventListener?.('emergent-event', (event) => {
      if (!this.enabled) return;
      const detail = event.detail || {};
      if (detail.phase === 'resolved') this.setStatus('Evento emergente encerrado.');
      else if (detail.event) this.setStatus(`Evento emergente ativo: ${eventLabel(detail.event.id, 'pt-BR')}.`);
    });

    ['slot-created', 'slot-selected', 'imported'].forEach((eventName) => {
      this.store.addEventListener(eventName, () => {
        if (!this.enabled) return;
        queueMicrotask(() => this.applyMaximums({ announce: false }));
      });
    });
  }

  handleSecret(event) {
    if (event.ctrlKey || event.metaKey || event.altKey || event.isComposing) return;
    const key = String(event.key || '').toLowerCase();
    if (key.length !== 1 || !/[a-z]/.test(key)) return;

    if (key === SECRET[this.sequenceIndex]) this.sequenceIndex += 1;
    else this.sequenceIndex = key === SECRET[0] ? 1 : 0;

    if (this.sequenceIndex === SECRET.length) {
      this.sequenceIndex = 0;
      this.toggle();
    }
  }

  toggle() {
    if (this.enabled) this.deactivate();
    else this.activate();
  }

  activate({ silent = false } = {}) {
    this.enabled = true;
    sessionStorage.setItem('pocket-companions-dev-mode', '1');
    this.captureWorldSnapshot();
    this.renderVisibility();
    this.applyMaximums({ announce: false });
    this.refreshAnimations();
    this.updatePetLabel();
    this.syncWorldControls();
    if (!silent) this.toast('Modo DEV NARDELLI ativado. Animações, eventos e mundo liberados para teste.');
    this.setStatus('Ativo. Use os testes abaixo ou digite NARDELLI novamente para desativar.');
  }

  deactivate() {
    this.setRandomAnimations(false);
    this.living.stopForcedAutonomousAction?.();
    this.living.clearEmergentEvent?.();
    void this.restoreWorldSnapshot({ announce: false });
    this.enabled = false;
    sessionStorage.removeItem('pocket-companions-dev-mode');
    this.renderVisibility();
    this.toast('Modo DEV NARDELLI desativado. Mundo de teste restaurado.');
  }

  renderVisibility() {
    document.body.classList.toggle('dev-mode-active', this.enabled);
    if (this.panel) this.panel.hidden = !this.enabled;
    if (this.enabled) {
      this.updatePetLabel();
      this.refreshAnimations();
      this.syncWorldControls();
      this.setStatus(this.store.active ? 'Ferramentas prontas para o pet ativo.' : 'Abra ou crie um save para usar os testes.');
    }
  }

  onGameEntered() {
    if (!this.enabled) return;
    this.captureWorldSnapshot();
    this.applyMaximums({ announce: false });
    this.refreshAnimations();
    this.updatePetLabel();
    this.syncWorldControls();
  }

  captureWorldSnapshot() {
    const slot = this.store.active;
    const state = this.living.ensure?.();
    if (!slot || !state || this.worldSnapshot?.slotId === slot.id) return;
    this.worldSnapshot = {
      slotId: slot.id,
      room: slot.activeRoom,
      weather: state.world.weather,
      fixedWeather: state.world.fixedWeather,
      season: state.world.season,
      fixedSeason: state.world.fixedSeason,
      realTimeLighting: this.store.settings.realTimeLighting,
      fixedVisualTime: this.store.settings.fixedVisualTime
    };
  }

  async restoreWorldSnapshot({ announce = false } = {}) {
    const snapshot = this.worldSnapshot;
    const slot = this.store.active;
    const state = this.living.ensure?.();
    if (!snapshot || !slot || !state || snapshot.slotId !== slot.id) return false;
    state.world.weather = snapshot.weather;
    state.world.fixedWeather = snapshot.fixedWeather;
    state.world.season = snapshot.season;
    state.world.fixedSeason = snapshot.fixedSeason;
    this.store.updateSettings({ realTimeLighting: snapshot.realTimeLighting, fixedVisualTime: snapshot.fixedVisualTime });
    await this.changeRoom(snapshot.room, { quiet: true, preserveForcedAction: false });
    this.scene.applyLighting?.();
    this.scene.setWorldState?.({ weather: this.living.currentWeather(), season: this.living.currentSeason() });
    this.store.persist();
    this.syncWorldControls();
    if (announce) {
      this.toast('Clima, horário e ambiente anteriores ao teste foram restaurados.');
      this.setStatus('Mundo restaurado ao estado anterior ao modo DEV.');
    }
    return true;
  }

  applyMaximums({ announce = false } = {}) {
    const slot = this.store.active;
    if (!slot) {
      this.setStatus('Nenhum save ativo. Abra um pet para usar o modo DEV.');
      return false;
    }

    slot.level = DEV_LEVEL;
    slot.currency = DEV_CURRENCY;
    slot.isSleeping = false;
    Object.keys(slot.stats || {}).forEach((key) => { slot.stats[key] = key === 'experience' ? 0 : 100; });
    slot.inventory = Object.fromEntries(
      unique([...Object.keys(slot.inventory || {}), 'meal', 'snack', 'treat', 'water', 'medicine']).map((id) => [id, DEV_STOCK])
    );
    slot.unlockedRooms = Object.keys(ROOMS);
    slot.unlockedItems = unique([...(slot.unlockedItems || []), ...COLLECTION_ITEMS.map((item) => item.id)]);
    slot.achievements = unique([...(slot.achievements || []), 'first-level', 'daily-rhythm', 'dev-complete']);

    const state = this.living.ensure?.() || slot.living;
    if (state) {
      state.hydration = 100;
      state.conditions = [];
      state.ingredients = Object.fromEntries(Object.keys(INGREDIENTS).map((id) => [id, DEV_STOCK]));
      state.recipesUnlocked = Object.keys(RECIPES);
      state.preparedMeals = Object.fromEntries(Object.keys(RECIPES).map((id) => [id, 25]));
      state.furnitureInventory = Object.fromEntries(Object.keys(FURNITURE).map((id) => [id, 25]));
      state.roomUpgrades = Object.fromEntries(Object.keys(ROOM_UPGRADES).map((id) => [id, 3]));
      this.scene.setRoomUpgrades?.(state.roomUpgrades);
      state.accessories = state.accessories || { owned: [], equipped: null };
      state.accessories.owned = Object.keys(ACCESSORIES);
      if (state.accessories.equipped && !ACCESSORIES[state.accessories.equipped]) state.accessories.equipped = null;
      state.grooming = { ...(state.grooming || {}), tolerance: 100 };
      state.commands = state.commands || {};
      Object.keys(COMMANDS).forEach((id) => {
        state.commands[id] = {
          ...(state.commands[id] || {}), mastery: 100, confidence: 100,
          attempts: Math.max(50, state.commands[id]?.attempts || 0), successes: Math.max(50, state.commands[id]?.successes || 0),
          responseDelay: 180, distractionResistance: 100, rewardAssociation: 100, generalization: 100
        };
      });
      const skillIds = Object.values(SKILL_PATHS).flat().map((skill) => skill.id);
      state.skills = { ...(state.skills || {}), points: 99, spent: skillIds.length, unlocked: skillIds, freeResets: 99 };
      state.walks = state.walks || { visited: [], discoveries: [], history: [] };
      state.walks.visited = Object.keys(WALK_LOCATIONS);
      state.secrets = Object.fromEntries(Object.keys(SECRETS).map((id) => [id, { discoveredAt: Date.now(), dev: true }]));
      if (state.quest) {
        state.quest.step = 99; state.quest.completed = true; state.quest.ready = true; state.quest.objectiveProgress = 100;
      }
      Object.values(state.preferences || {}).forEach((preference) => {
        if (!preference || typeof preference !== 'object') return;
        preference.confidence = 100; preference.status = 'confirmed';
      });
      if (state.scent) { state.scent.level = 99; state.scent.experience = 0; }
    }

    this.store.applyLevelUnlocks?.();
    this.store.persist();
    this.refreshMain(true);
    this.updatePetLabel();
    this.syncWorldControls();
    this.setStatus(`Máximos aplicados: nível ${DEV_LEVEL}, ${DEV_CURRENCY.toLocaleString('pt-BR')} moedas e tudo desbloqueado.`);
    if (announce) this.toast('Pet ativo maximizado e todos os recursos de teste desbloqueados.');
    return true;
  }

  updatePetLabel() {
    if (!this.petLabel) return;
    const slot = this.store.active;
    this.petLabel.textContent = slot ? `${slot.petName} · ${PETS[slot.companionId]?.name || slot.companionId}` : 'Nenhum pet ativo';
  }

  syncWorldControls() {
    const slot = this.store.active;
    const state = this.living.state;
    if (!slot || !state) return;
    if (this.weatherSelect) this.weatherSelect.value = state.world.fixedWeather || 'dynamic';
    if (this.seasonSelect) this.seasonSelect.value = state.world.fixedSeason || 'automatic';
    if (this.roomSelect) this.roomSelect.value = slot.activeRoom;
    if (this.timeSelect) this.timeSelect.value = this.store.settings.realTimeLighting ? 'automatic' : (this.store.settings.fixedVisualTime || this.scene.dayPhase || 'day');
    if (this.worldSummary) {
      const weather = WEATHER_LABELS[this.living.currentWeather()] || this.living.currentWeather();
      const season = SEASON_LABELS[this.living.currentSeason()] || this.living.currentSeason();
      const room = ROOMS[slot.activeRoom]?.name || slot.activeRoom;
      const phase = TIME_LABELS[this.scene.dayPhase] || this.scene.dayPhase;
      this.worldSummary.textContent = `${room} · ${weather} · ${season} · ${phase}`;
    }
  }

  async changeRoom(roomId, { quiet = false, preserveForcedAction = false } = {}) {
    const slot = this.store.active;
    if (!slot || !ROOMS[roomId]) return false;
    if (!preserveForcedAction) this.living.stopForcedAutonomousAction?.();
    if (!slot.unlockedRooms.includes(roomId)) slot.unlockedRooms.push(roomId);
    this.store.setRoom(roomId);
    this.scene.buildEnvironment?.(roomId);
    this.scene.setWorldState?.({ weather: this.living.currentWeather(), season: this.living.currentSeason() });
    this.scene.setDecorations?.(this.living.state?.decorations || []);
    this.scene.setAccessory?.(this.living.state?.accessories?.equipped || null);
    this.scene.placePetSafely?.();
    this.refreshMain(true);
    this.syncWorldControls();
    await new Promise((resolve) => requestAnimationFrame(resolve));
    if (!quiet) this.setStatus(`Ambiente de teste alterado para ${ROOMS[roomId].name}.`);
    return true;
  }

  behaviorPreparation(id) {
    const slot = this.store.active;
    const room = slot?.activeRoom || 'living';
    const species = PETS[slot?.companionId]?.species || 'dog';
    const perchByRoom = {
      living: 'living-shelf-perch', bedroom: 'bedroom-shelf-perch', kitchen: 'kitchen-table-perch',
      garden: 'garden-tree-perch', training: 'training-platform'
    };
    if (id === 'climb' || id === 'high-rest') {
      if (species === 'cat' && perchByRoom[room]) return { room, objectId: perchByRoom[room] };
      return { room: 'training', objectId: 'training-platform' };
    }
    if (['sleep', 'bed-rest'].includes(id)) return ['living', 'bedroom'].includes(room) ? { room } : { room: 'bedroom' };
    if (['eat', 'ask-food', 'drink', 'ask-water', 'toy-play', 'bring-toy', 'wait-door'].includes(id)) return { room: 'living' };
    if (['window-watch'].includes(id)) return ['living', 'bedroom'].includes(room) ? { room } : { room: 'living' };
    if (['scratch', 'dig', 'follow-scent', 'chase-target', 'hunt', 'sunlight-rest'].includes(id)) return { room: 'garden' };
    if (id === 'trained-command') return { room: 'training', objectId: 'training-platform' };
    if (id === 'hide') return { room: 'bedroom', objectId: 'bedroom-under-bed' };
    if (id === 'favorite-place' && !['living', 'bedroom', 'garden', 'park', 'training'].includes(room)) return { room: 'living' };
    return { room };
  }

  async triggerBehavior(id, options = {}) {
    if (!this.store.active) return false;
    this.setRandomAnimations(false);
    const preparation = { ...this.behaviorPreparation(id), ...options };
    if (preparation.room && preparation.room !== this.store.active.activeRoom) await this.changeRoom(preparation.room, { quiet: true });
    const result = this.living.forceAutonomousAction?.(id, preparation);
    if (!result?.ok && id === 'favorite-place' && this.store.active.activeRoom !== 'living') {
      await this.changeRoom('living', { quiet: true });
      return this.triggerBehavior(id, { ...options, room: 'living' });
    }
    if (!result?.ok) {
      this.setStatus(result?.reason || 'Não foi possível iniciar o evento do pet.');
      this.toast(result?.reason || 'Evento indisponível neste cenário.');
      return false;
    }
    this.setStatus(`${BEHAVIOR_LABELS[id] || id} iniciado. Autonomia pausada durante o teste.`);
    return true;
  }

  triggerSelectedBehavior() {
    return this.triggerBehavior(this.behaviorSelect?.value || 'explore');
  }

  triggerBehaviorPreset(preset) {
    const presets = {
      climb: ['climb', { animation: 'jump', hold: 9000 }],
      favorite: ['favorite-place', { hold: 12000 }],
      quiet: ['seek-solitude', { animation: 'sit', hold: 14000 }],
      window: ['window-watch', { hold: 12000 }],
      sleep: ['bed-rest', { hold: 14000 }],
      explore: ['explore', { hold: 7500, run: false }]
    };
    const [id, options] = presets[preset] || [preset, {}];
    return this.triggerBehavior(id, options);
  }

  stopBehaviorTest() {
    this.living.stopForcedAutonomousAction?.();
    this.scene.playAnimation?.('idle', { force: true, loop: true, fade: 0.16 });
    this.setStatus('Evento comportamental encerrado. Idle e autonomia restaurados.');
  }

  async applyWeather(weather, { ensureVisible = false } = {}) {
    if (!weather) return false;
    if (ensureVisible && weather !== 'dynamic' && weather !== 'clear' && !OUTDOOR_ROOMS.has(this.store.active?.activeRoom)) {
      await this.changeRoom('garden', { quiet: true });
    }
    const ok = this.living.setWeather?.(weather);
    if (!ok) return false;
    this.refreshMain(true);
    this.syncWorldControls();
    const label = WEATHER_LABELS[weather] || weather;
    this.setStatus(weather === 'dynamic' ? 'Clima dinâmico restaurado.' : `${label} ativado para teste.`);
    return true;
  }

  applySeason(season) {
    const ok = this.living.setSeason?.(season);
    if (!ok) return false;
    this.refreshMain(true);
    this.syncWorldControls();
    this.setStatus(season === 'automatic' ? 'Estação automática restaurada.' : `${SEASON_LABELS[season] || season} ativada.`);
    return true;
  }

  applyTime(phase) {
    if (phase === 'automatic') {
      this.store.updateSettings({ realTimeLighting: true });
      this.scene.applyLighting?.();
      this.setStatus('Iluminação voltou a acompanhar o horário real.');
    } else {
      this.store.updateSettings({ realTimeLighting: false, fixedVisualTime: phase });
      this.scene.applyLighting?.(phase);
      this.setStatus(`${TIME_LABELS[phase] || phase} ativado para teste.`);
    }
    this.scene.setWorldState?.({ weather: this.living.currentWeather(), season: this.living.currentSeason() });
    this.syncWorldControls();
  }

  async triggerEmergentEvent(eventId) {
    const definition = EMERGENT_EVENTS.find((event) => event.id === eventId);
    if (!definition || !this.store.active) return false;
    const targetRoom = definition.rooms?.includes(this.store.active.activeRoom) ? this.store.active.activeRoom : definition.rooms?.[0];
    if (targetRoom) await this.changeRoom(targetRoom, { quiet: true });
    if (definition.seasons?.length) this.applySeason(definition.seasons[0]);
    if (definition.weather?.length) await this.applyWeather(definition.weather[0], { ensureVisible: false });
    if (definition.time?.length) this.applyTime(definition.time[0] === 'late-night' ? 'night' : definition.time[0]);
    const result = this.living.forceEmergentEvent?.(eventId);
    if (!result?.ok) {
      this.setStatus(result?.reason || 'Não foi possível iniciar o evento emergente.');
      return false;
    }
    this.setStatus(`Evento emergente iniciado: ${eventLabel(eventId, 'pt-BR')}. Use as respostas do card do evento.`);
    return true;
  }

  clearEmergentEvent() {
    const cleared = this.living.clearEmergentEvent?.();
    this.setStatus(cleared ? 'Evento emergente removido sem aplicar consequências.' : 'Nenhum evento emergente estava ativo.');
  }

  refreshAnimations() {
    if (!this.animationSelect) return;
    const animations = this.scene.listAnimations?.() || [];
    const current = this.animationSelect.value;
    this.animationSelect.innerHTML = '';

    if (!animations.length) {
      this.animationSelect.append(option('', 'Carregue um pet para listar animações'));
      this.animationSelect.disabled = true;
      return;
    }

    animations.forEach(({ name, duration }) => this.animationSelect.append(option(name, `${name} · ${duration.toFixed(2)} s`)));
    this.animationSelect.disabled = false;
    this.animationSelect.value = animations.some((animation) => animation.name === current)
      ? current
      : animations.find((animation) => animation.name === 'idle')?.name || animations[0].name;
    this.updateCurrentAnimation();
  }

  playSelected(loop) {
    const name = this.animationSelect?.value;
    if (!name) return;
    this.stopRandomTimerOnly();
    if (this.randomToggle) this.randomToggle.checked = false;
    this.randomEnabled = false;
    this.living.stopForcedAutonomousAction?.();
    this.scene.setAutonomous?.(false);
    this.scene.playAnimation?.(name, { force: true, loop, fade: 0.12 });
    this.updateCurrentAnimation(name, loop ? 'loop' : 'uma vez');
    this.setStatus(`Animação ${name} reproduzida ${loop ? 'em loop' : 'uma vez'}.`);
  }

  playIdle() {
    this.setRandomAnimations(false);
    this.living.stopForcedAutonomousAction?.();
    this.scene.playAnimation?.('idle', { force: true, loop: true, fade: 0.16 });
    if (this.store.active && !this.store.active.isSleeping) this.scene.setAutonomous?.(true);
    this.updateCurrentAnimation('idle', 'loop');
    this.setStatus('Idle restaurado e autonomia reativada.');
  }

  setRandomAnimations(enabled) {
    const next = Boolean(enabled && this.enabled);
    this.randomEnabled = next;
    if (this.randomToggle) this.randomToggle.checked = next;
    this.stopRandomTimerOnly();

    if (!next) {
      if (this.store.active && !this.store.active.isSleeping) this.scene.setAutonomous?.(true);
      return;
    }

    this.living.stopForcedAutonomousAction?.();
    this.previousAutonomy = true;
    this.scene.setAutonomous?.(false);
    this.playRandomAnimation();
    this.restartRandomTimer();
    this.setStatus('Teste aleatório ativo. As animações serão alternadas automaticamente.');
  }

  restartRandomTimer() {
    this.stopRandomTimerOnly();
    if (!this.randomEnabled) return;
    this.randomTimer = window.setInterval(() => this.playRandomAnimation(), this.randomInterval);
  }

  stopRandomTimerOnly() {
    if (this.randomTimer) window.clearInterval(this.randomTimer);
    this.randomTimer = null;
  }

  playRandomAnimation() {
    const animations = this.scene.listAnimations?.() || [];
    if (!animations.length) return;
    const preferred = animations.filter(({ name }) => !['walk', 'run', 'idle'].includes(name));
    const pool = preferred.length ? preferred : animations;
    const current = this.scene.currentAnimationName?.();
    const candidates = pool.filter(({ name }) => name !== current);
    const source = candidates.length ? candidates : pool;
    const chosen = source[Math.floor(Math.random() * source.length)];
    if (!chosen) return;
    const looping = /(^|_)(idle|loop)$/.test(chosen.name) || chosen.name.includes('idle');
    this.scene.playAnimation?.(chosen.name, { force: true, loop: looping, fade: 0.1 });
    if (this.animationSelect) this.animationSelect.value = chosen.name;
    this.updateCurrentAnimation(chosen.name, looping ? 'loop' : 'uma vez');
  }

  updateCurrentAnimation(name = null, mode = '') {
    if (!this.currentAnimation) return;
    const activeName = name || this.scene.currentAnimationName?.() || '—';
    this.currentAnimation.textContent = mode ? `${activeName} · ${mode}` : activeName;
  }

  setStatus(message) {
    if (this.status) this.status.textContent = message;
  }
}
