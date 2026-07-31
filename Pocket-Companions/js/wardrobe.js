import { PETS } from './config.js';
import { ACCESSORIES, PET_ACCESSORY_FITS, ANIMATION_CAPABILITIES } from './living-data.js';
import { downloadBlob } from './utils.js';

const STORAGE_KEY = 'pocket-companions:wardrobe-calibration-v1';
const SCHEMA = 'pocket-companions-accessory-calibration';
const VERSION = 1;
const round = (value, digits = 6) => Number(Number(value || 0).toFixed(digits));
const clone = (value) => JSON.parse(JSON.stringify(value));
const localized = (value, language) => value?.[language === 'en' ? 'en' : 'pt'] || value?.pt || value?.en || '';

function scaleVector(value = 1) {
  if (Array.isArray(value)) {
    return [Number(value[0] ?? 1), Number(value[1] ?? value[0] ?? 1), Number(value[2] ?? value[0] ?? 1)];
  }
  const scalar = Number(value ?? 1);
  return [scalar, scalar, scalar];
}

function fitFor(petId, accessoryId) {
  const defaults = PET_ACCESSORY_FITS.default || {};
  const defaultAccessory = defaults.accessories?.[accessoryId] || {};
  const petAccessory = PET_ACCESSORY_FITS[petId]?.accessories?.[accessoryId] || {};
  return {
    position: clone(petAccessory.position || defaultAccessory.position || [0, 0, 0]),
    rotation: clone(petAccessory.rotation || defaultAccessory.rotation || [0, 0, 0]),
    scale: scaleVector(petAccessory.scale ?? 1)
  };
}

function buildBaseCalibration() {
  const pets = {};
  Object.keys(PETS).forEach((petId) => {
    pets[petId] = { accessories: {} };
    Object.keys(ACCESSORIES).forEach((accessoryId) => {
      pets[petId].accessories[accessoryId] = fitFor(petId, accessoryId);
    });
  });
  return { schema: SCHEMA, version: VERSION, pets };
}

function mergeCalibration(base, saved) {
  if (!saved?.pets) return base;
  Object.keys(base.pets).forEach((petId) => {
    Object.keys(base.pets[petId].accessories).forEach((accessoryId) => {
      const candidate = saved.pets?.[petId]?.accessories?.[accessoryId];
      if (!candidate) return;
      const current = base.pets[petId].accessories[accessoryId];
      current.position = Array.isArray(candidate.position) ? candidate.position.slice(0, 3).map(Number) : current.position;
      current.rotation = Array.isArray(candidate.rotation) ? candidate.rotation.slice(0, 3).map(Number) : current.rotation;
      current.scale = scaleVector(candidate.scale ?? current.scale);
    });
  });
  return base;
}

export class WardrobeController {
  constructor({ scene, store, living, toast, closeDrawer, languageProvider }) {
    this.scene = scene;
    this.store = store;
    this.living = living;
    this.toast = toast;
    this.closeDrawer = closeDrawer;
    this.languageProvider = languageProvider;
    this.panel = document.querySelector('#wardrobe-panel');
    this.petSelect = document.querySelector('#wardrobe-pet');
    this.accessorySelect = document.querySelector('#wardrobe-accessory');
    this.animationSelect = document.querySelector('#wardrobe-animation');
    this.linkScale = document.querySelector('#wardrobe-link-scale');
    this.status = document.querySelector('#wardrobe-status');
    this.isOpen = false;
    this.previous = null;
    this.petId = Object.keys(PETS)[0];
    this.accessoryId = Object.keys(ACCESSORIES)[0];
    this.data = this.load();
    this.inputs = new Map();
    this.gizmoMode = 'translate';
    this.gizmoButtons = [...document.querySelectorAll('[data-wardrobe-gizmo]')];
    this.gizmoSyncFrame = null;
    this.bind();
    this.populateSelectors();
  }

  get language() { return this.languageProvider?.() || 'pt-BR'; }

  load() {
    const base = buildBaseCalibration();
    try {
      return mergeCalibration(base, JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'));
    } catch {
      return base;
    }
  }

  persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
  }

