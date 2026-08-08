import { PETS } from './config.js';
import { ACCESSORIES, PET_ACCESSORY_FITS } from './living-data.js';
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
  const fitId = ACCESSORIES[accessoryId]?.fit || accessoryId;
  const defaultAccessory = defaults.accessories?.[fitId] || {};
  const petAccessory = PET_ACCESSORY_FITS[petId]?.accessories?.[fitId] || {};
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
    this.petName = document.querySelector('#wardrobe-pet-name');
    this.accessorySelect = document.querySelector('#wardrobe-accessory');
    this.categoryTabs = document.querySelector('#wardrobe-category-tabs');
    this.itemGrid = document.querySelector('#wardrobe-item-grid');
    this.emptyState = document.querySelector('#wardrobe-empty');
    this.linkScale = document.querySelector('#wardrobe-link-scale');
    this.status = document.querySelector('#wardrobe-status');
    this.isOpen = false;
    this.previous = null;
    this.petId = null;
    this.accessoryId = null;
    this.data = this.load();
    this.scene.setAccessoryFitOverrides?.(this.data);
    this.inputs = new Map();
    this.gizmoMode = 'translate';
    this.mobileCategory = 'all';
    this.gizmoButtons = [...document.querySelectorAll('[data-wardrobe-gizmo]')];
    this.gizmoSyncFrame = null;
    this.bind();
    this.populateAccessories();
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

  ownedAccessoryIds() {
    const owned = Array.isArray(this.living.state?.accessories?.owned)
      ? this.living.state.accessories.owned
      : [];
    return [...new Set(owned)].filter((id) => Boolean(ACCESSORIES[id]?.model));
  }

  populateAccessories(preferredId = null) {
    if (!this.accessorySelect) return null;
    const owned = this.ownedAccessoryIds();
    const equipped = this.living.state?.accessories?.equipped || null;
    this.accessorySelect.innerHTML = '';

    if (!owned.length) {
      const option = document.createElement('option');
      option.value = '';
      option.textContent = 'Nenhum acessório desbloqueado';
      this.accessorySelect.append(option);
      this.accessorySelect.disabled = true;
      this.accessoryId = null;
      if (this.emptyState) this.emptyState.hidden = false;
      this.setEditorEnabled(false);
      this.renderMobileAccessoryBrowser(owned, equipped);
      return null;
    }

    owned.forEach((id) => {
      const option = document.createElement('option');
      option.value = id;
      option.textContent = localized(ACCESSORIES[id].name, this.language);
      this.accessorySelect.append(option);
    });

    const selected = owned.includes(preferredId)
      ? preferredId
      : owned.includes(equipped)
        ? equipped
        : owned[0];
    this.accessorySelect.disabled = false;
    this.accessorySelect.value = selected;
    this.accessoryId = selected;
    if (this.emptyState) this.emptyState.hidden = true;
    this.setEditorEnabled(true);
    this.renderMobileAccessoryBrowser(owned, equipped);
    return selected;
  }

  renderMobileAccessoryBrowser(owned = this.ownedAccessoryIds(), equipped = this.living.state?.accessories?.equipped || null) {
    if (!this.categoryTabs || !this.itemGrid) return;
    const categories = [
      ['all', this.language === 'en' ? 'All' : 'Todos'],
      ['head', this.language === 'en' ? 'Head' : 'Cabeça'],
      ['neck', this.language === 'en' ? 'Neck' : 'Pescoço'],
      ['back', this.language === 'en' ? 'Body' : 'Corpo']
    ];
    this.categoryTabs.innerHTML = '';
    categories.forEach(([id, label]) => {
      const button = document.createElement('button');
      const active = this.mobileCategory === id;
      button.type = 'button';
      button.className = `wardrobe-category-tab ${active ? 'is-active' : ''}`;
      button.textContent = label;
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-selected', String(active));
      button.addEventListener('click', () => {
        this.mobileCategory = id;
        this.renderMobileAccessoryBrowser();
      });
      this.categoryTabs.append(button);
    });

    const filtered = owned.filter((id) => this.mobileCategory === 'all' || ACCESSORIES[id]?.anchor === this.mobileCategory);
    this.itemGrid.innerHTML = '';
    if (this.mobileCategory === 'all') {
      const clear = document.createElement('button');
      clear.type = 'button';
      clear.className = `wardrobe-item-card ${equipped ? '' : 'is-equipped'}`;
      clear.setAttribute('aria-pressed', String(!equipped));
      clear.innerHTML = `<span class="wardrobe-item-preview" aria-hidden="true">×</span><strong>${this.language === 'en' ? 'No accessory' : 'Sem acessório'}</strong>${equipped ? '' : '<span class="wardrobe-equipped-mark" aria-hidden="true">✓</span>'}`;
      clear.addEventListener('click', () => this.clearEquippedAccessory());
      this.itemGrid.append(clear);
    }

    filtered.forEach((id) => {
      const accessory = ACCESSORIES[id];
      const active = equipped === id;
      const card = document.createElement('button');
      card.type = 'button';
      card.className = `wardrobe-item-card ${active ? 'is-equipped' : ''}`;
      card.setAttribute('aria-pressed', String(active));
      card.setAttribute('aria-label', `${localized(accessory.name, this.language)}${active ? (this.language === 'en' ? ', equipped' : ', equipado') : ''}`);
      const symbol = accessory.anchor === 'head' ? '◉' : accessory.anchor === 'neck' ? '⌁' : '◇';
      card.innerHTML = `<span class="wardrobe-item-preview" aria-hidden="true">${symbol}</span><strong>${localized(accessory.name, this.language)}</strong>${active ? '<span class="wardrobe-equipped-mark" aria-hidden="true">✓</span>' : ''}`;
      card.addEventListener('click', () => this.selectAccessory(id));
      this.itemGrid.append(card);
    });

    if (!filtered.length && this.mobileCategory !== 'all') {
      const empty = document.createElement('p');
      empty.className = 'field-help';
      empty.textContent = this.language === 'en' ? 'No unlocked items in this category yet.' : 'Nenhum item desbloqueado nesta categoria.';
      this.itemGrid.append(empty);
    }
  }

  async clearEquippedAccessory() {
    if (!this.isOpen || !this.store.active) return false;
    this.captureCurrentSceneFit();
    this.persist();
    this.living.state.accessories.equipped = null;
    this.store.persist();
    this.accessoryId = null;
    await this.scene.setAccessory(null);
    this.scene.setStaticPetPreview?.(true);
    this.setEditorEnabled(false);
    this.renderMobileAccessoryBrowser(this.ownedAccessoryIds(), null);
    await this.scene.renderStableFrame?.();
    this.setStatus(this.language === 'en' ? 'Accessory removed. Your companion stays visible for the next choice.' : 'Acessório removido. Seu pet continua visível para a próxima escolha.');
    return true;
  }

  setEditorEnabled(enabled) {
    const active = Boolean(enabled);
    this.scene.setAccessoryGizmoEnabled?.(this.isOpen && active);
    this.gizmoButtons.forEach((button) => { button.disabled = !active; });
    document.querySelectorAll('#wardrobe-reset-current, #wardrobe-reset-all, .wardrobe-axis-grid input')
      .forEach((control) => { control.disabled = !active; });
    const mobileUi = window.matchMedia('(max-width: 900px), (max-height: 560px) and (pointer: coarse)').matches;
    document.querySelectorAll('[data-wardrobe-view]').forEach((control) => { control.disabled = !active && !mobileUi; });
    if (this.linkScale) this.linkScale.disabled = !active;
    this.panel?.classList.toggle('wardrobe-is-empty', !active);
  }

  bind() {
    document.querySelector('#wardrobe-button')?.addEventListener('click', () => this.open());
    document.querySelector('#wardrobe-close')?.addEventListener('click', () => this.close());
    this.accessorySelect?.addEventListener('change', () => this.selectAccessory(this.accessorySelect.value));
    this.linkScale?.addEventListener('change', () => {
      this.scene.setAccessoryGizmoUniformScale?.(this.linkScale.checked);
      this.renderInputs();
    });
    this.gizmoButtons.forEach((button) => {
      button.addEventListener('click', () => this.setGizmoMode(button.dataset.wardrobeGizmo));
    });
    this.scene.addEventListener?.('accessory-gizmo-change', (event) => this.handleGizmoChange(event.detail));
    document.addEventListener('keydown', (event) => this.handleShortcut(event));
    window.addEventListener('languagechange', () => {
      if (!this.isOpen) return;
      const preferred = this.accessoryId || this.living.state?.accessories?.equipped || null;
      if (preferred) this.populateAccessories(preferred);
      this.renderMobileAccessoryBrowser();
    });
    document.querySelector('#wardrobe-reset-current')?.addEventListener('click', () => this.resetCurrent());
    document.querySelector('#wardrobe-reset-all')?.addEventListener('click', () => this.resetAll());
    document.querySelector('#wardrobe-export')?.addEventListener('click', () => this.exportJson());
    document.querySelector('#wardrobe-copy')?.addEventListener('click', () => this.copyJson());
    document.querySelectorAll('[data-wardrobe-view]').forEach((button) => {
      button.addEventListener('click', () => this.scene.setPetPreviewRotation?.(Number(button.dataset.wardrobeView)));
    });
    ['pointerdown', 'pointermove', 'click', 'dblclick', 'contextmenu'].forEach((type) => this.panel?.addEventListener(type, (event) => event.stopPropagation()));
    this.panel?.addEventListener('wheel', (event) => event.stopPropagation(), { passive: true });
    window.addEventListener('pagehide', () => {
      this.captureCurrentSceneFit();
      this.persist();
    });
  }

  async open() {
    const slot = this.store.active;
    if (this.isOpen || !slot) return;
    this.isOpen = true;
    this.previous = {
      slotId: slot.id,
      petId: slot.companionId,
      roomId: slot.activeRoom,
      secondaryPetId: this.living.state?.secondaryPetId || null,
      sleeping: Boolean(slot.isSleeping)
    };
    this.petId = slot.companionId;
    if (this.petName) this.petName.textContent = PETS[this.petId]?.name || slot.petName || this.petId;

    this.closeDrawer?.();
    document.body.classList.add('wardrobe-open');
    this.panel.hidden = false;
    this.scene.setAutonomous?.(false);
    await this.scene.setSecondaryPet?.(null);
    this.scene.setAccessoryFitOverrides?.(this.data);
    await this.scene.setPet(this.petId, { selection: true });
    this.scene.setMode?.('selection');
    this.scene.setStaticPetPreview?.(true);

    const equipped = this.living.state?.accessories?.equipped || null;
    const selected = this.populateAccessories(equipped || this.accessoryId);
    if (selected) await this.selectAccessory(selected, false, selected !== equipped);
    else await this.scene.setAccessory(null);

    this.scene.setAccessoryGizmoUniformScale?.(this.linkScale.checked);
    this.setGizmoMode(this.gizmoMode, false);
    this.setEditorEnabled(Boolean(selected));
    await this.scene.renderStableFrame?.();
    this.setStatus(selected
      ? `Editando apenas ${PETS[this.petId]?.name || 'o pet ativo'}. O modelo fica estático e somente acessórios desbloqueados aparecem aqui.`
      : 'Este pet ainda não desbloqueou acessórios. Compre um item na Loja para personalizá-lo.');
  }

  async close() {
    if (!this.isOpen) return;
    this.captureCurrentSceneFit();
    this.persist();
    this.isOpen = false;
    this.scene.setAccessoryGizmoEnabled?.(false);
    this.scene.setStaticPetPreview?.(false);
    this.panel.hidden = true;
    document.body.classList.remove('wardrobe-open');
    this.scene.setAccessoryFitOverrides?.(this.data);

    const previous = this.previous;
    const activeSlot = this.store.active;
    if (previous?.petId && activeSlot?.id === previous.slotId && activeSlot.companionId === previous.petId) {
      await this.scene.setPet(previous.petId, { selection: false });
      this.scene.buildEnvironment(previous.roomId || 'living');
      this.scene.setAccessoryFitOverrides?.(this.data);
      await this.scene.setAccessory(this.living.state?.accessories?.equipped || null);
      if (previous.sleeping) this.scene.enterSleepMode?.(true);
      else this.scene.placePetSafely?.();
      await this.scene.setSecondaryPet?.(previous.secondaryPetId);
      this.scene.setAutonomous?.(!previous.sleeping);
    }
    this.previous = null;
  }

  async selectAccessory(accessoryId, announce = true, equip = true) {
    if (!this.ownedAccessoryIds().includes(accessoryId)) return false;
    if (this.isOpen && this.accessoryId && this.accessoryId !== accessoryId) {
      this.captureCurrentSceneFit();
      this.persist();
    }

    const activeSlot = this.store.active;
    if (!activeSlot || activeSlot.id !== this.previous?.slotId || activeSlot.companionId !== this.petId) return false;

    this.accessoryId = accessoryId;
    this.accessorySelect.value = accessoryId;
    if (equip) {
      this.living.state.accessories.equipped = accessoryId;
      this.store.persist();
    }
    await this.scene.setAccessory(accessoryId);
    this.scene.setStaticPetPreview?.(true);
    this.setEditorEnabled(true);
    this.renderInputs();
    await this.scene.renderStableFrame?.();
    this.renderMobileAccessoryBrowser();
    if (announce) this.setStatus(`${localized(ACCESSORIES[accessoryId].name, this.language)} equipado somente em ${PETS[this.petId]?.name || 'seu pet'}.`);
    return true;
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
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
      return;
    }
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

  captureCurrentSceneFit() {
    if (!this.isOpen || !this.petId || !this.accessoryId) return false;
    const snapshot = this.scene.getAccessoryEditableFit?.();
    const fit = this.currentFit();
    if (!snapshot || !fit) return false;
    fit.position = snapshot.position.slice(0, 3).map(Number);
    fit.rotation = snapshot.rotation.slice(0, 3).map(Number);
    fit.scale = snapshot.scale.slice(0, 3).map((value) => Math.max(0.001, Number(value)));
    return true;
  }

  currentFit() {
    return this.petId && this.accessoryId
      ? this.data.pets?.[this.petId]?.accessories?.[this.accessoryId] || null
      : null;
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
    if (!fit) return;
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
    if (!this.petId || !this.accessoryId) return;
    this.data.pets[this.petId].accessories[this.accessoryId] = fitFor(this.petId, this.accessoryId);
    this.persist();
    this.scene.setAccessoryFitOverrides?.(this.data);
    this.scene.refreshAccessoryTransform?.();
    this.renderInputs();
    this.setStatus('Este encaixe voltou ao valor original do projeto.');
  }

  resetAll() {
    if (!this.petId) return;
    Object.keys(ACCESSORIES).forEach((accessoryId) => {
      this.data.pets[this.petId].accessories[accessoryId] = fitFor(this.petId, accessoryId);
    });
    this.persist();
    this.scene.setAccessoryFitOverrides?.(this.data);
    this.scene.refreshAccessoryTransform?.();
    this.renderInputs();
    this.setStatus(`Todos os encaixes de ${PETS[this.petId]?.name || 'este pet'} voltaram aos valores originais.`);
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
    this.setStatus('JSON de calibração exportado.');
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
