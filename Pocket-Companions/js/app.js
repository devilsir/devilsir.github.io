import * as THREE from '../vendor/three.module.js';
globalThis.THREE = THREE;

import { GameStore } from './store.js';
import { AudioSystem } from './audio.js';
import { CompanionScene } from './scene.js';
import { MinigameManager } from './games.js';
import { PETS, NEEDS, FOODS, ROOMS, MINIGAMES } from './config.js';
import { clamp, choose, downloadBlob, formatTimeAway, wait } from './utils.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const store = new GameStore();
const audio = new AudioSystem(() => store.settings);
const scene = new CompanionScene($('#companion-canvas'), () => store.settings, (name) => playSound(name));

const screens = {
  loading: $('#loading-screen'),
  title: $('#title-screen'),
  selection: $('#selection-screen'),
  game: $('#game-interface')
};

const loadingProgress = $('#loading-progress');
const loadingPercent = $('#loading-percent');
const loadingMessage = $('#loading-message');
const loadingError = $('#loading-error');
const loadingErrorMessage = $('#loading-error-message');
const dialogueBubble = $('#dialogue-bubble');
const sceneCaption = $('#scene-caption');
const stageElement = $('#stage');
const cleanSponge = $('#clean-sponge');
const drawer = $('#drawer');
const drawerTitle = $('#drawer-title');
const drawerContent = $('#drawer-content');
const toastRegion = $('#toast-region');

let pendingSlotIndex = 0;
let selectionIndex = 0;
let activePanel = 'home';
let lastUiUpdate = 0;
let autosaveTimer = null;
let tickTimer = null;
let dialogueTimer = null;
let captionTimer = null;
let paused = false;
let movementTracked = false;
let currentGameId = null;
let confirmCallback = null;
let lastAwayMilliseconds = 0;
let sleepTransitioning = false;
let lastScrubSoundAt = 0;
let lastWaterSoundAt = 0;
let lastSpongePoint = null;

const petOrder = ['apollo', 'lilith', 'pietro'];
const tutorialSteps = [
  { title: 'Say hello', copy: 'Tap or gently drag over the actual 3D companion. Little moments of attention build happiness and bond.' },
  { title: 'Read their needs', copy: 'The needs panel shows food, happiness, energy, hygiene, health, and bond. Words accompany every color.' },
  { title: 'Share a meal', copy: 'Choose Feed, then select a balanced meal, snack, treat, or water. Full companions will politely slow down.' },
  { title: 'Play together', copy: 'Open Play for eight polished activities with combos, memory, rhythm, puzzles, and action. Mouse, keyboard, and touch are all supported.' },
  { title: 'Your progress is safe', copy: 'Pocket Companions saves automatically in this browser. Settings also lets you export and import a backup.' }
];

const games = new MinigameManager({
  root: $('#game-area'),
  scene,
  store,
  audio,
  onCaption: caption,
  onComplete: ({ success, currency, xp, game, rating, detail }) => {
    const result = $('#game-result');
    const stars = `${'★'.repeat(rating)}${'☆'.repeat(3 - rating)}`;
    result.hidden = false;
    result.innerHTML = `
      <div class="game-result-copy">
        <span class="game-result-stars" aria-label="${rating} out of 3 stars">${stars}</span>
        <div><strong>${success ? `${game.name} complete!` : 'Good try!'}</strong><small>${detail || (success ? 'Great teamwork.' : 'Your companion still enjoyed playing.')}</small></div>
        <div class="game-result-rewards"><span>+${currency} sparks</span><span>+${xp} XP</span></div>
      </div>
      <div class="game-result-actions">
        <button id="replay-game" class="button button-primary" type="button">Play again</button>
        <button id="finish-game" class="button button-secondary" type="button">Back to games</button>
      </div>
    `;
    result.querySelector('#replay-game').addEventListener('click', () => {
      result.hidden = true;
      games.start(currentGameId);
    });
    result.querySelector('#finish-game').addEventListener('click', () => {
      games.stop();
      closeDialog($('#game-modal'));
      currentGameId = null;
    });
    updateUI(true);
    showDialogue(success ? choose(['That was amazing!', 'Again sometime?', 'We make a great team!']) : 'That was still fun!', 2);
  }
});

async function init() {
  bindGlobalControls();
  applySettingsToDocument();
  syncSettingsInputs();
  await loadExperience();
  registerServiceWorker();
}

async function loadExperience() {
  try {
    loadingError.hidden = true;
    loadingMessage.textContent = 'Building the room and preparing the renderer…';
    setLoading(4);
    await scene.init();
    loadingMessage.textContent = 'Inspecting Apollo, Lilith, and Pietro…';
    await scene.preloadAll((value) => setLoading(8 + value * 0.84));
    loadingMessage.textContent = 'Framing paws, checking textures, and rendering the first stable frame…';
    scene.setPet('apollo', { selection: false });
    await scene.renderStableFrame();
    setLoading(100);
    await wait(store.settings.reducedMotion ? 20 : 260);
    showTitle();
  } catch (error) {
    console.error('[Pocket Companions] Startup failed:', error);
    loadingErrorMessage.textContent = error?.message || 'An unknown loading error occurred.';
    loadingError.hidden = false;
    loadingMessage.textContent = 'The cozy world needs a quick retry.';
  }
}

function setLoading(value) {
  const safe = clamp(value, 0, 100);
  loadingProgress.style.width = `${safe}%`;
  loadingPercent.textContent = `${Math.round(safe)}%`;
}

function showOnly(name) {
  Object.entries(screens).forEach(([key, element]) => {
    element.hidden = key !== name;
    element.classList.toggle('is-visible', key === name);
  });
}

function showTitle() {
  showOnly('title');
  scene.setMode('title');
  scene.setAutonomous(false);
  $('#continue-button').hidden = !store.hasSaves();
  audio.stopAmbient();
  audio.stopMusic();
}

function startNewFlow() {
  renderSlots('new');
  openDialog($('#slots-modal'));
}

function continueFlow() {
  renderSlots('continue');
  openDialog($('#slots-modal'));
}

function renderSlots(mode = 'continue') {
  const list = $('#slots-list');
  list.innerHTML = '';
  store.data.slots.forEach((slot, index) => {
    const card = document.createElement('article');
    card.className = `slot-card ${slot ? '' : 'slot-card-empty'}`;
    if (!slot) {
      const title = document.createElement('h3');
      title.textContent = `Slot ${index + 1}`;
      const copy = document.createElement('p');
      copy.textContent = 'A fresh space for a new companion.';
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'button button-primary';
      button.textContent = 'Create save';
      button.addEventListener('click', () => beginSelection(index));
      card.append(title, copy, button);
    } else {
      const pet = PETS[slot.companionId];
      const title = document.createElement('h3');
      title.textContent = slot.petName;
      const copy = document.createElement('p');
      copy.textContent = `${pet?.name || 'Companion'} · Level ${slot.level} · ${Math.round(slot.stats.bond)} bond`;
      const active = document.createElement('p');
      active.textContent = `Last cared for ${formatTimeAway(Date.now() - slot.lastActive)} ago`;
      const actions = document.createElement('div');
      actions.className = 'slot-actions';
      const load = document.createElement('button');
      load.type = 'button';
      load.className = 'button button-primary';
      load.textContent = 'Continue';
      load.addEventListener('click', () => loadSlot(index));
      const reset = document.createElement('button');
      reset.type = 'button';
      reset.className = 'button button-ghost';
      reset.textContent = 'Reset slot';
      reset.addEventListener('click', () => confirmAction(
        'Reset this save?',
        `This permanently removes ${slot.petName} from Slot ${index + 1}. Export a backup first if you may want it later.`,
        () => {
          store.deleteSlot(index);
          renderSlots(mode);
          $('#continue-button').hidden = !store.hasSaves();
          toast(`Slot ${index + 1} was reset.`);
        }
      ));
      actions.append(load, reset);
      card.append(title, copy, active, actions);
    }
    if (mode === 'new' && slot) card.classList.add('is-occupied');
    list.append(card);
  });
}

