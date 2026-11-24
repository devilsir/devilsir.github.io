import * as T from 'three';
import { audio } from './audio.js';

function release(root) {
  const geometries = new Set();
  const materials = new Set();
  const textures = new Set();
  root.traverse(object => {
    if (object.geometry && !object.geometry.userData?.shared) geometries.add(object.geometry);
    if (object.isInstancedMesh) object.dispose();
    if (object.material) {
      for (const mat of [object.material].flat()) {
        if (mat && !mat.userData?.shared) materials.add(mat);
      }
    }
  });
  for (const mat of materials) {
    for (const value of Object.values(mat)) {
      if (value?.isTexture && !value.userData?.shared) textures.add(value);
    }
    for (const uniform of Object.values(mat.uniforms || {})) {
      if (uniform?.value?.isTexture && !uniform.value.userData?.shared) textures.add(uniform.value);
    }
    mat.dispose();
  }
  for (const texture of textures) texture.dispose();
  for (const geo of geometries) geo.dispose();
  root.clear();
}

export class SceneManager {
  constructor(engine, elements, state, navigate) {
    Object.assign(this, { engine, ...elements, state, navigate });
    this.time = performance.now();
    this.transitionTimer = null;
    this.labelsVisible = true;
    this.labelListeners = new Set();
    this.engine.camera.layers.enable(1);
    this.veil = document.createElement('div');
    this.veil.className = 'stage-veil';
    this.veil.setAttribute('aria-hidden', 'true');
    this.viewport.append(this.veil);

    this.frame = this.frame.bind(this);
    this.frameId = requestAnimationFrame(this.frame);
    engine.renderer.domElement.addEventListener('webglcontextlost', event => {
      event.preventDefault();
      this.error.hidden = false;
      this.error.textContent = 'O motor gráfico 3D foi interrompido. Aguardando a recuperação do navegador.';
    });
    engine.renderer.domElement.addEventListener('webglcontextrestored', () => { this.error.hidden = true; });
  }

  mount(factory, onMounted = null) {
    if (this.transitionTimer) {
      clearTimeout(this.transitionTimer);
      this.transitionTimer = null;
    }
    const performMount = () => {
      this.unmount();
      const scene = new T.Scene();
      scene.environment = this.engine.envMap;
      if ('environmentIntensity' in scene) scene.environmentIntensity = 0.85;
      scene.fog = new T.FogExp2('#0b1017', 0.0115);

      const abort = new AbortController();
      const labels = new Set();

      // 4-point scientific confocal studio lighting with soft shadows & subsurface rim
      const hemi = new T.HemisphereLight('#ddf2fc', '#15202d', 0.72);
      const key = new T.DirectionalLight('#f6fbff', 2.35);
      key.position.set(5.5, 9.2, 8.5);
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      key.shadow.camera.near = 1.5;
      key.shadow.camera.far = 30;
      key.shadow.camera.left = -7.5;
      key.shadow.camera.right = 7.5;
      key.shadow.camera.top = 6.5;
      key.shadow.camera.bottom = -6.5;
      key.shadow.bias = -0.0005;
      key.shadow.normalBias = 0.028;
      key.shadow.radius = 3.2;
      const fill = new T.DirectionalLight('#8ac4e3', 0.82);
      fill.position.set(-6.5, -1.5, 5.5);
      const rim = new T.DirectionalLight('#5be0f2', 1.95);
      rim.position.set(-4.8, 5.2, -8.5);
      const sub = new T.DirectionalLight('#34a6b8', 0.56);
      sub.position.set(0.8, -7.2, 3.6);
      scene.add(hemi, key, fill, rim, sub);
      for (const light of [hemi, key, fill, rim, sub]) light.layers.enable(2);
      const lights = { hemi, key, fill, rim, sub };

      this.active = { scene, abort, labels, lights, handle: null };
      const label = (text, target, offset = new T.Vector3(0, .3, 0)) => {
        const item = document.createElement('span');
        item.className = 'scene-label';
        item.textContent = text;
        this.projection.append(item);
        const entry = { item, target, offset, enabled: true };
        labels.add(entry);
        entry.remove = () => { labels.delete(entry); item.remove(); };
        return entry;
      };
      try {
        this.active.handle = factory({
          scene, lights, engine: this.engine, audio, label,
          signal: abort.signal, toolbar: this.toolbar, guide: this.guide, overlay: this.overlay,
          viewport: this.viewport, tooltip: this.tooltip, help: this.help, state: this.state, navigate: this.navigate,
          labelsVisible: () => this.labelsVisible,
          setLabelsVisible: show => this.setLabelsVisible(show),
          onLabelsChange: fn => {
            this.labelListeners.add(fn);
            abort.signal.addEventListener('abort', () => this.labelListeners.delete(fn), { once: true });
          }
        });
        this.error.hidden = true;
        onMounted?.(true);
      } catch (error) {
        this.unmount();
        this.error.hidden = false;
        this.error.textContent = 'Não foi possível iniciar esta cena. Selecione outro módulo ou recarregue a página.';
        console.error(error);
        onMounted?.(false);
      }
      requestAnimationFrame(() => {
        this.veil.classList.remove('active');
      });
    };

    // First load mounts immediately with a smooth reveal; module switches dissolve cleanly (~200ms)
    if (!this.active) {
      this.veil.classList.add('active');
      performMount();
      return;
    }
    this.veil.classList.add('active');
    this.transitionTimer = setTimeout(() => {
      this.transitionTimer = null;
      performMount();
    }, 105);
  }

