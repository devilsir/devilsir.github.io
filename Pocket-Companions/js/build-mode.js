import { FURNITURE, ROOM_UPGRADES } from './living-data.js';
import { PETS } from './config.js';

const deg = (radians) => Math.round((Number(radians) || 0) * 180 / Math.PI * 10) / 10;
const rad = (degrees) => (Number(degrees) || 0) * Math.PI / 180;
const round = (value, digits = 2) => Number(Number(value || 0).toFixed(digits));
const localized = (value, language = 'pt-BR') => value?.[language === 'en' ? 'en' : 'pt'] || value?.pt || value?.en || '';

export class BuildModeController {
  constructor({ scene, store, living, toast, closeDrawer, refreshMain, languageProvider }) {
    this.scene = scene;
    this.store = store;
    this.living = living;
    this.toast = toast;
    this.closeDrawer = closeDrawer;
    this.refreshMain = refreshMain;
    this.languageProvider = languageProvider;
    this.panel = document.querySelector('#build-panel');
    this.shopGrid = document.querySelector('#build-shop-grid');
    this.inventoryGrid = document.querySelector('#build-inventory-grid');
    this.placedSelect = document.querySelector('#build-placed-select');
    this.roomName = document.querySelector('#build-room-name');
    this.wallet = document.querySelector('#build-wallet');
    this.upgradeCopy = document.querySelector('#build-upgrade-copy');
    this.upgradeButton = document.querySelector('#build-upgrade');
    this.empty = document.querySelector('#build-empty');
    this.status = document.querySelector('#build-status');
    this.inputs = {
      x: document.querySelector('#build-x'),
      y: document.querySelector('#build-y'),
      z: document.querySelector('#build-z'),
      rotation: document.querySelector('#build-rotation'),
      scale: document.querySelector('#build-scale')
    };
    this.isOpen = false;
    this.tab = 'shop';
    this.selectedId = null;
    this.gizmoMode = 'translate';
    this.previousAutonomy = true;
    this.petControlStates = new Map();
    this.bind();
  }

  get language() { return this.languageProvider?.() || 'pt-BR'; }
  get room() { return this.store.active?.activeRoom || 'living'; }
  get roomItems() { return Object.entries(FURNITURE).filter(([, item]) => !Array.isArray(item.rooms) || item.rooms.includes(this.room)); }
  get placed() {
    const defaults = this.scene.getDefaultFurnitureRecords?.() || [];
    const purchased = (this.living.state?.decorations || []).filter((entry) => entry.room === this.room && FURNITURE[entry.item]).map((entry) => ({ ...entry, isDefault: false }));
    return [...defaults, ...purchased];
  }

  recordLabel(record) {
    return record?.label || localized(FURNITURE[record?.item]?.name, this.language) || 'Móvel';
  }

  bind() {
    document.querySelector('#build-button')?.addEventListener('click', () => this.open());
    document.querySelector('#build-close')?.addEventListener('click', () => this.close());
    document.querySelectorAll('[data-build-tab]').forEach((button) => button.addEventListener('click', () => this.setTab(button.dataset.buildTab)));
    document.querySelectorAll('[data-build-gizmo]').forEach((button) => {
      const activate = (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.setGizmoMode(button.dataset.buildGizmo);
      };
      button.addEventListener('pointerdown', activate);
      button.addEventListener('click', activate);
    });
    this.placedSelect?.addEventListener('change', () => this.selectPlaced(this.placedSelect.value));
    document.querySelector('#build-apply')?.addEventListener('click', () => this.applyTransform());
    document.querySelector('#build-store-item')?.addEventListener('click', () => this.storeSelected());
    document.querySelector('#build-sell-item')?.addEventListener('click', () => this.sellSelected());
    document.querySelector('#build-reset-room')?.addEventListener('click', () => this.storeAll());
    document.querySelector('#build-export-json')?.addEventListener('click', () => this.exportLayoutJson());
    this.upgradeButton?.addEventListener('click', () => this.upgradeRoom());
    Object.values(this.inputs).forEach((input) => input?.addEventListener('change', () => this.previewInputs()));
    this.scene.addEventListener?.('build-gizmo-change', (event) => this.onGizmoChange(event.detail));
    this.scene.addEventListener?.('build-object-selected', (event) => {
      if (!this.isOpen) return;
      this.setTab('place');
      this.selectPlaced(event.detail?.id);
    });
    document.addEventListener('keydown', (event) => this.onKeydown(event));
    this.panel?.addEventListener('pointerdown', (event) => event.stopPropagation());
    this.panel?.addEventListener('wheel', (event) => event.stopPropagation(), { passive: true });
  }

