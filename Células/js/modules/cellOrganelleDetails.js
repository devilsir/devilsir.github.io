import * as T from 'three';
import {
  v, group, mesh, box, sphere, cylinder, capsule, lathe, torus, tube, rod, curve,
  material, glow, instances, instanceUpdater, labelSprite,
  membraneMaterial, gelMaterial, proteinMaterial, organelleMaterial, organicDisplace
} from '../core/geometry.js';
import { createAnchor } from './cellMicroDetails.js?v=16';

const tau = Math.PI * 2;
const smootherstep = x => {
  const c = Math.max(0, Math.min(1, x));
  return c * c * c * (c * (c * 6 - 15) + 10);
};

function addTag(host, text, x, y, z, border = '#68dce8', color = '#eef7fa', sc = 0.145) {
  const sp = labelSprite(text, { scale: sc, border, color, font: '700 26px system-ui, sans-serif', depthTest: false });
  sp.position.set(x, y, z);
  sp.renderOrder = 12;
  sp.visible = false;
  host.add(sp);
  return sp;
}

// Helper: sculpted hourglass transmembrane channel / translocon profile
const poreProfile = [
  [0.014, -0.056], [0.042, -0.048], [0.036, -0.018], [0.025, 0],
  [0.036, 0.018], [0.044, 0.048], [0.016, 0.056]
];

// ============================================================================
// 1. RETÍCULO ENDOPLASMÁTICO RUGOSO (RER)
//    Rampas helicoidais (Terasaki) · Ribossomos 80S + Translocon Sec61 + SRP
//    Chaperonas BiP/Calnexina + N-glicosilação (OST) + Vesícula COPII (ERES)
// ============================================================================
export function attachRERMicro(parent, anchors) {
  const updaters = [];
  createAnchor(parent, anchors, 'rer_main', 0, 0.05, 0.22);
  createAnchor(parent, anchors, 'rer_ribosomes', -0.06, 0.56, 0.24);
  createAnchor(parent, anchors, 'rer_folding', -0.02, 0.28, 0.34);
  createAnchor(parent, anchors, 'rer_budding', 0.92, 0.02, 0.32);

  // Helicoidal Terasaki connecting ramps bridging flattened ER sheets continuously!
  const rampMat = organelleMaterial('#469bc9', { emissive: '#1a567a', emissiveIntensity: 0.22, clearcoat: 0.72 });
  for (let i = 0; i < 4; i++) {
    const y0 = (i - 2.1) * 0.195;
    const x = i % 2 === 0 ? -0.34 : 0.32;
    tube(parent, rampMat, [
      v(x - 0.14, y0, 0.28), v(x, y0 + 0.095, 0.38), v(x + 0.14, y0 + 0.195, 0.28)
    ], 0.056, false, 16, 8);
  }

  // Hero cutaway luminal window & cytosolic Sec61 translocons + docked 80S ribosomes
  const secMat = proteinMaterial('#68f0d4', { emissive: '#1e8a72', emissiveIntensity: 0.36, clearcoat: 0.88 });
  const r60Mat = proteinMaterial('#7ce6ff', { emissive: '#227296', emissiveIntensity: 0.28, clearcoat: 0.82 });
  const r40Mat = proteinMaterial('#b6f2ff', { emissive: '#388aa8', emissiveIntensity: 0.24, clearcoat: 0.82 });
  const srpMat = proteinMaterial('#ff94c4', { emissive: '#94285c', emissiveIntensity: 0.42, clearcoat: 0.8 });
  const ostMat = proteinMaterial('#f5c964', { emissive: '#9c6818', emissiveIntensity: 0.35, clearcoat: 0.78 });

  const riboUnits = [];
  const riboXs = [-0.46, -0.18, 0.10, 0.38];
  for (let i = 0; i < riboXs.length; i++) {
    const rx = riboXs[i];
    const ry = 0.56 + 0.12 * rx * rx;
    const rz = 0.22;
    const unit = group(parent, rx, ry, rz);
    // Sec61 hourglass translocon ring embedded in upper cisterna membrane
    lathe(unit, secMat, poreProfile, 14, 0, -0.02, 0);
    // OST (Oligosaccharyltransferase) complex sitting right beside Sec61 on luminal face
    sphere(unit, ostMat, 0.036, 0.028, 0.032, 0.052, -0.052, 0.02, 10);
    // Docked bi-lobed 80S Ribosome (60S large dome + 40S small crown + mRNA ribbon)
    const r60 = sphere(unit, r60Mat, 0.068, 0.052, 0.056, 0, 0.068, 0, 14);
    const r40 = sphere(unit, r40Mat, 0.052, 0.034, 0.044, 0, 0.124, 0.012, 12);
    // SRP (Signal Recognition Particle) bridging ribosome to SRP receptor on first 2 units
    const srp = i < 2 ? capsule(unit, srpMat, 0.016, 0.055, -0.056, 0.045, 0.028, 6, 10) : null;
    if (srp) srp.rotation.z = 0.48;
    riboUnits.push({ unit, r60, r40, srp, phase: i * 1.1 });
  }
  // mRNA strand threading across all 4 docked polyribosomes
  const mrnaStrand = tube(parent, glow('#e6a8ff', 0.65), [
    v(-0.68, 0.69, 0.25), v(-0.46, 0.68, 0.26), v(-0.18, 0.66, 0.26),
    v(0.10, 0.66, 0.26), v(0.38, 0.68, 0.26), v(0.62, 0.71, 0.24)
  ], 0.011, false, 34, 6);

  // Nascent polypeptide chains descending through Sec61 pores into lumen
  const polyBeads = instances(parent, new T.SphereGeometry(0.022, 8, 6), glow('#ffe27d', 0.92), 24, true);
  const putPoly = instanceUpdater(polyBeads);

  // Luminal BiP / Calnexin Chaperone Folding Zone (glowing translucent luminal pocket + folded globular proteins + Y-glycans!)
  const foldZone = group(parent, -0.02, 0.26, 0.34);
  const lumenPocket = sphere(foldZone, gelMaterial('#72e0ff', { opacity: 0.26, iridescence: 0.42 }), 0.46, 0.16, 0.22, 0, 0, 0, 18);
  const bipMat = proteinMaterial('#68f0b8', { emissive: '#1e8a5c', emissiveIntensity: 0.44, clearcoat: 0.85 });
  const foldedMat = proteinMaterial('#ffbd68', { emissive: '#a85a18', emissiveIntensity: 0.36, clearcoat: 0.88 });
  const glycanMat = glow('#8ef7ff', 0.9);
  const chapPairs = [];
  for (let k = 0; k < 3; k++) {
    const cx = (k - 1) * 0.24;
    const grp = group(foldZone, cx, 0, 0.04);
    // Twin C-shaped BiP chaperone arms cradling a folding protein + Y-shaped N-glycan tree
    const armL = torus(grp, bipMat, 0.068, 0.018, -0.02, 0, 0, Math.PI * 1.15);
    armL.rotation.z = Math.PI * 0.45;
    const armR = torus(grp, bipMat, 0.068, 0.018, 0.02, 0, 0, Math.PI * 1.15);
    armR.rotation.z = -Math.PI * 0.55;
    const cargo = mesh(grp, organicDisplace(new T.IcosahedronGeometry(0.046, 1), 0.14, 4, k + 2), foldedMat, 0, 0, 0);
    // Y-shaped N-glycan branch
    rod(grp, glycanMat, v(0, 0.04, 0), v(0, 0.085, 0), 0.006, 5);
    rod(grp, glycanMat, v(0, 0.085, 0), v(-0.028, 0.115, 0), 0.005, 5);
    rod(grp, glycanMat, v(0, 0.085, 0), v(0.028, 0.115, 0), 0.005, 5);
    chapPairs.push({ grp, armL, armR, cargo, phase: k * 1.7 });
  }

  // Sculpted COPII-Coated Budding Vesicle at ERES (ER Exit Site) on right rim!
  const copIIZone = group(parent, 0.90, 0.02, 0.32);
  const eresNeck = lathe(copIIZone, organelleMaterial('#52b4e8', { clearcoat: 0.72 }), [
    [0.095, -0.14], [0.056, -0.04], [0.044, 0.02], [0.092, 0.09]
  ], 16);
  eresNeck.rotation.z = -Math.PI / 2;
  const copBud = group(copIIZone, 0.14, 0, 0);
  mesh(copBud, new T.SphereGeometry(0.115, 14, 12), gelMaterial('#72dcff', { opacity: 0.58, iridescence: 0.45 }));
  // Geodesic Sec13/31 COPII polyhedral protein cage wrapping the budding vesicle!
  const cageGeo = new T.IcosahedronGeometry(0.132, 0);
  copBud.add(new T.LineSegments(new T.EdgesGeometry(cageGeo),
    new T.LineBasicMaterial({ color: '#9cf5ff', transparent: true, opacity: 0.92 })));
  mesh(copBud, new T.SphereGeometry(0.052, 10, 8), foldedMat, 0, 0, 0);
  const budHalo = torus(copIIZone, glow('#7ae6ff', 0.95, { transparent: true, opacity: 0, depthWrite: false }), 0.22, 0.018, 0.12, 0, 0);

  // Contextual 3D micro-tags
  const tagRibo = addTag(parent, 'Ribossomos 80S + Canal Sec61', -0.06, 0.86, 0.32, '#7ce6ff', '#e0faff', 0.14);
  const tagSRP = addTag(parent, 'SRP (peptídeo sinal)', -0.58, 0.72, 0.35, '#ff94c4', '#ffe0ee', 0.125);
  const tagFold = addTag(parent, 'Chaperonas BiP/Calnexina + N-glicano', -0.02, 0.52, 0.48, '#68f0b8', '#ddffef', 0.14);
  const tagCOP = addTag(parent, 'Brotamento COPII (ERES → Golgi)', 0.96, 0.32, 0.42, '#7ae6ff', '#e0faff', 0.14);

  updaters.push((t, _dt, activeKey, activeAnim) => {
    const isRER = activeKey === 'rer';
    const isTrans = activeAnim === 'rer_translocate';
    const isFold = activeAnim === 'rer_folding';
    const isBud = activeAnim === 'rer_bud';

    tagRibo.visible = isTrans;
    tagSRP.visible = isTrans;
    tagFold.visible = isFold;
    tagCOP.visible = isBud;

    mrnaStrand.visible = isRER || isTrans;
    for (const r of riboUnits) {
      const w = isTrans ? Math.sin(t * 4.5 + r.phase) * 0.012 : Math.sin(t * 1.6 + r.phase) * 0.004;
      r.r40.position.y = 0.124 + w;
      if (r.srp) r.srp.visible = isTrans || isRER;
    }

    polyBeads.visible = isTrans || isFold;
    if (polyBeads.visible) {
      for (let i = 0; i < 4; i++) {
        const rx = riboXs[i];
        const ry = 0.54 + 0.12 * rx * rx;
        for (let b = 0; b < 6; b++) {
          const p = (t * (isTrans ? 0.58 : 0.32) + b / 6 + i * 0.17) % 1;
          const coil = p > 0.55 ? (p - 0.55) * 0.12 : 0.015;
          putPoly(i * 6 + b, rx + Math.sin(p * 14 + i) * coil, ry - p * 0.34, 0.22 + Math.cos(p * 12 + i) * coil, 0.72 + Math.sin(p * Math.PI) * 0.38);
        }
      }
      polyBeads.instanceMatrix.needsUpdate = true;
    }

    lumenPocket.visible = isFold || isTrans;
    for (const ch of chapPairs) {
      ch.grp.visible = isFold || isRER;
      const clamp = isFold ? Math.sin(t * 3.2 + ch.phase) * 0.22 : Math.sin(t * 1.1 + ch.phase) * 0.06;
      ch.armL.rotation.z = Math.PI * 0.45 - clamp;
      ch.armR.rotation.z = -Math.PI * 0.55 + clamp;
      ch.cargo.rotation.y = t * (isFold ? 1.8 : 0.4) + ch.phase;
      ch.cargo.scale.setScalar(isFold ? 0.92 + Math.sin(t * 3.2 + ch.phase) * 0.18 : 0.85);
    }

    copBud.visible = isBud || isRER;
    budHalo.visible = isBud;
    if (copBud.visible) {
      const p = (t * (isBud ? 0.55 : 0.22)) % 1;
      const e = smootherstep(p);
      copBud.position.set(0.11 + e * 0.36, Math.sin(e * Math.PI) * 0.06, e * 0.14);
      copBud.rotation.set(t * 0.7, t * 1.1, 0);
      copBud.scale.setScalar(0.58 + Math.sin(e * Math.PI) * 0.52);
      if (isBud) {
        budHalo.scale.setScalar(0.62 + p * 1.15);
        budHalo.material.opacity = Math.sin(p * Math.PI) * 0.88;
      }
    }
  });
  return updaters;
}

