import * as T from 'three';
import { OrbitControls } from 'three/addons/OrbitControls.js';
import { deviceProfile } from './deviceProfile.js?v=23';

function createStudioEnvMap(renderer) {
  const pmrem = new T.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  const envScene = new T.Scene();
  envScene.background = new T.Color('#090d14');

  const disposables = [];
  const panel = (color, intensity, w, h, pos, rot) => {
    const geo = new T.PlaneGeometry(w, h);
    const col = new T.Color(color).multiplyScalar(intensity);
    const mat = new T.MeshBasicMaterial({ color: col, side: T.DoubleSide });
    const mesh = new T.Mesh(geo, mat);
    mesh.position.set(...pos);
    mesh.rotation.set(...rot);
    envScene.add(mesh);
    disposables.push(geo, mat);
  };

  // Overhead primary clinical softbox + crisp wet specular highlight strips
  panel('#f2faff', 2.8, 16, 10, [0, 9.5, 1.5], [Math.PI / 2, 0, 0]);
  panel('#c2f6ff', 3.4, 4.5, 9, [2.5, 8.8, 5.5], [Math.PI * 0.35, 0, 0]);
  // Front-right key fill strip
  panel('#ffffff', 2.2, 7, 6, [8.5, 4.5, 6.5], [0, -Math.PI * .32, 0]);
  // Left cool-cyan microscopy strip
  panel('#6fd8ea', 1.85, 8, 5.5, [-9.5, 3.2, 2.5], [0, Math.PI * .42, 0]);
  // Rear-top rim strip for biological contour sheen
  panel('#8ce6f5', 2.6, 15, 3.4, [-1, 5.2, -9.8], [0.22, 0, 0]);
  // Low subtle warm studio bounce card
  panel('#e6d2bc', 0.65, 10, 4, [6.5, -4.5, -3], [0, -Math.PI * .65, 0]);
  // Subtle dark slate floor bounce
  panel('#172536', 0.85, 22, 22, [0, -9, 0], [-Math.PI / 2, 0, 0]);

  const rt = pmrem.fromScene(envScene, 0.035);
  rt.texture.userData = { ...(rt.texture.userData || {}), shared: true };

  for (const item of disposables) item.dispose();
  pmrem.dispose();
  return rt;
}

