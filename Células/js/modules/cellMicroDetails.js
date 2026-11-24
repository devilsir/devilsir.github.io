import * as T from 'three';
import {
  v, group, mesh, box, sphere, cylinder, capsule, lathe, torus, tube, rod,
  material, glow, instances, instanceUpdater, labelSprite,
  membraneMaterial, gelMaterial, proteinMaterial, organelleMaterial,
  organicDisplace, tintGeometry, mergeGeos
} from '../core/geometry.js';

const tau = Math.PI * 2;

export function createAnchor(parent, anchors, id, x = 0, y = 0, z = 0) {
  const a = group(parent, x, y, z);
  anchors.set(id, a);
  return a;
}

// Compound molecular geometry builders (high-polish cryo-EM sculptures, 1 draw call per InstancedMesh!)
function makeWaterGeo() {
  const o = new T.SphereGeometry(0.019, 10, 8);
  const h1 = new T.SphereGeometry(0.012, 8, 6);
  h1.translate(0.017, 0.012, 0.004);
  const h2 = new T.SphereGeometry(0.012, 8, 6);
  h2.translate(-0.017, 0.012, -0.004);
  return mergeGeos([o, h1, h2]);
}

function makeDiatomicGeo() {
  const a = new T.SphereGeometry(0.017, 10, 8);
  a.translate(-0.012, 0, 0);
  const b = new T.SphereGeometry(0.017, 10, 8);
  b.translate(0.012, 0, 0);
  return mergeGeos([a, b]);
}

function makeHydratedSoluteGeo() {
  const core = organicDisplace(new T.IcosahedronGeometry(0.033, 2), 0.16, 7.5, 4);
  const p1 = new T.SphereGeometry(0.015, 7, 5); p1.translate(0.032, 0.014, 0.01);
  const p2 = new T.SphereGeometry(0.014, 7, 5); p2.translate(-0.028, -0.018, 0.014);
  const p3 = new T.SphereGeometry(0.014, 7, 5); p3.translate(0.008, -0.026, -0.024);
  return mergeGeos([core, p1, p2, p3]);
}

function makeBulkyTrilobeGeo() {
  const parts = [organicDisplace(new T.SphereGeometry(0.03, 10, 8), 0.12, 6, 2)];
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * tau;
    const lobe = new T.SphereGeometry(0.026, 9, 7);
    lobe.translate(Math.cos(a) * 0.032, -0.006, Math.sin(a) * 0.032);
    parts.push(lobe);
  }
  const cap = new T.SphereGeometry(0.022, 8, 6);
  cap.translate(0, 0.03, 0);
  parts.push(cap);
  return mergeGeos(parts);
}

function makeBranchedRejectGeo() {
  const parts = [organicDisplace(new T.SphereGeometry(0.028, 10, 8), 0.14, 7, 5)];
  const dirs = [[1, 0.8, 0.6], [-1, 0.7, -0.5], [0.4, -0.9, -0.9], [-0.5, -0.8, 0.9]];
  for (const [dx, dy, dz] of dirs) {
    const len = Math.hypot(dx, dy, dz);
    const arm = new T.SphereGeometry(0.019, 8, 6);
    arm.translate((dx / len) * 0.038, (dy / len) * 0.038, (dz / len) * 0.038);
    parts.push(arm);
  }
  return mergeGeos(parts);
}

function makeSterolGeo() {
  // Sculpted 4-fused-ring sterol skeleton (3 hexagonal + 1 pentagonal planar rings + aliphatic tail + polar -OH bead)
  const parts = [];
  const rings = [[0, 0.044, 0, 0.017], [0.008, 0.018, 0.004, 0.018], [-0.006, -0.01, -0.003, 0.017], [0.007, -0.036, 0.002, 0.015]];
  for (const [rx, ry, rz, rad] of rings) {
    const ring = new T.TorusGeometry(rad, 0.0072, 6, 8);
    ring.scale(1.15, 0.95, 0.55);
    ring.translate(rx, ry, rz);
    parts.push(ring);
  }
  const oh = new T.SphereGeometry(0.013, 8, 6);
  oh.translate(-0.004, 0.068, 0);
  parts.push(oh);
  const tail = new T.TubeGeometry(new T.CatmullRomCurve3([v(0.005, -0.048, 0), v(-0.006, -0.072, 0.005), v(0.009, -0.094, -0.004)]), 8, 0.0055, 5, false);
  parts.push(tail);
  return mergeGeos(parts);
}

function buildGlucoseSculpture(parent) {
  const g = group(parent, 0, 0.3, 0);
  const ringMat = proteinMaterial('#7ef59b', { emissive: '#2fb85c', emissiveIntensity: 0.42, clearcoat: 0.95, iridescence: 0.25 });
  const ohMat = glow('#d9ffe6', 0.72);
  const coreMat = gelMaterial('#9effb8', { opacity: 0.45 });
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * tau;
    const py = i % 2 === 0 ? 0.008 : -0.008;
    const pt = v(Math.cos(a) * 0.034, py, Math.sin(a) * 0.034);
    pts.push(pt);
    mesh(g, new T.SphereGeometry(0.0155, 10, 8), i === 0 ? glow('#ff9c8a', 0.65) : ringMat, pt.x, pt.y, pt.z);
    if (i > 0) {
      mesh(g, new T.SphereGeometry(0.0095, 7, 5), ohMat, pt.x * 1.48, pt.y * 1.6, pt.z * 1.48);
    }
  }
  tube(g, ringMat, pts, 0.0065, true, 18, 6);
  mesh(g, new T.SphereGeometry(0.025, 10, 8), coreMat);
  return g;
}

function buildNucleotideSculpture(parent, phosphates, x, y, z) {
  const g = group(parent, x, y, z);
  const baseMat = proteinMaterial(phosphates === 3 ? '#5be8c8' : '#e6b85c', {
    emissive: phosphates === 3 ? '#1e9e7e' : '#966b18', emissiveIntensity: 0.48, clearcoat: 0.92
  });
  const phosMat = glow(phosphates === 3 ? '#8dffcc' : '#ffd875', 1.05);
  // Adenosine fused ring + ribose sugar bead
  mesh(g, organicDisplace(new T.SphereGeometry(0.024, 10, 8), 0.12, 5, 2), baseMat, -0.036, 0, 0).scale.set(1.25, 0.72, 0.9);
  mesh(g, new T.SphereGeometry(0.018, 9, 7), baseMat, -0.004, 0.006, 0.006);
  // Triphosphate (ATP) or Diphosphate (ADP) luminous pearl tail
  for (let i = 0; i < phosphates; i++) {
    const px = 0.02 + i * 0.024;
    const py = (i % 2 === 0 ? -0.004 : 0.009);
    mesh(g, new T.SphereGeometry(0.0155, 10, 8), phosMat, px, py, 0);
  }
  return g;
}

function buildPhosphateIon(parent, x, y, z) {
  const g = group(parent, x, y, z);
  const pMat = glow('#ff75bc', 1.15);
  const oMat = proteinMaterial('#ffd6ec', { emissive: '#ff66b5', emissiveIntensity: 0.55, clearcoat: 0.95 });
  mesh(g, new T.SphereGeometry(0.019, 10, 8), pMat);
  for (const [ox, oy, oz] of [[0.018, 0.012, 0.01], [-0.018, 0.012, -0.01], [0.008, -0.018, -0.012], [-0.008, -0.016, 0.014]]) {
    mesh(g, new T.SphereGeometry(0.011, 7, 5), oMat, ox, oy, oz);
  }
  return g;
}

