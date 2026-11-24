import * as T from 'three';
import {
  v, group, mesh, sphere, cylinder, capsule, lathe, torus, tube, rod,
  material, glow, instances, instanceUpdater, labelSprite,
  membraneMaterial, gelMaterial, proteinMaterial, organelleMaterial,
  organicDisplace, tintGeometry, mergeGeos
} from '../core/geometry.js';
import { createAnchor } from './cellMicroDetails.js?v=19';

const tau = Math.PI * 2;
const up = v(0, 1, 0);

export const VIRUS_SUBTYPES = {
  gallery: 'Galeria · Todos os 10 vírus',
  comparison: 'Comparativo (Envelopado + Fago T4)',
  hiv: 'HIV (Retrovírus · gp120/capsídeo cônico)',
  hbv: 'HBV (Hepatite B · antígenos HBsAg)',
  ebola: 'Ebolavírus (Filovírus filamentoso)',
  adenovirus: 'Adenovírus (icosaédrico · fibras)',
  influenza: 'Influenza (Gripe · HA e NA)',
  lyssavirus: 'Lyssavirus (Raiva · formato projétil)',
  phage: 'Bacteriófago T4 (complexo contrátil)',
  hpv: 'HPV (Papilomavírus · capsômeros L1)',
  rotavirus: 'Rotavírus (roda · espículas VP4)',
  herpes: 'Herpesvírus (espículas cônicas)'
};

export const VIRUS_SUMMARY = {
  gallery: 'Galeria 3D comparativa dos 10 principais tipos virais: vírus envelopados (HIV, HBV, Ebola, Influenza, Lyssavirus, Herpesvírus), capsídeos nus icosaédricos/esféricos (Adenovírus, HPV, Rotavírus) e complexos (Bacteriófago). Clique em qualquer vírus para inspecionar.',
  comparison: 'Entidade ACELULAR (parasita intracelular obrigatório): não possui metabolismo próprio nem ribossomos. Compare um vírus envelopado com espículas e capsídeo ao lado de um Bacteriófago T4.',
  hiv: 'HIV (Retrovírus · Lentivirus): vírus envelopado com glicoproteínas triméricas gp120/gp41, capsídeo interno cônico (p24), 2 fitas de RNA e transcriptase reversa.',
  hbv: 'HBV (Vírus da Hepatite B · Hepadnaviridae): partícula de Dane esférica com envelope densamente cravejado de rosetas do antígeno HBsAg envolvendo o capsídeo icosaédrico com DNA circular.',
  ebola: 'Ebolavírus (Filoviridae): morfologia filamentosa alongada em gancho/serpentina ("cajado de pastor"), com envelope lipídico, glicoproteínas GP e nucleocapsídeo helicoidal interno de RNA.',
  adenovirus: 'Adenovírus (Adenoviridae): vírus NÃO envelopado (nu) com capsídeo icosaédrico azul-safira facetado e 12 fibras proteicas nos vértices terminadas em botões globulares de adesão.',
  influenza: 'Influenza (Vírus da Gripe · Orthomyxoviridae): envelope lipídico com dois tipos de espículas — Hemaglutinina (HA, azul) para entrada e Neuraminidase (NA, rosa-coral) para liberação — e 8 segmentos de RNA.',
  lyssavirus: 'Lyssavirus (Vírus da Raiva · Rhabdoviridae): formato inconfundível de projétil ("bala"), com envelope cravejado de espículas G e ribonucleoproteína interna enrolada em hélice.',
  phage: 'Bacteriófago T4 (vírus complexo): parasita exclusivo de bactérias com cabeça icosaédrica contendo dsDNA, bainha helicoidal contrátil, placa basal e 6 fibras articuladas que injetam o DNA.',
  hpv: 'HPV (Papilomavírus Humano): vírus nu altamente resistente com capsídeo esférico montado por 72 capsômeros pentaméricos da proteína L1 em padrão de estrela/roseta.',
  rotavirus: 'Rotavírus (Reoviridae): vírus nu de tripla camada proteica com poros radiais em aspecto de roda ("rota") e espículas VP4 avermelhadas; principal agente de gastroenterites infantis.',
  herpes: 'Herpesvírus (Herpesviridae): grande vírus envelopado repleto de longas espículas cônicas de glicoproteínas, camada de tegumento amorfo e capsídeo icosaédrico interno com dsDNA linear.'
};

export const VIRUS_LABEL_OFFSETS = {
  v_hiv: v(0, -1.32, 0.25),
  v_hbv: v(0, -1.28, 0.25),
  v_ebola: v(0, -1.32, 0.25),
  v_adeno: v(0, -1.38, 0.25),
  v_influenza: v(0, -1.32, 0.25),
  v_lyssa: v(0, -1.34, 0.25),
  v_phage: v(0, -1.58, 0.25),
  v_hpv: v(0, -1.28, 0.25),
  v_rota: v(0, -1.32, 0.25),
  v_herpes: v(0, -1.34, 0.25)
};

export const VIRUS_CAMERAS = {
  gallery: { eye: [-0.55, 0.25, 21.4], target: [-0.55, -0.05, 0] },
  hiv: { eye: [1.4, 1.3, 9.6], target: [0, -0.1, 0] },
  hbv: { eye: [1.3, 1.3, 9.2], target: [0, -0.1, 0] },
  ebola: { eye: [0.8, 1.2, 10.0], target: [0, -0.1, 0] },
  adenovirus: { eye: [1.6, 1.3, 9.8], target: [0, -0.1, 0] },
  influenza: { eye: [1.4, 1.3, 9.6], target: [0, -0.1, 0] },
  lyssavirus: { eye: [1.5, 1.2, 9.8], target: [0, -0.05, 0] },
  phage: { eye: [1.8, 1.4, 11.4], target: [0, 0.0, 0] },
  hpv: { eye: [1.3, 1.2, 9.4], target: [0, -0.1, 0] },
  rotavirus: { eye: [1.4, 1.2, 9.6], target: [0, -0.1, 0] },
  herpes: { eye: [1.5, 1.3, 9.8], target: [0, -0.1, 0] }
};