  unmount() {
    if (this.active) {
      const { abort, scene, handle } = this.active;
      abort.abort();
      handle?.dispose?.();
      scene.environment = null;
      scene.fog = null;
      release(scene);
      this.engine.renderer.renderLists.dispose();
      this.active = null;
    }
    this.engine.controls.enabled = true;
    this.engine.destination = null;
    this.engine.shakeState = null;
    this.engine.clearFocusFilter(true);
    this.viewport.classList.remove('is-hovering', 'is-dragging');
    for (const element of [this.toolbar, this.guide, this.overlay, this.projection]) element.replaceChildren();
    this.tooltip.hidden = true;
    this.help.textContent = 'Arraste para orbitar · Role para aproximar';
  }

  setLabelsVisible(show) {
    this.labelsVisible = Boolean(show);
    this.projection.hidden = !this.labelsVisible;
    if (this.labelsVisible) this.engine.camera.layers.enable(1);
    else this.engine.camera.layers.disable(1);
    for (const fn of this.labelListeners) fn(this.labelsVisible);
  }

  frame(now) {
    this.frameId = requestAnimationFrame(this.frame);
    const dt = Math.min(.05, Math.max(.001, (now - this.time) / 1000));
    this.time = now;
    if (!this.active?.handle || document.hidden) return;
    const { scene, labels, handle } = this.active;
    this.engine.frame(dt);
    handle.update?.(dt);
    this.engine.render(scene);
    if (!labels.size || !this.labelsVisible) return;
    const width = this.viewport.clientWidth;
    const height = this.viewport.clientHeight;
    for (const { item, target, offset, enabled } of labels) {
      if (!enabled || !target.visible || target.parent?.visible === false) {
        item.hidden = true;
        continue;
      }
      target.getWorldPosition(labelPosition).add(offset).project(this.engine.camera);
      item.hidden = labelPosition.z > 1 || labelPosition.z < -1 || Math.abs(labelPosition.x) > .97 || Math.abs(labelPosition.y) > .93;
      if (!item.hidden) {
        item.style.transform = `translate3d(${((labelPosition.x + 1) * width / 2).toFixed(1)}px, ${((1 - labelPosition.y) * height / 2).toFixed(1)}px, 0) translate(-50%, -100%)`;
      }
    }
  }
}

const labelPosition = new T.Vector3();
export { release };