// Dynamic parametric polar membrane surface (deforms smoothly in real time: pseudopods, Ω-invaginations, neck rupture & healing!)
function makeMorphMembrane(parent, mat, outerR = 0.28, rings = 22, segs = 30) {
  const stride = segs + 1;
  const count = (rings + 1) * stride;
  const positions = new Float32Array(count * 3);
  const uvs = new Float32Array(count * 2);
  const indices = [];
  for (let ir = 0; ir <= rings; ir++) {
    const u = ir / rings;
    for (let is = 0; is <= segs; is++) {
      const idx = ir * stride + is;
      const th = (is / segs) * tau;
      const r = Math.max(0.0006, u * outerR);
      positions[idx * 3] = Math.cos(th) * r;
      positions[idx * 3 + 1] = 0;
      positions[idx * 3 + 2] = Math.sin(th) * r;
      uvs[idx * 2] = 0.5 + Math.cos(th) * u * 0.5;
      uvs[idx * 2 + 1] = 0.5 + Math.sin(th) * u * 0.5;
    }
  }
  for (let ir = 0; ir < rings; ir++) {
    for (let is = 0; is < segs; is++) {
      const a = ir * stride + is;
      const b = (ir + 1) * stride + is;
      const c = (ir + 1) * stride + is + 1;
      const d = ir * stride + is + 1;
      indices.push(a, b, d, b, c, d);
    }
  }
  const geo = new T.BufferGeometry();
  geo.setAttribute('position', new T.BufferAttribute(positions, 3));
  geo.setAttribute('uv', new T.BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  const item = mesh(parent, geo, mat);
  const posAttr = geo.attributes.position;
  const tmp = { r: 0, y: 0 };

  function update(profileFn) {
    for (let ir = 0; ir <= rings; ir++) {
      const u = ir / rings;
      for (let is = 0; is <= segs; is++) {
        const th = (is / segs) * tau;
        profileFn(u, th, tmp);
        const r = Math.max(0.0006, tmp.r);
        const idx = ir * stride + is;
        posAttr.setXYZ(idx, Math.cos(th) * r, tmp.y, Math.sin(th) * r);
      }
    }
    posAttr.needsUpdate = true;
    geo.computeVertexNormals();
  }
  return { mesh: item, geo, update };
}

// ============================================================================
// 1. MEMBRANE MICRO-ASSEMBLY: Sculpted Fluid Amphipathic Bilayer + Gelatinous
//    Bio-Fluid Strata + Aquaporin + Selective Channel (Active Rejection!)
//    + Curved Carrier + Multi-Domain Na+/K+ ATPase Pump + Endo & Exocytosis
// ============================================================================
export function attachMembraneMicro(parent, type, shellPoint, cutStart, cutArc, anchors, focusGroups = null) {
  const updaters = [];
  const phiEdge = cutStart + cutArc; // front-left cutaway edge facing viewer
  const thetaPatch = 1.48;
  const origin = shellPoint(type, thetaPatch, phiEdge, 1.0);
  const outward = shellPoint(type, thetaPatch, phiEdge, 1.05).sub(origin).normalize();
  const upRef = v(0, 1, 0);
  const tangentU = new T.Vector3().crossVectors(upRef, outward).normalize();
  const tangentV = new T.Vector3().crossVectors(outward, tangentU).normalize();

  const patch = group(parent, origin.x, origin.y, origin.z);
  const basis = new T.Matrix4().makeBasis(tangentU, outward, tangentV);
  patch.quaternion.setFromRotationMatrix(basis);

  createAnchor(parent, anchors, 'membrane_overview', origin.x * 0.55, origin.y + 0.6, origin.z * 0.55);
  createAnchor(patch, anchors, 'membrane_bilayer', -0.45, 0.0, 0.06);
  createAnchor(patch, anchors, 'membrane_passive', -0.48, 0.04, 0.04);
  createAnchor(patch, anchors, 'membrane_channel', 0.28, 0.04, 0.04);
  createAnchor(patch, anchors, 'membrane_pump', 0.86, 0.02, 0.04);
  const exoPt = shellPoint(type, 1.78, cutStart + 0.16, 0.99);
  createAnchor(parent, anchors, 'membrane_exocytosis', exoPt.x, exoPt.y, exoPt.z);

  // High-polish amphipathic phospholipid bilayer materials (glossy wet cryo-EM + gelatinous sheen)
  const headHex = type === 'plant' ? '#7cf7d5' : type === 'bacteria' ? '#82f5cb' : '#85f7ec';
  const headMat = proteinMaterial(headHex, {
    emissive: '#22878f', emissiveIntensity: 0.26, clearcoat: 1.0, clearcoatRoughness: 0.08, roughness: 0.14, iridescence: 0.34
  });
  const neckMat = proteinMaterial('#f2b974', { emissive: '#8f591c', emissiveIntensity: 0.18, roughness: 0.28, clearcoat: 0.72 });
  const tailMat = material('#28809c', { roughness: 0.38, clearcoat: 0.32 });
  const kinkTailMat = material('#4ec3de', { roughness: 0.3, clearcoat: 0.42 });
  const stabHex = type === 'bacteria' ? '#d4e872' : type === 'plant' ? '#dde366' : '#f7c55c';
  const cholMat = proteinMaterial(stabHex, { emissive: '#9c6818', emissiveIntensity: 0.28, clearcoat: 0.92, iridescence: 0.24 });
  const glycoStemMat = proteinMaterial(type === 'bacteria' ? '#7de89d' : '#74f0bc', {
    emissive: '#1e8a62', emissiveIntensity: 0.28, clearcoat: 0.88, iridescence: 0.25
  });
  const glycoTipMat = glow(type === 'bacteria' ? '#a6ffb8' : '#9cffd8', 0.56);

  // Organic rounded gelatinous hydrophobic lipid-core pillow (replaces flat box!)
  const pillowShape = new T.Shape();
  const pw = 1.02, pd = 0.20, pr = 0.08;
  pillowShape.moveTo(-pw + pr, -pd);
  pillowShape.lineTo(pw - pr, -pd);
  pillowShape.quadraticCurveTo(pw, -pd, pw, -pd + pr);
  pillowShape.lineTo(pw, pd - pr);
  pillowShape.quadraticCurveTo(pw, pd, pw - pr, pd);
  pillowShape.lineTo(-pw + pr, pd);
  pillowShape.quadraticCurveTo(-pw, pd, -pw, pd - pr);
  pillowShape.lineTo(-pw, -pd + pr);
  pillowShape.quadraticCurveTo(-pw, -pd, -pw + pr, -pd);
  const hydroGeo = new T.ExtrudeGeometry(pillowShape, {
    depth: 0.085, bevelEnabled: true, bevelThickness: 0.036, bevelSize: 0.032, bevelSegments: 4, curveSegments: 10
  });
  hydroGeo.rotateX(-Math.PI / 2);
  hydroGeo.translate(0.14, -0.042, 0);
  organicDisplace(hydroGeo, 0.032, 6.2, 3);
  const hydroBandMat = gelMaterial('#1a6f8c', { opacity: 0.28, iridescence: 0.46, emissive: '#114d63', emissiveIntensity: 0.22 });
  mesh(patch, hydroGeo, hydroBandMat);

  // Subtle glistening extracellular & cytosolic aqueous bio-fluid strata flanking the membrane
  const makeFluidWave = (yPos, col, seed) => {
    const fg = new T.PlaneGeometry(2.15, 0.48, 22, 6);
    fg.rotateX(-Math.PI / 2);
    const p = fg.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const fx = p.getX(i), fz = p.getZ(i);
      p.setY(i, Math.sin(fx * 5.2 + seed) * 0.016 + Math.cos(fz * 7.5 - seed) * 0.01);
    }
    fg.computeVertexNormals();
    return mesh(patch, fg, gelMaterial(col, { opacity: 0.13, iridescence: 0.42 }), 0.14, yPos, 0);
  };
  const extraFluidFilm = makeFluidWave(0.24, '#6de8f5', 1.2);
  const cytoFluidFilm = makeFluidWave(-0.24, '#36b5cc', 3.7);

  const cols = 19, rows = 4;
  const lipidSpecs = [];
  const headBatch = instances(patch, new T.SphereGeometry(0.036, 13, 10), headMat, cols * rows * 2, true);
  const neckBatch = instances(patch, new T.SphereGeometry(0.016, 8, 6), neckMat, cols * rows * 2, true);
  // Sinuous organic saturated hydrocarbon tail (replaces rigid straight cylinder!)
  const satTailGeo = new T.TubeGeometry(new T.CatmullRomCurve3([
    v(0, 0.056, 0), v(-0.007, 0.018, 0.004), v(0.005, -0.018, -0.004), v(-0.003, -0.054, 0)
  ]), 10, 0.0085, 6, false);
  const tailBatch = instances(patch, satTailGeo, tailMat, cols * rows * 2, true);
  // Real cis double-bond kinked unsaturated fatty-acid hydrocarbon chain with smooth molecular bend
  const kinkGeo = new T.TubeGeometry(new T.CatmullRomCurve3([
    v(0, 0.056, 0), v(0.004, 0.012, 0.003), v(0.018, -0.014, -0.004), v(0.031, -0.053, 0.003)
  ]), 12, 0.0085, 6, false);
  const kinkBatch = instances(patch, kinkGeo, kinkTailMat, cols * rows * 2, true);
  const putHead = instanceUpdater(headBatch);
  const putNeck = instanceUpdater(neckBatch);
  const putTail = instanceUpdater(tailBatch);
  const putKink = instanceUpdater(kinkBatch);

  let hIdx = 0;
  for (let ix = 0; ix < cols; ix++) {
    for (let iz = 0; iz < rows; iz++) {
      const lx = -0.82 + ix * 0.106;
      const lz = -0.165 + iz * 0.11;
      // Leave clean pockets for Aquaporin (-0.30), Selective Channel (0.14), Carrier (0.52), and Na+/K+ Pump (0.86)
      if (Math.hypot(lx + 0.3, lz - 0.04) < 0.125) continue;
      if (Math.hypot(lx - 0.14, lz - 0.04) < 0.17) continue;
      if (Math.hypot(lx - 0.52, lz - 0.04) < 0.16) continue;
      if (Math.hypot(lx - 0.86, lz - 0.04) < 0.17) continue;
      lipidSpecs.push({ lx, lz, idx: hIdx++, phase: ix * 0.62 + iz * 1.15 });
    }
  }
  headBatch.count = lipidSpecs.length * 2;
  neckBatch.count = lipidSpecs.length * 2;
  tailBatch.count = lipidSpecs.length * 2;
  kinkBatch.count = lipidSpecs.length * 2;

  // Sculpted 4-fused-ring fluidity stabilizers wedged inside hydrophobic core (Cholesterol / Phytosterols / Hopanoids!)
  const sterolGeo = makeSterolGeo();
  for (const [cx, cz, tilt] of [[-0.64, -0.05, 0.24], [-0.46, 0.09, -0.18], [-0.14, -0.07, 0.22], [0.34, -0.06, -0.2], [0.7, 0.08, 0.19]]) {
    const ch = mesh(patch, sterolGeo.clone(), cholMat, cx, 0.015, cz);
    ch.rotation.set(0.12, cx * 2.5, tilt);
  }
  sterolGeo.dispose();

  // Sculpted fluid-mosaic laterally drifting integral proteins (multi-helix bundle & hourglass beta-barrel!)
  const driftProtA = group(patch, -0.58, 0, -0.14);
  const driftMatA = proteinMaterial('#59b8f0', { emissive: '#1e6094', emissiveIntensity: 0.28, clearcoat: 0.92, iridescence: 0.24 });
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * tau;
    const hPts = Array.from({ length: 12 }, (_, j) => {
      const f = j / 11;
      const ang = a + f * 1.15;
      const rad = 0.028 + Math.abs(f - 0.5) * 0.024;
      return v(Math.cos(ang) * rad, -0.16 + f * 0.32, Math.sin(ang) * rad);
    });
    tube(driftProtA, driftMatA, hPts, 0.018, false, 16, 7);
  }
  mesh(driftProtA, organicDisplace(new T.SphereGeometry(0.052, 12, 10), 0.14, 5, 2), driftMatA, 0, 0.17, 0).scale.set(1.15, 0.72, 1.05);
  mesh(driftProtA, organicDisplace(new T.SphereGeometry(0.044, 10, 8), 0.12, 5, 4), driftMatA, 0, -0.165, 0).scale.set(1.05, 0.68, 1.0);

  const driftProtB = group(patch, 0.32, 0, -0.15);
  const driftMatB = proteinMaterial('#64deb8', { emissive: '#1d7a60', emissiveIntensity: 0.28, clearcoat: 0.9, iridescence: 0.26 });
  lathe(driftProtB, driftMatB, [
    [0.02, -0.16], [0.056, -0.145], [0.048, -0.075], [0.034, 0],
    [0.048, 0.075], [0.058, 0.145], [0.022, 0.16]
  ], 18);
  torus(driftProtB, glow('#a8ffe8', 0.68), 0.036, 0.009, 0, 0.155, 0).rotation.x = Math.PI / 2;

  // Sculpted coral-like branched glycocalyx / surface LPS glycoprotein antennas protruding into extracellular space (+Y)
  const antennas = [];
  const pedProfile = [[0.015, -0.02], [0.036, 0], [0.042, 0.028], [0.028, 0.052], [0.012, 0.062]];
  for (const [gx, gz] of [[-0.72, 0.06], [-0.42, -0.06], [0.34, -0.05], [1.04, 0.04]]) {
    const ant = group(patch, gx, 0.145, gz);
    // Integral glycoprotein pedestal dome
    lathe(ant, glycoStemMat, pedProfile, 12);
    const stem = [v(0, 0.05, 0), v(0.036, 0.13, 0.018), v(-0.018, 0.22, -0.018), v(0.046, 0.3, 0.026)];
    const br1 = [v(0.036, 0.13, 0.018), v(0.088, 0.175, 0.044), v(0.118, 0.225, 0.054)];
    const br2 = [v(-0.018, 0.22, -0.018), v(-0.072, 0.265, -0.038)];
    tube(ant, glycoStemMat, stem, 0.011, false, 16, 7);
    tube(ant, glycoStemMat, br1, 0.009, false, 10, 6);
    tube(ant, glycoStemMat, br2, 0.008, false, 8, 6);
    // Glossy hexose sugar-monomer rosette tips
    for (const tip of [stem[3], br1[2], br2[1]]) {
      mesh(ant, organicDisplace(new T.IcosahedronGeometry(0.024, 1), 0.14, 6, 3), glycoTipMat, tip.x, tip.y, tip.z);
      mesh(ant, new T.SphereGeometry(0.013, 8, 6), glycoStemMat, tip.x + 0.016, tip.y - 0.012, tip.z + 0.01);
    }
    antennas.push(ant);
  }

  // True triatomic H2O hydration shells dancing along polar heads & repelled by hydrophobic core!
  const waterGeo = makeWaterGeo();
  const waterShell = instances(patch, waterGeo, proteinMaterial('#70e0ff', {
    emissive: '#2ca4db', emissiveIntensity: 0.62, clearcoat: 1.0, roughness: 0.1, iridescence: 0.32
  }), 18, true);
  const putWShell = instanceUpdater(waterShell);

  // Contextual didactic micro-tags (only visible during their relevant Membrane guided step!)
  const addTag = (host, text, x, y, z, border = '#5cc8da', color = '#eef7fa', sc = 0.114, depthTest = false) => {
    const sp = labelSprite(text, { scale: sc, border, color, font: '700 26px system-ui, sans-serif', depthTest });
    sp.position.set(x, y, z);
    sp.renderOrder = 8;
    sp.visible = false;
    host.add(sp);
    return sp;
  };
  const stabLabel = type === 'bacteria' ? 'Hopanoides (fluidez)' : type === 'plant' ? 'Fitoesteróis (fluidez)' : 'Colesterol (fluidez)';
  const surfaceLabel = type === 'bacteria' ? 'Glicolipídios / LPS' : type === 'plant' ? 'Glicoproteínas' : 'Glicocálix';
  const tagExtra = addTag(patch, 'Meio extracelular (H₂O polar)', -0.46, 0.36, 0.12, '#7ef0e4');
  const tagCyto = addTag(patch, 'Citoplasma (H₂O polar)', -0.46, -0.34, 0.12, '#7ef0e4');
  const tagChol = addTag(patch, stabLabel, -0.44, -0.17, 0.25, stabHex, '#fff2c2', 0.102);
  const tagGlyco = addTag(patch, surfaceLabel, -0.68, 0.5, 0.12, '#8ff7c8', '#dbffec', 0.104);
  const tagDiff = addTag(patch, 'Difusão simples (O₂ / CO₂)', -0.68, 0.48, 0.1, '#ffd66e', '#fff0bf', 0.108);
  const tagOsmo = addTag(patch, 'Aquaporina · Osmose (H₂O)', -0.26, -0.38, 0.1, '#4cb8ff', '#d6f0ff', 0.108);
  const tagChan = addTag(patch, 'Canal seletivo', 0.06, 0.42, 0.14, '#6ef5ff', '#d9fcff', 0.112);
  const tagCarr = addTag(patch, 'Carreadora (muda forma)', 0.54, 0.33, 0.14, '#3ec9a7', '#d1ffef', 0.106);
  const tagNa = addTag(patch, '3 Na⁺ → fora', 1.06, 0.28, 0.15, '#ffd25a', '#fff0bf', 0.11);
  const tagK = addTag(patch, '2 K⁺ → dentro', 0.54, -0.05, 0.16, '#d88aff', '#f2d9ff', 0.11);
  const tagAtp = addTag(patch, 'ATP → ADP + Pi', 1.16, -0.08, 0.16, '#7cffc4', '#d8ffec', 0.108);

  // --- ZONE A: Simple Diffusion (Diatomic O2/CO2) + Sculpted Hourglass Aquaporin Water Pore (Osmosis) ---
  const aqp = group(patch, -0.3, 0, 0.04);
  const aqpMat = proteinMaterial('#3ba8f0', { emissive: '#165a91', emissiveIntensity: 0.28, clearcoat: 0.94, iridescence: 0.28 });
  const aqpRibbonMat = proteinMaterial('#6ad0ff', { emissive: '#1e76ad', emissiveIntensity: 0.34, clearcoat: 0.96 });
  // Smooth hourglass transmembrane Aquaporin channel core
  lathe(aqp, aqpMat, [
    [0.036, -0.17], [0.088, -0.155], [0.095, -0.1], [0.068, -0.04],
    [0.056, 0.0], [0.068, 0.04], [0.096, 0.1], [0.088, 0.158], [0.036, 0.172]
  ], 22);
  // 4 gracefully spiraled alpha-helical outer ribbon domains hugging the hourglass
  for (let i = 0; i < 4; i++) {
    const a0 = (i / 4) * tau + 0.35;
    const spiral = Array.from({ length: 14 }, (_, j) => {
      const f = j / 13;
      const y = -0.155 + f * 0.31;
      const rad = 0.066 + Math.pow((f - 0.5) * 2, 2) * 0.036;
      const ang = a0 + f * 1.35;
      return v(Math.cos(ang) * rad, y, Math.sin(ang) * rad);
    });
    tube(aqp, aqpRibbonMat, spiral, 0.02, false, 18, 8);
  }
  // Refractive gelatinous liquid water column shining through the Aquaporin pore
  lathe(aqp, gelMaterial('#68e4ff', { opacity: 0.34, iridescence: 0.45 }), [
    [0.044, -0.165], [0.032, -0.07], [0.026, 0], [0.032, 0.07], [0.046, 0.165]
  ], 16);
  const aqpGlow = torus(aqp, glow('#70e8ff', 0.9, { transparent: true, opacity: 0.62, depthWrite: false }), 0.062, 0.012, 0, 0.168, 0);
  aqpGlow.rotation.x = Math.PI / 2;

  const diffSimple = instances(patch, makeDiatomicGeo(), proteinMaterial('#ffda75', {
    emissive: '#e8a22a', emissiveIntensity: 0.72, clearcoat: 0.95, roughness: 0.15
  }), 12, true);
  const putSimple = instanceUpdater(diffSimple);
  const osmosisWater = instances(patch, makeWaterGeo(), proteinMaterial('#64d6ff', {
    emissive: '#229ae8', emissiveIntensity: 0.78, clearcoat: 1.0, roughness: 0.08, iridescence: 0.34
  }), 14, true);
  const putOsmosis = instanceUpdater(osmosisWater);
  const hyperSolutes = instances(patch, makeHydratedSoluteGeo(), proteinMaterial('#f082ac', {
    emissive: '#ad3466', emissiveIntensity: 0.48, clearcoat: 0.88, iridescence: 0.25
  }), 8, true);
  const putHyper = instanceUpdater(hyperSolutes);

  // --- ZONE B: Sculpted 6-Subunit Selective Ion Channel + Active Organic Rejection FX (x = 0.14) ---
  const channel = group(patch, 0.14, 0, 0.04);
  const chanMat = proteinMaterial('#5a92f0', { emissive: '#224c9e', emissiveIntensity: 0.26, clearcoat: 0.94, roughness: 0.2, iridescence: 0.24 });
  const chanCrownMat = proteinMaterial('#7cb8ff', { emissive: '#2b67ba', emissiveIntensity: 0.32, clearcoat: 0.95 });
  const subunitProfile = [
    [0.012, -0.175], [0.044, -0.15], [0.052, -0.1], [0.034, -0.035],
    [0.03, 0.0], [0.036, 0.042], [0.056, 0.115], [0.046, 0.165], [0.014, 0.182]
  ];
  const helices = [];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * tau;
    const subGrp = group(channel, Math.cos(a) * 0.104, 0, Math.sin(a) * 0.104);
    const subGeo = new T.LatheGeometry(subunitProfile.map(pt => new T.Vector2(pt[0], pt[1])), 14);
    organicDisplace(subGeo, 0.07, 9, i * 1.9);
    const subMesh = mesh(subGrp, subGeo, chanMat);
    subMesh.rotation.set(Math.cos(a) * 0.1, a, Math.sin(a) * 0.16);
    // Extracellular globular loop cap
    mesh(subGrp, organicDisplace(new T.SphereGeometry(0.034, 10, 8), 0.12, 6, i), chanCrownMat,
      Math.cos(a) * 0.022, 0.168, Math.sin(a) * 0.022).scale.set(1.15, 0.78, 1.0);
    helices.push({ mesh: subGrp, angle: a });
  }
  // Translucent wet gelatinous pore funnel inside the selective channel
  lathe(channel, gelMaterial('#68eeff', { opacity: 0.24, iridescence: 0.45 }), [
    [0.072, -0.17], [0.05, -0.07], [0.038, 0], [0.056, 0.08], [0.088, 0.172]
  ], 20);
  const poreGlow = torus(channel, glow('#70f8ff', 0.82, { transparent: true, opacity: 0.68, depthWrite: false }), 0.084, 0.014, 0, 0.172, 0);
  poreGlow.rotation.x = Math.PI / 2;
  // Inner selectivity-filter constriction ring right at the throat (y = 0.02)
  const filterRing = torus(channel, glow('#9cfbff', 0.85, { transparent: true, opacity: 0.58, depthWrite: false }), 0.044, 0.01, 0, 0.02, 0);
  filterRing.rotation.x = Math.PI / 2;
  const acceptRing = torus(channel, glow('#6ef5ff', 0.95, { transparent: true, opacity: 0.35, depthWrite: false }), 0.092, 0.012, 0, -0.178, 0);
  acceptRing.rotation.x = Math.PI / 2;

  // Crisp crimson rejection shock-ring + X gate flash right on the channel mouth when wrong macromolecules try to enter!
  const rejectFx = group(channel, 0, 0.215, 0);
  const rejectRingMat = glow('#ff4766', 1.25, { transparent: true, opacity: 0, depthWrite: false });
  const rejectRing = torus(rejectFx, rejectRingMat, 0.13, 0.016, 0, 0, 0);
  rejectRing.rotation.x = Math.PI / 2;
  const rejectBarMat = glow('#ff6680', 1.25, { transparent: true, opacity: 0, depthWrite: false });
  rod(rejectFx, rejectBarMat, v(-0.072, 0, -0.072), v(0.072, 0, 0.072), 0.012);
  rod(rejectFx, rejectBarMat, v(-0.072, 0, 0.072), v(0.072, 0, -0.072), 0.012);

  // Matching sleek hydrated cyan ions passing cleanly THROUGH the channel pore
  const passIons = instances(channel, new T.SphereGeometry(0.025, 12, 9), proteinMaterial('#7efcff', {
    emissive: '#38d8f5', emissiveIntensity: 0.85, clearcoat: 1.0, roughness: 0.08
  }), 7, true);
  const putPass = instanceUpdater(passIons);
  // Incompatible bulky 3-lobed crimson organic macromolecules rejected at the selectivity vestibule!
  const rejectCubes = instances(channel, makeBulkyTrilobeGeo(), proteinMaterial('#ff5274', {
    emissive: '#c92045', emissiveIntensity: 0.56, clearcoat: 0.9, iridescence: 0.22
  }), 4, true);
  const putCube = instanceUpdater(rejectCubes);
  // Incompatible branched amber organic macromolecules also rejected at the selectivity filter!
  const rejectOctas = instances(channel, makeBranchedRejectGeo(), proteinMaterial('#ffb34d', {
    emissive: '#c46a16', emissiveIntensity: 0.54, clearcoat: 0.9, iridescence: 0.2
  }), 3, true);
  const putOcta = instanceUpdater(rejectOctas);

  // --- ZONE B2: Sculpted Curved Kidney-Lobe Alternating-Access Carrier Protein (x = 0.52) ---
  const carrier = group(patch, 0.52, 0, 0.04);
  const carrMat = proteinMaterial('#38cfab', { emissive: '#16755e', emissiveIntensity: 0.28, clearcoat: 0.94, roughness: 0.2, iridescence: 0.26 });
  const carrAccent = proteinMaterial('#6cf0ce', { emissive: '#1f8a70', emissiveIntensity: 0.34, clearcoat: 0.96 });
  const buildCarrierLobe = (side) => {
    const jaw = group(carrier, side * 0.066, 0, 0);
    // Curved organic crescent cryo-EM protein lobe framing a central binding cleft
    const lobeCurve = [
      v(-side * 0.012, -0.165, 0), v(side * 0.026, -0.075, 0.01),
      v(side * 0.036, 0.0, 0), v(side * 0.026, 0.075, -0.01), v(-side * 0.012, 0.165, 0)
    ];
    tube(jaw, carrMat, lobeCurve, 0.046, false, 18, 12);
    // Secondary wrapping transmembrane rib + organic globular end caps
    tube(jaw, carrAccent, lobeCurve.map(pt => v(pt.x + side * 0.018, pt.y * 0.92, pt.z + 0.022)), 0.024, false, 14, 8);
    tube(jaw, carrAccent, lobeCurve.map(pt => v(pt.x + side * 0.018, pt.y * 0.92, pt.z - 0.022)), 0.024, false, 14, 8);
    mesh(jaw, organicDisplace(new T.SphereGeometry(0.048, 12, 10), 0.12, 6, side + 3), carrMat, -side * 0.008, 0.152, 0).scale.set(1.12, 0.82, 1.05);
    mesh(jaw, organicDisplace(new T.SphereGeometry(0.048, 12, 10), 0.12, 6, side + 7), carrMat, -side * 0.008, -0.152, 0).scale.set(1.12, 0.82, 1.05);
    return jaw;
  };
  const jawL = buildCarrierLobe(-1);
  const jawR = buildCarrierLobe(1);
  // Sculpted 6-membered hexagonal Glucose molecule instead of raw octahedron!
  const carrCargo = buildGlucoseSculpture(carrier);

  // --- ZONE C: Sculpted Multi-Domain P-Type Na+/K+ ATPase Pump (x = 0.86) ---
  const pump = group(patch, 0.86, 0, 0.04);
  const pumpMat = proteinMaterial('#8e6cf0', { emissive: '#472ca6', emissiveIntensity: 0.28, clearcoat: 0.94, roughness: 0.2, iridescence: 0.28 });
  const pumpBetaMat = gelMaterial('#b89cff', { opacity: 0.56, emissive: '#6242c9', emissiveIntensity: 0.34, iridescence: 0.38 });
  const pumpDomMat = proteinMaterial('#a884ff', { emissive: '#5838ba', emissiveIntensity: 0.3, clearcoat: 0.92 });
  const buildPumpHalf = (side) => {
    const h = group(pump, side * 0.068, 0, 0);
    // Multi-bulge transmembrane alpha-helical bundle
    const profile = [
      [0.016, -0.19], [0.056, -0.165], [0.066, -0.105], [0.048, -0.03],
      [0.044, 0.02], [0.062, 0.1], [0.058, 0.165], [0.02, 0.192]
    ];
    const geo = new T.LatheGeometry(profile.map(pt => new T.Vector2(pt[0], pt[1])), 16);
    organicDisplace(geo, 0.08, 8, side * 3 + 5);
    mesh(h, geo, pumpMat);
    // Sculpted coiled transmembrane alpha-ribbon accent
    const rib = Array.from({ length: 12 }, (_, j) => {
      const f = j / 11;
      const a = f * 2.2 + (side > 0 ? 0 : Math.PI);
      return v(Math.cos(a) * 0.052, -0.15 + f * 0.3, Math.sin(a) * 0.052);
    });
    tube(h, pumpDomMat, rib, 0.017, false, 14, 7);
    return h;
  };
  const pumpL = buildPumpHalf(-1);
  const pumpR = buildPumpHalf(1);
  // Translucent extracellular beta-subunit glycoprotein cap + 3 distinct cytosolic cryo-EM domains (A, N, P)!
  mesh(pump, organicDisplace(new T.SphereGeometry(0.068, 12, 10), 0.12, 6, 9), pumpBetaMat, 0.085, 0.19, -0.045).scale.set(1.1, 0.72, 0.95);
  // Cytosolic Actuator (A), Nucleotide-binding (N), and Phosphorylation (P) globular lobes below pump (-Y)
  mesh(pump, organicDisplace(new T.SphereGeometry(0.062, 12, 10), 0.14, 6, 1), pumpDomMat, -0.095, -0.225, 0.02).scale.set(1.05, 0.85, 0.95);
  mesh(pump, organicDisplace(new T.SphereGeometry(0.058, 12, 10), 0.14, 6, 4), pumpMat, 0.095, -0.215, 0.03).scale.set(1.0, 0.82, 0.95);
  mesh(pump, organicDisplace(new T.SphereGeometry(0.054, 12, 10), 0.14, 6, 7), pumpDomMat, 0.0, -0.255, -0.055).scale.set(1.15, 0.78, 0.9);
  // Cytosolic ATP binding pocket glow beneath pump (-Y)
  const atpPocket = torus(pump, glow('#70ffc0', 0.72, { transparent: true, opacity: 0.44, depthWrite: false }), 0.088, 0.013, 0, -0.225, 0);
  atpPocket.rotation.x = Math.PI / 2;
  // Sculpted multi-bead ATP, ADP, and tetrahedral Pi molecules!
  const atpSpark = buildNucleotideSculpture(pump, 3, 0, -0.44, 0.05);
  const adpSpark = buildNucleotideSculpture(pump, 2, -0.08, -0.34, 0.06);
  const piBead = buildPhosphateIon(pump, 0.09, -0.17, 0.065);
  const naIons = instances(pump, new T.SphereGeometry(0.032, 12, 9), proteinMaterial('#ffd866', {
    emissive: '#e69d1e', emissiveIntensity: 0.72, clearcoat: 1.0, roughness: 0.1
  }), 3, true); // 3 Na+ OUT
  const kIons = instances(pump, new T.SphereGeometry(0.034, 12, 9), proteinMaterial('#e094ff', {
    emissive: '#a43ce0', emissiveIntensity: 0.72, clearcoat: 1.0, roughness: 0.1
  }), 2, true); // 2 K+ IN
  const putNa = instanceUpdater(naIons);
  const putK = instanceUpdater(kIons);

  // --- ZONE D: REAL-TIME DEFORMING GELATINOUS MEMBRANE ENDOCYTOSIS ---
  //     (Step 6: Endocytosis overview -> all 3 morphing membranes; Step 7: Phagocytosis; Step 8: Pinocytosis; Step 9: Receptor-Mediated)
  const endoPt = shellPoint(type, 0.88, cutStart + 0.36, 1.0);
  const endoOut = shellPoint(type, 0.88, cutStart + 0.36, 1.05).sub(endoPt).normalize();
  const endoZone = group(parent, endoPt.x, endoPt.y, endoPt.z);
  endoZone.quaternion.setFromUnitVectors(v(0, 1, 0), endoOut);
  createAnchor(endoZone, anchors, 'membrane_endocytosis', 0, -0.04, 0);

  // Translucent undulating gelatinous outer plasma-membrane sheet framing the 3 pathways in Step 6
  const endoApronGeo = new T.RingGeometry(0.24, 0.84, 36, 2);
  endoApronGeo.rotateX(-Math.PI / 2);
  mesh(endoZone, endoApronGeo, gelMaterial('#38bac9', { opacity: 0.22, iridescence: 0.42 }), 0, -0.012, 0);

  // ---- D1. PHAGOCYTOSIS (center x = 0): Continuous morphing pseudopod cup + impurity film + neck rupture & healing! ----
  const phagoGroup = group(endoZone, 0, 0, 0);
  createAnchor(phagoGroup, anchors, 'membrane_phago', 0, -0.06, 0);

  const phagoMemMat = gelMaterial('#56e3f0', {
    opacity: 0.62, iridescence: 0.54, clearcoat: 1.0,
    emissive: '#198699', emissiveIntensity: 0.26, roughness: 0.06
  });
  const phagoMem = makeMorphMembrane(phagoGroup, phagoMemMat, 0.32, 24, 32);
  // Subtle inner lipid leaflet contour sheen giving visible bilayer thickness as pseudopods rise & fold!
  const phagoInnerMat = membraneMaterial('#9cfaff', { opacity: 0.28, clearcoat: 1.0 });
  const phagoMemInner = makeMorphMembrane(phagoGroup, phagoInnerMat, 0.31, 18, 24);

  // Cortical actin microfilament arches pushing upward inside the molding pseudopod arms!
  const actinMat = glow('#ffe07a', 0.82, { transparent: true, opacity: 0.55, depthWrite: false });
  const actinArcs = [];
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * tau + 0.35;
    const arc = group(phagoGroup);
    arc.rotation.y = a;
    tube(arc, actinMat, [v(0.18, -0.02, 0), v(0.15, 0.09, 0.02), v(0.1, 0.2, 0)], 0.011, false, 12, 6);
    actinArcs.push(arc);
  }

  // Luminous lipid-fusion seam & neck-rupture scission flash rings
  const phagoFusionMat = glow('#8efcff', 1.35, { transparent: true, opacity: 0, depthWrite: false });
  const phagoFusionRing = torus(phagoGroup, phagoFusionMat, 0.075, 0.015, 0, 0.24, 0);
  phagoFusionRing.rotation.x = Math.PI / 2;
  const phagoScissionMat = glow('#ffe88a', 1.4, { transparent: true, opacity: 0, depthWrite: false });
  const phagoScissionRing = torus(phagoGroup, phagoScissionMat, 0.065, 0.014, 0, 0.0, 0);
  phagoScissionRing.rotation.x = Math.PI / 2;

  // Bumpy organic solid impurity / pathogen + smaller surface debris specks to be engulfed in a glistening film!
  const phagoTarget = group(phagoGroup, 0, 0.32, 0);
  const targetGeo = organicDisplace(new T.CapsuleGeometry(0.062, 0.074, 10, 18), 0.16, 9, 3);
  tintGeometry(targetGeo, '#f58470', '#9e2e24', 6.5, 2);
  mesh(phagoTarget, targetGeo, proteinMaterial('#ffffff', { vertexColors: true, emissive: '#8f281f', emissiveIntensity: 0.3, clearcoat: 0.88 }));
  const piliMat = glow('#ffb8a3', 0.48);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * tau;
    const y = (i % 2 ? 0.04 : -0.04);
    rod(phagoTarget, piliMat, v(Math.cos(a) * 0.056, y, Math.sin(a) * 0.056), v(Math.cos(a) * 0.098, y * 1.25, Math.sin(a) * 0.098), 0.0055, 5);
  }
  // Tiny companion debris/impurity specks swept inside the same film!
  const debrisMat = proteinMaterial('#e86a5a', { emissive: '#8c281c', emissiveIntensity: 0.32, clearcoat: 0.85 });
  for (const [dx, dy, dz, dr] of [[-0.075, 0.04, 0.045, 0.018], [0.072, -0.035, 0.04, 0.016], [0.02, 0.072, -0.05, 0.015]]) {
    mesh(phagoTarget, organicDisplace(new T.SphereGeometry(dr, 8, 6), 0.16, 6, dx * 30), debrisMat, dx, dy, dz);
  }

  // Tight glistening translucent gelatinous engulfment film (película / fagossomo) wrapping the impurity!
  const phagoVesMat = gelMaterial('#7ef6ff', { opacity: 0.46, iridescence: 0.56, clearcoat: 1.0, emissive: '#229eb0', emissiveIntensity: 0.24 });
  const phagoVesicle = group(phagoGroup, 0, -0.15, 0);
  mesh(phagoVesicle, organicDisplace(new T.SphereGeometry(0.152, 24, 18), 0.045, 5, 2), phagoVesMat);
  mesh(phagoVesicle, new T.SphereGeometry(0.136, 18, 14), membraneMaterial('#d6feff', { opacity: 0.24, clearcoat: 1.0 }));

  // Enzyme-packed fusing Lysosome + enzymatic digestion sparks bursting inside the film!
  const miniLysoMat = gelMaterial('#e672ed', { opacity: 0.66, emissive: '#942ea1', emissiveIntensity: 0.4, iridescence: 0.42 });
  const miniLyso = group(phagoGroup, 0.24, -0.52, 0.04);
  mesh(miniLyso, organicDisplace(new T.SphereGeometry(0.092, 18, 14), 0.06, 7, 5), miniLysoMat);
  const enzMat = glow('#ffccf8', 0.95);
  for (let i = 0; i < 7; i++) {
    const a = i * 2.399;
    mesh(miniLyso, new T.SphereGeometry(0.016, 7, 5), enzMat, Math.cos(a) * 0.042, ((i % 3) - 1) * 0.03, Math.sin(a) * 0.042);
  }
  const digestSparks = instances(phagoGroup, new T.SphereGeometry(0.014, 7, 5), glow('#ffb5f5', 1.1), 10, true);
  const putDigest = instanceUpdater(digestSparks);

  // ---- D2. PINOCYTOSIS (left x = -0.52): Live hole opening in membrane -> Ω liquid pouch -> neck rupture -> pinosome film! ----
  const pinoGroup = group(endoZone, -0.52, 0, 0);
  createAnchor(pinoGroup, anchors, 'membrane_pino', 0, -0.1, 0);

  const pinoMemMat = gelMaterial('#58daff', {
    opacity: 0.58, iridescence: 0.52, clearcoat: 1.0,
    emissive: '#187ca8', emissiveIntensity: 0.24, roughness: 0.06
  });
  const pinoMem = makeMorphMembrane(pinoGroup, pinoMemMat, 0.26, 24, 30);
  // Shimmering wet lip meniscus ring expanding & contracting as the membrane hole opens and pinches shut!
  const pinoRimMat = glow('#8ef2ff', 0.95, { transparent: true, opacity: 0.55, depthWrite: false });
  const pinoRim = torus(pinoGroup, pinoRimMat, 0.095, 0.012, 0, 0.01, 0);
  pinoRim.rotation.x = Math.PI / 2;
  const pinoScissionMat = glow('#a8f8ff', 1.4, { transparent: true, opacity: 0, depthWrite: false });
  const pinoScissionRing = torus(pinoGroup, pinoScissionMat, 0.048, 0.012, 0, -0.02, 0);
  pinoScissionRing.rotation.x = Math.PI / 2;

  const pinoDrops = instances(pinoGroup, makeWaterGeo(), proteinMaterial('#7ce4ff', {
    emissive: '#28a8e6', emissiveIntensity: 0.85, clearcoat: 1.0, iridescence: 0.36
  }), 10, true);
  const putPino = instanceUpdater(pinoDrops);
  const pinoSolutes = instances(pinoGroup, new T.SphereGeometry(0.016, 8, 6), glow('#ffd978', 0.96), 7, true);
  const putPinoSol = instanceUpdater(pinoSolutes);

  // Pinched-off liquid gelatinous Pinosome film bubble carrying swirling H2O & dissolved solute impurities!
  const pinoVesicle = group(pinoGroup, 0, -0.22, 0);
  mesh(pinoVesicle, organicDisplace(new T.SphereGeometry(0.102, 22, 16), 0.045, 6, 4),
    gelMaterial('#74e8ff', { opacity: 0.48, iridescence: 0.54, clearcoat: 1.0 }));
  mesh(pinoVesicle, new T.SphereGeometry(0.088, 16, 12), membraneMaterial('#ccf8ff', { opacity: 0.22, clearcoat: 1.0 }));
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * tau;
    mesh(pinoVesicle, new T.SphereGeometry(0.017, 8, 6), glow('#9ef2ff', 0.98), Math.cos(a) * 0.038, (i % 2 ? 0.022 : -0.022), Math.sin(a) * 0.038);
  }
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * tau + 0.5;
    mesh(pinoVesicle, new T.SphereGeometry(0.014, 7, 5), glow('#ffe07a', 0.98), Math.cos(a) * 0.028, (i - 1) * 0.024, Math.sin(a) * 0.028);
  }

  // ---- D3. RECEPTOR-MEDIATED ENDOCYTOSIS (right x = +0.52): Live folding Ω coated pit + riding goblet receptors + Clathrin + Dynamin rupture! ----
  const recGroup = group(endoZone, 0.52, 0, 0);
  createAnchor(recGroup, anchors, 'membrane_rec', 0, -0.1, 0);

  const recMemMat = gelMaterial('#5debb6', {
    opacity: 0.54, iridescence: 0.5, clearcoat: 1.0,
    emissive: '#16855c', emissiveIntensity: 0.24, roughness: 0.06
  });
  const recMem = makeMorphMembrane(recGroup, recMemMat, 0.26, 24, 30);

  // Geodesic Clathrin triskelion basket actively growing around the curving cytosolic underside of the coated pit!
  const clathrinGeo = new T.IcosahedronGeometry(0.128, 1);
  const clathrinMat = new T.LineBasicMaterial({ color: '#a8ffd0', transparent: true, opacity: 0.78 });
  const clathrinCage = new T.LineSegments(new T.EdgesGeometry(clathrinGeo), clathrinMat);
  clathrinCage.position.set(0, -0.11, 0);
  recGroup.add(clathrinCage);
  clathrinGeo.dispose();

  // Golden-cyan spiral Dynamin scission collar that cinches & ruptures the coated-pit neck!
  const dynaminMat = glow('#ffe27a', 1.3, { transparent: true, opacity: 0, depthWrite: false });
  const dynaminRing = torus(recGroup, dynaminMat, 0.064, 0.014, 0, -0.025, 0);
  dynaminRing.rotation.x = Math.PI / 2;

  // 5 sculpted goblet/chalice transmembrane receptors that PHYSICALLY RIDE & TILT INWARD with the deforming membrane!
  const recMat = proteinMaterial('#88ffc2', { emissive: '#249e66', emissiveIntensity: 0.52, clearcoat: 0.96 });
  const gobletProfile = [
    [0.01, -0.018], [0.013, 0.036], [0.032, 0.072], [0.04, 0.104], [0.03, 0.108], [0.016, 0.075]
  ];
  const recSlots = [
    { u: 0.0, th: 0 },
    { u: 0.34, th: 0.35 },
    { u: 0.34, th: 1.92 },
    { u: 0.34, th: 3.49 },
    { u: 0.34, th: 5.06 }
  ];
  const recGoblets = recSlots.map(slot => {
    const g = group(recGroup);
    lathe(g, recMat, gobletProfile, 12);
    return { grp: g, u: slot.u, th: slot.th };
  });

  // 5 matching specific emerald LDL ligands (one per receptor!) + 3 incompatible amber molecules drifting past ignored!
  const recLigands = instances(recGroup, makeHydratedSoluteGeo(), proteinMaterial('#8effb8', {
    emissive: '#26b868', emissiveIntensity: 0.78, clearcoat: 0.98
  }), 5, true);
  const putLig = instanceUpdater(recLigands);
  const recIgnored = instances(recGroup, makeBranchedRejectGeo(), proteinMaterial('#ffb85c', {
    emissive: '#c46c18', emissiveIntensity: 0.56, clearcoat: 0.92
  }), 3, true);
  const putRecIgn = instanceUpdater(recIgnored);

  // Pinched-off Clathrin-coated vesicle carrying captured emerald ligands inside its gelatinous film!
  const recVesicle = group(recGroup, 0, -0.22, 0);
  mesh(recVesicle, organicDisplace(new T.SphereGeometry(0.104, 20, 14), 0.04, 6, 7),
    gelMaterial('#78f5c4', { opacity: 0.46, iridescence: 0.52, clearcoat: 1.0 }));
  const coatGeo = new T.IcosahedronGeometry(0.126, 1);
  recVesicle.add(new T.LineSegments(
    new T.EdgesGeometry(coatGeo),
    new T.LineBasicMaterial({ color: '#b8ffda', transparent: true, opacity: 0.88 })
  ));
  coatGeo.dispose();
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * tau;
    mesh(recVesicle, new T.SphereGeometry(0.022, 9, 7), glow('#8effb8', 0.98), Math.cos(a) * 0.042, (i % 2 ? 0.015 : -0.015), Math.sin(a) * 0.042);
  }

  // Overview tags (Step 6: Endocytosis overview)
  const tagPhago = addTag(endoZone, 'Fagocitose', 0, 0.5, 0.12, '#f28574', '#ffe0da', 0.116);
  const tagPino = addTag(endoZone, 'Pinocitose', -0.52, 0.42, 0.12, '#6ad8ff', '#d9f4ff', 0.11);
  const tagRec = addTag(endoZone, 'Mediada por receptores', 0.52, 0.42, 0.12, '#7dffae', '#dbffe8', 0.106);
  // Dedicated macro-step micro-tags (Steps 7, 8, 9 — compact offsets centered inside viewport!)
  const tagPhagoPseudo = addTag(phagoGroup, 'Pseudópodes (moldando)', -0.26, 0.32, 0.14, '#6cf0fa', '#dcfeff', 0.094);
  const tagPhagoSolid = addTag(phagoGroup, 'Impureza / Patógeno', 0.24, 0.36, 0.14, '#f28574', '#ffe0da', 0.094);
  const tagLyso = addTag(phagoGroup, 'Fagossomo + Lisossomo', 0.22, -0.44, 0.16, '#df6be6', '#f7d9ff', 0.094);
  const tagPinoFluid = addTag(pinoGroup, 'Líquido + impurezas', 0.0, 0.28, 0.14, '#6ad8ff', '#d9f4ff', 0.094);
  const tagPinoPit = addTag(pinoGroup, 'Invaginação (canal Ω)', 0.25, -0.04, 0.14, '#7ef0ff', '#dffcff', 0.092);
  const tagPinoVes = addTag(pinoGroup, 'Pinossomo (película)', -0.2, -0.36, 0.14, '#74e8ff', '#d9f7ff', 0.094);
  const tagRecLig = addTag(recGroup, 'Ligantes específicos (LDL)', 0.24, 0.22, 0.14, '#7dffae', '#dbffe8', 0.092);
  const tagRecGob = addTag(recGroup, 'Receptores + Dinamina', -0.26, 0.04, 0.14, '#88ffc2', '#dcffec', 0.092);
  const tagRecVes = addTag(recGroup, 'Vesícula com clatrina', 0.22, -0.36, 0.14, '#b2ffd6', '#e6fff2', 0.092);

  // --- ZONE E: Sculpted Gelatinous Exocytosis Fusion Neck & Intertwined Coiled-Coil SNARE Zipper ---
  const exoOut = shellPoint(type, 1.78, cutStart + 0.16, 1.05).sub(exoPt).normalize();
  const exoZone = group(parent, exoPt.x, exoPt.y, exoPt.z);
  exoZone.quaternion.setFromUnitVectors(v(0, 1, 0), exoOut);

  // Register exact focus sub-groups for GPU Depth-of-Field blur across every Membrane zoom step!
  if (focusGroups) {
    focusGroups.set('membrane_bilayer', [patch]);
    focusGroups.set('membrane_passive', [patch]);
    focusGroups.set('membrane_transport', [patch]);
    focusGroups.set('membrane_pump', [patch]);
    focusGroups.set('membrane_endocytosis', [endoZone]);
    focusGroups.set('membrane_phagocytosis', [phagoGroup]);
    focusGroups.set('membrane_pinocytosis', [pinoGroup]);
    focusGroups.set('membrane_receptor', [recGroup]);
    focusGroups.set('membrane_exocytosis', [exoZone]);
  }

  // Translucent gelatinous membrane disc with sculpted wet hourglass fusion neck!
  const exoNeckMat = gelMaterial('#7ef7ea', { opacity: 0.48, iridescence: 0.48, emissive: '#2cb0a8', emissiveIntensity: 0.34 });
  const exoNeck = lathe(exoZone, exoNeckMat, [
    [0.095, -0.12], [0.068, -0.055], [0.062, 0.0], [0.088, 0.042], [0.185, 0.055], [0.32, 0.045]
  ], 26);
  const exoPoreMat = glow('#8efcf0', 1.0, { transparent: true, opacity: 0.82, depthWrite: false });
  const exoPore = torus(exoZone, exoPoreMat, 0.132, 0.018, 0, 0.032, 0);
  exoPore.rotation.x = Math.PI / 2;

  // 4 paired intertwined coiled-coil v-SNARE & t-SNARE helical zipper bundles (replaces stiff yellow sticks!)
  const tSnareMat = proteinMaterial('#ffd46b', { emissive: '#b57b18', emissiveIntensity: 0.44, clearcoat: 0.9 });
  const vSnareMat = proteinMaterial('#ff9973', { emissive: '#b54822', emissiveIntensity: 0.44, clearcoat: 0.9 });
  const snareCoils = [];
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * tau;
    const bundle = group(exoZone, Math.cos(a) * 0.155, -0.055, Math.sin(a) * 0.155);
    const ptsA = [], ptsB = [];
    for (let j = 0; j < 14; j++) {
      const f = j / 13;
      const ha = f * tau * 1.8;
      const y = -0.095 + f * 0.165;
      ptsA.push(v(Math.cos(ha) * 0.016, y, Math.sin(ha) * 0.016));
      ptsB.push(v(Math.cos(ha + Math.PI) * 0.016, y, Math.sin(ha + Math.PI) * 0.016));
    }
    tube(bundle, tSnareMat, ptsA, 0.0085, false, 16, 6);
    tube(bundle, vSnareMat, ptsB, 0.0085, false, 16, 6);
    snareCoils.push({ grp: bundle, angle: a });
  }

  // Glossy gelatinous translucent secretory vesicle with visible glowing liquid interior!
  const exoVesMat = gelMaterial('#f7c868', { opacity: 0.5, iridescence: 0.44, emissive: '#c48422', emissiveIntensity: 0.28 });
  const exoVesicle = group(exoZone, 0, -0.45, 0);
  mesh(exoVesicle, organicDisplace(new T.SphereGeometry(0.152, 22, 16), 0.04, 6, 4), exoVesMat);
  mesh(exoVesicle, new T.SphereGeometry(0.128, 16, 12), gelMaterial('#fff0b3', { opacity: 0.2 }));
  const exoCargo = instances(exoZone, new T.SphereGeometry(0.027, 10, 8), proteinMaterial('#ffe885', {
    emissive: '#f5b833', emissiveIntensity: 0.88, clearcoat: 1.0, roughness: 0.1
  }), 12, true);
  const putExoCargo = instanceUpdater(exoCargo);
  const tagExoVes = addTag(exoZone, 'Vesícula secretória (v-SNARE)', -0.06, -0.46, 0.16, '#f5c062', '#fff0c4', 0.104);
  const tagExoPore = addTag(exoZone, 'Poro de fusão (t-SNARE)', -0.34, 0.04, 0.18, '#7ef7ea', '#d9fffa', 0.102);
  const tagExoOut = addTag(exoZone, 'Secreção extracelular', -0.06, 0.44, 0.16, '#ffe27a', '#fff5cc', 0.104);

  const smooth = x => { const c = Math.max(0, Math.min(1, x)); return c * c * (3 - 2 * c); };

  updaters.push((t, _dt, activeKey, activeAnim) => {
    const isFluid = activeAnim === 'membrane_fluid';
    const isBilayer = activeAnim === 'membrane_bilayer';
    const isPassive = activeAnim === 'membrane_passive';
    const isTransport = activeAnim === 'membrane_transport';
    const isPump = activeAnim === 'membrane_pump';
    const isEndo = activeAnim === 'membrane_endocytosis';
    const isPhago = activeAnim === 'membrane_phagocytosis';
    const isPino = activeAnim === 'membrane_pinocytosis';
    const isRec = activeAnim === 'membrane_receptor';
    const anyEndo = isEndo || isPhago || isPino || isRec;
    const isExo = activeAnim === 'membrane_exocytosis';

    tagExtra.visible = isBilayer || isFluid;
    tagCyto.visible = isBilayer || isFluid;
    tagChol.visible = isBilayer;
    tagGlyco.visible = isFluid;
    tagDiff.visible = isPassive;
    tagOsmo.visible = isPassive;
    tagChan.visible = isTransport;
    tagCarr.visible = isTransport;
    tagNa.visible = isPump;
    tagK.visible = isPump;
    tagAtp.visible = isPump;
    // Endocytosis overview tags (Step 6) vs isolated step tags (Steps 7, 8, 9)
    tagPhago.visible = isEndo;
    tagPino.visible = isEndo;
    tagRec.visible = isEndo;
    tagPhagoPseudo.visible = isPhago;
    tagPhagoSolid.visible = isPhago;
    tagLyso.visible = isPhago;
    tagPinoFluid.visible = isPino;
    tagPinoPit.visible = isPino;
    tagPinoVes.visible = isPino;
    tagRecLig.visible = isRec;
    tagRecGob.visible = isRec;
    tagRecVes.visible = isRec;
    tagExoVes.visible = isExo;
    tagExoPore.visible = isExo;
    tagExoOut.visible = isExo;

    const waveAmp = isBilayer ? 0.024 : isFluid ? 0.036 : 0.01;
    const speed = isBilayer || isFluid ? 3.2 : 1.4;

    // Subtle shimmer breathing on the extracellular & cytosolic gelatinous aqueous fluid films
    extraFluidFilm.position.y = 0.24 + Math.sin(t * 1.9) * 0.012;
    cytoFluidFilm.position.y = -0.24 - Math.cos(t * 1.7) * 0.012;
    extraFluidFilm.material.opacity = isBilayer || isFluid || isPassive ? 0.16 : 0.08;
    cytoFluidFilm.material.opacity = isBilayer || isFluid || isPassive ? 0.15 : 0.08;

    // Fluid-mosaic lateral protein drift across the waving bilayer!
    driftProtA.position.x = -0.58 + Math.sin(t * (isFluid ? 1.4 : 0.5)) * 0.12;
    driftProtA.rotation.y = Math.sin(t * 0.7) * 0.4;
    driftProtB.position.x = 0.32 + Math.cos(t * (isFluid ? 1.2 : 0.45)) * 0.1;
    driftProtB.rotation.y = t * 0.35;

    for (let i = 0; i < lipidSpecs.length; i++) {
      const s = lipidSpecs[i];
      const bob = Math.sin(t * speed + s.phase) * waveAmp;
      const sway = Math.cos(t * speed * 1.12 + s.phase) * (isBilayer ? 0.15 : 0.055);
      putHead(i * 2, s.lx, 0.138 + bob, s.lz, isBilayer ? 1.12 : 1);
      putHead(i * 2 + 1, s.lx, -0.138 + bob, s.lz, isBilayer ? 1.12 : 1);
      putNeck(i * 2, s.lx, 0.106 + bob, s.lz, 1);
      putNeck(i * 2 + 1, s.lx, -0.106 + bob, s.lz, 1);
      putTail(i * 2, s.lx - 0.016, 0.068 + bob, s.lz, 1, 1, 1, sway);
      putKink(i * 2, s.lx + 0.017, 0.068 + bob, s.lz, 1, 1, 1, -sway);
      putTail(i * 2 + 1, s.lx - 0.016, -0.068 + bob, s.lz, 1, 1, 1, -sway);
      putKink(i * 2 + 1, s.lx + 0.017, -0.068 + bob, s.lz, 1, 1, 1, Math.PI + sway);
    }
    headBatch.instanceMatrix.needsUpdate = true;
    neckBatch.instanceMatrix.needsUpdate = true;
    tailBatch.instanceMatrix.needsUpdate = true;
    kinkBatch.instanceMatrix.needsUpdate = true;

    // Amphipathic water hydration shells dancing along polar heads & repelled by hydrophobic core!
    waterShell.visible = isBilayer;
    if (isBilayer) {
      for (let i = 0; i < waterShell.count; i++) {
        const side = i % 2 === 0 ? 1 : -1;
        const p = (t * 0.55 + i / waterShell.count) % 1;
        const bounce = Math.abs(Math.sin(p * Math.PI));
        const wx = -0.78 + ((i * 7) % 15) * 0.078;
        putWShell(i, wx + Math.sin(t * 2 + i) * 0.03, side * (0.19 + bounce * 0.14), (i % 3 - 1) * 0.09, 0.78 + bounce * 0.42, 0.78 + bounce * 0.42, 0.78 + bounce * 0.42, t * 1.4 + i);
      }
      waterShell.instanceMatrix.needsUpdate = true;
    }

    cholMat.emissiveIntensity = isBilayer ? 0.82 + Math.sin(t * 5) * 0.24 : 0.28;
    hydroBandMat.opacity = isBilayer ? 0.38 : 0.2;
    for (let i = 0; i < antennas.length; i++) {
      antennas[i].rotation.z = Math.sin(t * (isFluid ? 3.4 : 1.4) + i * 1.5) * (isFluid ? 0.25 : 0.08);
    }

    // ZONE A: Simple Diffusion (Diatomic O2/CO2 down gradient) & Osmosis through Aquaporin (H2O -> hypertonic side!)
    diffSimple.visible = isPassive;
    osmosisWater.visible = isPassive;
    hyperSolutes.visible = isPassive;
    aqpGlow.material.opacity = isPassive ? 0.78 + Math.sin(t * 6) * 0.2 : 0.24;
    if (isPassive) {
      for (let i = 0; i < diffSimple.count; i++) {
        const p = (t * 0.42 + i / diffSimple.count) % 1;
        const dx = -0.74 + (i % 4) * 0.075;
        const dz = (i % 2 ? 0.05 : -0.05);
        const sc = Math.sin(p * Math.PI) * 0.35 + 0.78;
        putSimple(i, dx + Math.sin(p * 7 + i) * 0.02, 0.44 - p * 0.84, dz, sc, sc, sc, t * 2.4 + i);
      }
      for (let i = 0; i < osmosisWater.count; i++) {
        const p = (t * 0.56 + i / osmosisWater.count) % 1;
        // Single-file triatomic H2O streaming UP through sculpted Aquaporin pore at x = -0.30 toward hypertonic solutes!
        const y = -0.4 + p * 0.82;
        const funnel = Math.abs(y) > 0.16 ? (Math.abs(y) - 0.16) * 0.24 : 0.015;
        const sc = Math.sin(p * Math.PI) * 0.42 + 0.8;
        putOsmosis(i, -0.3 + Math.cos(p * 9 + i) * funnel, y, 0.04 + Math.sin(p * 9 + i) * funnel, sc, sc, sc, p * 5 + i);
      }
      for (let i = 0; i < hyperSolutes.count; i++) {
        const a = t * 0.8 + i * 1.9;
        putHyper(i, -0.38 + (i % 4) * 0.075 + Math.cos(a) * 0.02, 0.32 + (i % 2) * 0.09 + Math.sin(a) * 0.025, (i % 3 - 1) * 0.07, 1, 1, 1, a);
      }
      diffSimple.instanceMatrix.needsUpdate = true;
      osmosisWater.instanceMatrix.needsUpdate = true;
      hyperSolutes.instanceMatrix.needsUpdate = true;
    }

    // ZONE B: Selective Channel Protein with EXPLICIT REJECTION of mismatched bulky macromolecules at the pore mouth!
    const breathe = isTransport ? 0.016 * Math.sin(t * 4.2) : 0.004 * Math.sin(t * 1.8);
    for (const h of helices) {
      const r = 0.104 + breathe;
      h.mesh.position.x = Math.cos(h.angle) * r;
      h.mesh.position.z = Math.sin(h.angle) * r;
    }
    poreGlow.material.opacity = isTransport ? 0.78 + Math.sin(t * 6) * 0.2 : 0.26;
    filterRing.material.opacity = isTransport ? 0.72 + Math.cos(t * 6) * 0.2 : 0.22;
    acceptRing.visible = isTransport;
    chanMat.emissiveIntensity = isTransport ? 0.5 : 0.26;

    const showTransport = isTransport || activeKey === 'membrane';
    passIons.visible = showTransport;
    rejectCubes.visible = isTransport;
    rejectOctas.visible = isTransport;
    rejectFx.visible = isTransport;

    if (showTransport) {
      let exitPulse = 0;
      for (let i = 0; i < passIons.count; i++) {
        const p = (t * (isTransport ? 0.56 : 0.24) + i / passIons.count) % 1;
        const y = 0.44 - p * 0.88;
        const funnel = Math.max(0.01, Math.abs(y) > 0.16 ? (Math.abs(y) - 0.16) * 0.26 : 0.016);
        const a = p * 8 + i * 1.7;
        putPass(i, Math.cos(a) * funnel, y, Math.sin(a) * funnel, Math.sin(p * Math.PI) * 0.38 + 0.75);
        if (Math.abs(y + 0.178) < 0.07) exitPulse = Math.max(exitPulse, 1 - Math.abs(y + 0.178) / 0.07);
      }
      passIons.instanceMatrix.needsUpdate = true;
      acceptRing.material.opacity = 0.24 + exitPulse * 0.74;
      acceptRing.scale.setScalar(0.92 + exitPulse * 0.34);
    }

    if (isTransport) {
      let maxRejectImpact = 0;
      for (let i = 0; i < rejectCubes.count; i++) {
        const p = (t * 0.5 + i / rejectCubes.count) % 1;
        let cx, cy, cz, sc = 1;
        const side = i % 2 === 0 ? -1 : 1;
        if (p < 0.44) {
          const u = p / 0.44;
          const ease = u * u;
          cx = side * (1 - ease) * 0.22;
          cy = 0.56 - ease * 0.34;
          cz = (i < 2 ? 0.06 : -0.06) * (1 - ease);
        } else {
          const u = (p - 0.44) / 0.56;
          const rebound = Math.sin(u * Math.PI * 0.5);
          cx = side * rebound * 0.34;
          cy = 0.22 + rebound * 0.38;
          cz = (i < 2 ? 0.09 : -0.09) * rebound;
          if (u < 0.24) {
            const flash = 1 - u / 0.24;
            maxRejectImpact = Math.max(maxRejectImpact, flash);
            sc = 1 + flash * 0.22;
          }
        }
        putCube(i, cx, cy, cz, sc, sc, sc, t * 2.2 + i);
      }
      for (let i = 0; i < rejectOctas.count; i++) {
        const p = (t * 0.42 + (i + 0.35) / rejectOctas.count) % 1;
        const side = i === 1 ? 0.04 : (i === 0 ? -0.26 : 0.26);
        const approach = Math.abs(p - 0.46) / 0.54;
        const dist = Math.min(1, approach);
        const oy = 0.23 + dist * dist * 0.38;
        const ox = side * dist;
        if (Math.abs(p - 0.46) < 0.1) maxRejectImpact = Math.max(maxRejectImpact, 1 - Math.abs(p - 0.46) / 0.1);
        putOcta(i, ox, oy, 0.08 * dist, 1, 1, 1, t * 1.8 + i);
      }
      rejectCubes.instanceMatrix.needsUpdate = true;
      rejectOctas.instanceMatrix.needsUpdate = true;
      rejectRingMat.opacity = maxRejectImpact * 0.95;
      rejectBarMat.opacity = maxRejectImpact * 0.95;
      rejectRing.scale.setScalar(0.85 + (1 - maxRejectImpact) * 0.55);
    }

    // ZONE B2: Carrier Protein 4-phase alternating-access conformation (open out -> occluded -> open in -> reset!)
    const carrCycle = (t * 0.46) % 1;
    let jawAngle = -0.28; // -0.28 opens outward (+Y); +0.28 opens inward (-Y)
    if (isTransport) {
      if (carrCycle < 0.24) jawAngle = -0.28;
      else if (carrCycle < 0.48) jawAngle = T.MathUtils.lerp(-0.28, 0, smooth((carrCycle - 0.24) / 0.24));
      else if (carrCycle < 0.72) jawAngle = T.MathUtils.lerp(0, 0.28, smooth((carrCycle - 0.48) / 0.24));
      else jawAngle = T.MathUtils.lerp(0.28, -0.28, smooth((carrCycle - 0.72) / 0.28));
    } else {
      jawAngle = -0.22;
    }
    jawL.rotation.z = jawAngle;
    jawR.rotation.z = -jawAngle;
    carrMat.emissiveIntensity = isTransport ? 0.46 : 0.26;
    carrCargo.visible = isTransport;
    if (isTransport) {
      let cy = 0;
      if (carrCycle < 0.28) cy = T.MathUtils.lerp(0.42, 0.01, smooth(carrCycle / 0.28));
      else if (carrCycle < 0.58) cy = 0;
      else if (carrCycle < 0.88) cy = T.MathUtils.lerp(0, -0.44, smooth((carrCycle - 0.58) / 0.3));
      else cy = -0.44;
      carrCargo.position.set(0, cy, 0.02);
      carrCargo.scale.setScalar(carrCycle > 0.88 ? Math.max(0.01, 1 - (carrCycle - 0.88) / 0.12) : 1);
      carrCargo.rotation.set(t * 2, t * 2.8, 0);
    }

    // ZONE C: Authentic 5-phase Albers-Post Na+/K+ ATPase Pump (3 Na+ OUT, ATP -> ADP + Pi, 2 K+ IN!)
    pumpMat.emissiveIntensity = isPump ? 0.5 : 0.26;
    naIons.visible = isPump;
    kIons.visible = isPump;
    atpPocket.visible = isPump;
    atpSpark.visible = false;
    adpSpark.visible = false;
    piBead.visible = false;

    if (isPump) {
      const cyc = (t * 0.32) % 1;
      // State angle: +0.26 = E1 open INWARD (-Y); -0.26 = E2 open OUTWARD (+Y)
      let pAngle = 0.26;
      if (cyc < 0.34) pAngle = 0.26;
      else if (cyc < 0.5) pAngle = T.MathUtils.lerp(0.26, -0.26, smooth((cyc - 0.34) / 0.16));
      else if (cyc < 0.76) pAngle = -0.26;
      else if (cyc < 0.92) pAngle = T.MathUtils.lerp(-0.26, 0.26, smooth((cyc - 0.76) / 0.16));
      pumpL.rotation.z = pAngle;
      pumpR.rotation.z = -pAngle;

      // Phase 1-2: ATP arrives (0.06..0.30), hydrolyzes -> ADP leaves (0.28..0.56) + Pi stays bound (0.28..0.74) then detaches (0.74..0.94)
      if (cyc >= 0.06 && cyc < 0.3) {
        const u = smooth((cyc - 0.06) / 0.22);
        atpSpark.visible = true;
        atpSpark.position.set(0, T.MathUtils.lerp(-0.48, -0.23, u), 0.06);
        atpSpark.rotation.set(0.3, t * 2.5, 0.2);
        atpSpark.scale.setScalar(0.85 + Math.sin(u * Math.PI) * 0.35);
      }
      if (cyc >= 0.28 && cyc < 0.56) {
        const u = smooth((cyc - 0.28) / 0.28);
        adpSpark.visible = true;
        adpSpark.position.set(-0.04 - u * 0.18, -0.24 - u * 0.28, 0.07);
        adpSpark.rotation.set(0.2, -t * 2.1, -0.3);
        adpSpark.scale.setScalar(1 - u * 0.32);
      }
      if (cyc >= 0.28 && cyc < 0.94) {
        piBead.visible = true;
        if (cyc < 0.74) {
          piBead.position.set(0.095, -0.185, 0.075);
          piBead.rotation.set(t * 2.4, t * 3.1, 0);
          piBead.scale.setScalar(1 + Math.sin(t * 9) * 0.14);
        } else {
          const u = smooth((cyc - 0.74) / 0.2);
          piBead.position.set(0.095 + u * 0.16, -0.185 - u * 0.32, 0.075);
          piBead.scale.setScalar(1 - u * 0.45);
        }
      }
      atpPocket.material.opacity = cyc >= 0.2 && cyc <= 0.76 ? 0.78 + Math.sin(t * 10) * 0.18 : 0.28;

      // 3 Na+ ions (golden): dock from cytosol (0..0.24) -> hold while ATP phosphorylates (0.24..0.44) -> expel OUTWARD (0.44..0.68)
      for (let i = 0; i < 3; i++) {
        const offX = (i - 1) * 0.056;
        const oz = i === 1 ? 0.035 : -0.02;
        if (cyc < 0.24) {
          const u = smooth(cyc / 0.24);
          putNa(i, offX * (1.25 - u * 0.4), T.MathUtils.lerp(-0.46, -0.03, u), oz);
        } else if (cyc < 0.44) {
          putNa(i, offX * 0.85, -0.03 + (cyc - 0.24) * 0.3, oz);
        } else if (cyc < 0.68) {
          const u = smooth((cyc - 0.44) / 0.24);
          putNa(i, offX * (0.85 + u * 0.9), T.MathUtils.lerp(0.03, 0.54, u), oz);
        } else {
          putNa(i, offX * 1.75, 0.54 + Math.sin(t * 2 + i) * 0.02, oz, 0.85);
        }
      }

      // 2 K+ ions (violet): wait outside (0..0.54) -> dock from extracellular +Y (0.54..0.74) -> release INWARD (0.84..1)
      for (let i = 0; i < 2; i++) {
        const offX = i === 0 ? -0.048 : 0.048;
        if (cyc < 0.54) {
          putK(i, offX * 1.7, 0.5 + Math.cos(t * 2 + i) * 0.02, 0.03, 0.85);
        } else if (cyc < 0.74) {
          const u = smooth((cyc - 0.54) / 0.2);
          putK(i, offX * (1.7 - u * 0.8), T.MathUtils.lerp(0.5, 0.02, u), 0.025);
        } else if (cyc < 0.84) {
          putK(i, offX * 0.9, 0.02 - (cyc - 0.74) * 0.4, 0.025);
        } else {
          const u = smooth((cyc - 0.84) / 0.16);
          putK(i, offX * (0.9 + u * 0.8), T.MathUtils.lerp(-0.02, -0.48, u), 0.025);
        }
      }
      naIons.instanceMatrix.needsUpdate = true;
      kIons.instanceMatrix.needsUpdate = true;
    }

    // ZONE D: REAL-TIME DEFORMING MEMBRANE PHYSICS — Steps 6, 7 (Phago), 8 (Pino), 9 (Receptor-Mediated)
    endoZone.visible = anyEndo;
    if (anyEndo) {
      // ----- D1. PHAGOCYTOSIS: Living pseudopods rise, mold snugly over impurity, fuse at apex, rupture neck & heal! -----
      const p = (t * 0.24) % 1;
      const contact = p < 0.15 ? smooth(p / 0.15) : 1;
      const mold = p < 0.15 ? 0 : p < 0.46 ? smooth((p - 0.15) / 0.31) : 1;
      const zip = p < 0.46 ? 0 : p < 0.6 ? smooth((p - 0.46) / 0.14) : 1;
      const snap = p < 0.6 ? 0 : p < 0.74 ? smooth((p - 0.6) / 0.14) : 1;
      const env = mold * (1 - snap); // 0 -> rises to 1 while enveloping -> snaps smoothly back flat to 0 after rupture!
      const healWave = p >= 0.6 && p < 0.88 ? Math.sin((p - 0.6) * 28) * Math.exp(-(p - 0.6) * 9) * 0.032 : 0;

      // Impurity descends onto membrane, gets embraced in cup, wrapped in film, released downward & digested by lysosome
      let py = 0.38;
      if (p < 0.15) py = T.MathUtils.lerp(0.38, 0.15, contact);
      else if (p < 0.58) py = T.MathUtils.lerp(0.15, 0.04, smooth((p - 0.15) / 0.43));
      else if (p < 0.84) py = T.MathUtils.lerp(0.04, -0.44, smooth((p - 0.58) / 0.26));
      else py = -0.44;
      phagoTarget.position.set(0, py, 0);
      phagoTarget.rotation.set(t * 0.6, t * 0.9, Math.sin(t) * 0.25);
      const digest = p > 0.8 ? Math.max(0.12, 1 - (p - 0.8) / 0.18) : 1;
      phagoTarget.scale.setScalar(digest);

      // Live vertex-morphing continuous plasma membrane wrapping around the exact pathogen curvature!
      const cupR = 0.154;
      const cupCy = py;
      const phiMax = Math.PI * (0.28 + mold * 0.56 + zip * 0.14); // wraps from cradle -> 98% closed sphere!
      const phagoProfile = (u, th, out, thickness = 0) => {
        const ripple = Math.sin(u * 14 - t * 3.2) * 0.006 + healWave * Math.sin(u * 16);
        const flatR = u * 0.32;
        const flatY = ripple - contact * (1 - env) * Math.exp(-u * u * 18) * 0.042 + thickness;
        if (env < 0.002) {
          out.r = flatR;
          out.y = flatY;
          return;
        }
        const armLobe = (0.022 * Math.sin(th * 4 + t * 2.2) + 0.011 * Math.cos(th * 3 - t * 1.6)) * mold * (1 - zip * 0.82);
        let mr, my;
        if (u <= 0.46) {
          // Inner rising pseudopod cup hugging the impurity snugly!
          const s = u / 0.46;
          const phi = s * phiMax;
          const lobeFactor = Math.sin(phi) * Math.sin(phi);
          mr = Math.sin(phi) * (cupR + armLobe * lobeFactor + thickness * 0.7);
          my = cupCy - Math.cos(phi) * (cupR + thickness * 0.7) + armLobe * 0.65 * s;
        } else if (u <= 0.62) {
          // Rounded undulating pseudopod lip curving gracefully back down to the plasma membrane!
          const s = (u - 0.46) / 0.16;
          const lipR = Math.sin(phiMax) * (cupR + armLobe * Math.sin(phiMax) ** 2);
          const lipY = cupCy - Math.cos(phiMax) * cupR + armLobe * 0.65;
          const archR = lipR + Math.sin(s * Math.PI) * 0.048 * (1 - zip * 0.4) + s * (0.205 - lipR);
          const archY = T.MathUtils.lerp(lipY, 0.0, smooth(s)) + Math.sin(s * Math.PI) * 0.032 * (1 - zip * 0.5);
          mr = archR + thickness * 0.5;
          my = archY + thickness;
        } else {
          // Outer continuous plasma membrane skirt
          const s = (u - 0.62) / 0.38;
          mr = T.MathUtils.lerp(0.205, 0.32, s);
          my = ripple + thickness;
        }
        out.r = T.MathUtils.lerp(flatR, mr, env);
        out.y = T.MathUtils.lerp(flatY, my, env);
      };
      phagoMem.update((u, th, out) => phagoProfile(u, th, out, 0));
      phagoMemInner.update((u, th, out) => phagoProfile(u, th, out, -0.014));

      // Cortical actin microfilaments actively pushing upward inside the growing pseudopods!
      const actinShow = Math.sin(mold * Math.PI) * (1 - snap);
      actinMat.opacity = actinShow * 0.65;
      for (let k = 0; k < actinArcs.length; k++) {
        actinArcs[k].visible = actinShow > 0.04;
        actinArcs[k].scale.set(1 - zip * 0.28, 0.35 + mold * 0.95, 1 - zip * 0.28);
        actinArcs[k].rotation.y = (k / 4) * tau + 0.35 + Math.sin(t * 2 + k) * 0.08;
      }

      // Apex fusion seam flash (p: 0.48..0.62) & neck rupture scission flash (p: 0.59..0.72)!
      const fuseApex = p > 0.48 && p < 0.63 ? Math.sin(((p - 0.48) / 0.15) * Math.PI) : 0;
      phagoFusionRing.visible = fuseApex > 0.02;
      phagoFusionMat.opacity = fuseApex * 0.95;
      phagoFusionRing.position.y = cupCy + cupR * 0.95;
      phagoFusionRing.scale.setScalar(1.3 - fuseApex * 0.85);

      const scisPhago = p > 0.59 && p < 0.72 ? Math.sin(((p - 0.59) / 0.13) * Math.PI) : 0;
      phagoScissionRing.visible = scisPhago > 0.02;
      phagoScissionMat.opacity = scisPhago * 0.98;
      phagoScissionRing.scale.setScalar(0.45 + scisPhago * 1.45);

      // Glistening sealed membrane film (película / fagossomo) encapsulating the impurity cleanly after zip-up!
      phagoVesicle.visible = p > 0.52;
      if (phagoVesicle.visible) {
        phagoVesicle.position.set(0, py, 0);
        phagoVesicle.scale.setScalar(Math.min(1, (p - 0.52) / 0.08));
      }

      // Intracellular lysosome glides in, fuses with the phagosome film, and releases glowing digestive enzymes!
      const lysoFuse = p > 0.72 ? smooth((p - 0.72) / 0.14) : 0;
      miniLyso.position.set(T.MathUtils.lerp(0.26, 0.07, lysoFuse), T.MathUtils.lerp(-0.52, -0.44, lysoFuse), 0.04);
      miniLyso.rotation.y = t * 0.9;
      miniLyso.scale.setScalar(1 + Math.sin(lysoFuse * Math.PI) * 0.25);
      miniLysoMat.emissiveIntensity = 0.4 + lysoFuse * 0.72;

      digestSparks.visible = p > 0.78;
      if (digestSparks.visible) {
        const du = smooth((p - 0.78) / 0.22);
        for (let i = 0; i < digestSparks.count; i++) {
          const a = i * 2.399 + t * 2.4;
          const r = 0.025 + du * 0.095;
          putDigest(i, Math.cos(a) * r, -0.44 + Math.sin(a * 1.7) * r * 0.8, Math.sin(a) * r, (1 - du * 0.55) * 1.1);
        }
        digestSparks.instanceMatrix.needsUpdate = true;
      }

      // ----- D2. PINOCYTOSIS: Circular hole opens in membrane -> deepens into Ω liquid flask -> neck ruptures -> pinosome film! -----
      const pp = (t * 0.27) % 1;
      const pOpen = pp < 0.28 ? smooth(pp / 0.28) : pp < 0.58 ? 1 : 1 - smooth((pp - 0.58) / 0.14);
      const pPinch = pp < 0.26 ? 0 : pp < 0.58 ? smooth((pp - 0.26) / 0.32) : 1 - smooth((pp - 0.58) / 0.1);
      const pHeal = pp >= 0.58 && pp < 0.84 ? Math.sin((pp - 0.58) * 30) * Math.exp(-(pp - 0.58) * 10) * 0.026 : 0;

      const omegaSurface = (u, th, out, openF, pinchF, healF, maxR = 0.26) => {
        const wave = Math.sin(u * 13 - t * 3 + th * 2) * 0.0045 + healF * Math.sin(u * 18);
        const flatR = u * maxR;
        const flatY = wave;
        if (openF < 0.002) {
          out.r = flatR;
          out.y = flatY;
          return;
        }
        const bulbR = 0.072 + pinchF * 0.036;
        const depth = 0.11 + openF * 0.09 + pinchF * 0.065;
        const neckAng = Math.PI * (0.48 + pinchF * 0.44); // 86° wide hole -> 166° pinched Ω flask!
        const lipR = Math.max(0.014, Math.sin(neckAng) * bulbR + (1 - pinchF) * 0.038);
        const lipY = -depth + bulbR * (1 - Math.cos(neckAng));
        let mr, my;
        if (u <= 0.56) {
          const s = u / 0.56;
          const ang = s * neckAng;
          mr = Math.sin(ang) * bulbR + (1 - pinchF) * 0.038 * s * s;
          my = -depth + bulbR * (1 - Math.cos(ang));
        } else if (u <= 0.72) {
          // Rolled glistening collar around the opening hole!
          const s = (u - 0.56) / 0.16;
          mr = T.MathUtils.lerp(lipR, 0.175, smooth(s));
          my = T.MathUtils.lerp(lipY, 0.0, smooth(s)) + Math.sin(s * Math.PI) * 0.018 * openF;
        } else {
          const s = (u - 0.72) / 0.28;
          mr = T.MathUtils.lerp(0.175, maxR, s);
          my = wave;
        }
        out.r = T.MathUtils.lerp(flatR, mr, openF);
        out.y = T.MathUtils.lerp(flatY, my, openF);
      };
      pinoMem.update((u, th, out) => omegaSurface(u, th, out, pOpen, pPinch, pHeal, 0.26));

      // Wet lip ring shrinks as the hole narrows to rupture!
      pinoRim.visible = pOpen > 0.05;
      pinoRim.scale.setScalar(Math.max(0.22, 1.15 - pPinch * 0.82));
      pinoRimMat.opacity = pOpen * (isPino ? 0.72 : 0.42);
      const pScis = pp > 0.55 && pp < 0.68 ? Math.sin(((pp - 0.55) / 0.13) * Math.PI) : 0;
      pinoScissionRing.visible = pScis > 0.02;
      pinoScissionMat.opacity = pScis * 0.98;
      pinoScissionRing.scale.setScalar(0.35 + pScis * 1.45);

      // Liquid H2O droplets & dissolved solutes swirl down INTO the opening hole before the neck seals!
      for (let i = 0; i < pinoDrops.count; i++) {
        const dp = (t * 0.46 + i / pinoDrops.count) % 1;
        const enter = pp < 0.58 ? 1 : 0.35;
        const funnel = dp < 0.45 ? 0.08 * (1 - dp * 1.3) : 0.022;
        const sc = (Math.sin(dp * Math.PI) * 0.42 + 0.72) * (pp < 0.6 ? 1 : 0.7);
        const y = 0.32 - dp * (0.28 + enter * 0.26);
        putPino(i, Math.sin(i * 2.1 + t * 1.4) * funnel, y, Math.cos(i * 1.7 + t * 1.4) * funnel, sc, sc, sc, t * 1.6 + i);
      }
      for (let i = 0; i < pinoSolutes.count; i++) {
        const sp = (t * 0.4 + i / pinoSolutes.count) % 1;
        const rad = sp < 0.5 ? 0.068 * (1 - sp) : 0.024;
        putPinoSol(i, Math.cos(i * 2.6 + t) * rad, 0.3 - sp * 0.5, Math.sin(i * 2.6 + t) * rad, 0.92);
      }
      pinoDrops.instanceMatrix.needsUpdate = true;
      pinoSolutes.instanceMatrix.needsUpdate = true;

      // Sealed gelatinous liquid pinosome bubble breaks off cleanly right at neck rupture (pp = 0.56)!
      pinoVesicle.visible = pp >= 0.54;
      if (pinoVesicle.visible) {
        const drop = smooth((pp - 0.54) / 0.44);
        pinoVesicle.position.set(Math.sin(drop * 4) * 0.018, T.MathUtils.lerp(-0.18, -0.5, drop), 0);
        const sc = pp < 0.62 ? 0.55 + ((pp - 0.54) / 0.08) * 0.45 : (drop > 0.86 ? Math.max(0.05, (1 - drop) / 0.14) : 1);
        pinoVesicle.scale.setScalar(sc);
        pinoVesicle.rotation.y = t * 1.25;
      }

      // ----- D3. RECEPTOR-MEDIATED: Membrane folds into Ω coated pit -> receptors ride & tilt inward -> Clathrin & Dynamin rupture! -----
      const rp = (t * 0.25) % 1;
      const rOpen = rp < 0.22 ? 0 : rp < 0.56 ? smooth((rp - 0.22) / 0.34) : 1 - smooth((rp - 0.56) / 0.14);
      const rPinch = rp < 0.36 ? 0 : rp < 0.58 ? smooth((rp - 0.36) / 0.22) : 1 - smooth((rp - 0.58) / 0.1);
      const rHeal = rp >= 0.58 && rp < 0.84 ? Math.sin((rp - 0.58) * 30) * Math.exp(-(rp - 0.58) * 10) * 0.024 : 0;

      recMem.update((u, th, out) => omegaSurface(u, th, out, rOpen, rPinch, rHeal, 0.26));

      // Goblet receptors PHYSICALLY RIDE the deforming Ω-pit surface & tilt radially inward with the folding bilayer!
      const surfTmp = { r: 0, y: 0 };
      const surfTmp2 = { r: 0, y: 0 };
      const recShow = rp < 0.62 ? 1 : smooth((rp - 0.66) / 0.14);
      for (let i = 0; i < recGoblets.length; i++) {
        const rg = recGoblets[i];
        omegaSurface(rg.u, rg.th, surfTmp, rOpen, rPinch, rHeal, 0.26);
        omegaSurface(Math.min(0.99, rg.u + 0.04), rg.th, surfTmp2, rOpen, rPinch, rHeal, 0.26);
        const gx = Math.cos(rg.th) * surfTmp.r;
        const gz = Math.sin(rg.th) * surfTmp.r;
        rg.grp.position.set(gx, surfTmp.y, gz);
        // Compute local inward/outward normal from meridian tangent (dr, dy)
        const dr = surfTmp2.r - surfTmp.r;
        const dy = surfTmp2.y - surfTmp.y;
        const len = Math.max(1e-4, Math.hypot(dr, dy));
        const nr = -dy / len, ny = dr / len;
        const normVec = v(Math.cos(rg.th) * nr, ny, Math.sin(rg.th) * nr).normalize();
        rg.grp.quaternion.setFromUnitVectors(upRef, normVec);
        rg.grp.scale.setScalar(Math.max(0.01, recShow));

        // Corresponding specific emerald LDL ligand descends & locks straight onto THIS goblet's live tilted cup!
        const cupWorld = v(gx, surfTmp.y, gz).addScaledVector(normVec, 0.115);
        if (rp < 0.24) {
          const u = smooth(rp / 0.24);
          putLig(i, T.MathUtils.lerp(gx * 1.4, cupWorld.x, u), T.MathUtils.lerp(0.34, cupWorld.y, u), T.MathUtils.lerp(gz * 1.4, cupWorld.z, u), 0.88, 0.88, 0.88, t * 2 + i);
        } else if (rp < 0.6) {
          putLig(i, cupWorld.x, cupWorld.y, cupWorld.z, 0.88, 0.88, 0.88, t * 2 + i);
        } else {
          // Fresh ligands approaching from extracellular space for next cycle
          const u = (rp - 0.6) / 0.4;
          putLig(i, gx * 1.5, 0.44 - u * 0.12, gz * 1.5, u * 0.85, u * 0.85, u * 0.85, t * 2 + i);
        }
      }
      recLigands.instanceMatrix.needsUpdate = true;

      // Geodesic Clathrin triskelion basket actively assembles underneath the folding pit!
      clathrinCage.visible = rOpen > 0.08 && rp < 0.62;
      if (clathrinCage.visible) {
        clathrinCage.position.y = -0.06 - rOpen * 0.095;
        clathrinCage.scale.setScalar(0.45 + rOpen * 0.62);
        clathrinCage.rotation.y = t * 0.5;
        clathrinMat.opacity = 0.25 + rOpen * 0.65;
      }

      // Golden spiral Dynamin scission collar cinches around the narrow neck until membrane rupture!
      const dynShow = rp > 0.44 && rp < 0.68 ? Math.sin(((rp - 0.44) / 0.24) * Math.PI) : 0;
      dynaminRing.visible = dynShow > 0.02;
      dynaminMat.opacity = dynShow * 0.98;
      dynaminRing.scale.setScalar(1.35 - rPinch * 0.95);
      dynaminRing.rotation.z = t * 4;

      // Incompatible amber macromolecules drift across the receptor pit IGNORED (proving high specificity!)
      recIgnored.visible = isRec;
      if (isRec) {
        for (let i = 0; i < recIgnored.count; i++) {
          const ip = (t * 0.28 + i / recIgnored.count) % 1;
          const ix = T.MathUtils.lerp(-0.32, 0.32, ip);
          const iy = 0.25 + Math.sin(ip * Math.PI) * 0.12 + (i - 1) * 0.045;
          putRecIgn(i, ix, iy, (i - 1) * 0.07, 0.72, 0.72, 0.72, t * 1.8 + i);
        }
        recIgnored.instanceMatrix.needsUpdate = true;
      }

      // Sealed Clathrin-coated vesicle breaks free right at Dynamin neck rupture (rp = 0.56)!
      recVesicle.visible = rp >= 0.55;
      if (recVesicle.visible) {
        const drop = smooth((rp - 0.55) / 0.43);
        recVesicle.position.set(Math.cos(drop * 3.5) * 0.016, T.MathUtils.lerp(-0.18, -0.5, drop), 0);
        const sc = rp < 0.62 ? 0.55 + ((rp - 0.55) / 0.07) * 0.45 : (drop > 0.86 ? Math.max(0.05, (1 - drop) / 0.14) : 1);
        recVesicle.scale.setScalar(sc);
        recVesicle.rotation.set(t * 0.6, t * 1.15, 0);
      }
    }

    // ZONE E: Exocytosis (Coiled SNARE zipper docking -> wet hourglass fusion neck dilation -> extracellular secretory plume!)
    exoZone.visible = isExo;
    if (isExo) {
      const p = (t * 0.38) % 1;
      const dock = smooth(Math.min(1, p / 0.42));
      const fuse = p > 0.42 ? smooth(Math.min(1, (p - 0.42) / 0.28)) : 0;
      exoVesicle.visible = p < 0.72;
      exoVesicle.position.set(0, T.MathUtils.lerp(-0.52, -0.06, dock), 0);
      exoVesicle.scale.set(1 + fuse * 0.35, Math.max(0.18, 1 - fuse * 0.8), 1 + fuse * 0.35);
      // Wet gelatinous fusion neck dilates open as coiled-coil SNAREs zip tightly inward!
      const dilate = 0.72 + Math.sin(fuse * Math.PI) * 0.68;
      exoNeck.scale.set(dilate, 1, dilate);
      exoNeckMat.opacity = 0.38 + Math.sin(fuse * Math.PI) * 0.34;
      for (const sc of snareCoils) {
        const rad = 0.162 - dock * 0.028 + Math.sin(fuse * Math.PI) * 0.025;
        sc.grp.position.x = Math.cos(sc.angle) * rad;
        sc.grp.position.z = Math.sin(sc.angle) * rad;
        sc.grp.rotation.y = t * 1.2 + fuse * 2.2;
      }
      exoPore.scale.setScalar(0.55 + Math.sin(fuse * Math.PI) * 0.95);
      exoPoreMat.opacity = 0.35 + Math.sin(fuse * Math.PI) * 0.65;
      for (let i = 0; i < exoCargo.count; i++) {
        const ang = i * 2.399;
        if (p < 0.46) {
          const r = 0.068;
          putExoCargo(i, Math.cos(ang) * r, exoVesicle.position.y + Math.sin(ang * 1.4) * r, Math.sin(ang) * r, 0.85);
        } else {
          const u = smooth((p - 0.46) / 0.54);
          const spread = 0.05 + u * 0.34;
          putExoCargo(i, Math.cos(ang + u) * spread, -0.02 + u * 0.56 + (i % 3) * 0.06 * u, Math.sin(ang + u) * spread, (1 - u * 0.45) * 1.15);
        }
      }
      exoCargo.instanceMatrix.needsUpdate = true;
    }
  });

  return updaters;
}