function fibonacciDirs(count) {
  const dirs = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / Math.max(1, count - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const th = golden * i;
    dirs.push(v(Math.cos(th) * r, y, Math.sin(th) * r).normalize());
  }
  return dirs;
}

function orientInstanced(parent, geo, mat, dirs, radius, scaleFn = null) {
  const batch = instances(parent, geo, mat, dirs.length);
  const dummy = new T.Object3D();
  for (let i = 0; i < dirs.length; i++) {
    const d = dirs[i];
    dummy.position.set(d.x * radius, d.y * radius, d.z * radius);
    dummy.quaternion.setFromUnitVectors(up, d);
    const sc = scaleFn ? scaleFn(i, d) : 1;
    dummy.scale.setScalar(sc);
    dummy.updateMatrix();
    batch.setMatrixAt(i, dummy.matrix);
  }
  batch.instanceMatrix.needsUpdate = true;
  return batch;
}

function addMicroTag(host, text, x, y, z, border = '#68dce8', color = '#eef7fa', sc = 0.22) {
  const sp = labelSprite(text, { scale: sc, border, color, font: '700 26px system-ui, sans-serif', depthTest: false });
  sp.position.set(x, y, z);
  sp.renderOrder = 10;
  host.add(sp);
  return sp;
}

// ============================================================================
// 1. HIV — Purple-magenta envelope + blue-tipped mushroom trimeric gp120 spikes
//          + translucent window showing conical p24 capsid & diploid ssRNA!
// ============================================================================
function buildHIV(parent, solo = false) {
  const g = group(parent);
  const envGeo = organicDisplace(new T.SphereGeometry(0.84, 34, 24), 0.032, 4.5, 2);
  tintGeometry(envGeo, '#b3388f', '#5c1854', 3.2, 1);
  const envMat = solo
    ? gelMaterial('#ffffff', { vertexColors: true, opacity: 0.52, emissive: '#6e1959', emissiveIntensity: 0.22, iridescence: 0.42 })
    : proteinMaterial('#ffffff', { vertexColors: true, emissive: '#59164b', emissiveIntensity: 0.22, clearcoat: 0.94, iridescence: 0.34 });
  mesh(g, envGeo, envMat);

  // Sculpted mushroom gp41/gp120 spikes: purple stalk + blue trilobed mushroom cap!
  const dirs = fibonacciDirs(solo ? 46 : 36);
  const stalkGeo = new T.LatheGeometry([
    new T.Vector2(0.052, -0.02), new T.Vector2(0.028, 0.07), new T.Vector2(0.038, 0.14), new T.Vector2(0.018, 0.17)
  ], 10);
  const capParts = [];
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * tau;
    const lobe = new T.SphereGeometry(0.064, 9, 7);
    lobe.scale(1.1, 0.72, 1.0);
    lobe.translate(Math.cos(a) * 0.048, 0.205, Math.sin(a) * 0.048);
    capParts.push(lobe);
  }
  const topDome = new T.SphereGeometry(0.072, 10, 8);
  topDome.scale(1.22, 0.6, 1.22);
  topDome.translate(0, 0.225, 0);
  capParts.push(topDome);
  const capGeo = mergeGeos(capParts);

  const stalkMat = proteinMaterial('#9c2f86', { emissive: '#5e1452', emissiveIntensity: 0.28, clearcoat: 0.9 });
  const capMat = proteinMaterial('#3a8cf2', { emissive: '#1950a8', emissiveIntensity: 0.34, clearcoat: 0.98, iridescence: 0.3 });
  orientInstanced(g, stalkGeo, stalkMat, dirs, 0.82);
  orientInstanced(g, capGeo, capMat, dirs, 0.82);

  // Iconic conical HIV core capsid + diploid RNA inside (always visible in solo translucent view!)
  const coneMat = proteinMaterial('#d97cc4', { emissive: '#782669', emissiveIntensity: 0.32, clearcoat: 0.82, transparent: solo, opacity: solo ? 0.78 : 0.95 });
  const cone = lathe(g, coneMat, [
    [0.01, -0.44], [0.16, -0.4], [0.24, -0.1], [0.34, 0.34], [0.24, 0.44], [0.01, 0.46]
  ], 16);
  cone.rotation.z = -0.22;
  // Twin glowing ssRNA strands + Reverse Transcriptase spheres inside the cone
  const rnaMat = glow('#ffde73', 0.95);
  for (const s of [-1, 1]) {
    const pts = Array.from({ length: 18 }, (_, i) => {
      const f = i / 17;
      const a = f * tau * 2.1 + (s > 0 ? 0 : Math.PI);
      return v(Math.cos(a) * 0.095 + s * 0.045, -0.32 + f * 0.64, Math.sin(a) * 0.095);
    });
    tube(cone, rnaMat, pts, 0.018, false, 20, 6);
  }
  mesh(cone, new T.SphereGeometry(0.062, 10, 8), glow('#62f5d8', 0.9), 0.08, -0.14, 0.09);

  if (solo) {
    addMicroTag(g, 'Espículas gp120/gp41 (ancoragem CD4)', 0.92, 0.98, 0.55, '#4c9eff', '#d9ebff', 0.22);
    addMicroTag(g, 'Capsídeo cônico (p24) + 2× ssRNA', -0.82, -0.95, 0.6, '#f08cd6', '#ffe0f6', 0.22);
  }
  return t => { g.rotation.y = t * 0.32; g.rotation.x = Math.sin(t * 0.5) * 0.14; };
}

