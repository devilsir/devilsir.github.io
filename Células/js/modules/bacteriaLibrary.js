import * as T from 'three';
import {
  v, group, mesh, sphere, capsule, torus, tube,
  glow, labelSprite, gelMaterial, proteinMaterial,
  organicDisplace, tintGeometry
} from '../core/geometry.js';
import { createAnchor } from './cellMicroDetails.js?v=9';

const tau = Math.PI * 2;

export const BACTERIA_SUBTYPES = {
  complete: 'Bactéria completa (corte interno)',
  gallery: 'Galeria · 9 formatos ao microscópio',
  cocci: '1. Cocos (Esferas)',
  diplococci: '2. Diplococos (Pares)',
  streptococci: '3. Estreptococos (Cadeias)',
  staphylococci: '4. Estafilococos (Cachos)',
  bacilli: '5. Bacilos (Bastonetes)',
  streptobacilli: '6. Estreptobacilos (Fila)',
  vibrio: '7. Vibriões (Vírgula)',
  spirilla: '8. Espirilos (Espiral rígida)',
  spirochetes: '9. Espiroquetas (Saca-rolhas)'
};

export const BACTERIA_SUMMARY = {
  complete: 'Modelo procariótico flagelado e encapsulado, sem envelope nuclear, com membrana contendo hopanoides, mesossomo respiratório, nucleoide circular, plasmídeos e ribossomos 70S.',
  gallery: 'Galeria 3D dos 9 formatos e arranjos bacterianos clássicos vistos em microscopia: esféricos (cocos, diplococos, estreptococos, estafilococos), bastonetes (bacilos, estreptobacilos) e espiralados/curvos (vibriões, espirilos, espiroquetas). Clique em qualquer exemplar para inspecionar.',
  cocci: '1. Cocos (Esferas): bactérias de morfologia arredondada ou ligeiramente ovalada, com alta resistência à dessecação pela menor razão área/volume.',
  diplococci: '2. Diplococos (Pares): cocos que permanecem unidos em pares após a fissão binária em um único plano (ex.: Streptococcus pneumoniae, Neisseria gonorrhoeae).',
  streptococci: '3. Estreptococos (Cadeias): sucessivas divisões no mesmo plano mantêm as esferas enfileiradas em colar flexível (ex.: Streptococcus pyogenes).',
  staphylococci: '4. Estafilococos (Cachos): divisões em múltiplos planos aleatórios formam cachos tridimensionais irregulares semelhantes a uvas (ex.: Staphylococcus aureus).',
  bacilli: '5. Bacilos (Bastonetes): células cilíndricas alongadas com extremidades arredondadas, comuns no solo e na microbiota intestinal (ex.: Escherichia coli, Bacillus subtilis).',
  streptobacilli: '6. Estreptobacilos (Fila): bacilos que permanecem aderidos ponta a ponta após a divisão transversal, formando filamentos articulados (ex.: Streptobacillus moniliformis).',
  vibrio: '7. Vibriões (Vírgula): bastonetes encurvados em arco de vírgula dotados de flagelo polar rápido para natação em meios aquáticos (ex.: Vibrio cholerae).',
  spirilla: '8. Espirilos (Espiral rígida): bactérias helicoidais de corpo espesso e rígido impulsionadas por tufos de flagelos polares externos (ex.: Spirillum volutans).',
  spirochetes: '9. Espiroquetas (Saca-rolhas): hélices finas, longas e altamente flexíveis movidas por endoflagelos (filamento axial) internos no espaço periplasmático (ex.: Treponema pallidum).'
};

export const BACTERIA_LABEL_OFFSETS = {
  b_cocci: v(0, -1.46, 0.25),
  b_diplococci: v(0, -1.46, 0.25),
  b_streptococci: v(0, -1.46, 0.25),
  b_staphylococci: v(0, -1.46, 0.25),
  b_bacilli: v(0, -1.46, 0.25),
  b_streptobacilli: v(0, -1.46, 0.25),
  b_vibrio: v(0, -1.46, 0.25),
  b_spirilla: v(0, -1.46, 0.25),
  b_spirochetes: v(0, -1.46, 0.25)
};