  async open() {
    if (this.isOpen || !this.store.active || this.scene.travelLocation || this.store.active.isSleeping) {
      if (this.scene.travelLocation) this.toast('Volte para um ambiente da casa antes de construir.');
      else if (this.store.active?.isSleeping) this.toast('Acorde o pet antes de abrir o modo construção.');
      return;
    }
    this.isOpen = true;
    document.querySelector('#wardrobe-close')?.click();
    this.closeDrawer?.();
    document.body.classList.add('build-open');
    this.panel.hidden = false;
    this.scene.setRoomUpgrades?.(this.living.state.roomUpgrades);
    this.previousAutonomy = Boolean(this.scene.autonomousEnabled);
    this.scene.setAutonomous?.(false);
    this.scene.setStaticPetPreview?.(true);
    this.scene.setBuildMode?.(true);
    this.setPetControlsDisabled(true);
    this.setGizmoMode(this.gizmoMode, false);
    this.refresh();
    this.setTab('shop');
  }

  close() {
    if (!this.isOpen) return;
    if (this.selectedId) this.applyTransform(false);
    this.isOpen = false;
    this.selectedId = null;
    this.scene.setBuildMode?.(false);
    this.scene.setStaticPetPreview?.(false);
    this.scene.setAutonomous?.(this.previousAutonomy);
    this.setPetControlsDisabled(false);
    this.panel.hidden = true;
    document.body.classList.remove('build-open');
    this.refreshMain?.();
  }

  setPetControlsDisabled(disabled = true) {
    const controls = document.querySelectorAll([
      '.primary-actions .action-button',
      '#needs-toggle',
      '#photo-button',
      '#wardrobe-button',
      '#pause-button',
      '.bottom-navigation .nav-button'
    ].join(', '));

    controls.forEach((control) => {
      if (!(control instanceof HTMLButtonElement)) return;
      if (disabled) {
        if (!this.petControlStates.has(control)) {
          this.petControlStates.set(control, {
            disabled: control.disabled,
            ariaDisabled: control.getAttribute('aria-disabled')
          });
        }
        control.disabled = true;
        control.setAttribute('aria-disabled', 'true');
      } else {
        const previous = this.petControlStates.get(control);
        if (!previous) return;
        control.disabled = previous.disabled;
        if (previous.ariaDisabled === null) control.removeAttribute('aria-disabled');
        else control.setAttribute('aria-disabled', previous.ariaDisabled);
      }
    });

    if (!disabled) this.petControlStates.clear();
  }

  setTab(tab = 'shop') {
    this.tab = tab === 'place' ? 'place' : 'shop';
    document.querySelectorAll('[data-build-tab]').forEach((button) => {
      const active = button.dataset.buildTab === this.tab;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', String(active));
    });
    const shop = document.querySelector('#build-shop-view');
    const place = document.querySelector('#build-place-view');
    if (shop) shop.hidden = this.tab !== 'shop';
    if (place) place.hidden = this.tab !== 'place';
    if (this.tab === 'place') this.renderPlaced();
  }

  refresh() {
    const roomData = ROOM_UPGRADES[this.room];
    if (this.roomName) this.roomName.textContent = localized(roomData?.name, this.language) || this.room;
    if (this.wallet) this.wallet.textContent = `${this.store.active?.currency || 0} moedas`;
    this.renderUpgrade();
    this.renderShop();
    this.renderInventory();
    this.renderPlaced();
  }

