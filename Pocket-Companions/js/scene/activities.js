import * as THREE from '../../vendor/three.module.js';
import { FURNITURE } from '../living-data.js';
import { clamp } from '../utils.js';

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const ACTIVITY_POINTS = {
  fetch: [[-2.4, 1.1], [2.8, -0.2], [0, 1.65]],
  'hide-treat': [[-2.5, -0.4], [1.9, 1.6], [3.15, -1.1]],
  'scent-trail': [[-3.1, 1.5], [-1.3, -1.6], [0.7, 1.4], [2.9, -1.2]],
  laser: [[-2.8, 1.25], [-0.5, -1.65], [2.5, 1.25], [1.2, -1.45]],
  'obstacle-course': [[-3.7, 1.7], [-1.3, 0.8], [1.15, -0.6], [3.5, 1.55]],
  'hide-seek': [[-3.15, -0.15], [2.7, 1.5], [0, 1.65]],
  'toy-selection': [[-1.5, 0.8], [0.2, 0.8], [1.9, 0.8]]
};

function activityColor(id) {
  return ({ fetch: 0xff9c68, 'hide-treat': 0xf2c45f, 'scent-trail': 0x75d7b5, laser: 0xff668f, 'obstacle-course': 0x7cb7e8, 'command-sequence': 0xa788df, 'hide-seek': 0x72cbd4, 'toy-selection': 0xf2a4c1 })[id] || 0xffd477;
}