function beginSelection(slotIndex) {
  pendingSlotIndex = slotIndex;
  closeDialog($('#slots-modal'));
  selectionIndex = 0;
  showOnly('selection');
  updateSelection();
  scene.setAutonomous(false);
}

function updateSelection() {
  const id = petOrder[selectionIndex];
  const pet = PETS[id];
  scene.setPet(id, { selection: true });
  setTheme(pet);
  $('#selection-name').textContent = pet.name;
  $('#selection-trait').textContent = pet.trait;
  $('#selection-description').textContent = pet.personality;
  $$('[data-pet-dot]').forEach((dot) => {
    const active = dot.dataset.petDot === id;
    dot.classList.toggle('is-active', active);
    dot.setAttribute('aria-selected', String(active));
  });
}

function shiftSelection(direction) {
  selectionIndex = (selectionIndex + direction + petOrder.length) % petOrder.length;
  updateSelection();
  playSound('click');
}

function chooseSelection() {
  const id = petOrder[selectionIndex];
  const pet = PETS[id];
  $('#pet-name-input').value = pet.name;
  $('#name-pet-summary').textContent = `${pet.name} will live in Slot ${pendingSlotIndex + 1}.`;
  openDialog($('#name-modal'));
  setTimeout(() => $('#pet-name-input').select(), 50);
}

async function loadSlot(index) {
  const slot = store.data.slots[index];
  if (!slot) return;
  lastAwayMilliseconds = Math.max(0, Date.now() - slot.lastActive);
  store.selectSlot(index);
  closeDialog($('#slots-modal'));
  await enterGame();
}

async function enterGame() {
  const slot = store.active;
  if (!slot) return;
  showOnly('game');
  setTheme(PETS[slot.companionId]);
  scene.setPet(slot.companionId, { selection: false });
  scene.buildEnvironment(slot.activeRoom);
  if (slot.isSleeping) scene.enterSleepMode(true);
  else scene.placePetSafely();
  scene.setAutonomous(!slot.isSleeping);
  $('#sleep-overlay').hidden = !slot.isSleeping;
  $$('[data-action="sleep"] span').forEach((element) => { element.textContent = slot.isSleeping ? 'Wake' : 'Sleep'; });
  updateAmbient();
  updateUI(true);
  renderDaily();
  startLoops();
  $('#interaction-hint').hidden = false;
  setTimeout(() => { $('#interaction-hint').hidden = true; }, 5500);
  if (lastAwayMilliseconds > 60000) {
    showDialogue(returnGreeting(lastAwayMilliseconds), 2);
  } else {
    showDialogue(`Hi! I’m ${slot.petName}.`, 1);
  }
  if (!slot.tutorialComplete) showTutorial(slot.tutorialStep || 0);
  await scene.renderStableFrame();
}

function startLoops() {
  clearInterval(tickTimer);
  clearInterval(autosaveTimer);
  tickTimer = setInterval(() => {
    if (!paused) {
      const wasSleeping = Boolean(store.active?.isSleeping);
      store.tick();
      if (wasSleeping && store.active && !store.active.isSleeping) {
        scene.enterSleepMode(false);
        scene.setAutonomous(true);
        $('#sleep-overlay').hidden = true;
        $$('[data-action="sleep"] span').forEach((element) => { element.textContent = 'Sleep'; });
        updateAmbient();
        showDialogue('I woke up naturally. I feel rested!', 3);
        playSound('positive', { volume: 0.45 });
      }
      updateUI();
      maybeContextDialogue();
    }
  }, 1000);
  autosaveTimer = setInterval(() => store.persist(), 10000);
}

function updateUI(force = false) {
  const slot = store.active;
  if (!slot) return;
  const now = performance.now();
  if (!force && now - lastUiUpdate < 450) return;
  lastUiUpdate = now;
  $('#pet-name').textContent = slot.petName;
  $('#slot-button').textContent = `Slot ${slot.slotIndex + 1}`;
  $('#level-label').textContent = `Level ${slot.level}`;
  $('#currency-label').textContent = `${slot.currency} sparks`;
  const threshold = store.levelThreshold(slot.level);
  $('#xp-fill').style.width = `${clamp(slot.stats.experience / threshold * 100)}%`;
  const emotion = determineEmotion(slot.stats, slot.isSleeping);
  $('#pet-emotion').textContent = emotion;
  document.body.dataset.emotion = emotion.toLowerCase();
  renderNeeds();
  if (slot.isSleeping) {
    $('#sleep-status').textContent = `Energy ${Math.round(slot.stats.energy)}%. It will recover faster while resting.`;
  }
  if (activePanel !== 'home' && !drawer.hidden) renderDrawer(activePanel, false);
  store.applyLevelUnlocks();
}

function renderNeeds() {
  const slot = store.active;
  const list = $('#needs-list');
  if (!slot) return;
  if (!list.children.length) {
    NEEDS.forEach((need) => {
      const row = document.createElement('div');
      row.className = 'need-row';
      row.dataset.need = need.key;
      row.innerHTML = `<span class="need-name">${need.label}</span><span class="need-value">0</span><div class="need-track"><div class="need-fill"></div></div><span class="need-status"></span>`;
      list.append(row);
    });
  }
  NEEDS.forEach((need) => {
    const value = clamp(slot.stats[need.key]);
    const row = $(`[data-need="${need.key}"]`, list);
    row.querySelector('.need-value').textContent = `${Math.round(value)}%`;
    row.querySelector('.need-fill').style.width = `${value}%`;
    row.querySelector('.need-status').textContent = value >= 65 ? need.good : value < 35 ? need.low : 'Could use a little care';
    row.classList.toggle('is-low', value < 35);
    row.classList.toggle('is-mid', value >= 35 && value < 65);
  });
}

function determineEmotion(stats, sleeping) {
  if (sleeping) return 'Sleepy';
  if (stats.health < 32) return 'Sick';
  if (stats.energy < 24) return 'Tired';
  if (stats.hunger < 25) return 'Hungry';
  if (stats.hygiene < 25) return 'Dirty';
  if (stats.happiness < 30) return 'Sad';
  if (stats.happiness > 88 && stats.energy > 55) return 'Excited';
  if (stats.bond > 65 && stats.happiness > 70) return 'Happy';
  if (stats.energy > 68 && stats.happiness > 60) return 'Curious';
  return 'Calm';
}

function returnGreeting(milliseconds) {
  const label = formatTimeAway(milliseconds);
  return choose([
    `You’re back! It has been ${label}.`,
    `I saved you a cozy spot. Welcome back after ${label}!`,
    `There you are! I missed our little routine.`
  ]);
}