// ============================================================================
// 2. RETÍCULO ENDOPLASMÁTICO LISO (REL)
//    Junções tubulares triplas (Atlastina) · Síntese lipídica & esteroides
//    Citocromo P450 (destoxificação hepática) · Bombas SERCA & Canais Ca2+
// ============================================================================
export function attachSERMicro(parent, anchors) {
  const updaters = [];
  createAnchor(parent, anchors, 'ser_main', 0, 0.02, 0.2);
  createAnchor(parent, anchors, 'ser_lipids', 0.24, 0.22, 0.34);
  createAnchor(parent, anchors, 'ser_detox', -0.26, 0.14, 0.36);
  createAnchor(parent, anchors, 'ser_calcium', 0.02, -0.14, 0.34);

  // Sculpted 3-way anastomosing tubular junctions stabilized by Reticulon/Atlastin rings!
  const juncMat = proteinMaterial('#5ce8cf', { emissive: '#1e8a78', emissiveIntensity: 0.28, clearcoat: 0.82 });
  for (const [jx, jy, jz] of [[-0.36, 0.12, 0.24], [0.28, 0.18, 0.26], [0.02, -0.18, 0.28]]) {
    sphere(parent, juncMat, 0.088, 0.082, 0.082, jx, jy, jz, 14);
    torus(parent, glow('#88ffee', 0.5), 0.096, 0.014, jx, jy, jz).rotation.x = Math.PI * 0.35;
  }

  // A. Lipid & Steroid Biosynthesis Enzymes + budding lipid droplets
  const lipEnzMat = proteinMaterial('#f5c964', { emissive: '#946218', emissiveIntensity: 0.34, clearcoat: 0.85 });
  for (const [lx, ly, lz] of [[0.14, 0.24, 0.34], [0.36, 0.20, 0.32], [0.24, 0.06, 0.38]]) {
    mesh(parent, new T.DodecahedronGeometry(0.052, 0), lipEnzMat, lx, ly, lz);
  }
  const lipidBuds = instances(parent, new T.SphereGeometry(0.054, 10, 8),
    proteinMaterial('#ffd46e', { emissive: '#c47e18', emissiveIntensity: 0.42, clearcoat: 0.92 }), 12, true);
  const putLipid = instanceUpdater(lipidBuds);

  // B. Cytochrome P450 (CYP) Heme Monooxygenase Complexes (Detoxification: Red hydrophobic toxin -> Cyan water-soluble -OH metabolite!)
  const cypGroup = group(parent, -0.28, 0.14, 0.36);
  const cypBodyMat = proteinMaterial('#9c7cf5', { emissive: '#4d32a8', emissiveIntensity: 0.36, clearcoat: 0.88 });
  const hemeMat = glow('#ff7852', 1.1);
  const cypUnits = [];
  for (let i = 0; i < 3; i++) {
    const u = group(cypGroup, (i - 1) * 0.16, (i % 2) * 0.08 - 0.03, 0);
    mesh(u, organicDisplace(new T.SphereGeometry(0.058, 12, 10), 0.12, 4, i + 5), cypBodyMat);
    torus(u, hemeMat, 0.028, 0.008, 0, 0.02, 0.048); // catalytic iron-heme core
    cypUnits.push(u);
  }
  const toxins = instances(cypGroup, new T.OctahedronGeometry(0.032, 0), glow('#ff5268', 0.96), 8, true);
  const detoxed = instances(cypGroup, new T.SphereGeometry(0.032, 8, 6), glow('#6ef0ff', 0.96), 8, true);
  const putTox = instanceUpdater(toxins);
  const putDet = instanceUpdater(detoxed);

  // C. SERCA Ca2+ Pumps + IP3R Release Channels + Glowing Ca2+ Release Cloud!
  const caZone = group(parent, 0.02, -0.14, 0.34);
  const sercaMat = proteinMaterial('#68f0b8', { emissive: '#1a855a', emissiveIntensity: 0.38, clearcoat: 0.85 });
  const ip3Mat = proteinMaterial('#7ce8ff', { emissive: '#227a96', emissiveIntensity: 0.4, clearcoat: 0.88 });
  for (const sx of [-0.14, 0.14]) {
    lathe(caZone, sercaMat, poreProfile, 12, sx, 0.02, 0);
  }
  const ip3Channel = group(caZone, 0, -0.02, 0.04);
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * tau;
    capsule(ip3Channel, ip3Mat, 0.018, 0.055, Math.cos(a) * 0.036, 0, Math.sin(a) * 0.036, 6, 8);
  }
  const caSparks = instances(caZone, new T.SphereGeometry(0.026, 8, 6), glow('#7dffbf', 1.05), 28, true);
  const putCa = instanceUpdater(caSparks);

  const tagLip = addTag(parent, 'Síntese de fosfolipídios e esteroides', 0.28, 0.56, 0.42, '#ffd46e', '#fff5d4', 0.14);
  const tagCYP = addTag(parent, 'Citocromo P450 (toxina → solúvel)', -0.32, 0.44, 0.46, '#b89eff', '#efe8ff', 0.14);
  const tagCa = addTag(parent, 'Bombas SERCA e canais de Ca²⁺ (IP₃R)', 0.04, -0.44, 0.46, '#7dffbf', '#dcffef', 0.14);

  updaters.push((t, _dt, activeKey, activeAnim) => {
    const isSER = activeKey === 'ser';
    const isLip = activeAnim === 'ser_lipids';
    const isDet = activeAnim === 'ser_detox';
    const isCa = activeAnim === 'ser_calcium';

    tagLip.visible = isLip;
    tagCYP.visible = isDet;
    tagCa.visible = isCa;

    lipidBuds.visible = isLip || isSER;
    if (lipidBuds.visible) {
      for (let i = 0; i < lipidBuds.count; i++) {
        const p = (t * (isLip ? 0.44 : 0.18) + i / lipidBuds.count) % 1;
        const e = smootherstep(p);
        const x = 0.05 + ((i % 4) - 1.2) * 0.16;
        const y = 0.14 + e * 0.34;
        const z = 0.34 + Math.sin(i * 1.9 + t) * 0.09;
        putLipid(i, x, y, z, Math.sin(p * Math.PI) * (isLip ? 1.2 : 0.72));
      }
      lipidBuds.instanceMatrix.needsUpdate = true;
    }

    for (let i = 0; i < cypUnits.length; i++) {
      cypUnits[i].rotation.y = t * (isDet ? 1.6 : 0.45) + i;
    }
    toxins.visible = isDet;
    detoxed.visible = isDet;
    if (isDet) {
      for (let i = 0; i < 8; i++) {
        const p = (t * 0.56 + i / 8) % 1;
        const tx = ((i % 3) - 1) * 0.16;
        if (p < 0.5) {
          const u = p * 2;
          putTox(i, tx - 0.34 * (1 - u), 0.22 * (1 - u) + Math.sin(u * 6 + i) * 0.04, 0.22 * (1 - u), 1.05);
          putDet(i, 0, -99, 0, 0.001);
        } else {
          const u = (p - 0.5) * 2;
          putTox(i, 0, -99, 0, 0.001);
          putDet(i, tx + 0.36 * u, 0.26 * u + Math.cos(u * 5 + i) * 0.04, 0.22 * u, Math.sin(u * Math.PI) * 1.25);
        }
      }
      toxins.instanceMatrix.needsUpdate = true;
      detoxed.instanceMatrix.needsUpdate = true;
    }

    caSparks.visible = isCa;
    if (isCa) {
      const burst = 0.5 + 0.5 * Math.sin(t * 2.2);
      ip3Channel.scale.setScalar(1 + burst * 0.24);
      for (let i = 0; i < caSparks.count; i++) {
        const p = (t * 0.68 + i / caSparks.count) % 1;
        const a = i * 2.399 + t * 0.6;
        const r = 0.06 + p * 0.68;
        putCa(i, Math.cos(a) * r, Math.sin(a * 1.2) * r * 0.72, Math.sin(a) * r * 0.5 + 0.12, (1 - p) * 1.3);
      }
      caSparks.instanceMatrix.needsUpdate = true;
    } else {
      ip3Channel.scale.setScalar(1);
    }
  });
  return updaters;
}