export const BACTERIA_CAMERAS = {
  gallery: { eye: [-0.55, 0.15, 21.4], target: [-0.55, -0.15, 0] },
  cocci: { eye: [1.2, 1.3, 9.2], target: [0, -0.1, 0] },
  diplococci: { eye: [1.1, 1.2, 8.8], target: [0, -0.1, 0] },
  streptococci: { eye: [1.0, 1.3, 9.6], target: [0, -0.1, 0] },
  staphylococci: { eye: [1.3, 1.4, 9.4], target: [0, -0.1, 0] },
  bacilli: { eye: [1.2, 1.3, 9.4], target: [0, -0.1, 0] },
  streptobacilli: { eye: [1.1, 1.3, 9.8], target: [0, -0.1, 0] },
  vibrio: { eye: [1.2, 1.3, 9.4], target: [0, -0.1, 0] },
  spirilla: { eye: [1.2, 1.3, 10.0], target: [0, -0.1, 0] },
  spirochetes: { eye: [1.1, 1.3, 10.0], target: [0, -0.1, 0] }
};

function addMicroTag(host, text, x, y, z, border = '#68dce8', color = '#eef7fa', sc = 0.22) {
  const sp = labelSprite(text, { scale: sc, border, color, font: '700 26px system-ui, sans-serif', depthTest: false });
  sp.position.set(x, y, z);
  sp.renderOrder = 10;
  host.add(sp);
  return sp;
}

// Reusable glossy confocal bacterial cell builders (violet-magenta & cyan-cobalt glowing bio-surfaces + wet gel halo!)
function makeCoccus(parent, r, x, y, z, seed = 1, hueA = '#b668ff', hueB = '#5924a8', haloCol = '#84e4ff') {
  const cell = group(parent, x, y, z);
  const geo = organicDisplace(new T.SphereGeometry(r, 22, 16), 0.045, 7.5, seed);
  tintGeometry(geo, hueA, hueB, 4.5, seed);
  mesh(cell, geo, proteinMaterial('#ffffff', {
    vertexColors: true, emissive: hueB, emissiveIntensity: 0.28, clearcoat: 0.96, iridescence: 0.34
  }));
  // Translucent wet gelatinous capsule sheen
  mesh(cell, new T.SphereGeometry(r * 1.13, 16, 12), gelMaterial(haloCol, { opacity: 0.22, iridescence: 0.44 }));
  return cell;
}

function makeBacillus(parent, r, len, x, y, z, seed = 1, hueA = '#58c8ff', hueB = '#1d56a8', haloCol = '#7af5ff') {
  const cell = group(parent, x, y, z);
  const geo = organicDisplace(new T.CapsuleGeometry(r, len, 10, 18), 0.036, 7.2, seed);
  tintGeometry(geo, hueA, hueB, 4.0, seed);
  mesh(cell, geo, proteinMaterial('#ffffff', {
    vertexColors: true, emissive: hueB, emissiveIntensity: 0.28, clearcoat: 0.96, iridescence: 0.32
  }));
  mesh(cell, new T.CapsuleGeometry(r * 1.16, len * 1.02, 8, 14), gelMaterial(haloCol, { opacity: 0.22, iridescence: 0.44 }));
  return cell;
}

function makeWaveFlagellum(parent, anchor, dirSign, length, amp, freq, phase0, col = '#9ef5ff') {
  const mat = glow(col, 0.72, { transparent: true, opacity: 0.85 });
  const segs = 18;
  const pts = Array.from({ length: segs }, (_, i) => {
    const f = i / (segs - 1);
    return v(anchor.x + dirSign * f * length, anchor.y + Math.sin(f * freq + phase0) * amp * f, anchor.z + Math.cos(f * freq + phase0) * amp * 0.55 * f);
  });
  const meshTube = tube(parent, mat, pts, 0.018, false, 24, 6);
  return { mesh: meshTube, anchor, dirSign, length, amp, freq, phase0 };
}

