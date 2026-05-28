import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { interactWithAtom, isInteractive, subscribe } from './state.js';

export class SceneController {
  constructor(container) {
    this.container = container;
    this.width = container.clientWidth;
    this.height = container.clientHeight;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 1000);
    this.camera.position.set(10, 10, 15);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(this.width, this.height);
    this.renderer.shadowMap.enabled = true;
    this.container.appendChild(this.renderer.domElement);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.target.set(0, 0, 0);
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.group = new THREE.Group();
    this.planeGroup = new THREE.Group();
    this.hoveredMesh = null;
    this.snapshot = null;
    this.sceneSignature = '';
    this.appearance = {
      backgroundColor: '#ffedd5',
      lightColor: '#ffb03a'
    };
    this.sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    this.boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    this.scene.add(this.group);
    this.scene.add(this.planeGroup);
    this.setupScene();
    this.bindEvents();
    subscribe((snapshot) => {
      this.snapshot = snapshot;
      this.applyAppearance(snapshot);
      const signature = this.getSceneSignature(snapshot);
      if (signature !== this.sceneSignature) {
        this.sceneSignature = signature;
        this.rebuild();
      }
    });
    this.animate();
  }

  setupScene() {
    this.scene.background = new THREE.Color(this.appearance.backgroundColor);
    this.renderer.setClearColor(this.appearance.backgroundColor, 1);
    this.ambientLight = new THREE.AmbientLight(this.appearance.lightColor, 0.62);
    this.frontLight = new THREE.DirectionalLight(this.appearance.lightColor, 1.5);
    this.backLight = new THREE.DirectionalLight(this.appearance.lightColor, 0.5);
    this.frontLight.position.set(10, 10, 5);
    this.backLight.position.set(-10, -10, -5);
    this.frontLight.castShadow = true;
    this.scene.add(this.ambientLight, this.frontLight, this.backLight);
    const floorGeometry = new THREE.PlaneGeometry(100, 100);
    this.floorMaterial = new THREE.MeshStandardMaterial({ color: this.appearance.backgroundColor, roughness: 0.8 });
    this.floor = new THREE.Mesh(floorGeometry, this.floorMaterial);
    this.floor.position.set(0, -6, 0);
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.receiveShadow = true;
    this.scene.add(this.floor);
    const wallGeometry = new THREE.PlaneGeometry(100, 50);
    this.wallMaterial = new THREE.MeshStandardMaterial({ color: this.appearance.backgroundColor, roughness: 0.9 });
    this.wall = new THREE.Mesh(wallGeometry, this.wallMaterial);
    this.wall.position.set(0, 0, -20);
    this.wall.receiveShadow = true;
    this.scene.add(this.wall);
    this.grid = new THREE.GridHelper(100, 100, this.appearance.lightColor, this.appearance.backgroundColor);
    this.grid.position.y = -5.98;
    this.scene.add(this.grid);
    this.applyAppearance(this.appearance);
  }

  bindEvents() {
    this.renderer.domElement.addEventListener('pointermove', (event) => this.onPointerMove(event));
    this.renderer.domElement.addEventListener('click', (event) => this.onClick(event));
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.width = this.container.clientWidth || window.innerWidth;
    this.height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  getSceneSignature(snapshot) {
    const atomSignature = snapshot.atoms.map((atom) => `${atom.id}:${atom.type}`).join('|');
    return [snapshot.mode, snapshot.latticeType, snapshot.clipPlane, snapshot.atomScale, atomSignature].join('::');
  }

  getReadableLightColor(hexColor) {
    const color = new THREE.Color(hexColor);
    const hsl = {};
    color.getHSL(hsl);
    color.setHSL(hsl.h, Math.min(1, hsl.s * 0.84), Math.max(0.28, Math.min(0.72, hsl.l)));
    return color;
  }

  applyAppearance(snapshot) {
    const backgroundColor = snapshot.backgroundColor || this.appearance.backgroundColor;
    const lightColor = snapshot.lightColor || this.appearance.lightColor;
    this.appearance = { backgroundColor, lightColor };
    this.scene.background = new THREE.Color(backgroundColor);
    this.renderer.setClearColor(backgroundColor, 1);
    document.documentElement.style.setProperty('--bg', backgroundColor);
    document.documentElement.style.setProperty('--scene-light', lightColor);
    if (this.ambientLight) this.ambientLight.color.set(lightColor);
    if (this.frontLight) this.frontLight.color.set(lightColor);
    if (this.backLight) this.backLight.color.set(lightColor);
    if (this.floorMaterial) this.floorMaterial.color.set(backgroundColor);
    if (this.wallMaterial) this.wallMaterial.color.set(backgroundColor);
    if (this.grid) {
      this.scene.remove(this.grid);
      this.grid.geometry.dispose();
      this.grid.material.dispose();
      this.grid = new THREE.GridHelper(100, 100, lightColor, this.getReadableLightColor(backgroundColor));
      this.grid.position.y = -5.98;
      this.scene.add(this.grid);
    }
  }

  getAtomVisual(atom) {
    let visible = true;
    let color = '#3b82f6';
    let scale = 0.8;
    let opacity = 1;
    let transparent = false;
    let wireframe = false;
    let isBox = false;
    const mode = this.snapshot.mode;

    if (atom.type === 'substitutional') {
      color = '#ef4444';
      scale = 0.95;
    }

    if (atom.type === 'interstitial') {
      color = '#f59e0b';
      scale = 0.4;
    }

    if (['vacancy', 'frenkel_vacancy', 'schottky_cation', 'schottky_anion'].includes(atom.type)) {
      if (['vacancy', 'frenkel', 'schottky'].includes(mode)) {
        color = '#94a3b8';
        scale = 0.3;
        opacity = 0.2;
        transparent = true;
        wireframe = true;
        isBox = true;
      } else {
        visible = false;
      }
    }

    if (atom.type === 'interstitial_site') {
      if (mode === 'interstitial' || mode === 'frenkel') {
        color = '#fcd34d';
        scale = 0.2;
        opacity = 0.3;
        transparent = true;
        wireframe = true;
        isBox = true;
      } else {
        visible = false;
      }
    }

    if (atom.type === 'frenkel_interstitial') {
      color = '#10b981';
      scale = 0.5;
    }

    return { visible, color, scale, opacity, transparent, wireframe, isBox };
  }

  isClipped(atom) {
    const plane = this.snapshot.clipPlane;
    if (plane === 'x' && atom.position[0] > 0.1) return true;
    if (plane === 'y' && atom.position[1] > 0.1) return true;
    if (plane === 'z' && atom.position[2] > 0.1) return true;
    return false;
  }

  rebuild() {
    if (!this.snapshot) return;
    this.clearGroup(this.group);
    this.hoveredMesh = null;
    const interactiveMeshes = [];
    this.snapshot.atoms.forEach((atom) => {
      if (this.isClipped(atom)) return;
      const visual = this.getAtomVisual(atom);
      if (!visual.visible) return;
      const geometry = visual.isBox ? this.boxGeometry : this.sphereGeometry;
      const material = new THREE.MeshStandardMaterial({
        color: visual.color,
        opacity: visual.opacity,
        transparent: visual.transparent,
        wireframe: visual.wireframe,
        roughness: 0.2,
        metalness: 0.8,
        depthWrite: !visual.transparent
      });
      const mesh = new THREE.Mesh(geometry, material);
      const baseScale = visual.scale * this.snapshot.atomScale;
      mesh.position.set(atom.position[0], atom.position[1], atom.position[2]);
      mesh.scale.setScalar(baseScale);
      mesh.castShadow = true;
      mesh.userData = { atomId: atom.id, baseScale, interactive: isInteractive(atom, this.snapshot.mode), color: visual.color };
      this.group.add(mesh);
      if (mesh.userData.interactive) interactiveMeshes.push(mesh);
    });
    this.interactiveMeshes = interactiveMeshes;
    this.rebuildPlane();
  }

  rebuildPlane() {
    this.clearGroup(this.planeGroup);
    const plane = this.snapshot.clipPlane;
    if (plane === 'none') return;
    const geometry = new THREE.PlaneGeometry(20, 20);
    const materialByPlane = {
      x: new THREE.MeshStandardMaterial({ color: '#ef4444', transparent: true, opacity: 0.15, side: THREE.DoubleSide }),
      y: new THREE.MeshStandardMaterial({ color: '#22c55e', transparent: true, opacity: 0.15, side: THREE.DoubleSide }),
      z: new THREE.MeshStandardMaterial({ color: '#3b82f6', transparent: true, opacity: 0.15, side: THREE.DoubleSide })
    };
    const mesh = new THREE.Mesh(geometry, materialByPlane[plane]);
    if (plane === 'x') {
      mesh.position.set(0.1, 0, 0);
      mesh.rotation.y = Math.PI / 2;
    }
    if (plane === 'y') {
      mesh.position.set(0, 0.1, 0);
      mesh.rotation.x = Math.PI / 2;
    }
    if (plane === 'z') mesh.position.set(0, 0, 0.1);
    this.planeGroup.add(mesh);
  }

  clearGroup(group) {
    while (group.children.length) {
      const child = group.children[0];
      group.remove(child);
      if (child.material && typeof child.material.dispose === 'function') child.material.dispose();
    }
  }

  setPointer(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  getHit(event) {
    if (!this.interactiveMeshes || !this.interactiveMeshes.length) return null;
    this.setPointer(event);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects(this.interactiveMeshes, false);
    return hits.length ? hits[0].object : null;
  }

  onPointerMove(event) {
    const hit = this.getHit(event);
    if (this.hoveredMesh && this.hoveredMesh !== hit) {
      this.hoveredMesh.scale.setScalar(this.hoveredMesh.userData.baseScale);
      this.hoveredMesh.material.color.set(this.hoveredMesh.userData.color);
    }
    if (hit) {
      hit.scale.setScalar(hit.userData.baseScale * 1.3);
      hit.material.color.set('#ffffff');
      this.container.style.cursor = 'pointer';
      this.hoveredMesh = hit;
    } else {
      this.container.style.cursor = 'grab';
      this.hoveredMesh = null;
    }
  }

  onClick(event) {
    const hit = this.getHit(event);
    if (hit && hit.userData.atomId) interactWithAtom(hit.userData.atomId);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