function maybeContextDialogue() {
  const slot = store.active;
  if (!slot || dialogueBubble.hidden === false) return;
  const now = Date.now();
  if (now - slot.interactions.lastDialogueAt < 70000) return;
  const candidates = [];
  if (slot.stats.hunger < 30) candidates.push({ priority: 5, text: 'Could we find something tasty?' });
  if (slot.stats.energy < 28) candidates.push({ priority: 5, text: 'My bed looks extra cozy right now…' });
  if (slot.stats.hygiene < 30) candidates.push({ priority: 4, text: 'I think I brought half the garden inside.' });
  if (slot.stats.happiness < 35) candidates.push({ priority: 4, text: 'A tiny game might cheer me up.' });
  if (slot.stats.health < 40) candidates.push({ priority: 6, text: 'I’m feeling a little off. Can we take it easy?' });
  if (!candidates.length && Math.random() < 0.22) candidates.push({ priority: 1, text: choose(['What should we explore next?', 'This room feels like home.', 'I wonder what is behind that door.', 'Can we take a photo together?']) });
  if (!candidates.length) return;
  candidates.sort((a, b) => b.priority - a.priority);
  showDialogue(candidates[0].text, candidates[0].priority);
}

function showDialogue(text, priority = 1, duration = 4200) {
  const slot = store.active;
  if (slot) {
    const now = Date.now();
    if (priority < 3 && now - slot.interactions.lastDialogueAt < 14000) return;
    slot.interactions.lastDialogueAt = now;
  }
  clearTimeout(dialogueTimer);
  dialogueBubble.textContent = text;
  dialogueBubble.hidden = false;
  dialogueTimer = setTimeout(() => { dialogueBubble.hidden = true; }, duration);
}

function caption(text) {
  if (!store.settings.captions || !text) return;
  clearTimeout(captionTimer);
  sceneCaption.textContent = text;
  sceneCaption.classList.add('is-visible');
  captionTimer = setTimeout(() => sceneCaption.classList.remove('is-visible'), 1800);
}

function playSound(name, options = {}) {
  const captions = {
    click: 'Soft click', positive: 'Bright success chime', feed: 'Gentle eating sounds', crunch: 'Crunch', treat: 'Happy treat chime',
    water: 'Water trickles', clean: 'Bubbles and brushing', toy: 'Toy squeak', jump: 'Jump', land: 'Soft landing', sleep: 'Calm sleepy tone', medicine: 'Gentle care chime'
  };
  audio.play(name, options);
  if (captions[name]) caption(captions[name]);
}

function handleAction(action) {
  if (!store.active || paused) return;
  playSound('click');
  if (action === 'feed') openFoodModal();
  if (action === 'play') openPanel('play');
  if (action === 'pet') encouragePetting();
  if (action === 'clean') startCleaning();
  if (action === 'sleep') toggleSleep();
  if (action === 'medicine') openCareModal();
}

function openFoodModal() {
  renderFoods($('#food-list'));
  const fullness = Math.round(store.active.stats.fullness);
  $('#fullness-note').textContent = fullness > 82
    ? `${store.active.petName} is comfortably full. Water is still okay.`
    : `Fullness ${fullness}%. Meals are most effective when there is room.`;
  openDialog($('#food-modal'));
}

function renderFoods(container, compact = false) {
  container.innerHTML = '';
  const slot = store.active;
  Object.values(FOODS).forEach((food) => {
    const count = slot.inventory[food.id] ?? 0;
    const tooFull = slot.stats.fullness > (food.id === 'water' ? 98 : food.id === 'treat' ? 92 : 82);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = compact ? 'card-button' : 'food-card';
    button.disabled = count <= 0 || tooFull;
    button.innerHTML = `<strong>${food.name}</strong><span>${food.description}</span><div class="food-stats"><small>Food +${food.hunger}</small><small>Joy +${food.happiness}</small><small>${count} left</small></div>`;
    button.addEventListener('click', () => feedPet(food.id));
    container.append(button);
  });
}

async function feedPet(foodId) {
  const slot = store.active;
  const food = FOODS[foodId];
  if (!slot || !food || (slot.inventory[foodId] ?? 0) <= 0) return;
  const maxFullness = foodId === 'water' ? 98 : foodId === 'treat' ? 92 : 82;
  if (slot.stats.fullness > maxFullness) {
    showDialogue('I’m happily full right now. Maybe later?', 4);
    return;
  }
  closeDialog($('#food-modal'));
  if (slot.isSleeping) await toggleSleep(false);
  if (slot.activeRoom !== 'living') {
    store.setRoom('living');
    scene.buildEnvironment('living');
    scene.placePetSafely();
    updateAmbient();
  }
  slot.inventory[foodId] -= 1;
  slot.discoveredFoods = Array.isArray(slot.discoveredFoods) ? slot.discoveredFoods : [];
  if (!slot.discoveredFoods.includes(foodId)) slot.discoveredFoods.push(foodId);
  const approach = scene.getFeedApproach(foodId);
  showDialogue(choose(['That smells wonderful!', 'Snack time!', 'Just what I needed.']), 2);
  if (store.settings.reducedMotion) scene.placePetSafely(approach);
  else await scene.moveToAndWait(approach.x, approach.z, { timeout: 1700 });
  scene.showBowlContents(foodId);
  playSound(food.sound, { volume: foodId === 'water' ? 0.75 : 0.9 });
  await scene.playEatingSequence(foodId, store.settings.reducedMotion ? 900 : 1800);
  const modifier = PETS[slot.companionId].modifiers.foodJoy || 1;
  store.modifyStats({
    hunger: food.hunger,
    happiness: food.happiness * modifier,
    health: food.health,
    energy: food.energy,
    bond: 1.2,
    fullness: food.fullness
  }, `feed-${foodId}`);
  store.gainProgress(7, 3);
  store.track('feed');
  scene.spawnParticles(foodId === 'treat' ? 'star' : 'heart', foodId === 'treat' ? 9 : 5);
  showDialogue(foodId === 'water' ? 'Refreshing!' : 'Yum, that hit the spot!', 2.4);
  updateUI(true);
  store.persist();
}

function encouragePetting() {
  $('#interaction-hint').textContent = 'Tap or gently drag directly over your 3D companion.';
  $('#interaction-hint').hidden = false;
  setTimeout(() => { $('#interaction-hint').hidden = true; }, 3500);
  scene.spawnParticles('heart', 4);
  processPetAttention(false);
}

function activateCleanCursor() {
  stageElement.classList.add('is-cleaning');
  cleanSponge.hidden = false;
  cleanSponge.classList.add('is-visible');
  cleanSponge.classList.remove('is-scrubbing');
  lastSpongePoint = null;
  lastScrubSoundAt = 0;
  lastWaterSoundAt = 0;
  const rect = stageElement.getBoundingClientRect();
  positionCleanSponge({ clientX: rect.left + rect.width * 0.55, clientY: rect.top + rect.height * 0.45 });
}

function deactivateCleanCursor() {
  stageElement.classList.remove('is-cleaning');
  cleanSponge.classList.remove('is-visible', 'is-scrubbing');
  cleanSponge.hidden = true;
  lastSpongePoint = null;
}

function positionCleanSponge(event) {
  if (cleanSponge.hidden) return;
  const rect = stageElement.getBoundingClientRect();
  const x = clamp(event.clientX - rect.left, 10, rect.width - 10);
  const y = clamp(event.clientY - rect.top, 10, rect.height - 10);
  const pressed = cleanSponge.classList.contains('is-scrubbing');
  let angle = pressed ? -18 : -12;
  let scale = pressed ? 0.92 : 1;
  if (lastSpongePoint) {
    const dx = x - lastSpongePoint.x;
    const dy = y - lastSpongePoint.y;
    const speed = Math.min(Math.hypot(dx, dy), 38);
    if (pressed) {
      angle += clamp(dx * 0.55, -18, 18);
      scale = 0.88 + Math.min(speed / 190, 0.08);
    } else {
      angle += clamp(dx * 0.16, -8, 8);
    }
  }
  cleanSponge.style.transform = `translate3d(${x - 20}px, ${y - 24}px, 0) rotate(${angle}deg) scale(${scale})`;
  lastSpongePoint = { x, y };
}

