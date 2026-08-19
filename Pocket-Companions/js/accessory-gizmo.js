import * as THREE from '../vendor/three.module.js';

const AXES = {
  X: new THREE.Vector3(1, 0, 0),
  Y: new THREE.Vector3(0, 1, 0),
  Z: new THREE.Vector3(0, 0, 1)
};

const COLORS = { X: 0xef5350, Y: 0x66bb6a, Z: 0x42a5f5, XYZ: 0xffffff };

function axisVector(axis) {
  return (AXES[axis] || AXES.X).clone();
}

function basicMaterial(color, opacity = 1, pick = false) {
  const material = new THREE.MeshBasicMaterial({
    color,
    transparent: opacity < 1 || pick,
    opacity: pick ? 0 : opacity,
    depthTest: false,
    depthWrite: false,
    toneMapped: false
  });
  if (pick) material.colorWrite = false;
  return material;
}

function orientAlongAxis(object, axis) {
  if (axis === 'X') object.rotation.z = -Math.PI / 2;
  else if (axis === 'Z') object.rotation.x = Math.PI / 2;
}

function placeAlongAxis(object, axis, distance) {
  if (axis === 'X') object.position.x = distance;
  else if (axis === 'Y') object.position.y = distance;
  else object.position.z = distance;
}

function closestAxisParameter(ray, origin, axis) {
  const w = origin.clone().sub(ray.origin);
  const uv = axis.dot(ray.direction);
  const denominator = 1 - uv * uv;
  if (Math.abs(denominator) < 1e-5) return 0;
  return (uv * ray.direction.dot(w) - axis.dot(w)) / denominator;
}

export class AccessoryTransformGizmo {
  constructor({ scene, camera, domElement, onChange, onDraggingChange }) {
    this.scene = scene;
    this.camera = camera;
    this.domElement = domElement;
    this.onChange = onChange;
    this.onDraggingChange = onDraggingChange;
    this.target = null;
    this.enabled = false;
    this.mode = 'translate';
    this.uniformScale = true;
    this.dragging = false;
    this.activeAxis = null;
    this.hoveredAxis = null;
    this.pointer = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    this.root = new THREE.Group();
    this.root.name = 'accessory-transform-gizmo';
    this.root.visible = false;
    this.root.renderOrder = 10000;
    this.visibleGroups = {};
    this.pickerGroups = {};
    this.visibleHandles = [];
    this.drag = null;
    this.tempWorldPosition = new THREE.Vector3();
    this.tempQuaternion = new THREE.Quaternion();
    this.tempScale = new THREE.Vector3();
    this.scene.add(this.root);
    this.build();
    this.connect();
  }

  build() {
    this.buildTranslate();
    this.buildRotate();
    this.buildScale();
    this.setMode(this.mode);
  }

  createModeGroup(mode) {
    const visible = new THREE.Group();
    const pickers = new THREE.Group();
    visible.name = `gizmo-${mode}`;
    pickers.name = `gizmo-${mode}-pickers`;
    this.visibleGroups[mode] = visible;
    this.pickerGroups[mode] = pickers;
    this.root.add(visible, pickers);
    return { visible, pickers };
  }

  tagVisible(object, axis) {
    object.userData.gizmoAxis = axis;
    object.traverse((child) => {
      if (!child.isMesh) return;
      child.userData.gizmoAxis = axis;
      child.renderOrder = 10001;
      child.material.userData.baseColor = child.material.color.clone();
      child.material.userData.baseOpacity = child.material.opacity;
      this.visibleHandles.push(child);
    });
  }

  makePicker(geometry, axis) {
    const picker = new THREE.Mesh(geometry, basicMaterial(COLORS[axis] || 0xffffff, 0, true));
    picker.userData.gizmoAxis = axis;
    picker.renderOrder = 10002;
    return picker;
  }

