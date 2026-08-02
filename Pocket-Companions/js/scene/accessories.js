import * as THREE from '../../vendor/three.module.js';
import { lerp } from '../utils.js';
import { PET_ACCESSORY_FITS } from '../living-data.js';

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

  getAccessoryTransform(pet, id, anchorType) {
    const defaults = PET_ACCESSORY_FITS.default || {};
    const petFit = PET_ACCESSORY_FITS[pet.id] || {};
    const defaultAccessory = defaults.accessories?.[id] || {};
    const configuredAccessory = petFit.accessories?.[id] || {};
    const runtimeAccessory = this.accessoryFitOverrides?.pets?.[pet.id]?.accessories?.[id] || {};
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

    const defaults = PET_ACCESSORY_FITS.default || {};
    const petFit = PET_ACCESSORY_FITS[pet.id] || {};
    const defaultAccessory = defaults.accessories?.[id] || {};
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

  setAccessory(id = null) {
    this.accessoryGizmo?.detach();
    if (this.accessoryGroup) {
      this.accessoryGroup.removeFromParent();
      this.disposeObject(this.accessoryGroup);
      this.accessoryGroup = null;
    }
    this.accessoryVisualGroup = null;
    this.currentAccessoryId = null;
    this.currentAccessoryAnchorType = null;
    this.accessoryBinding = null;

    const pet = this.currentPet;
    if (!pet || !id) return;

    const anchorType = ['bow', 'hat', 'glasses'].includes(id) ? 'head' : ['backpack', 'cape'].includes(id) ? 'back' : 'neck';
    const root = new THREE.Group();
    root.name = `accessory-${id}`;
    const group = new THREE.Group();
    group.name = `accessory-${id}-visual`;
    root.add(group);

    const primary = new THREE.MeshStandardMaterial({ color: 0xe15f75, roughness: 0.72, metalness: 0.04 });
    const gold = new THREE.MeshStandardMaterial({ color: 0xf2c75d, roughness: 0.55, metalness: 0.2 });
    const h = pet.size.y || 1.2;
    const w = pet.size.x || 0.8;
    const d = pet.size.z || 0.8;
    const transform = this.getAccessoryTransform(pet, id, anchorType);

    if (id === 'collar' || id === 'bandana' || id === 'tag') {
      const collar = new THREE.Mesh(new THREE.TorusGeometry(Math.max(0.18, w * 0.23), 0.03, 10, 28), primary);
      collar.rotation.x = Math.PI / 2;
      group.add(collar);
      if (id === 'bandana') {
        const knot = this.box(Math.max(0.08, w * 0.08), Math.max(0.05, h * 0.04), Math.max(0.04, d * 0.04), primary, 0, -0.02, 0.07);
        const flapLeft = new THREE.Mesh(new THREE.ConeGeometry(Math.max(0.07, w * 0.08), Math.max(0.18, h * 0.16), 3), primary);
        flapLeft.position.set(-Math.max(0.06, w * 0.07), -Math.max(0.1, h * 0.1), Math.max(0.08, d * 0.08));
        flapLeft.rotation.set(Math.PI, 0.2, -0.2);
        const flapRight = flapLeft.clone();
        flapRight.position.x *= -1;
        flapRight.rotation.z *= -1;
        group.add(knot, flapLeft, flapRight);
      }
      if (id === 'tag') {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.007, 6, 16), gold);
        ring.position.set(0, -0.02, 0.06);
        const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.018, 18), gold);
        plate.rotation.x = Math.PI / 2;
        plate.position.set(0, -0.08, 0.085);
        group.add(ring, plate);
      }
    } else if (id === 'bow') {
      const left = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), primary);
      left.scale.set(1.45, 0.68, 0.55);
      left.position.x = -0.12;
      const right = left.clone();
      right.position.x = 0.12;
      const knot = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 8), gold);
      group.add(left, right, knot);
    } else if (id === 'hat') {
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.34, 0.04, 24), primary);
      const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.26, 18), gold);
      crown.position.y = 0.15;
      group.add(brim, crown);
    } else if (id === 'glasses') {
      for (const x of [-0.145, 0.145]) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.102, 0.016, 8, 20), primary);
        ring.position.x = x;
        group.add(ring);
      }
      group.add(this.box(0.09, 0.022, 0.022, gold, 0, 0, 0));
    } else if (id === 'backpack') {
      group.add(this.box(Math.max(0.34, w * 0.44), Math.max(0.36, h * 0.3), Math.max(0.17, d * 0.22), primary, 0, 0, 0));
      group.add(this.box(Math.max(0.12, w * 0.14), Math.max(0.08, h * 0.07), Math.max(0.03, d * 0.04), gold, 0, -Math.max(0.02, h * 0.03), Math.max(0.1, d * 0.12)));
    } else if (id === 'cape') {
      const cape = new THREE.Mesh(new THREE.PlaneGeometry(Math.max(0.52, w * 0.72), Math.max(0.7, h * 0.6)), primary);
      cape.rotation.x = -0.16;
      cape.position.z = -Math.max(0.1, d * 0.14);
      group.add(cape);
    }

    root.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.frustumCulled = false;
        child.raycast = () => {};
      }
    });

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
    if (this.accessoryGizmoEnabled) this.accessoryGizmo?.attach(this.accessoryVisualGroup);
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
