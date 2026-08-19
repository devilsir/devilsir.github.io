import * as THREE from '../../vendor/three.module.js';

export const mediaMethods = {
  setPhotoMode(enabled) {
    this.mode = enabled ? 'photo' : 'home';
    if (!enabled) this.frameCurrentPet(false);
  },

  getPetAvatarDataUrl() {
    const pet = this.currentPet;
    if (!pet || !this.renderer || !this.camera) return '';
    if (this.petPortraitCache.has(pet.id)) return this.petPortraitCache.get(pet.id);

    const environmentVisible = this.environment.visible;
    const background = this.scene.background;
    const fog = this.scene.fog;
    const stagePosition = pet.stage.position.clone();
    const holderRotation = pet.modelHolder.rotation.clone();
    const modelPosition = pet.model.position.clone();
    const modelRotation = pet.model.rotation.clone();
    const cameraPosition = this.camera.position.clone();
    const cameraQuaternion = this.camera.quaternion.clone();
    const cameraFov = this.camera.fov;
    const target = this.cameraTarget.clone();

    this.environment.visible = false;
    this.scene.background = null;
    this.scene.fog = null;
    pet.stage.position.set(0, 0, 0);
    pet.modelHolder.rotation.set(0, 0, 0);
    pet.model.position.copy(pet.baseModelPosition);
    pet.model.rotation.copy(pet.baseModelRotation);
    pet.stage.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(pet.model);
    const center = box.getCenter(new THREE.Vector3());
    const height = Math.max(0.5, box.max.y - box.min.y);
    this.camera.fov = 28;
    this.camera.updateProjectionMatrix();
    this.camera.position.set(center.x, center.y + height * 0.08, center.z + Math.max(1.1, height * 2.1));
    this.camera.lookAt(center.x, center.y, center.z);
    this.renderer.render(this.scene, this.camera);

    const source = this.renderer.domElement;
    const crop = Math.min(source.width, source.height);
    const offscreen = document.createElement('canvas');
    offscreen.width = 256;
    offscreen.height = 256;
    const context = offscreen.getContext('2d');
    context?.drawImage(source, (source.width - crop) / 2, (source.height - crop) / 2, crop, crop, 0, 0, 256, 256);
    const dataUrl = offscreen.toDataURL('image/png');

    this.environment.visible = environmentVisible;
    this.scene.background = background;
    this.scene.fog = fog;
    pet.stage.position.copy(stagePosition);
    pet.modelHolder.rotation.copy(holderRotation);
    pet.model.position.copy(modelPosition);
    pet.model.rotation.copy(modelRotation);
    this.camera.position.copy(cameraPosition);
    this.camera.quaternion.copy(cameraQuaternion);
    this.camera.fov = cameraFov;
    this.camera.updateProjectionMatrix();
    this.cameraTarget.copy(target);
    this.renderer.render(this.scene, this.camera);
    this.petPortraitCache.set(pet.id, dataUrl);
    return dataUrl;
  },

  captureImage() {
    this.renderer.render(this.scene, this.camera);
    return this.canvas.toDataURL('image/png');
  }
};