// ============================================================================
// 2. CYTOPLASM & CYTOSOL: Translucent Gel Dome + Streaming Flow + Free Polyribosomes
// ============================================================================
export function attachCytoplasmMicro(parent, type, rng, anchors) {
  const updaters = [];

  // Subtle translucent aqueous cytoplasmic gel core
  const gelGeo = new T.SphereGeometry(1, 36, 22, Math.PI * 0.86, Math.PI * 1.47);
  const gelScale = type === 'plant' ? [3.95, 2.72, 2.6] : type === 'bacteria' ? [3.98, 1.84, 1.88] : [3.96, 2.74, 2.72];
  const gelMat = membraneMaterial('#3aa8bd', { opacity: 0.075, clearcoat: 0.4, roughness: 0.28, bumpScale: 0.018 });
  const gel = mesh(parent, gelGeo, gelMat);
  gel.scale.set(...gelScale);
  gel.userData.shell = 0.075;

  // Open cytosolic pocket for free polyribosomes & enzymatic complexes
  const enzymePos = type === 'plant' ? [-1.15, 1.15, 1.1] : type === 'bacteria' ? [0.65, -0.58, 0.78] : [0.55, 0.42, 1.42];
  const enzymeCluster = group(parent, ...enzymePos);
  const mrnaPts = [v(-0.42, -0.05, 0.04), v(-0.2, 0.08, -0.03), v(0.02, -0.03, 0.06), v(0.24, 0.07, -0.02), v(0.44, -0.04, 0.03)];
  tube(enzymeCluster, glow('#b496f5', 0.35), mrnaPts, 0.016, false, 24, 6);
  const freeRiboMat = organelleMaterial('#68d0e8', { emissive: '#287e99', emissiveIntensity: 0.25, clearcoat: 0.65 });
  const freeRibos = [];
  for (let i = 0; i < 5; i++) {
    const pt = mrnaPts[i];
    const r = group(enzymeCluster, pt.x, pt.y, pt.z);
    sphere(r, freeRiboMat, 0.068, 0.052, 0.058, 0, 0.032, 0, 10);
    sphere(r, freeRiboMat, 0.048, 0.036, 0.044, 0, -0.026, 0, 10);
    freeRibos.push(r);
  }
  const enzSparks = instances(enzymeCluster, new T.SphereGeometry(0.024, 7, 5), glow('#ffe27a', 0.9), 14, true);
  const putEnz = instanceUpdater(enzSparks);

  createAnchor(parent, anchors, 'cytoplasm_gel', 0, 0.1, 0.3);
  createAnchor(parent, anchors, 'cytoplasm_stream', 0.3, -0.2, 0.9);
  createAnchor(enzymeCluster, anchors, 'cytoplasm_enzymes', 0, 0.05, 0);

  // Cytoplasmic streaming particles (144 macromolecules circulating softly in cytosol)
  const count = 144;
  const flowMat = glow('#8adce6', 0.4, { transparent: true, opacity: 0.48, depthWrite: false });
  const cytoFlow = instances(parent, new T.SphereGeometry(0.026, 7, 5), flowMat, count, true);
  const putFlow = instanceUpdater(cytoFlow);
  const seeds = [];
  for (let i = 0; i < count; i++) {
    seeds.push({
      angle: rng() * tau,
      radius: 0.32 + rng() * 0.58,
      yOff: (rng() - 0.5) * 1.85,
      speed: 0.08 + rng() * 0.14,
      bobFreq: 0.6 + rng() * 0.9,
      scale: 0.55 + rng() * 0.95
    });
  }

  let streamClock = 0;
  updaters.push((t, dt, activeKey, activeAnim) => {
    const isGel = activeAnim === 'cyto_gel';
    const isStream = activeAnim === 'cyto_stream';
    const isEnz = activeAnim === 'cyto_enzymes';

    gelMat.opacity += ((isGel ? 0.18 : activeKey === 'cytoplasm' ? 0.12 : 0.065) - gelMat.opacity) * (1 - Math.exp(-dt * 6));
    flowMat.emissiveIntensity = isStream ? 0.95 : 0.38;
    flowMat.opacity = isStream ? 0.85 : 0.45;
    streamClock += dt * (isStream ? 3.2 : 1.0);

    const rx = type === 'bacteria' ? 3.2 : 3.25;
    const ry = type === 'bacteria' ? 1.35 : 2.1;
    const rz = type === 'bacteria' ? 1.35 : 2.05;
    for (let i = 0; i < seeds.length; i++) {
      const s = seeds[i];
      const a = s.angle + streamClock * s.speed;
      const x = Math.cos(a) * s.radius * rx;
      const z = Math.sin(a) * s.radius * rz;
      const y = s.yOff * (type === 'bacteria' ? 0.58 : 1.0) + Math.sin(t * s.bobFreq + s.angle) * 0.22;
      putFlow(i, x, Math.max(-ry, Math.min(ry, y)), z, s.scale * (isStream ? 1.38 : 1));
    }
    cytoFlow.instanceMatrix.needsUpdate = true;

    // Free polyribosome enzymatic activity sparks
    enzSparks.visible = isEnz || activeKey === 'cytoplasm';
    if (enzSparks.visible) {
      for (let i = 0; i < enzSparks.count; i++) {
        const p = (t * (isEnz ? 0.8 : 0.35) + i / enzSparks.count) % 1;
        const a = p * tau * 1.4 + i * 0.9;
        const r = 0.14 + Math.sin(p * Math.PI) * 0.36;
        putEnz(i, Math.cos(a) * r, Math.sin(p * Math.PI * 2) * 0.16, Math.sin(a) * r * 0.7, isEnz ? 1.25 : 0.75);
      }
      enzSparks.instanceMatrix.needsUpdate = true;
    }
    for (let i = 0; i < freeRibos.length; i++) {
      freeRibos[i].scale.setScalar(1 + (isEnz ? Math.sin(t * 6 + i) * 0.12 : 0));
    }
  });

  return { updaters, cytoFlow };
}

