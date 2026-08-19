import * as THREE from '../../vendor/three.module.js';
import { clamp, lerp, randomBetween } from '../utils.js';

export const interactionsMethods = {
  isUiInteractionTarget(target) {
    const element = target instanceof Element ? target : null;
    return Boolean(element?.closest?.([
      'input', 'select', 'textarea', 'button', 'summary', '[contenteditable="true"]',
      'dialog', '.drawer', '.modal-card', '.wardrobe-panel', '.build-panel', '.dev-panel',
      '.bottom-navigation', '.topbar', '.primary-actions', '.needs-panel', '.living-tab-rail',
      '.mobile-menu-sheet', '.mobile-menu-scrim', '.photo-top-controls', '.photo-capture-control',
      '.clean-overlay', '.sleep-overlay', '.language-switcher', '.screen'
    ].join(', ')));
  },

  renderStableFrame() {
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(resolve);
      });
    });
  },

  bindEvents() {
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.canvas.parentElement || this.canvas);
    window.addEventListener('resize', this.resize);
    this.canvas.addEventListener('pointerdown', this.handlePointerDown);
    this.canvas.addEventListener('pointermove', this.handlePointerMove);
    this.canvas.addEventListener('pointerup', this.handlePointerUp);
    this.canvas.addEventListener('pointercancel', this.handlePointerUp);
    this.canvas.addEventListener('pointerleave', this.handleViewportPointerLeave);
    window.addEventListener('pointermove', this.handleViewportPointerMove);
    window.addEventListener('wheel', this.handleWheel, { passive: false, capture: true });
    document.addEventListener('visibilitychange', () => {
      this.clock.getDelta();
    });
  },

  updatePointer(event) {
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
  },

  raycastPet() {
    const pet = this.currentPet;
    if (!pet) return [];
    return this.raycaster.intersectObject(pet.model, true);
  },

  petBodyRegion(hit) {
    const pet = this.currentPet;
    if (!pet || !hit?.point) return 'back';
    const point = pet.model.worldToLocal(hit.point.clone());
    const box = new THREE.Box3().setFromObject(pet.model);
    const localMin = pet.model.worldToLocal(box.min.clone());
    const localMax = pet.model.worldToLocal(box.max.clone());
    const height = Math.max(0.001, Math.abs(localMax.y - localMin.y));
    const normalizedY = clamp((point.y - Math.min(localMin.y, localMax.y)) / height, 0, 1);
    if (normalizedY > 0.72) return 'head';
    if (normalizedY < 0.2) return 'paws';
    if (Math.abs(point.x) > (pet.size.x || 1) * 0.23) return 'flank';
    return normalizedY > 0.48 ? 'back' : 'chest';
  },

  processPetGesture(hit, dragging = false) {
    if (this.petControlsLocked) return;
    const now = performance.now();
    if (now - this.pointerState.lastPetAt < (dragging ? 160 : 70)) return;
    this.pointerState.lastPetAt = now;
    this.spawnParticles('heart', dragging ? 2 : 5, hit.point);
    const pet = this.currentPet;
    if (pet) pet.modelHolder.rotation.z = lerp(pet.modelHolder.rotation.z, randomBetween(-0.07, 0.07), 0.5);
    const duration = Math.max(0, now - (this.pointerState.startedAt || now));
    const direction = Math.abs(this.pointerState.totalDx) >= Math.abs(this.pointerState.totalDy)
      ? (this.pointerState.totalDx < 0 ? 'left' : 'right')
      : (this.pointerState.totalDy < 0 ? 'up' : 'down');
    this.onPetGesture?.({
      dragging,
      kind: dragging ? 'stroke' : 'tap',
      region: this.petBodyRegion(hit),
      point: hit.point.clone(),
      duration,
      speed: this.pointerState.gestureSpeed || 0,
      direction
    });
  },

  handleViewportPointerMove(event) {
    if (!this.canvas || !this.buildViewportPointer) return;
    if (this.isUiInteractionTarget(event.target)) {
      this.buildViewportPointer.inside = false;
      return;
    }
    const rect = this.canvas.getBoundingClientRect();
    const inside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
    this.buildViewportPointer.x = event.clientX;
    this.buildViewportPointer.y = event.clientY;
    this.buildViewportPointer.inside = inside;
  },

  handleViewportPointerLeave() {
    if (this.buildViewportPointer) this.buildViewportPointer.inside = false;
  },

  processCleanHit(hit) {
    if (this.petControlsLocked) return;
    const now = performance.now();
    if (now - this.pointerState.lastPetAt < 70) return;
    this.pointerState.lastPetAt = now;
    for (let i = 0; i < 2; i += 1) this.addBubble(hit.point);
    this.addFoam(hit.point);
    this.addWaterSplash(hit.point);
    if (Math.random() > 0.62) this.spawnParticles('clean', 1, hit.point);
    const dirtLifted = this.cleanNearbyDirt(hit.point);
    const gain = dirtLifted > 0 ? 3.1 + dirtLifted * 0.9 : 1.8;
    this.cleanProgress = clamp(this.cleanProgress + gain, 0, 100);
    this.onCleanProgress?.(this.cleanProgress);
  },

  rotateSelection(delta) {
    if (this.currentPet) this.currentPet.modelHolder.rotation.y += delta;
  }
};