function scrubAudioFeedback(event) {
  if (!stageElement.classList.contains('is-cleaning') || !cleanSponge.classList.contains('is-scrubbing')) return;
  if (!event || typeof event.clientX !== 'number' || typeof event.clientY !== 'number') return;
  const rect = stageElement.getBoundingClientRect();
  const x = clamp(event.clientX - rect.left, 10, rect.width - 10);
  const y = clamp(event.clientY - rect.top, 10, rect.height - 10);
  const now = performance.now();
  if (lastSpongePoint) {
    const distance = Math.hypot(x - lastSpongePoint.x, y - lastSpongePoint.y);
    if (distance > 6 && now - lastScrubSoundAt > 105) {
      lastScrubSoundAt = now;
      audio.play('clean', { volume: 0.16 + Math.min(distance / 120, 0.1), rate: 0.94 + Math.min(distance / 180, 0.22) });
    }
    if (distance > 10 && now - lastWaterSoundAt > 280) {
      lastWaterSoundAt = now;
      audio.play('water', { volume: 0.08, rate: 1.05 + Math.min(distance / 200, 0.12) });
    }
  }
}

function syncCleanSponge(event) {
  if (!stageElement.classList.contains('is-cleaning')) return;
  if (!event || typeof event.clientX !== 'number' || typeof event.clientY !== 'number') return;
  if (cleanSponge.hidden) {
    cleanSponge.hidden = false;
    cleanSponge.classList.add('is-visible');
  }
  scrubAudioFeedback(event);
  positionCleanSponge(event);
}

function processPetAttention(dragging) {
  const slot = store.active;
  if (!slot) return;
  const now = Date.now();
  const timestamps = slot.interactions.petTimestamps.filter((time) => now - time < 60000);
  const cap = 14;
  if (timestamps.length >= cap) {
    if (!dragging) showDialogue('I love the attention. Let’s enjoy the moment slowly.', 2);
    slot.interactions.petTimestamps = timestamps;
    return;
  }
  timestamps.push(now);
  slot.interactions.petTimestamps = timestamps;
  slot.interactions.totalPetting = (slot.interactions.totalPetting || 0) + 1;
  if (slot.interactions.totalPetting >= 20 && !slot.achievements.includes('gentle-friend')) slot.achievements.push('gentle-friend');
  const calmModifier = PETS[slot.companionId].modifiers.calmBond || 1;
  const sensitivity = store.settings.interactionSensitivity || 1;
  store.modifyStats({ happiness: 0.75 * sensitivity, bond: 0.42 * calmModifier * sensitivity }, 'pet');
  if (!dragging) playSound('positive', { volume: 0.28, rate: 1.2 });
  if (timestamps.length % 5 === 0) store.gainProgress(2, 1);
}

function startCleaning() {
  if (store.active.isSleeping) toggleSleep();
  closeDrawer();
  $('#clean-overlay').hidden = false;
  $('#clean-progress').style.width = '0%';
  $('#finish-clean').disabled = true;
  scene.startCleanMode();
  activateCleanCursor();
  showDialogue('Soapy spa time! Scrub the dirt away with the sponge.', 2.3);
  playSound('clean', { volume: 0.42, rate: 0.96 });
  playSound('water', { volume: 0.16, rate: 1.04 });
}

function finishCleaning() {
  const progress = scene.cleanProgress;
  if (progress < 68) return;
  $('#clean-overlay').hidden = true;
  scene.stopCleanMode();
  deactivateCleanCursor();
  store.modifyStats({ hygiene: Math.max(18, progress * 0.35), happiness: 6, health: 2, bond: 2 }, 'clean');
  store.gainProgress(10, 5);
  store.track('clean');
  playSound('positive');
  scene.spawnParticles('clean', 12);
  playSound('water', { volume: 0.12, rate: 1.08 });
  showDialogue('Fresh, fluffy, and sparkling clean!', 3);
  updateUI(true);
}

async function toggleSleep(forceValue) {
  const slot = store.active;
  if (!slot || sleepTransitioning) return;
  const sleeping = typeof forceValue === 'boolean' ? forceValue : !slot.isSleeping;
  sleepTransitioning = true;
  try {
    if (sleeping && !slot.isSleeping) {
      if (!['living', 'bedroom'].includes(slot.activeRoom)) {
        const restRoom = slot.unlockedRooms.includes('bedroom') ? 'bedroom' : 'living';
        store.setRoom(restRoom);
        scene.buildEnvironment(restRoom);
        scene.placePetSafely();
      }
      showDialogue('Climbing into my cozy bed…', 2);
      await wait(store.settings.reducedMotion ? 60 : 420);
    }

    store.setSleeping(sleeping);
    scene.enterSleepMode(sleeping);
    scene.setAutonomous(!sleeping);
    $('#sleep-overlay').hidden = !sleeping;
    $$('[data-action="sleep"] span').forEach((element) => { element.textContent = sleeping ? 'Wake' : 'Sleep'; });
    if (sleeping) {
      playSound('sleep');
      showDialogue('Good night. I’ll be right here.', 3);
    } else {
      playSound('positive', { volume: 0.45 });
      showDialogue('I’m awake and feeling brighter!', 2);
    }
    updateAmbient();
  } finally {
    sleepTransitioning = false;
  }
}

function openCareModal() {
  renderSymptoms();
  openDialog($('#care-modal'));
}

function renderSymptoms() {
  const slot = store.active;
  const symptoms = [];
  if (slot.stats.health < 45) symptoms.push('Low health');
  if (slot.stats.hunger < 35) symptoms.push('Hungry');
  if (slot.stats.energy < 35) symptoms.push('Tired');
  if (slot.stats.hygiene < 35) symptoms.push('Dirty');
  if (slot.stats.happiness < 35) symptoms.push('Sad or unmotivated');
  const summary = $('#symptom-summary');
  summary.textContent = symptoms.length
    ? `${slot.petName} seems ${symptoms.join(', ').toLowerCase()}. Gentle care can always restore them.`
    : `${slot.petName} looks comfortable. A little preventive care is still welcome.`;
}

function useMedicine() {
  const slot = store.active;
  if ((slot.inventory.medicine ?? 0) <= 0) {
    toast('No gentle medicine is left in this save.');
    return;
  }
  if (slot.stats.health > 92) {
    showDialogue('I feel okay. Let’s save that for when it is useful.', 3);
    return;
  }
  slot.inventory.medicine -= 1;
  store.modifyStats({ health: 22, energy: -2, happiness: 2 }, 'medicine');
  store.gainProgress(6, 0);
  playSound('medicine');
  showDialogue('A little rest should help too.', 4);
  closeDialog($('#care-modal'));
  updateUI(true);
}

function openPanel(panel) {
  if (panel === 'home') {
    closeDrawer();
    setActiveNav('home');
    return;
  }
  activePanel = panel;
  renderDrawer(panel, true);
  drawer.hidden = false;
  setActiveNav(panel);
}