// ============================================================================
// 2. HBV — Warm amber-orange spherical particle covered in dense bumpy HBsAg
//          antigen rosettes + inner icosahedral HBcAg capsid & circular rcDNA
// ============================================================================
function buildHBV(parent, solo = false) {
  const g = group(parent);
  const envGeo = organicDisplace(new T.SphereGeometry(0.86, 36, 26), 0.036, 5.2, 7);
  tintGeometry(envGeo, '#ffba59', '#c95e1a', 4.2, 3);
  const envMat = solo
    ? gelMaterial('#ffffff', { vertexColors: true, opacity: 0.56, emissive: '#8f3f0e', emissiveIntensity: 0.22, iridescence: 0.36 })
    : proteinMaterial('#ffffff', { vertexColors: true, emissive: '#873a0c', emissiveIntensity: 0.24, clearcoat: 0.94, iridescence: 0.26 });
  mesh(g, envGeo, envMat);

  // Dense bumpy amber-orange HBsAg rosette bosses studded around the entire surface (matches diagram!)
  const dirs = fibonacciDirs(solo ? 86 : 64);
  const bossParts = [];
  const ring = new T.TorusGeometry(0.068, 0.032, 7, 10);
  ring.rotateX(Math.PI / 2);
  ring.translate(0, 0.052, 0);
  bossParts.push(ring);
  const center = new T.SphereGeometry(0.048, 8, 6);
  center.scale(1, 0.68, 1);
  center.translate(0, 0.048, 0);
  bossParts.push(center);
  const bossGeo = mergeGeos(bossParts);

  const bossMat = proteinMaterial('#e87822', { emissive: '#8a3408', emissiveIntensity: 0.28, clearcoat: 0.92 });
  orientInstanced(g, bossGeo, bossMat, dirs, 0.84, i => 0.85 + (i % 3) * 0.14);

  if (solo) {
    // Inner icosahedral core capsid (HBcAg) + circular DNA ring
    const coreGeo = new T.IcosahedronGeometry(0.48, 1);
    mesh(g, coreGeo, gelMaterial('#ffd980', { opacity: 0.44, emissive: '#a86918', emissiveIntensity: 0.32 }));
    const dnaRing = torus(g, glow('#8cffdf', 0.95), 0.28, 0.03, 0, 0, 0, tau * 0.86);
    dnaRing.rotation.set(0.55, 0.4, 0.2);
    addMicroTag(g, 'Antígenos de superfície (HBsAg)', 0.88, 0.92, 0.5, '#ffba59', '#fff0d6', 0.22);
    addMicroTag(g, 'Capsídeo icosaédrico + DNA circular', -0.82, -0.88, 0.55, '#8cffdf', '#dcfff4', 0.22);
  }
  return t => { g.rotation.y = t * 0.36; g.rotation.z = Math.cos(t * 0.48) * 0.1; };
}

// ============================================================================
// 3. EBOLAVÍRUS — Iconic crimson-magenta serpentine coiled filamentous threads
//                 ("shepherd's crook") with gelatinous envelope & helical RNP!
// ============================================================================
function buildEbola(parent, solo = false) {
  const g = group(parent);
  const envMat = gelMaterial('#e62e6b', { opacity: solo ? 0.62 : 0.84, emissive: '#8c103a', emissiveIntensity: 0.28, iridescence: 0.42 });
  const coreMat = proteinMaterial('#ffb3cf', { emissive: '#d6457a', emissiveIntensity: 0.48, clearcoat: 0.92 });
  const spikeMat = proteinMaterial('#ff6b9a', { emissive: '#9e1c4a', emissiveIntensity: 0.32, clearcoat: 0.9 });

  // Upper coiled shepherd's-crook filament (faithful to diagram's twin twisting crimson filaments!)
  const pathA = new T.CatmullRomCurve3([
    v(-0.88, 0.38, 0.14), v(-0.74, 0.55, -0.05), v(-0.56, 0.22, 0.16),
    v(-0.34, -0.05, -0.08), v(0.06, 0.06, 0.18), v(0.45, 0.48, 0.08),
    v(0.74, 0.72, -0.14), v(0.84, 0.46, 0.08), v(0.62, 0.26, 0.24),
    v(0.42, 0.44, -0.04), v(0.68, 0.82, 0.16)
  ]);
  const pathB = new T.CatmullRomCurve3([
    v(-0.86, -0.18, -0.12), v(-0.98, -0.52, 0.14), v(-0.62, -0.68, 0.22),
    v(-0.18, -0.44, -0.06), v(0.28, -0.52, 0.14), v(0.64, -0.18, 0.04),
    v(0.92, -0.34, -0.12), v(1.06, -0.58, 0.06)
  ]);

  const buildFilament = (crv, rOuter) => {
    const fg = group(g);
    const outerGeo = new T.TubeGeometry(crv, 68, rOuter, 14, false);
    organicDisplace(outerGeo, 0.06, 10, 4);
    mesh(fg, outerGeo, envMat);
    // Rounded hemispherical filament caps
    const p0 = crv.getPoint(0), p1 = crv.getPoint(1);
    mesh(fg, new T.SphereGeometry(rOuter * 1.02, 12, 10), envMat, p0.x, p0.y, p0.z);
    mesh(fg, new T.SphereGeometry(rOuter * 1.02, 12, 10), envMat, p1.x, p1.y, p1.z);

    // Internal helical RNA nucleocapsid winding cleanly inside the translucent crimson filament!
    const frames = crv.computeFrenetFrames(52, false);
    const rnpPts = [];
    for (let i = 0; i <= 52; i++) {
      const f = i / 52;
      const pt = crv.getPoint(f);
      const a = f * tau * 8;
      const n = frames.normals[i], b = frames.binormals[i];
      rnpPts.push(pt.clone().addScaledVector(n, Math.cos(a) * rOuter * 0.44).addScaledVector(b, Math.sin(a) * rOuter * 0.44));
    }
    tube(fg, coreMat, rnpPts, rOuter * 0.24, false, 64, 6);

    // Delicate surface GP spikes along the filament envelope
    const spikeCount = solo ? 48 : 28;
    const spGeo = new T.SphereGeometry(0.028, 7, 5);
    const spBatch = instances(fg, spGeo, spikeMat, spikeCount);
    const dummy = new T.Object3D();
    for (let i = 0; i < spikeCount; i++) {
      const f = (i + 0.5) / spikeCount;
      const idx = Math.min(52, Math.floor(f * 52));
      const pt = crv.getPoint(f);
      const a = i * 2.1;
      const dir = frames.normals[idx].clone().multiplyScalar(Math.cos(a)).addScaledVector(frames.binormals[idx], Math.sin(a)).normalize();
      dummy.position.copy(pt).addScaledVector(dir, rOuter * 1.02);
      dummy.scale.set(0.85, 1.25, 0.85);
      dummy.quaternion.setFromUnitVectors(up, dir);
      dummy.updateMatrix();
      spBatch.setMatrixAt(i, dummy.matrix);
    }
    spBatch.instanceMatrix.needsUpdate = true;
    return fg;
  };

  const filA = buildFilament(pathA, 0.118);
  const filB = buildFilament(pathB, 0.112);

  if (solo) {
    addMicroTag(g, 'Morfologia filamentosa ("cajado")', 0.72, 0.92, 0.4, '#ff6b9a', '#ffe0ec', 0.22);
    addMicroTag(g, 'Nucleocapsídeo helicoidal (ssRNA)', -0.78, -0.92, 0.4, '#ffb3cf', '#ffe8f2', 0.22);
  }
  return t => {
    g.rotation.y = Math.sin(t * 0.45) * 0.48;
    filA.rotation.z = Math.sin(t * 1.3) * 0.05;
    filB.rotation.z = -Math.sin(t * 1.3 + 1.1) * 0.05;
  };
}

