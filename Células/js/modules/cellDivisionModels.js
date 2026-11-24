import * as T from 'three';
import {
  v, group, mesh, sphere, cylinder, torus, tube,
  glow, organicDisplace,
  membraneMaterial, gelMaterial, proteinMaterial, organelleMaterial
} from '../core/geometry.js';

// Build an organic supercoiled chromatin fiber arm (twisted nucleosome/solenoid coils + rounded profile!)
function makeCoiledChromatinArm(radius, length, seed = 1) {
  const geo = new T.CapsuleGeometry(radius, Math.max(0.04, length - radius * 2), 10, 20);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const angle = Math.atan2(z, x);
    // Supercoiled solenoid helix ridge + gentle organic chromatin lobing!
    const coil = Math.sin(y * 36 + angle * 2.0 + seed * 3.1) * 0.14;
    const lobe = Math.cos(y * 19 - angle * 3.0 + seed * 1.7) * 0.08;
    const rScale = 1 + coil + lobe;
    pos.setXYZ(i, x * rScale, y, z * rScale);
  }
  geo.computeVertexNormals();
  return geo;
}

// ============================================================================
// 1. SCULPTED ARTICULATED CHROMATID + PROTEINS (Cinetócoro NDC80/CENP-A,
//    Anéis de Coesina, Bandas G de Cromatina & Capuzes Teloméricos Shelterin)
// ============================================================================
export function makeSculptedChromatid(parent, baseHex, armLength = 0.68, pickKey = 'chromosome', seed = 1) {
  const root = group(parent);
  root.userData.pickKey = pickKey;

  const bodyMat = proteinMaterial(baseHex, {
    roughness: 0.24, clearcoat: 0.78, iridescence: 0.22,
    emissive: baseHex, emissiveIntensity: 0.08
  });
  const tipMat = proteinMaterial(baseHex, {
    roughness: 0.22, clearcoat: 0.84, iridescence: 0.28,
    emissive: baseHex, emissiveIntensity: 0.1
  });
  const bandCol = new T.Color(baseHex).multiplyScalar(0.52);
  const bandMat = proteinMaterial(bandCol, { roughness: 0.36, clearcoat: 0.44 });
  const centMat = proteinMaterial('#ffca52', { emissive: '#b87614', emissiveIntensity: 0.42, clearcoat: 0.9 });
  const kinetPlateMat = proteinMaterial('#68f0ff', { emissive: '#22a6c4', emissiveIntensity: 0.68, clearcoat: 0.95 });
  const ndc80Mat = glow('#c2fbff', 0.85);
  const teloMat = proteinMaterial('#fff2b2', { emissive: '#d6a83a', emissiveIntensity: 0.55, clearcoat: 0.95 });
  const cohesinMat = proteinMaterial('#ff9f43', { emissive: '#cc6012', emissiveIntensity: 0.52, clearcoat: 0.9, transparent: true, opacity: 0.92 });
  const seamMat = glow('#ffe37d', 0.26, { transparent: true, opacity: 0.5 });

  const half = armLength * 0.5;
  const r = 0.074;

  // Primary centromere constriction (CENP-A chromatin core)
  const centGeo = organicDisplace(new T.SphereGeometry(0.088, 16, 14), 0.07, 7, seed);
  const centromere = mesh(root, centGeo, centMat);
  centromere.scale.set(1.05, 0.72, 1.0);
  centromere.castShadow = true;

  // Sculpted Multi-Subunit Kinetochore Protein Complex (Outer plate + NDC80 microtubule-binding filaments!)
  const kinetochore = group(root);
  kinetochore.userData.pickKey = 'kinetochore';
  for (const sx of [-1, 1]) {
    // Trilaminar outer kinetochore disc
    const disc = cylinder(kinetochore, kinetPlateMat, 0.044, 0.052, 0.028, sx * 0.082, 0, 0, 14);
    disc.rotation.z = Math.PI / 2;
    // 3 radiating NDC80 protein fibril hooks grabbing the spindle microtubule tip!
    for (const fy of [-0.022, 0, 0.022]) {
      cylinder(kinetochore, ndc80Mat, 0.007, 0.009, 0.046, sx * 0.112, fy, 0, 6).rotation.z = Math.PI / 2;
    }
  }

  // Sculpted Cohesin Protein Ring Collar (holds sister chromatids together until Separase cleaves it in Anaphase!)
  const cohesinRing = group(root);
  cohesinRing.userData.pickKey = 'cohesin';
  const ringTop = torus(cohesinRing, cohesinMat, r * 1.18, 0.015, 0, half * 0.22, 0);
  ringTop.rotation.x = Math.PI / 2;
  const ringBot = torus(cohesinRing, cohesinMat, r * 1.18, 0.015, 0, -half * 0.22, 0);
  ringBot.rotation.x = Math.PI / 2;
  // SMC1/SMC3 ATPase globular hinge beads on the cohesin rings
  sphere(cohesinRing, glow('#ffd27d', 0.65), 0.024, 0.024, 0.024, 0, half * 0.22, r * 1.18, 8);
  sphere(cohesinRing, glow('#ffd27d', 0.65), 0.024, 0.024, 0.024, 0, -half * 0.22, r * 1.18, 8);

  // Articulated Upper Arm (p-arm) — sculpted supercoiled chromatin fiber + condensed G-bands + Shelterin telomere cap!
  const upperPivot = group(root, 0, 0, 0);
  const upArm = mesh(upperPivot, makeCoiledChromatinArm(r, half * 0.88, seed + 1), bodyMat, 0, half * 0.50, 0);
  upArm.castShadow = true;
  for (const frac of [0.34, 0.64]) {
    const band = torus(upperPivot, bandMat, r * 1.03, 0.011, 0, half * frac, 0);
    band.rotation.x = Math.PI / 2;
  }
  const upTelo = mesh(upperPivot, organicDisplace(new T.SphereGeometry(r * 1.08, 14, 12), 0.09, 9, seed + 5), teloMat, 0, half * 0.96, 0);
  upTelo.scale.set(1.04, 0.74, 1.04);

  // Articulated Lower Arm (q-arm: proximal coiled segment + recombination seam + exchangeable distal coiled segment!)
  const lowerPivot = group(root, 0, 0, 0);
  const proxArm = mesh(lowerPivot, makeCoiledChromatinArm(r, half * 0.48, seed + 2), bodyMat, 0, -half * 0.28, 0);
  proxArm.castShadow = true;
  const seam = torus(lowerPivot, seamMat, r * 1.08, 0.014, 0, -half * 0.53, 0);
  seam.rotation.x = Math.PI / 2;
  const tipMesh = mesh(lowerPivot, makeCoiledChromatinArm(r, half * 0.47, seed + 3), tipMat, 0, -half * 0.77, 0);
  tipMesh.castShadow = true;
  const lowTelo = mesh(lowerPivot, organicDisplace(new T.SphereGeometry(r * 1.08, 14, 12), 0.09, 9, seed + 7), teloMat, 0, -half * 1.02, 0);
  lowTelo.scale.set(1.04, 0.74, 1.04);

  return {
    root, upperPivot, lowerPivot,
    bodyMat, tipMat, seamMat, cohesinRing, cohesinMat, kinetochore,
    tipMesh, lowTelo, centromere,
    baseColor: new T.Color(baseHex)
  };
}