  renderUpgrade() {
    const data = ROOM_UPGRADES[this.room];
    const level = this.living.roomUpgradeLevel(this.room);
    const max = level >= 3;
    const cost = data?.costs?.[level] || 0;
    const scale = Math.round((data?.scales?.[level] || 1) * 100);
    if (this.upgradeCopy) this.upgradeCopy.textContent = max
      ? `Nível ${level}/3 · ${scale}% do tamanho-base · expansão máxima.`
      : `Nível ${level}/3 · ${scale}% do tamanho-base. Próxima expansão: ${cost} moedas.`;
    if (this.upgradeButton) {
      this.upgradeButton.disabled = max || (this.store.active?.currency || 0) < cost;
      this.upgradeButton.textContent = max ? 'Máximo' : `Expandir · ${cost}`;
    }
  }

  renderShop() {
    if (!this.shopGrid) return;
    this.shopGrid.innerHTML = '';
    for (const [id, item] of this.roomItems) {
      const owned = this.living.state.furnitureInventory[id] || 0;
      const card = document.createElement('article');
      card.className = 'build-furniture-card';
      card.innerHTML = `<strong>${localized(item.name, this.language)}</strong><small>${item.size[0].toFixed(1)} × ${item.size[1].toFixed(1)} · +${item.comfort} conforto</small><div class="build-furniture-meta"><span>${item.cost} moedas</span><span>${owned} guardado${owned === 1 ? '' : 's'}</span></div>`;
      const buy = document.createElement('button');
      buy.type = 'button';
      buy.className = 'button button-primary';
      buy.textContent = 'Comprar';
      buy.disabled = (this.store.active?.currency || 0) < item.cost;
      buy.addEventListener('click', () => {
        if (!this.living.buyFurniture(id)) return this.toast('Moedas insuficientes.');
        this.toast(`${localized(item.name, this.language)} foi para o inventário de construção.`);
        this.refresh();
        this.refreshMain?.();
      });
      card.append(buy);
      this.shopGrid.append(card);
    }
  }

  renderInventory() {
    if (!this.inventoryGrid) return;
    this.inventoryGrid.innerHTML = '';
    const entries = this.roomItems.filter(([id]) => (this.living.state.furnitureInventory[id] || 0) > 0);
    if (!entries.length) {
      const empty = document.createElement('p');
      empty.className = 'build-empty';
      empty.textContent = 'Nenhum móvel compatível está guardado. Compre na aba Loja da área.';
      this.inventoryGrid.append(empty);
      return;
    }
    for (const [id, item] of entries) {
      const owned = this.living.state.furnitureInventory[id] || 0;
      const card = document.createElement('article');
      card.className = 'build-furniture-card';
      card.innerHTML = `<strong>${localized(item.name, this.language)}</strong><small>${owned} unidade${owned === 1 ? '' : 's'} disponível${owned === 1 ? '' : 'is'}</small>`;
      const place = document.createElement('button');
      place.type = 'button';
      place.className = 'button button-primary';
      place.textContent = 'Posicionar';
      place.addEventListener('click', () => {
        const result = this.living.placeOwnedFurniture(id);
        if (!result.ok) return this.toast(result.reason === 'space' ? 'Não há um espaço livre válido. Expanda o cômodo ou guarde outro móvel.' : 'Este item não está disponível.');
        this.refresh();
        this.setTab('place');
        this.selectPlaced(result.record.id);
        this.toast('Móvel posicionado. Arraste os eixos para ajustar.');
      });
      card.append(place);
      this.inventoryGrid.append(card);
    }
  }

  renderPlaced() {
    if (!this.placedSelect) return;
    const records = this.placed;
    const previous = records.some((entry) => entry.id === this.selectedId) ? this.selectedId : records[0]?.id || null;
    this.placedSelect.innerHTML = '';
    for (const record of records) {
      const option = document.createElement('option');
      option.value = record.id;
      option.textContent = `${this.recordLabel(record)}${record.isDefault ? ' · padrão' : ''}`;
      this.placedSelect.append(option);
    }
    this.placedSelect.disabled = !records.length;
    if (this.empty) this.empty.hidden = Boolean(records.length);
    this.setControlsEnabled(Boolean(records.length));
    if (previous) {
      this.placedSelect.value = previous;
      this.selectPlaced(previous, false);
    } else {
      this.selectedId = null;
      this.scene.clearBuildSelection?.();
      this.renderInputs(null);
    }
  }