// ============================================================================
// 4. ADENOVÍRUS — Faceted sapphire-blue naked icosahedron + 12 golden penton
//                 vertex fiber shafts tipped with lime-green knob balls!
// ============================================================================
function buildAdenovirus(parent, solo = false) {
  const g = group(parent);
  const icoGeo = new T.IcosahedronGeometry(0.82, 0);
  // Subtle sapphire flat-faceted cryo-EM crystal shading
  const capMat = new T.MeshPhysicalMaterial({
    color: '#2d93eb', emissive: '#11448a', emissiveIntensity: 0.22,
    roughness: 0.18, metalness: 0.08, clearcoat: 1.0, clearcoatRoughness: 0.1,
    iridescence: 0.34, flatShading: true,
    transparent: solo, opacity: solo ? 0.74 : 1.0
  });
  mesh(g, icoGeo, capMat);
  // Crisp cyan-silver icosahedral bevel edges highlighting the 20 triangular facets
  const edgeMat = new T.LineBasicMaterial({ color: '#99e0ff', transparent: true, opacity: 0.75 });
  g.add(new T.LineSegments(new T.EdgesGeometry(icoGeo), edgeMat));

  // Extract the exact 12 unique vertices of an icosahedron!
  const phi = (1 + Math.sqrt(5)) / 2;
  const rawVerts = [
    [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
    [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
    [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1]
  ];
  const pentMat = proteinMaterial('#f0be59', { emissive: '#9c6812', emissiveIntensity: 0.32, clearcoat: 0.92 });
  const shaftMat = proteinMaterial('#e6b852', { emissive: '#8f5d14', emissiveIntensity: 0.26, clearcoat: 0.9 });
  const knobMat = proteinMaterial('#92e854', { emissive: '#3e8c14', emissiveIntensity: 0.42, clearcoat: 0.98, iridescence: 0.28 });

  for (const [vx, vy, vz] of rawVerts) {
    const dir = v(vx, vy, vz).normalize();
    const spike = group(g, dir.x * 0.81, dir.y * 0.81, dir.z * 0.81);
    spike.quaternion.setFromUnitVectors(up, dir);
    // Penton base collar
    lathe(spike, pentMat, [[0.01, -0.02], [0.095, 0], [0.075, 0.055], [0.032, 0.075]], 10);
    // Slender fiber shaft
    cylinder(spike, shaftMat, 0.022, 0.026, 0.38, 0, 0.24, 0, 8);
    // Glowing lime-green trimeric adhesion knob ball at the tip!
    mesh(spike, organicDisplace(new T.SphereGeometry(0.092, 12, 10), 0.08, 6, 3), knobMat, 0, 0.46, 0);
  }

  if (solo) {
    // Visible linear dsDNA chromatin core inside the semi-translucent blue icosahedron
    const dnaPts = Array.from({ length: 34 }, (_, i) => {
      const f = i / 33;
      const a = f * tau * 3.2;
      const r = 0.24 + Math.sin(f * Math.PI) * 0.14;
      return v(Math.cos(a) * r, -0.44 + f * 0.88, Math.sin(a) * r);
    });
    tube(g, glow('#b3f5ff', 0.88), dnaPts, 0.026, false, 44, 7);
    addMicroTag(g, 'Capsídeo icosaédrico nu (20 faces)', -0.88, 0.96, 0.45, '#62c4ff', '#d9f2ff', 0.22);
    addMicroTag(g, '12 fibras + botões de adesão (penton)', 0.92, -0.88, 0.5, '#92e854', '#e4ffd1', 0.22);
  }
  return t => { g.rotation.y = t * 0.34; g.rotation.x = Math.sin(t * 0.42) * 0.2; };
}

// ============================================================================
// 5. INFLUENZA — Deep ocean-blue envelope studded with BOTH sky-blue
//                Hemagglutinin (HA) spikes & coral-pink mushroom Neuraminidase (NA)!
// ============================================================================
function buildInfluenza(parent, solo = false) {
  const g = group(parent);
  const envGeo = organicDisplace(new T.SphereGeometry(0.84, 34, 24), 0.03, 4.4, 9);
  tintGeometry(envGeo, '#2989c9', '#113c6e', 3.4, 5);
  const envMat = solo
    ? gelMaterial('#ffffff', { vertexColors: true, opacity: 0.52, emissive: '#103c6b', emissiveIntensity: 0.24, iridescence: 0.42 })
    : proteinMaterial('#ffffff', { vertexColors: true, emissive: '#103b66', emissiveIntensity: 0.22, clearcoat: 0.94, iridescence: 0.3 });
  mesh(g, envGeo, envMat);

  const allDirs = fibonacciDirs(solo ? 56 : 44);
  const haDirs = [], naDirs = [];
  allDirs.forEach((d, i) => (i % 4 === 1 ? naDirs : haDirs).push(d));

  // Hemagglutinin (HA): sleek blue rod-trimer spikes
  const haGeo = new T.LatheGeometry([
    new T.Vector2(0.044, -0.02), new T.Vector2(0.028, 0.08), new T.Vector2(0.048, 0.18),
    new T.Vector2(0.06, 0.22), new T.Vector2(0.024, 0.25)
  ], 10);
  const haMat = proteinMaterial('#4cc8ff', { emissive: '#14629c', emissiveIntensity: 0.34, clearcoat: 0.96, iridescence: 0.28 });
  orientInstanced(g, haGeo, haMat, haDirs, 0.82);

  // Neuraminidase (NA): coral-pink mushroom tetramer spikes (exact match to diagram!)
  const naStalk = new T.CylinderGeometry(0.022, 0.03, 0.19, 8);
  naStalk.translate(0, 0.095, 0);
  const naHead = new T.SphereGeometry(0.082, 10, 8);
  naHead.scale(1.15, 0.62, 1.15);
  naHead.translate(0, 0.215, 0);
  const naGeo = mergeGeos([naStalk, naHead]);
  const naMat = proteinMaterial('#f5587c', { emissive: '#a81c42', emissiveIntensity: 0.38, clearcoat: 0.96 });
  orientInstanced(g, naGeo, naMat, naDirs, 0.82);

  if (solo) {
    // 8 distinct segmented helical ssRNA ribonucleoproteins inside!
    const segMat = glow('#ffe480', 0.88);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * tau;
      const r = i < 7 ? 0.28 : 0;
      const h = 0.56 - (i % 3) * 0.1;
      const pts = Array.from({ length: 12 }, (_, j) => {
        const f = j / 11;
        const sa = f * tau * 2.4 + i;
        return v(Math.cos(a) * r + Math.cos(sa) * 0.038, -h * 0.5 + f * h, Math.sin(a) * r + Math.sin(sa) * 0.038);
      });
      tube(g, segMat, pts, 0.02, false, 16, 6);
    }
    addMicroTag(g, 'Hemaglutinina (HA · entrada)', -0.92, 0.98, 0.45, '#4cc8ff', '#d6f2ff', 0.22);
    addMicroTag(g, 'Neuraminidase (NA · saída)', 0.92, 0.84, 0.5, '#f5587c', '#ffdce5', 0.22);
    addMicroTag(g, '8 segmentos de RNA viral', 0, -0.98, 0.55, '#ffe480', '#fff6cc', 0.22);
  }
  return t => { g.rotation.y = t * 0.34; g.rotation.z = Math.sin(t * 0.55) * 0.12; };
}

// ============================================================================
// 6. LYSSAVIRUS (Raiva) — Iconic emerald-green BULLET-SHAPED enveloped virion
//                         with surface G spikes & coiled helical RNP spring!
// ============================================================================
function buildLyssavirus(parent, solo = false) {
  const g = group(parent);
  // Authentic bullet silhouette (parabolic rounded nose + cylindrical body + rounded flat base!)
  const bulletProfile = [
    [0.001, -0.82], [0.46, -0.81], [0.58, -0.74], [0.62, -0.56],
    [0.62, -0.15], [0.60, 0.24], [0.52, 0.56], [0.36, 0.80], [0.16, 0.94], [0.001, 0.98]
  ];
  const bGeo = new T.LatheGeometry(bulletProfile.map(p => new T.Vector2(p[0], p[1])), 32);
  organicDisplace(bGeo, 0.022, 4.5, 6);
  tintGeometry(bGeo, '#38c78b', '#0b4a34', 3.0, 2);
  const envMat = solo
    ? gelMaterial('#ffffff', { vertexColors: true, opacity: 0.56, emissive: '#0c593c', emissiveIntensity: 0.24, iridescence: 0.44 })
    : proteinMaterial('#ffffff', { vertexColors: true, emissive: '#0c4f35', emissiveIntensity: 0.24, clearcoat: 0.95, iridescence: 0.34 });
  mesh(g, bGeo, envMat);

  // Delicate mint-emerald G glycoprotein spikes distributed around the bullet walls & parabolic nose!
  const spikeGeo = new T.LatheGeometry([
    new T.Vector2(0.036, -0.02), new T.Vector2(0.02, 0.09), new T.Vector2(0.038, 0.14), new T.Vector2(0.012, 0.175)
  ], 8);
  const spikeMat = proteinMaterial('#7ef0bd', { emissive: '#1e8559', emissiveIntensity: 0.34, clearcoat: 0.96 });
  const spikeTransforms = [];
  const rings = [
    { y: -0.62, r: 0.61, n: 10, ny: -0.05 },
    { y: -0.28, r: 0.62, n: 11, ny: 0 },
    { y: 0.08, r: 0.61, n: 11, ny: 0.06 },
    { y: 0.42, r: 0.55, n: 9, ny: 0.25 },
    { y: 0.72, r: 0.40, n: 7, ny: 0.55 },
    { y: 0.94, r: 0.14, n: 4, ny: 0.9 }
  ];
  for (const rg of rings) {
    for (let i = 0; i < rg.n; i++) {
      const a = (i / rg.n) * tau + rg.y * 2.2;
      const pos = v(Math.cos(a) * rg.r, rg.y, Math.sin(a) * rg.r);
      const dir = v(Math.cos(a), rg.ny, Math.sin(a)).normalize();
      spikeTransforms.push({ pos, dir });
    }
  }
  const spBatch = instances(g, spikeGeo, spikeMat, spikeTransforms.length);
  const dummy = new T.Object3D();
  spikeTransforms.forEach((st, i) => {
    dummy.position.copy(st.pos);
    dummy.quaternion.setFromUnitVectors(up, st.dir);
    dummy.scale.setScalar(1);
    dummy.updateMatrix();
    spBatch.setMatrixAt(i, dummy.matrix);
  });
  spBatch.instanceMatrix.needsUpdate = true;

  // Internal coiled helical ribonucleoprotein spring winding up inside the bullet!
  const helixPts = Array.from({ length: 64 }, (_, i) => {
    const f = i / 63;
    const y = -0.68 + f * 1.44;
    const rad = y > 0.35 ? 0.34 * Math.cos(((y - 0.35) / 0.52) * Math.PI * 0.46) : 0.34;
    const a = f * tau * 7.5;
    return v(Math.cos(a) * rad, y, Math.sin(a) * rad);
  });
  tube(g, proteinMaterial('#b8ffe0', { emissive: '#3cc78a', emissiveIntensity: 0.52, clearcoat: 0.9 }), helixPts, 0.036, false, 72, 7);

  if (solo) {
    addMicroTag(g, 'Envelope em formato de projétil ("bala")', 0.96, 0.68, 0.45, '#7ef0bd', '#dcffef', 0.21);
    addMicroTag(g, 'Ribonucleoproteína helicoidal (ssRNA)', -0.96, -0.42, 0.5, '#b8ffe0', '#e6fff4', 0.21);
  }
  return t => { g.rotation.y = t * 0.38; g.rotation.z = Math.sin(t * 0.65) * 0.1; };
}

// ============================================================================
// 7. BACTERIÓFAGO T4 — Ruby-red prolate head, rigid piston (head+collar+HOLLOW
//                       blue inner tube gp19), base-anchored cutaway cobalt
//                       contractile sheath gp18 & continuous NAKED dsDNA thread!
// ============================================================================
function buildPhage(parent, solo = false) {
  const g = group(parent);
  const SHEATH_TOP = 0.42, SHEATH_BOT = -0.42, SHEATH_H = SHEATH_TOP - SHEATH_BOT;

  // 1. RIGID DESCENDING PISTON (Head + Coiled Naked dsDNA + Collar + HOLLOW Blue Inner Tail Tube gp19!)
  const piston = group(g, 0, 0, 0);

  const headGeo = new T.IcosahedronGeometry(0.46, 0);
  headGeo.scale(0.86, 1.18, 0.86);
  const headMat = new T.MeshPhysicalMaterial({
    color: '#e02828', emissive: '#750a0e', emissiveIntensity: 0.26,
    roughness: 0.18, metalness: 0.08, clearcoat: 1.0, iridescence: 0.28,
    flatShading: true, transparent: solo, opacity: solo ? 0.56 : 1.0
  });
  const head = mesh(piston, headGeo, headMat, 0, 1.04, 0);
  head.add(new T.LineSegments(new T.EdgesGeometry(headGeo), new T.LineBasicMaterial({ color: '#ff8a8a', transparent: true, opacity: 0.76 })));

  // Coiled NAKED dsDNA (no histones!) inside the translucent ruby icosahedral head
  const headCoil = group(piston, 0, 1.04, 0);
  const dnaPts = Array.from({ length: 42 }, (_, i) => {
    const f = i / 41;
    const a = f * tau * 4.5;
    const r = 0.24 * Math.sin(f * Math.PI);
    return v(Math.cos(a) * r, (f - 0.5) * 0.68, Math.sin(a) * r);
  });
  tube(headCoil, glow('#ffe07a', 0.92), dnaPts, 0.018, false, 48, 6);

  // Violet neck collar + fibritin whiskers + GENUINELY HOLLOW blue inner tail tube (gp19) + piercing nozzle!
  const collarMat = proteinMaterial('#9c52d9', { emissive: '#541e87', emissiveIntensity: 0.3, clearcoat: 0.92 });
  lathe(piston, collarMat, [[0.04, 0.42], [0.16, 0.44], [0.15, 0.51], [0.06, 0.54], [0.04, 0.42]], 14);
  const blueTubeMat = gelMaterial('#42a8ff', { opacity: 0.62, emissive: '#1458a8', emissiveIntensity: 0.34, clearcoat: 1.0, iridescence: 0.32 });
  lathe(piston, blueTubeMat, [
    [0.036, -0.58], [0.064, -0.58], [0.064, 0.46], [0.036, 0.46], [0.036, -0.58]
  ], 18);
  // Hollow lysozyme needle nozzle at tip of blue inner tube
  lathe(piston, proteinMaterial('#88e8ff', { emissive: '#2285a8', emissiveIntensity: 0.48, clearcoat: 0.95 }), [
    [0.030, -0.70], [0.048, -0.68], [0.064, -0.58], [0.036, -0.58], [0.030, -0.70]
  ], 14);

  // 2. BASE-ANCHORED CUTAWAY COBALT-BLUE HELICAL CONTRACTILE SHEATH (zero gap at collar during contraction!)
  const sheathGrp = group(g, 0, SHEATH_BOT, 0);
  const sheathMat = proteinMaterial('#2676d9', { emissive: '#113c8a', emissiveIntensity: 0.28, clearcoat: 0.94 });
  const ringCount = 10;
  for (let i = 0; i < ringCount; i++) {
    const ry = (i + 0.5) * (SHEATH_H / ringCount);
    const r = torus(sheathGrp, sheathMat, 0.112, 0.030, 0, ry, 0, solo ? Math.PI * 1.48 : tau);
    r.rotation.x = Math.PI / 2;
    r.rotation.z = -Math.PI * 0.24 + i * 0.12;
  }

  // 3. HOLLOW HEXAGONAL BASEPLATE + 6 ANCHORING PINS + 6 JOINTED SPIDER TAIL FIBERS!
  const baseGrp = group(g, 0, -0.46, 0);
  const baseMat = proteinMaterial('#8c38a8', { emissive: '#4d1463', emissiveIntensity: 0.32, clearcoat: 0.92 });
  lathe(baseGrp, baseMat, [[0.072, -0.05], [0.26, -0.05], [0.22, 0.05], [0.072, 0.05], [0.072, -0.05]], 6);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * tau;
    cylinder(baseGrp, glow('#ff7aa8', 0.65), 0.018, 0.004, 0.12, Math.cos(a) * 0.18, -0.09, Math.sin(a) * 0.18, 6);
    const hip = v(Math.cos(a) * 0.22, 0, Math.sin(a) * 0.22);
    const knee = v(Math.cos(a) * 0.68, -0.18, Math.sin(a) * 0.68);
    const foot = v(Math.cos(a) * 0.88, -0.84, Math.sin(a) * 0.88);
    rod(baseGrp, baseMat, hip, knee, 0.024, 7);
    rod(baseGrp, collarMat, knee, foot, 0.019, 7);
    mesh(baseGrp, new T.SphereGeometry(0.032, 8, 6), glow('#d49eff', 0.5), knee.x, knee.y, knee.z);
  }

  // 4. CONTINUOUS ANIMATED NAKED DOUBLE-STRANDED DNA FILAMENT (solo view!) threading straight down hollow blue tube!
  let dnaA = null, dnaB = null, dnaAPos = null, dnaBPos = null;
  const dnaSegs = 60;
  if (solo) {
    const mkStrand = (hex) => {
      const pos = new Float32Array((dnaSegs + 1) * 3);
      const geo = new T.BufferGeometry();
      geo.setAttribute('position', new T.BufferAttribute(pos, 3));
      const ln = new T.Line(geo, new T.LineBasicMaterial({ color: hex, transparent: true, opacity: 0.95 }));
      g.add(ln);
      return { pos, geo, ln };
    };
    dnaA = mkStrand('#ffe670');
    dnaB = mkStrand('#ff9f5a');
    dnaAPos = dnaA.pos;
    dnaBPos = dnaB.pos;
    addMicroTag(g, 'Cabeça icosaédrica (dsDNA nu, sem histonas)', 0.82, 1.25, 0.35, '#ff7373', '#ffe0e0', 0.21);
    addMicroTag(g, 'Bainha contrátil + Tubo interno oco (gp19)', 0.82, 0.04, 0.35, '#4da3ff', '#d9ebff', 0.21);
    addMicroTag(g, 'Fio contínuo de dsDNA injetado sob pressão', -0.92, -1.08, 0.4, '#ffe670', '#fff7d6', 0.21);
  }

  return t => {
    g.rotation.y = t * 0.32;
    if (solo) {
      const cyc = 0.5 - 0.5 * Math.cos(t * 1.15);
      const stroke = cyc * (SHEATH_H * 0.42);
      piston.position.y = -stroke;
      sheathGrp.scale.y = 1 - cyc * 0.42;
      sheathGrp.scale.x = sheathGrp.scale.z = 1 + cyc * 0.20;
      headCoil.scale.setScalar(1 - cyc * 0.42);
      headCoil.rotation.y = t * 2.2;

      const topY = 0.92 - stroke;
      const tipY = -0.70 - stroke;
      const botY = tipY - 0.08 - cyc * 0.78;
      const span = Math.max(0.1, topY - botY);
      for (let i = 0; i <= dnaSegs; i++) {
        const u = i / dnaSegs;
        const y = topY - u * span;
        let cx = 0, cz = 0, hr = 0.016;
        if (y < tipY) {
          const d = tipY - y;
          cx = Math.sin(d * 6.5 - t * 3.2) * d * 0.48;
          cz = Math.cos(d * 5.8 - t * 2.8) * d * 0.44;
          hr = 0.022;
        }
        const tw = u * 28 - t * 6.5;
        const ox = Math.cos(tw) * hr, oz = Math.sin(tw) * hr;
        const k = i * 3;
        dnaAPos[k] = cx + ox; dnaAPos[k + 1] = y; dnaAPos[k + 2] = cz + oz;
        dnaBPos[k] = cx - ox; dnaBPos[k + 1] = y; dnaBPos[k + 2] = cz - oz;
      }
      dnaA.geo.attributes.position.needsUpdate = true;
      dnaB.geo.attributes.position.needsUpdate = true;
    }
  };
}