  buildTranslate() {
    const { visible, pickers } = this.createModeGroup('translate');
    ['X', 'Y', 'Z'].forEach((axis) => {
      const material = basicMaterial(COLORS[axis]);
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.58, 10), material);
      orientAlongAxis(shaft, axis);
      placeAlongAxis(shaft, axis, 0.29);
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.17, 12), material.clone());
      orientAlongAxis(tip, axis);
      placeAlongAxis(tip, axis, 0.68);
      const handle = new THREE.Group();
      handle.add(shaft, tip);
      this.tagVisible(handle, axis);
      visible.add(handle);

      const picker = this.makePicker(new THREE.CylinderGeometry(0.085, 0.085, 0.82, 8), axis);
      orientAlongAxis(picker, axis);
      placeAlongAxis(picker, axis, 0.4);
      pickers.add(picker);
    });

    const center = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 10), basicMaterial(COLORS.XYZ, 0.92));
    this.tagVisible(center, 'XYZ');
    visible.add(center);
    pickers.add(this.makePicker(new THREE.SphereGeometry(0.14, 10, 8), 'XYZ'));
  }

  buildRotate() {
    const { visible, pickers } = this.createModeGroup('rotate');
    ['X', 'Y', 'Z'].forEach((axis) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.57, 0.017, 8, 72), basicMaterial(COLORS[axis], 0.95));
      if (axis === 'X') ring.rotation.y = Math.PI / 2;
      else if (axis === 'Y') ring.rotation.x = Math.PI / 2;
      this.tagVisible(ring, axis);
      visible.add(ring);

      const picker = this.makePicker(new THREE.TorusGeometry(0.57, 0.085, 8, 48), axis);
      if (axis === 'X') picker.rotation.y = Math.PI / 2;
      else if (axis === 'Y') picker.rotation.x = Math.PI / 2;
      pickers.add(picker);
    });
  }

  buildScale() {
    const { visible, pickers } = this.createModeGroup('scale');
    ['X', 'Y', 'Z'].forEach((axis) => {
      const material = basicMaterial(COLORS[axis]);
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.55, 8), material);
      orientAlongAxis(shaft, axis);
      placeAlongAxis(shaft, axis, 0.275);
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.11, 0.11), material.clone());
      placeAlongAxis(box, axis, 0.62);
      const handle = new THREE.Group();
      handle.add(shaft, box);
      this.tagVisible(handle, axis);
      visible.add(handle);

      const picker = this.makePicker(new THREE.CylinderGeometry(0.085, 0.085, 0.75, 8), axis);
      orientAlongAxis(picker, axis);
      placeAlongAxis(picker, axis, 0.36);
      pickers.add(picker);
    });

    const center = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.13, 0.13), basicMaterial(COLORS.XYZ, 0.92));
    this.tagVisible(center, 'XYZ');
    visible.add(center);
    pickers.add(this.makePicker(new THREE.BoxGeometry(0.23, 0.23, 0.23), 'XYZ'));
  }

  connect() {
    this.domElement.addEventListener('pointerdown', this.handlePointerDown, { capture: true });
    this.domElement.addEventListener('pointermove', this.handlePointerMove, { capture: true });
    this.domElement.addEventListener('pointerup', this.handlePointerUp, { capture: true });
    this.domElement.addEventListener('pointercancel', this.handlePointerUp, { capture: true });
  }

  disconnect() {
    this.domElement.removeEventListener('pointerdown', this.handlePointerDown, { capture: true });
    this.domElement.removeEventListener('pointermove', this.handlePointerMove, { capture: true });
    this.domElement.removeEventListener('pointerup', this.handlePointerUp, { capture: true });
    this.domElement.removeEventListener('pointercancel', this.handlePointerUp, { capture: true });
  }

  attach(target) {
    this.target = target || null;
    this.root.visible = Boolean(this.enabled && this.target);
    if (!this.target && this.domElement.style) this.domElement.style.cursor = '';
    this.update();
  }

  detach() {
    this.cancelDrag();
    this.target = null;
    this.root.visible = false;
    if (this.domElement.style) this.domElement.style.cursor = '';
  }

  setEnabled(enabled) {
    this.enabled = Boolean(enabled);
    if (!this.enabled) {
      this.cancelDrag();
      if (this.domElement.style) this.domElement.style.cursor = '';
    }
    this.root.visible = Boolean(this.enabled && this.target);
  }

  setMode(mode) {
    if (!['translate', 'rotate', 'scale'].includes(mode)) return;
    this.mode = mode;
    Object.entries(this.visibleGroups).forEach(([id, group]) => { group.visible = id === mode; });
    Object.entries(this.pickerGroups).forEach(([id, group]) => { group.visible = id === mode; });
    this.setHoveredAxis(null);
  }

  setUniformScale(enabled) {
    this.uniformScale = Boolean(enabled);
  }

  pointerFromEvent(event) {
    const rect = this.domElement.getBoundingClientRect();
    this.pointer.set(
      ((event.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1,
      -((event.clientY - rect.top) / Math.max(1, rect.height)) * 2 + 1
    );
    this.raycaster.setFromCamera(this.pointer, this.camera);
  }

  pickAxis(event) {
    this.pointerFromEvent(event);
    const group = this.pickerGroups[this.mode];
    if (!group?.visible) return null;
    const hits = this.raycaster.intersectObjects(group.children, true);
    const centerHit = hits.find((hit) => hit.object?.userData?.gizmoAxis === 'XYZ');
    const hit = centerHit || hits[0];
    return hit?.object?.userData?.gizmoAxis || null;
  }

  setHoveredAxis(axis) {
    if (this.hoveredAxis === axis) return;
    this.hoveredAxis = axis;
    if (this.domElement.style) this.domElement.style.cursor = axis ? (this.dragging ? 'grabbing' : 'grab') : '';
    this.visibleHandles.forEach((mesh) => {
      const baseColor = mesh.material.userData.baseColor;
      const baseOpacity = mesh.material.userData.baseOpacity;
      if (baseColor) mesh.material.color.copy(baseColor);
      if (Number.isFinite(baseOpacity)) mesh.material.opacity = baseOpacity;
      if (axis && mesh.userData.gizmoAxis === axis) {
        mesh.material.color.setHex(0xffeb3b);
        mesh.material.opacity = 1;
      }
    });
  }

  handlePointerDown = (event) => {
    if (!this.enabled || !this.target || event.button !== 0) return;
    const axis = this.pickAxis(event);
    if (!axis) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    this.domElement.setPointerCapture?.(event.pointerId);
    this.update();
    this.activeAxis = axis;
    this.dragging = true;
    this.setHoveredAxis(axis);
    if (this.domElement.style) this.domElement.style.cursor = 'grabbing';
    this.onDraggingChange?.(true);

    const origin = this.root.position.clone();
    const rootQuaternion = this.root.quaternion.clone();
    const axisLocal = axisVector(axis === 'XYZ' ? 'X' : axis);
    const axisWorld = axisLocal.clone().applyQuaternion(rootQuaternion).normalize();
    const parentQuaternion = new THREE.Quaternion();
    const parentScale = new THREE.Vector3(1, 1, 1);
    this.target.parent?.getWorldQuaternion(parentQuaternion);
    this.target.parent?.getWorldScale(parentScale);

    this.drag = {
      pointerId: event.pointerId,
      axis,
      mode: this.mode,
      origin,
      rootQuaternion,
      rootScale: this.root.scale.x || 1,
      axisLocal,
      axisWorld,
      parentQuaternion,
      parentScale,
      startPosition: this.target.position.clone(),
      startQuaternion: this.target.quaternion.clone(),
      startScale: this.target.scale.clone(),
      startClientY: event.clientY,
      startParameter: 0,
      startPoint: null,
      startVector: null,
      plane: null
    };

    if (this.mode === 'translate' && axis === 'XYZ') {
      const cameraDirection = this.camera.getWorldDirection(new THREE.Vector3()).normalize();
      this.drag.plane = new THREE.Plane().setFromNormalAndCoplanarPoint(cameraDirection, origin);
      this.drag.startPoint = this.raycaster.ray.intersectPlane(this.drag.plane, new THREE.Vector3());
    } else if (this.mode === 'rotate') {
      this.drag.plane = new THREE.Plane().setFromNormalAndCoplanarPoint(axisWorld, origin);
      const point = this.raycaster.ray.intersectPlane(this.drag.plane, new THREE.Vector3());
      this.drag.startVector = point ? point.sub(origin).normalize() : null;
    } else {
      this.drag.startParameter = closestAxisParameter(this.raycaster.ray, origin, axisWorld);
    }
  };

  handlePointerMove = (event) => {
    if (!this.enabled || !this.target) return;
    if (!this.dragging) {
      this.setHoveredAxis(this.pickAxis(event));
      return;
    }
    if (this.drag?.pointerId !== event.pointerId) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    this.pointerFromEvent(event);
    const drag = this.drag;

    if (drag.mode === 'translate') {
      let worldDelta;
      if (drag.axis === 'XYZ') {
        const point = this.raycaster.ray.intersectPlane(drag.plane, new THREE.Vector3());
        if (!point || !drag.startPoint) return;
        worldDelta = point.sub(drag.startPoint);
      } else {
        const parameter = closestAxisParameter(this.raycaster.ray, drag.origin, drag.axisWorld);
        worldDelta = drag.axisWorld.clone().multiplyScalar(parameter - drag.startParameter);
      }
      const localDelta = worldDelta
        .applyQuaternion(drag.parentQuaternion.clone().invert())
        .divide(drag.parentScale);
      this.target.position.copy(drag.startPosition).add(localDelta);
    } else if (drag.mode === 'rotate') {
      const point = this.raycaster.ray.intersectPlane(drag.plane, new THREE.Vector3());
      if (!point || !drag.startVector) return;
      const currentVector = point.sub(drag.origin).normalize();
      const cross = drag.startVector.clone().cross(currentVector);
      const angle = Math.atan2(drag.axisWorld.dot(cross), drag.startVector.dot(currentVector));
      const rotation = new THREE.Quaternion().setFromAxisAngle(drag.axisLocal, angle);
      this.target.quaternion.copy(drag.startQuaternion).multiply(rotation);
    } else if (drag.mode === 'scale') {
      let factor;
      if (drag.axis === 'XYZ') {
        factor = Math.exp((drag.startClientY - event.clientY) * 0.012);
      } else {
        const parameter = closestAxisParameter(this.raycaster.ray, drag.origin, drag.axisWorld);
        factor = Math.max(0.02, 1 + (parameter - drag.startParameter) / Math.max(0.001, drag.rootScale * 0.72));
      }
      if (drag.axis === 'XYZ' || this.uniformScale) {
        this.target.scale.copy(drag.startScale).multiplyScalar(factor);
      } else {
        this.target.scale.copy(drag.startScale);
        const key = drag.axis.toLowerCase();
        this.target.scale[key] = Math.max(0.001, drag.startScale[key] * factor);
      }
    }

    this.target.updateMatrixWorld(true);
    this.update();
    this.onChange?.({ phase: 'change', mode: drag.mode, axis: drag.axis });
  };

  handlePointerUp = (event) => {
    if (!this.dragging || this.drag?.pointerId !== event.pointerId) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    this.domElement.releasePointerCapture?.(event.pointerId);
    const detail = { phase: 'end', mode: this.drag.mode, axis: this.drag.axis };
    this.dragging = false;
    this.activeAxis = null;
    this.drag = null;
    this.setHoveredAxis(null);
    this.onDraggingChange?.(false);
    this.onChange?.(detail);
  };

  cancelDrag() {
    if (!this.dragging) return;
    this.dragging = false;
    this.activeAxis = null;
    this.drag = null;
    this.setHoveredAxis(null);
    this.onDraggingChange?.(false);
  }

  update() {
    if (!this.enabled || !this.target) {
      this.root.visible = false;
      return;
    }
    this.root.visible = true;
    this.target.updateWorldMatrix(true, false);
    this.target.getWorldPosition(this.tempWorldPosition);
    this.root.position.copy(this.tempWorldPosition);

    if (this.mode === 'translate') {
      if (this.target.parent) this.target.parent.getWorldQuaternion(this.tempQuaternion);
      else this.tempQuaternion.identity();
    } else {
      this.target.getWorldQuaternion(this.tempQuaternion);
    }
    this.root.quaternion.copy(this.tempQuaternion);

    const distance = Math.max(0.1, this.camera.position.distanceTo(this.tempWorldPosition));
    const viewportHeight = Math.max(1, this.domElement.clientHeight || 720);
    const worldPerPixel = 2 * distance * Math.tan(THREE.MathUtils.degToRad(this.camera.fov * 0.5)) / viewportHeight;
    const scale = worldPerPixel * 118;
    this.root.scale.setScalar(scale);
    this.root.updateMatrixWorld(true);
  }

  dispose() {
    this.disconnect();
    this.root.traverse((child) => {
      if (!child.isMesh) return;
      child.geometry?.dispose?.();
      child.material?.dispose?.();
    });
    this.root.removeFromParent();
  }
}