function renderDrawer(panel, scrollTop = false) {
  drawerTitle.textContent = panel[0].toUpperCase() + panel.slice(1);
  if (panel === 'care') renderCareDrawer();
  if (panel === 'play') renderPlayDrawer();
  if (panel === 'explore') renderExploreDrawer();
  if (panel === 'collection') renderCollectionDrawer();
  if (scrollTop) drawerContent.scrollTop = 0;
}

function renderCareDrawer() {
  const slot = store.active;
  drawerContent.innerHTML = '';
  const status = document.createElement('section');
  status.className = 'drawer-section';
  status.innerHTML = `<h3>Right now</h3><p>${slot.petName} is ${determineEmotion(slot.stats, slot.isSleeping).toLowerCase()}. Fullness is ${Math.round(slot.stats.fullness)}% and ${slot.inventory.medicine ?? 0} medicine items remain.</p>`;
  const foodSection = document.createElement('section');
  foodSection.className = 'drawer-section';
  foodSection.innerHTML = '<h3>Food and water</h3>';
  const grid = document.createElement('div');
  grid.className = 'card-grid';
  renderFoods(grid, true);
  foodSection.append(grid);
  const careSection = document.createElement('section');
  careSection.className = 'drawer-section';
  careSection.innerHTML = '<h3>Care actions</h3>';
  const careGrid = document.createElement('div');
  careGrid.className = 'card-grid';
  [['Clean', 'clean'], [slot.isSleeping ? 'Wake up' : 'Sleep', 'sleep'], ['Check symptoms', 'medicine']].forEach(([label, action]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'card-button';
    button.innerHTML = `<strong>${label}</strong><span>Support hygiene, energy, or health.</span>`;
    button.addEventListener('click', () => handleAction(action));
    careGrid.append(button);
  });
  careSection.append(careGrid);
  const marketSection = document.createElement('section');
  marketSection.className = 'drawer-section';
  marketSection.innerHTML = '<h3>Pocket market</h3><p>Restock with sparks earned through care and play. No real purchases.</p>';
  const marketGrid = document.createElement('div');
  marketGrid.className = 'card-grid';
  const offers = [
    ['meal', 'Balanced meal', 12], ['snack', 'Crunchy snack', 8], ['treat', 'Star treat', 10],
    ['water', 'Fresh water', 5], ['medicine', 'Gentle medicine', 20]
  ];
  offers.forEach(([itemId, label, cost]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'card-button';
    button.innerHTML = `<strong>${label}</strong><span>+1 item · ${cost} sparks</span>`;
    button.addEventListener('click', () => {
      if (store.purchaseItem(itemId, cost, 1)) {
        playSound('positive', { volume: 0.42 });
        toast(`${label} added to inventory.`);
        renderCareDrawer();
        updateUI(true);
      } else {
        toast(`You need ${cost} sparks for ${label}.`);
      }
    });
    marketGrid.append(button);
  });
  marketSection.append(marketGrid);
  drawerContent.append(status, foodSection, careSection, marketSection);
}

function renderPlayDrawer() {
  drawerContent.innerHTML = '<section class="drawer-section"><p class="eyebrow">Play collection</p><h3>Eight games with actual depth</h3><p>Build combos, solve puzzles, master rhythm tracks, memorize patterns, and guide your companion through action challenges.</p></section>';
  const grid = document.createElement('div');
  grid.className = 'card-grid game-card-grid';
  MINIGAMES.forEach((game) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `game-card game-card-${game.id}`;
    button.innerHTML = `
      <div class="game-card-heading"><span class="game-card-type">${game.type}</span><span class="game-card-difficulty">${game.difficulty}</span></div>
      <strong>${game.name}</strong>
      <span>${game.description}</span>
      <small class="game-card-controls">${game.controls}</small>
      <div class="room-meta"><span>+${game.reward} sparks</span><span>+${game.xp} XP</span></div>
    `;
    button.addEventListener('click', () => openGame(game.id));
    grid.append(button);
  });
  drawerContent.append(grid);
}

function openGame(id) {
  currentGameId = id;
  const game = MINIGAMES.find((item) => item.id === id);
  $('#game-title').textContent = game?.name || 'Minigame';
  $('#game-result').hidden = true;
  $('#game-result').innerHTML = '';
  openDialog($('#game-modal'));
  games.start(id);
}

function renderExploreDrawer() {
  const slot = store.active;
  drawerContent.innerHTML = '<section class="drawer-section"><h3>Small worlds to discover</h3><p>New spaces unlock through care, levels, and sparks. Essential actions remain available everywhere.</p></section>';
  const grid = document.createElement('div');
  grid.className = 'card-grid';
  Object.values(ROOMS).forEach((room) => {
    const unlocked = slot.unlockedRooms.includes(room.id);
    const current = slot.activeRoom === room.id;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `room-card ${current ? 'is-current' : ''}`;
    button.innerHTML = `<strong>${room.name}</strong><span>${room.description}</span><div class="room-meta"><span>${unlocked ? (current ? 'Current room' : 'Unlocked') : `Level ${room.unlockLevel}`}</span><span>${unlocked ? '' : `${room.cost} sparks`}</span></div>`;
    button.addEventListener('click', () => selectRoom(room.id));
    grid.append(button);
  });
  drawerContent.append(grid);
}

function selectRoom(roomId) {
  const slot = store.active;
  const room = ROOMS[roomId];
  if (!slot || !room) return;
  if (slot.isSleeping) {
    toast('Wake your companion before changing rooms.');
    return;
  }
  if (!slot.unlockedRooms.includes(roomId)) {
    if (slot.level < room.unlockLevel) {
      toast(`${room.name} unlocks at level ${room.unlockLevel}.`);
      return;
    }
    if (slot.currency < room.cost) {
      toast(`${room.name} needs ${room.cost} sparks.`);
      return;
    }
    if (!store.unlockRoom(roomId)) return;
    toast(`${room.name} unlocked.`);
    playSound('positive');
  }
  store.setRoom(roomId);
  if (roomId === 'park' && scene.dayPhase === 'night' && !slot.unlockedItems.includes('stargazer-memory')) {
    slot.unlockedItems.push('stargazer-memory');
    slot.memories.push('stargazer-memory');
  }
  scene.buildEnvironment(roomId);
  scene.placePetSafely();
  updateAmbient();
  showDialogue(roomGreeting(roomId), 2);
  renderExploreDrawer();
  updateUI(true);
}

function roomGreeting(roomId) {
  const messages = {
    living: 'Home, sweet home.',
    garden: 'There are so many little things to sniff out here!',
    bedroom: 'This room feels peaceful.',
    kitchen: 'Something delicious could happen here.',
    playroom: 'Look at all these toys!',
    park: 'Let’s run all the way across!',
    training: 'Ready, set, jump!'
  };
  return messages[roomId] || 'A new place to explore!';
}