// ============================================================================
// 8. HPV — Deep sapphire spherical naked capsid tessellated with iconic
//          5-petal blue pentameric L1 star capsomere rosettes & golden centers!
// ============================================================================
function buildHPV(parent, solo = false) {
  const g = group(parent);
  const coreGeo = new T.SphereGeometry(0.84, 34, 24);
  const coreMat = proteinMaterial('#0f3a75', { emissive: '#081f47', emissiveIntensity: 0.26, clearcoat: 0.88 });
  mesh(g, coreGeo, coreMat);

  // Build 1 pentameric L1 capsomere star rosette (5 sculpted royal-blue petals + 1 bright golden center bead!)
  const dirs = fibonacciDirs(solo ? 72 : 58);
  const petalParts = [];
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * tau;
    const petal = new T.SphereGeometry(0.064, 8, 6);
    petal.scale(0.95, 0.56, 1.15);
    petal.translate(Math.cos(a) * 0.066, 0.036, Math.sin(a) * 0.066);
    petalParts.push(petal);
  }
  const petalGeo = mergeGeos(petalParts);
  const centerGeo = new T.SphereGeometry(0.056, 9, 7);
  centerGeo.scale(1.0, 0.62, 1.0);
  centerGeo.translate(0, 0.055, 0);

  const petalMat = proteinMaterial('#2b78c9', { emissive: '#103c7a', emissiveIntensity: 0.28, clearcoat: 0.96, iridescence: 0.24 });
  const goldMat = proteinMaterial('#ffe066', { emissive: '#c98e14', emissiveIntensity: 0.45, clearcoat: 0.98 });
  orientInstanced(g, petalGeo, petalMat, dirs, 0.83);
  orientInstanced(g, centerGeo, goldMat, dirs, 0.83);

  if (solo) {
    addMicroTag(g, '72 capsômeros pentaméricos (proteína L1)', 0.98, 0.72, 0.45, '#ffe066', '#fff5cc', 0.21);
    addMicroTag(g, 'Vírus nu (sem envelope · dsDNA circular)', -0.94, -0.58, 0.45, '#4da3ff', '#d9eeff', 0.21);
  }
  return t => { g.rotation.y = t * 0.32; g.rotation.x = Math.cos(t * 0.44) * 0.14; };
}