// ============================================================================
// ============================================================================
// 3. NUCLEUS MICRO-ASSEMBLY: Double Envelope + Nuclear Lamina + Full DNA
//    Compaction Hierarchy (2 nm -> Histones H2A/H2B/H3/H4+H1 -> 10 nm -> 30 nm
//    -> 1400 nm Chromosome) + Epigenetic Acetylation/Transcription + Nucleolus
//    40S/60S Assembly + True Hollow Octameric NPC + Master Command Cascade!
// ============================================================================
export function attachNucleusMicro(parent, anchors) {
  const updaters = [];
  const mkTag = (host, text, x, y, z, border = '#c4a8ff', color = '#f4ecff', sc = 0.145) => {
    const sp = labelSprite(text, { scale: sc, border, color, font: '700 26px system-ui, sans-serif', depthTest: false });
    sp.position.set(x, y, z);
    sp.renderOrder = 14;
    sp.visible = false;
    host.add(sp);
    return sp;
  };

  createAnchor(parent, anchors, 'nucleus_main', 0, 0.05, 0.18);
  createAnchor(parent, anchors, 'nucleus_chromatin', 0.24, -0.14, 0.42);
  createAnchor(parent, anchors, 'nucleus_nucleolus', -0.14, 0.06, 0.22);
  createAnchor(parent, anchors, 'nucleus_command', 0.06, 0.12, 0.36);

  // --- A. FULL 4-LEVEL DNA COMPACTION & HISTONE HIERARCHY (2 nm -> 10 nm -> 30 nm -> 1400 nm!) ---
  const histGroup = group(parent, 0.22, -0.18, 0.44);
  createAnchor(histGroup, anchors, 'nucleus_histones', 0.04, 0.02, 0.08);

  // Level 1: Free 2 nm double-helix DNA entering on the left (-0.54 .. -0.34)
  const dnaMatA = proteinMaterial('#ffe070', { emissive: '#c48014', emissiveIntensity: 0.45, clearcoat: 0.9 });
  const dnaMatB = proteinMaterial('#d69eff', { emissive: '#6e3cc4', emissiveIntensity: 0.45, clearcoat: 0.9 });
  const freeA = [], freeB = [];
  for (let i = 0; i <= 14; i++) {
    const u = i / 14;
    const x = -0.54 + u * 0.20;
    const a = u * tau * 2.2;
    freeA.push(v(x, Math.cos(a) * 0.022, Math.sin(a) * 0.022));
    freeB.push(v(x, -Math.cos(a) * 0.022, -Math.sin(a) * 0.022));
  }
  tube(histGroup, dnaMatA, freeA, 0.007, false, 20, 6);
  tube(histGroup, dnaMatB, freeB, 0.007, false, 20, 6);

  // Level 2: 5 Sculpted Histone Octamers (H2A, H2B, H3, H4 — 2 copies each!) + 1.65-turn DNA wrap + Histone H1 clamp!
  const histColors = ['#42d8c8', '#52b8f5', '#68e898', '#ff9e70'];
  const histMats = histColors.map(hex => proteinMaterial(hex, { emissive: hex, emissiveIntensity: 0.24, clearcoat: 0.88 }));
  const h1Mat = proteinMaterial('#ffd65e', { emissive: '#b57b14', emissiveIntensity: 0.45, clearcoat: 0.94 });
  const wrapMat = glow('#dfadff', 0.52);
  const acetylMat = glow('#82ffbe', 1.0);

  const nucleosomes = [];
  for (let i = 0; i < 5; i++) {
    const nx = -0.28 + i * 0.125;
    const ny = Math.sin(i * 1.35) * 0.055;
    const nuc = group(histGroup, nx, ny, 0.01);
    // 8 distinct subunit lobes (2× H2A, H2B, H3, H4 octamer cylinder!)
    for (let s = 0; s < 8; s++) {
      const sa = (s / 4) * tau + (s >= 4 ? 0.4 : 0);
      const sz = s >= 4 ? 0.016 : -0.016;
      sphere(nuc, histMats[s % 4], 0.021, 0.021, 0.018, Math.cos(sa) * 0.024, Math.sin(sa) * 0.024, sz, 9);
    }
    // 1.65 turns of DNA (~147 bp) physically coiling around the histone octamer!
    const wPts = Array.from({ length: 24 }, (_, k) => {
      const f = k / 23;
      const a = f * tau * 1.65;
      return v(Math.cos(a) * 0.052, Math.sin(a) * 0.052, (f - 0.5) * 0.044);
    });
    tube(nuc, wrapMat, wPts, 0.009, false, 24, 6);
    // Linker Histone H1 locking the DNA entry/exit neck!
    capsule(nuc, h1Mat, 0.013, 0.028, 0, -0.056, 0.018, 6, 8);
    // Epigenetic Histone-Tail Acetyl tags (Ac — glow & open chromatin during euchromatin step!)
    const acA = sphere(nuc, acetylMat, 0.014, 0.014, 0.014, 0.036, 0.058, 0.024, 7);
    const acB = sphere(nuc, acetylMat, 0.014, 0.014, 0.014, -0.036, 0.058, -0.024, 7);
    acA.visible = acB.visible = false;
    nucleosomes.push({ grp: nuc, baseX: nx, baseY: ny, acA, acB });
  }

  // Dynamic linker DNA connecting the 5 nucleosomes -> 30 nm chromatin solenoid!
  const solPts = Array.from({ length: 22 }, (_, k) => {
    const f = k / 21;
    const a = f * tau * 3.2;
    return v(0.26 + f * 0.15, Math.sin(a) * 0.058, Math.cos(a) * 0.058);
  });
  const solenoid = tube(histGroup, proteinMaterial('#a884f5', { emissive: '#5936b8', emissiveIntensity: 0.36, clearcoat: 0.8 }), solPts, 0.016, false, 28, 7);

  // Level 4: Condensed Metaphase X-Chromosome (1400 nm) with sister chromatids, centromere + kinetochore & glowing telomeres!
  const miniChr = group(histGroup, 0.52, 0.02, 0.02);
  const armMat = organelleMaterial('#9d86f5', { emissive: '#5942bd', emissiveIntensity: 0.34, clearcoat: 0.78 });
  const teloMat = glow('#ff6b7a', 0.72);
  const capGeo = new T.CapsuleGeometry(0.030, 0.28, 6, 12);
  const cA = mesh(miniChr, capGeo, armMat);
  cA.rotation.z = 0.28;
  const cB = mesh(miniChr, capGeo, armMat);
  cB.rotation.z = -0.28;
  sphere(miniChr, glow('#ffd269', 0.85), 0.046, 0.034, 0.046, 0, 0, 0, 10);
  for (const [tx, ty] of [[-0.046, 0.16], [0.046, 0.16], [-0.046, -0.16], [0.046, -0.16]]) {
    sphere(miniChr, teloMat, 0.031, 0.026, 0.031, tx, ty, 0, 8);
  }

  // Sculpted RNA Polymerase II + emerging nascent mRNA ribbon (visible in chromatin/epigenetics step!)
  const rnaPol = group(histGroup, 0.02, 0.08, 0.06);
  mesh(rnaPol, organicDisplace(new T.SphereGeometry(0.048, 12, 10), 0.14, 4, 2),
    proteinMaterial('#58e8f5', { emissive: '#1888a8', emissiveIntensity: 0.55, clearcoat: 0.92 }));
  const nascentMrna = tube(rnaPol, glow('#ffdf6e', 0.92), [v(0, 0.02, 0.02), v(0.06, 0.09, 0.05), v(0.14, 0.13, 0.02), v(0.22, 0.18, 0.06)], 0.011, false, 16, 6);
  rnaPol.visible = false;

  // --- B. HERO HOLLOW OCTAMERIC NUCLEAR PORE COMPLEX (NPC) ON UPPER-FRONT ENVELOPE ---
  const porePos = v(0.46, 0.56, 0.74);
  const poreDir = porePos.clone().normalize();
  const heroPore = group(parent, porePos.x, porePos.y, porePos.z);
  heroPore.quaternion.setFromUnitVectors(v(0, 1, 0), poreDir);
  const spokeMat = organelleMaterial('#d6c6ff', { emissive: '#7556cf', emissiveIntensity: 0.34, clearcoat: 0.85 });
  // True open hollow double-walled NPC cylinder bore!
  lathe(heroPore, proteinMaterial('#8870e6', { emissive: '#422ea8', emissiveIntensity: 0.28, clearcoat: 0.85 }), [
    [0.064, -0.085], [0.118, -0.085], [0.125, 0], [0.118, 0.085], [0.064, 0.085], [0.064, -0.085]
  ], 18);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * tau;
    sphere(heroPore, spokeMat, 0.036, 0.028, 0.036, Math.cos(a) * 0.112, 0.052, Math.sin(a) * 0.112, 9);
    // Cytoplasmic filaments extending outward (+Y) & Nuclear Basket fibrils extending inward (-Y)!
    rod(heroPore, glow('#a8e8ff', 0.55), v(Math.cos(a) * 0.10, 0.06, Math.sin(a) * 0.10), v(Math.cos(a) * 0.15, 0.20, Math.sin(a) * 0.15), 0.008, 5);
    rod(heroPore, glow('#82f0c8', 0.5), v(Math.cos(a) * 0.095, -0.06, Math.sin(a) * 0.095), v(Math.cos(a) * 0.055, -0.22, Math.sin(a) * 0.055), 0.007, 5);
  }
  torus(heroPore, glow('#82f0c8', 0.55), 0.055, 0.009, 0, -0.22, 0).rotation.x = Math.PI / 2; // nuclear basket ring!
  createAnchor(heroPore, anchors, 'nucleus_pore', 0, 0.05, 0);

  // Bidirectional Ran-GTP traffic through hollow NPC bore:
  // 1) Exporting golden mRNA + ribosomal subunits OUT (+Y)
  const mrnaExport = instances(heroPore, new T.SphereGeometry(0.022, 8, 6), glow('#ffcf6e', 0.95), 14, true);
  const putExport = instanceUpdater(mrnaExport);
  // 2) Importing cyan/emerald transcription factors & histones IN (-Y)
  const factorImport = instances(heroPore, new T.OctahedronGeometry(0.026, 0), glow('#6ef5d8', 0.95), 8, true);
  const putImport = instanceUpdater(factorImport);

  // Active transcription chromatin sparks
  const txSparks = instances(parent, new T.SphereGeometry(0.030, 8, 6), glow('#78f5ff', 0.95), 16, true);
  const putTx = instanceUpdater(txSparks);

  // Pre-ribosomal 40S & 60S subunits budding off the spongy nucleolus toward nuclear pores!
  const ribo60Buds = instances(parent, new T.SphereGeometry(0.040, 9, 7), glow('#ff9ee2', 0.88), 10, true);
  const ribo40Buds = instances(parent, new T.SphereGeometry(0.026, 8, 6), glow('#78e8ff', 0.88), 10, true);
  const put60 = instanceUpdater(ribo60Buds);
  const put40 = instanceUpdater(ribo40Buds);

  // Master-Command radial instruction waves radiating from Nucleus out through pores into cell!
  const cmdWaves = instances(parent, new T.SphereGeometry(0.032, 8, 6), glow('#ffe370', 1.05), 18, true);
  const putCmd = instanceUpdater(cmdWaves);

  // Crisp contextual 3D tags shown ONLY during their active step!
  const tagEnv = mkTag(parent, 'Carioteca dupla + Lâmina nuclear (verde) + Ribossomos', 0.05, 1.18, 0.35, '#8ef0dc', '#e0fff8', 0.14);
  const tagHist = mkTag(histGroup, 'DNA 2 nm → Histonas (H2A/H2B/H3/H4 + H1) → 10 nm → 30 nm → Cromossomo', 0.02, 0.25, 0.14, '#ffe070', '#fff7d6', 0.125);
  const tagEuch = mkTag(histGroup, 'Acetilação (Ac) abre Eucromatina → RNA Pol II transcreve mRNA', 0.02, 0.28, 0.14, '#82ffbe', '#dcffef', 0.125);
  const tagNolus = mkTag(parent, 'Nucléolo · Síntese de rRNA → Subunidades 40S e 60S', -0.14, 0.56, 0.32, '#ff9ee2', '#ffe8f8', 0.135);
  const tagPore = mkTag(heroPore, 'Poro nuclear oco · Exporta mRNA/ribossomos · Importa histonas/FTs', 0.05, 0.34, 0.08, '#d6c6ff', '#f3eeff', 0.125);
  const tagCmd = mkTag(parent, 'Comando central: sinais → genes → mRNA + ribossomos → toda a célula', 0.05, 1.24, 0.38, '#ffe370', '#fff7d6', 0.135);

  updaters.push((t, _dt, activeKey, activeAnim) => {
    const isEnv = activeAnim === 'nucleus_envelope';
    const isHist = activeAnim === 'nucleus_histones';
    const isChrom = activeAnim === 'nucleus_chromatin';
    const isNuc = activeAnim === 'nucleus_nucleolus';
    const isPore = activeAnim === 'nucleus_pore';
    const isCmd = activeAnim === 'nucleus_command';

    tagEnv.visible = isEnv;
    tagHist.visible = isHist;
    tagEuch.visible = isChrom;
    tagNolus.visible = isNuc;
    tagPore.visible = isPore;
    tagCmd.visible = isCmd;

    histGroup.visible = isHist || isChrom || activeKey === 'nucleus';
    if (histGroup.visible) {
      miniChr.rotation.y = Math.sin(t * 1.4) * 0.45;
      solenoid.rotation.x = isHist ? Math.sin(t * 1.8) * 0.25 : 0;
      const openWave = isChrom ? (0.5 + 0.5 * Math.sin(t * 2.2)) : 0;
      for (let i = 0; i < nucleosomes.length; i++) {
        const n = nucleosomes[i];
        // During Epigenetics step: Acetyl tags dock & nucleosomes slide apart opening euchromatin!
        const spread = (i - 2) * openWave * 0.042;
        n.grp.position.x = n.baseX + spread;
        n.grp.position.y = n.baseY + Math.sin(t * 2.4 + i) * (isHist || isChrom ? 0.012 : 0.004);
        n.grp.rotation.z = isHist ? Math.sin(t * 1.6 + i) * 0.22 : 0;
        n.acA.visible = n.acB.visible = isChrom;
      }
      rnaPol.visible = isChrom;
      if (isChrom) {
        const rx = -0.22 + ((t * 0.24) % 1) * 0.44;
        rnaPol.position.set(rx, 0.095, 0.06);
        nascentMrna.scale.setScalar(0.55 + ((t * 0.24) % 1) * 0.65);
      }
      armMat.emissiveIntensity = isHist ? 0.62 + Math.cos(t * 4) * 0.18 : 0.28;
    }

    txSparks.visible = isChrom || isCmd;
    if (txSparks.visible) {
      for (let i = 0; i < txSparks.count; i++) {
        const p = (t * 0.52 + i / txSparks.count) % 1;
        const a = p * 9.5 + (i % 5);
        putTx(i, Math.cos(a) * (0.46 + (i % 5) * 0.04), -0.42 + p * 0.84, Math.sin(a * 1.15) * 0.42, 0.8 + Math.sin(t * 8 + i) * 0.32);
      }
      txSparks.instanceMatrix.needsUpdate = true;
    }

    ribo60Buds.visible = ribo40Buds.visible = isNuc || isCmd;
    if (ribo60Buds.visible) {
      for (let i = 0; i < ribo60Buds.count; i++) {
        const p = (t * 0.38 + i / ribo60Buds.count) % 1;
        const a = i * 2.399;
        const el = (i % 4 - 1.5) * 0.42;
        const r = 0.36 + p * 0.56;
        const sc = Math.sin(p * Math.PI) * 1.15;
        put60(i, -0.14 + Math.cos(a) * r, 0.06 + Math.sin(el) * r, 0.16 + Math.sin(a) * r * 0.65, sc);
        put40(i, -0.14 + Math.cos(a + 0.32) * (r * 0.92), 0.06 + Math.sin(el + 0.2) * r, 0.16 + Math.sin(a + 0.32) * r * 0.65, sc);
      }
      ribo60Buds.instanceMatrix.needsUpdate = true;
      ribo40Buds.instanceMatrix.needsUpdate = true;
    }

    mrnaExport.visible = isPore || isCmd || activeKey === 'nucleus';
    factorImport.visible = isPore || isCmd;
    spokeMat.emissiveIntensity = isPore || isCmd ? 0.72 + Math.sin(t * 5) * 0.2 : 0.32;
    if (mrnaExport.visible) {
      for (let i = 0; i < mrnaExport.count; i++) {
        const p = (t * (isPore || isCmd ? 0.52 : 0.24) + i / mrnaExport.count) % 1;
        const y = -0.24 + p * 0.68;
        const wiggle = Math.sin(p * 12 - t * 6) * 0.022;
        putExport(i, wiggle, y, Math.cos(p * 10 - t * 5) * 0.018, Math.sin(p * Math.PI) * 0.55 + 0.6);
      }
      mrnaExport.instanceMatrix.needsUpdate = true;
    }
    if (factorImport.visible) {
      for (let i = 0; i < factorImport.count; i++) {
        const p = (t * 0.46 + i / factorImport.count) % 1;
        const y = 0.40 - p * 0.64; // flowing INWARD through the hollow NPC!
        putImport(i, Math.cos(i * 2.1) * 0.028, y, Math.sin(i * 2.1) * 0.028, Math.sin(p * Math.PI) * 1.15);
      }
      factorImport.instanceMatrix.needsUpdate = true;
    }

    cmdWaves.visible = isCmd;
    if (isCmd) {
      for (let i = 0; i < cmdWaves.count; i++) {
        const p = (t * 0.44 + i / cmdWaves.count) % 1;
        const phi = Math.PI * 0.85 + (i % 6) * 0.44;
        const th = 0.65 + Math.floor(i / 6) * 0.78;
        const r = 0.96 + p * 0.78;
        putCmd(i, -Math.cos(phi) * Math.sin(th) * r, Math.cos(th) * r * 0.92, Math.sin(phi) * Math.sin(th) * r, Math.sin(p * Math.PI) * 1.2);
      }
      cmdWaves.instanceMatrix.needsUpdate = true;
    }
  });

  return updaters;
}