const DOF_VERT = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}`;

// Smooth 9-tap separable Gaussian blur (overlapping radii eliminate specular dot-grid artifacts)
const DOF_BLUR_FRAG = `
uniform sampler2D tDiffuse;
uniform vec2 uStep;
varying vec2 vUv;
void main() {
  vec4 acc = texture2D(tDiffuse, vUv) * 0.20416369;
  acc += texture2D(tDiffuse, vUv + uStep * 1.407333) * 0.304005;
  acc += texture2D(tDiffuse, vUv - uStep * 1.407333) * 0.304005;
  acc += texture2D(tDiffuse, vUv + uStep * 3.294215) * 0.093913;
  acc += texture2D(tDiffuse, vUv - uStep * 3.294215) * 0.093913;
  gl_FragColor = acc;
}`;

// Diagonal Kawase pre-filter turns 1px HDR specular highlights into smooth circular discs before separable blur!
const DOF_PRE_FRAG = `
uniform sampler2D tDiffuse;
uniform vec2 uStep;
varying vec2 vUv;
void main() {
  vec4 acc = texture2D(tDiffuse, vUv) * 0.24;
  acc += texture2D(tDiffuse, vUv + vec2( uStep.x,  uStep.y)) * 0.19;
  acc += texture2D(tDiffuse, vUv + vec2(-uStep.x,  uStep.y)) * 0.19;
  acc += texture2D(tDiffuse, vUv + vec2( uStep.x, -uStep.y)) * 0.19;
  acc += texture2D(tDiffuse, vUv + vec2(-uStep.x, -uStep.y)) * 0.19;
  gl_FragColor = acc;
}`;

// Composite blurred HDR background with exact ACESFilmic + sRGB + subtle confocal focus vignette
const DOF_BLIT_FRAG = `
uniform sampler2D tDiffuse;
uniform float uStrength;
varying vec2 vUv;
void main() {
  vec4 tex = texture2D(tDiffuse, vUv);
  float a = clamp(tex.a, 0.0, 1.0);
  if (a < 0.001) discard;
  vec3 col = tex.rgb / a;
  vec2 centered = (vUv - 0.5) * 2.0;
  float vig = 1.0 - smoothstep(0.45, 1.48, length(centered)) * 0.24 * uStrength;
  float dim = mix(1.0, 0.72, uStrength);
  gl_FragColor = vec4(col * dim * vig, a);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

export class Engine {
  constructor(stage) {
    this.stage = stage;
    this.profile = deviceProfile;
    this.renderer = new T.WebGLRenderer({
      antialias: deviceProfile.antialias,
      alpha: true,
      powerPreference: deviceProfile.powerPreference
    });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.outputColorSpace = T.SRGBColorSpace;
    this.renderer.toneMapping = T.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.18;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = deviceProfile.isMobile ? T.PCFShadowMap : T.PCFSoftShadowMap;
    this.renderer.shadowMap.autoUpdate = deviceProfile.shadowUpdateStride <= 1;
    this._shadowFrame = 0;
    this.maxPixelRatio = deviceProfile.maxDpr;
    this.pixelCap = this.maxPixelRatio;
    this.renderBudget = { elapsed: 0, frames: 0 };
    this.viewportWidth = Math.max(1, stage.clientWidth);
    this.viewportHeight = Math.max(1, stage.clientHeight);
    stage.append(this.renderer.domElement);

    this.envRT = createStudioEnvMap(this.renderer);
    this.envMap = this.envRT.texture;

    this.camera = new T.PerspectiveCamera(37, 1, .015, 160);
    this.camera.layers.enable(1);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = deviceProfile.isMobile ? .11 : .08;
    this.controls.minDistance = 0.32;
    this.controls.maxDistance = 42;
    this.controls.addEventListener('start', () => { this.destination = null; });

    this.shakeState = null;
    this.shakeOffset = new T.Vector3();

    // Lightweight GPU Depth-of-Field Selective Bokeh pipeline (hardware-scaled offscreen targets)
    const hasHalfFloat = deviceProfile.dofHalfFloat && this.renderer.capabilities.isWebGL2 &&
      (this.renderer.extensions.has('EXT_color_buffer_float') || this.renderer.extensions.has('EXT_color_buffer_half_float'));
    const rtOpts = {
      minFilter: T.LinearFilter,
      magFilter: T.LinearFilter,
      format: T.RGBAFormat,
      type: hasHalfFloat ? T.HalfFloatType : T.UnsignedByteType,
      depthBuffer: true,
      stencilBuffer: false
    };
    const blurOpts = { ...rtOpts, depthBuffer: false };
    this.dofBg = new T.WebGLRenderTarget(2, 2, rtOpts);
    this.dofH = new T.WebGLRenderTarget(2, 2, blurOpts);
    this.dofV = new T.WebGLRenderTarget(2, 2, blurOpts);
    this.dofCam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const quadGeo = new T.PlaneGeometry(2, 2);
    this.preMat = new T.ShaderMaterial({
      uniforms: { tDiffuse: { value: null }, uStep: { value: new T.Vector2() } },
      vertexShader: DOF_VERT,
      fragmentShader: DOF_PRE_FRAG,
      depthTest: false,
      depthWrite: false
    });
    this.blurMat = new T.ShaderMaterial({
      uniforms: { tDiffuse: { value: null }, uStep: { value: new T.Vector2() } },
      vertexShader: DOF_VERT,
      fragmentShader: DOF_BLUR_FRAG,
      depthTest: false,
      depthWrite: false
    });
    this.blitMat = new T.ShaderMaterial({
      uniforms: { tDiffuse: { value: null }, uStrength: { value: 0 } },
      vertexShader: DOF_VERT,
      fragmentShader: DOF_BLIT_FRAG,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      toneMapped: true
    });
    this.preScene = new T.Scene();
    this.preScene.add(new T.Mesh(quadGeo, this.preMat));
    this.blurScene = new T.Scene();
    this.blurScene.add(new T.Mesh(quadGeo, this.blurMat));
    this.blitScene = new T.Scene();
    this.blitScene.add(new T.Mesh(quadGeo, this.blitMat));
    this.dofTarget = 0;
    this.dofCurrent = 0;
    this.focusObjects = [];
    this.focusMeshes = [];
    this._moved = [];

    this.resize = new ResizeObserver(() => this.fit());
    this.resize.observe(stage);
    this.fit();
  }

  fit() {
    const width = Math.max(1, this.stage.clientWidth);
    const height = Math.max(1, this.stage.clientHeight);
    this.viewportWidth = width;
    this.viewportHeight = height;
    this.camera.aspect = width / height;
    this.camera.fov = this.camera.aspect < 1.12 ? 48 : 37;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(this.pixelCap);
    this.renderer.setSize(width, height, false);
    // Hardware-scaled offscreen blur targets (smaller & faster on mobile tile GPUs, identical smooth bokeh!)
    const bw = Math.max(2, Math.min(deviceProfile.dofMaxW, Math.floor(width * deviceProfile.dofScale)));
    const bh = Math.max(2, Math.min(deviceProfile.dofMaxH, Math.floor(height * deviceProfile.dofScale)));
    this.dofBg.setSize(bw, bh);
    this.dofH.setSize(bw, bh);
    this.dofV.setSize(bw, bh);
  }

  setFocusFilter(objects = null, strength = 0) {
    if (objects && objects.length && strength > 0.01) {
      this.dofTarget = Math.max(0, Math.min(1, strength));
      if (objects.length === this.focusObjects.length && objects.every((root, i) => root === this.focusObjects[i])) return;

      // Keep our own roots because callers can reuse their input array on the next frame.
      this.focusObjects = [...objects];
      const meshes = new Set();
      for (const root of this.focusObjects) {
        root?.traverse(object => {
          if (object.isMesh || object.isLine || object.isPoints) meshes.add(object);
        });
      }
      this.focusMeshes = [...meshes];
    } else {
      this.dofTarget = 0;
    }
  }

  clearFocusFilter(instant = false) {
    this.dofTarget = 0;
    if (instant) {
      this.dofCurrent = 0;
      this.focusObjects.length = 0;
      this.focusMeshes.length = 0;
    }
  }

  render(scene) {
    const r = this.renderer;
    const cam = this.camera;
    this._shadowFrame++;
    const shouldUpdateShadow = deviceProfile.shadowUpdateStride <= 1 ||
      (this._shadowFrame % deviceProfile.shadowUpdateStride === 1);

    if (this.dofCurrent <= 0.015 || !this.focusObjects.length) {
      if (r.shadowMap.enabled && deviceProfile.shadowUpdateStride > 1) {
        r.shadowMap.needsUpdate = shouldUpdateShadow;
      }
      r.render(scene, cam);
      return;
    }

    const labelsOn = cam.layers.isEnabled(1);
    const moved = this._moved;
    moved.length = 0;

    // Isolate focused foreground meshes onto Layer 2 (keeping sprites on Layer 1 intact!)
    for (const object of this.focusMeshes) {
      if (object.layers.mask === 1) {
        object.layers.set(2);
        moved.push(object);
      }
    }

    // Compute shadow map ONCE for the frame (throttled cleanly on mobile!) before splitting background & foreground
    const prevAutoShadow = r.shadowMap.autoUpdate;
    if (r.shadowMap.enabled) {
      r.shadowMap.autoUpdate = false;
      r.shadowMap.needsUpdate = shouldUpdateShadow;
    }

    // Pass 1: Render out-of-focus background (Layer 0 only, no labels, no focused foreground)
    cam.layers.set(0);
    r.setRenderTarget(this.dofBg);
    r.setClearColor(0x000000, 0);
    r.clear(true, true, true);
    r.render(scene, cam);

    if (r.shadowMap.enabled) r.shadowMap.needsUpdate = false;

    // Pass 1b: Diagonal Kawase disc pre-filter + separable Gaussian blur (1 wider pass on mobile, 2 on desktop!)
    const invW = 1 / Math.max(2, this.dofBg.width);
    const invH = 1 / Math.max(2, this.dofBg.height);
    const k0 = this.dofCurrent * (deviceProfile.dofPasses === 1 ? 1.35 : 1.15);
    const s1 = this.dofCurrent * (deviceProfile.dofPasses === 1 ? 1.85 : 1.15);
    const s2 = this.dofCurrent * 1.65;

    this.preMat.uniforms.tDiffuse.value = this.dofBg.texture;
    this.preMat.uniforms.uStep.value.set(invW * k0, invH * k0);
    r.setRenderTarget(this.dofV);
    r.render(this.preScene, this.dofCam);

    this.blurMat.uniforms.tDiffuse.value = this.dofV.texture;
    this.blurMat.uniforms.uStep.value.set(invW * s1, 0);
    r.setRenderTarget(this.dofH);
    r.render(this.blurScene, this.dofCam);

    this.blurMat.uniforms.tDiffuse.value = this.dofH.texture;
    this.blurMat.uniforms.uStep.value.set(0, invH * s1);
    r.setRenderTarget(this.dofV);
    r.render(this.blurScene, this.dofCam);

    if (deviceProfile.dofPasses >= 2) {
      this.blurMat.uniforms.tDiffuse.value = this.dofV.texture;
      this.blurMat.uniforms.uStep.value.set(invW * s2, 0);
      r.setRenderTarget(this.dofH);
      r.render(this.blurScene, this.dofCam);

      this.blurMat.uniforms.tDiffuse.value = this.dofH.texture;
      this.blurMat.uniforms.uStep.value.set(0, invH * s2);
      r.setRenderTarget(this.dofV);
      r.render(this.blurScene, this.dofCam);
    }

    // Pass 2: Composite blurred HDR background -> clear depth -> render crisp focused foreground + labels!
    r.setRenderTarget(null);
    const prevAutoClear = r.autoClear;
    r.autoClear = false;
    r.setClearColor(0x000000, 0);
    r.clear(true, true, true);

    this.blitMat.uniforms.tDiffuse.value = this.dofV.texture;
    this.blitMat.uniforms.uStrength.value = this.dofCurrent;
    r.render(this.blitScene, this.dofCam);

    r.clearDepth();
    cam.layers.set(2);
    if (labelsOn) cam.layers.enable(1);
    r.render(scene, cam);

    // Restore exact original layers & renderer state before next interaction/raycast
    r.autoClear = prevAutoClear;
    if (r.shadowMap.enabled) r.shadowMap.autoUpdate = prevAutoShadow;
    for (let i = 0; i < moved.length; i++) moved[i].layers.set(0);
    moved.length = 0;
    cam.layers.set(0);
    if (labelsOn) cam.layers.enable(1);
  }

  view(eye, target, instant = false, duration = null) {
    const toPos = new T.Vector3(...eye);
    const toTarget = new T.Vector3(...target);
    if (instant) {
      this.destination = null;
      this.camera.position.copy(toPos);
      this.controls.target.copy(toTarget);
      this.controls.update();
      return;
    }
    const dist = this.camera.position.distanceTo(toPos) + this.controls.target.distanceTo(toTarget);
    const autoDuration = duration ?? Math.min(0.82, Math.max(0.45, 0.4 + dist * 0.02));
    this.destination = {
      fromPos: this.camera.position.clone(),
      toPos,
      fromTarget: this.controls.target.clone(),
      toTarget,
      startTime: performance.now(),
      duration: autoDuration
    };
  }

  shake(intensity = 0.14, duration = 0.36) {
    this.shakeState = { intensity, duration, elapsed: 0 };
  }

  frame(dt) {
    // Remove previous frame's temporary camera tremor before updating controls/lerp
    if (this.shakeOffset.lengthSq() > 0) {
      this.camera.position.sub(this.shakeOffset);
      this.shakeOffset.set(0, 0, 0);
    }

    const budget = this.renderBudget;
    budget.elapsed += dt;
    budget.frames++;
    const windowSec = deviceProfile.isMobile ? 1.8 : 2.4;
    if (budget.elapsed > windowSec) {
      const fps = budget.frames / budget.elapsed;
      const max = deviceProfile.maxDpr;
      const min = Math.min(max, deviceProfile.minDpr);
      const next = fps < deviceProfile.fpsLow
        ? Math.max(min, this.pixelCap * 0.86)
        : fps > deviceProfile.fpsHigh
          ? Math.min(max, this.pixelCap * 1.05)
          : this.pixelCap;
      if (Math.abs(next - this.pixelCap) >= 0.03) {
        this.pixelCap = next;
        this.fit();
      }
      budget.elapsed = budget.frames = 0;
    }

    // Smoothly rack depth-of-field blur in/out like a real confocal objective lens
    const dofRate = 1 - Math.exp(-dt * 7.2);
    this.dofCurrent += (this.dofTarget - this.dofCurrent) * dofRate;
    if (this.dofTarget === 0 && this.dofCurrent < 0.015) {
      this.clearFocusFilter(true);
    }

    if (this.destination) {
      const d = this.destination;
      const elapsed = (performance.now() - d.startTime) * 0.001;
      const t = Math.min(1, Math.max(0, elapsed / d.duration));
      const eased = 1 - Math.pow(1 - t, 3); // cubic ease-out
      this.camera.position.lerpVectors(d.fromPos, d.toPos, eased);
      this.controls.target.lerpVectors(d.fromTarget, d.toTarget, eased);
      if (t >= 1) {
        this.camera.position.copy(d.toPos);
        this.controls.target.copy(d.toTarget);
        this.destination = null;
      }
    }

    this.controls.update();

    if (this.shakeState) {
      const s = this.shakeState;
      s.elapsed += dt;
      if (s.elapsed >= s.duration) {
        this.shakeState = null;
      } else {
        const decay = Math.pow(1 - s.elapsed / s.duration, 2);
        const amp = s.intensity * decay;
        const phase = s.elapsed * 78;
        this.shakeOffset.set(Math.sin(phase) * amp, Math.cos(phase * 1.37) * amp * 0.72, Math.sin(phase * 0.83) * amp * 0.35);
        this.camera.position.add(this.shakeOffset);
      }
    }
  }
}