// ============================================================================
// 1. COCOS (Esferas isoladas)
// ============================================================================
function buildCocci(parent, solo = false) {
  const g = group(parent);
  const specs = [
    [-0.48, 0.08, 0.14, 0.36],
    [0.08, -0.34, 0.28, 0.38],
    [0.52, 0.14, -0.1, 0.34],
    [-0.14, 0.52, -0.18, 0.31],
    [0.36, 0.54, 0.18, 0.24]
  ];
  const cells = specs.map(([x, y, z, r], i) => makeCoccus(g, r, x, y, z, i + 1));
  if (solo) {
    addMicroTag(g, 'Células esféricas isoladas', 0.85, 0.92, 0.4, '#c485ff', '#f2e0ff', 0.22);
    addMicroTag(g, 'Cápsula gelatinosa hidratada', -0.85, -0.88, 0.4, '#84e4ff', '#dcf8ff', 0.22);
  }
  return t => {
    g.rotation.y = t * 0.28;
    cells.forEach((c, i) => { c.position.y += Math.sin(t * 1.8 + i * 1.4) * 0.0012; });
  };
}

// ============================================================================
// 2. DIPLOCOCOS (Pares unidos por septo central)
// ============================================================================
function buildDiplococci(parent, solo = false) {
  const g = group(parent);
  const pair = group(g);
  pair.rotation.z = 0.22;
  const cL = makeCoccus(pair, 0.46, -0.37, 0, 0, 2, '#c270ff', '#5e22ab');
  const cR = makeCoccus(pair, 0.46, 0.37, 0, 0, 5, '#b668ff', '#561ea3');
  cL.scale.set(0.92, 1.0, 0.98);
  cR.scale.set(0.92, 1.0, 0.98);
  // Glowing septal division collar & shared outer translucent capsule halo!
  const septum = torus(pair, glow('#9cf5ff', 0.78, { transparent: true, opacity: 0.75 }), 0.34, 0.028, 0, 0, 0);
  septum.rotation.y = Math.PI / 2;
  const sharedCapsule = mesh(pair, new T.CapsuleGeometry(0.56, 0.72, 12, 20), gelMaterial('#7ef0ff', { opacity: 0.18, iridescence: 0.45 }));
  sharedCapsule.rotation.z = Math.PI / 2;

  if (solo) {
    addMicroTag(g, 'Par de cocos unido após divisão', 0.78, 0.88, 0.4, '#c485ff', '#f2e0ff', 0.22);
    addMicroTag(g, 'Septo de divisão + cápsula comum', -0.78, -0.84, 0.4, '#7ef0ff', '#dcfcff', 0.22);
  }
  return t => { g.rotation.y = t * 0.32; pair.rotation.x = Math.sin(t * 0.9) * 0.14; };
}

// ============================================================================
// 3. ESTREPTOCOCOS (Cadeias em colar curvo)
// ============================================================================
function buildStreptococci(parent, solo = false) {
  const g = group(parent);
  const chainPts = [
    v(-0.88, -0.38, 0.12), v(-0.56, -0.26, 0.18), v(-0.24, -0.1, 0.08),
    v(0.06, 0.06, -0.06), v(0.36, 0.22, -0.08), v(0.64, 0.42, 0.05), v(0.86, 0.66, 0.16)
  ];
  const cells = chainPts.map((pt, i) => makeCoccus(g, 0.22, pt.x, pt.y, pt.z, i * 2 + 1, '#c475ff', '#5424a6'));
  // Translucent continuous mucoid chain envelope
  tube(g, gelMaterial('#7ae8ff', { opacity: 0.18, iridescence: 0.46 }), chainPts, 0.28, false, 36, 12);

  if (solo) {
    addMicroTag(g, 'Divisão sucessiva no mesmo plano', 0.82, 0.96, 0.4, '#c485ff', '#f2e0ff', 0.22);
    addMicroTag(g, 'Cadeia flexível ("colar de pérolas")', -0.82, -0.86, 0.4, '#7ae8ff', '#dcf8ff', 0.22);
  }
  return t => {
    g.rotation.y = Math.sin(t * 0.42) * 0.55;
    cells.forEach((c, i) => { c.position.y = chainPts[i].y + Math.sin(t * 2.1 + i * 0.7) * 0.032; });
  };
}