// ============================================================================
// 4. RER, SER & GOLGI MICRO-ASSEMBLIES
// ============================================================================
export function attachRERMicro(parent, anchors) {
  const updaters = [];
  createAnchor(parent, anchors, 'rer_main', 0, 0, 0.2);
  createAnchor(parent, anchors, 'rer_ribosomes', 0.12, 0.55, 0.12);
  createAnchor(parent, anchors, 'rer_budding', 0.85, -0.05, 0.32);

  // Translating polypeptide chains plunging through ER translocons into cisternal lumen
  const polyBeads = instances(parent, new T.SphereGeometry(0.026, 7, 5), glow('#ffe07d', 0.88), 16, true);
  const putPoly = instanceUpdater(polyBeads);
  const budHalo = torus(parent, glow('#7ae6ff', 0.8, { transparent: true, opacity: 0, depthWrite: false }), 0.24, 0.022, 0.85, -0.05, 0.32);

  updaters.push((t, _dt, _key, activeAnim) => {
    const isTrans = activeAnim === 'rer_translocate';
    const isBud = activeAnim === 'rer_bud';
    polyBeads.visible = isTrans;
    if (isTrans) {
      for (let i = 0; i < 4; i++) {
        const rx = -0.35 + i * 0.24;
        for (let b = 0; b < 4; b++) {
          const p = (t * 0.65 + b * 0.25 + i * 0.17) % 1;
          putPoly(i * 4 + b, rx + Math.sin(p * 9 + i) * 0.03, 0.58 - p * 0.32, 0.1 + Math.cos(p * 8) * 0.03, 0.85 + Math.sin(p * Math.PI) * 0.3);
        }
      }
      polyBeads.instanceMatrix.needsUpdate = true;
    }
    budHalo.visible = isBud;
    if (isBud) {
      const p = (t * 1.2) % 1;
      budHalo.scale.setScalar(0.6 + p * 1.1);
      budHalo.material.opacity = (1 - p) * 0.82;
    }
  });
  return updaters;
}

export function attachSERMicro(parent, anchors) {
  const updaters = [];
  createAnchor(parent, anchors, 'ser_main', 0, 0, 0.15);
  createAnchor(parent, anchors, 'ser_lipids', 0.18, 0.18, 0.28);
  createAnchor(parent, anchors, 'ser_calcium', -0.1, 0.05, 0.25);

  const lipidBuds = instances(parent, new T.SphereGeometry(0.052, 9, 7), glow('#f7cc6a', 0.72), 10, true);
  const putLipid = instanceUpdater(lipidBuds);
  const caSparks = instances(parent, new T.SphereGeometry(0.028, 8, 6), glow('#73ffbf', 0.95), 24, true);
  const putCa = instanceUpdater(caSparks);

  updaters.push((t, _dt, _key, activeAnim) => {
    const isLipid = activeAnim === 'ser_lipids';
    const isCa = activeAnim === 'ser_calcium';
    lipidBuds.visible = isLipid;
    if (isLipid) {
      for (let i = 0; i < lipidBuds.count; i++) {
        const p = (t * 0.42 + i / lipidBuds.count) % 1;
        const x = ((i % 5) - 2) * 0.34;
        const y = (i < 5 ? 0.18 : -0.18) + p * 0.36;
        const z = 0.25 + Math.sin(i * 1.9) * 0.18;
        putLipid(i, x, y, z, Math.sin(p * Math.PI) * 1.15);
      }
      lipidBuds.instanceMatrix.needsUpdate = true;
    }
    caSparks.visible = isCa;
    if (isCa) {
      for (let i = 0; i < caSparks.count; i++) {
        const p = (t * 0.72 + i / caSparks.count) % 1;
        const a = i * 2.399;
        const r = 0.18 + p * 0.85;
        putCa(i, Math.cos(a) * r, Math.sin(a * 1.3) * r * 0.65, Math.sin(a) * r * 0.7, (1 - p) * 1.25);
      }
      caSparks.instanceMatrix.needsUpdate = true;
    }
  });
  return updaters;
}

export function attachGolgiMicro(parent, anchors) {
  const updaters = [];
  createAnchor(parent, anchors, 'golgi_cis', -0.2, 0.42, 0.1);
  createAnchor(parent, anchors, 'golgi_medial', 0, 0.02, 0.26);
  createAnchor(parent, anchors, 'golgi_trans', 0.45, -0.32, 0.28);
  createAnchor(parent, anchors, 'golgi_route', 0.75, -0.15, 0.35);

  const glycoSparks = instances(parent, new T.SphereGeometry(0.034, 8, 6), glow('#8ef7e6', 0.9), 14, true);
  const putGlyco = instanceUpdater(glycoSparks);
  const sortPink = instances(parent, new T.SphereGeometry(0.068, 9, 7), glow('#f28ac4', 0.68), 4, true);
  const putPink = instanceUpdater(sortPink);

  updaters.push((t, _dt, _key, activeAnim) => {
    const isProc = activeAnim === 'golgi_process';
    const isTrans = activeAnim === 'golgi_trans';
    glycoSparks.visible = isProc;
    if (isProc) {
      for (let i = 0; i < glycoSparks.count; i++) {
        const p = (t * 0.5 + i / glycoSparks.count) % 1;
        const y = 0.42 - p * 0.82;
        const x = Math.sin(p * 10 + i) * 0.55;
        putGlyco(i, x, y, 0.36 + Math.cos(p * 6 + i) * 0.12, Math.sin(p * Math.PI) * 1.15);
      }
      glycoSparks.instanceMatrix.needsUpdate = true;
    }
    sortPink.visible = isTrans;
    if (isTrans) {
      for (let i = 0; i < sortPink.count; i++) {
        const p = (t * 0.5 + i / sortPink.count) % 1;
        putPink(i, -0.78 - p * 0.55, -0.22 - p * 0.28 + Math.sin(p * Math.PI) * 0.12, 0.25 + p * 0.2, Math.sin(p * Math.PI) * 1.1);
      }
      sortPink.instanceMatrix.needsUpdate = true;
    }
  });
  return updaters;
}