export const activitiesMethods = {
  clearWorldActivity() {
    if (this.activityGroup) {
      this.activityGroup.removeFromParent();
      this.disposeObject(this.activityGroup);
    }
    this.activityGroup = null;
    this.activityState = null;
    this.contextualFocus = null;
  },

  createActivityProp(id, point, index = 0) {
    const color = activityColor(id);
    let geometry;
    if (id === 'obstacle-course') geometry = index % 2 ? new THREE.TorusGeometry(0.48, 0.055, 8, 28) : new THREE.BoxGeometry(0.72, 0.42, 0.22);
    else if (id === 'scent-trail') geometry = new THREE.SphereGeometry(0.07, 8, 6);
    else if (id === 'laser') geometry = new THREE.RingGeometry(0.08, 0.13, 18);
    else if (id === 'hide-treat') geometry = new THREE.ConeGeometry(0.11, 0.22, 12);
    else geometry = index % 2 ? new THREE.IcosahedronGeometry(0.18, 1) : new THREE.SphereGeometry(0.18, 14, 10);
    const material = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: id === 'laser' || id === 'scent-trail' ? 0.65 : 0.12, roughness: 0.62, transparent: id === 'scent-trail', opacity: id === 'scent-trail' ? 0.55 : 1 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(point[0], id === 'obstacle-course' ? (index % 2 ? 0.72 : 0.23) : 0.16, point[1]);
    if (id === 'obstacle-course' && index % 2) mesh.rotation.y = Math.PI / 2;
    if (id === 'laser') mesh.rotation.x = -Math.PI / 2;
    mesh.castShadow = id !== 'laser' && id !== 'scent-trail';
    mesh.userData.activityProp = true;
    this.activityGroup.add(mesh);
    return mesh;
  },

  async runWorldActivity(id, options = {}) {
    if (this.activityState || !this.currentPet || this.mode !== 'home') return { ok: false, reason: 'busy' };
    this.clearWorldActivity();
    this.activityGroup = new THREE.Group();
    this.activityGroup.name = `world-activity-${id}`;
    this.scene.add(this.activityGroup);
    this.activityState = { id, startedAt: performance.now(), phase: 0, focus: null };
    const pet = this.currentPet;
    const points = ACTIVITY_POINTS[id] || [[0, 1.4]];
    const props = points.map((point, index) => this.createActivityProp(id, point, index));
    let completed = 0;
    let objectId = id;
    try {
      if (id === 'command-sequence') {
        const sequence = ['sit', 'give_paw', 'jump'];
        for (const animation of sequence) {
          this.contextualFocus = pet.stage.position.clone();
          if (animation === 'jump') await this.triggerJump?.();
          else {
            pet.controller.play(pet.controller.has(animation) ? animation : 'idle', { force: true, loop: false, fade: 0.2 });
            await wait(720);
          }
          completed += 1;
        }
      } else {
        for (let index = 0; index < points.length; index += 1) {
          const [x, z] = points[index];
          const point = this.findSafePosition(new THREE.Vector3(x, 0, z));
          this.contextualFocus = point.clone();
          this.activityState.phase = index;
          const arrived = await this.moveToAndWait(point.x, point.z, { run: ['fetch', 'laser', 'hide-seek', 'obstacle-course'].includes(id), timeout: 4600 });
          if (!arrived) continue;
          completed += 1;
          if (id === 'obstacle-course' && index > 0) await this.triggerJump?.();
          else pet.controller.play(id === 'hide-seek' && index === 0 && pet.controller.has('sit') ? 'sit' : 'idle', { force: true, fade: 0.16 });
          if (props[index]) {
            props[index].visible = id === 'scent-trail' ? false : true;
            props[index].scale.multiplyScalar(id === 'laser' ? 0.82 : 1.12);
          }
          await wait(id === 'obstacle-course' ? 260 : 430);
        }
      }
      if (id === 'toy-selection' && props.length) {
        const selected = Math.abs([...String(options.petId || '')].reduce((sum, char) => sum + char.charCodeAt(0), 0)) % props.length;
        props.forEach((prop, index) => { prop.material.emissiveIntensity = index === selected ? 0.75 : 0.05; });
        objectId = ['ball', 'rope-toy', 'feather'][selected];
      }
      const quality = clamp(completed / Math.max(1, id === 'command-sequence' ? 3 : points.length), 0.25, 1);
      if (quality >= 0.5) this.spawnParticles('star', Math.round(3 + quality * 5));
      await wait(420);
      return { ok: true, quality, objectId, completed, total: id === 'command-sequence' ? 3 : points.length };
    } finally {
      pet.controller.play('idle', { force: true, fade: 0.2 });
      this.clearWorldActivity();
    }
  },

  setEmergentEvent(event = null) {
    if (this.emergentEventGroup) {
      this.emergentEventGroup.removeFromParent();
      this.disposeObject(this.emergentEventGroup);
    }
    this.emergentEventGroup = null;
    this.emergentVisualState = null;
    if (!event || !this.scene) {
      if (!this.activityState && !this.secondaryAction) this.contextualFocus = null;
      return;
    }
    const group = new THREE.Group();
    group.name = `emergent-${event.id}`;
    const point = event.point || (['knock', 'door-sound'].includes(event.id) ? [4.35, 1.1, -1.7] : [-1.5, 0.35, 0.8]);
    const colors = { thunder: 0x7692c5, knock: 0xe5b45f, 'lost-toy': 0xff8c73, 'strange-object': 0x9b7de0, 'illness-symptom': 0xe5c466, 'sudden-noise': 0xe78275, 'friend-visit': 0x75cfa7 };
    const color = colors[event.id] || 0xf2b76f;
    const geometry = event.id === 'lost-toy' ? new THREE.SphereGeometry(0.2, 14, 10) : event.id === 'strange-object' ? new THREE.OctahedronGeometry(0.24, 0) : new THREE.TorusGeometry(0.23, 0.045, 8, 24);
    const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.55, transparent: true, opacity: 0.88 }));
    mesh.position.set(point[0], point[1], point[2]);
    if (geometry.type === 'TorusGeometry') mesh.rotation.y = Math.PI / 2;
    group.add(mesh);
    this.scene.add(group);
    this.emergentEventGroup = group;
    this.emergentVisualState = { event, mesh, phase: Math.random() * Math.PI * 2 };
    this.contextualFocus = mesh.position.clone();
  },

  updateSceneNarratives(delta) {
    if (this.activityGroup) {
      this.activityGroup.children.forEach((child, index) => {
        child.rotation.y += delta * (0.6 + index * 0.08);
        if (child.userData.activityProp && this.activityState?.id !== 'obstacle-course') child.position.y += Math.sin(performance.now() * 0.003 + index) * delta * 0.018;
      });
    }
    if (this.emergentVisualState) {
      this.emergentVisualState.phase += delta * 3;
      const pulse = 1 + Math.sin(this.emergentVisualState.phase) * 0.08;
      this.emergentVisualState.mesh.scale.setScalar(pulse);
      this.emergentVisualState.mesh.rotation.y += delta * 0.7;
    }
  },

  runSemanticAction(actionId) {
    const mapping = { 'bed-rest': this.sleepAnchor, 'trained-command': new THREE.Vector3(2.1, 0, 1.7) };
    const point = mapping[actionId] || new THREE.Vector3(0, 0, 1.6);
    return this.moveTo(point.x, point.z, false);
  },

  setContextualFollow(enabled = false) {
    this.contextualFollow = Boolean(enabled);
    this.contextualFocus = enabled && this.currentPet ? this.currentPet.stage.position.clone() : null;
  },

  showDecorationPreview(record = null, valid = true) {
    this.clearDecorationPreview();
    const item = record && FURNITURE[record.item];
    if (!item) return false;
    const [width, depth] = item.size;
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(width, 0.55, depth),
      new THREE.MeshBasicMaterial({ color: valid ? 0x57c98b : 0xe76f67, transparent: true, opacity: 0.25, wireframe: true, depthTest: false })
    );
    mesh.position.set(record.x, 0.31, record.z);
    mesh.rotation.y = record.rotation || 0;
    mesh.renderOrder = 40;
    this.scene.add(mesh);
    this.decorationPreview = mesh;
    return true;
  },

  clearDecorationPreview() {
    if (!this.decorationPreview) return;
    this.decorationPreview.removeFromParent();
    this.disposeObject(this.decorationPreview);
    this.decorationPreview = null;
  }
};