// ============================================================================
// 4. ESTAFILOCOCOS (Cachos tridimensionais irregulares tipo uva)
// ============================================================================
function buildStaphylococci(parent, solo = false) {
  const g = group(parent);
  const coords = [
    [0, 0, 0], [0.42, 0.1, 0.18], [-0.42, 0.12, 0.16], [0.06, 0.44, 0.14],
    [0.02, -0.42, 0.18], [0.36, -0.34, -0.16], [-0.36, -0.32, -0.14], [0.38, 0.44, -0.16],
    [-0.38, 0.42, -0.12], [0.0, 0.14, 0.46], [0.04, -0.12, -0.44], [0.64, -0.1, -0.02],
    [-0.64, -0.08, 0.04], [-0.14, 0.74, -0.02], [0.28, -0.68, 0.06], [-0.26, -0.66, 0.08]
  ];
  coords.forEach(([x, y, z], i) => {
    makeCoccus(g, 0.26, x * 0.82, y * 0.82, z * 0.82, i + 3, '#c970ff', '#5e1ea6', '#98e2ff');
  });
  // Soft gelatinous extracellular biofilm cloud binding the grape cluster
  mesh(g, organicDisplace(new T.SphereGeometry(0.86, 22, 16), 0.08, 4.2, 5), gelMaterial('#80d4ff', { opacity: 0.14 }));

  if (solo) {
    addMicroTag(g, 'Divisões em múltiplos planos (cacho)', 0.88, 0.94, 0.45, '#c970ff', '#f5e0ff', 0.22);
    addMicroTag(g, 'Matriz gelatinosa de biofilme', -0.88, -0.88, 0.45, '#80d4ff', '#dcf4ff', 0.22);
  }
  return t => { g.rotation.y = t * 0.34; g.rotation.x = Math.sin(t * 0.5) * 0.16; };
}

// ============================================================================
// 5. BACILOS (Bastonetes cilíndricos em azul-ciano microscópico)
// ============================================================================
function buildBacilli(parent, solo = false) {
  const g = group(parent);
  const rods = [
    { p: [0.06, 0.08, 0.22], r: [0.15, 0.2, -0.42], l: 0.72 },
    { p: [-0.52, 0.38, -0.14], r: [0.3, -0.2, 1.15], l: 0.58 },
    { p: [0.36, -0.52, 0.08], r: [-0.2, 0.3, 1.05], l: 0.64 },
    { p: [-0.48, -0.34, -0.18], r: [0.25, 0.4, 0.72], l: 0.56 },
    { p: [0.58, 0.34, -0.22], r: [-0.35, -0.2, -0.85], l: 0.52 }
  ];
  const objs = rods.map((s, i) => {
    const b = makeBacillus(g, 0.185, s.l, ...s.p, i + 7);
    b.rotation.set(...s.r);
    return b;
  });
  if (solo) {
    addMicroTag(g, 'Bastonetes cilíndricos isolados', 0.88, 0.92, 0.4, '#58c8ff', '#dbf2ff', 0.22);
    addMicroTag(g, 'Parede de peptidoglicano + cápsula', -0.88, -0.88, 0.4, '#7af5ff', '#dcffff', 0.22);
  }
  return t => {
    g.rotation.y = t * 0.3;
    objs.forEach((b, i) => { b.rotation.z = rods[i].r[2] + Math.sin(t * 1.4 + i) * 0.06; });
  };
}