// ============================================================================
// 3. COMPLEXO DE GOLGI
//    Face Cis (COPII) · Glicosiltransferases mediais (N/O-glicanos)
//    Retorno retrógrado COPI (KDEL) · Rede Trans (Clatrina + Manose-6-Fosfato)
// ============================================================================
export function attachGolgiMicro(parent, anchors) {
  const updaters = [];
  createAnchor(parent, anchors, 'golgi_cis', -0.18, 0.46, 0.16);
  createAnchor(parent, anchors, 'golgi_medial', 0.0, 0.04, 0.30);
  createAnchor(parent, anchors, 'golgi_retrograde', -0.68, 0.12, 0.24);
  createAnchor(parent, anchors, 'golgi_trans', 0.38, -0.34, 0.32);
  createAnchor(parent, anchors, 'golgi_route', 0.82, -0.16, 0.38);

  // Inter-cisternal fenestrated tubules & swollen cisternal rims
  const rimMat = organelleMaterial('#f5b862', { emissive: '#945818', emissiveIntensity: 0.22, clearcoat: 0.78 });
  for (let i = 0; i < 5; i++) {
    const y = (i - 2) * 0.162;
    const x = i % 2 === 0 ? 0.54 : -0.54;
    tube(parent, rimMat, [v(x, y, 0.18), v(x * 1.08, y + 0.08, 0.26), v(x, y + 0.162, 0.18)], 0.028, false, 12, 7);
  }

  // A. Cis-Golgi Docking Bay: incoming COPII geodesic-caged vesicles + golgin tethers
  const cisBay = group(parent, -0.18, 0.48, 0.16);
  const golginMat = glow('#82ecff', 0.65);
  for (let i = -2; i <= 2; i++) {
    tube(cisBay, golginMat, [v(i * 0.14, 0.04, 0), v(i * 0.16, 0.22, 0.08)], 0.008, false, 8, 5);
  }
  const copIIArriving = [];
  const copIICageGeo = new T.IcosahedronGeometry(0.086, 0);
  const copIIEdgeGeo = new T.EdgesGeometry(copIICageGeo);
  for (let i = 0; i < 3; i++) {
    const ves = group(cisBay);
    mesh(ves, new T.SphereGeometry(0.072, 12, 10), gelMaterial('#72dcff', { opacity: 0.68, iridescence: 0.4 }));
    ves.add(new T.LineSegments(copIIEdgeGeo, new T.LineBasicMaterial({ color: '#a8f6ff', transparent: true, opacity: 0.9 })));
    copIIArriving.push(ves);
  }

  // B. Medial Glycosyltransferases + migrating protein cargo gaining branched glycans
  const glycoEnzMat = proteinMaterial('#68f0d8', { emissive: '#1e8a74', emissiveIntensity: 0.36, clearcoat: 0.85 });
  for (let i = 0; i < 4; i++) {
    mesh(parent, new T.DodecahedronGeometry(0.042, 0), glycoEnzMat, (i - 1.5) * 0.28, 0.06 - (i % 2) * 0.14, 0.38);
  }
  const glycoSparks = instances(parent, new T.SphereGeometry(0.032, 8, 6), glow('#8ef7e6', 0.95), 18, true);
  const putGlyco = instanceUpdater(glycoSparks);

  // C. Retrograde COPI Violet-Caged Vesicles (returning KDEL resident ER enzymes back up to Cis/RER!)
  const copIRetro = [];
  const copICageMat = new T.LineBasicMaterial({ color: '#d4a6ff', transparent: true, opacity: 0.92 });
  for (let i = 0; i < 3; i++) {
    const ves = group(parent);
    mesh(ves, new T.SphereGeometry(0.066, 12, 10), gelMaterial('#b47cf5', { opacity: 0.65, iridescence: 0.4 }));
    ves.add(new T.LineSegments(copIIEdgeGeo, copICageMat));
    copIRetro.push(ves);
  }

  // D. Trans-Golgi Network (TGN) Sorting: Clathrin-Coated Lysosomal Vesicles (M6P) vs Golden Secretory Granules!
  const clathrinVes = [];
  const clathGeo = new T.IcosahedronGeometry(0.095, 1);
  const clathEdges = new T.EdgesGeometry(clathGeo);
  const clathLineMat = new T.LineBasicMaterial({ color: '#ffb8df', transparent: true, opacity: 0.92 });
  for (let i = 0; i < 3; i++) {
    const cv = group(parent);
    mesh(cv, new T.SphereGeometry(0.074, 12, 10), proteinMaterial('#e86ea8', { emissive: '#94285c', emissiveIntensity: 0.4, clearcoat: 0.85 }));
    cv.add(new T.LineSegments(clathEdges, clathLineMat));
    // Glowing green Manose-6-Fosfato (M6P) molecular tag dot!
    sphere(cv, glow('#82ffbe', 1.1), 0.022, 0.022, 0.022, 0, 0.088, 0.04, 8);
    clathrinVes.push(cv);
  }

  const secGranules = instances(parent, new T.SphereGeometry(0.072, 12, 10),
    proteinMaterial('#ffd068', { emissive: '#b87218', emissiveIntensity: 0.4, clearcoat: 0.9 }), 4, true);
  const putSec = instanceUpdater(secGranules);

  const tagCis = addTag(parent, 'Face cis · Recepção COPII (do RER)', -0.18, 0.88, 0.25, '#72dcff', '#dff8ff', 0.14);
  const tagMed = addTag(parent, 'Glicosiltransferases (N/O-glicosilação)', 0.04, 0.34, 0.48, '#8ef7e6', '#dcfff8', 0.14);
  const tagRet = addTag(parent, 'Vesículas COPI · Retorno KDEL → RER', -0.78, 0.42, 0.36, '#d4a6ff', '#f2e6ff', 0.14);
  const tagTrans = addTag(parent, 'Rede trans · Clatrina + Manose-6-Fosfato', 0.42, -0.66, 0.46, '#ffb8df', '#ffe6f3', 0.14);

  updaters.push((t, _dt, activeKey, activeAnim) => {
    const isG = activeKey === 'golgi';
    const isCis = activeAnim === 'golgi_cis';
    const isProc = activeAnim === 'golgi_process';
    const isRet = activeAnim === 'golgi_retrograde';
    const isTrans = activeAnim === 'golgi_trans';
    const isExo = activeAnim === 'golgi_exocytosis';

    tagCis.visible = isCis;
    tagMed.visible = isProc;
    tagRet.visible = isRet;
    tagTrans.visible = isTrans;

    for (let i = 0; i < copIIArriving.length; i++) {
      const vObj = copIIArriving[i];
      vObj.visible = isCis || isG;
      if (vObj.visible) {
        const p = (t * (isCis ? 0.52 : 0.22) + i / 3) % 1;
        const e = smootherstep(p);
        vObj.position.set(-0.32 + e * 0.34 + (i - 1) * 0.14, 0.48 - e * 0.44, 0.22 - e * 0.18);
        vObj.rotation.set(t + i, t * 1.3, 0);
        vObj.scale.setScalar(Math.sin(p * Math.PI) * 1.05 + 0.18);
      }
    }

    glycoSparks.visible = isProc || isG;
    if (glycoSparks.visible) {
      for (let i = 0; i < glycoSparks.count; i++) {
        const p = (t * (isProc ? 0.48 : 0.2) + i / glycoSparks.count) % 1;
        const y = 0.40 - p * 0.80;
        const x = Math.sin(p * 11 + i) * 0.56;
        putGlyco(i, x, y, 0.36 + Math.cos(p * 7 + i) * 0.11, Math.sin(p * Math.PI) * (isProc ? 1.2 : 0.72));
      }
      glycoSparks.instanceMatrix.needsUpdate = true;
    }

    for (let i = 0; i < copIRetro.length; i++) {
      const cv = copIRetro[i];
      cv.visible = isRet || isG;
      if (cv.visible) {
        const p = (t * (isRet ? 0.52 : 0.2) + i / 3) % 1;
        const e = smootherstep(p);
        cv.position.set(-0.78 - Math.sin(e * Math.PI) * 0.18, -0.34 + e * 0.84, 0.22 + Math.sin(e * Math.PI) * 0.12);
        cv.rotation.set(-t * 1.2, t + i, 0);
        cv.scale.setScalar(Math.sin(p * Math.PI) * (isRet ? 1.12 : 0.72) + 0.15);
      }
    }

    for (let i = 0; i < clathrinVes.length; i++) {
      const cl = clathrinVes[i];
      cl.visible = isTrans || isG;
      if (cl.visible) {
        const p = (t * (isTrans ? 0.46 : 0.18) + i / 3) % 1;
        const e = smootherstep(p);
        cl.position.set(0.32 + e * 0.48, -0.36 - e * 0.32 + Math.sin(e * Math.PI) * 0.08, 0.28 + e * 0.22);
        cl.rotation.set(t * 0.9 + i, t * 1.2, 0);
        cl.scale.setScalar(Math.sin(p * Math.PI) * (isTrans ? 1.15 : 0.75) + 0.18);
      }
    }

    secGranules.visible = isTrans || isExo;
    if (secGranules.visible) {
      for (let i = 0; i < 4; i++) {
        const p = (t * 0.48 + i / 4) % 1;
        const e = smootherstep(p);
        putSec(i, 0.65 + e * 0.62, -0.20 + e * 0.16, 0.26 + e * 0.24, Math.sin(p * Math.PI) * 1.18);
      }
      secGranules.instanceMatrix.needsUpdate = true;
    }
  });
  return updaters;
}