  selectPlaced(id, announce = true) {
    const record = this.placed.find((entry) => entry.id === id);
    if (!record) return false;
    this.selectedId = record.id;
    if (this.placedSelect) this.placedSelect.value = record.id;
    this.scene.selectDecorationForBuild?.(record.id);
    this.scene.setBuildSelectionTransform?.(record);
    const liveTransform = this.scene.getBuildSelectionTransform?.() || record;
    this.renderInputs(liveTransform);
    this.setSelectedActionState(record);
    this.setGizmoMode(this.gizmoMode, false);
    if (announce) this.setStatus(`${this.recordLabel(record)} selecionado. Escolha Mover, Girar ou Escalar.`);
    return true;
  }

  renderInputs(transform) {
    const values = transform || { x: '', y: '', z: '', rotation: 0, scale: 1 };
    if (this.inputs.x) this.inputs.x.value = values.x === '' ? '' : round(values.x);
    if (this.inputs.y) this.inputs.y.value = values.y === '' ? '' : round(values.y);
    if (this.inputs.z) this.inputs.z.value = values.z === '' ? '' : round(values.z);
    if (this.inputs.rotation) this.inputs.rotation.value = values.rotation === '' ? '' : deg(values.rotation);
    if (this.inputs.scale) this.inputs.scale.value = values.scale === '' ? '' : round(values.scale);
  }

  readInputs() {
    return {
      x: Number(this.inputs.x?.value) || 0,
      y: Math.max(0, Math.min(5.5, Number(this.inputs.y?.value) || 0)),
      z: Number(this.inputs.z?.value) || 0,
      rotation: rad(this.inputs.rotation?.value),
      scale: Math.max(0.55, Math.min(2.2, Number(this.inputs.scale?.value) || 1))
    };
  }

  previewInputs() {
    if (!this.selectedId) return;
    this.scene.setBuildSelectionTransform?.(this.readInputs());
  }

  applyTransform(showToast = true) {
    if (!this.selectedId) return false;
    const transform = this.scene.getBuildSelectionTransform?.() || this.readInputs();
    const current = this.placed.find((entry) => entry.id === this.selectedId);
    const ok = current?.isDefault
      ? this.living.saveDefaultFurnitureTransform(this.room, current.key, transform)
      : this.living.moveDecoration(this.selectedId, transform.x, transform.y, transform.z, transform.rotation, transform.scale);
    if (!ok) {
      this.scene.setDecorations?.(this.living.state.decorations);
      this.scene.selectDecorationForBuild?.(this.selectedId);
      const record = this.placed.find((entry) => entry.id === this.selectedId);
      this.renderInputs(record);
      this.setStatus('Posição inválida: o móvel ficou fora do cômodo ou colidiu com outro móvel.');
      if (showToast) this.toast('Não foi possível aplicar essa posição.');
      return false;
    }
    const saved = this.scene.getBuildSelectionTransform?.() || this.placed.find((entry) => entry.id === this.selectedId);
    this.renderInputs(saved);
    this.setStatus('Posição, rotação e escala salvas.');
    if (showToast) this.toast('Móvel salvo.');
    return true;
  }

  onGizmoChange(detail) {
    if (!this.isOpen || !this.selectedId || detail.id !== this.selectedId) return;
    this.renderInputs(detail);
    if (detail.phase === 'end') this.applyTransform(false);
  }