// ============================================================================
// 9. ROTAVÍRUS — Olive-emerald wheel-like triple-layered capsid with pore
//                dimples & bristling crimson-red VP4 spike pins!
// ============================================================================
function buildRotavirus(parent, solo = false) {
  const g = group(parent);
  const capGeo = organicDisplace(new T.SphereGeometry(0.84, 38, 28), 0.04, 6.2, 11);
  tintGeometry(capGeo, '#6dc44b', '#27591d', 4.6, 4);
  const capMat = proteinMaterial('#ffffff', { vertexColors: true, emissive: '#1d4d16', emissiveIntensity: 0.24, clearcoat: 0.92, iridescence: 0.24 });
  mesh(g, capGeo, capMat);

  // Subtle recessed dark-olive pore rings evoking the classic "wheel" (rota) outer VP7 layer!
  const poreDirs = fibonacciDirs(solo ? 52 : 38);
  const poreGeo = new T.TorusGeometry(0.088, 0.024, 7, 10);
  poreGeo.rotateX(Math.PI / 2);
  const poreMat = proteinMaterial('#2e6b22', { emissive: '#163d0e', emissiveIntensity: 0.22, clearcoat: 0.85 });
  orientInstanced(g, poreGeo, poreMat, poreDirs, 0.835);

  // Crimson-red VP4 radiating spike pins with knobby rounded heads (matches diagram!)
  const spikeDirs = fibonacciDirs(solo ? 56 : 42);
  const spGeo = new T.LatheGeometry([
    new T.Vector2(0.046, -0.02), new T.Vector2(0.024, 0.09), new T.Vector2(0.024, 0.18),
    new T.Vector2(0.062, 0.215), new T.Vector2(0.056, 0.255), new T.Vector2(0.01, 0.27)
  ], 10);
  const spMat = proteinMaterial('#de2c4d', { emissive: '#871028', emissiveIntensity: 0.36, clearcoat: 0.96 });
  orientInstanced(g, spGeo, spMat, spikeDirs, 0.83);

  if (solo) {
    addMicroTag(g, 'Capsídeo em "roda" (camada VP7)', -0.9, 0.92, 0.45, '#7de058', '#e0ffd6', 0.22);
    addMicroTag(g, 'Espículas VP4 + 11 segmentos dsRNA', 0.88, -0.92, 0.45, '#ff5c7a', '#ffe0e6', 0.22);
  }
  return t => { g.rotation.y = t * 0.38; g.rotation.z = Math.sin(t * 0.5) * 0.12; };
}