// ============================================================================
// 4. LISOSSOMO
//    Glicocálix interno LAMP-1/2 · 5 Bombas V-ATPase (H+ -> pH 4,8)
//    Hidrolases ácidas esculpidas · Fusão autofagossomal · Permeases de reciclagem
// ============================================================================
export function attachLysosomeMicro(parent, anchors) {
  const updaters = [];
  createAnchor(parent, anchors, 'lyso_main', 0, 0.04, 0.24);
  createAnchor(parent, anchors, 'lyso_enzymes', 0, 0.02, 0.18);
  createAnchor(parent, anchors, 'lyso_fusion', -0.34, 0.18, 0.22);
  createAnchor(parent, anchors, 'lyso_digest', 0.12, -0.04, 0.22);

  // Inner protective LAMP-1 / LAMP-2 glycocalyx glowing coat (prevents self-digestion!)
  const lampShell = mesh(parent, new T.SphereGeometry(0.335, 22, 16, Math.PI * 0.76, Math.PI * 1.48),
    gelMaterial('#ff96da', { opacity: 0.34, emissive: '#b83288', emissiveIntensity: 0.32, iridescence: 0.45 }));
  lampShell.scale.set(1, 0.92, 1);

  // Acidic lumen volumetric core mist (pH ~4.8)
  const acidMistMat = gelMaterial('#e658b2', { opacity: 0.22, emissive: '#b52078', emissiveIntensity: 0.38 });
  const acidMist = sphere(parent, acidMistMat, 0.29, 0.26, 0.26, 0, 0, -0.02, 16);

  // 5 Sculpted Rotary V-ATPase Proton Pumps embedded around the lysosomal membrane!
  const v0Mat = proteinMaterial('#4ee2f5', { emissive: '#187c94', emissiveIntensity: 0.38, clearcoat: 0.88 });
  const v1Mat = proteinMaterial('#ffd268', { emissive: '#a86818', emissiveIntensity: 0.36, clearcoat: 0.88 });
  const up = v(0, 1, 0);
  const pumps = [];
  const pumpDirs = [
    v(0.82, 0.46, 0.34), v(-0.74, 0.56, 0.36), v(0.12, 0.94, 0.32),
    v(0.76, -0.56, 0.32), v(-0.68, -0.62, 0.38)
  ];
  for (let i = 0; i < pumpDirs.length; i++) {
    const dir = pumpDirs[i].clone().normalize();
    const pGrp = group(parent, dir.x * 0.37, dir.y * 0.34, dir.z * 0.37);
    pGrp.quaternion.setFromUnitVectors(up, dir);
    // V0 membrane domain barrel
    lathe(pGrp, v0Mat, [
      [0.014, -0.036], [0.034, -0.028], [0.028, 0.0], [0.036, 0.028], [0.016, 0.036]
    ], 12);
    // Rotating V1 cytosolic ATP-hydrolyzing crown (6-lobed)
    const v1 = group(pGrp, 0, 0.068, 0);
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * tau;
      sphere(v1, v1Mat, 0.018, 0.022, 0.018, Math.cos(a) * 0.028, 0, Math.sin(a) * 0.028, 8);
    }
    pumps.push({ pGrp, v1, dir });
  }

  // Sculpted Acid Hydrolase Enzymes inside lumen (Proteases, Lipases, Nucleases — bi-lobed Cryo-EM shapes)
  const hydColors = ['#ffcf68', '#ff82a8', '#78f0d8', '#c496ff'];
  const hydrolases = [];
  for (let i = 0; i < 8; i++) {
    const cHex = hydColors[i % hydColors.length];
    const hMat = proteinMaterial(cHex, { emissive: cHex, emissiveIntensity: 0.32, clearcoat: 0.85 });
    const h = group(parent);
    sphere(h, hMat, 0.044, 0.036, 0.036, -0.018, 0, 0, 10);
    sphere(h, hMat, 0.036, 0.042, 0.034, 0.02, 0.012, 0.008, 10);
    hydrolases.push({ grp: h, mat: hMat, phase: i * 1.15, rad: 0.11 + (i % 3) * 0.048 });
  }

  // Incoming Autophagosome carrying a senescent mini-mitochondrion (fuses during lyso_fusion!)
  const autoPhago = group(parent, -0.58, 0.28, 0.24);
  mesh(autoPhago, new T.SphereGeometry(0.165, 16, 12), gelMaterial('#88e0ff', { opacity: 0.38, iridescence: 0.45 }));
  mesh(autoPhago, new T.SphereGeometry(0.142, 14, 10), gelMaterial('#68b8e0', { opacity: 0.28 }));
  // Mini damaged mitochondrion cargo inside autophagosome
  const cargoMito = capsule(autoPhago, proteinMaterial('#e67a62', { emissive: '#943220', emissiveIntensity: 0.34, clearcoat: 0.72 }), 0.052, 0.095, 0, 0, 0, 6, 10);
  cargoMito.rotation.z = 0.75;
  const fuseRingMat = glow('#ffbe78', 1.1, { transparent: true, opacity: 0, depthWrite: false });
  const fuseRing = torus(parent, fuseRingMat, 0.14, 0.016, -0.28, 0.15, 0.18);

  // Permease export channels on right membrane rim + H+ influx + recycled monomers exiting!
  const permMat = proteinMaterial('#7dffbe', { emissive: '#1e8a54', emissiveIntensity: 0.42, clearcoat: 0.86 });
  for (const py of [-0.08, 0.10]) {
    const p = lathe(parent, permMat, poreProfile, 12, 0.36, py, 0.16);
    p.rotation.z = -Math.PI / 2;
  }

  const hInflux = instances(parent, new T.SphereGeometry(0.019, 8, 6), glow('#6ef2ff', 1.05), 15, true);
  const putH = instanceUpdater(hInflux);
  const monomers = instances(parent, new T.SphereGeometry(0.024, 8, 6), glow('#ffe27d', 0.98), 14, true);
  const putMono = instanceUpdater(monomers);

  const tagPump = addTag(parent, 'Bombas V-ATPase (H⁺ → pH 4,8) + LAMP-1/2', 0, 0.56, 0.28, '#6ef2ff', '#dffaff', 0.135);
  const tagEnz = addTag(parent, 'Hidrolases ácidas (proteases, lipases, nucleases)', 0, 0.46, 0.34, '#ff96da', '#ffe6f6', 0.135);
  const tagFuse = addTag(parent, 'Fusão autofagossomo + lisossomo (autofagia)', -0.34, 0.54, 0.32, '#88e0ff', '#e0f8ff', 0.135);
  const tagDig = addTag(parent, 'Monômeros reciclados → citosol (permeases)', 0.36, -0.38, 0.32, '#ffe27d', '#fff6d4', 0.135);

  updaters.push((t, _dt, activeKey, activeAnim) => {
    const isL = activeKey === 'lysosome';
    const isPumps = activeAnim === 'lyso_pumps';
    const isEnz = activeAnim === 'lyso_enzymes';
    const isFuse = activeAnim === 'lyso_fusion';
    const isDig = activeAnim === 'lyso_digest';

    tagPump.visible = isPumps;
    tagEnz.visible = isEnz;
    tagFuse.visible = isFuse;
    tagDig.visible = isDig;

    lampShell.visible = isL || isPumps || isEnz;
    acidMistMat.emissiveIntensity = isPumps || isEnz ? 0.58 + Math.sin(t * 4) * 0.16 : 0.28;

    // Spin V1 heads of V-ATPase pumps actively
    const spinRate = isPumps ? 5.2 : 1.5;
    for (const p of pumps) p.v1.rotation.y = t * spinRate;

    // H+ proton streams diving directly through the 5 V-ATPase barrels into acidic lumen!
    hInflux.visible = isPumps;
    if (isPumps) {
      for (let i = 0; i < hInflux.count; i++) {
        const p = (t * 0.72 + i / hInflux.count) % 1;
        const pump = pumps[i % pumps.length];
        const r = 0.54 - p * 0.38;
        putH(i, pump.dir.x * r, pump.dir.y * r * 0.92, pump.dir.z * r, Math.sin(p * Math.PI) * 1.15);
      }
      hInflux.instanceMatrix.needsUpdate = true;
    }

    // Swirling acid hydrolases inside lumen
    for (let i = 0; i < hydrolases.length; i++) {
      const h = hydrolases[i];
      const a = t * (isEnz || isDig ? 1.85 : 0.65) + h.phase;
      h.grp.position.set(Math.cos(a) * h.rad, Math.sin(a * 1.25) * h.rad * 0.78, Math.sin(a * 0.8 + i) * 0.11 + 0.04);
      h.grp.rotation.set(t + i, t * 1.3, 0);
      h.mat.emissiveIntensity = isEnz ? 0.78 + Math.sin(t * 5 + i) * 0.22 : 0.3;
    }

    // Autophagosome docking & fusion animation
    autoPhago.visible = isFuse || isDig;
    fuseRing.visible = isFuse;
    if (isFuse) {
      const cyc = (t * 0.42) % 1;
      const e = smootherstep(Math.min(1, cyc / 0.78));
      autoPhago.position.set(-0.62 + e * 0.58, 0.32 - e * 0.30, 0.22 - e * 0.12);
      const shrink = cyc > 0.78 ? 1 - (cyc - 0.78) / 0.22 : 1;
      autoPhago.scale.setScalar(Math.max(0.05, shrink));
      cargoMito.rotation.x = t * 1.8;
      const kiss = Math.max(0, 1 - Math.abs(cyc - 0.64) * 5.2);
      fuseRingMat.opacity = kiss * 0.95;
      fuseRing.scale.setScalar(0.65 + (1 - kiss) * 0.85);
    } else if (isDig) {
      // Target inside lumen breaking down rapidly
      const breakCyc = (t * 0.55) % 1;
      autoPhago.position.set(0.0, 0.0, 0.08);
      autoPhago.scale.setScalar(0.75 * (1 - breakCyc * 0.55));
      cargoMito.rotation.set(t * 2.5, t * 3.1, 0);
    }

    // Recycled monomers exiting through right permease channels into cytosol!
    monomers.visible = isDig;
    if (isDig) {
      for (let i = 0; i < monomers.count; i++) {
        const p = (t * 0.62 + i / monomers.count) % 1;
        const e = smootherstep(p);
        const py = (i % 2 === 0 ? -0.08 : 0.10) + Math.sin(e * 6 + i) * 0.08 * e;
        putMono(i, 0.04 + e * 0.68, py, 0.14 + Math.cos(i * 2.1) * 0.14 * e, Math.sin(p * Math.PI) * 1.2);
      }
      monomers.instanceMatrix.needsUpdate = true;
    }
  });
  return updaters;
}