  setGizmoMode(mode, announce = true) {
    if (!['translate','rotate','scale'].includes(mode)) return;
    this.gizmoMode = mode;
    this.scene.setBuildMode?.(true);
    this.scene.setBuildGizmoMode?.(mode);
    if (this.selectedId) this.scene.selectDecorationForBuild?.(this.selectedId);
    document.querySelectorAll('[data-build-gizmo]').forEach((button) => {
      const active = button.dataset.buildGizmo === mode;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    if (announce) this.setStatus(mode === 'translate' ? 'Ferramenta mover ativa.' : mode === 'rotate' ? 'Ferramenta girar ativa.' : 'Ferramenta escalar ativa.');
  }

  setSelectedActionState(record) {
    const isDefault = Boolean(record?.isDefault);
    const storeButton = document.querySelector('#build-store-item');
    const sellButton = document.querySelector('#build-sell-item');
    if (storeButton) {
      storeButton.disabled = !record;
      storeButton.title = isDefault ? 'Guarda o móvel padrão e converte em item do inventário deste ambiente.' : '';
    }
    if (sellButton) {
      sellButton.disabled = isDefault || !record;
      sellButton.title = isDefault ? 'Móveis padrão não podem ser vendidos, apenas guardados.' : '';
    }
  }

  setControlsEnabled(enabled) {
    document.querySelectorAll('[data-build-gizmo], #build-apply, .build-transform-grid input').forEach((element) => { element.disabled = !enabled; });
    if (!enabled) this.setSelectedActionState(null);
    else this.setSelectedActionState(this.placed.find((entry) => entry.id === this.selectedId));
  }

  storeDefaultFurnitureRecord(record) {
    if (!record?.key) return false;
    const room = record.room || this.room;
    const storeMethod = this.living?.storeDefaultFurniture;
    if (typeof storeMethod === 'function') {
      return storeMethod.call(this.living, room, record.key, record.item);
    }

    const state = this.living?.state;
    if (!state) return false;
    state.defaultFurnitureStored ||= {};
    state.defaultFurnitureStored[room] ||= {};
    if (state.defaultFurnitureStored[room][record.key]) return false;
    state.defaultFurnitureStored[room][record.key] = true;

    if (record.item && FURNITURE[record.item]) {
      state.furnitureInventory ||= {};
      state.furnitureInventory[record.item] = (state.furnitureInventory[record.item] || 0) + 1;
    }

    this.scene.setDefaultFurnitureStored?.(state.defaultFurnitureStored);
    this.scene.syncSemanticAnchors?.();
    this.store.persist?.();
    return true;
  }

  storeSelected() {
    if (!this.selectedId) return;
    const record = this.placed.find((entry) => entry.id === this.selectedId);
    if (!record) return;
    const ok = record.isDefault
      ? this.storeDefaultFurnitureRecord(record)
      : this.living.storeDecoration(this.selectedId);
    if (!ok) return;
    this.selectedId = null;
    this.scene.clearBuildSelection?.();
    this.toast(record.isDefault ? 'Móvel padrão guardado no inventário.' : 'Móvel guardado no inventário.');
    this.refresh();
  }

  sellSelected() {
    if (!this.selectedId) return;
    if (this.placed.find((entry) => entry.id === this.selectedId)?.isDefault) { this.toast('Móveis padrão podem ser reposicionados, mas não removidos.'); return; }
    if (!this.living.sellDecoration(this.selectedId)) return;
    this.selectedId = null;
    this.scene.clearBuildSelection?.();
    this.toast('Móvel vendido por 45% do valor original.');
    this.refresh();
    this.refreshMain?.();
  }

  storeAll() {
    const moved = this.living.resetRoomDecorations();
    const defaultVisible = (this.scene.getDefaultFurnitureRecords?.() || []).filter((entry) => entry.room === this.room);
    let defaultCount = 0;
    defaultVisible.forEach((entry) => { if (this.storeDefaultFurnitureRecord(entry)) defaultCount += 1; });
    const count = moved + defaultCount;
    this.selectedId = null;
    this.scene.clearBuildSelection?.();
    this.toast(count ? `${count} móvel${count === 1 ? '' : 'is'} guardado${count === 1 ? '' : 's'}.` : 'Não há móveis posicionados neste ambiente.');
    this.refresh();
  }


  buildExportPayload() {
    const state = this.living.state || {};
    const rooms = Object.keys(ROOM_UPGRADES || {});
    const currentDefaults = (this.scene.getDefaultFurnitureRecords?.() || []).reduce((map, entry) => {
      (map[entry.room] ||= []).push({
        id: entry.id,
        key: entry.key,
        item: entry.item,
        label: this.recordLabel(entry),
        position: { x: round(entry.x), y: round(entry.y), z: round(entry.z) },
        rotation: { y: round(deg(entry.rotation), 1) },
        scale: round(entry.scale)
      });
      return map;
    }, {});

    return {
      exportedAt: new Date().toISOString(),
      activeRoom: this.room,
      petId: this.store.active?.petId || null,
      petName: this.store.active?.name || null,
      roomUpgrades: { ...(state.roomUpgrades || {}) },
      rooms: Object.fromEntries(rooms.map((roomId) => {
        const purchased = (state.decorations || []).filter((entry) => entry.room === roomId).map((entry) => ({
          id: entry.id,
          item: entry.item,
          name: localized(FURNITURE[entry.item]?.name, this.language) || entry.item,
          position: { x: round(entry.x), y: round(entry.y), z: round(entry.z) },
          rotation: { y: round(deg(entry.rotation), 1) },
          scale: round(entry.scale)
        }));
        const transformedDefaults = Object.entries(state.defaultFurnitureTransforms?.[roomId] || {}).map(([key, entry]) => ({
          key,
          position: { x: round(entry.x), y: round(entry.y), z: round(entry.z) },
          rotation: { y: round(deg(entry.rotation), 1) },
          scale: round(entry.scale)
        }));
        const storedDefaults = Object.keys(state.defaultFurnitureStored?.[roomId] || {}).filter((key) => state.defaultFurnitureStored?.[roomId]?.[key]);
        const compatibleInventory = Object.entries(FURNITURE).filter(([, item]) => !Array.isArray(item.rooms) || item.rooms.includes(roomId)).reduce((acc, [id, item]) => {
          const qty = Number(state.furnitureInventory?.[id]) || 0;
          if (qty > 0) acc.push({ id, name: localized(item.name, this.language) || id, quantity: qty });
          return acc;
        }, []);
        return [roomId, {
          roomName: localized(ROOM_UPGRADES[roomId]?.name, this.language) || roomId,
          upgradeLevel: this.living.roomUpgradeLevel(roomId),
          visibleDefaultFurnitureCurrentScene: currentDefaults[roomId] || [],
          savedDefaultFurnitureTransforms: transformedDefaults,
          storedDefaultFurniture: storedDefaults,
          placedPurchasedFurniture: purchased,
          compatibleInventory
        }];
      }))
    };
  }

  exportLayoutJson() {
    const payload = this.buildExportPayload();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeRoom = String(this.room || 'ambiente').replace(/[^a-z0-9_-]+/gi, '-').toLowerCase();
    link.download = `pocket-companions-layout-${safeRoom}.json`;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1200);
    this.toast('JSON do modo construção exportado.');
    this.setStatus('JSON exportado com móveis, posições, rotações e escalas.');
  }

  upgradeRoom() {
    const result = this.living.upgradeRoom(this.room);
    if (!result.ok) {
      this.toast(result.reason === 'max' ? 'Este ambiente já está no tamanho máximo.' : result.reason === 'coins' ? `São necessárias ${result.cost} moedas.` : 'Este ambiente não pode ser expandido.');
      return;
    }
    this.selectedId = null;
    this.scene.clearBuildSelection?.();
    this.scene.setBuildMode?.(true);
    this.toast(`Cômodo expandido para o nível ${result.level}.`);
    this.refresh();
    this.refreshMain?.();
  }

  onKeydown(event) {
    if (!this.isOpen || event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || event.target instanceof HTMLTextAreaElement) return;
    const key = event.key.toLowerCase();
    if (key === 'w') this.setGizmoMode('translate');
    else if (key === 'e') this.setGizmoMode('rotate');
    else if (key === 'r') this.setGizmoMode('scale');
    else if (key === 'escape') this.close();
  }

  setStatus(message = '') {
    if (this.status) this.status.textContent = message;
  }
}