// ============================================================================
// 5. MITOCHONDRIA MICRO-ASSEMBLY: Outer VDAC Porins + Inner MPC Pyruvate Carrier
//    + Sculpted Crista Bilayer (Complexes I, II, Q, III, Cit c, IV + O2->H2O)
//    + Rotating F0F1 ATP Synthase Molecular Turbine + Krebs Ring + mtDNA + 55S Ribos
// ============================================================================
export function attachMitoMicro(parent, anchors) {
  const updaters = [];
  createAnchor(parent, anchors, 'mito_main', 0, 0, 0.2);
  createAnchor(parent, anchors, 'mito_channels', -0.26, 0.26, 0.38);
  createAnchor(parent, anchors, 'mito_cristae', -0.06, -0.02, 0.37);
  createAnchor(parent, anchors, 'mito_atp', 0.34, -0.05, 0.37);
  createAnchor(parent, anchors, 'mito_matrix', 0.04, -0.1, 0.3);

  const addTag = (host, text, x, y, z, border = '#74d8eb', color = '#eef7fa', sc = 0.052) => {
    const sp = labelSprite(text, { scale: sc, border, color, font: '700 26px system-ui, sans-serif', depthTest: false });
    sp.position.set(x, y, z);
    sp.renderOrder = 10;
    sp.visible = false;
    host.add(sp);
    return sp;
  };

  // --- A. OUTER MEMBRANE VDAC PORINS + INNER PYRUVATE CARRIER (MPC) ON FRONT CUTAWAY RIM ---
  const channelZone = group(parent, -0.26, 0.32, 0.36);
  const porinMat = organelleMaterial('#53b9cf', { emissive: '#1e6e85', emissiveIntensity: 0.28, clearcoat: 0.72, roughness: 0.26 });
  const mpcMat = organelleMaterial('#66d99a', { emissive: '#227a4d', emissiveIntensity: 0.3, clearcoat: 0.72, roughness: 0.26 });
  const porinCoords = [[-0.24, 0.04, 0.02], [-0.04, 0.09, 0.04], [0.18, 0.07, 0.04], [0.42, 0.02, 0.02]];
  for (const [px, py, pz] of porinCoords) {
    const pore = group(channelZone, px, py, pz);
    pore.rotation.z = -px * 0.45;
    // Beta-barrel porin ring (6 staves around open central lumen)
    for (let s = 0; s < 6; s++) {
      const a = (s / 6) * tau;
      cylinder(pore, porinMat, 0.014, 0.014, 0.095, Math.cos(a) * 0.032, 0, Math.sin(a) * 0.032, 7);
    }
    const ring = torus(pore, glow('#7cf2ff', 0.78, { transparent: true, opacity: 0.72, depthWrite: false }), 0.03, 0.006, 0, 0.048, 0);
    ring.rotation.x = Math.PI / 2;
  }
  // Dedicated Pyruvate Carrier (MPC) spanning inner boundary membrane directly below central porin!
  const mpc = group(channelZone, -0.02, -0.1, 0.06);
  const mpcL = cylinder(mpc, mpcMat, 0.024, 0.024, 0.11, -0.022, 0, 0, 9);
  const mpcR = cylinder(mpc, mpcMat, 0.024, 0.024, 0.11, 0.022, 0, 0, 9);
  const mpcRing = torus(mpc, glow('#8effc4', 0.8, { transparent: true, opacity: 0.65, depthWrite: false }), 0.034, 0.006, 0, 0.052, 0);
  mpcRing.rotation.x = Math.PI / 2;
  const pyrIn = instances(channelZone, new T.SphereGeometry(0.018, 8, 6), glow('#9eff9e', 0.95), 8, true);
  const putPyr = instanceUpdater(pyrIn);
  const ionIn = instances(channelZone, new T.SphereGeometry(0.014, 7, 5), glow('#7ceeff', 0.92), 8, true);
  const putIonIn = instanceUpdater(ionIn);

  // --- B. HERO CRISTA MEMBRANE BENCH: COMPLEXES I, II, Q, III, Cit c, IV + F0F1 ATP SYNTHASE ---
  const cristaBench = group(parent, 0.04, 0.02, 0.36);
  // Translucent cutaway crista bilayer slab (+Y = Intermembrane Space [H+], -Y = Matrix)
  const bilayerSlab = box(cristaBench, membraneMaterial('#f09c72', { opacity: 0.52, clearcoat: 0.8 }), 0.92, 0.068, 0.15, 0, 0, 0);
  // Tiny hydrophilic lipid head rows along top & bottom edges of the cutaway crista membrane!
  const cristaHeads = instances(cristaBench, new T.SphereGeometry(0.011, 6, 5), glow('#ffd2a8', 0.32), 64);
  const putCHead = instanceUpdater(cristaHeads);
  let chIdx = 0;
  for (let i = 0; i < 32; i++) {
    const lx = -0.44 + i * 0.0285;
    putCHead(chIdx++, lx, 0.036, 0.068);
    putCHead(chIdx++, lx, -0.036, 0.068);
  }
  cristaHeads.instanceMatrix.needsUpdate = true;

  // Cyan H+ gradient shimmer sheet right above the crista (+Y = intermembrane space)
  const hHazeMat = glow('#5ce8ff', 0.65, { transparent: true, opacity: 0.12, depthWrite: false });
  mesh(cristaBench, new T.PlaneGeometry(0.92, 0.16), hHazeMat, 0, 0.115, -0.02);

  // Sculpted transmembrane Complex I (L-shaped NADH dehydrogenase, proton pump)
  const cIMat = organelleMaterial('#8a7cf0', { emissive: '#3e32a8', emissiveIntensity: 0.28, clearcoat: 0.68 });
  const cI = group(cristaBench, -0.37, 0, 0.01);
  cylinder(cI, cIMat, 0.042, 0.046, 0.145, 0, 0.005, 0, 12);
  const cIArm = cylinder(cI, cIMat, 0.032, 0.028, 0.12, -0.048, -0.078, 0.015, 10);
  cIArm.rotation.z = 0.42;
  torus(cI, glow('#b5abff', 0.72), 0.03, 0.007, 0, 0.075, 0).rotation.x = Math.PI / 2;

  // Complex II (Succinate dehydrogenase, matrix-facing)
  const cIIMat = organelleMaterial('#4fd1b0', { emissive: '#1e7861', emissiveIntensity: 0.25, clearcoat: 0.65 });
  const cII = group(cristaBench, -0.24, -0.02, 0.015);
  mesh(cII, new T.SphereGeometry(0.038, 12, 10), cIIMat, 0, 0.01, 0);
  mesh(cII, new T.SphereGeometry(0.032, 10, 8), cIIMat, 0.008, -0.045, 0.012);

  // Mobile Ubiquinone (Q) oscillating inside the hydrophobic core of the crista bilayer!
  const qCar = group(cristaBench, -0.14, 0, 0.045);
  torus(qCar, glow('#ffd066', 0.85), 0.022, 0.008, 0, 0, 0);

  // Complex III (Cytochrome bc1 dimer, proton pump)
  const cIIIMat = organelleMaterial('#de74b2', { emissive: '#8f2e68', emissiveIntensity: 0.28, clearcoat: 0.68 });
  const cIII = group(cristaBench, -0.04, 0, 0.01);
  cylinder(cIII, cIIIMat, 0.034, 0.038, 0.15, -0.022, 0.005, 0, 10);
  cylinder(cIII, cIIIMat, 0.034, 0.038, 0.15, 0.022, 0.005, 0, 10);
  torus(cIII, glow('#ffaad9', 0.7), 0.036, 0.006, 0, 0.078, 0).rotation.x = Math.PI / 2;

  // Mobile Cytochrome c hopping along intermembrane surface (+Y) between III and IV!
  const citC = mesh(cristaBench, new T.SphereGeometry(0.026, 10, 8), glow('#ff9f66', 0.8), 0.05, 0.088, 0.03);

  // Complex IV (Cytochrome c oxidase, O2 -> H2O reduction & proton pump!)
  const cIVMat = organelleMaterial('#53b4f0', { emissive: '#1e69a6', emissiveIntensity: 0.28, clearcoat: 0.7 });
  const cIV = group(cristaBench, 0.13, 0, 0.01);
  cylinder(cIV, cIVMat, 0.042, 0.048, 0.155, 0, 0.005, 0, 12);
  torus(cIV, glow('#8fd9ff', 0.75), 0.032, 0.007, 0, 0.08, 0).rotation.x = Math.PI / 2;
  // Twin O2 molecule docking beneath Complex IV (matrix face)
  const o2Pair = group(cristaBench, 0.13, -0.135, 0.045);
  mesh(o2Pair, new T.SphereGeometry(0.018, 9, 7), glow('#ff758a', 0.85), -0.016, 0, 0);
  mesh(o2Pair, new T.SphereGeometry(0.018, 9, 7), glow('#ff758a', 0.85), 0.016, 0, 0);

  // Glowing golden electron transport pathway curve (I -> Q -> III -> Cit c -> IV -> O2)
  const etcPath = new T.CatmullRomCurve3([
    v(-0.41, -0.08, 0.055), v(-0.37, 0.0, 0.062), v(-0.14, 0.0, 0.068),
    v(-0.04, 0.02, 0.065), v(0.05, 0.085, 0.062), v(0.13, 0.01, 0.065), v(0.13, -0.11, 0.055)
  ]);
  const etcArcMat = glow('#ffe37d', 0.85, { transparent: true, opacity: 0.32, depthWrite: false });
  const etcArc = mesh(cristaBench, new T.TubeGeometry(etcPath, 42, 0.0065, 6, false), etcArcMat);

  // --- C. HERO ROTATING F0F1 ATP SYNTHASE MOLECULAR TURBINE (x = +0.31) ---
  const atpSynth = group(cristaBench, 0.31, 0, 0.015);
  const f0Mat = organelleMaterial('#4ac7d6', { emissive: '#1a7585', emissiveIntensity: 0.32, clearcoat: 0.78 });
  const stalkMat = organelleMaterial('#d9f5ff', { emissive: '#58b8cc', emissiveIntensity: 0.35, clearcoat: 0.82 });
  const statorMat = organelleMaterial('#8da4ba', { roughness: 0.34, metalness: 0.25 });
  const f1AlphaMat = organelleMaterial('#58e0ae', { emissive: '#1e8a62', emissiveIntensity: 0.28, clearcoat: 0.74 });
  const f1BetaMat = organelleMaterial('#85ffd0', { emissive: '#2da677', emissiveIntensity: 0.34, clearcoat: 0.8 });

  // Rotating F0 transmembrane proton channel c-ring + central gamma shaft
  const rotor = group(atpSynth);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * tau;
    cylinder(rotor, f0Mat, 0.012, 0.012, 0.115, Math.cos(a) * 0.036, 0.0, Math.sin(a) * 0.036, 7);
  }
  const f0ChannelGlow = torus(atpSynth, glow('#70f8ff', 0.9, { transparent: true, opacity: 0.65, depthWrite: false }), 0.044, 0.008, 0, 0.06, 0);
  f0ChannelGlow.rotation.x = Math.PI / 2;
  cylinder(rotor, stalkMat, 0.014, 0.018, 0.14, 0, -0.095, 0, 10);

  // Peripheral stator arm (subunit b + OSCP cap) anchoring F0 to F1!
  tube(atpSynth, statorMat, [v(0.056, 0.04, 0), v(0.088, -0.04, 0.01), v(0.086, -0.145, 0.01), v(0.025, -0.215, 0)], 0.01, false, 18, 6);

  // 6-lobe F1 catalytic head (alternating alpha/beta subunits bulging into the Matrix -Y!)
  const f1Subunits = [];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * tau;
    const isBeta = i % 2 === 1;
    const lobe = mesh(atpSynth, new T.SphereGeometry(0.032, 11, 9), isBeta ? f1BetaMat : f1AlphaMat,
      Math.cos(a) * 0.042, -0.165, Math.sin(a) * 0.042);
    lobe.scale.set(0.95, 1.32, 0.95);
    f1Subunits.push({ mesh: lobe, angle: a, isBeta });
  }
  const atpRingMat = glow('#82ffd0', 1.0, { transparent: true, opacity: 0, depthWrite: false });
  const atpRing = torus(atpSynth, atpRingMat, 0.068, 0.008, 0, -0.22, 0);
  atpRing.rotation.x = Math.PI / 2;

  // Miniature background ATP synthases lining the remaining crista folds (gives lush dense ultrastructure!)
  const knobStalks = instances(parent, new T.CylinderGeometry(0.009, 0.009, 0.052, 6), material('#7cc8d4'), 12);
  const knobHeads = instances(parent, new T.SphereGeometry(0.022, 7, 6), glow('#6ef2c4', 0.38), 12);
  const putStalk = instanceUpdater(knobStalks);
  const putHead = instanceUpdater(knobHeads);
  for (let i = 0; i < 12; i++) {
    const x = -0.78 + i * 0.14;
    const y = (i % 2 === 0 ? -0.21 : 0.22);
    const z = 0.22 + (i % 3) * 0.03;
    putStalk(i, x, y, z, 1, 1, 1, Math.sin(i) * 0.4);
    putHead(i, x, y + (i % 2 === 0 ? 0.028 : -0.028), z + 0.015);
  }
  knobStalks.instanceMatrix.needsUpdate = knobHeads.instanceMatrix.needsUpdate = true;

  // --- D. MATRIX MACHINERY: KREBS CYCLE ENZYME RING + 55S MITORIBOSOMES ---
  const krebsRing = group(parent, -0.18, -0.16, 0.32);
  const krebsTorusMat = organelleMaterial('#68d49c', { emissive: '#238253', emissiveIntensity: 0.35, clearcoat: 0.65 });
  torus(krebsRing, krebsTorusMat, 0.115, 0.014);
  const krebsBead = mesh(krebsRing, new T.SphereGeometry(0.024, 9, 7), glow('#ffe880', 0.95), 0.115, 0, 0.015);
  const krebsCo2 = instances(krebsRing, new T.SphereGeometry(0.015, 7, 5), glow('#f2b688', 0.85), 6, true);
  const putKCo2 = instanceUpdater(krebsCo2);

  // Mitoribosomes 55S scattered inside matrix (front-visible)
  const mRibos = instances(parent, new T.SphereGeometry(0.023, 7, 5), glow('#f5be7d', 0.55), 12);
  const putMR = instanceUpdater(mRibos);
  for (let i = 0; i < 12; i++) {
    putMR(i, -0.32 + i * 0.078, -0.22 + Math.sin(i * 2.3) * 0.11, 0.26 + (i % 3) * 0.03);
  }
  mRibos.instanceMatrix.needsUpdate = true;

  // Live animated particle streams on cristaBench (e-, H+ pumped up, H+ returning through F0, H2O, ATP!)
  const eFlow = instances(cristaBench, new T.SphereGeometry(0.015, 7, 5), glow('#ffea75', 1.05), 14, true);
  const putE = instanceUpdater(eFlow);
  const hPump = instances(cristaBench, new T.SphereGeometry(0.014, 7, 5), glow('#66eaff', 0.98), 15, true);
  const putHPump = instanceUpdater(hPump);
  const hPool = instances(cristaBench, new T.SphereGeometry(0.012, 6, 5), glow('#78f0ff', 0.85), 18, true);
  const putHPool = instanceUpdater(hPool);
  const hReturn = instances(atpSynth, new T.SphereGeometry(0.015, 7, 5), glow('#70f8ff', 1.0), 8, true);
  const putHRet = instanceUpdater(hReturn);
  const atpBursts = instances(atpSynth, new T.SphereGeometry(0.022, 8, 6), glow('#82ffd0', 1.0), 10, true);
  const putAtp = instanceUpdater(atpBursts);
  const h2oOut = instances(cristaBench, new T.SphereGeometry(0.015, 7, 5), glow('#6ce0ff', 0.92), 6, true);
  const putH2O = instanceUpdater(h2oOut);

  // Contextual 3D micro-tags (compact & centered tightly inside safe viewport!)
  const tagPorin = addTag(channelZone, 'Porinas (VDAC)', -0.02, 0.19, 0.09, '#53b9cf', '#d6f7ff', 0.052);
  const tagMpc = addTag(channelZone, 'Canal de piruvato (MPC)', 0.0, -0.2, 0.1, '#66d99a', '#d8ffea', 0.05);
  const tagIms = addTag(cristaBench, 'Espaço intermembranas (H⁺)', -0.1, 0.19, 0.09, '#66eaff', '#d9faff', 0.05);
  const tagEtc = addTag(cristaBench, 'Complexos I · II · Q · III · IV (e⁻)', -0.14, -0.18, 0.1, '#ffe37d', '#fff4cc', 0.048);
  const tagO2 = addTag(cristaBench, 'O₂ → H₂O', 0.19, -0.2, 0.09, '#ff758a', '#ffdbe0', 0.046);
  const tagF0 = addTag(atpSynth, 'Canal de prótons (F₀)', -0.04, 0.14, 0.09, '#70f8ff', '#dcfbff', 0.05);
  const tagF1 = addTag(atpSynth, 'Cabeça F₁ · ADP + Pi → ATP', -0.04, -0.27, 0.1, '#82ffd0', '#dcffef', 0.048);
  const tagStator = addTag(atpSynth, 'Estator + rotor γ', 0.18, -0.08, 0.09, '#9cb6cc', '#e6f2fa', 0.046);
  const tagKrebs = addTag(krebsRing, 'Ciclo de Krebs (NADH / CO₂)', -0.02, -0.18, 0.09, '#68d49c', '#d8ffea', 0.05);
  const tagMtDna = addTag(parent, 'mtDNA circular + ribossomos 55S', 0.24, 0.12, 0.34, '#f5d08a', '#fff0cc', 0.05);

  const ptTmp = v();
  let atpPulse = 0;

  updaters.push((t, dt, activeKey, activeAnim) => {
    const isChan = activeAnim === 'mito_channels';
    const isCristae = activeAnim === 'mito_cristae';
    const isAtp = activeAnim === 'mito_atp';
    const isMatrix = activeAnim === 'mito_matrix';
    const isMito = activeKey === 'mitochondria';

    tagPorin.visible = isChan;
    tagMpc.visible = isChan;
    tagIms.visible = isCristae;
    tagEtc.visible = isCristae;
    tagO2.visible = isCristae;
    tagF0.visible = isAtp;
    tagF1.visible = isAtp;
    tagStator.visible = isAtp;
    tagKrebs.visible = isMatrix;
    tagMtDna.visible = isMatrix;

    // A. Outer VDAC porins + Inner Pyruvate Carrier (MPC)
    porinMat.emissiveIntensity = isChan ? 0.65 + Math.sin(t * 5) * 0.2 : 0.25;
    mpcMat.emissiveIntensity = isChan ? 0.68 : 0.26;
    const mpcOpen = isChan ? Math.sin(t * 3.8) * 0.22 : 0.08;
    mpcL.rotation.z = mpcOpen;
    mpcR.rotation.z = -mpcOpen;
    pyrIn.visible = isChan;
    ionIn.visible = isChan;
    if (isChan) {
      for (let i = 0; i < pyrIn.count; i++) {
        const p = (t * 0.55 + i / pyrIn.count) % 1;
        // Enter outer central porin (+0.26) -> cross intermembrane gap -> pass straight through MPC (-0.10) into matrix (-0.30)!
        putPyr(i, -0.03 + Math.sin(p * 8 + i) * 0.012, 0.26 - p * 0.58, 0.055, Math.sin(p * Math.PI) * 0.45 + 0.72);
      }
      for (let i = 0; i < ionIn.count; i++) {
        const p = (t * 0.62 + i / ionIn.count) % 1;
        const pc = porinCoords[i % porinCoords.length];
        putIonIn(i, pc[0] + Math.cos(i * 2) * 0.01, pc[1] + 0.16 - p * 0.28, pc[2] + 0.015, Math.sin(p * Math.PI) * 0.5 + 0.6);
      }
      pyrIn.instanceMatrix.needsUpdate = true;
      ionIn.instanceMatrix.needsUpdate = true;
    }

    // B. Respiratory Chain (Complexes I-IV, Q, Cit c, e- arc, H+ pumping!)
    const activeChain = isCristae || isAtp;
    const chainSpeed = activeChain ? 1.0 : 0.32;
    qCar.position.x = -0.19 + Math.sin(t * 2.4 * chainSpeed) * 0.085;
    citC.position.x = 0.045 + Math.sin(t * 2.7 * chainSpeed + 1.1) * 0.068;
    citC.position.y = 0.082 + Math.abs(Math.cos(t * 2.7 * chainSpeed)) * 0.022;
    etcArcMat.opacity = isCristae ? 0.58 + Math.sin(t * 6) * 0.15 : isAtp ? 0.28 : 0.12;
    hHazeMat.opacity = isCristae || isAtp ? 0.2 + Math.sin(t * 4) * 0.04 : 0.07;

    eFlow.visible = isCristae || isAtp || isMito;
    if (eFlow.visible) {
      for (let i = 0; i < eFlow.count; i++) {
        const p = (t * (isCristae ? 0.62 : 0.28) + i / eFlow.count) % 1;
        etcPath.getPoint(p, ptTmp);
        putE(i, ptTmp.x, ptTmp.y, ptTmp.z, 0.8 + Math.sin(t * 10 + i) * 0.25);
      }
      eFlow.instanceMatrix.needsUpdate = true;
    }

    hPump.visible = isCristae || isAtp;
    hPool.visible = isCristae || isAtp;
    h2oOut.visible = isCristae;
    if (hPump.visible) {
      const pumpXs = [-0.37, -0.04, 0.13]; // Complexes I, III, IV pump H+ UP into intermembrane space!
      for (let i = 0; i < hPump.count; i++) {
        const p = (t * 0.68 + i / hPump.count) % 1;
        const px = pumpXs[i % 3];
        putHPump(i, px + Math.sin(p * 6 + i) * 0.015, -0.09 + p * 0.26, 0.045, Math.sin(p * Math.PI) * 0.55 + 0.55);
      }
      for (let i = 0; i < hPool.count; i++) {
        const p = (t * 0.22 + i / hPool.count) % 1;
        // Dense H+ migrating across intermembrane space toward F0 proton channel at x = +0.31!
        putHPool(i, -0.38 + p * 0.69, 0.11 + Math.sin(t * 3 + i * 1.7) * 0.042, 0.02 + Math.cos(i * 2.1) * 0.04, 0.85);
      }
      hPump.instanceMatrix.needsUpdate = true;
      hPool.instanceMatrix.needsUpdate = true;
    }
    if (isCristae) {
      for (let i = 0; i < h2oOut.count; i++) {
        const p = (t * 0.65 + i / h2oOut.count) % 1;
        putH2O(i, 0.13 + Math.sin(i * 2.1) * p * 0.1, -0.14 - p * 0.14, 0.05 + p * 0.04, Math.sin(p * Math.PI) * 1.15);
      }
      h2oOut.instanceMatrix.needsUpdate = true;
    }

    // C. Rotating F0F1 ATP Synthase Turbine + F0 H+ channel return + ATP burst pulses!
    const spinRate = isAtp ? 8.4 : isCristae ? 4.2 : 1.8;
    const prevRot = rotor.rotation.y;
    rotor.rotation.y += dt * spinRate;
    for (const s of f1Subunits) {
      if (s.isBeta) {
        const conf = Math.sin(rotor.rotation.y - s.angle) * (isAtp ? 0.16 : 0.06);
        s.mesh.scale.set(0.95 + conf, 1.32 - conf * 0.8, 0.95 + conf);
      }
    }
    if (isAtp && Math.floor(rotor.rotation.y / (tau / 3)) !== Math.floor(prevRot / (tau / 3))) atpPulse = 0;
    if (isAtp && atpPulse < 1) {
      atpPulse = Math.min(1, atpPulse + dt * 2.8);
      atpRing.scale.setScalar(0.75 + atpPulse * 1.35);
      atpRingMat.opacity = (1 - atpPulse) * 0.88;
    } else {
      atpRingMat.opacity = 0;
    }
    f0ChannelGlow.material.opacity = isAtp ? 0.82 + Math.sin(t * 8) * 0.18 : 0.35;

    hReturn.visible = isAtp || isCristae;
    atpBursts.visible = isAtp || isMito;
    if (hReturn.visible) {
      for (let i = 0; i < hReturn.count; i++) {
        const p = (t * (isAtp ? 0.82 : 0.45) + i / hReturn.count) % 1;
        // Protons rushing DOWN through the F0 proton channel (y = +0.16 -> -0.09)
        putHRet(i, Math.sin(p * 10 + i) * 0.018, 0.16 - p * 0.26, 0.038, Math.sin(p * Math.PI) * 0.55 + 0.6);
      }
      hReturn.instanceMatrix.needsUpdate = true;
    }
    if (atpBursts.visible) {
      for (let i = 0; i < atpBursts.count; i++) {
        const p = (t * (isAtp ? 0.72 : 0.3) + i / atpBursts.count) % 1;
        const spread = ((i % 5) - 2) * 0.055;
        putAtp(i, spread * p * 1.5, -0.21 - p * 0.24, 0.03 + p * 0.08, Math.sin(p * Math.PI) * (isAtp ? 1.25 : 0.75));
      }
      atpBursts.instanceMatrix.needsUpdate = true;
    }

    // D. Matrix Krebs Cycle Ring + CO2 release
    krebsTorusMat.emissiveIntensity = isMatrix ? 0.78 + Math.sin(t * 5) * 0.2 : 0.22;
    const ka = t * (isMatrix ? 2.8 : 1.0);
    krebsBead.position.set(Math.cos(ka) * 0.115, Math.sin(ka) * 0.115, 0.015);
    krebsCo2.visible = isMatrix;
    if (isMatrix) {
      for (let i = 0; i < krebsCo2.count; i++) {
        const p = (t * 0.6 + i / krebsCo2.count) % 1;
        const ang = i * 1.05 + t * 0.5;
        putKCo2(i, Math.cos(ang) * (0.12 + p * 0.16), Math.sin(ang) * (0.12 + p * 0.16), 0.03 + p * 0.1, Math.sin(p * Math.PI) * 1.1);
      }
      krebsCo2.instanceMatrix.needsUpdate = true;
    }
  });
  return updaters;
}