// ============================================================================
// 5. PEROXISSOMO
//    Importômero PEX · Transportador ABCD1 + β-oxidação de VLCFA (Acetil-CoA)
//    Núcleo paracristalino (uracase/catalase) · Catalase tetramérica (2 H2O2 -> 2 H2O + O2)
// ============================================================================
export function attachPeroxisomeMicro(parent, anchors) {
  const updaters = [];
  createAnchor(parent, anchors, 'perox_main', 0, 0.02, 0.22);
  createAnchor(parent, anchors, 'perox_betaox', -0.22, 0.08, 0.22);
  createAnchor(parent, anchors, 'perox_crystal', 0, 0.0, 0.16);
  createAnchor(parent, anchors, 'perox_catalase', 0.12, 0.06, 0.22);

  // TEM-accurate Faceted Paracrystalline Lattice Core (stacked rhombic-cubic enzyme crystal!)
  const crystalGroup = group(parent, 0, 0, 0.08);
  const cryMat = proteinMaterial('#fff09e', { emissive: '#d6a42b', emissiveIntensity: 0.42, roughness: 0.12, clearcoat: 1.0, iridescence: 0.35 });
  const subCryGeo = new T.BoxGeometry(0.056, 0.056, 0.056);
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        if (Math.abs(x) + Math.abs(y) + Math.abs(z) > 2) continue;
        mesh(crystalGroup, subCryGeo, cryMat, x * 0.054, y * 0.054, z * 0.054);
      }
    }
  }
  // Crisp outer diamond crystal facet shell catching specular light
  crystalGroup.add(new T.LineSegments(
    new T.EdgesGeometry(new T.OctahedronGeometry(0.155, 0)),
    new T.LineBasicMaterial({ color: '#fff7c4', transparent: true, opacity: 0.72 })
  ));

  // ABCD1 Very-Long-Chain Fatty Acid (VLCFA) ABC Transporter + PEX5/14 Importomer on membrane rim
  const abcdMat = proteinMaterial('#68e0f5', { emissive: '#1e7894', emissiveIntensity: 0.38, clearcoat: 0.88 });
  const abcd = lathe(parent, abcdMat, poreProfile, 14, -0.29, 0.08, 0.14);
  abcd.rotation.z = Math.PI / 2;
  const pex = lathe(parent, proteinMaterial('#c496ff', { emissive: '#5e38a8', emissiveIntensity: 0.38, clearcoat: 0.85 }), poreProfile, 12, 0.24, 0.18, 0.14);
  pex.rotation.z = -Math.PI * 0.35;

  // VLCFA zigzag hydrocarbon chain entering through ABCD1 + cleaved 2C Acetil-CoA sparks!
  const vlcfaBeads = instances(parent, new T.SphereGeometry(0.02, 8, 6), glow('#ffba52', 0.94), 12, true);
  const putVlcfa = instanceUpdater(vlcfaBeads);
  const acetylSparks = instances(parent, new T.SphereGeometry(0.024, 8, 6), glow('#7dffbe', 0.98), 8, true);
  const putAcetyl = instanceUpdater(acetylSparks);

  // Tetrameric Catalase complexes (4 globular subunits + heme centers) + H2O2 -> H2O + O2 bursts!
  const catUnits = [];
  const catMat = proteinMaterial('#f58a62', { emissive: '#9c3618', emissiveIntensity: 0.36, clearcoat: 0.85 });
  for (const [cx, cy, cz] of [[0.14, 0.12, 0.15], [0.16, -0.10, 0.14], [-0.12, -0.12, 0.16]]) {
    const cg = group(parent, cx, cy, cz);
    for (const [ox, oy, oz] of [[-0.02, 0.02, 0], [0.02, 0.02, 0], [-0.02, -0.02, 0.015], [0.02, -0.02, -0.015]]) {
      sphere(cg, catMat, 0.022, 0.022, 0.022, ox, oy, oz, 8);
    }
    catUnits.push(cg);
  }
  const h2o2In = instances(parent, new T.SphereGeometry(0.022, 8, 6), glow('#ff5c7a', 1.0), 10, true);
  const putH2O2 = instanceUpdater(h2o2In);
  const o2Bubbles = instances(parent, new T.SphereGeometry(0.024, 8, 6), glow('#8ef7ff', 1.05), 16, true);
  const putO2 = instanceUpdater(o2Bubbles);

  const tagPex = addTag(parent, 'Importômero PEX + Transporte ABCD1', 0.02, 0.44, 0.28, '#c496ff', '#f0e6ff', 0.13);
  const tagBeta = addTag(parent, 'β-oxidação (VLCFA → Acetil-CoA + H₂O₂)', -0.22, 0.38, 0.32, '#ffba52', '#fff1d4', 0.13);
  const tagCry = addTag(parent, 'Núcleo paracristalino (uracase/catalase)', 0.02, 0.26, 0.28, '#fff09e', '#fff9d6', 0.13);
  const tagCat = addTag(parent, 'Catalase: 2 H₂O₂ → 2 H₂O + O₂', 0.14, 0.38, 0.32, '#8ef7ff', '#dffaff', 0.135);

  updaters.push((t, _dt, activeKey, activeAnim) => {
    const isCry = activeAnim === 'perox_crystal';
    const isBeta = activeAnim === 'perox_betaox';
    const isBub = activeAnim === 'perox_bubbles';
    const isOver = activeAnim === 'perox_overview';

    tagPex.visible = isOver;
    tagBeta.visible = isBeta;
    tagCry.visible = isCry;
    tagCat.visible = isBub;

    crystalGroup.rotation.set(t * 0.45, t * 0.72, 0.22);
    cryMat.emissiveIntensity = isCry ? 0.88 + Math.sin(t * 5) * 0.24 : 0.36;

    for (let i = 0; i < catUnits.length; i++) {
      catUnits[i].rotation.y = t * (isBub ? 2.2 : 0.6) + i;
    }

    vlcfaBeads.visible = isBeta;
    acetylSparks.visible = isBeta;
    if (isBeta) {
      const flow = (t * 0.48) % 1;
      for (let i = 0; i < 12; i++) {
        const u = (i / 11 + flow) % 1;
        const x = -0.62 + u * 0.56;
        const y = 0.08 + Math.sin(u * 22) * 0.032;
        const z = 0.14 + Math.cos(u * 18) * 0.025;
        putVlcfa(i, x, y, z, 0.92);
      }
      vlcfaBeads.instanceMatrix.needsUpdate = true;
      for (let i = 0; i < 8; i++) {
        const p = (t * 0.62 + i / 8) % 1;
        const a = i * 1.9;
        putAcetyl(i, -0.02 + p * 0.34, 0.04 + Math.sin(a) * p * 0.22, 0.16 + Math.cos(a) * p * 0.14, Math.sin(p * Math.PI) * 1.15);
      }
      acetylSparks.instanceMatrix.needsUpdate = true;
    }

    h2o2In.visible = isBub;
    o2Bubbles.visible = isBub;
    if (isBub) {
      for (let i = 0; i < 10; i++) {
        const p = (t * 0.72 + i / 10) % 1;
        const a = i * 2.4;
        const r = 0.26 * (1 - p);
        putH2O2(i, 0.08 + Math.cos(a) * r, Math.sin(a) * r, 0.16 + 0.08 * (1 - p), (1 - p) * 1.15);
      }
      h2o2In.instanceMatrix.needsUpdate = true;
      for (let i = 0; i < 16; i++) {
        const p = (t * 0.78 + i / 16) % 1;
        const a = i * 2.399;
        const r = 0.08 + p * 0.48;
        putO2(i, 0.06 + Math.cos(a) * r, Math.sin(a) * r * 0.85 + p * 0.16, 0.18 + p * 0.24, Math.sin(p * Math.PI) * 1.22);
      }
      o2Bubbles.instanceMatrix.needsUpdate = true;
    }
  });
  return updaters;
}

// ============================================================================
// 6. CENTROSSOMO E CENTRÍOLOS (9×3 + SAS-6 CARTWHEEL + APÊNDICES + γ-TuRC)
// ============================================================================
export function attachCentrosomeMicro(parent, anchors) {
  const updaters = [];
  createAnchor(parent, anchors, 'centro_main', 0, 0.02, 0.18);
  createAnchor(parent, anchors, 'centro_triplets', -0.23, -0.05, 0.12);
  createAnchor(parent, anchors, 'centro_nucleation', 0, 0.05, 0.15);
  createAnchor(parent, anchors, 'centro_basal', 0.22, 0.12, 0.14);

  // Pericentriolar Material (PCM) studded with 10 sculpted γ-TuRC (γ-tubulin ring complex) lock-washer rings!
  const turcMat = proteinMaterial('#ffd268', { emissive: '#b57b18', emissiveIntensity: 0.48, clearcoat: 0.9 });
  const mtAlphaMat = proteinMaterial('#48c9db', { emissive: '#167085', emissiveIntensity: 0.34, clearcoat: 0.82 });
  const plusCapMat = glow('#9effe6', 1.1);

  const rays = [];
  const up = v(0, 1, 0);
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * tau + 0.2;
    const elev = ((i % 3) - 1) * 0.46;
    const dir = v(Math.cos(a), elev, Math.sin(a)).normalize();
    const r = group(parent);
    r.quaternion.setFromUnitVectors(up, dir);
    // γ-TuRC open lock-washer ring anchoring the minus (−) end at PCM surface!
    const ring = torus(r, turcMat, 0.036, 0.011, 0, 0.44, 0, Math.PI * 1.85);
    ring.rotation.x = Math.PI / 2;
    // Growing microtubule hollow shaft + glowing GTP-cap plus (+) end!
    const seg = cylinder(r, mtAlphaMat, 0.017, 0.019, 0.78, 0, 0.82, 0, 9);
    const cap = torus(r, plusCapMat, 0.022, 0.008, 0, 1.22, 0);
    cap.rotation.x = Math.PI / 2;
    rays.push({ root: r, ring, seg, cap, phase: i * 0.62 });
  }

  // Basal-body plasma membrane docking preview & emerging 9+2 ciliary axoneme (visible in centro_basal!)
  const basalPreview = group(parent, 0.56, 0.10, 0);
  const dockMem = mesh(basalPreview, new T.CylinderGeometry(0.36, 0.36, 0.036, 22),
    gelMaterial('#58e8f5', { opacity: 0.45, iridescence: 0.48 }), 0.06, 0, 0);
  dockMem.rotation.z = Math.PI / 2;
  const axoGroup = group(basalPreview, 0.08, 0, 0);
  const axoMat = proteinMaterial('#7ce8f5', { emissive: '#22859c', emissiveIntensity: 0.4, clearcoat: 0.85 });
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * tau;
    const d1 = cylinder(axoGroup, axoMat, 0.014, 0.014, 0.68, 0.34, Math.cos(a) * 0.135, Math.sin(a) * 0.135, 7);
    d1.rotation.z = Math.PI / 2;
    const d2 = cylinder(axoGroup, axoMat, 0.012, 0.012, 0.68, 0.34, Math.cos(a + 0.14) * 0.15, Math.sin(a + 0.14) * 0.15, 7);
    d2.rotation.z = Math.PI / 2;
  }
  // Central pair (9+2 ciliary axoneme!)
  for (const cy of [-0.024, 0.024]) {
    const cp = cylinder(axoGroup, glow('#ffd268', 0.7), 0.013, 0.013, 0.68, 0.34, cy, 0, 7);
    cp.rotation.z = Math.PI / 2;
  }
  basalPreview.visible = false;

  const tagPair = addTag(parent, 'Centríolo-mãe em corte longitudinal ⊥ Centríolo-filho', 0.04, 0.66, 0.25, '#eda761', '#ffefd9', 0.14);
  const tagTrip = addTag(parent, 'Corte 9×3 oco (túbulos A–B–C) + Roda SAS-6 interna', -0.22, 0.38, 0.32, '#ffd268', '#fff5d4', 0.135);
  const tagTurc = addTag(parent, 'Anéis γ-TuRC nucleando extremidade (−) → (+)', 0, 0.72, 0.32, '#7ce8f5', '#dffaff', 0.14);
  const tagBasal = addTag(parent, 'Corpo basal → Axonema ciliar / flagelar (9+2)', 0.56, 0.54, 0.28, '#82ffd4', '#dcfff2', 0.135);

  updaters.push((t, _dt, activeKey, activeAnim) => {
    const isOver = activeAnim === 'centro_overview';
    const isTrip = activeAnim === 'centro_triplets';
    const isRays = activeAnim === 'centro_rays';
    const isBasal = activeAnim === 'centro_basal';

    tagPair.visible = isOver;
    tagTrip.visible = isTrip;
    tagTurc.visible = isRays;
    tagBasal.visible = isBasal;

    for (const r of rays) {
      r.root.visible = isRays || activeKey === 'centrosome';
      const cyc = (t * (isRays ? 0.52 : 0.18) + r.phase) % 1;
      // Realistic dynamic instability: steady polymerization followed by fast catastrophe shrink!
      const len = cyc < 0.76 ? 0.25 + smootherstep(cyc / 0.76) * 0.95 : 1.20 - smootherstep((cyc - 0.76) / 0.24) * 0.95;
      r.seg.scale.y = len;
      r.seg.position.y = 0.46 + len * 0.39;
      r.cap.position.y = 0.46 + len * 0.78;
      r.cap.visible = cyc < 0.76;
    }

    basalPreview.visible = isBasal;
    if (isBasal) {
      axoGroup.rotation.y = Math.sin(t * 3.4) * 0.18;
      axoGroup.rotation.z = Math.sin(t * 3.4 + 0.8) * 0.12;
    }
  });
  return updaters;
}