// ============================================================================
// 2. SCULPTED 9×3 MICROTUBULE-TRIPLET CENTROSOME + PCM HALO + 3D ASTER RAYS!
// ============================================================================
export function makeSculptedCentrosome(parent) {
  const root = group(parent);
  root.userData.pickKey = 'centrosome';

  const tubMat = proteinMaterial('#f4b459', { emissive: '#b86814', emissiveIntensity: 0.36, clearcoat: 0.85 });
  const pcmMat = gelMaterial('#ffd68a', { opacity: 0.24, emissive: '#e08e24', emissiveIntensity: 0.42, iridescence: 0.35 });
  const asterMat = gelMaterial('#86ecf7', { opacity: 0.48, emissive: '#3bc4d9', emissiveIntensity: 0.45, clearcoat: 0.9 });

  // Build one authentic 9-fold radial microtubule-triplet barrel centriole!
  function buildCentrioleBarrel(px, py, pz, rx, ry, rz) {
    const barrel = group(root, px, py, pz);
    barrel.rotation.set(rx, ry, rz);
    const barR = 0.088;
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      // Each triplet blade tilted tangentially like real EM centriole cartwheel cross-sections!
      const blade = group(barrel, Math.cos(a) * barR, 0, Math.sin(a) * barR);
      blade.rotation.y = -a + 0.55;
      cylinder(blade, tubMat, 0.013, 0.013, 0.29, -0.016, 0, 0, 6);
      cylinder(blade, tubMat, 0.012, 0.012, 0.29, 0.0, 0, 0, 6);
      cylinder(blade, tubMat, 0.011, 0.011, 0.29, 0.015, 0, 0, 6);
    }
    // Central cartwheel hub protein (SAS-6)
    cylinder(barrel, glow('#ffe09e', 0.6), 0.022, 0.022, 0.26, 0, 0, 0, 8);
    return barrel;
  }

  // Orthogonal mother & daughter 9×3 centrioles!
  buildCentrioleBarrel(-0.08, -0.02, 0, 0.12, 0, 0.08);
  buildCentrioleBarrel(0.09, 0.05, 0.04, 0, 0.15, Math.PI / 2 - 0.08);

  // Translucent organic Pericentriolar Material (PCM / γ-TuRC) cloud
  const pcmGeo = organicDisplace(new T.SphereGeometry(0.28, 18, 14), 0.14, 5, 3);
  mesh(root, pcmGeo, pcmMat);

  // 14 Volumetric 3D Radiating Aster Microtubules (tapered translucent rods in all directions!)
  const asterGroup = group(root);
  const dirs = [
    [1, 0.4, 0.2], [-1, 0.4, -0.2], [0.4, 1, 0.3], [-0.4, -1, -0.3],
    [0.5, -0.8, 0.4], [-0.5, 0.8, -0.4], [0.2, 0.3, 1], [-0.2, -0.3, -1],
    [0.85, -0.35, -0.4], [-0.85, 0.35, 0.4], [0.25, -0.7, -0.65], [-0.25, 0.7, 0.65],
    [0.7, 0.7, -0.2], [-0.7, -0.7, 0.2]
  ];
  for (let i = 0; i < dirs.length; i++) {
    const d = new T.Vector3(...dirs[i]).normalize();
    const len = 0.46 + (i % 3) * 0.14;
    const ray = cylinder(asterGroup, asterMat, 0.004, 0.014, len, 0, 0, 0, 6);
    ray.position.copy(d).multiplyScalar(0.22 + len * 0.5);
    ray.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), d);
  }
  root.userData.aster = asterGroup;
  return root;
}