// ============================================================================
// 6. LYSOSOME, PEROXISOME, CENTROSOME & CYTOSKELETON MICRO-ASSEMBLIES
// ============================================================================
export function attachLysosomeMicro(parent, anchors) {
  const updaters = [];
  createAnchor(parent, anchors, 'lyso_main', 0, 0, 0.22);
  createAnchor(parent, anchors, 'lyso_enzymes', 0, 0.02, 0.14);
  createAnchor(parent, anchors, 'lyso_digest', 0.04, -0.02, 0.16);

  // V-ATPase H+ influx particles + swirling acid hydrolases + fragmenting target
  const hInflux = instances(parent, new T.SphereGeometry(0.022, 7, 5), glow('#6ef0ff', 0.92), 12, true);
  const putH = instanceUpdater(hInflux);
  const fragments = instances(parent, new T.SphereGeometry(0.032, 8, 6), glow('#ffd882', 0.88), 10, true);
  const putFrag = instanceUpdater(fragments);

  updaters.push((t, _dt, _key, activeAnim) => {
    const isPumps = activeAnim === 'lyso_pumps';
    const isEnz = activeAnim === 'lyso_enzymes';
    const isDig = activeAnim === 'lyso_digest';

    hInflux.visible = isPumps;
    if (isPumps) {
      for (let i = 0; i < hInflux.count; i++) {
        const p = (t * 0.65 + i / hInflux.count) % 1;
        const a = i * 2.399;
        const r = 0.56 - p * 0.34;
        putH(i, Math.cos(a) * r, Math.sin(a * 1.4) * r * 0.7, Math.sin(a) * r * 0.6 + 0.1, Math.sin(p * Math.PI) * 1.15);
      }
      hInflux.instanceMatrix.needsUpdate = true;
    }

    fragments.visible = isEnz || isDig;
    if (fragments.visible) {
      for (let i = 0; i < fragments.count; i++) {
        const p = (t * (isDig ? 0.62 : 0.45) + i / fragments.count) % 1;
        const a = i * 2.4 + t * (isEnz ? 2.4 : 1.1);
        const r = isDig ? 0.06 + p * 0.48 : 0.14 + Math.sin(t * 3 + i) * 0.06;
        putFrag(i, Math.cos(a) * r, Math.sin(a * 1.3) * r * 0.8, 0.16 + Math.cos(i) * 0.12, isDig ? (1 - p * 0.7) : 0.9);
      }
      fragments.instanceMatrix.needsUpdate = true;
    }
  });
  return updaters;
}

export function attachPeroxisomeMicro(parent, anchors) {
  const updaters = [];
  createAnchor(parent, anchors, 'perox_main', 0, 0, 0.2);
  createAnchor(parent, anchors, 'perox_crystal', 0, 0, 0.14);
  createAnchor(parent, anchors, 'perox_catalase', 0, 0.06, 0.18);

  // Iconic crystalline catalase core inside peroxisome
  const crystalMat = organelleMaterial('#fff09e', { emissive: '#d6a42b', emissiveIntensity: 0.42, roughness: 0.15, clearcoat: 0.9 });
  const crystal = mesh(parent, new T.OctahedronGeometry(0.14, 0), crystalMat, 0, 0, 0.14);

  // H2O2 -> O2 micro-bubble bursts
  const bubbles = instances(parent, new T.SphereGeometry(0.025, 8, 6), glow('#9ef7ff', 0.92), 14, true);
  const putBub = instanceUpdater(bubbles);

  updaters.push((t, _dt, _key, activeAnim) => {
    const isCry = activeAnim === 'perox_crystal';
    const isBub = activeAnim === 'perox_bubbles';
    crystal.rotation.set(t * 0.6, t * 0.9, 0);
    crystalMat.emissiveIntensity = isCry ? 0.85 + Math.sin(t * 5) * 0.25 : 0.38;

    bubbles.visible = isBub;
    if (isBub) {
      for (let i = 0; i < bubbles.count; i++) {
        const p = (t * 0.78 + i / bubbles.count) % 1;
        const a = i * 2.399;
        const r = 0.12 + p * 0.45;
        putBub(i, Math.cos(a) * r, Math.sin(a) * r * 0.85 + p * 0.15, 0.18 + p * 0.22, Math.sin(p * Math.PI) * 1.18);
      }
      bubbles.instanceMatrix.needsUpdate = true;
    }
  });
  return updaters;
}

export function attachCentrosomeMicro(parent, anchors) {
  const updaters = [];
  createAnchor(parent, anchors, 'centro_main', 0, 0, 0.15);
  // Axial view targeting the vertical 9x3 centriole barrel end-on
  createAnchor(parent, anchors, 'centro_triplets', -0.23, -0.05, 0.05);
  createAnchor(parent, anchors, 'centro_nucleation', 0, 0.05, 0.12);

  // Dynamic nucleating microtubule rays radiating outward from pericentriolar material
  const rayMat = glow('#7ce8f5', 0.72, { transparent: true, opacity: 0.78, depthWrite: false });
  const rays = [];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * tau;
    const elev = ((i % 3) - 1) * 0.45;
    const dir = v(Math.cos(a), elev, Math.sin(a)).normalize();
    const r = group(parent);
    r.quaternion.setFromUnitVectors(v(0, 1, 0), dir);
    const seg = cylinder(r, rayMat, 0.014, 0.018, 0.85, 0, 0.55, 0, 7);
    rays.push({ root: r, seg, phase: i * 0.62 });
  }

  updaters.push((t, _dt, _key, activeAnim) => {
    const isRays = activeAnim === 'centro_rays';
    for (const r of rays) {
      r.root.visible = isRays;
      if (isRays) {
        const grow = 0.35 + ((t * 0.65 + r.phase) % 1) * 0.95;
        r.seg.scale.y = grow;
        r.seg.position.y = 0.34 + grow * 0.38;
      }
    }
  });
  return updaters;
}

export function attachCytoskeletonMicro(parent, anchors) {
  const updaters = [];
  createAnchor(parent, anchors, 'cyto_skel_main', 0, 0.2, 0.2);

  // Prominent hero microtubule highway across the lower-right cytosol with walking kinesin cargo!
  const trackPts = [v(-1.1, -0.35, 0.45), v(-0.15, 0.15, 0.92), v(0.85, 0.35, 0.85), v(1.75, 0.12, 0.45)];
  const heroCurve = new T.CatmullRomCurve3(trackPts);
  const trackMat = organelleMaterial('#68d8eb', { emissive: '#298ba3', emissiveIntensity: 0.28, clearcoat: 0.68 });
  tube(parent, trackMat, trackPts, 0.04, false, 36, 10);

  const midTrack = heroCurve.getPoint(0.45);
  createAnchor(parent, anchors, 'cyto_skel_track', midTrack.x, midTrack.y, midTrack.z);
  createAnchor(parent, anchors, 'cyto_skel_motors', midTrack.x + 0.18, midTrack.y + 0.1, midTrack.z + 0.05);

  const motorCargo = instances(parent, new T.SphereGeometry(0.075, 10, 8), glow('#ffcf70', 0.82), 4, true);
  const motorFeet = instances(parent, new T.SphereGeometry(0.032, 8, 6), glow('#70ffcf', 0.95), 8, true);
  const putCargo = instanceUpdater(motorCargo);
  const putFoot = instanceUpdater(motorFeet);
  const pTmp = v();

  updaters.push((t, _dt, activeKey, activeAnim) => {
    const isTrack = activeAnim === 'skel_track';
    const isMotors = activeAnim === 'skel_motors';
    trackMat.emissiveIntensity = isTrack || isMotors ? 0.65 : 0.22;
    motorCargo.visible = isMotors || activeKey === 'cytoskeleton';
    motorFeet.visible = isMotors;
    if (motorCargo.visible) {
      for (let i = 0; i < 4; i++) {
        const p = (t * (isMotors ? 0.28 : 0.14) + i * 0.25) % 1;
        heroCurve.getPoint(p, pTmp);
        const stepBob = Math.abs(Math.sin(t * 10 + i * 2)) * 0.025;
        putCargo(i, pTmp.x, pTmp.y + 0.11 + stepBob, pTmp.z + 0.03);
        if (isMotors) {
          putFoot(i * 2, pTmp.x - 0.025, pTmp.y + 0.045, pTmp.z + 0.015);
          putFoot(i * 2 + 1, pTmp.x + 0.025, pTmp.y + 0.045 + stepBob, pTmp.z + 0.015);
        }
      }
      motorCargo.instanceMatrix.needsUpdate = true;
      if (isMotors) motorFeet.instanceMatrix.needsUpdate = true;
    }
  });
  return updaters;
}

// ============================================================================
// 7. PLANT & PROKARYOTE SPECIALIZED MICRO-ASSEMBLIES
// ============================================================================
export function attachWallMicro(parent, type, shellPoint, cutStart, cutArc, anchors) {
  const updaters = [];
  const phiEdge = cutStart + cutArc;
  const pt = shellPoint(type, 1.25, phiEdge, 1.068);
  const out = shellPoint(type, 1.25, phiEdge, 1.12).sub(pt).normalize();
  const patch = group(parent, pt.x, pt.y, pt.z);
  patch.quaternion.setFromUnitVectors(v(0, 1, 0), out);

  createAnchor(parent, anchors, 'wall_overview', pt.x * 0.55, pt.y + 0.5, pt.z * 0.55);
  createAnchor(patch, anchors, 'wall_fibrils', 0, 0.02, 0);
  createAnchor(patch, anchors, 'wall_channels', 0.22, 0.02, 0.06);

  // Cross-linked cellulose microfibrils / peptidoglycan mesh
  const fibMat = organelleMaterial(type === 'plant' ? '#8ce086' : '#e0ba77', { emissive: type === 'plant' ? '#3d8a3f' : '#8a662b', emissiveIntensity: 0.22 });
  for (let i = -2; i <= 2; i++) {
    rod(patch, fibMat, v(-0.36, 0.01, i * 0.08), v(0.36, 0.01, i * 0.08 + 0.05), 0.015);
    rod(patch, fibMat, v(i * 0.12, -0.02, -0.24), v(i * 0.12 + 0.06, -0.02, 0.24), 0.014);
  }
  // Plasmodesmata / wall channel + passing solute dots
  const chanMat = glow('#78f5dc', 0.5);
  const chan = cylinder(patch, chanMat, 0.045, 0.045, 0.26, 0.22, 0, 0.06, 12);
  const flux = instances(patch, new T.SphereGeometry(0.022, 7, 5), glow('#a2ffe6', 0.95), 6, true);
  const putFlux = instanceUpdater(flux);

  updaters.push((t, _dt, _key, activeAnim) => {
    const isFib = activeAnim === 'wall_fibrils';
    const isCh = activeAnim === 'wall_channels';
    fibMat.emissiveIntensity = isFib ? 0.65 + Math.sin(t * 5) * 0.2 : 0.2;
    chan.visible = isCh || type === 'plant';
    flux.visible = isCh;
    if (isCh) {
      for (let i = 0; i < flux.count; i++) {
        const p = (t * 0.65 + i / flux.count) % 1;
        putFlux(i, 0.22, -0.24 + p * 0.48, 0.06, Math.sin(p * Math.PI) * 1.15);
      }
      flux.instanceMatrix.needsUpdate = true;
    }
  });
  return updaters;
}

export function attachVacuoleMicro(parent, anchors) {
  const updaters = [];
  createAnchor(parent, anchors, 'vacuole_main', 0, 0, 0.4);
  createAnchor(parent, anchors, 'vacuole_turgor', 0.95, 0.45, 0.85);
  createAnchor(parent, anchors, 'vacuole_solutes', 0.1, -0.1, 0.35);

  const waterIn = instances(parent, new T.SphereGeometry(0.045, 8, 6), glow('#7ceeff', 0.92), 14, true);
  const putW = instanceUpdater(waterIn);
  const crystals = instances(parent, new T.OctahedronGeometry(0.08, 0), glow('#e6a8ff', 0.55), 10, true);
  const putCr = instanceUpdater(crystals);

  updaters.push((t, _dt, _key, activeAnim) => {
    const isTur = activeAnim === 'vacuole_turgor';
    const isSol = activeAnim === 'vacuole_solutes';
    waterIn.visible = isTur;
    if (isTur) {
      for (let i = 0; i < waterIn.count; i++) {
        const p = (t * 0.62 + i / waterIn.count) % 1;
        const a = i * 1.9;
        const r = 1.65 - p * 0.65;
        putW(i, Math.cos(a) * r, Math.sin(a) * r * 0.85, 0.6 + (1 - p) * 0.5, Math.sin(p * Math.PI) * 1.1);
      }
      waterIn.instanceMatrix.needsUpdate = true;
    }
    for (let i = 0; i < crystals.count; i++) {
      const a = i * 2.4 + t * (isSol ? 0.7 : 0.2);
      const r = 0.25 + (i % 4) * 0.22;
      putCr(i, Math.cos(a) * r, Math.sin(a * 1.2) * r * 0.7, Math.sin(i * 1.7) * 0.4, isSol ? 1.25 : 0.85, isSol ? 1.25 : 0.85, isSol ? 1.25 : 0.85, t + i);
    }
    crystals.instanceMatrix.needsUpdate = true;
  });
  return updaters;
}

