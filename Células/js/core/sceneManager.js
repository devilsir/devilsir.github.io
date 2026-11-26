import * as T from 'three';
import { audio } from './audio.js';
import { deviceProfile } from './deviceProfile.js?v=23';

const MIN_LOADING_MS = 550;

export function afterPaint() {
  return new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
}

export async function keepLoaderVisible(startedAt) {
  const remaining = MIN_LOADING_MS - (performance.now() - startedAt);
  if (remaining > 0) await new Promise(resolve => setTimeout(resolve, remaining));
}

function release(root) {
  const geometries = new Set();
  const materials = new Set();
  const textures = new Set();
  root.traverse(object => {
    if (object.geometry && !object.geometry.userData?.shared) geometries.add(object.geometry);
    if (object.isInstancedMesh) object.dispose();
    if (object.isLight) object.shadow?.dispose();
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
    this.loading = null;
    this.labelsVisible = true;
    this.labelListeners = new Set();
    this.engine.camera.layers.enable(1);

    this.veil = document.createElement('div');
    this.veil.className = 'stage-veil';
    this.veil.hidden = true;
    this.veil.setAttribute('role', 'status');
    this.veil.setAttribute('aria-atomic', 'true');
    this.veil.innerHTML =
      '<div class="loader-card">' +
      '<div class="loader-orb" aria-hidden="true"><i></i><i></i></div>' +
      '<p class="loader-kicker">CARREGANDO MÓDULO</p>' +
      '<h2 class="loader-title">Preparando cena 3D...</h2>' +
      '<p class="loader-sub">Compilando modelos, materiais e iluminação</p>' +
      '<div class="loader-bar" aria-hidden="true"><i></i></div>' +
      '</div>';
    this.veilKicker = this.veil.querySelector('.loader-kicker');
    this.veilTitle = this.veil.querySelector('.loader-title');
    this.veilSub = this.veil.querySelector('.loader-sub');
    this.workspace.after(this.veil);
    this.viewportVisible = true;
    if (typeof IntersectionObserver !== 'undefined') {
      this.visibilityObserver = new IntersectionObserver(entries => {
        const entry = entries[0];
        this.viewportVisible = Boolean(!entry || entry.isIntersecting);
        if (this.viewportVisible) this.time = performance.now();
      }, { threshold: 0.01 });
      this.visibilityObserver.observe(this.viewport);
    }

    this.frame = this.frame.bind(this);
    this.frameId = requestAnimationFrame(this.frame);
    engine.renderer.domElement.addEventListener('webglcontextlost', event => {
      event.preventDefault();
      this.error.hidden = false;
      this.error.textContent = 'O motor gráfico 3D foi interrompido. Aguardando a recuperação do navegador.';
    });
    engine.renderer.domElement.addEventListener('webglcontextrestored', () => { this.error.hidden = true; });
  }

  startLoading(title, subtitle, kicker, show = true) {
    const loading = { startedAt: performance.now(), show };
    this.loading = loading;
    this.veilKicker.textContent = kicker;
    this.veilTitle.textContent = title;
    this.veilSub.textContent = subtitle;
    this.veil.hidden = !show;
    this.workspace.setAttribute('aria-busy', 'true');
    this.workspace.inert = true;
    return loading;
  }

  async finishLoading(loading) {
    if (this.loading !== loading) return;
    if (loading.show) await keepLoaderVisible(loading.startedAt);
    if (this.loading !== loading) return;
    this.loading = null;
    this.veil.hidden = true;
    this.workspace.removeAttribute('aria-busy');
    this.workspace.inert = false;
  }

  async runWithLoader(title, subtitle, task) {
    const loading = this.startLoading(title, subtitle, 'ATUALIZANDO CENA');
    await afterPaint();
    if (this.loading !== loading) return;

    try {
      await task();
      if (this.loading !== loading) return;
      this.engine.frame(0.016);
      this.active.handle?.update?.(0.016);
      this.engine.render(this.active.scene);
      this.error.hidden = true;
    } catch (error) {
      if (this.loading !== loading) return;
      this.error.hidden = false;
      this.error.textContent = 'Não foi possível atualizar a cena. Selecione outro modelo ou módulo.';
      console.error(error);
    } finally {
      await this.finishLoading(loading);
    }
  }

  async mount(loadFactory, onMounted, { name, hint, booting }) {
    const loading = this.startLoading(name, hint, 'CARREGANDO MÓDULO', !booting);
    await afterPaint();
    if (this.loading !== loading) return;

    try {
      this.unmount();
      const factory = await loadFactory();
      if (this.loading !== loading) return;

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
      key.shadow.mapSize.set(deviceProfile.shadowSize, deviceProfile.shadowSize);
      key.shadow.camera.near = 1.5;
      key.shadow.camera.far = 30;
      key.shadow.camera.left = -7.5;
      key.shadow.camera.right = 7.5;
      key.shadow.camera.top = 6.5;
      key.shadow.camera.bottom = -6.5;
      key.shadow.bias = -0.0005;
      key.shadow.normalBias = 0.028;
      key.shadow.radius = deviceProfile.isMobile ? 2.0 : 3.2;
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
        const entry = { item, target, offset, enabled: true, lastX: NaN, lastY: NaN, lastHidden: null };
        labels.add(entry);
        entry.remove = () => { labels.delete(entry); item.remove(); };
        return entry;
      };
      this.active.handle = factory({
        scene, lights, engine: this.engine, audio, label,
        signal: abort.signal, toolbar: this.toolbar, guide: this.guide, overlay: this.overlay,
        viewport: this.viewport, tooltip: this.tooltip, help: this.help, state: this.state, navigate: this.navigate,
        runWithLoader: (title, subText, fn) => this.runWithLoader(title, subText, fn),
        labelsVisible: () => this.labelsVisible,
        setLabelsVisible: show => this.setLabelsVisible(show),
        onLabelsChange: fn => {
          this.labelListeners.add(fn);
          abort.signal.addEventListener('abort', () => this.labelListeners.delete(fn), { once: true });
        }
      });
      // Automatic Mobile Hardware Budget Guard: keeps all shadows & lights intact while preventing
      // 6-face PointLight cubemap shadows and desktop 2048px shadow maps from saturating mobile GPUs!
      if (deviceProfile.isMobile) {
        scene.traverse(obj => {
          if (obj.isPointLight && !deviceProfile.allowPointShadows && obj.castShadow) {
            obj.castShadow = false;
          } else if (obj.isDirectionalLight && obj.castShadow && obj.shadow) {
            if (obj.shadow.mapSize.x > deviceProfile.shadowSize) {
              obj.shadow.mapSize.set(deviceProfile.shadowSize, deviceProfile.shadowSize);
              if (obj.shadow.map) { obj.shadow.map.dispose(); obj.shadow.map = null; }
            }
            obj.shadow.radius = Math.min(obj.shadow.radius || 2, 2.0);
          }
        });
        this.engine._shadowFrame = 0; // Guarantee crisp shadow map on first mounted frame!
      }
      // Warm up first GPU render & shader compilation WHILE the loading screen is visibly covering the viewport!
      this.engine.frame(0.016);
      this.active.handle?.update?.(0.016);
      this.engine.render(scene);
      this.error.hidden = true;
      onMounted(true);
    } catch (error) {
      if (this.loading !== loading) return;
      this.unmount();
      this.error.hidden = false;
      this.error.textContent = 'Não foi possível iniciar esta cena. Tente abrir o módulo novamente.';
      console.error(error);
      onMounted(false);
    } finally {
      await this.finishLoading(loading);
    }
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
    if (this.loading || !this.active?.handle || document.hidden || !this.viewportVisible) return;
    const { scene, labels, handle } = this.active;
    this.engine.frame(dt);
    handle.update?.(dt);
    this.engine.render(scene);
    if (!labels.size || !this.labelsVisible) return;
    // Use ResizeObserver-cached dimensions (zero DOM layout read per frame!) + dirty-delta DOM writes
    const width = this.engine.viewportWidth;
    const height = this.engine.viewportHeight;
    const snap = deviceProfile.isMobile ? 0.75 : 0.35;
    for (const entry of labels) {
      const { item, target, offset, enabled } = entry;
      if (!enabled || !target.visible || target.parent?.visible === false) {
        if (entry.lastHidden !== true) {
          item.hidden = true;
          entry.lastHidden = true;
        }
        continue;
      }
      labelPosition.setFromMatrixPosition(target.matrixWorld).add(offset).project(this.engine.camera);
      const hidden = labelPosition.z > 1 || labelPosition.z < -1 || Math.abs(labelPosition.x) > .97 || Math.abs(labelPosition.y) > .93;
      if (entry.lastHidden !== hidden) {
        item.hidden = hidden;
        entry.lastHidden = hidden;
      }
      if (!hidden) {
        const px = (labelPosition.x + 1) * width * 0.5;
        const py = (1 - labelPosition.y) * height * 0.5;
        if (Math.abs(px - entry.lastX) >= snap || Math.abs(py - entry.lastY) >= snap || Number.isNaN(entry.lastX)) {
          entry.lastX = px;
          entry.lastY = py;
          item.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0) translate(-50%, -100%)`;
        }
      }
    }
  }
}

const labelPosition = new T.Vector3();
export { release };