// ============================================================================
// 3. SCULPTED ORGANIC CELL SHELL (GELATINOUS CYTOSOL + MEMBRANE PROTEINS +
//    POROUS NUCLEAR ENVELOPE WITH 3D OCTAGONAL NUCLEAR PORE COMPLEXES!)
// ============================================================================
export function makeSculptedCellShell(parent, radius = 2.55, seed = 1) {
  const root = group(parent);

  // Outer undulating iridescent phospholipid plasma membrane
  const memGeo = organicDisplace(new T.SphereGeometry(radius, 40, 28), 0.032, 3.2, seed);
  const memMat = membraneMaterial('#48c4d6', { opacity: 0.22, clearcoat: 1.0, iridescence: 0.48, roughness: 0.08 });
  const mem = mesh(root, memGeo, memMat);
  mem.receiveShadow = true;

  // Inner soft gelatinous cytosol halo (gives depth & wet biological translucency!)
  const gelGeo = new T.SphereGeometry(radius * 0.94, 28, 20);
  const gelMat = gelMaterial('#1c4e63', { opacity: 0.12, iridescence: 0.28 });
  const gel = mesh(root, gelGeo, gelMat);

  // Embedded transmembrane receptor / channel protein studs along the cell equator silhouette
  const protMat = proteinMaterial('#6ee8f5', { emissive: '#228fa6', emissiveIntensity: 0.25, clearcoat: 0.9 });
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const phi = ((i % 3) - 1) * 0.34;
    const r = radius * 0.99;
    const px = Math.cos(a) * Math.cos(phi) * r;
    const py = Math.sin(phi) * r;
    const pz = Math.sin(a) * Math.cos(phi) * r;
    const stub = mesh(root, new T.CapsuleGeometry(0.032, 0.06, 4, 8), protMat, px, py, pz);
    stub.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), new T.Vector3(px, py, pz).normalize());
  }

  // Floating cytoplasmic organelles / vesicles inside the translucent protoplasm
  const vesMat = gelMaterial('#5cc4d8', { opacity: 0.32, emissive: '#2e7e94', emissiveIntensity: 0.22 });
  const vesGroup = group(root);
  for (let i = 0; i < 14; i++) {
    const a = i * 2.399;
    const rad = radius * (0.62 + (i % 3) * 0.1);
    const vy = ((i % 5) - 2) * 0.48;
    const vr = 0.055 + (i % 3) * 0.025;
    mesh(vesGroup, new T.SphereGeometry(vr, 10, 8), vesMat, Math.cos(a) * rad, vy, Math.sin(a) * rad * 0.65);
  }

  // Sculpted Nuclear Envelope studded with 3D Octagonal Nuclear Pore Complexes (NPCs)!
  const nucGroup = group(root);
  const nucGeo = organicDisplace(new T.SphereGeometry(radius * 0.52, 30, 22), 0.028, 4.5, seed + 9);
  const nucMat = membraneMaterial('#927ef0', { opacity: 0.34, clearcoat: 0.88, iridescence: 0.42 });
  const nuc = mesh(nucGroup, nucGeo, nucMat);
  const npcMat = proteinMaterial('#c5b8ff', { emissive: '#6e5ad6', emissiveIntensity: 0.38, transparent: true, opacity: 0.82 });
  const npcRings = [];
  for (let i = 0; i < 18; i++) {
    const y = 1 - (i / 17) * 2;
    const radAtY = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = i * 2.39996;
    const dir = new T.Vector3(Math.cos(theta) * radAtY, y, Math.sin(theta) * radAtY).normalize();
    const pore = torus(nucGroup, npcMat, 0.062, 0.018, 0, 0, 0);
    pore.position.copy(dir).multiplyScalar(radius * 0.525);
    pore.quaternion.setFromUnitVectors(new T.Vector3(0, 0, 1), dir);
    npcRings.push(pore);
  }

  return { root, mem, memMat, gel, vesGroup, nuc: nucGroup, nucMesh: nuc, nucMat, npcMat };
}