// ============================================================================
// 7. CITOESQUELETO — AS 3 FAMÍLIAS EM ESCALA RELATIVA REAL (25 nm : 10 nm : 7 nm)
//    Microtúbulo (13 protofilamentos α/β-tubulina + instabilidade dinâmica)
//    Cinesina (→ +) & Dineína (→ −) caminhando passo a passo com ATP
//    F-Actina dupla hélice (7 nm) + Arp2/3 (70°) · Filamento Intermediário (10 nm)
// ============================================================================
export function attachCytoskeletonMicro(parent, anchors) {
  const updaters = [];
  createAnchor(parent, anchors, 'cyto_skel_main', 0, 0.2, 0.2);

  // --- A. HERO MICROTUBULE (~25 nm): 13-protofilament hollow lattice of α/β-tubulin dimers! ---
  const mtGroup = group(parent, 0.22, 0.16, 0.82);
  mtGroup.rotation.z = 0.12;
  const mtRadius = 0.088; // proportional to 25 nm
  const alphaMat = proteinMaterial('#2e9db5', { emissive: '#105468', emissiveIntensity: 0.26, clearcoat: 0.86 });
  const betaMat = proteinMaterial('#7ceeff', { emissive: '#22859c', emissiveIntensity: 0.34, clearcoat: 0.92 });
  const ringCount = 26;
  const protoCount = 13;
  const alphaInst = instances(mtGroup, new T.SphereGeometry(0.022, 8, 6), alphaMat, Math.ceil((ringCount * protoCount) / 2));
  const betaInst = instances(mtGroup, new T.SphereGeometry(0.022, 8, 6), betaMat, Math.ceil((ringCount * protoCount) / 2));
  const putA = instanceUpdater(alphaInst);
  const putB = instanceUpdater(betaInst);
  let ai = 0, bi = 0;
  for (let r = 0; r < ringCount; r++) {
    const x = -0.78 + r * 0.062;
    for (let p = 0; p < protoCount; p++) {
      const a = (p / protoCount) * tau + r * 0.09; // subtle 3-start B-lattice helical pitch!
      const y = Math.cos(a) * mtRadius;
      const z = Math.sin(a) * mtRadius;
      if (r % 2 === 0) putA(ai++, x, y, z);
      else putB(bi++, x, y, z);
    }
  }
  alphaInst.count = ai;
  betaInst.count = bi;
  alphaInst.instanceMatrix.needsUpdate = betaInst.instanceMatrix.needsUpdate = true;

  // Dynamic (+) tip protofilament curls (GTP-cap polymerization / catastrophe curling!)
  const curls = [];
  for (let p = 0; p < 8; p++) {
    const a = (p / 8) * tau;
    const cg = group(mtGroup, 0.82, Math.cos(a) * mtRadius, Math.sin(a) * mtRadius);
    cg.rotation.x = a;
    const cTube = tube(cg, glow('#a2f8ff', 0.72), [v(0, 0, 0), v(0.08, 0.02, 0), v(0.14, 0.08, 0)], 0.015, false, 10, 6);
    curls.push({ grp: cg, cTube, phase: p * 0.5 });
  }

  createAnchor(mtGroup, anchors, 'cyto_skel_track', 0.14, 0.02, 0.06);
  createAnchor(mtGroup, anchors, 'cyto_skel_motors', -0.06, 0.18, 0.08);

  // --- B. ARTICULATED WALKING DIMERIC KINESIN (→ +) & DYNEIN (→ −) MOTORS! ---
  function makeWalker(headHex, stalkHex, cargoHex) {
    const root = group(mtGroup);
    const hMat = proteinMaterial(headHex, { emissive: headHex, emissiveIntensity: 0.42, clearcoat: 0.9 });
    const sMat = proteinMaterial(stalkHex, { clearcoat: 0.75 });
    const footL = sphere(root, hMat, 0.034, 0.026, 0.026, -0.032, 0.028, 0.015, 10);
    const footR = sphere(root, hMat, 0.034, 0.026, 0.026, 0.032, 0.028, -0.015, 10);
    const legL = cylinder(root, sMat, 0.008, 0.008, 0.08, -0.018, 0.068, 0.008, 6);
    const legR = cylinder(root, sMat, 0.008, 0.008, 0.08, 0.018, 0.068, -0.008, 6);
    // Coiled-coil helical stalk + cargo vesicle on top!
    tube(root, sMat, [v(0, 0.10, 0), v(0.014, 0.17, 0.01), v(-0.014, 0.24, -0.01), v(0, 0.30, 0)], 0.012, false, 16, 6);
    const cargo = sphere(root, gelMaterial(cargoHex, { opacity: 0.74, emissive: cargoHex, emissiveIntensity: 0.28, iridescence: 0.45 }), 0.105, 0.095, 0.095, 0, 0.40, 0, 14);
    const atpSpark = sphere(root, glow('#82ffbe', 1.2), 0.024, 0.024, 0.024, 0, 0.04, 0.04, 8);
    return { root, footL, footR, legL, legR, cargo, atpSpark };
  }
  const kinesin = makeWalker('#5cffca', '#82f5e6', '#ffd068');
  const dynein = makeWalker('#ff8ac4', '#c99eff', '#94b4ff');

  // --- C. HERO F-ACTIN MICROFILAMENT (~7 nm): Double-stranded right-handed helix + Arp2/3 70° branch! ---
  const actinGroup = group(parent, 0.16, -0.34, 0.92);
  const actA = proteinMaterial('#f5748e', { emissive: '#94223a', emissiveIntensity: 0.28, clearcoat: 0.86 });
  const actB = proteinMaterial('#ffab8a', { emissive: '#a84824', emissiveIntensity: 0.28, clearcoat: 0.86 });
  const actinLen = 28;
  const actInstA = instances(actinGroup, new T.SphereGeometry(0.018, 8, 6), actA, actinLen);
  const actInstB = instances(actinGroup, new T.SphereGeometry(0.018, 8, 6), actB, actinLen);
  const putActA = instanceUpdater(actInstA);
  const putActB = instanceUpdater(actInstB);
  for (let i = 0; i < actinLen; i++) {
    const x = -0.58 + i * 0.042;
    const a = i * 0.54;
    putActA(i, x, Math.cos(a) * 0.021, Math.sin(a) * 0.021);
    putActB(i, x, Math.cos(a + Math.PI) * 0.021, Math.sin(a + Math.PI) * 0.021);
  }
  actInstA.instanceMatrix.needsUpdate = actInstB.instanceMatrix.needsUpdate = true;
  // Sculpted Arp2/3 Nucleating Complex spawning a 70° actin daughter branch!
  const arpMat = proteinMaterial('#ffd268', { emissive: '#9c6614', emissiveIntensity: 0.42, clearcoat: 0.9 });
  const arp = sphere(actinGroup, arpMat, 0.044, 0.036, 0.036, -0.02, 0.024, 0.015, 12);
  const branch = group(actinGroup, -0.02, 0.024, 0.015);
  branch.rotation.z = 1.22; // authentic 70° Arp2/3 branching angle!
  for (let i = 0; i < 10; i++) {
    const bx = 0.04 + i * 0.038;
    const ba = i * 0.58;
    sphere(branch, i % 2 ? actA : actB, 0.016, 0.016, 0.016, bx, Math.cos(ba) * 0.018, Math.sin(ba) * 0.018, 7);
  }
  createAnchor(actinGroup, anchors, 'cyto_skel_actin', 0.02, 0.08, 0.06);

  // --- D. HERO INTERMEDIATE FILAMENT (~10 nm): 8-strand woven rope cable (Keratin/Vimentin — apolar!) ---
  const interGroup = group(parent, 0.20, -0.66, 0.88);
  const ifMatA = proteinMaterial('#b48ef5', { emissive: '#58349e', emissiveIntensity: 0.28, clearcoat: 0.8 });
  const ifMatB = proteinMaterial('#e8c47a', { emissive: '#8f641c', emissiveIntensity: 0.26, clearcoat: 0.8 });
  for (let s = 0; s < 4; s++) {
    const ph = (s / 4) * tau;
    const pts = Array.from({ length: 24 }, (_, j) => {
      const u = j / 23;
      const x = -0.62 + u * 1.24;
      const a = u * tau * 3.5 + ph;
      return v(x, Math.cos(a) * 0.028, Math.sin(a) * 0.028);
    });
    tube(interGroup, s % 2 ? ifMatA : ifMatB, pts, 0.013, false, 36, 6);
  }
  createAnchor(interGroup, anchors, 'cyto_skel_inter', 0, 0.02, 0.06);

  // Contextual 3D micro-tags
  const tagMT = addTag(mtGroup, 'Microtúbulo (~25 nm) · 13 protofilamentos α/β · (−) → (+)', 0.05, 0.28, 0.14, '#7ceeff', '#dffaff', 0.135);
  const tagKin = addTag(mtGroup, 'Cinesina (caminha → +) · Dineína (← −) · ATP', -0.04, 0.62, 0.16, '#5cffca', '#dcfff2', 0.135);
  const tagAct = addTag(actinGroup, 'F-Actina (~7 nm) · Dupla hélice + ramo Arp2/3 (70°)', 0.06, 0.34, 0.14, '#ff94a8', '#ffe4ea', 0.135);
  const tagIF = addTag(interGroup, 'Filamento intermediário (~10 nm) · Cabo de tração apolar', 0.02, 0.22, 0.14, '#c4a6ff', '#f0e8ff', 0.135);

  updaters.push((t, _dt, activeKey, activeAnim) => {
    const isSkel = activeKey === 'cytoskeleton';
    const isTrack = activeAnim === 'skel_track';
    const isMotors = activeAnim === 'skel_motors';
    const isActin = activeAnim === 'skel_actin';
    const isInter = activeAnim === 'skel_intermediate';

    mtGroup.visible = isSkel || isTrack || isMotors || isActin || isInter;
    actinGroup.visible = isSkel || isActin || isInter || isTrack || isMotors;
    interGroup.visible = isSkel || isInter || isActin || isTrack || isMotors;

    tagMT.visible = isTrack;
    tagKin.visible = isMotors;
    tagAct.visible = isActin;
    tagIF.visible = isInter;

    // Dynamic instability curling on microtubule (+) tip
    const curlWave = 0.5 + 0.5 * Math.sin(t * (isTrack ? 2.8 : 1.2));
    for (const c of curls) {
      c.grp.rotation.z = (isTrack ? 0.12 : 0.04) + curlWave * (isTrack ? 0.48 : 0.18);
    }

    // Hand-over-hand stepping animation for Kinesin (→ +X) and Dynein (→ -X)!
    const walkK = ((t * (isMotors ? 0.24 : 0.1)) % 1);
    const kx = -0.62 + walkK * 1.24;
    const stepK = t * (isMotors ? 9.5 : 4.2);
    kinesin.root.position.set(kx, mtRadius + 0.008, 0.01);
    const liftL = Math.max(0, Math.sin(stepK));
    const liftR = Math.max(0, -Math.sin(stepK));
    kinesin.footL.position.set(Math.cos(stepK) * 0.042, 0.022 + liftL * 0.036, 0.015);
    kinesin.footR.position.set(-Math.cos(stepK) * 0.042, 0.022 + liftR * 0.036, -0.015);
    kinesin.atpSpark.visible = isMotors;
    kinesin.atpSpark.scale.setScalar(0.5 + Math.abs(Math.sin(stepK)) * 0.9);

    const walkD = ((t * (isMotors ? 0.21 : 0.09) + 0.5) % 1);
    const dx = 0.62 - walkD * 1.24;
    const stepD = t * (isMotors ? 8.6 : 3.8);
    dynein.root.position.set(dx, -mtRadius - 0.008, 0.01);
    dynein.root.rotation.z = Math.PI;
    dynein.footL.position.set(Math.cos(stepD) * 0.04, 0.022 + Math.max(0, Math.sin(stepD)) * 0.034, 0.015);
    dynein.footR.position.set(-Math.cos(stepD) * 0.04, 0.022 + Math.max(0, -Math.sin(stepD)) * 0.034, -0.015);
    dynein.atpSpark.visible = isMotors;
    dynein.atpSpark.scale.setScalar(0.5 + Math.abs(Math.cos(stepD)) * 0.9);

    // Subtle mechanical tensile flex on Intermediate Filament + Arp2/3 branch pulse
    arp.scale.setScalar(isActin ? 1 + Math.sin(t * 4) * 0.14 : 1);
    branch.scale.setScalar(isActin ? 0.95 + Math.sin(t * 2.4) * 0.1 : 1);
    interGroup.scale.x = isInter ? 1 + Math.sin(t * 2.8) * 0.075 : 1;
  });
  return updaters;
}