  populateSelectors() {
    this.petSelect.innerHTML = '';
    Object.entries(PETS).forEach(([id, pet]) => {
      const option = document.createElement('option');
      option.value = id;
      option.textContent = pet.name || id;
      this.petSelect.append(option);
    });
    this.accessorySelect.innerHTML = '';
    Object.entries(ACCESSORIES).forEach(([id, accessory]) => {
      const option = document.createElement('option');
      option.value = id;
      option.textContent = localized(accessory.name, this.language);
      this.accessorySelect.append(option);
    });
  }

  bind() {
    document.querySelector('#wardrobe-button')?.addEventListener('click', () => this.open());
    document.querySelector('#wardrobe-close')?.addEventListener('click', () => this.close());
    this.petSelect?.addEventListener('change', () => this.selectPet(this.petSelect.value));
    this.accessorySelect?.addEventListener('change', () => this.selectAccessory(this.accessorySelect.value));
    this.animationSelect?.addEventListener('change', () => this.playAnimation(this.animationSelect.value));
    this.linkScale?.addEventListener('change', () => {
      this.scene.setAccessoryGizmoUniformScale?.(this.linkScale.checked);
      this.renderInputs();
    });
    this.gizmoButtons.forEach((button) => {
      button.addEventListener('click', () => this.setGizmoMode(button.dataset.wardrobeGizmo));
    });
    this.scene.addEventListener?.('accessory-gizmo-change', (event) => this.handleGizmoChange(event.detail));
    document.addEventListener('keydown', (event) => this.handleShortcut(event));
    document.querySelector('#wardrobe-reset-current')?.addEventListener('click', () => this.resetCurrent());
    document.querySelector('#wardrobe-reset-all')?.addEventListener('click', () => this.resetAll());
    document.querySelector('#wardrobe-export')?.addEventListener('click', () => this.exportJson());
    document.querySelector('#wardrobe-copy')?.addEventListener('click', () => this.copyJson());
    document.querySelectorAll('[data-wardrobe-view]').forEach((button) => {
      button.addEventListener('click', () => this.scene.setPetPreviewRotation?.(Number(button.dataset.wardrobeView)));
    });
    this.panel?.addEventListener('pointerdown', (event) => event.stopPropagation());
    this.panel?.addEventListener('wheel', (event) => event.stopPropagation(), { passive: true });
  }

  async open() {
    if (this.isOpen || !this.store.active) return;
    this.isOpen = true;
    this.previous = {
      petId: this.store.active.companionId,
      accessoryId: this.living.state?.accessories?.equipped || null,
      roomId: this.store.active.activeRoom,
      secondaryPetId: this.living.state?.secondaryPetId || null,
      sleeping: Boolean(this.store.active.isSleeping)
    };
    this.closeDrawer?.();
    document.body.classList.add('wardrobe-open');
    this.panel.hidden = false;
    this.scene.setAutonomous?.(false);
    await this.scene.setSecondaryPet?.(null);
    this.scene.setAccessoryFitOverrides?.(this.data);
    this.petId = this.previous.petId || this.petId;
    this.petSelect.value = this.petId;
    await this.selectPet(this.petId, false);
    this.accessoryId = this.accessorySelect.value || this.accessoryId;
    await this.selectAccessory(this.accessoryId, false);
    this.scene.setAccessoryGizmoEnabled?.(true);
    this.scene.setAccessoryGizmoUniformScale?.(this.linkScale.checked);
    this.setGizmoMode(this.gizmoMode, false);
    this.setStatus('Use o gizmo no acessório. W move, E rotaciona e R escala; apenas um modo fica ativo por vez.');
  }

