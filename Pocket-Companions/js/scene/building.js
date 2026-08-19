import * as THREE from '../../vendor/three.module.js';

export const buildingMethods = {
  setBuildMode(enabled = false) {
    this.buildGizmoEnabled = Boolean(enabled);
    this.petControlsLocked = this.buildGizmoEnabled;
    if (this.buildCameraPan?.set) this.buildCameraPan.set(0, 0);
    if (this.buildViewportPointer) this.buildViewportPointer.inside = false;
    this.buildGizmo?.setEnabled(this.buildGizmoEnabled);

    this.activePointers?.clear?.();
    this.pinchDistance = null;
    if (this.pointerState) {
      this.pointerState.down = false;
      this.pointerState.dragged = false;
      this.pointerState.multiTouch = false;
      this.pointerState.cameraDrag = false;
      this.pointerState.onPet = false;
    }
    if (this.buildGizmoEnabled) {
      this.stopMovement?.('build-mode');
      this.interruptAutonomous?.('build-mode');
      this.autonomousTarget = null;
      this.secondaryTarget = null;
      if (this.buildSelectedDecorationId) this.selectDecorationForBuild(this.buildSelectedDecorationId);
    } else {
      this.clearBuildSelection();
    }
  },

  setBuildGizmoMode(mode = 'translate') {
    if (!['translate', 'rotate', 'scale'].includes(mode)) return false;
    this.buildGizmo?.cancelDrag?.();
    this.buildGizmo?.setMode(mode);
    this.buildGizmo?.setEnabled(this.buildGizmoEnabled);
    this.buildGizmo?.update();
    return true;
  },

  findDecorationObject(id) {
    if (!id || !this.decorationGroup) return null;
    return this.decorationGroup.children.find((child) => child.userData?.decorationId === id) || null;
  },

  findBuildObject(id) {
    return this.findDecorationObject(id) || this.findDefaultFurnitureObject?.(id) || null;
  },

  selectDecorationForBuild(id = null) {
    this.buildSelectedDecorationId = id || null;
    const object = this.findBuildObject(id);
    if (!object) {
      this.buildGizmo?.detach();
      return false;
    }
    this.buildGizmo?.attach(object);
    this.buildGizmo?.setEnabled(this.buildGizmoEnabled);
    this.buildGizmo?.update();
    return true;
  },

  clearBuildSelection() {
    this.buildSelectedDecorationId = null;
    this.buildGizmo?.detach();
  },

  getBuildSelectionTransform() {
    const object = this.findBuildObject(this.buildSelectedDecorationId);
    if (!object) return null;
    object.rotation.x = 0;
    object.rotation.z = 0;
    const uniformScale = Math.max(0.55, Math.min(2.2, (object.scale.x + object.scale.y + object.scale.z) / 3));
    return {
      id: this.buildSelectedDecorationId,
      key: object.userData?.defaultFurnitureKey || null,
      isDefault: Boolean(object.userData?.isDefaultFurniture),
      x: object.position.x,
      y: Math.max(0, Math.min(5.5, object.position.y)),
      z: object.position.z,
      rotation: object.rotation.y,
      scale: uniformScale
    };
  },

  setBuildSelectionTransform({ x, y, z, rotation, scale } = {}) {
    const object = this.findBuildObject(this.buildSelectedDecorationId);
    if (!object) return false;
    if (Number.isFinite(Number(x))) object.position.x = Number(x);
    if (Number.isFinite(Number(y))) object.position.y = Math.max(0, Math.min(5.5, Number(y)));
    if (Number.isFinite(Number(z))) object.position.z = Number(z);
    object.rotation.set(0, Number.isFinite(Number(rotation)) ? Number(rotation) : object.rotation.y, 0);
    const currentAverage = Math.max(0.0001, (object.scale.x + object.scale.y + object.scale.z) / 3);
    const uniformScale = Math.max(0.55, Math.min(2.2, Number(scale) || currentAverage || 1));
    if (object.userData?.isDefaultFurniture && Array.isArray(object.userData.defaultBaseScaleVector)) {
      const base = object.userData.defaultBaseScaleVector;
      const baseAverage = Math.max(0.0001, (base[0] + base[1] + base[2]) / 3);
      const factor = uniformScale / baseAverage;
      object.scale.set(base[0] * factor, base[1] * factor, base[2] * factor);
    } else {
      object.scale.setScalar(uniformScale);
    }
    object.updateMatrixWorld(true);
    if (object.userData?.isDefaultFurniture) this.updateDefaultFurnitureAnchors?.(object.userData.defaultFurnitureKey);
    this.buildGizmo?.update();
    return true;
  },

  buildObjectIdFromIntersection(object) {
    let cursor = object;
    while (cursor && cursor !== this.scene) {
      if (cursor.userData?.decorationId) return cursor.userData.decorationId;
      if (cursor.userData?.defaultFurnitureId) return cursor.userData.defaultFurnitureId;
      cursor = cursor.parent;
    }
    return null;
  },

  selectBuildObjectAt(event) {
    if (!this.buildGizmoEnabled || this.buildGizmoDragging) return false;
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.set(
      ((event.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1,
      -((event.clientY - rect.top) / Math.max(1, rect.height)) * 2 + 1
    );
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const targets = [];
    if (this.decorationGroup) targets.push(this.decorationGroup);
    for (const object of this.defaultFurnitureObjects || []) targets.push(object);
    const hits = this.raycaster.intersectObjects(targets, true);
    const id = hits.map((hit) => this.buildObjectIdFromIntersection(hit.object)).find(Boolean);
    if (!id) return false;
    this.selectDecorationForBuild(id);
    this.dispatchEvent(new CustomEvent('build-object-selected', { detail: { id } }));
    return true;
  }
};