// ============================================================================
// 8. PAREDE CELULAR (VEGETAL: Celulose/Hemicelulose/Pectina/CesA/Plasmodesmo
//                    × BACTERIANA: Peptidoglicano NAM-NAG/Pontes peptídicas/Porinas)
// ============================================================================
export function attachWallMicro(parent, type, shellPoint, cutStart, cutArc, anchors) {
  const updaters = [];
  const phiEdge = cutStart + cutArc;
  const pt = shellPoint(type, 1.25, phiEdge, 1.068);
  const out = shellPoint(type, 1.25, phiEdge, 1.12).sub(pt).normalize();
  const patch = group(parent, pt.x, pt.y, pt.z);
  patch.quaternion.setFromUnitVectors(v(0, 1, 0), out);

  createAnchor(parent, anchors, 'wall_overview', pt.x * 0.55, pt.y + 0.5, pt.z * 0.55);
  createAnchor(patch, anchors, 'wall_fibrils', 0, 0.04, 0);
  createAnchor(patch, anchors, 'wall_synth', -0.22, -0.04, 0.04);
  createAnchor(patch, anchors, 'wall_channels', 0.24, 0.03, 0.06);

  if (type === 'plant') {
    // --- PLANT CELL WALL ARCHITECTURE ---
    // 1. Middle Lamella (golden Ca2+-pectin adhesive upper cap) + translucent pectin hydrogel bed
    box(patch, gelMaterial('#e6d268', { opacity: 0.44, iridescence: 0.3 }), 0.88, 0.036, 0.64, 0, 0.135, 0);
    box(patch, gelMaterial('#68d886', { opacity: 0.28, iridescence: 0.35 }), 0.88, 0.14, 0.64, 0, 0.045, 0);

    // 2. Crisscrossed multi-lamellar Cellulose Microfibrils + amber Hemicellulose cross-links!
    const celMat = proteinMaterial('#7cf078', { emissive: '#26782a', emissiveIntensity: 0.26, clearcoat: 0.8 });
    const hemiMat = proteinMaterial('#f5c964', { emissive: '#946218', emissiveIntensity: 0.3, clearcoat: 0.72 });
    for (let i = -3; i <= 3; i++) {
      // Upper oriented microfibril bundle
      tube(patch, celMat, [v(-0.42, 0.088, i * 0.082), v(0, 0.094, i * 0.082 + 0.025), v(0.42, 0.086, i * 0.082)], 0.018, false, 16, 7);
      // Lower orthogonal microfibril bundle
      tube(patch, celMat, [v(i * 0.11, 0.015, -0.28), v(i * 0.11 + 0.03, 0.02, 0), v(i * 0.11, 0.012, 0.28)], 0.017, false, 16, 7);
      // Flexible Hemicellulose tethers linking adjacent cellulose cables
      if (i < 3) {
        tube(patch, hemiMat, [v(i * 0.11, 0.025, 0.05), v(i * 0.11 + 0.055, 0.056, 0.02), v((i + 1) * 0.11, 0.086, 0.08)], 0.008, false, 10, 5);
      }
    }

    // 3. Plasma-membrane Cellulose Synthase Rosette (CesA hexamer) spinning nascent microfibril!
    const cesGroup = group(patch, -0.24, -0.075, 0.04);
    const cesMat = proteinMaterial('#68f0d8', { emissive: '#1e8a74', emissiveIntensity: 0.44, clearcoat: 0.9 });
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * tau;
      sphere(cesGroup, cesMat, 0.026, 0.022, 0.026, Math.cos(a) * 0.044, 0, Math.sin(a) * 0.044, 9);
    }
    const spunFibril = cylinder(cesGroup, glow('#9eff8a', 0.85), 0.015, 0.015, 0.22, 0, 0.10, 0, 8);
    // Underlying cortical microtubule rail guiding CesA rosette!
    cylinder(patch, proteinMaterial('#5ce0f5', { clearcoat: 0.8 }), 0.018, 0.018, 0.68, -0.24, -0.125, 0.04, 10).rotation.z = Math.PI / 2;

    // 4. Hourglass Plasmodesma lined with membrane + central ER Desmotubule + callose neck ring!
    const plasmo = group(patch, 0.25, 0.03, 0.06);
    lathe(plasmo, gelMaterial('#6ef2d6', { opacity: 0.56, emissive: '#1e8570', emissiveIntensity: 0.35 }), [
      [0.082, -0.14], [0.052, -0.06], [0.042, 0], [0.052, 0.06], [0.082, 0.14]
    ], 18);
    cylinder(plasmo, proteinMaterial('#ffe07d', { emissive: '#a87218', emissiveIntensity: 0.45 }), 0.016, 0.016, 0.30, 0, 0, 0, 10); // ER Desmotubule!
    torus(plasmo, glow('#d4a8ff', 0.72), 0.068, 0.014, 0, 0.12, 0).rotation.x = Math.PI / 2; // Callose collar!
    const flux = instances(plasmo, new T.SphereGeometry(0.018, 8, 6), glow('#a2ffe6', 1.05), 8, true);
    const putFlux = instanceUpdater(flux);

    const tagFib = addTag(patch, 'Celulose + Hemicelulose + Pectina / Lamela média', 0, 0.30, 0.06, '#7cf078', '#e4ffe2', 0.13);
    const tagCes = addTag(patch, 'Roseta Celulose Sintase (CesA) sobre microtúbulo', -0.24, 0.24, 0.14, '#68f0d8', '#dcfff8', 0.13);
    const tagPlas = addTag(patch, 'Plasmodesmo + Desmotúbulo (RE) · Simplasto', 0.26, 0.28, 0.14, '#ffe07d', '#fff6d4', 0.13);

    updaters.push((t, _dt, _key, activeAnim) => {
      const isFib = activeAnim === 'wall_fibrils';
      const isSyn = activeAnim === 'wall_synth';
      const isCh = activeAnim === 'wall_channels';

      tagFib.visible = isFib;
      tagCes.visible = isSyn;
      tagPlas.visible = isCh;

      celMat.emissiveIntensity = isFib ? 0.62 + Math.sin(t * 4.5) * 0.2 : 0.24;
      cesGroup.position.x = -0.24 + Math.sin(t * (isSyn ? 1.8 : 0.6)) * 0.16;
      cesGroup.rotation.y = t * (isSyn ? 2.4 : 0.6);
      spunFibril.scale.y = 0.7 + Math.sin(t * 3) * 0.25;

      flux.visible = isCh;
      if (isCh) {
        for (let i = 0; i < flux.count; i++) {
          const p = (t * 0.62 + i / flux.count) % 1;
          const a = i * 2.1 + t * 2;
          putFlux(i, Math.cos(a) * 0.026, -0.18 + p * 0.36, Math.sin(a) * 0.026, Math.sin(p * Math.PI) * 1.15);
        }
        flux.instanceMatrix.needsUpdate = true;
      }
    });
  } else {
    // --- BACTERIAL CELL WALL ARCHITECTURE (PEPTIDOGLYCAN / MUREIN) ---
    // 1. Alternating NAM (gold) & NAG (warm amber) glycan backbone chains + glowing tetrapeptide cross-bridges!
    const namMat = proteinMaterial('#ffd268', { emissive: '#9c6818', emissiveIntensity: 0.3, clearcoat: 0.85 });
    const nagMat = proteinMaterial('#e89448', { emissive: '#8f4414', emissiveIntensity: 0.26, clearcoat: 0.85 });
    const pepMat = proteinMaterial('#ff7aa8', { emissive: '#a82252', emissiveIntensity: 0.42, clearcoat: 0.88 });
    const teicMat = proteinMaterial('#88e8ff', { emissive: '#227a96', emissiveIntensity: 0.35, clearcoat: 0.85 });

    const glycanLayers = [0.02, 0.095];
    for (const ly of glycanLayers) {
      for (let row = -2; row <= 2; row++) {
        const rz = row * 0.105;
        for (let col = -3; col <= 3; col++) {
          const cx = col * 0.11;
          sphere(patch, (col + row) % 2 === 0 ? namMat : nagMat, 0.036, 0.028, 0.032, cx, ly, rz, 10);
          // Tetrapeptide cross-links bridging neighboring glycan chains (penicillin target!)
          if (row < 2 && col % 2 === 0) {
            rod(patch, pepMat, v(cx, ly, rz + 0.028), v(cx, ly, rz + 0.078), 0.011, 7);
          }
        }
      }
    }
    // Vertical Teichoic / Lipoteichoic acid anchors threading through peptidoglycan mesh!
    for (const [tx, tz] of [[-0.28, -0.05], [0.02, 0.12], [-0.14, 0.16]]) {
      tube(patch, teicMat, [v(tx, -0.06, tz), v(tx + 0.02, 0.04, tz), v(tx - 0.01, 0.15, tz)], 0.014, false, 14, 7);
    }

    // 2. PBP Transpeptidase Enzyme + Beta-lactam (Penicillin) antibiotic docking highlight!
    const pbpGroup = group(patch, -0.22, 0.09, 0.04);
    const pbpMat = proteinMaterial('#9c7cf5', { emissive: '#4d32a8', emissiveIntensity: 0.42, clearcoat: 0.88 });
    mesh(pbpGroup, organicDisplace(new T.SphereGeometry(0.062, 12, 10), 0.14, 4, 3), pbpMat);
    const betaLactam = box(pbpGroup, glow('#ff5278', 1.1), 0.052, 0.026, 0.052, 0, 0.12, 0);

    // 3. Trimeric β-barrel Porin Channel conducting solutes across envelope!
    const porinGrp = group(patch, 0.25, 0.04, 0.06);
    const porinMat = proteinMaterial('#68f0d4', { emissive: '#1e8a72', emissiveIntensity: 0.4, clearcoat: 0.9 });
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * tau;
      lathe(porinGrp, porinMat, poreProfile, 12, Math.cos(a) * 0.048, 0, Math.sin(a) * 0.048);
    }
    const flux = instances(porinGrp, new T.SphereGeometry(0.018, 8, 6), glow('#a2ffe6', 1.05), 9, true);
    const putFlux = instanceUpdater(flux);

    const tagPep = addTag(patch, 'Malha de Peptidoglicano (NAM–NAG + pontes peptídicas)', 0, 0.28, 0.06, '#ffd268', '#fff5d4', 0.13);
    const tagPbp = addTag(patch, 'Transpeptidase (PBP) · Alvo de β-lactâmicos (Penicilina)', -0.22, 0.28, 0.14, '#ff7aa8', '#ffe4ee', 0.13);
    const tagPor = addTag(patch, 'Porinas β-barril + Ácidos teicoicos (proteção osmótica)', 0.26, 0.28, 0.14, '#68f0d4', '#dcfff8', 0.13);

    updaters.push((t, _dt, _key, activeAnim) => {
      const isFib = activeAnim === 'wall_fibrils';
      const isSyn = activeAnim === 'wall_synth';
      const isCh = activeAnim === 'wall_channels';

      tagPep.visible = isFib;
      tagPbp.visible = isSyn;
      tagPor.visible = isCh;

      pepMat.emissiveIntensity = isFib || isSyn ? 0.85 + Math.sin(t * 5) * 0.22 : 0.32;
      betaLactam.visible = isSyn;
      if (isSyn) {
        const dock = 0.5 + 0.5 * Math.sin(t * 2.8);
        betaLactam.position.y = 0.075 + dock * 0.085;
        betaLactam.rotation.y = t * 2;
      }

      flux.visible = isCh;
      if (isCh) {
        for (let i = 0; i < flux.count; i++) {
          const p = (t * 0.65 + i / flux.count) % 1;
          const a = ((i % 3) / 3) * tau;
          putFlux(i, Math.cos(a) * 0.048, -0.14 + p * 0.28, Math.sin(a) * 0.048, Math.sin(p * Math.PI) * 1.15);
        }
        flux.instanceMatrix.needsUpdate = true;
      }
    });
  }
  return updaters;
}