// ============================================================================
// 4. SCULPTED VOLUMETRIC 3D SPINDLE MICROTUBULE POOL + MOTOR PROTEINS
//    (Curved glossy α/β-tubulin bundles + Kinesin-5 / Dynein motor dimers!)
// ============================================================================
export function makeSpindleBundlePool(parent, maxFibers = 24) {
  const poolGroup = group(parent);
  const fibMat = gelMaterial('#7ae8f5', { opacity: 0.62, emissive: '#36b5cc', emissiveIntensity: 0.48, clearcoat: 0.95 });
  const motorMat = proteinMaterial('#5ef2b0', { emissive: '#1ea36e', emissiveIntensity: 0.55, clearcoat: 0.9 });
  const up = new T.Vector3(0, 1, 0);
  const pA = new T.Vector3(), pB = new T.Vector3(), dir = new T.Vector3(), mid = new T.Vector3();

  const fibers = [];
  const geo = new T.CylinderGeometry(0.014, 0.022, 1, 8, 1);
  const motorGeo = new T.SphereGeometry(0.036, 10, 8);

  for (let i = 0; i < maxFibers; i++) {
    const holder = group(poolGroup);
    holder.visible = false;
    const rodMesh = mesh(holder, geo, fibMat);
    // Sculpted globular Kinesin/Dynein motor protein dimer walking along the microtubule!
    const motor = group(holder);
    motor.userData.pickKey = 'motor';
    mesh(motor, motorGeo, motorMat, -0.024, 0, 0);
    mesh(motor, motorGeo, motorMat, 0.024, 0, 0);
    fibers.push({ holder, rodMesh, motor });
  }

  let used = 0;
  return {
    reset() { used = 0; },
    add(ax, ay, az, bx, by, bz, clock = 0, showMotor = true) {
      if (used >= maxFibers) return;
      const f = fibers[used++];
      pA.set(ax, ay, az);
      pB.set(bx, by, bz);
      dir.subVectors(pB, pA);
      const len = dir.length();
      if (len < 0.02) { f.holder.visible = false; return; }
      f.holder.visible = true;
      mid.addVectors(pA, pB).multiplyScalar(0.5);
      f.rodMesh.position.copy(mid);
      f.rodMesh.scale.set(1, len, 1);
      f.rodMesh.quaternion.setFromUnitVectors(up, dir.normalize());
      f.motor.visible = showMotor && len > 0.45;
      if (f.motor.visible) {
        const walk = 0.25 + ((clock * 0.42 + used * 0.23) % 0.62);
        f.motor.position.lerpVectors(pA, pB, walk);
        f.motor.quaternion.copy(f.rodMesh.quaternion);
      }
    },
    commit() {
      for (let i = used; i < maxFibers; i++) fibers[i].holder.visible = false;
    }
  };
}