function renderCollectionDrawer() {
  const slot = store.active;
  drawerContent.innerHTML = '<section class="drawer-section"><h3>Your shared collection</h3><p>Everything here comes from care, discovery, and time together.</p></section>';

  const sections = [];
  const pushSection = (title, cards) => sections.push({ title, cards });
  const baseItems = store.getCollection();
  pushSection('Toys and decorations', baseItems.filter((item) => ['Toy', 'Decor', 'Bed', 'Lamp'].includes(item.type)).map((item) => ({
    name: item.unlocked ? item.name : 'Undiscovered',
    description: item.unlocked ? item.description : item.condition,
    unlocked: item.unlocked,
    icon: item.type.slice(0, 2).toUpperCase()
  })));

  pushSection('Foods discovered', Object.values(FOODS).map((food) => {
    const unlocked = slot.discoveredFoods?.includes(food.id);
    return { name: unlocked ? food.name : 'Unknown recipe', description: unlocked ? food.description : 'Offer this food to discover it.', unlocked, icon: 'FD' };
  }));

  pushSection('Photos', [{
    name: slot.photoCount > 0 ? `${slot.photoCount} saved ${slot.photoCount === 1 ? 'memory' : 'memories'}` : 'First snapshot',
    description: slot.photoCount > 0 ? 'Photos are saved directly to your device.' : 'Open photo mode and capture a picture.',
    unlocked: slot.photoCount > 0,
    icon: 'PH'
  }]);

  const achievementDefs = [
    ['first-level', 'Growing together', 'Reach level 2.'],
    ['daily-rhythm', 'Gentle rhythm', 'Complete all three daily activities.'],
    ['gentle-friend', 'Gentle friend', 'Share twenty calm petting interactions.'],
    ['first-game', 'Play partners', 'Complete a minigame together.']
  ];
  pushSection('Achievements', achievementDefs.map(([id, name, condition]) => ({ name: slot.achievements.includes(id) ? name : 'Hidden achievement', description: slot.achievements.includes(id) ? condition : condition, unlocked: slot.achievements.includes(id), icon: 'AC' })));

  pushSection('Memories and interactions', [
    { name: slot.unlockedItems.includes('stargazer-memory') ? 'First stargazing' : 'Night-sky memory', description: slot.unlockedItems.includes('stargazer-memory') ? 'A quiet moment together in the park at night.' : 'Visit the park at night.', unlocked: slot.unlockedItems.includes('stargazer-memory'), icon: 'ME' },
    { name: (slot.interactions.totalPetting || 0) >= 20 ? 'Trusted touch' : 'A calmer bond', description: (slot.interactions.totalPetting || 0) >= 20 ? 'Your companion recognizes your gentle attention.' : 'Keep interacting calmly over time.', unlocked: (slot.interactions.totalPetting || 0) >= 20, icon: 'IN' }
  ]);

  pushSection('Visited environments', Object.values(ROOMS).map((room) => {
    const unlocked = slot.visitedRooms?.includes(room.id);
    return { name: unlocked ? room.name : 'Unvisited place', description: unlocked ? room.description : `Unlock and visit ${room.name}.`, unlocked, icon: 'EX' };
  }));

  sections.forEach((section) => {
    const wrapper = document.createElement('section');
    wrapper.className = 'drawer-section';
    const heading = document.createElement('h3');
    heading.textContent = section.title;
    const grid = document.createElement('div');
    grid.className = 'card-grid';
    section.cards.forEach((item) => {
      const card = document.createElement('article');
      card.className = `collection-card ${item.unlocked ? '' : 'is-locked'}`;
      card.innerHTML = `<div class="collection-icon" aria-hidden="true">${item.icon}</div><strong>${item.name}</strong><span>${item.description}</span><div class="room-meta"><span>${item.unlocked ? 'Unlocked' : 'Locked'}</span></div>`;
      grid.append(card);
    });
    wrapper.append(heading, grid);
    drawerContent.append(wrapper);
  });
}

function closeDrawer() {
  drawer.hidden = true;
  activePanel = 'home';
  setActiveNav('home');
}

function setActiveNav(panel) {
  $$('.nav-button').forEach((button) => button.classList.toggle('is-active', button.dataset.panel === panel));
}

function renderDaily() {
  const slot = store.active;
  if (!slot) return;
  $('#streak-summary').innerHTML = `<strong>${slot.streak.current}-day rhythm</strong><span>Best ${slot.streak.best} · Grace ${slot.streak.graceAvailable ? 'available' : 'used'}</span>`;
  const list = $('#daily-list');
  list.innerHTML = '';
  slot.daily.objectives.forEach((objective) => {
    const item = document.createElement('article');
    item.className = `daily-item ${objective.complete ? 'is-complete' : ''}`;
    const percent = clamp(objective.progress / objective.target * 100);
    item.innerHTML = `<div class="daily-item-header"><span>${objective.label}</span><span>${objective.complete ? 'Done' : `${Math.min(objective.progress, objective.target)}/${objective.target}`}</span></div><div class="progress-track"><div class="progress-fill" style="width:${percent}%"></div></div>`;
    list.append(item);
  });
  if (slot.daily.claimed) {
    const reward = document.createElement('p');
    reward.className = 'field-help';
    reward.textContent = 'Today’s gentle milestone reward has been added: 55 sparks and 35 XP.';
    list.append(reward);
  }
}

function openPhotoMode() {
  if (!store.active) return;
  closeDrawer();
  const environmentSelect = $('#photo-environment');
  environmentSelect.innerHTML = '';
  store.active.unlockedRooms.forEach((roomId) => {
    const option = document.createElement('option');
    option.value = roomId;
    option.textContent = ROOMS[roomId]?.name || roomId;
    option.selected = roomId === store.active.activeRoom;
    environmentSelect.append(option);
  });
  scene.setPhotoMode(true);
  screens.game.classList.add('photo-mode');
  screens.game.classList.remove('photo-frame-soft', 'photo-frame-sparkle');
  screens.game.querySelectorAll('.topbar, .needs-panel, .primary-actions, .bottom-navigation').forEach((element) => { element.style.visibility = 'hidden'; });
  const dialog = $('#photo-modal');
  if (!dialog.open) dialog.show();
  scene.playAnimation($('#photo-pose').value, { fade: 0.25, force: true });
}

function closePhotoMode() {
  const dialog = $('#photo-modal');
  if (dialog.open) dialog.close();
  scene.setPhotoMode(false);
  screens.game.classList.remove('photo-frame-soft', 'photo-frame-sparkle');
  screens.game.querySelectorAll('.topbar, .needs-panel, .primary-actions, .bottom-navigation').forEach((element) => { element.style.visibility = ''; });
  scene.playAnimation('idle', { fade: 0.25, force: true });
}

async function capturePhoto() {
  const slot = store.active;
  if (!slot) return;
  const sourceUrl = scene.captureImage();
  const image = new Image();
  image.src = sourceUrl;
  await image.decode();
  const output = document.createElement('canvas');
  output.width = image.naturalWidth;
  output.height = image.naturalHeight;
  const context = output.getContext('2d');
  context.drawImage(image, 0, 0);

  const frame = $('#photo-frame').value;
  const inset = Math.max(18, Math.round(output.width * 0.025));
  if (frame === 'soft') {
    context.save();
    context.strokeStyle = 'rgba(255, 250, 241, 0.9)';
    context.lineWidth = Math.max(18, Math.round(output.width * 0.015));
    context.lineJoin = 'round';
    context.strokeRect(inset, inset, output.width - inset * 2, output.height - inset * 2);
    context.strokeStyle = 'rgba(71, 57, 51, 0.18)';
    context.lineWidth = Math.max(2, Math.round(output.width * 0.002));
    context.strokeRect(inset * 1.45, inset * 1.45, output.width - inset * 2.9, output.height - inset * 2.9);
    context.restore();
  } else if (frame === 'sparkle') {
    context.save();
    context.strokeStyle = 'rgba(255, 220, 102, 0.96)';
    context.lineWidth = Math.max(7, Math.round(output.width * 0.006));
    context.setLineDash([12, 16]);
    context.strokeRect(inset, inset, output.width - inset * 2, output.height - inset * 2);
    context.setLineDash([]);
    context.fillStyle = 'rgba(255, 242, 172, 0.96)';
    context.font = `${Math.max(22, Math.round(output.width * 0.032))}px system-ui`;
    const marks = [[inset * 1.5, inset * 2], [output.width - inset * 3, inset * 2.2], [inset * 1.7, output.height - inset * 1.4], [output.width - inset * 3.2, output.height - inset * 1.5]];
    marks.forEach(([x, y], index) => context.fillText(index % 2 ? '✦' : '✧', x, y));
    context.restore();
  }

  const finalUrl = output.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = finalUrl;
  link.download = `${slot.petName.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'companion'}-${Date.now()}.png`;
  document.body.append(link);
  link.click();
  link.remove();
  slot.photoCount = (slot.photoCount || 0) + 1;
  toast('Photo saved locally.');
  store.gainProgress(3, 1);
  store.persist();
}