// ============================================================================
// 10. HERPESVÍRUS — Ocean-blue enveloped sphere bristling with long tapered
//                   conical spikes + translucent tegument & icosahedral capsid!
// ============================================================================
function buildHerpesvirus(parent, solo = false) {
  const g = group(parent);
  const envGeo = organicDisplace(new T.SphereGeometry(0.8, 34, 24), 0.032, 4.6, 13);
  tintGeometry(envGeo, '#3896e0', '#12427d', 3.4, 7);
  const envMat = solo
    ? gelMaterial('#ffffff', { vertexColors: true, opacity: 0.5, emissive: '#10407a', emissiveIntensity: 0.26, iridescence: 0.44 })
    : proteinMaterial('#ffffff', { vertexColors: true, emissive: '#103c75', emissiveIntensity: 0.24, clearcoat: 0.96, iridescence: 0.34 });
  mesh(g, envGeo, envMat);

  // Long tapered radiating conical glycoprotein spikes (exact silhouette from diagram!)
  const dirs = fibonacciDirs(solo ? 60 : 46);
  const coneSpikeGeo = new T.LatheGeometry([
    new T.Vector2(0.088, -0.04), new T.Vector2(0.068, 0.08), new T.Vector2(0.044, 0.22),
    new T.Vector2(0.024, 0.34), new T.Vector2(0.008, 0.385)
  ], 10);
  const spMat = proteinMaterial('#5cbcff', { emissive: '#1864ad', emissiveIntensity: 0.34, clearcoat: 0.98, iridescence: 0.32 });
  orientInstanced(g, coneSpikeGeo, spMat, dirs, 0.78);

  if (solo) {
    // Inner amorphous tegument halo + icosahedral dsDNA capsid!
    mesh(g, organicDisplace(new T.SphereGeometry(0.62, 22, 16), 0.08, 5, 3),
      gelMaterial('#7ad4ff', { opacity: 0.24 }));
    const capGeo = new T.IcosahedronGeometry(0.45, 1);
    mesh(g, capGeo, proteinMaterial('#8ce0ff', { emissive: '#1f78b8', emissiveIntensity: 0.38, flatShading: true }));
    addMicroTag(g, 'Espículas glicoproteicas cônicas (gB/gD)', 0.94, 0.96, 0.45, '#5cbcff', '#d9f0ff', 0.22);
    addMicroTag(g, 'Tegumento + capsídeo icosaédrico (dsDNA)', -0.92, -0.92, 0.45, '#9ce8ff', '#e6f9ff', 0.22);
  }
  return t => { g.rotation.y = t * 0.34; g.rotation.x = Math.sin(t * 0.46) * 0.14; };
}