// ============================================================================
// 5. SCULPTED ACTOMYOSIN CONTRACTILE RING (F-Actin + Myosin-II Motor Heads!)
// ============================================================================
export function makeContractileRing(parent, radius = 2.42) {
  const ring = group(parent);
  ring.userData.pickKey = 'actomyosin';
  const actinMat = proteinMaterial('#ff8c69', { emissive: '#d64c2a', emissiveIntensity: 0.52, clearcoat: 0.85, transparent: true, opacity: 0.88 });
  const myosinMat = proteinMaterial('#ffd166', { emissive: '#c48216', emissiveIntensity: 0.65, clearcoat: 0.9, transparent: true, opacity: 0.92 });

  // Braided double F-actin filament rings
  torus(ring, actinMat, radius, 0.042, 0, 0, 0.032);
  torus(ring, actinMat, radius * 0.985, 0.038, 0, 0, -0.032);

  // 16 Bipolar Myosin-II motor protein dimer heads actively constricting the furrow!
  const headGeo = new T.SphereGeometry(0.068, 10, 8);
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const h = mesh(ring, headGeo, myosinMat, Math.cos(a) * radius, Math.sin(a) * radius, (i % 2 ? 0.055 : -0.055));
    h.scale.set(1.25, 0.85, 0.85);
    h.rotation.z = a;
  }
  ring.userData.mats = [actinMat, myosinMat];
  return ring;
}

// ============================================================================
// 6. SCULPTED SYNAPTONEMAL RECOMBINATION NODULE (Rad51 / Chiasma Complex!)
// ============================================================================
export function makeChiasmaComplex(parent) {
  const chiasma = group(parent);
  chiasma.userData.pickKey = 'chiasma';
  const ringMat = glow('#ffca57', 1.25, { transparent: true, opacity: 0.92, depthWrite: false });
  const ring = torus(chiasma, ringMat, 0.25, 0.022);
  const enzMat = proteinMaterial('#fff099', { emissive: '#ffae2b', emissiveIntensity: 0.78, clearcoat: 0.95 });
  // 4-subunit RecA/Rad51 recombination enzyme complex clasping the crossing DNA strands!
  const nodule = group(chiasma);
  const subGeo = organicDisplace(new T.SphereGeometry(0.068, 12, 10), 0.14, 7, 11);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.4;
    mesh(nodule, subGeo, enzMat, Math.cos(a) * 0.062, Math.sin(a) * 0.062, (i % 2 ? 0.03 : -0.03));
  }
  return { group: chiasma, ring, nodule };
}