function showTutorial(index = 0) {
  const slot = store.active;
  if (!slot) return;
  const safeIndex = clamp(index, 0, tutorialSteps.length - 1);
  slot.tutorialStep = safeIndex;
  const step = tutorialSteps[safeIndex];
  $('#tutorial-count').textContent = `Step ${safeIndex + 1} of ${tutorialSteps.length}`;
  $('#tutorial-title').textContent = step.title;
  $('#tutorial-copy').textContent = step.copy;
  $('#next-tutorial').textContent = safeIndex === tutorialSteps.length - 1 ? 'Finish' : 'Next';
  openDialog($('#tutorial-modal'));
}

function advanceTutorial() {
  const slot = store.active;
  if (!slot) return;
  if (slot.tutorialStep >= tutorialSteps.length - 1) {
    slot.tutorialComplete = true;
    closeDialog($('#tutorial-modal'));
    store.persist();
    toast('Tutorial complete. You can explore freely.');
  } else {
    showTutorial(slot.tutorialStep + 1);
  }
}

function skipTutorial() {
  if (!store.active) return;
  store.active.tutorialComplete = true;
  closeDialog($('#tutorial-modal'));
  store.persist();
}

function setTheme(pet) {
  if (!pet) return;
  document.documentElement.style.setProperty('--accent', pet.accent);
  document.documentElement.style.setProperty('--accent-2', pet.accent2);
  document.documentElement.style.setProperty('--accent-soft', colorWithAlpha(pet.accent, 0.23));
}