// ============================================================================
// ENTRYPOINT: Build either the Interactive 3D Gallery of all 10 viruses OR a
//             high-detail enlarged solo specimen!
// ============================================================================
const BUILDERS = {
  hiv: { key: 'v_hiv', fn: buildHIV, pos: [-3.7, 2.95, 0], sc: 1.02 },
  hbv: { key: 'v_hbv', fn: buildHBV, pos: [0.0, 2.95, 0], sc: 1.0 },
  ebola: { key: 'v_ebola', fn: buildEbola, pos: [3.85, 2.95, 0], sc: 1.06 },
  adenovirus: { key: 'v_adeno', fn: buildAdenovirus, pos: [-5.1, 0.1, 0], sc: 0.92 },
  influenza: { key: 'v_influenza', fn: buildInfluenza, pos: [-1.7, 0.1, 0], sc: 1.0 },
  lyssavirus: { key: 'v_lyssa', fn: buildLyssavirus, pos: [1.7, 0.1, 0], sc: 1.0 },
  phage: { key: 'v_phage', fn: buildPhage, pos: [5.1, 0.25, 0], sc: 0.96 },
  hpv: { key: 'v_hpv', fn: buildHPV, pos: [-3.7, -2.85, 0], sc: 1.0 },
  rotavirus: { key: 'v_rota', fn: buildRotavirus, pos: [0.0, -2.85, 0], sc: 1.0 },
  herpes: { key: 'v_herpes', fn: buildHerpesvirus, pos: [3.85, -2.85, 0], sc: 0.98 }
};

export function buildVirusSubtype(subtype, { build, anchors }) {
  const updaters = [];
  if (subtype === 'gallery') {
    for (const [id, spec] of Object.entries(BUILDERS)) {
      let animFn = null;
      const obj = build(spec.key, spec.pos, item => {
        const inner = group(item);
        inner.scale.setScalar(spec.sc);
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
    inner.scale.setScalar(subtype === 'phage' ? 1.55 : 1.78);
    animFn = spec.fn(inner, true);
  }, false);
  createAnchor(obj, anchors, `${spec.key}_main`, 0, 0, 0);
  if (animFn) updaters.push(t => animFn(t));
  return updaters;
}