// ============================================================================
// 9. CÁPSULA BACTERIANA (EXOPOLISSACARÍDEOS EPS · HIDRATAÇÃO · ANTIFAGOCITOSE · BIOFILME)
// ============================================================================
export function attachCapsuleMicro(capObj, shellPoint, cutStart, cutArc, anchors) {
  const updaters = [];
  const phiEdge = cutStart + cutArc;
  const cp = shellPoint('bacteria', 1.32, phiEdge, 1.145);
  const out = shellPoint('bacteria', 1.32, phiEdge, 1.22).sub(cp).normalize();
  const patch = group(capObj, cp.x, cp.y, cp.z);
  patch.quaternion.setFromUnitVectors(v(0, 1, 0), out);

  createAnchor(capObj, anchors, 'capsule_overview', cp.x * 0.5, cp.y + 0.4, cp.z * 0.5);
  createAnchor(patch, anchors, 'capsule_matrix', 0, 0.10, 0);
  createAnchor(patch, anchors, 'capsule_shield', 0.04, 0.26, 0.06);
  createAnchor(patch, anchors, 'capsule_adhesion', -0.05, 0.16, -0.14);

  // 1. Thick Iridescent Hydrated Polysaccharide Hydrogel Cushion + Radiating EPS Polymer Brushes!
  const epsCushion = mesh(patch, organicDisplace(new T.CylinderGeometry(0.42, 0.46, 0.16, 22, 4), 0.08, 6, 4),
    gelMaterial('#68e4f5', { opacity: 0.44, iridescence: 0.55, clearcoat: 1.0, roughness: 0.06 }), 0, 0.08, 0);
  const brushMat = proteinMaterial('#96f5ff', { emissive: '#228fa8', emissiveIntensity: 0.34, clearcoat: 0.85 });
  const brushes = [];
  for (let i = 0; i < 16; i++) {
    const a = i * 2.399;
    const rad = 0.08 + (i % 4) * 0.085;
    const bx = Math.cos(a) * rad, bz = Math.sin(a) * rad;
    const b = tube(patch, brushMat, [
      v(bx, 0.01, bz), v(bx + Math.cos(a) * 0.03, 0.11, bz + Math.sin(a) * 0.03), v(bx - Math.sin(a) * 0.02, 0.20, bz + Math.cos(a) * 0.02)
    ], 0.009, false, 12, 6);
    brushes.push({ mesh: b, phase: i * 0.7 });
  }
  // Shimmering retained H2O droplets locked inside the hydrophilic EPS matrix!
  const waterDrops = instances(patch, new T.SphereGeometry(0.018, 8, 6), glow('#a6f8ff', 1.0), 18, true);
  const putWater = instanceUpdater(waterDrops);

  // 2. Antiphagocytic Defense: Y-shaped Opsonizing Antibodies & Macrophage Pseudopod Lobes slipping off!
  const shieldGroup = group(patch, 0.04, 0.28, 0.04);
  const abMat = proteinMaterial('#ff88aa', { emissive: '#b82856', emissiveIntensity: 0.48, clearcoat: 0.88 });
  const antibodies = [];
  for (let i = 0; i < 4; i++) {
    const ab = group(shieldGroup);
    // Authentic Y-shaped IgG antibody geometry
    cylinder(ab, abMat, 0.011, 0.011, 0.065, 0, -0.025, 0, 7);
    const arm1 = cylinder(ab, abMat, 0.010, 0.010, 0.055, -0.024, 0.026, 0, 7);
    arm1.rotation.z = 0.65;
    const arm2 = cylinder(ab, abMat, 0.010, 0.010, 0.055, 0.024, 0.026, 0, 7);
    arm2.rotation.z = -0.65;
    antibodies.push({ grp: ab, phase: i * 0.25, ang: (i / 4) * tau });
  }
  // Macrophage pseudopod gel lobe trying to grab & bouncing back!
  const macroLobe = mesh(shieldGroup, organicDisplace(new T.SphereGeometry(0.18, 16, 12), 0.12, 4, 9),
    gelMaterial('#ff96b4', { opacity: 0.56, emissive: '#a83458', emissiveIntensity: 0.34, iridescence: 0.4 }), 0, 0.36, 0);
  macroLobe.scale.set(1.25, 0.65, 1.15);
  const repelRingMat = glow('#82f8ff', 1.1, { transparent: true, opacity: 0, depthWrite: false });
  const repelRing = torus(shieldGroup, repelRingMat, 0.22, 0.014, 0, -0.04, 0);
  repelRing.rotation.x = Math.PI / 2;

  // 3. Adhesive Fimbriae / Pili + Terminal Adhesin Tips gripping a Biofilm / Host Surface Plaque!
  const adhGroup = group(patch, -0.06, 0.06, -0.14);
  const fimMat = proteinMaterial('#ffd270', { emissive: '#946218', emissiveIntensity: 0.32, clearcoat: 0.82 });
  const tipMat = glow('#ff9ec4', 0.9);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * tau;
    const fx = Math.cos(a) * 0.16, fz = Math.sin(a) * 0.16;
    tube(adhGroup, fimMat, [v(fx * 0.5, 0, fz * 0.5), v(fx, 0.16, fz), v(fx * 1.18, 0.30, fz * 1.18)], 0.007, false, 12, 5);
    sphere(adhGroup, tipMat, 0.018, 0.018, 0.018, fx * 1.18, 0.30, fz * 1.18, 8);
  }
  const biofilmPlaque = mesh(adhGroup, organicDisplace(new T.CylinderGeometry(0.32, 0.34, 0.06, 18), 0.08, 5, 2),
    gelMaterial('#e8b868', { opacity: 0.52, iridescence: 0.35 }), 0, 0.34, 0);

  const tagMat = addTag(patch, 'Matriz EPS hidratada (proteção contra dessecação)', 0, 0.34, 0.12, '#96f5ff', '#e0fbff', 0.13);
  const tagSh = addTag(patch, 'Barreira antifagocítica (desvia anticorpos e macrófago)', 0.04, 0.68, 0.12, '#ff88aa', '#ffe4ec', 0.13);
  const tagAdh = addTag(patch, 'Fímbrias + adesinas ancoradas em biofilme', -0.06, 0.52, -0.10, '#ffd270', '#fff4d4', 0.13);

  updaters.push((t, _dt, activeKey, activeAnim) => {
    const isMat = activeAnim === 'capsule_matrix';
    const isSh = activeAnim === 'capsule_shield';
    const isAdh = activeAnim === 'capsule_adhesion';

    tagMat.visible = isMat;
    tagSh.visible = isSh;
    tagAdh.visible = isAdh;

    epsCushion.scale.y = 1 + Math.sin(t * 2.2) * 0.06;
    for (const b of brushes) {
      b.mesh.rotation.z = Math.sin(t * 2.4 + b.phase) * 0.08;
    }

    waterDrops.visible = isMat || activeKey === 'capsule';
    if (waterDrops.visible) {
      for (let i = 0; i < waterDrops.count; i++) {
        const a = i * 2.399 + t * 0.35;
        const r = 0.10 + (i % 4) * 0.085;
        const y = 0.06 + ((i % 3) * 0.045) + Math.sin(t * 2.4 + i) * 0.022;
        putWater(i, Math.cos(a) * r, y, Math.sin(a) * r, isMat ? 1.15 : 0.72);
      }
      waterDrops.instanceMatrix.needsUpdate = true;
    }

    shieldGroup.visible = isSh;
    if (isSh) {
      const cyc = (t * 0.52) % 1;
      // Macrophage lobe approaches, hits slick capsule boundary, and slips back!
      const bounce = Math.abs(cyc - 0.5) * 2;
      macroLobe.position.y = 0.18 + bounce * bounce * 0.36;
      macroLobe.scale.set(1.25 + (1 - bounce) * 0.25, 0.65 - (1 - bounce) * 0.15, 1.15 + (1 - bounce) * 0.22);
      const hit = Math.max(0, 1 - bounce * 3.2);
      repelRingMat.opacity = hit * 0.95;
      repelRing.scale.setScalar(0.65 + (1 - hit) * 0.75);

      for (const ab of antibodies) {
        const p = (t * 0.58 + ab.phase) % 1;
        const b = Math.abs(p - 0.5) * 2;
        const r = 0.16 + b * 0.18;
        ab.grp.position.set(Math.cos(ab.ang + p * 1.4) * r, 0.05 + b * b * 0.38, Math.sin(ab.ang + p * 1.4) * r);
        ab.grp.rotation.set(Math.PI + b * 0.8, ab.ang, b * 0.5);
      }
    }

    adhGroup.visible = isAdh || activeKey === 'capsule';
    biofilmPlaque.visible = isAdh;
    if (isAdh) {
      biofilmPlaque.position.y = 0.33 + Math.sin(t * 2.2) * 0.015;
    }
  });
  return updaters;
}