function colorWithAlpha(hex, alpha) {
  const value = hex.replace('#', '');
  const number = Number.parseInt(value, 16);
  const r = (number >> 16) & 255;
  const g = (number >> 8) & 255;
  const b = number & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function applySettingsToDocument() {
  document.body.classList.toggle('high-contrast', store.settings.highContrast);
  document.body.classList.toggle('reduced-motion', store.settings.reducedMotion);
  document.documentElement.style.setProperty('--text-scale', store.settings.textScale);
  scene.setReducedMotion?.();
  audio.applyVolumes();
}

function syncSettingsInputs() {
  const mapping = {
    '#master-volume': ['masterVolume', 'value'],
    '#music-volume': ['musicVolume', 'value'],
    '#effects-volume': ['effectsVolume', 'value'],
    '#ambient-volume': ['ambientVolume', 'value'],
    '#mute-audio': ['muted', 'checked'],
    '#real-time-decay': ['realTimeDecay', 'checked'],
    '#real-time-lighting': ['realTimeLighting', 'checked'],
    '#fixed-time': ['fixedVisualTime', 'value'],
    '#high-contrast': ['highContrast', 'checked'],
    '#reduced-motion': ['reducedMotion', 'checked'],
    '#simplified-games': ['simplifiedGames', 'checked'],
    '#sound-captions': ['captions', 'checked'],
    '#text-scale': ['textScale', 'value'],
    '#interaction-sensitivity': ['interactionSensitivity', 'value']
  };
  Object.entries(mapping).forEach(([selector, [key, property]]) => {
    const element = $(selector);
    if (element) element[property] = store.settings[key];
  });
}

function updateSetting(key, value) {
  store.updateSettings({ [key]: value });
  applySettingsToDocument();
  if (['realTimeLighting', 'fixedVisualTime'].includes(key)) scene.applyLighting();
  if (['masterVolume', 'musicVolume', 'effectsVolume', 'ambientVolume', 'muted'].includes(key)) audio.applyVolumes();
  updateAmbient();
}

function updateAmbient() {
  if (!store.active) return;
  if (store.settings.muted) {
    audio.applyVolumes();
    return;
  }
  audio.setMusic('music-home');
  if (store.active.isSleeping || scene.dayPhase === 'night') audio.setAmbient('ambient-night');
  else if (['garden', 'park', 'training'].includes(store.active.activeRoom)) audio.setAmbient('ambient-garden');
  else audio.setAmbient('ambient-room');
}

function togglePause() {
  paused = !paused;
  scene.pause(paused);
  $('#pause-button').setAttribute('aria-pressed', String(paused));
  $('#pause-button').textContent = paused ? 'Resume' : 'Pause';
  toast(paused ? 'Paused. Needs are frozen while this screen is paused.' : 'Resumed.');
}

function openDialog(dialog) {
  if (!dialog || dialog.open) return;
  dialog.showModal();
}

function closeDialog(dialog) {
  if (dialog?.open) dialog.close();
}

function confirmAction(title, copy, callback) {
  $('#confirm-title').textContent = title;
  $('#confirm-copy').textContent = copy;
  confirmCallback = callback;
  openDialog($('#confirm-modal'));
}

function toast(message) {
  const item = document.createElement('div');
  item.className = 'toast';
  item.textContent = message;
  toastRegion.append(item);
  setTimeout(() => item.remove(), 3600);
}

function bindGlobalControls() {
  $('#retry-loading').addEventListener('click', () => location.reload());
  $('#start-button').addEventListener('click', async () => { await audio.unlock(); startNewFlow(); });
  $('#continue-button').addEventListener('click', async () => { await audio.unlock(); continueFlow(); });
  $('#selection-back').addEventListener('click', showTitle);
  $('#previous-pet').addEventListener('click', () => shiftSelection(-1));
  $('#next-pet').addEventListener('click', () => shiftSelection(1));
  $('#choose-pet').addEventListener('click', chooseSelection);
  $('#selection-sound').addEventListener('click', () => playSound(`character-${petOrder[selectionIndex]}`));
  $$('[data-pet-dot]').forEach((dot) => dot.addEventListener('click', () => {
    selectionIndex = petOrder.indexOf(dot.dataset.petDot);
    updateSelection();
  }));

  $('#name-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = $('#pet-name-input').value.trim();
    if (!name) return;
    store.createSlot(pendingSlotIndex, petOrder[selectionIndex], name);
    closeDialog($('#name-modal'));
    lastAwayMilliseconds = 0;
    await enterGame();
  });

  $$('[data-close-modal]').forEach((button) => button.addEventListener('click', () => closeDialog($(`#${button.dataset.closeModal}`))));
  $$('[data-open-modal]').forEach((button) => button.addEventListener('click', async () => {
    await audio.unlock();
    syncSettingsInputs();
    openDialog($(`#${button.dataset.openModal}`));
  }));

  $$('.action-button').forEach((button) => button.addEventListener('click', () => handleAction(button.dataset.action)));
  $$('.nav-button').forEach((button) => button.addEventListener('click', () => openPanel(button.dataset.panel)));
  $('#close-drawer').addEventListener('click', closeDrawer);
  $('#needs-toggle').addEventListener('click', () => {
    const panel = $('#needs-panel');
    panel.classList.toggle('is-collapsed');
    $('#needs-toggle').setAttribute('aria-expanded', String(!panel.classList.contains('is-collapsed')));
  });
  $('#slot-button').addEventListener('click', () => { renderSlots('continue'); openDialog($('#slots-modal')); });
  $('#daily-button').addEventListener('click', () => { renderDaily(); openDialog($('#daily-modal')); });
  $('#photo-button').addEventListener('click', openPhotoMode);
  $('#pause-button').addEventListener('click', togglePause);
  $('#finish-clean').addEventListener('click', finishCleaning);
  $('#wake-button').addEventListener('click', () => toggleSleep(false));

  stageElement.addEventListener('pointerenter', (event) => syncCleanSponge(event));
  stageElement.addEventListener('pointermove', (event) => syncCleanSponge(event));
  stageElement.addEventListener('pointerleave', () => { if (stageElement.classList.contains('is-cleaning')) cleanSponge.classList.remove('is-visible'); });
  stageElement.addEventListener('pointerdown', (event) => { if (!stageElement.classList.contains('is-cleaning')) return; cleanSponge.classList.add('is-scrubbing'); syncCleanSponge(event); });
  window.addEventListener('pointermove', syncCleanSponge);
  window.addEventListener('pointerup', () => { cleanSponge.classList.remove('is-scrubbing'); if (stageElement.classList.contains('is-cleaning')) cleanSponge.classList.add('is-visible'); });

  $('#close-game').addEventListener('click', () => { games.stop(); closeDialog($('#game-modal')); currentGameId = null; });
  $('#game-modal').addEventListener('cancel', () => games.stop());
  $('#game-modal').addEventListener('close', () => games.stop());

  $$('[data-care-option]').forEach((button) => button.addEventListener('click', () => {
    const option = button.dataset.careOption;
    if (option === 'clean') { closeDialog($('#care-modal')); startCleaning(); }
    if (option === 'rest') { closeDialog($('#care-modal')); toggleSleep(true); }
    if (option === 'food') { closeDialog($('#care-modal')); openFoodModal(); }
    if (option === 'medicine') useMedicine();
  }));

  $('#photo-pose').addEventListener('change', (event) => scene.playAnimation(event.target.value, { fade: 0.25, force: true }));
  $('#photo-environment').addEventListener('change', (event) => {
    const roomId = event.target.value;
    if (store.setRoom(roomId)) {
      scene.buildEnvironment(roomId);
      scene.placePetSafely();
      updateAmbient();
    }
  });
  $('#photo-frame').addEventListener('change', (event) => {
    screens.game.classList.remove('photo-frame-soft', 'photo-frame-sparkle');
    if (event.target.value !== 'none') screens.game.classList.add(`photo-frame-${event.target.value}`);
  });
  $('#capture-photo').addEventListener('click', capturePhoto);
  $('#close-photo').addEventListener('click', closePhotoMode);

  $('#next-tutorial').addEventListener('click', advanceTutorial);
  $('#skip-tutorial').addEventListener('click', skipTutorial);

  $('#confirm-modal').addEventListener('close', () => {
    if ($('#confirm-modal').returnValue === 'confirm') confirmCallback?.();
    confirmCallback = null;
  });

  const numericSettings = [
    ['#master-volume', 'masterVolume'], ['#music-volume', 'musicVolume'], ['#effects-volume', 'effectsVolume'], ['#ambient-volume', 'ambientVolume'],
    ['#text-scale', 'textScale'], ['#interaction-sensitivity', 'interactionSensitivity']
  ];
  numericSettings.forEach(([selector, key]) => $(selector).addEventListener('input', (event) => updateSetting(key, Number(event.target.value))));
  const booleanSettings = [
    ['#mute-audio', 'muted'], ['#real-time-decay', 'realTimeDecay'], ['#real-time-lighting', 'realTimeLighting'],
    ['#high-contrast', 'highContrast'], ['#reduced-motion', 'reducedMotion'], ['#simplified-games', 'simplifiedGames'], ['#sound-captions', 'captions']
  ];
  booleanSettings.forEach(([selector, key]) => $(selector).addEventListener('change', (event) => updateSetting(key, event.target.checked)));
  $('#fixed-time').addEventListener('change', (event) => updateSetting('fixedVisualTime', event.target.value));

  $('#export-save').addEventListener('click', () => {
    const blob = new Blob([store.exportData()], { type: 'application/json' });
    downloadBlob(blob, `pocket-companions-backup-${new Date().toISOString().slice(0, 10)}.json`);
    toast('Backup exported.');
  });
  $('#import-save').addEventListener('change', async (event) => {
    const [file] = event.target.files;
    if (!file) return;
    try {
      store.importData(await file.text());
      syncSettingsInputs();
      applySettingsToDocument();
      toast('Backup imported successfully.');
      closeDialog($('#settings-modal'));
      showTitle();
    } catch (error) {
      console.error('[Pocket Companions] Import failed:', error);
      toast(error.message || 'Could not import this backup.');
    } finally {
      event.target.value = '';
    }
  });

  scene.onPetGesture = ({ dragging }) => processPetAttention(dragging);
  scene.onCleanProgress = (progress) => {
    $('#clean-progress').style.width = `${progress}%`;
    $('#finish-clean').disabled = progress < 68;
  };
  scene.onMovement = (state) => {
    if ((state === 'walk' || state === 'run') && !movementTracked) {
      movementTracked = true;
      store.track('walk');
      setTimeout(() => { movementTracked = false; }, 10000);
    }
  };
  scene.addEventListener('dayphase', updateAmbient);
  scene.addEventListener('selection-swipe', (event) => shiftSelection(event.detail.direction));
  scene.addEventListener('autonomous', () => {
    if (Math.random() < 0.28) showDialogue(choose(['Just stretching my legs.', 'I found a favorite spot.', 'Come see this side of the room!']), 1);
  });

  store.addEventListener('stats', () => updateUI(true));
  store.addEventListener('progress', (event) => {
    if (event.detail.leveled) {
      playSound('positive');
      scene.spawnParticles('star', 15);
      toast(`Level ${store.active.level} reached. New discoveries may be available.`);
    }
    updateUI(true);
  });
  store.addEventListener('daily', renderDaily);
  store.addEventListener('daily-complete', () => {
    playSound('positive');
    toast('Daily activities complete: +55 sparks and +35 XP.');
    renderDaily();
  });
  store.addEventListener('settings', applySettingsToDocument);

  window.addEventListener('keydown', handleKeyboardShortcuts);
  window.addEventListener('beforeunload', () => store.persist());
}

function handleKeyboardShortcuts(event) {
  if (!store.active || event.target.matches('input, select, textarea')) return;
  if (event.key === 'Escape') {
    if ($('#photo-modal').open) closePhotoMode();
    else if (!drawer.hidden) closeDrawer();
    return;
  }
  const keyMap = { f: 'feed', p: 'play', c: 'clean', s: 'sleep', m: 'medicine' };
  const action = keyMap[event.key.toLowerCase()];
  if (action) {
    event.preventDefault();
    handleAction(action);
  }
  if (event.code === 'Space' && !$('#game-modal').open) {
    event.preventDefault();
    scene.triggerJump();
  }
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js')
      .then((registration) => registration.update())
      .catch((error) => console.warn('[Pocket Companions] Service worker registration failed:', error));
  }
}

init();