// ============================================================================
// 8. CHLOROPLAST MICRO-ASSEMBLY: Outer Porins (OEP) + TOC/TIC Import Channels
//    + Cutaway Thylakoid Membrane (PSII + OEC photolysis, PQ, Cyt b6f H+ pump, PC, PSI + FNR)
//    + Rotating CF0-CF1 ATP Synthase (Lumen H+ -> Stroma ATP) + Calvin/RuBisCO + cpDNA + Starch
// ============================================================================
export function attachChloroplastMicro(parent, anchors) {
  const updaters = [];
  createAnchor(parent, anchors, 'chloro_main', 0, 0, 0.2);
  createAnchor(parent, anchors, 'chloro_envelope', -0.4, 0.34, 0.25);
  createAnchor(parent, anchors, 'chloro_grana', -0.08, 0.02, 0.37);
  createAnchor(parent, anchors, 'chloro_atp', 0.34, 0.1, 0.37);
  createAnchor(parent, anchors, 'chloro_calvin', -0.04, -0.18, 0.24);

  const addTag = (host, text, x, y, z, border = '#7ef2a6', color = '#eefaf2', sc = 0.052) => {
    const sp = labelSprite(text, { scale: sc, border, color, font: '700 26px system-ui, sans-serif', depthTest: false });
    sp.position.set(x, y, z);
    sp.renderOrder = 10;
    sp.visible = false;
    host.add(sp);
    return sp;
  };

  // --- A. DOUBLE-ENVELOPE PORINS (OEP) & TOC/TIC PROTEIN TRANSLOCON CHANNELS ---
  const envZone = group(parent, -0.42, 0.36, 0.2);
  const oepMat = organelleMaterial('#5ec9b8', { emissive: '#1e7869', emissiveIntensity: 0.28, clearcoat: 0.74 });
  const tocMat = organelleMaterial('#9c7cf0', { emissive: '#4d32a6', emissiveIntensity: 0.32, clearcoat: 0.74 });
  const ticMat = organelleMaterial('#c282f0', { emissive: '#6e329e', emissiveIntensity: 0.3, clearcoat: 0.74 });
  const oepCoords = [[-0.22, 0.04, 0.02], [0.22, 0.05, 0.03]];
  for (const [ox, oy, oz] of oepCoords) {
    const pore = group(envZone, ox, oy, oz);
    pore.rotation.z = -ox * 0.45;
    for (let s = 0; s < 6; s++) {
      const a = (s / 6) * tau;
      cylinder(pore, oepMat, 0.013, 0.013, 0.09, Math.cos(a) * 0.03, 0, Math.sin(a) * 0.03, 7);
    }
    torus(pore, glow('#82ffea', 0.78, { transparent: true, opacity: 0.7, depthWrite: false }), 0.029, 0.006, 0, 0.044, 0).rotation.x = Math.PI / 2;
  }
  // Coupled TOC (outer envelope) + TIC (inner envelope) protein import complex
  const toctic = group(envZone, 0.0, 0.06, 0.045);
  const tocRing = torus(toctic, tocMat, 0.04, 0.014, 0, 0.02, 0);
  tocRing.rotation.x = Math.PI / 2;
  const ticRing = torus(toctic, ticMat, 0.038, 0.014, 0, -0.11, 0);
  ticRing.rotation.x = Math.PI / 2;
  cylinder(toctic, tocMat, 0.022, 0.022, 0.09, -0.028, 0.01, 0, 8);
  cylinder(toctic, tocMat, 0.022, 0.022, 0.09, 0.028, 0.01, 0, 8);
  cylinder(toctic, ticMat, 0.021, 0.021, 0.09, -0.026, -0.12, 0, 8);
  cylinder(toctic, ticMat, 0.021, 0.021, 0.09, 0.026, -0.12, 0, 8);

  const envCo2 = instances(envZone, new T.SphereGeometry(0.015, 7, 5), glow('#f2c091', 0.92), 8, true);
  const putEnvCo2 = instanceUpdater(envCo2);
  const importChain = instances(toctic, new T.SphereGeometry(0.014, 7, 5), glow('#e6b8ff', 0.98), 10, true);
  const putImp = instanceUpdater(importChain);

  // --- B. HERO CUTAWAY THYLAKOID MEMBRANE BENCH: PSII -> PQ -> Cyt b6f -> PC -> PSI/FNR + CF0-CF1 ---
  const thylaBench = group(parent, 0.04, 0.04, 0.36);
  // Cutaway thylakoid bilayer (+Y = Stroma, -Y = Thylakoid Lumen [high H+])
  box(thylaBench, membraneMaterial('#66cf74', { opacity: 0.52, clearcoat: 0.8 }), 0.92, 0.066, 0.15, 0, 0, 0);
  const tHeads = instances(thylaBench, new T.SphereGeometry(0.011, 6, 5), glow('#b0ff9e', 0.34), 64);
  const putTHead = instanceUpdater(tHeads);
  let thIdx = 0;
  for (let i = 0; i < 32; i++) {
    const lx = -0.44 + i * 0.0285;
    putTHead(thIdx++, lx, 0.035, 0.068);
    putTHead(thIdx++, lx, -0.035, 0.068);
  }
  tHeads.instanceMatrix.needsUpdate = true;

  // Glowing cyan-emerald Thylakoid Lumen H+ reservoir sheet BELOW the membrane (-Y)!
  const lumenHazeMat = glow('#5ce8ff', 0.7, { transparent: true, opacity: 0.14, depthWrite: false });
  mesh(thylaBench, new T.PlaneGeometry(0.92, 0.16), lumenHazeMat, 0, -0.115, -0.02);

  // 1) Photosystem II (PSII, x = -0.36) + Chlorophyll antenna ring + OEC water-splitting site on lumen face (-Y)
  const ps2Mat = organelleMaterial('#3ec96b', { emissive: '#1a7a3a', emissiveIntensity: 0.32, clearcoat: 0.72 });
  const ps2 = group(thylaBench, -0.36, 0, 0.01);
  cylinder(ps2, ps2Mat, 0.046, 0.048, 0.145, 0, 0, 0, 12);
  torus(ps2, glow('#9eff78', 0.82), 0.052, 0.01, 0, 0.05, 0).rotation.x = Math.PI / 2; // LHCII chlorophyll antenna
  // OEC (Mn4CaO5 oxygen-evolving cluster on lumen side splitting H2O -> O2 + 4H+)
  mesh(ps2, new T.SphereGeometry(0.028, 10, 8), glow('#62d8ff', 0.85), 0, -0.088, 0.02);

  // 2) Plastoquinone (PQ) mobile electron carrier oscillating inside the thylakoid bilayer
  const pqCar = group(thylaBench, -0.22, 0, 0.045);
  torus(pqCar, glow('#ffd466', 0.88), 0.022, 0.008, 0, 0, 0);

  // 3) Cytochrome b6f dimer (x = -0.08, blue-violet proton pump pushing H+ from Stroma +Y -> Lumen -Y!)
  const b6fMat = organelleMaterial('#6e82f0', { emissive: '#3142a8', emissiveIntensity: 0.3, clearcoat: 0.7 });
  const b6f = group(thylaBench, -0.08, 0, 0.01);
  cylinder(b6f, b6fMat, 0.034, 0.036, 0.15, -0.022, 0, 0, 10);
  cylinder(b6f, b6fMat, 0.034, 0.036, 0.15, 0.022, 0, 0, 10);
  torus(b6f, glow('#a3b8ff', 0.78), 0.036, 0.006, 0, -0.076, 0).rotation.x = Math.PI / 2;

  // 4) Plastocyanin (PC) shuttling along the LUMEN side (-Y) between b6f and PSI!
  const pcCar = mesh(thylaBench, new T.SphereGeometry(0.024, 10, 8), glow('#6ce3ff', 0.85), 0.03, -0.086, 0.032);

  // 5) Photosystem I (PSI, x = +0.14) + Ferredoxin/FNR (NADP+ reductase on Stroma +Y side!)
  const ps1Mat = organelleMaterial('#2ec4a3', { emissive: '#147560', emissiveIntensity: 0.32, clearcoat: 0.72 });
  const ps1 = group(thylaBench, 0.14, 0, 0.01);
  cylinder(ps1, ps1Mat, 0.045, 0.045, 0.145, 0, 0, 0, 12);
  torus(ps1, glow('#7dffe0', 0.82), 0.05, 0.01, 0, 0.05, 0).rotation.x = Math.PI / 2;
  // FNR NADP+ reductase lobe on stroma face (+Y)
  mesh(ps1, new T.SphereGeometry(0.03, 10, 8), glow('#c294ff', 0.82), 0.028, 0.105, 0.02);

  // Golden Z-scheme electron pathway arc (PSII -> PQ -> b6f -> PC -> PSI -> FNR!)
  const zPath = new T.CatmullRomCurve3([
    v(-0.36, -0.06, 0.058), v(-0.36, 0.03, 0.064), v(-0.22, 0.0, 0.068),
    v(-0.08, -0.01, 0.064), v(0.03, -0.085, 0.062), v(0.14, 0.02, 0.065), v(0.168, 0.11, 0.058)
  ]);
  const zArcMat = glow('#ffe97a', 0.85, { transparent: true, opacity: 0.34, depthWrite: false });
  mesh(thylaBench, new T.TubeGeometry(zPath, 42, 0.0062, 6, false), zArcMat);

  // --- C. HERO ROTATING CF0-CF1 ATP SYNTHASE (x = +0.32, Lumen -Y H+ -> Stroma +Y CF1 ATP!) ---
  const cfSynth = group(thylaBench, 0.32, 0, 0.015);
  const cf0Mat = organelleMaterial('#46ccba', { emissive: '#19786b', emissiveIntensity: 0.32, clearcoat: 0.78 });
  const cfStalkMat = organelleMaterial('#d9fff5', { emissive: '#58cca8', emissiveIntensity: 0.35, clearcoat: 0.82 });
  const cfStatorMat = organelleMaterial('#8eb8a8', { roughness: 0.34, metalness: 0.22 });
  const cf1AlphaMat = organelleMaterial('#68e8a8', { emissive: '#228f5c', emissiveIntensity: 0.28, clearcoat: 0.74 });
  const cf1BetaMat = organelleMaterial('#a6ffbe', { emissive: '#34ad6d', emissiveIntensity: 0.36, clearcoat: 0.8 });

  // Rotating CF0 proton channel c-ring + central gamma shaft extending UP into the Stroma (+Y)!
  const cfRotor = group(cfSynth);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * tau;
    cylinder(cfRotor, cf0Mat, 0.012, 0.012, 0.115, Math.cos(a) * 0.036, 0, Math.sin(a) * 0.036, 7);
  }
  const cf0Glow = torus(cfSynth, glow('#70f8ff', 0.9, { transparent: true, opacity: 0.65, depthWrite: false }), 0.044, 0.008, 0, -0.06, 0);
  cf0Glow.rotation.x = Math.PI / 2;
  cylinder(cfRotor, cfStalkMat, 0.014, 0.018, 0.14, 0, 0.095, 0, 10);

  // Peripheral stator arm anchoring CF0 up to CF1 in the stroma!
  tube(cfSynth, cfStatorMat, [v(0.056, -0.04, 0), v(0.088, 0.04, 0.01), v(0.086, 0.145, 0.01), v(0.025, 0.215, 0)], 0.01, false, 18, 6);

  // 6-lobe CF1 catalytic head protruding UP into the Stroma (+Y)!
  const cf1Subunits = [];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * tau;
    const isBeta = i % 2 === 1;
    const lobe = mesh(cfSynth, new T.SphereGeometry(0.032, 11, 9), isBeta ? cf1BetaMat : cf1AlphaMat,
      Math.cos(a) * 0.042, 0.165, Math.sin(a) * 0.042);
    lobe.scale.set(0.95, 1.32, 0.95);
    cf1Subunits.push({ mesh: lobe, angle: a, isBeta });
  }
  const cfAtpRingMat = glow('#8effc4', 1.0, { transparent: true, opacity: 0, depthWrite: false });
  const cfAtpRing = torus(cfSynth, cfAtpRingMat, 0.068, 0.008, 0, 0.22, 0);
  cfAtpRing.rotation.x = Math.PI / 2;

  // --- D. STROMA CALVIN CYCLE (RuBisCO) + CHLOROPLAST DNA + 70S RIBOSOMES + STARCH GRANULES ---
  const calvinRing = group(parent, 0.16, -0.2, 0.24);
  const calvinTorusMat = organelleMaterial('#5ce0c4', { emissive: '#1e8571', emissiveIntensity: 0.34, clearcoat: 0.68 });
  torus(calvinRing, calvinTorusMat, 0.115, 0.014);
  const calvinBead = mesh(calvinRing, new T.SphereGeometry(0.024, 9, 7), glow('#fff080', 0.95), 0.115, 0, 0.015);
  const glucDrop = instances(calvinRing, new T.OctahedronGeometry(0.02, 0), glow('#78f2ff', 0.95), 6, true);
  const putGluc = instanceUpdater(glucDrop);

  // Circular cpDNA + white starch granules + 70S plastid ribosomes in stroma
  const cpDna = torus(parent, glow('#f5d97e', 0.45), 0.11, 0.015, -0.38, -0.17, 0.22);
  cpDna.rotation.set(0.38, 0.26, 0.1);
  const starchMat = organelleMaterial('#eef5e4', { roughness: 0.34, clearcoat: 0.42 });
  mesh(parent, new T.SphereGeometry(0.075, 12, 10), starchMat, -0.22, -0.24, 0.2).scale.set(1.15, 0.78, 0.85);
  mesh(parent, new T.SphereGeometry(0.065, 11, 9), starchMat, 0.48, -0.2, 0.2).scale.set(1.1, 0.8, 0.82);
  const cRibos = instances(parent, new T.SphereGeometry(0.019, 7, 5), glow('#a6f0d4', 0.48), 12);
  const putCR = instanceUpdater(cRibos);
  for (let i = 0; i < 12; i++) {
    putCR(i, -0.52 + i * 0.095, -0.22 + Math.cos(i * 2.1) * 0.09, 0.16 + (i % 3) * 0.035);
  }
  cRibos.instanceMatrix.needsUpdate = true;

  // Live animated particle streams on thylaBench
  const photons = instances(thylaBench, new T.SphereGeometry(0.02, 7, 5), glow('#fff278', 1.05), 10, true);
  const putPh = instanceUpdater(photons);
  const zFlow = instances(thylaBench, new T.SphereGeometry(0.015, 7, 5), glow('#ffe878', 1.05), 12, true);
  const putZ = instanceUpdater(zFlow);
  const o2Bubbles = instances(thylaBench, new T.SphereGeometry(0.014, 7, 5), glow('#82f5ff', 0.95), 12, true); // 6 diatomic pairs
  const putO2 = instanceUpdater(o2Bubbles);
  const b6fH = instances(thylaBench, new T.SphereGeometry(0.014, 7, 5), glow('#66eaff', 0.98), 10, true);
  const putB6fH = instanceUpdater(b6fH);
  const lumH = instances(thylaBench, new T.SphereGeometry(0.012, 6, 5), glow('#70f0ff', 0.86), 16, true);
  const putLumH = instanceUpdater(lumH);
  const nadphOut = instances(thylaBench, new T.SphereGeometry(0.02, 8, 6), glow('#d49eff', 0.98), 8, true);
  const putNadph = instanceUpdater(nadphOut);
  const cfHRet = instances(cfSynth, new T.SphereGeometry(0.015, 7, 5), glow('#70f8ff', 1.0), 8, true);
  const putCfH = instanceUpdater(cfHRet);
  const cfAtpOut = instances(cfSynth, new T.SphereGeometry(0.022, 8, 6), glow('#8effc4', 1.0), 10, true);
  const putCfAtp = instanceUpdater(cfAtpOut);

  // Contextual 3D micro-tags (compact & safely framed inside viewport!)
  const tagOep = addTag(envZone, 'Porinas OEP (CO₂ / H₂O)', -0.22, 0.19, 0.08, '#5ec9b8', '#d6fffa', 0.054);
  const tagTocTic = addTag(envZone, 'Translocon TOC/TIC (proteínas)', 0.1, -0.21, 0.09, '#b58cff', '#efe0ff', 0.052);
  const tagPs2 = addTag(thylaBench, 'PSII · Fotólise (H₂O → O₂)', -0.32, 0.18, 0.09, '#52e07c', '#dcffe6', 0.048);
  const tagB6f = addTag(thylaBench, 'Citocromo b₆f (H⁺ → lúmen)', -0.08, -0.19, 0.1, '#7a94ff', '#e0e8ff', 0.048);
  const tagPs1 = addTag(thylaBench, 'PSI + FNR → NADPH', 0.15, 0.19, 0.09, '#c294ff', '#f2e0ff', 0.048);
  const tagCf1 = addTag(cfSynth, 'CF₁ · ADP + Pi → ATP (estroma)', -0.04, 0.27, 0.1, '#8effc4', '#dcffef', 0.048);
  const tagCf0 = addTag(cfSynth, 'Canal CF₀ (H⁺ sai do lúmen)', -0.04, -0.15, 0.09, '#70f8ff', '#dcfbff', 0.048);
  const tagCfStat = addTag(cfSynth, 'Estator + rotor γ', 0.17, 0.07, 0.09, '#9ec4b8', '#e6faf4', 0.045);
  const tagCalvin = addTag(calvinRing, 'Ciclo de Calvin (RuBisCO → Glicose)', 0.06, 0.2, 0.08, '#5ce0c4', '#d9fff6', 0.054);
  const tagCpDna = addTag(parent, 'cpDNA + ribossomos 70S + amido', -0.36, 0.02, 0.28, '#f5d97e', '#fff4cc', 0.054);

  const ptTmp = v();
  let cfPulse = 0;

  updaters.push((t, dt, activeKey, activeAnim) => {
    const isEnv = activeAnim === 'chloro_envelope';
    const isPh = activeAnim === 'chloro_photons';
    const isAtp = activeAnim === 'chloro_atp';
    const isCal = activeAnim === 'chloro_calvin';
    const isChl = activeKey === 'chloroplast';

    tagOep.visible = isEnv;
    tagTocTic.visible = isEnv;
    tagPs2.visible = isPh;
    tagB6f.visible = isPh;
    tagPs1.visible = isPh;
    tagCf1.visible = isAtp;
    tagCf0.visible = isAtp;
    tagCfStat.visible = isAtp;
    tagCalvin.visible = isCal;
    tagCpDna.visible = isCal;

    // A. Envelope Porins (OEP) + TOC/TIC Translocon
    oepMat.emissiveIntensity = isEnv ? 0.65 + Math.sin(t * 5) * 0.2 : 0.25;
    tocMat.emissiveIntensity = isEnv ? 0.72 : 0.28;
    ticMat.emissiveIntensity = isEnv ? 0.72 : 0.28;
    envCo2.visible = isEnv;
    importChain.visible = isEnv;
    if (isEnv) {
      for (let i = 0; i < envCo2.count; i++) {
        const p = (t * 0.58 + i / envCo2.count) % 1;
        const oc = oepCoords[i % oepCoords.length];
        putEnvCo2(i, oc[0] + Math.sin(p * 6 + i) * 0.01, oc[1] + 0.16 - p * 0.34, oc[2] + 0.02, Math.sin(p * Math.PI) * 0.5 + 0.62);
      }
      for (let i = 0; i < importChain.count; i++) {
        const p = (t * 0.52 + i / importChain.count) % 1;
        // Precursor protein chain threading smoothly through TOC -> intermembrane space -> TIC -> Stroma!
        putImp(i, Math.sin(p * 10 + i * 0.5) * 0.015, 0.18 - p * 0.44, 0.025, Math.sin(p * Math.PI) * 0.45 + 0.7);
      }
      envCo2.instanceMatrix.needsUpdate = true;
      importChain.instanceMatrix.needsUpdate = true;
    }

    // B. Thylakoid Photosystems (PSII, PQ, Cyt b6f, PC, PSI + FNR)
    const activeLight = isPh || isAtp;
    const sp = activeLight ? 1.0 : 0.32;
    pqCar.position.x = -0.22 + Math.sin(t * 2.5 * sp) * 0.075;
    pcCar.position.x = 0.03 + Math.sin(t * 2.7 * sp + 1.2) * 0.062;
    pcCar.position.y = -0.084 - Math.abs(Math.cos(t * 2.7 * sp)) * 0.02;
    zArcMat.opacity = isPh ? 0.6 + Math.sin(t * 6) * 0.15 : isAtp ? 0.28 : 0.12;
    lumenHazeMat.opacity = isPh || isAtp ? 0.22 + Math.sin(t * 4) * 0.04 : 0.08;

    photons.visible = isPh || isChl;
    zFlow.visible = isPh || isAtp || isChl;
    o2Bubbles.visible = isPh;
    b6fH.visible = isPh || isAtp;
    lumH.visible = isPh || isAtp;
    nadphOut.visible = isPh;

    if (photons.visible) {
      for (let i = 0; i < photons.count; i++) {
        const p = (t * (isPh ? 0.85 : 0.36) + i / photons.count) % 1;
        // Half photons strike PSII (-0.36), half strike PSI (+0.14)!
        const targetX = i % 2 === 0 ? -0.36 : 0.14;
        putPh(i, targetX - (1 - p) * 0.18, 0.34 - p * 0.3, 0.08 - p * 0.04, Math.sin(p * Math.PI) * (isPh ? 1.2 : 0.7));
      }
      photons.instanceMatrix.needsUpdate = true;
    }
    if (zFlow.visible) {
      for (let i = 0; i < zFlow.count; i++) {
        const p = (t * (isPh ? 0.62 : 0.28) + i / zFlow.count) % 1;
        zPath.getPoint(p, ptTmp);
        putZ(i, ptTmp.x, ptTmp.y, ptTmp.z, 0.85 + Math.sin(t * 10 + i) * 0.22);
      }
      zFlow.instanceMatrix.needsUpdate = true;
    }
    if (isPh) {
      // Paired diatomic O2 bubbles escaping from PSII water-splitting OEC!
      for (let i = 0; i < o2Bubbles.count; i++) {
        const pair = Math.floor(i / 2);
        const side = i % 2 === 0 ? -0.013 : 0.013;
        const p = (t * 0.56 + pair / (o2Bubbles.count / 2)) % 1;
        const bx = -0.38 - p * 0.14 + Math.sin(p * 6 + pair) * 0.02;
        const by = -0.09 + p * 0.26;
        const ang = t * 2.6 + pair;
        putO2(i, bx + Math.cos(ang) * side, by + Math.sin(ang) * side, 0.06 + p * 0.05, Math.sin(p * Math.PI) * 1.15);
      }
      // NADPH emerging upward from PSI / FNR into the Stroma!
      for (let i = 0; i < nadphOut.count; i++) {
        const p = (t * 0.62 + i / nadphOut.count) % 1;
        putNadph(i, 0.16 + Math.sin(i * 2.1) * p * 0.08, 0.12 + p * 0.2, 0.05 + p * 0.04, Math.sin(p * Math.PI) * 1.15);
      }
      o2Bubbles.instanceMatrix.needsUpdate = true;
      nadphOut.instanceMatrix.needsUpdate = true;
    }
    if (b6fH.visible) {
      // H+ pumped DOWN from Stroma (+Y) into Thylakoid Lumen (-Y) via Cyt b6f + PSII OEC!
      for (let i = 0; i < b6fH.count; i++) {
        const p = (t * 0.68 + i / b6fH.count) % 1;
        const hx = i % 3 === 0 ? -0.36 : -0.08;
        putB6fH(i, hx + Math.sin(p * 7 + i) * 0.014, 0.09 - p * 0.24, 0.045, Math.sin(p * Math.PI) * 0.55 + 0.55);
      }
      // Concentrated H+ drifting along the Lumen (-Y) toward CF0 proton channel at x = +0.32!
      for (let i = 0; i < lumH.count; i++) {
        const p = (t * 0.24 + i / lumH.count) % 1;
        putLumH(i, -0.38 + p * 0.7, -0.11 + Math.sin(t * 3 + i * 1.8) * 0.04, 0.02 + Math.cos(i * 2.1) * 0.04, 0.88);
      }
      b6fH.instanceMatrix.needsUpdate = true;
      lumH.instanceMatrix.needsUpdate = true;
    }

    // C. Rotating CF0-CF1 ATP Synthase (Lumen H+ rushing UP through CF0 -> Stroma ATP!)
    const spinRate = isAtp ? 8.4 : isPh ? 4.2 : 1.8;
    const prevRot = cfRotor.rotation.y;
    cfRotor.rotation.y += dt * spinRate;
    for (const s of cf1Subunits) {
      if (s.isBeta) {
        const conf = Math.sin(cfRotor.rotation.y - s.angle) * (isAtp ? 0.16 : 0.06);
        s.mesh.scale.set(0.95 + conf, 1.32 - conf * 0.8, 0.95 + conf);
      }
    }
    if (isAtp && Math.floor(cfRotor.rotation.y / (tau / 3)) !== Math.floor(prevRot / (tau / 3))) cfPulse = 0;
    if (isAtp && cfPulse < 1) {
      cfPulse = Math.min(1, cfPulse + dt * 2.8);
      cfAtpRing.scale.setScalar(0.75 + cfPulse * 1.35);
      cfAtpRingMat.opacity = (1 - cfPulse) * 0.88;
    } else {
      cfAtpRingMat.opacity = 0;
    }
    cf0Glow.material.opacity = isAtp ? 0.82 + Math.sin(t * 8) * 0.18 : 0.35;

    cfHRet.visible = isAtp || isPh;
    cfAtpOut.visible = isAtp || isChl;
    if (cfHRet.visible) {
      for (let i = 0; i < cfHRet.count; i++) {
        const p = (t * (isAtp ? 0.82 : 0.45) + i / cfHRet.count) % 1;
        // Protons rushing UP from Lumen (-0.16) through CF0 channel to Stroma (+0.10)!
        putCfH(i, Math.sin(p * 10 + i) * 0.018, -0.16 + p * 0.26, 0.038, Math.sin(p * Math.PI) * 0.55 + 0.6);
      }
      cfHRet.instanceMatrix.needsUpdate = true;
    }
    if (cfAtpOut.visible) {
      for (let i = 0; i < cfAtpOut.count; i++) {
        const p = (t * (isAtp ? 0.72 : 0.3) + i / cfAtpOut.count) % 1;
        const spread = ((i % 5) - 2) * 0.055;
        putCfAtp(i, spread * p * 1.5, 0.21 + p * 0.24, 0.03 + p * 0.08, Math.sin(p * Math.PI) * (isAtp ? 1.25 : 0.75));
      }
      cfAtpOut.instanceMatrix.needsUpdate = true;
    }

    // D. Stroma Calvin Cycle (RuBisCO) + cpDNA + Glucose output
    cpDna.rotation.z = t * (isCal ? 1.6 : 0.4);
    cpDna.material.emissiveIntensity = isCal ? 0.92 : 0.38;
    calvinTorusMat.emissiveIntensity = isCal ? 0.8 + Math.sin(t * 5) * 0.2 : 0.22;
    const ca = t * (isCal ? 2.8 : 0.9);
    calvinBead.position.set(Math.cos(ca) * 0.115, Math.sin(ca) * 0.115, 0.015);
    glucDrop.visible = isCal;
    if (isCal) {
      for (let i = 0; i < glucDrop.count; i++) {
        const p = (t * 0.55 + i / glucDrop.count) % 1;
        putGluc(i, 0.11 + p * 0.24, Math.sin(p * Math.PI) * 0.08 - 0.02, 0.03 + p * 0.05, Math.sin(p * Math.PI) * 1.15, Math.sin(p * Math.PI) * 1.15, Math.sin(p * Math.PI) * 1.15, t * 2 + i);
      }
      glucDrop.instanceMatrix.needsUpdate = true;
    }
  });
  return updaters;
}

export function attachBacteriaMicro(structures, shellPoint, cutStart, cutArc, anchors) {
  const updaters = [];

  // (Capsule micro-assembly now lives in cellOrganelleDetails.js -> attachCapsuleMicro)

  // Nucleoid coupled transcription sparks
  const nucObj = structures.get('nucleoid');
  if (nucObj) {
    createAnchor(nucObj, anchors, 'nucleoid_main', 0, 0, 0.2);
    createAnchor(nucObj, anchors, 'nucleoid_loops', 0.35, 0.12, 0.28);
    createAnchor(nucObj, anchors, 'nucleoid_coupled', 0.55, 0.15, 0.32);
    const tx = instances(nucObj, new T.SphereGeometry(0.036, 8, 6), glow('#ffd870', 0.92), 14, true);
    const putT = instanceUpdater(tx);
    updaters.push((t, _dt, _k, anim) => {
      tx.visible = anim === 'nucleoid_coupled' || anim === 'nucleoid_loops';
      if (tx.visible) {
        for (let i = 0; i < tx.count; i++) {
          const p = (t * 0.6 + i / tx.count) % 1;
          const a = i * 2.1;
          const r = anim === 'nucleoid_coupled' ? 0.22 + p * 0.72 : 0.42;
          putT(i, 0.25 + Math.cos(a + t) * r, Math.sin(a * 1.4 + t) * r * 0.55, Math.sin(a + t) * r * 0.45, Math.sin(p * Math.PI) * 1.2);
        }
        tx.instanceMatrix.needsUpdate = true;
      }
    });
  }

  // Supercoiled Plasmid Theta Replication + Hollow Conjugative Pilus ssDNA Transfer!
  const plasObj = structures.get('plasmid');
  if (plasObj) {
    createAnchor(plasObj, anchors, 'plasmid_main', 0.14, 0.08, 0.08);
    createAnchor(plasObj, anchors, 'plasmid_rep', -0.24, 0.24, 0.16);
    createAnchor(plasObj, anchors, 'plasmid_conj', 0.55, 0.22, 0.18);

    const mkPTag = (text, x, y, z, border) => {
      const sp = labelSprite(text, { scale: 0.13, border, color: '#f5fcff', font: '700 26px system-ui, sans-serif', depthTest: false });
      sp.position.set(x, y, z);
      sp.renderOrder = 14;
      sp.visible = false;
      plasObj.add(sp);
      return sp;
    };
    const tagPOver = mkPTag('Plasmídeo cccDNA · oriC (ciano) · ampR (rosa) · sem histonas', 0.08, 0.78, 0.22, '#f7c454');
    const tagPRep = mkPTag('Replicação θ autônoma (DNA Pol III em oriC)', -0.22, 0.66, 0.24, '#52f0d4');
    const tagPConj = mkPTag('Conjugação · Fita de DNA cruzando pilus oco', 0.78, 0.58, 0.34, '#ff98b4');

    // Daughter plasmid double-helix ring separating cleanly during theta replication + DNA Pol III forks!
    const repRing = group(plasObj, -0.24, 0.24, 0.16);
    torus(repRing, glow('#52f0d4', 0.92, { transparent: true, opacity: 0.85 }), 0.28, 0.018);
    torus(repRing, glow('#ffe070', 0.85, { transparent: true, opacity: 0.8 }), 0.255, 0.014);
    const polForkA = sphere(repRing, proteinMaterial('#58e8f5', { emissive: '#1e90b8', emissiveIntensity: 0.7 }), 0.044, 0.044, 0.044, 0.27, 0, 0, 10);
    const polForkB = sphere(repRing, proteinMaterial('#58e8f5', { emissive: '#1e90b8', emissiveIntensity: 0.7 }), 0.044, 0.044, 0.044, -0.27, 0, 0, 10);
    repRing.visible = false;

    // Translucent HOLLOW Conjugative Sex Pilus channel + single-stranded DNA ribbon moving across!
    const pilusGrp = group(plasObj, 0.22, 0.20, 0.16);
    const pilusTube = lathe(pilusGrp, gelMaterial('#8ef0e2', { opacity: 0.44, clearcoat: 0.95 }), [
      [0.055, 0], [0.085, 0], [0.085, 1.48], [0.055, 1.48], [0.055, 0]
    ], 16);
    pilusTube.rotation.z = -Math.PI / 2;
    pilusTube.rotation.y = -0.26;
    const conjDots = instances(pilusGrp, new T.SphereGeometry(0.022, 8, 6), glow('#ffd868', 1.0), 18, true);
    const putConj = instanceUpdater(conjDots);
    pilusGrp.visible = false;

    updaters.push((t, _dt, _k, anim) => {
      tagPOver.visible = anim === 'plasmid_overview';
      tagPRep.visible = anim === 'plasmid_replicate';
      tagPConj.visible = anim === 'plasmid_transfer';

      repRing.visible = anim === 'plasmid_replicate';
      if (repRing.visible) {
        const p = (t * 0.42) % 1;
        const sep = Math.sin(p * Math.PI) * 0.24;
        repRing.position.set(-0.24 + sep * 0.5, 0.24 + sep * 0.4, 0.16 + sep);
        repRing.rotation.set(0.58, 0.42 + t * 0.9, 0.18);
        const a = p * Math.PI;
        polForkA.position.set(Math.cos(a) * 0.27, Math.sin(a) * 0.27, 0);
        polForkB.position.set(Math.cos(-a) * 0.27, Math.sin(-a) * 0.27, 0);
      }

      pilusGrp.visible = anim === 'plasmid_transfer';
      if (pilusGrp.visible) {
        for (let i = 0; i < conjDots.count; i++) {
          const p = (t * 0.48 + i / conjDots.count) % 1;
          const dist = p * 1.44;
          const wag = Math.sin(p * 16 - t * 6) * 0.022;
          putConj(i, dist * Math.cos(0.26), wag, dist * Math.sin(0.26) + Math.cos(p * 14 - t * 5) * 0.018, Math.sin(p * Math.PI) * 0.5 + 0.65);
        }
        conjDots.instanceMatrix.needsUpdate = true;
      }
    });
  }

  // Hero 70S Ribosome (50S + 30S + mRNA + actively growing nascent polypeptide!)
  const riboObj = structures.get('ribosome');
  if (riboObj) {
    createAnchor(riboObj, anchors, 'ribo_overview', 0, 0.1, 0.4);
    const hero = group(riboObj, 0.85, 0.32, 0.92);
    const s50 = sphere(hero, organelleMaterial('#5cbde0', { clearcoat: 0.7 }), 0.17, 0.125, 0.14, 0, 0.07, 0, 18);
    const s30 = sphere(hero, organelleMaterial('#8fe0f5', { clearcoat: 0.7 }), 0.135, 0.08, 0.11, 0, -0.055, 0.015, 16);
    tube(hero, glow('#d99aef', 0.45), [v(-0.42, -0.01, 0.05), v(-0.15, 0.01, 0.07), v(0.15, -0.01, 0.07), v(0.42, 0.01, 0.05)], 0.015, false, 20, 6);
    const nascent = instances(hero, new T.SphereGeometry(0.026, 8, 6), glow('#ffcf78', 0.9), 10, true);
    const putNas = instanceUpdater(nascent);
    createAnchor(hero, anchors, 'ribo_hero', 0, 0.06, 0.05);
    updaters.push((t, _dt, _k, anim) => {
      const isSub = anim === 'ribo_subunits';
      const isTr = anim === 'ribo_translate';
      s50.position.y = 0.07 + (isSub ? Math.sin(t * 4) * 0.018 : 0);
      s30.position.y = -0.055 - (isSub ? Math.sin(t * 4) * 0.018 : 0);
      nascent.visible = isTr || isSub;
      if (nascent.visible) {
        for (let i = 0; i < nascent.count; i++) {
          const p = (t * (isTr ? 0.55 : 0.2) + i / nascent.count) % 1;
          const a = p * 7 + i * 0.4;
          putNas(i, Math.sin(a) * (0.04 + p * 0.09), 0.14 + p * 0.34, Math.cos(a) * 0.06, Math.sin(p * Math.PI) * 0.55 + 0.65);
        }
        nascent.instanceMatrix.needsUpdate = true;
      }
    });
  }

  // Flagellar basal motor H+ proton influx
  const flagObj = structures.get('flagellum');
  if (flagObj) {
    createAnchor(flagObj, anchors, 'flag_overview', 1.2, 0, 0);
    createAnchor(flagObj, anchors, 'flag_motor', 0, 0, 0);
    createAnchor(flagObj, anchors, 'flag_wave', 1.45, 0, 0);
    const hMotor = instances(flagObj, new T.SphereGeometry(0.028, 8, 6), glow('#6ef2ff', 0.95), 12, true);
    const putHM = instanceUpdater(hMotor);
    updaters.push((t, _dt, _k, anim) => {
      hMotor.visible = anim === 'flag_motor';
      if (hMotor.visible) {
        for (let i = 0; i < hMotor.count; i++) {
          const p = (t * 0.85 + i / hMotor.count) % 1;
          const a = i * 2.1 + t * 5;
          putHM(i, 0.18 - p * 0.44, Math.cos(a) * 0.23, Math.sin(a) * 0.23, Math.sin(p * Math.PI) * 1.15);
        }
        hMotor.instanceMatrix.needsUpdate = true;
      }
    });
  }

  return updaters;
}