// ============================================================================
// 6. ESTREPTOBACILOS (Fila articulada ponta a ponta)
// ============================================================================
function buildStreptobacilli(parent, solo = false) {
  const g = group(parent);
  const segs = [
    { p: [-0.74, -0.42, 0.12], rotZ: -1.16 },
    { p: [-0.24, -0.16, 0.04], rotZ: -1.04 },
    { p: [0.28, 0.12, -0.04], rotZ: -0.92 },
    { p: [0.74, 0.48, 0.08], rotZ: -0.74 }
  ];
  segs.forEach((s, i) => {
    const b = makeBacillus(g, 0.175, 0.36, ...s.p, i + 12, '#8b7dff', '#3c30a8', '#8ae6ff');
    b.rotation.z = s.rotZ;
  });
  // Delicate glowing polar septal rings linking the articulated filament
  for (let i = 0; i < segs.length - 1; i++) {
    const a = v(...segs[i].p), b = v(...segs[i + 1].p);
    const mid = a.clone().lerp(b, 0.5);
    const ring = torus(g, glow('#9cf2ff', 0.72), 0.145, 0.018, mid.x, mid.y, mid.z);
    ring.rotation.set(0.3, 0.5, -0.5);
  }
  if (solo) {
    addMicroTag(g, 'Bacilos unidos ponta a ponta', 0.85, 0.92, 0.4, '#9a8cff', '#ebe6ff', 0.22);
    addMicroTag(g, 'Septos transversais articulados', -0.85, -0.88, 0.4, '#9cf2ff', '#dcfaff', 0.22);
  }
  return t => { g.rotation.y = Math.sin(t * 0.45) * 0.52; g.rotation.z = Math.sin(t * 1.1) * 0.05; };
}

// ============================================================================
// 7. VIBRIÕES (Vírgula curvada + flagelo polar ondulante)
// ============================================================================
function buildVibrio(parent, solo = false) {
  const g = group(parent);
  const vibs = [];
  const makeComma = (ox, oy, oz, rotZ, sc, seed) => {
    const vg = group(g, ox, oy, oz);
    vg.rotation.z = rotZ;
    vg.scale.setScalar(sc);
    const arcPts = [v(-0.42, -0.08, 0), v(-0.18, 0.16, 0.04), v(0.16, 0.14, -0.03), v(0.42, -0.14, 0)];
    const bodyGeo = new T.TubeGeometry(new T.CatmullRomCurve3(arcPts), 24, 0.175, 14, false);
    organicDisplace(bodyGeo, 0.04, 8, seed);
    tintGeometry(bodyGeo, '#d470ff', '#5e22a6', 4.4, seed);
    const bMat = proteinMaterial('#ffffff', { vertexColors: true, emissive: '#541b99', emissiveIntensity: 0.28, clearcoat: 0.96, iridescence: 0.34 });
    mesh(vg, bodyGeo, bMat);
    // Smooth hemispherical rounded ends + wet gelatinous capsule
    mesh(vg, new T.SphereGeometry(0.176, 14, 10), bMat, arcPts[0].x, arcPts[0].y, arcPts[0].z);
    mesh(vg, new T.SphereGeometry(0.176, 14, 10), bMat, arcPts[3].x, arcPts[3].y, arcPts[3].z);
    tube(vg, gelMaterial('#7ef0ff', { opacity: 0.22, iridescence: 0.46 }), arcPts, 0.21, false, 22, 12);

    // Polar swimming flagellum whipping from the tail pole!
    const tail = group(vg, arcPts[0].x, arcPts[0].y, arcPts[0].z);
    makeWaveFlagellum(tail, v(0, 0, 0), -1, 0.72, 0.16, 8.5, seed);
    vibs.push({ vg, tail, baseRot: rotZ, phase: seed * 1.4 });
  };
  makeComma(0.24, 0.44, 0.14, -0.35, 0.88, 1);
  makeComma(-0.28, -0.12, 0.18, 0.78, 0.94, 3);
  makeComma(0.32, -0.46, -0.14, 0.55, 0.8, 5);

  if (solo) {
    addMicroTag(g, 'Corpo encurvado em "vírgula"', 0.88, 0.92, 0.4, '#d470ff', '#f7e0ff', 0.22);
    addMicroTag(g, 'Flagelo polar propulsor', -0.88, -0.88, 0.4, '#9ef5ff', '#defcff', 0.22);
  }
  return t => {
    g.rotation.y = Math.sin(t * 0.45) * 0.45;
    for (const vb of vibs) {
      vb.vg.rotation.z = vb.baseRot + Math.sin(t * 2.4 + vb.phase) * 0.08;
      vb.tail.rotation.x = t * 6.5 + vb.phase;
    }
  };
}

