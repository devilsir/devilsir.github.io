import * as T from 'three';

export const v = (x = 0, y = 0, z = 0) => new T.Vector3(x, y, z);

export function random(seed) {
  let value = seed >>> 0;
  return () => {
    value = (Math.imul(1664525, value) + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

// Global cached procedural Canvas2D texture maps (shared across scenes, never disposed on unmount)
const textureCache = new Map();

function makeSharedTexture(key, size, drawFn, repeatX = 1, repeatY = 1) {
  if (textureCache.has(key)) return textureCache.get(key);
  const canvas = Object.assign(document.createElement('canvas'), { width: size, height: size });
  const ctx = canvas.getContext('2d');
  drawFn(ctx, size);
  const tex = new T.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = T.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.needsUpdate = true;
  tex.userData = { shared: true, key };
  textureCache.set(key, tex);
  return tex;
}

function tileCircle(ctx, size, x, y, rx, ry, rot, fill) {
  ctx.fillStyle = fill;
  for (const ox of [-size, 0, size]) {
    if (x + ox + rx < 0 || x + ox - rx > size) continue;
    for (const oy of [-size, 0, size]) {
      if (y + oy + ry < 0 || y + oy - ry > size) continue;
      ctx.beginPath();
      ctx.ellipse(x + ox, y + oy, rx, ry, rot, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export const textures = {
  organicBump() {
    return makeSharedTexture('organicBump', 256, (ctx, s) => {
      const rng = random(4109);
      ctx.fillStyle = '#808080';
      ctx.fillRect(0, 0, s, s);
      // Soft macro cellular undulations
      for (let i = 0; i < 140; i++) {
        const g = (95 + rng() * 68) | 0;
        const r = 8 + rng() * 20;
        tileCircle(ctx, s, rng() * s, rng() * s, r, r * (0.65 + rng() * 0.55), rng() * Math.PI, `rgba(${g},${g},${g},0.16)`);
      }
      // Fine cytoplasmic granular relief
      for (let i = 0; i < 1100; i++) {
        const g = (62 + rng() * 140) | 0;
        const r = 1.2 + rng() * 4.2;
        tileCircle(ctx, s, rng() * s, rng() * s, r, r * (0.55 + rng() * 0.65), rng() * Math.PI, `rgba(${g},${g},${g},0.22)`);
      }
    }, 2, 2);
  },

  organicRoughness() {
    return makeSharedTexture('organicRoughness', 256, (ctx, s) => {
      const rng = random(5821);
      ctx.fillStyle = '#a8a8a8';
      ctx.fillRect(0, 0, s, s);
      for (let i = 0; i < 240; i++) {
        const g = (115 + rng() * 90) | 0;
        const r = 5 + rng() * 18;
        tileCircle(ctx, s, rng() * s, rng() * s, r, r * (0.6 + rng() * 0.6), rng() * Math.PI, `rgba(${g},${g},${g},0.18)`);
      }
    }, 2, 2);
  },

  membraneBump() {
    return makeSharedTexture('membraneBump', 256, (ctx, s) => {
      const rng = random(7307);
      ctx.fillStyle = '#828282';
      ctx.fillRect(0, 0, s, s);
      // Organic wavy lipid striations
      ctx.lineCap = 'round';
      for (let row = 0; row < 48; row++) {
        const baseY = (row / 48) * s;
        const g = (102 + rng() * 64) | 0;
        ctx.strokeStyle = `rgba(${g},${g},${g},0.24)`;
        ctx.lineWidth = 2 + rng() * 3.5;
        ctx.beginPath();
        const phase = rng() * Math.PI * 2;
        const amp = 2.5 + rng() * 4.5;
        for (let x = 0; x <= s; x += 8) {
          const y = baseY + Math.sin((x / s) * Math.PI * 4 + phase) * amp;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      for (let i = 0; i < 420; i++) {
        const g = (80 + rng() * 110) | 0;
        const r = 1.5 + rng() * 3.6;
        tileCircle(ctx, s, rng() * s, rng() * s, r * 1.4, r * 0.7, rng() * 0.5, `rgba(${g},${g},${g},0.16)`);
      }
    }, 2, 2);
  },

  brushedBump() {
    return makeSharedTexture('brushedBump', 256, (ctx, s) => {
      const rng = random(9157);
      ctx.fillStyle = '#808080';
      ctx.fillRect(0, 0, s, s);
      for (let i = 0; i < 650; i++) {
        const y = rng() * s;
        const g = (92 + rng() * 82) | 0;
        ctx.fillStyle = `rgba(${g},${g},${g},0.22)`;
        ctx.fillRect(0, y, s, 0.7 + rng() * 1.4);
      }
    }, 2, 2);
  },

  brushedRoughness() {
    return makeSharedTexture('brushedRoughness', 256, (ctx, s) => {
      const rng = random(9161);
      ctx.fillStyle = '#888888';
      ctx.fillRect(0, 0, s, s);
      for (let i = 0; i < 420; i++) {
        const y = rng() * s;
        const g = (95 + rng() * 85) | 0;
        ctx.fillStyle = `rgba(${g},${g},${g},0.26)`;
        ctx.fillRect(0, y, s, 1 + rng() * 1.6);
      }
    }, 2, 2);
  },

  enamelBump() {
    return makeSharedTexture('enamelBump', 256, (ctx, s) => {
      const rng = random(3121);
      ctx.fillStyle = '#808080';
      ctx.fillRect(0, 0, s, s);
      for (let i = 0; i < 900; i++) {
        const g = (114 + rng() * 32) | 0;
        const r = 1.2 + rng() * 3.0;
        tileCircle(ctx, s, rng() * s, rng() * s, r, r, 0, `rgba(${g},${g},${g},0.18)`);
      }
    }, 3, 3);
  },

  frostedBump() {
    return makeSharedTexture('frostedBump', 256, (ctx, s) => {
      const rng = random(6427);
      ctx.fillStyle = '#888888';
      ctx.fillRect(0, 0, s, s);
      for (let i = 0; i < 2200; i++) {
        const g = (84 + rng() * 116) | 0;
        const r = 0.8 + rng() * 2.1;
        ctx.fillStyle = `rgba(${g},${g},${g},0.3)`;
        ctx.fillRect(rng() * s, rng() * s, r, r);
      }
    }, 2, 2);
  }
};

// Backwards-compatible helper returning cached organic bump map
export function grain(seed = 17, scale = 256) {
  if (seed === 177 || seed === 51) return textures.brushedBump();
  if (seed === 71 || seed === 23) return textures.membraneBump();
  return textures.organicBump();
}

// PBR material builders
export const material = (color, options = {}) => new T.MeshStandardMaterial({
  color, roughness: .52, metalness: .04, envMapIntensity: .9, ...options
});

export const physical = (color, options = {}) => new T.MeshPhysicalMaterial({
  color, roughness: .38, metalness: .02, envMapIntensity: 1.0, ...options
});

export const glow = (color, intensity = .32, options = {}) => new T.MeshStandardMaterial({
  color, emissive: color, emissiveIntensity: intensity, roughness: .32, metalness: .05, envMapIntensity: .9, ...options
});

export function membraneMaterial(color, options = {}) {
  const sheenCol = new T.Color(color).lerp(new T.Color('#e4fbff'), 0.48);
  return new T.MeshPhysicalMaterial({
    color,
    roughness: 0.11,
    metalness: 0.01,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
    ior: 1.38,
    reflectivity: 0.9,
    sheen: 0.88,
    sheenRoughness: 0.24,
    sheenColor: sheenCol,
    iridescence: 0.32,
    iridescenceIOR: 1.35,
    transparent: true,
    opacity: 0.3,
    depthWrite: false,
    side: T.DoubleSide,
    bumpMap: textures.membraneBump(),
    bumpScale: 0.032,
    envMapIntensity: 1.45,
    ...options
  });
}

// Lush refractive wet bio-fluid / gelatinous protoplasm material
export function gelMaterial(color, options = {}) {
  const sheenCol = new T.Color(color).lerp(new T.Color('#f0feff'), 0.55);
  return new T.MeshPhysicalMaterial({
    color,
    roughness: 0.06,
    metalness: 0.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    ior: 1.36,
    reflectivity: 0.95,
    sheen: 0.94,
    sheenRoughness: 0.18,
    sheenColor: sheenCol,
    iridescence: 0.42,
    iridescenceIOR: 1.34,
    transparent: true,
    opacity: 0.44,
    depthWrite: false,
    side: T.DoubleSide,
    bumpMap: textures.membraneBump(),
    bumpScale: 0.024,
    envMapIntensity: 1.65,
    ...options
  });
}

// Wet cryo-EM glossy macromolecule / transmembrane protein surface
export function proteinMaterial(color, options = {}) {
  const sheenCol = new T.Color(color).lerp(new T.Color('#ffffff'), 0.42);
  return new T.MeshPhysicalMaterial({
    color,
    roughness: 0.24,
    metalness: 0.02,
    clearcoat: 0.82,
    clearcoatRoughness: 0.16,
    sheen: 0.62,
    sheenRoughness: 0.32,
    sheenColor: sheenCol,
    iridescence: 0.16,
    iridescenceIOR: 1.36,
    bumpMap: textures.organicBump(),
    bumpScale: 0.028,
    roughnessMap: textures.organicRoughness(),
    envMapIntensity: 1.25,
    ...options
  });
}

export function organelleMaterial(color, options = {}) {
  const sheenCol = new T.Color(color).lerp(new T.Color('#ffffff'), 0.32);
  return new T.MeshPhysicalMaterial({
    color,
    roughness: 0.36,
    metalness: 0.02,
    clearcoat: 0.44,
    clearcoatRoughness: 0.26,
    sheen: 0.32,
    sheenRoughness: 0.48,
    sheenColor: sheenCol,
    bumpMap: textures.organicBump(),
    bumpScale: 0.038,
    roughnessMap: textures.organicRoughness(),
    envMapIntensity: 0.95,
    ...options
  });
}

export function glassMaterial(color = '#c4eaf2', options = {}) {
  return new T.MeshPhysicalMaterial({
    color,
    roughness: 0.06,
    metalness: 0.04,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    reflectivity: 0.96,
    ior: 1.52,
    transparent: true,
    opacity: 0.3,
    depthWrite: false,
    envMapIntensity: 1.55,
    ...options
  });
}

export function frostedGlassMaterial(color = '#d5e4e8', options = {}) {
  return new T.MeshPhysicalMaterial({
    color,
    roughness: 0.48,
    metalness: 0.04,
    clearcoat: 0.3,
    clearcoatRoughness: 0.45,
    bumpMap: textures.frostedBump(),
    bumpScale: 0.025,
    transparent: true,
    opacity: 0.86,
    envMapIntensity: 1.0,
    ...options
  });
}

export function metalMaterial(color = '#b2bec8', options = {}) {
  return new T.MeshStandardMaterial({
    color,
    metalness: 0.84,
    roughness: 0.28,
    bumpMap: textures.brushedBump(),
    bumpScale: 0.016,
    roughnessMap: textures.brushedRoughness(),
    envMapIntensity: 1.25,
    ...options
  });
}

export function enamelMaterial(color = '#dde2e5', options = {}) {
  return new T.MeshPhysicalMaterial({
    color,
    roughness: 0.34,
    metalness: 0.06,
    clearcoat: 0.38,
    clearcoatRoughness: 0.32,
    bumpMap: textures.enamelBump(),
    bumpScale: 0.01,
    envMapIntensity: 1.0,
    ...options
  });
}

export function anodizedMaterial(color = '#1b222c', options = {}) {
  return new T.MeshStandardMaterial({
    color,
    metalness: 0.56,
    roughness: 0.35,
    bumpMap: textures.brushedBump(),
    bumpScale: 0.012,
    envMapIntensity: 1.1,
    ...options
  });
}

// Organic geometry helpers
export function organicDisplace(geo, amp = 0.045, freq = 2.6, seed = 1) {
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const wave =
      Math.sin(x * freq + seed * 1.7) * Math.cos(y * freq * 1.13 - seed) * 0.55 +
      Math.sin(z * freq * 1.41 + y * freq * 0.8 + seed * 2.3) * 0.45;
    const f = 1 + wave * amp;
    pos.setXYZ(i, x * f, y * f, z * f);
  }
  geo.computeVertexNormals();
  return geo;
}

// Merge multiple geometries (position + normal + uv) into one clean non-indexed BufferGeometry
export function mergeGeos(list) {
  const clean = list.map(g => (g.index ? g.toNonIndexed() : g));
  let total = 0;
  for (const g of clean) total += g.attributes.position.count;
  const pos = new Float32Array(total * 3);
  const norm = new Float32Array(total * 3);
  const uv = new Float32Array(total * 2);
  let off3 = 0, off2 = 0;
  for (let i = 0; i < clean.length; i++) {
    const g = clean[i];
    if (!g.attributes.normal) g.computeVertexNormals();
    const n = g.attributes.position.count;
    pos.set(g.attributes.position.array, off3);
    norm.set(g.attributes.normal.array, off3);
    if (g.attributes.uv) uv.set(g.attributes.uv.array, off2);
    off3 += n * 3;
    off2 += n * 2;
    if (g !== list[i]) g.dispose();
  }
  const out = new T.BufferGeometry();
  out.setAttribute('position', new T.BufferAttribute(pos, 3));
  out.setAttribute('normal', new T.BufferAttribute(norm, 3));
  out.setAttribute('uv', new T.BufferAttribute(uv, 2));
  for (const g of list) g.dispose();
  return out;
}

export function tintGeometry(geo, primaryHex, secondaryHex, freq = 2.4, seed = 0) {
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const cA = new T.Color(primaryHex);
  const cB = new T.Color(secondaryHex);
  const tmp = new T.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const n = 0.5 + 0.5 * (
      Math.sin(x * freq + seed) * Math.cos(z * freq * 1.17 - seed * 0.7) * 0.6 +
      Math.sin(y * freq * 1.35 + x * 0.7 + seed * 1.9) * 0.4
    );
    tmp.copy(cA).lerp(cB, Math.max(0, Math.min(1, n)));
    colors[i * 3] = tmp.r;
    colors[i * 3 + 1] = tmp.g;
    colors[i * 3 + 2] = tmp.b;
  }
  geo.setAttribute('color', new T.BufferAttribute(colors, 3));
  return geo;
}

// Scene node primitives
export const mesh = (parent, geometry, mat, x = 0, y = 0, z = 0) => {
  const item = new T.Mesh(geometry, mat);
  item.position.set(x, y, z);
  const opaque = !(mat && (mat.transparent || mat.isMeshBasicMaterial));
  item.castShadow = opaque;
  item.receiveShadow = !(mat && mat.isMeshBasicMaterial);
  parent.add(item);
  return item;
};
export const group = (parent, x = 0, y = 0, z = 0) => {
  const item = new T.Group();
  item.position.set(x, y, z);
  parent.add(item);
  return item;
};
export const box = (p, m, w, h, d, x = 0, y = 0, z = 0) => mesh(p, new T.BoxGeometry(w, h, d), m, x, y, z);
export const sphere = (p, m, rx, ry = rx, rz = rx, x = 0, y = 0, z = 0, segments = 24) => {
  const item = mesh(p, new T.SphereGeometry(1, segments, Math.ceil(segments / 2)), m, x, y, z);
  item.scale.set(rx, ry, rz);
  return item;
};
export const cylinder = (p, m, top, bottom, height, x = 0, y = 0, z = 0, segments = 24) =>
  mesh(p, new T.CylinderGeometry(top, bottom, height, segments), m, x, y, z);
export const capsule = (p, m, radius, length, x = 0, y = 0, z = 0, capSeg = 8, radSeg = 18) =>
  mesh(p, new T.CapsuleGeometry(radius, length, capSeg, radSeg), m, x, y, z);
export const lathe = (p, m, profilePts, segments = 24, x = 0, y = 0, z = 0) => {
  const pts = profilePts.map(pt => (pt instanceof T.Vector2 ? pt : new T.Vector2(pt[0], pt[1])));
  const geo = new T.LatheGeometry(pts, segments);
  geo.computeVertexNormals();
  return mesh(p, geo, m, x, y, z);
};
export const torus = (p, m, r, tubeRadius, x = 0, y = 0, z = 0, arc = Math.PI * 2) =>
  mesh(p, new T.TorusGeometry(r, tubeRadius, 12, 48, arc), m, x, y, z);
export const curve = points => new T.CatmullRomCurve3(points);
export const tube = (p, m, points, radius, closed = false, resolution = 36, radial = 9) =>
  mesh(p, new T.TubeGeometry(new T.CatmullRomCurve3(points, closed), resolution, radius, radial, closed), m);

export function rod(p, m, a, b, radius, segments = 10) {
  const direction = b.clone().sub(a);
  const len = Math.max(0.0001, direction.length());
  const item = cylinder(p, m, radius, radius, len, 0, 0, 0, segments);
  item.position.copy(a).lerp(b, .5);
  item.quaternion.setFromUnitVectors(v(0, 1, 0), direction.divideScalar(len));
  return item;
}

export function instances(p, geo, mat, count, dynamic = false) {
  const item = new T.InstancedMesh(geo, mat, count);
  if (dynamic) {
    item.instanceMatrix.setUsage(T.DynamicDrawUsage);
    item.frustumCulled = false;
  }
  const opaque = !(mat && (mat.transparent || mat.isMeshBasicMaterial));
  item.castShadow = opaque && count <= 220;
  item.receiveShadow = !(mat && mat.isMeshBasicMaterial);
  p.add(item);
  return item;
}

export function instanceUpdater(item) {
  const dummy = new T.Object3D();
  return (index, x, y, z, sx = 1, sy = sx, sz = sx, angle = 0) => {
    dummy.position.set(x, y, z);
    dummy.scale.set(sx, sy, sz);
    dummy.rotation.set(0, 0, angle);
    dummy.updateMatrix();
    item.setMatrixAt(index, dummy.matrix);
  };
}

// Crisp high-DPI badge/tag sprite (auto-sized width, scene-owned, disposed automatically by release())
export function labelSprite(text, { color = '#eef5f8', bg = 'rgba(11, 17, 25, 0.9)', border = 'rgba(92, 200, 218, 0.5)', scale = 0.42, font = '700 30px system-ui, -apple-system, sans-serif', depthTest = true } = {}) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.font = font;
  const textW = Math.ceil(ctx.measureText(text).width);
  const w = Math.max(180, textW + 46);
  const h = 76;
  canvas.width = w;
  canvas.height = h;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = bg;
  ctx.strokeStyle = border;
  ctx.lineWidth = 3;
  const r = 18;
  ctx.beginPath();
  ctx.roundRect(5, 8, w - 10, h - 16, r);
  ctx.fill();
  ctx.stroke();
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(text, w * 0.5, h * 0.51);
  const tex = new T.CanvasTexture(canvas);
  tex.colorSpace = T.SRGBColorSpace;
  const mat = new T.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, depthTest });
  const sprite = new T.Sprite(mat);
  sprite.scale.set(scale * (w / 86), scale * (h / 86), 1);
  sprite.layers.set(1);
  return sprite;
}

// Smooth emissive highlight interpolation utility for 3D hover/focus
const tmpHighlightColor = new T.Color();
export function blendEmissive(object, amount, tintColor = null, dt = 0.016) {
  const factor = 1 - Math.exp(-dt * 11);
  object.traverse(child => {
    const mat = child.material;
    if (!mat || !mat.emissive) return;
    if (mat.userData.baseEmissive === undefined) {
      mat.userData.baseEmissive = mat.emissive.clone();
      mat.userData.baseEmissiveIntensity = mat.emissiveIntensity ?? 0;
    }
    const targetIntensity = mat.userData.baseEmissiveIntensity + amount;
    mat.emissiveIntensity += (targetIntensity - mat.emissiveIntensity) * factor;
    if (amount > 0.01) {
      tmpHighlightColor.copy(tintColor || mat.color);
      mat.emissive.lerp(tmpHighlightColor, factor);
    } else {
      mat.emissive.lerp(mat.userData.baseEmissive, factor);
    }
  });
}

// Scientific dark phenolic resin laboratory bench
export function platform(scene, textured = true) {
  const benchMat = new T.MeshPhysicalMaterial({
    color: '#141c24',
    roughness: 0.44,
    metalness: 0.14,
    clearcoat: 0.24,
    clearcoatRoughness: 0.42,
    ...(textured ? { bumpMap: textures.enamelBump(), bumpScale: 0.012 } : {}),
    envMapIntensity: 0.85
  });
  box(scene, benchMat, 21, .32, 10.6, 0, -.18, 0);
  // Subtle recessed metallic edge trim rail along front
  box(scene, metalMaterial('#5e7282', { roughness: 0.34 }), 21.02, .048, .055, 0, -.03, 5.31);
  box(scene, anodizedMaterial('#0d1218'), 21.06, .26, .04, 0, -.20, 5.31);
  // Subtle scientific ruler/grid lines etched delicately into bench
  const grid = new T.GridHelper(20, 40, '#273a48', '#1a2733');
  grid.position.y = -.016;
  grid.scale.z = .51;
  if (Array.isArray(grid.material)) {
    for (const m of grid.material) { m.transparent = true; m.opacity = 0.35; }
  } else {
    grid.material.transparent = true;
    grid.material.opacity = 0.35;
  }
  scene.add(grid);
}