  async close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.persist();
    this.scene.setAccessoryGizmoEnabled?.(false);
    this.panel.hidden = true;
    document.body.classList.remove('wardrobe-open');
    this.scene.setAccessoryFitOverrides?.(null);
    const previous = this.previous;
    if (previous?.petId) {
      await this.scene.setPet(previous.petId, { selection: false });
      this.scene.buildEnvironment(previous.roomId || 'living');
      this.scene.setAccessory(previous.accessoryId);
      if (previous.sleeping) this.scene.enterSleepMode?.(true);
      else this.scene.placePetSafely?.();
      await this.scene.setSecondaryPet?.(previous.secondaryPetId);
      this.scene.setAutonomous?.(!previous.sleeping);
    }
    this.previous = null;
  }

  async selectPet(petId, announce = true) {
    if (!PETS[petId]) return;
    this.petId = petId;
    this.petSelect.value = petId;
    await this.scene.setPet(petId, { selection: true });
    this.scene.setMode?.('selection');
    this.scene.setAccessoryFitOverrides?.(this.data);
    this.populateAnimations();
    this.scene.setAccessory(this.accessoryId);
    if (this.isOpen) {
      this.scene.setAccessoryGizmoEnabled?.(true);
      this.scene.setAccessoryGizmoMode?.(this.gizmoMode);
    }
    this.renderInputs();
    await this.scene.renderStableFrame?.();
    if (announce) this.setStatus(`${PETS[petId].name}: ${localized(ACCESSORIES[this.accessoryId].name, this.language)}.`);
  }

  async selectAccessory(accessoryId, announce = true) {
    if (!ACCESSORIES[accessoryId]) return;
    this.accessoryId = accessoryId;
    this.accessorySelect.value = accessoryId;
    this.scene.setAccessory(accessoryId);
    this.renderInputs();
    await this.scene.renderStableFrame?.();
    if (announce) this.setStatus(`${localized(ACCESSORIES[accessoryId].name, this.language)} selecionado.`);
  }

  populateAnimations() {
    const animations = ANIMATION_CAPABILITIES[this.petId] || ['idle'];
    this.animationSelect.innerHTML = '';
    animations.forEach((id) => {
      const option = document.createElement('option');
      option.value = id;
      option.textContent = id.replaceAll('_', ' ');
      this.animationSelect.append(option);
    });
    this.animationSelect.value = animations.includes('idle') ? 'idle' : animations[0];
  }

  playAnimation(animationId) {
    if (!animationId) return;
    this.scene.playAnimation?.(animationId, { force: true, fade: 0.18, loop: true });
  }

  setGizmoMode(mode, announce = true) {
    if (!['translate', 'rotate', 'scale'].includes(mode)) return;
    this.gizmoMode = mode;
    this.scene.setAccessoryGizmoMode?.(mode);
    this.gizmoButtons.forEach((button) => {
      const active = button.dataset.wardrobeGizmo === mode;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    if (announce) {
      const labels = { translate: 'Mover', rotate: 'Rotacionar', scale: 'Escalar' };
      this.setStatus(`${labels[mode]} ativo. Arraste os eixos coloridos diretamente no acessório.`);
    }
  }

  handleShortcut(event) {
    if (!this.isOpen || event.ctrlKey || event.metaKey || event.altKey) return;
    const tag = event.target?.tagName?.toLowerCase();
    if (['input', 'select', 'textarea'].includes(tag) || event.target?.isContentEditable) return;
    const mode = { w: 'translate', e: 'rotate', r: 'scale' }[event.key.toLowerCase()];
    if (!mode) return;
    event.preventDefault();
    this.setGizmoMode(mode);
  }

  handleGizmoChange(detail) {
    if (!this.isOpen || !detail) return;
    const fit = this.currentFit();
    if (!fit) return;
    fit.position = detail.position.slice(0, 3).map(Number);
    fit.rotation = detail.rotation.slice(0, 3).map(Number);
    fit.scale = detail.scale.slice(0, 3).map((value) => Math.max(0.001, Number(value)));
    this.persist();
    if (!this.gizmoSyncFrame) {
      this.gizmoSyncFrame = requestAnimationFrame(() => {
        this.gizmoSyncFrame = null;
        this.renderInputs();
        const phase = detail.phase === 'end' ? 'Ajuste salvo.' : 'Ajustando pelo gizmo…';
        this.setStatus(phase);
      });
    }
  }

  currentFit() {
    return this.data.pets[this.petId].accessories[this.accessoryId];
  }

  renderInputs() {
    const fit = this.currentFit();
    if (!fit) return;
    const groups = [
      { id: 'position', values: fit.position, step: 0.005, min: -1.5, max: 1.5, digits: 4 },
      { id: 'rotation', values: fit.rotation.map((value) => value * 180 / Math.PI), step: 1, min: -360, max: 360, digits: 2 },
      { id: 'scale', values: fit.scale, step: 0.02, min: 0.05, max: 5, digits: 3 }
    ];
    this.inputs.clear();
    groups.forEach((group) => {
      ['x', 'y', 'z'].forEach((axis, index) => {
        const input = document.querySelector(`#wardrobe-${group.id}-${axis}`);
        if (!input) return;
        input.min = String(group.min);
        input.max = String(group.max);
        input.step = String(group.step);
        input.value = String(round(group.values[index], group.digits));
        input.oninput = () => this.handleInput(group.id, index, Number(input.value));
        this.inputs.set(`${group.id}-${axis}`, input);
      });
    });
  }

  handleInput(groupId, index, value) {
    if (!Number.isFinite(value)) return;
    const fit = this.currentFit();
    if (groupId === 'rotation') fit.rotation[index] = value * Math.PI / 180;
    else if (groupId === 'scale' && this.linkScale.checked) fit.scale = [value, value, value];
    else fit[groupId][index] = value;
    this.persist();
    this.scene.setAccessoryFitOverrides?.(this.data);
    this.scene.refreshAccessoryTransform?.();
    if (groupId === 'scale' && this.linkScale.checked) this.renderInputs();
    this.setStatus('Alteração aplicada e salva localmente.');
  }

  resetCurrent() {
    this.data.pets[this.petId].accessories[this.accessoryId] = fitFor(this.petId, this.accessoryId);
    this.persist();
    this.scene.setAccessoryFitOverrides?.(this.data);
    this.scene.refreshAccessoryTransform?.();
    this.renderInputs();
    this.setStatus('Este encaixe voltou ao valor original do projeto.');
  }

  resetAll() {
    this.data = buildBaseCalibration();
    this.persist();
    this.scene.setAccessoryFitOverrides?.(this.data);
    this.scene.refreshAccessoryTransform?.();
    this.renderInputs();
    this.setStatus('Todos os encaixes voltaram aos valores originais.');
  }

  exportPayload() {
    const pets = {};
    Object.keys(PETS).forEach((petId) => {
      pets[petId] = { accessories: {} };
      Object.keys(ACCESSORIES).forEach((accessoryId) => {
        const fit = this.data.pets[petId].accessories[accessoryId];
        pets[petId].accessories[accessoryId] = {
          position: fit.position.map((value) => round(value)),
          rotation: fit.rotation.map((value) => round(value)),
          scale: fit.scale.map((value) => round(value))
        };
      });
    });
    return {
      schema: SCHEMA,
      version: VERSION,
      exportedAt: new Date().toISOString(),
      notes: {
        position: 'Normalized local offsets multiplied by the pet bounding-box size.',
        rotation: 'Radians in XYZ Euler order.',
        scale: 'Per-pet accessory multiplier. Arrays enable non-uniform XYZ scaling.'
      },
      pets
    };
  }

  exportJson() {
    const payload = this.exportPayload();
    const stamp = new Date().toISOString().slice(0, 10);
    downloadBlob(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }), `pocket-companions-acessorios-${stamp}.json`);
    this.setStatus('JSON de todos os pets exportado.');
    this.toast?.('JSON do Armário exportado.');
  }

  async copyJson() {
    const text = JSON.stringify(this.exportPayload(), null, 2);
    try {
      await navigator.clipboard.writeText(text);
      this.setStatus('JSON copiado para a área de transferência.');
      this.toast?.('JSON copiado.');
    } catch {
      this.setStatus('O navegador bloqueou a cópia. Use Exportar JSON.');
    }
  }

  setStatus(message) {
    if (this.status) this.status.textContent = message;
  }
}