// ============================================================================
// 8. ESPIRILOS (Espiral rígida espessa + tufos de flagelos polares)
// ============================================================================
function buildSpirilla(parent, solo = false) {
  const g = group(parent);
  const spinGrp = group(g);
  spinGrp.rotation.z = 0.28;
  const pts = Array.from({ length: 56 }, (_, i) => {
    const f = i / 55;
    const x = -0.96 + f * 1.92;
    const a = f * tau * 2.35;
    return v(x, Math.sin(a) * 0.26, Math.cos(a) * 0.26);
  });
  const geo = new T.TubeGeometry(new T.CatmullRomCurve3(pts), 64, 0.145, 14, false);
  organicDisplace(geo, 0.036, 9, 4);
  tintGeometry(geo, '#8d74ff', '#3c26a3', 4.5, 2);
  const mat = proteinMaterial('#ffffff', { vertexColors: true, emissive: '#351f94', emissiveIntensity: 0.28, clearcoat: 0.96, iridescence: 0.36 });
  mesh(spinGrp, geo, mat);
  // Rounded poles + translucent rigid sheath
  mesh(spinGrp, new T.SphereGeometry(0.148, 12, 10), mat, pts[0].x, pts[0].y, pts[0].z);
  mesh(spinGrp, new T.SphereGeometry(0.148, 12, 10), mat, pts.at(-1).x, pts.at(-1).y, pts.at(-1).z);
  tube(spinGrp, gelMaterial('#7ef0ff', { opacity: 0.22, iridescence: 0.46 }), pts, 0.178, false, 52, 10);

  // Amphitrichous polar flagellar tufts at BOTH ends!
  const tuftL = group(spinGrp, pts[0].x, pts[0].y, pts[0].z);
  const tuftR = group(spinGrp, pts.at(-1).x, pts.at(-1).y, pts.at(-1).z);
  for (let k = -1; k <= 1; k++) {
    makeWaveFlagellum(tuftL, v(0, k * 0.04, 0), -1, 0.56, 0.12, 9, k * 1.4);
    makeWaveFlagellum(tuftR, v(0, k * 0.04, 0), 1, 0.56, 0.12, 9, k * 1.4 + 2);
  }

  if (solo) {
    addMicroTag(g, 'Hélice rígida e espessa', 0.85, 0.9, 0.4, '#9a84ff', '#ebe6ff', 0.22);
    addMicroTag(g, 'Tufos de flagelos polares', -0.92, -0.82, 0.4, '#9ef5ff', '#defcff', 0.22);
  }
  return t => {
    spinGrp.rotation.x = t * 2.1; // Authentic rigid corkscrew propulsion around its longitudinal axis!
    g.rotation.y = Math.sin(t * 0.4) * 0.45;
  };
}

