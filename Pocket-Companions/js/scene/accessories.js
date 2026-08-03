import * as THREE from '../../vendor/three.module.js';
import { ACCESSORIES, PET_ACCESSORY_FITS } from '../living-data.js';

export const accessoriesMethods = {
  findAttachmentBone(record, anchor = 'neck') {
    const preferences = anchor === 'head'
      ? ['head0', 'head', 'skull', 'face', 'neck1']
      : anchor === 'back'
        ? ['body_top0', 'body_top1', 'spine', 'chest', 'back', 'body']
        : ['neck1', 'neck0', 'neck', 'body_top1', 'spine', 'chest'];
    let best = null;
    let bestScore = -Infinity;

    record.model.traverse((child) => {
      if (!child.isBone) return;
      const name = child.name.toLowerCase();
      let score = -1000;
      preferences.forEach((pattern, index) => {
        if (name === pattern) score = Math.max(score, 1000 - index * 40);
        else if (name.startsWith(pattern)) score = Math.max(score, 800 - index * 40);
        else if (name.includes(pattern)) score = Math.max(score, 600 - index * 40);
      });
      if (name.includes('end') || name.includes('tip')) score -= 700;
      if (score > bestScore) {
        best = child;
        bestScore = score;
      }
    });

    return bestScore > -1000 ? best : null;
  },

  vectorFromScaledArray(values = [0, 0, 0], size = { x: 1, y: 1, z: 1 }) {
    return new THREE.Vector3(values[0] * size.x, values[1] * size.y, values[2] * size.z);
  },

  eulerFromArray(values = [0, 0, 0]) {
    return new THREE.Euler(values[0] || 0, values[1] || 0, values[2] || 0);
  },

  getAccessoryFitId(id) {
    return ACCESSORIES[id]?.fit || id;
  },

  getAccessoryTransform(pet, id, anchorType) {
    const fitId = this.getAccessoryFitId(id);
    const defaults = PET_ACCESSORY_FITS.default || {};
    const petFit = PET_ACCESSORY_FITS[pet.id] || {};
    const defaultAccessory = defaults.accessories?.[fitId] || {};
    const configuredAccessory = petFit.accessories?.[fitId] || {};
    const runtimeAccessory = this.accessoryFitOverrides?.pets?.[pet.id]?.accessories?.[id]
      || this.accessoryFitOverrides?.pets?.[pet.id]?.accessories?.[fitId]
      || {};
    const petAccessory = { ...configuredAccessory, ...runtimeAccessory };
    const size = pet.size || { x: 1, y: 1, z: 1 };
    const anchorOffset = this.vectorFromScaledArray(petFit[anchorType] || defaults[anchorType] || [0, 0, 0], size);
    const localOffset = this.vectorFromScaledArray(petAccessory.position || defaultAccessory.position || [0, 0, 0], size);
    const rotationValues = petAccessory.rotation || defaultAccessory.rotation || [0, 0, 0];
    const baseScale = (defaults.scale || 1) * (petFit.scale || 1);
    const defaultScaleValue = defaultAccessory.scale ?? 1;
    const petScaleValue = petAccessory.scale ?? 1;
    const defaultScale = Array.isArray(defaultScaleValue)
      ? new THREE.Vector3(defaultScaleValue[0] ?? 1, defaultScaleValue[1] ?? defaultScaleValue[0] ?? 1, defaultScaleValue[2] ?? defaultScaleValue[0] ?? 1)
      : new THREE.Vector3(defaultScaleValue, defaultScaleValue, defaultScaleValue);
    const petScale = Array.isArray(petScaleValue)
      ? new THREE.Vector3(petScaleValue[0] ?? 1, petScaleValue[1] ?? petScaleValue[0] ?? 1, petScaleValue[2] ?? petScaleValue[0] ?? 1)
      : new THREE.Vector3(petScaleValue, petScaleValue, petScaleValue);
    const scale = defaultScale.multiply(petScale).multiplyScalar(baseScale);
    return { anchorOffset, localOffset, rotation: this.eulerFromArray(rotationValues), scale };
  },

  setAccessoryFitOverrides(overrides = null) {
    this.accessoryFitOverrides = overrides;
    this.refreshAccessoryTransform();
  },

  refreshAccessoryTransform() {
    const pet = this.currentPet;
    if (!pet || !this.currentAccessoryId || !this.accessoryVisualGroup) return false;
    const transform = this.getAccessoryTransform(pet, this.currentAccessoryId, this.currentAccessoryAnchorType);
    this.accessoryVisualGroup.position.copy(transform.localOffset);
    this.accessoryVisualGroup.rotation.copy(transform.rotation);
    this.accessoryVisualGroup.scale.copy(transform.scale);
    if (this.accessoryBinding) this.accessoryBinding.anchorOffset.copy(transform.anchorOffset);
    else if (this.accessoryGroup) this.accessoryGroup.position.copy(this.getFallbackAccessoryAnchor(this.currentAccessoryAnchorType, pet)).add(transform.anchorOffset);
    this.accessoryGroup?.updateMatrixWorld(true);
    this.accessoryGizmo?.update();
    return true;
  },

  setPetPreviewRotation(yaw = 0) {
    if (!this.currentPet) return;
    this.currentPet.modelHolder.rotation.y = Number(yaw) || 0;
  },

  setAccessoryGizmoEnabled(enabled = false) {
    this.accessoryGizmoEnabled = Boolean(enabled);
    this.accessoryGizmo?.setEnabled(this.accessoryGizmoEnabled);
    if (this.accessoryGizmoEnabled && this.accessoryVisualGroup) this.accessoryGizmo?.attach(this.accessoryVisualGroup);
    else if (!this.accessoryGizmoEnabled) this.accessoryGizmo?.detach();
  },

  setAccessoryGizmoMode(mode = 'translate') {
    this.accessoryGizmo?.setMode(mode);
  },

  setAccessoryGizmoUniformScale(enabled = true) {
    this.accessoryGizmo?.setUniformScale(enabled);
  },

  getAccessoryEditableFit() {
    const pet = this.currentPet;
    const id = this.currentAccessoryId;
    const visual = this.accessoryVisualGroup;
    if (!pet || !id || !visual) return null;

    const fitId = this.getAccessoryFitId(id);
    const defaults = PET_ACCESSORY_FITS.default || {};
    const petFit = PET_ACCESSORY_FITS[pet.id] || {};
    const defaultAccessory = defaults.accessories?.[fitId] || {};
    const size = pet.size || { x: 1, y: 1, z: 1 };
    const safeSize = {
      x: Math.max(0.0001, size.x || 1),
      y: Math.max(0.0001, size.y || 1),
      z: Math.max(0.0001, size.z || 1)
    };
    const defaultScaleValue = defaultAccessory.scale ?? 1;
    const defaultScale = Array.isArray(defaultScaleValue)
      ? new THREE.Vector3(defaultScaleValue[0] ?? 1, defaultScaleValue[1] ?? defaultScaleValue[0] ?? 1, defaultScaleValue[2] ?? defaultScaleValue[0] ?? 1)
      : new THREE.Vector3(defaultScaleValue, defaultScaleValue, defaultScaleValue);
    const fixedScale = defaultScale.multiplyScalar((defaults.scale || 1) * (petFit.scale || 1));

    return {
      position: [visual.position.x / safeSize.x, visual.position.y / safeSize.y, visual.position.z / safeSize.z],
      rotation: [visual.rotation.x, visual.rotation.y, visual.rotation.z],
      scale: [
        visual.scale.x / Math.max(0.0001, fixedScale.x),
        visual.scale.y / Math.max(0.0001, fixedScale.y),
        visual.scale.z / Math.max(0.0001, fixedScale.z)
      ]
    };
  },

  getFallbackAccessoryAnchor(anchorType, pet) {
    const h = pet.size.y || 1.2;
    const d = pet.size.z || 0.8;
    if (anchorType === 'head') return new THREE.Vector3(0, h * 0.82, -d * 0.03);
    if (anchorType === 'back') return new THREE.Vector3(0, h * 0.52, -d * 0.2);
    return new THREE.Vector3(0, h * 0.57, d * 0.08);
  },

  configureAccessoryMeshes(object) {
    object.traverse((child) => {
      if (!child.isMesh) return;
      child.castShadow = true;
      child.receiveShadow = true;
      child.frustumCulled = false;
      child.raycast = () => {};
    });
  },

  prepareLoadedAccessory(model, definition) {
    const wrapper = new THREE.Group();
    wrapper.name = 'imported-accessory-model';
    model.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(model);
    if (!bounds.isEmpty()) {
      const center = bounds.getCenter(new THREE.Vector3());
      model.position.sub(center);
    }
    wrapper.add(model);
    const modelScale = Number(definition.modelScale) || 1;
    wrapper.scale.setScalar(modelScale);
    if (Array.isArray(definition.modelOffset)) wrapper.position.fromArray(definition.modelOffset);
    if (Array.isArray(definition.modelRotation)) wrapper.rotation.fromArray(definition.modelRotation);
    this.configureAccessoryMeshes(wrapper);
    return wrapper;
  },

  clearAccessory() {
    this.accessoryLoadRequest = (this.accessoryLoadRequest || 0) + 1;
    this.accessoryGizmo?.detach();
    if (this.accessoryGroup) {
      this.accessoryGroup.removeFromParent();
      this.disposeObject(this.accessoryGroup);
    }
    this.accessoryGroup = null;
    this.accessoryVisualGroup = null;
    this.currentAccessoryId = null;
    this.currentAccessoryAnchorType = null;
    this.accessoryBinding = null;
  },

  setAccessory(id = null) {
    this.clearAccessory();
    const requestId = this.accessoryLoadRequest;
    const pet = this.currentPet;
    const definition = ACCESSORIES[id];
    if (!pet || !id || !definition?.model) return Promise.resolve(false);

    const fitId = definition.fit || id;
    const anchorType = definition.anchor || (['bow', 'hat', 'glasses'].includes(fitId) ? 'head' : ['backpack', 'cape'].includes(fitId) ? 'back' : 'neck');
    const root = new THREE.Group();
    root.name = `accessory-${id}`;
    const group = new THREE.Group();
    group.name = `accessory-${id}-visual`;
    root.add(group);

    const transform = this.getAccessoryTransform(pet, id, anchorType);
    group.position.copy(transform.localOffset);
    group.rotation.copy(transform.rotation);
    group.scale.copy(transform.scale);
    this.accessoryVisualGroup = group;
    this.currentAccessoryId = id;
    this.currentAccessoryAnchorType = anchorType;
    pet.modelHolder.add(root);

    const bone = this.findAttachmentBone(pet, anchorType);
    if (bone) {
      pet.modelHolder.updateWorldMatrix(true, false);
      bone.updateWorldMatrix(true, false);

      bone.getWorldPosition(this.accessoryWorldPosition);
      pet.modelHolder.worldToLocal(this.accessoryWorldPosition);
      root.position.copy(this.accessoryWorldPosition).add(transform.anchorOffset);

      bone.getWorldQuaternion(this.accessoryBoneQuaternion);
      pet.modelHolder.getWorldQuaternion(this.accessoryHolderQuaternion);
      const relativeBoneQuaternion = this.accessoryHolderQuaternion.clone().invert().multiply(this.accessoryBoneQuaternion);

      this.accessoryBinding = {
        root,
        bone,
        holder: pet.modelHolder,
        anchorOffset: transform.anchorOffset.clone(),
        orientationCorrection: relativeBoneQuaternion.clone().invert()
      };
    } else {
      root.position.copy(this.getFallbackAccessoryAnchor(anchorType, pet)).add(transform.anchorOffset);
    }

    this.accessoryGroup = root;
    root.updateMatrixWorld(true);
    if (this.accessoryGizmoEnabled) this.accessoryGizmo?.attach(group);


    group.userData.loading = true;
    return new Promise((resolve) => {
      this.loader.load(
        definition.model,
        (gltf) => {
          const stillCurrent = requestId === this.accessoryLoadRequest
            && this.currentPet === pet
            && this.currentAccessoryId === id
            && root.parent;
          if (!stillCurrent) {
            this.disposeObject(gltf.scene);
            resolve(false);
            return;
          }
          const imported = this.prepareLoadedAccessory(gltf.scene, definition);
          group.add(imported);
          group.userData.loading = false;
          root.updateMatrixWorld(true);
          this.accessoryGizmo?.update();
          this.dispatchEvent?.(new CustomEvent('accessory-loaded', { detail: { id, petId: pet.id } }));
          resolve(true);
        },
        undefined,
        (error) => {
          const stillCurrent = requestId === this.accessoryLoadRequest
            && this.currentPet === pet
            && this.currentAccessoryId === id
            && root.parent;
          if (stillCurrent) {
            console.warn(`Could not load accessory model ${definition.model}.`, error);
            this.clearAccessory();
          }
          resolve(false);
        }
      );
    });
  },

  updateAccessoryBinding(delta) {
    const binding = this.accessoryBinding;
    if (!binding?.root?.parent || !binding.bone?.parent || !binding.holder?.parent) return;

    binding.holder.updateWorldMatrix(true, false);
    binding.bone.updateWorldMatrix(true, false);

    binding.bone.getWorldPosition(this.accessoryWorldPosition);
    this.accessoryTargetPosition.copy(this.accessoryWorldPosition);
    binding.holder.worldToLocal(this.accessoryTargetPosition);

    binding.bone.getWorldQuaternion(this.accessoryBoneQuaternion);
    binding.holder.getWorldQuaternion(this.accessoryHolderQuaternion);
    this.accessoryTargetQuaternion
      .copy(this.accessoryHolderQuaternion)
      .invert()
      .multiply(this.accessoryBoneQuaternion)
      .multiply(binding.orientationCorrection);

    this.accessoryAnchorOffset.copy(binding.anchorOffset).applyQuaternion(this.accessoryTargetQuaternion);
    this.accessoryTargetPosition.add(this.accessoryAnchorOffset);

    const settings = this.settingsProvider?.() || {};
    const follow = settings.reducedMotion ? 1 : 1 - Math.exp(-Math.max(0, delta) * 38);
    if (binding.root.position.distanceToSquared(this.accessoryTargetPosition) < 0.000002) binding.root.position.copy(this.accessoryTargetPosition);
    else binding.root.position.lerp(this.accessoryTargetPosition, follow);
    if (1 - Math.abs(binding.root.quaternion.dot(this.accessoryTargetQuaternion)) < 0.000002) binding.root.quaternion.copy(this.accessoryTargetQuaternion);
    else binding.root.quaternion.slerp(this.accessoryTargetQuaternion, follow);
  }
};