// ============================================================================
// 9. ESPIROQUETAS (Saca-rolhas ultra-fino e flexível + filamento axial!)
// ============================================================================
function buildSpirochetes(parent, solo = false) {
  const g = group(parent);
  const makeCorkscrew = (ox, oy, oz, rotZ, sc, seed) => {
    const sg = group(g, ox, oy, oz);
    sg.rotation.z = rotZ;
    sg.scale.setScalar(sc);
    const pts = Array.from({ length: 84 }, (_, i) => {
      const f = i / 83;
      const x = -0.98 + f * 1.96;
      const a = f * tau * 5.2;
      const env = Math.sin(f * Math.PI) * 0.72 + 0.28;
      return v(x, Math.sin(a) * 0.175 * env, Math.cos(a) * 0.175 * env);
    });
    const geo = new T.TubeGeometry(new T.CatmullRomCurve3(pts), 88, 0.068, 12, false);
    tintGeometry(geo, '#cc78ff', '#459cf2', 5.2, seed);
    const mat = gelMaterial('#ffffff', { vertexColors: true, opacity: solo ? 0.72 : 0.88, emissive: '#6e32b8', emissiveIntensity: 0.34, iridescence: 0.48 });
    mesh(sg, geo, mat);
    // Internal periplasmic axial filament (endoflagellum) visible running along the spiral core!
    const axialPts = pts.map((p, i) => p.clone().multiplyScalar(0.68).add(v(0, Math.cos(i * 0.4) * 0.015, 0)));
    tube(sg, glow('#a8f7ff', 0.92), axialPts, 0.018, false, 72, 6);
    return sg;
  };
  const spMain = makeCorkscrew(0.06, -0.14, 0.18, 0.36, 1.05, 1);
  const spBack = makeCorkscrew(-0.24, 0.46, -0.22, 0.44, 0.82, 4);

  if (solo) {
    addMicroTag(g, 'Espiral fina e flexível ("saca-rolhas")', 0.9, 0.92, 0.4, '#d48aff', '#f7e6ff', 0.22);
    addMicroTag(g, 'Endoflagelo (filamento axial interno)', -0.9, -0.86, 0.4, '#a8f7ff', '#e0fdff', 0.22);
  }
  return t => {
    spMain.rotation.x = t * 3.2;
    spBack.rotation.x = -t * 2.6;
    g.rotation.y = Math.sin(t * 0.42) * 0.45;
  };
}

// ============================================================================
// ENTRYPOINT: Interactive 3x3 Confocal Microscopy Gallery OR Solo Enlarged View
// ============================================================================
const BUILDERS = {
  cocci: { key: 'b_cocci', fn: buildCocci, pos: [-3.9, 2.95, 0] },
  diplococci: { key: 'b_diplococci', fn: buildDiplococci, pos: [0.0, 2.95, 0] },
  streptococci: { key: 'b_streptococci', fn: buildStreptococci, pos: [3.9, 2.95, 0] },
  staphylococci: { key: 'b_staphylococci', fn: buildStaphylococci, pos: [-3.9, 0.05, 0] },
  bacilli: { key: 'b_bacilli', fn: buildBacilli, pos: [0.0, 0.05, 0] },
  streptobacilli: { key: 'b_streptobacilli', fn: buildStreptobacilli, pos: [3.9, 0.05, 0] },
  vibrio: { key: 'b_vibrio', fn: buildVibrio, pos: [-3.9, -2.85, 0] },
  spirilla: { key: 'b_spirilla', fn: buildSpirilla, pos: [0.0, -2.85, 0] },
  spirochetes: { key: 'b_spirochetes', fn: buildSpirochetes, pos: [3.9, -2.85, 0] }
};

export function buildBacteriaSubtype(subtype, { build, anchors }) {
  const updaters = [];
  if (subtype === 'gallery') {
    for (const [id, spec] of Object.entries(BUILDERS)) {
      let animFn = null;
      const obj = build(spec.key, spec.pos, item => {
        // Subtle glowing confocal microscopy field ring framing each of the 9 specimens!
        const ringMat = glow('#5ce4ff', 0.65, { transparent: true, opacity: 0.48, depthWrite: false });
        const dishMat = gelMaterial('#1c4678', { opacity: 0.16, iridescence: 0.35 });
        torus(item, ringMat, 1.24, 0.026, 0, 0, -0.25);
        mesh(item, new T.CircleGeometry(1.22, 32), dishMat, 0, 0, -0.28);
        const inner = group(item);
        inner.scale.setScalar(0.95);
        animFn = spec.fn(inner, false);
      }, true);
      createAnchor(obj, anchors, `${spec.key}_main`, 0, 0, 0);
      if (animFn) updaters.push(t => animFn(t));
    }
    return updaters;
  }

  const spec = BUILDERS[subtype];
  if (!spec) return updaters;
  let animFn = null;
  const obj = build(spec.key, [0, 0, 0], item => {
    const inner = group(item);
    inner.scale.setScalar(1.82);
    animFn = spec.fn(inner, true);
  }, false);
  createAnchor(obj, anchors, `${spec.key}_main`, 0, 0, 0);
  if (animFn) updaters.push(t => animFn(t));
  return updaters;
}
