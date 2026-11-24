import * as T from 'three';
import {
  v, group, mesh, box, sphere, cylinder, capsule, lathe, torus, tube, rod, curve,
  material, glow, instances, instanceUpdater, labelSprite,
  membraneMaterial, gelMaterial, proteinMaterial, organelleMaterial, organicDisplace, tintGeometry, mergeGeos
} from '../core/geometry.js';
import { createAnchor } from './cellMicroDetails.js?v=19';

// Helper: genuine open-ended hollow tube (double-walled LatheGeometry) for T4 inner tail core (gp19)
function hollowCoreTube(parent, mat, outerR, innerR, height, x = 0, y = 0, z = 0, segs = 20) {
  const h = height * 0.5;
  return lathe(parent, mat, [
    [innerR, -h], [outerR, -h], [outerR, h], [innerR, h], [innerR, -h]
  ], segs, x, y, z);
}

// Helper: live 60 FPS animated double-stranded NAKED DNA filament (twin helical backbones + base-pair rungs, ZERO histones!)
function makeAnimatedDsDna(parent, segs = 76) {
  const mkRibbon = (hex, emHex) => {
    const pos = new Float32Array((segs + 1) * 3);
    const geo = new T.BufferGeometry();
    geo.setAttribute('position', new T.BufferAttribute(pos, 3));
    const line = new T.Line(geo, new T.LineBasicMaterial({ color: hex, transparent: true, opacity: 0.96 }));
    // Paired thin tubular beads along the two strands give real 3D thickness & specular glow!
    const beads = instances(parent, new T.SphereGeometry(0.014, 7, 5),
      proteinMaterial(hex, { emissive: emHex, emissiveIntensity: 0.72, clearcoat: 0.9 }), segs + 1, true);
    parent.add(line);
    return { pos, geo, line, beads, put: instanceUpdater(beads) };
  };
  const strandA = mkRibbon('#ffe470', '#d48a14');
  const strandB = mkRibbon('#ff9d5c', '#c24a12');
  const rungCount = Math.floor(segs / 2);
  const rungs = instances(parent, new T.CylinderGeometry(0.0045, 0.0045, 1, 5),
    glow('#fff2a6', 0.92), rungCount, true);
  const dummy = new T.Object3D();
  const upVec = v(0, 1, 0);
  const pA = v(), pB = v(), diff = v();

  return {
    setVisible(vis) {
      strandA.line.visible = strandB.line.visible = strandA.beads.visible = strandB.beads.visible = rungs.visible = vis;
    },
    update(topY, botY, exitY, phase, activeLenFrac = 1) {
      const span = Math.max(0.05, (topY - botY) * activeLenFrac);
      const yEnd = topY - span;
      for (let i = 0; i <= segs; i++) {
        const u = i / segs;
        const y = topY - u * span;
        // Inside hollow inner tail tube (y >= exitY): tight helical filament (r = 0.021 < innerR 0.048)!
        // Below pierced bacterial membrane (y < exitY): free loose undulating naked dsDNA loops in cytoplasm!
        let cx = 0, cz = 0, helR = 0.020;
        if (y < exitY) {
          const depth = exitY - y;
          const sw = depth * 0.56;
          cx = Math.sin(depth * 4.4 - phase * 2.2) * sw + Math.cos(depth * 2.1 + phase) * sw * 0.35;
          cz = Math.cos(depth * 3.9 - phase * 1.9) * sw * 0.85;
          helR = 0.028 + Math.min(0.022, depth * 0.04);
        }
        const twist = u * 34 - phase * 7.5;
        const ox = Math.cos(twist) * helR;
        const oz = Math.sin(twist) * helR;
        const idx = i * 3;
        strandA.pos[idx] = cx + ox; strandA.pos[idx + 1] = y; strandA.pos[idx + 2] = cz + oz;
        strandB.pos[idx] = cx - ox; strandB.pos[idx + 1] = y; strandB.pos[idx + 2] = cz - oz;
        const fade = u > 0.94 ? (1 - u) / 0.06 : 1;
        strandA.put(i, cx + ox, y, cz + oz, fade);
        strandB.put(i, cx - ox, y, cz - oz, fade);
        if (i % 2 === 0 && (i >> 1) < rungCount) {
          pA.set(cx + ox, y, cz + oz);
          pB.set(cx - ox, y, cz - oz);
          diff.subVectors(pB, pA);
          dummy.position.copy(pA).lerp(pB, 0.5);
          dummy.scale.set(1, Math.max(0.004, diff.length()), 1);
          dummy.quaternion.setFromUnitVectors(upVec, diff.normalize());
          dummy.updateMatrix();
          rungs.setMatrixAt(i >> 1, dummy.matrix);
        }
      }
      strandA.geo.attributes.position.needsUpdate = true;
      strandB.geo.attributes.position.needsUpdate = true;
      strandA.beads.instanceMatrix.needsUpdate = true;
      strandB.beads.instanceMatrix.needsUpdate = true;
      rungs.instanceMatrix.needsUpdate = true;
      return yEnd;
    }
  };
}

const tau = Math.PI * 2;
const smootherstep = x => {
  const c = Math.max(0, Math.min(1, x));
  return c * c * c * (c * (c * 6 - 15) + 10);
};

function taperedTube(parent, mat, path, radiusAt, segments = 24, sides = 9) {
  const geo = new T.TubeGeometry(path, segments, 1, sides);
  const positions = geo.attributes.position;
  const center = v(), edge = v();
  for (let ring = 0; ring <= segments; ring++) {
    const u = ring / segments;
    path.getPointAt(u, center);
    const radius = radiusAt(u);
    for (let side = 0; side <= sides; side++) {
      const i = ring * (sides + 1) + side;
      edge.fromBufferAttribute(positions, i).sub(center).multiplyScalar(radius).add(center);
      positions.setXYZ(i, edge.x, edge.y, edge.z);
    }
  }
  geo.computeVertexNormals();
  return mesh(parent, geo, mat);
}

function addTag(host, text, x, y, z, border = '#68dce8', color = '#eef7fa', sc = 0.21) {
  const sp = labelSprite(text, { scale: sc, border, color, font: '700 26px system-ui, sans-serif', depthTest: false });
  sp.position.set(x, y, z);
  sp.renderOrder = 12;
  sp.visible = false;
  host.add(sp);
  return sp;
}

// Helper: sculpted cutaway mini-mitochondrion with real internal cristae (used inside muscle, neuron, epithelial!)
function miniCutMito(parent, x, y, z, scale = 1, rotZ = 0) {
  const m = group(parent, x, y, z);
  m.rotation.z = rotZ;
  m.scale.setScalar(scale);
  const outer = mesh(m, organicDisplace(new T.SphereGeometry(1, 20, 14, Math.PI * 0.85, Math.PI * 1.48), 0.03, 3, 2),
    proteinMaterial('#e67b64', { emissive: '#8f3020', emissiveIntensity: 0.24, clearcoat: 0.85, side: T.DoubleSide }));
  outer.scale.set(0.46, 0.21, 0.21);
  const cristaMat = proteinMaterial('#ffb482', { emissive: '#a84e24', emissiveIntensity: 0.3, clearcoat: 0.75 });
  const pts = [];
  for (let i = -2; i <= 2; i++) {
    const cx = i * 0.14;
    const d = i % 2 === 0 ? 1 : -1;
    pts.push(v(cx - 0.04, -d * 0.11, 0.04), v(cx, 0, 0.12), v(cx + 0.04, d * 0.11, 0.06));
  }
  tube(m, cristaMat, pts, 0.022, false, 36, 6);
  return m;
}

export const EXTRA_OUTER_KEYS = new Set([
  'viral_envelope', 'muscle_sarcolemma', 'stem_membrane', 'osteocyte_lacuna', 'rbc_membrane', 'epi_body'
]);

export const EXTRA_LABEL_OFFSETS = {
  viral_envelope: v(0, 2.38, 0.2),
  viral_spikes: v(1.5, 1.95, 0.6),
  viral_capsid: v(-0.4, 1.38, 0.4),
  viral_genome: v(-0.2, -0.55, 0.55),
  viral_phage: v(0, 2.02, 0.2),
  muscle_sarcolemma: v(0, 2.04, 0.2),
  muscle_nuclei: v(-1.6, 1.56, 0.45),
  muscle_sarcomere: v(0.2, 0.78, 0.75),
  muscle_sr: v(-1.6, -1.22, 0.75),
  muscle_mito: v(2.2, -1.18, 0.65),
  stem_membrane: v(0, 2.78, 0.1),
  stem_nucleus: v(-0.1, 1.58, 0.55),
  stem_cytoplasm: v(1.5, -1.38, 0.65),
  stem_potency: v(2.6, 1.58, 0.4),
  neuron_soma: v(-0.2, 1.58, 0.3),
  neuron_dendrites: v(-1.6, 2.22, 0.2),
  neuron_myelin: v(0.3, 1.18, 0.45),
  neuron_synapse: v(0.35, 1.48, 0.35),
  osteocyte_lacuna: v(0, 2.48, 0.2),
  osteocyte_body: v(0, 1.08, 0.45),
  osteocyte_processes: v(2.3, 1.12, 0.4),
  rbc_membrane: v(0, 2.58, 0.2),
  rbc_anucleate: v(-0.65, 0.88, 0.65),
  rbc_hemoglobin: v(0.95, -0.62, 0.75),
  epi_glycocalyx: v(-0.58, 0.99, 0.46),
  epi_microvilli: v(0.6, 0.63, 0.44),
  epi_terminal: v(-0.48, 0.12, 0.86),
  epi_junctions: v(1.52, 0.42, 0.45),
  epi_body: v(-0.4, 0.48, 0.55),
  epi_basal: v(-0.78, 0.10, 0.83),
  epi_support: v(0.90, -0.27, 0.70)
};

export const EXTRA_CAMERAS = {
  virus: { eye: [1.4, 2.2, 13.8], target: [0.55, 0.0, 0] },
  muscle: { eye: [0.8, 2.3, 14.6], target: [0, 0, 0] },
  stem: { eye: [1.8, 2.4, 13.6], target: [0.2, 0, 0] },
  neuron: { eye: [0.6, 2.4, 15.6], target: [0.5, 0.1, 0] },
  osteocyte: { eye: [1.5, 2.4, 13.8], target: [0, 0, 0] },
  erythrocyte: { eye: [1.6, 2.8, 12.2], target: [0, 0, 0] },
  epithelial: { eye: [1.12, 1.55, 12.2], target: [0, -0.02, 0] }
};

export function buildExtraModel(type, ctx) {
  if (type === 'virus') return buildVirusModel(ctx);
  if (type === 'muscle') return buildMuscleModel(ctx);
  if (type === 'stem') return buildStemModel(ctx);
  if (type === 'neuron') return buildNeuronModel(ctx);
  if (type === 'osteocyte') return buildOsteocyteModel(ctx);
  if (type === 'erythrocyte') return buildErythrocyteModel(ctx);
  if (type === 'epithelial') return buildEpithelialModel(ctx);
  return [];
}

// ============================================================================
// 1. VÍRUS (ACELULAR): Enveloped Virion (S1/S2 Trimeric Spikes + Host Bilayer
//    Receptor Fusion + Icosahedral Capsid) + Prolate Bacteriophage T4!
// ============================================================================
function buildVirusModel({ build, anchors }) {
  const updaters = [];
  const virionCenter = [-1.05, 0.05, 0];

  // A. Viral Lipid Envelope + Matrix (M) inner lattice + ion channel (E) pores
  const envObj = build('viral_envelope', virionCenter, item => {
    const geo = organicDisplace(new T.SphereGeometry(2.02, 44, 28, Math.PI * 0.72, Math.PI * 1.44), 0.022, 3.0, 5);
    tintGeometry(geo, '#d45a78', '#7d2a49', 2.4, 2);
    const mat = membraneMaterial('#ffffff', { vertexColors: true, opacity: 0.46, clearcoat: 0.92, iridescence: 0.3, bumpScale: 0.032 });
    mat.userData.shell = 0.46;
    mesh(item, geo, mat);
    const rimMat = glow('#ff8ea8', 0.52);
    for (const phi of [Math.PI * 0.72, Math.PI * 2.16]) {
      const pts = Array.from({ length: 28 }, (_, i) => {
        const th = i * Math.PI / 27;
        return v(-Math.cos(phi) * Math.sin(th) * 2.02, Math.cos(th) * 2.02, Math.sin(phi) * Math.sin(th) * 2.02);
      });
      tube(item, rimMat, pts, 0.036, false, 30, 8);
    }
    const mMat = proteinMaterial('#e8a35a', { emissive: '#945418', emissiveIntensity: 0.28, clearcoat: 0.85 });
    const mBeads = instances(item, new T.DodecahedronGeometry(0.072, 0), mMat, 42);
    const putM = instanceUpdater(mBeads);
    for (let i = 0; i < 42; i++) {
      const phi = Math.PI * 0.76 + (i % 14) * 0.30;
      const th = 0.42 + Math.floor(i / 14) * 0.96;
      putM(i, -Math.cos(phi) * Math.sin(th) * 1.88, Math.cos(th) * 1.88, Math.sin(phi) * Math.sin(th) * 1.88);
    }
    mBeads.instanceMatrix.needsUpdate = true;
  }, false);
  createAnchor(envObj, anchors, 'viral_env_main', 0, 0.1, 0.3);
  const tagMatrixM = addTag(envObj, 'Envelope lipídico (do hospedeiro) + Matriz (M)', -0.85, 1.48, 0.95, '#e8a35a', '#ffe8cc', 0.2);

  // B. Sculpted Cryo-EM Trimeric S1/S2 Spike Glycoproteins + Host Bilayer ACE2-like Receptor Docking & Fusion!
  const spikes = [];
  let heroSpike = null, hostPatch = null, dockRing = null, dockRingMat = null, fusionGlow = null;
  const spikeStalkProfile = [
    [0.015, 0], [0.068, 0.02], [0.044, 0.14], [0.048, 0.28], [0.095, 0.40], [0.06, 0.44]
  ];
  const spikeObj = build('viral_spikes', virionCenter, item => {
    const stalkMat = proteinMaterial('#f07d59', { emissive: '#9e3820', emissiveIntensity: 0.28, clearcoat: 0.85 });
    const headMat = proteinMaterial('#ffab78', { emissive: '#b84f2a', emissiveIntensity: 0.34, clearcoat: 0.92 });
    const glycanMat = glow('#ffe4a6', 0.65);
    const up = v(0, 1, 0);

    const buildTrimericSpike = (parentGrp, sc = 1) => {
      lathe(parentGrp, stalkMat, spikeStalkProfile, 12).scale.setScalar(sc);
      for (let k = 0; k < 3; k++) {
        const a = (k / 3) * tau;
        const lobe = sphere(parentGrp, headMat, 0.115 * sc, 0.095 * sc, 0.095 * sc, Math.cos(a) * 0.092 * sc, 0.45 * sc, Math.sin(a) * 0.092 * sc, 11);
        lobe.rotation.y = -a;
        sphere(parentGrp, glycanMat, 0.028 * sc, 0.028 * sc, 0.028 * sc, Math.cos(a) * 0.16 * sc, 0.47 * sc, Math.sin(a) * 0.16 * sc, 6);
      }
    };

    for (let i = 0; i < 24; i++) {
      const y = 1 - (i / 23) * 1.82 - 0.09;
      const r = Math.sqrt(Math.max(0.02, 1 - y * y));
      const phi = i * 2.39996;
      const dir = v(Math.cos(phi) * r, y, Math.sin(phi) * r).normalize();
      if (dir.z > 0.42 && dir.x > -0.3 && dir.x < 0.85 && Math.abs(dir.y) < 0.72) continue;
      const sp = group(item, dir.x * 2.0, dir.y * 2.0, dir.z * 2.0);
      sp.quaternion.setFromUnitVectors(up, dir);
      buildTrimericSpike(sp, 1);
      spikes.push({ group: sp, basePos: sp.position.clone(), dir, phase: i * 0.7 });
    }

    // Hero Spike + Realistic Cutaway Host Phospholipid Bilayer + Cup Receptor (ACE2/CD4)
    const hDir = v(0.55, 0.72, 0.42).normalize();
    heroSpike = group(item, hDir.x * 2.0, hDir.y * 2.0, hDir.z * 2.0);
    heroSpike.quaternion.setFromUnitVectors(up, hDir);
    buildTrimericSpike(heroSpike, 1.12);

    hostPatch = group(item, hDir.x * 3.12, hDir.y * 3.12, hDir.z * 3.12);
    hostPatch.quaternion.setFromUnitVectors(up, hDir);
    // Double-leaflet host membrane disc (not a plain flat box!)
    cylinder(hostPatch, gelMaterial('#4bc7d8', { opacity: 0.56, clearcoat: 0.92, iridescence: 0.4 }), 0.78, 0.78, 0.12, 0, 0.28, 0, 22);
    const lipidHeadMat = proteinMaterial('#88f5ff', { clearcoat: 0.9 });
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * tau;
      sphere(hostPatch, lipidHeadMat, 0.042, 0.036, 0.042, Math.cos(a) * 0.72, 0.34, Math.sin(a) * 0.72, 8);
      sphere(hostPatch, lipidHeadMat, 0.042, 0.036, 0.042, Math.cos(a) * 0.72, 0.22, Math.sin(a) * 0.72, 8);
    }
    const recMat = proteinMaterial('#68f0d8', { emissive: '#1e8a78', emissiveIntensity: 0.46, clearcoat: 0.9 });
    lathe(hostPatch, recMat, [[0.03, 0.24], [0.068, 0.14], [0.056, 0.02], [0.16, -0.06], [0.14, -0.10]], 16);
    dockRingMat = glow('#ffe37d', 1.15, { transparent: true, opacity: 0, depthWrite: false });
    dockRing = torus(hostPatch, dockRingMat, 0.26, 0.026, 0, -0.09, 0);
    dockRing.rotation.x = Math.PI / 2;
    fusionGlow = sphere(hostPatch, glow('#ff9ec4', 1.1, { transparent: true, opacity: 0 }), 0.24, 0.12, 0.24, 0, 0.04, 0, 14);
    hostPatch.visible = false;
  }, false);
  createAnchor(spikeObj, anchors, 'viral_spikes_main', 1.35, 1.78, 1.02);
  const tagSpike = addTag(spikeObj, 'Espícula S1/S2 trimérica (glicoproteína)', 0.65, 1.55, 1.35, '#ffab78', '#ffe4d4', 0.2);
  const tagHostRec = addTag(spikeObj, 'Receptor celular (chave-fechadura → fusão)', 1.9, 2.38, 1.35, '#68f0d8', '#d6fffa', 0.2);

  // C. Geodesic Icosahedral Protein Capsid (Hexon + Penton Capsomeres!)
  let capsidRot = null;
  const capsidObj = build('viral_capsid', virionCenter, item => {
    capsidRot = group(item);
    const capGeo = new T.IcosahedronGeometry(1.36, 1);
    const capMat = membraneMaterial('#8c78f0', { opacity: 0.34, clearcoat: 0.85, roughness: 0.2 });
    mesh(capsidRot, capGeo, capMat);
    capsidRot.add(new T.LineSegments(new T.EdgesGeometry(capGeo),
      new T.LineBasicMaterial({ color: '#c4b5ff', transparent: true, opacity: 0.62 })));
    const posAttr = capGeo.attributes.position;
    const seen = new Set();
    const verts = [];
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i), vy = posAttr.getY(i), vz = posAttr.getZ(i);
      if (vz > 0.55 && vx > -0.15 && Math.abs(vy) < 0.85) continue;
      const key = `${vx.toFixed(2)},${vy.toFixed(2)},${vz.toFixed(2)}`;
      if (!seen.has(key)) { seen.add(key); verts.push(v(vx, vy, vz)); }
    }
    const capBeads = instances(capsidRot, new T.CylinderGeometry(0.115, 0.13, 0.15, 6),
      proteinMaterial('#a894ff', { emissive: '#4d38a8', emissiveIntensity: 0.34, clearcoat: 0.86 }), verts.length);
    const dummy = new T.Object3D();
    const up = v(0, 1, 0);
    verts.forEach((pt, i) => {
      dummy.position.copy(pt);
      dummy.quaternion.setFromUnitVectors(up, pt.clone().normalize());
      dummy.updateMatrix();
      capBeads.setMatrixAt(i, dummy.matrix);
    });
    capBeads.instanceMatrix.needsUpdate = true;
  }, false);
  createAnchor(capsidObj, anchors, 'viral_capsid_main', 0.1, 0.1, 0.65);
  const tagCapsid = addTag(capsidObj, 'Capsídeo icosaédrico (capsômeros hexon/penton)', 0.15, 1.55, 0.7, '#a894ff', '#ebe5ff', 0.2);

  // D. Coiled Viral Genetic Core (RNA/DNA + N-proteins + Viral Polymerase)
  let genomeSpin = null, polMat = null, repSparks = null, putRep = null;
  const genomeObj = build('viral_genome', virionCenter, item => {
    genomeSpin = group(item);
    const pts = Array.from({ length: 76 }, (_, i) => {
      const u = i / 75;
      const a = u * tau * 4.5;
      const rad = 0.22 + Math.sin(u * Math.PI) * 0.56;
      return v(Math.cos(a) * rad, (u - 0.5) * 1.48, Math.sin(a) * rad);
    });
    tube(genomeSpin, proteinMaterial('#ffd266', { emissive: '#c47e18', emissiveIntensity: 0.48, clearcoat: 0.88 }), pts, 0.056, false, 92, 9);
    const nBeads = instances(genomeSpin, new T.DodecahedronGeometry(0.088, 0), glow('#ff82c4', 0.65), 26);
    const putN = instanceUpdater(nBeads);
    for (let i = 0; i < 26; i++) {
      const p = pts[Math.floor((i / 25) * (pts.length - 1))];
      putN(i, p.x, p.y, p.z);
    }
    nBeads.instanceMatrix.needsUpdate = true;
    polMat = proteinMaterial('#68f0b8', { emissive: '#1e8a5c', emissiveIntensity: 0.45, clearcoat: 0.88 });
    mesh(genomeSpin, organicDisplace(new T.SphereGeometry(0.24, 16, 12), 0.12, 4, 3), polMat, 0.25, -0.1, 0.35);
    repSparks = instances(item, new T.SphereGeometry(0.048, 8, 6), glow('#9effd4', 1.0), 14, true);
    putRep = instanceUpdater(repSparks);
  }, false);
  createAnchor(genomeObj, anchors, 'viral_genome_main', 0, 0, 0.35);
  const tagGenome = addTag(genomeObj, 'Genoma viral (RNA / DNA + proteínas N)', 0, 0.98, 0.55, '#ffd266', '#fff2cc', 0.19);
  const tagPol = addTag(genomeObj, 'Polimerase / Transcriptase reversa viral', 0.35, -0.85, 0.55, '#68f0b8', '#d9ffef', 0.18);

  // E. Authentic Prolate Bacteriophage T4 (Piston: Head+Collar+HOLLOW Blue Tube gp19 | Base-Anchored Contractile Sheath gp18 | Naked dsDNA Filament!)
  let pistonGrp = null, sheathGrp = null, headDnaCoil = null, headDnaMat = null, dnaThread = null;
  const SHEATH_TOP = 0.56, SHEATH_BOT = -0.72, SHEATH_H = SHEATH_TOP - SHEATH_BOT;
  const phageObj = build('viral_phage', [2.85, -0.15, 0.35], item => {
    // 1. RIGID DESCENDING PISTON: Prolate Capsid + Coiled Naked dsDNA + Collar/Whiskers + HOLLOW Blue Inner Tail Tube (gp19)!
    //    Moves down as ONE rigid piece during contraction so the top NEVER disconnects or looks empty!
    pistonGrp = group(item, 0, 0, 0);

    const headMat = gelMaterial('#48db9b', { opacity: 0.44, clearcoat: 0.95, iridescence: 0.42 });
    const headGeo = new T.IcosahedronGeometry(0.66, 0);
    const head = mesh(pistonGrp, headGeo, headMat, 0, 1.44, 0);
    head.scale.set(0.84, 1.32, 0.84);
    const wire = new T.LineSegments(new T.EdgesGeometry(headGeo),
      new T.LineBasicMaterial({ color: '#9effd4', transparent: true, opacity: 0.78 }));
    wire.position.set(0, 1.44, 0);
    wire.scale.set(0.84, 1.32, 0.84);
    pistonGrp.add(wire);

    // Tightly packed NAKED dsDNA coil (NO histones — condensed by Mg2+ & polyamines at ~60 atm!) inside translucent capsid
    headDnaCoil = group(pistonGrp, 0, 1.44, 0);
    headDnaMat = proteinMaterial('#ffe066', { emissive: '#c47c12', emissiveIntensity: 0.72, clearcoat: 0.9 });
    const coilPts = Array.from({ length: 56 }, (_, i) => {
      const f = i / 55;
      const a = f * tau * 5.5;
      const r = 0.36 * Math.sin(f * Math.PI);
      return v(Math.cos(a) * r, (f - 0.5) * 1.05, Math.sin(a) * r);
    });
    tube(headDnaCoil, headDnaMat, coilPts, 0.022, false, 64, 6);

    // Sculpted Neck / Collar (gp13/gp14) + Fibritin Whiskers permanently locking capsid to inner tube!
    const collarMat = proteinMaterial('#68d0e8', { emissive: '#1e6e85', emissiveIntensity: 0.28, clearcoat: 0.9 });
    lathe(pistonGrp, collarMat, [[0.06, 0.54], [0.22, 0.58], [0.24, 0.66], [0.16, 0.74], [0.06, 0.74]], 16);
    for (let w = 0; w < 6; w++) {
      const wa = (w / 6) * tau;
      rod(pistonGrp, glow('#a8f6ff', 0.6), v(Math.cos(wa) * 0.21, 0.64, Math.sin(wa) * 0.21),
        v(Math.cos(wa) * 0.44, 0.74, Math.sin(wa) * 0.44), 0.012, 6);
    }

    // GENUINELY HOLLOW BLUE INNER TAIL TUBE (gp19: translucent sapphire outer wall + open dark lumen bore + lysozyme needle tip!)
    const hollowBlueMat = gelMaterial('#36a6f5', { opacity: 0.58, emissive: '#125a9c', emissiveIntensity: 0.32, clearcoat: 1.0, iridescence: 0.35 });
    hollowCoreTube(pistonGrp, hollowBlueMat, 0.086, 0.052, 1.54, 0, -0.15, 0, 22);
    // Crisp glowing inner-rim rings at top & bottom of the hollow blue tube so the hollow bore is unmistakably clear!
    torus(pistonGrp, glow('#9ee8ff', 0.85), 0.068, 0.012, 0, 0.62, 0).rotation.x = Math.PI / 2;
    torus(pistonGrp, glow('#9ee8ff', 0.85), 0.068, 0.012, 0, -0.92, 0).rotation.x = Math.PI / 2;
    // Open hollow gp5/gp27 lysozyme piercing needle nozzle at bottom of blue tube!
    lathe(pistonGrp, proteinMaterial('#7ce8ff', { emissive: '#1e85a8', emissiveIntensity: 0.48, clearcoat: 0.95 }), [
      [0.044, -1.06], [0.066, -1.04], [0.086, -0.92], [0.052, -0.92], [0.044, -1.06]
    ], 16);

    // 2. BASE-ANCHORED CONTRACTILE HELICAL SHEATH (gp18): anchored at y = SHEATH_BOT (-0.72), extending UP to SHEATH_TOP (+0.56)!
    //    Front cutaway window reveals the HOLLOW BLUE INNER TUBE & NAKED dsDNA THREAD passing straight inside!
    sheathGrp = group(item, 0, SHEATH_BOT, 0);
    const ringMat = proteinMaterial('#46bf8a', { emissive: '#196e4b', emissiveIntensity: 0.28, clearcoat: 0.86 });
    const ringCount = 11;
    for (let i = 0; i < ringCount; i++) {
      const ry = (i + 0.5) * (SHEATH_H / ringCount);
      // 265° cutaway arc leaving a crisp front inspection slot showing the hollow blue tube inside!
      const r = torus(sheathGrp, ringMat, 0.172, 0.042, 0, ry, 0, Math.PI * 1.46);
      r.rotation.x = Math.PI / 2;
      r.rotation.z = -Math.PI * 0.23 + i * 0.08;
    }

    // 3. ANCHORED HEXAGONAL BASEPLATE (open central hollow bore!) + 6 TAIL PINS + 6 LONG ARTICULATED TAIL FIBERS!
    lathe(item, collarMat, [
      [0.10, -0.84], [0.38, -0.84], [0.34, -0.72], [0.10, -0.72], [0.10, -0.84]
    ], 6);
    const fiberMat = proteinMaterial('#8cf0c4', { clearcoat: 0.78 });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * tau;
      cylinder(item, glow('#ffd268', 0.72), 0.022, 0.008, 0.24, Math.cos(a) * 0.28, -0.96, Math.sin(a) * 0.28, 7);
      const knee = v(Math.cos(a) * 0.84, -0.38, Math.sin(a) * 0.84);
      const foot = v(Math.cos(a) * 1.18, -1.25, Math.sin(a) * 1.18);
      rod(item, fiberMat, v(Math.cos(a) * 0.34, -0.78, Math.sin(a) * 0.34), knee, 0.032);
      rod(item, fiberMat, knee, foot, 0.026);
      sphere(item, glow('#a6ffe0', 0.75), 0.052, 0.052, 0.052, foot.x, foot.y, foot.z, 8);
    }

    // Two-layer host bacterial envelope pad with hollow puncture pore in center (peptidoglycan + plasma membrane!)
    lathe(item, proteinMaterial('#c9a468', { opacity: 0.76, transparent: true }), [
      [0.10, -1.32], [1.48, -1.32], [1.48, -1.23], [0.10, -1.23], [0.10, -1.32]
    ], 30);
    lathe(item, gelMaterial('#5bc7d4', { opacity: 0.56, clearcoat: 0.88 }), [
      [0.10, -1.45], [1.46, -1.45], [1.46, -1.35], [0.10, -1.35], [0.10, -1.45]
    ], 30);

    // 4. CONTINUOUS NAKED DOUBLE-STRANDED DNA FILAMENT (ZERO HISTONES!) threading through the hollow blue inner tube!
    dnaThread = makeAnimatedDsDna(item, 76);
  }, false);
  createAnchor(phageObj, anchors, 'viral_phage_main', 0, 0.05, 0.2);
  const tagPhageHead = addTag(phageObj, 'Bacteriófago T4 · dsDNA linear nu (~169 kb, sem histonas)', 0, 2.38, 0.35, '#48db9b', '#dbffef', 0.19);
  const tagPhageInj = addTag(phageObj, 'Tubo interno oco (gp19) injeta fio contínuo de DNA nu', 0, -1.86, 0.45, '#ffe370', '#fff4cc', 0.19);

  updaters.push((t, _dt, _key, activeAnim) => {
    const isEnv = activeAnim === 'viral_envelope';
    const isDock = activeAnim === 'viral_docking' || activeAnim === 'viral_fusion';
    const isFuse = activeAnim === 'viral_fusion';
    const isCap = activeAnim === 'viral_capsid';
    const isGen = activeAnim === 'viral_genome';
    const isPhage = activeAnim === 'phage_inject' || activeAnim === 'phage_adsorb';

    tagMatrixM.visible = isEnv;
    tagSpike.visible = isDock;
    tagHostRec.visible = isDock;
    tagCapsid.visible = isCap;
    tagGenome.visible = isGen;
    tagPol.visible = isGen;
    tagPhageHead.visible = isPhage;
    tagPhageInj.visible = activeAnim === 'phage_inject';

    for (const s of spikes) {
      const sway = Math.sin(t * 2.1 + s.phase) * 0.032;
      s.group.position.copy(s.basePos).addScaledVector(s.dir, sway);
    }
    hostPatch.visible = isDock;
    if (isDock) {
      const cyc = (t * 0.45) % 1;
      const press = Math.sin(cyc * Math.PI);
      const hDir = v(0.55, 0.72, 0.42).normalize();
      hostPatch.position.copy(hDir).multiplyScalar(isFuse ? 2.82 - press * 0.32 : 3.16 - press * 0.48);
      const locked = Math.max(0, (press - 0.62) / 0.38);
      dockRingMat.opacity = locked * 0.96;
      dockRing.scale.setScalar(0.85 + locked * 0.7);
      fusionGlow.material.opacity = isFuse ? locked * 0.88 : 0;
    }

    capsidRot.rotation.y = Math.sin(t * 0.35) * 0.16;
    genomeSpin.rotation.y = t * (isGen ? 1.5 : 0.4);
    polMat.emissiveIntensity = isGen ? 0.88 + Math.sin(t * 6) * 0.22 : 0.35;
    repSparks.visible = isGen;
    if (isGen) {
      for (let i = 0; i < repSparks.count; i++) {
        const p = (t * 0.62 + i / repSparks.count) % 1;
        const a = p * tau * 2 + i;
        const r = 0.25 + p * 0.62;
        putRep(i, Math.cos(a) * r, -0.5 + p * 1.1, Math.sin(a) * r, Math.sin(p * Math.PI) * 1.2);
      }
      repSparks.instanceMatrix.needsUpdate = true;
    }

    // Authentic T4 Contraction: Head+Collar+Hollow Blue Tube descend TOGETHER as one rigid piston
    // while the baseplate-anchored helical sheath compresses & widens with ZERO empty gap at top!
    const pCyc = (t * (activeAnim === 'phage_inject' ? 0.34 : 0.16)) % 1;
    const contract = activeAnim === 'phage_adsorb' ? 0.04
      : pCyc < 0.28 ? smootherstep(pCyc / 0.28) : pCyc < 0.82 ? 1 : 1 - smootherstep((pCyc - 0.82) / 0.18);
    const stroke = contract * (SHEATH_H * 0.44);
    pistonGrp.position.y = -stroke;
    sheathGrp.scale.y = 1 - contract * 0.44;
    sheathGrp.scale.x = sheathGrp.scale.z = 1 + contract * 0.22;

    const ejectFrac = activeAnim === 'phage_adsorb' ? 0
      : pCyc < 0.24 ? 0 : pCyc < 0.82 ? smootherstep((pCyc - 0.24) / 0.56) : 1 - smootherstep((pCyc - 0.82) / 0.18);
    // Capsid DNA coil visibly unwinds & drains as naked dsDNA shoots down the hollow blue inner tube!
    headDnaCoil.scale.setScalar(1 - ejectFrac * 0.48);
    headDnaCoil.rotation.y = t * (1.2 + ejectFrac * 3.5);
    headDnaMat.emissiveIntensity = 0.88 - ejectFrac * 0.38;

    const showDna = activeAnim === 'phage_inject' || ejectFrac > 0.05;
    dnaThread.setVisible(showDna);
    if (showDna) {
      const topY = 1.25 - stroke;
      const nozzleTipY = -1.06 - stroke;
      const botY = nozzleTipY - 0.12 - ejectFrac * 1.15;
      dnaThread.update(topY, botY, nozzleTipY - 0.05, t, Math.max(0.28, ejectFrac));
    }
  });
  return updaters;
}

// ============================================================================
// 2. FIBRA MUSCULAR ESQUELÉTICA (MIÓCITO ESTRIADO MULTINUCLEADO)
//    Sarcolema + Tríades (Túbulos T + Cisternas Terminais) + Sarcômeros com
//    Bandas A/I/H, Pontes Cruzadas de Miosina II, Troponina e Titina + Mitocôndrias
// ============================================================================
function buildMuscleModel({ build, anchors }) {
  const updaters = [];
  const halfLength = 4.1;
  const cutStart = Math.PI * 0.78;
  const cutArc = Math.PI * 1.44;
  const triadXs = [-2.4, 0, 2.4];
  const mitochondria = [[-2.2, -1.15, 0.22], [-0.4, -1.2, 0.35], [1.4, -1.15, 0.28], [2.6, 0.85, 0.32]];

  function fiberPoint(x, angle, scale = 1) {
    const u = x / halfLength;
    const radius = 1.74 * scale * (1 - 0.055 * u * u
      + 0.019 * Math.sin(angle * 3 + x * 0.8) + 0.012 * Math.cos(angle * 7 - x * 1.4));
    return v(x, radius * Math.sin(angle) + 0.044 * Math.sin(x * 0.91), radius * Math.cos(angle));
  }

  function fiberSurface(scale, cut) {
    const geo = new T.CylinderGeometry(1, 1, halfLength * 2, 48, 32, cut, cut ? cutStart : 0, cut ? cutArc : tau);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      const p = fiberPoint(-pos.getY(i), Math.atan2(x, z), scale * Math.hypot(x, z));
      pos.setXYZ(i, p.x, p.y, p.z);
    }
    geo.computeVertexNormals();
    return geo;
  }

  const ringPoints = (x, scale) => Array.from({ length: 36 }, (_, i) => fiberPoint(x, i * tau / 36, scale));

  // A. Cutaway Cylindrical Sarcolemma + Transverse T-tubule invaginations
  const tPulses = [];
  const sarcoObj = build('muscle_sarcolemma', [0, 0, 0], item => {
    const mat = membraneMaterial('#da8584', { opacity: 0.43, clearcoat: 0.76, bumpScale: 0.027 });
    mat.userData.shell = 0.43;
    mesh(item, fiberSurface(1, true), mat);
    const sarcoplasm = gelMaterial('#9b525b', { opacity: 0.26, roughness: 0.34, bumpScale: 0.013 });
    sarcoplasm.userData.shell = 0.26;
    mesh(item, fiberSurface(0.965, false), sarcoplasm);
    const rim = proteinMaterial('#bc777c', { roughness: 0.37 });
    for (const angle of [cutStart, cutStart + cutArc]) {
      tube(item, rim, Array.from({ length: 25 }, (_, i) => fiberPoint(-halfLength + i * halfLength / 12, angle)),
        0.028, false, 34, 7);
    }

    const ttMat = proteinMaterial('#70bfc4', { emissive: '#326970', emissiveIntensity: 0.23, roughness: 0.30 });
    for (const tx of triadXs) {
      tube(item, ttMat, ringPoints(tx, 0.56), 0.041, true, 42, 8);
      for (const angle of [-0.44, Math.PI + 0.38]) {
        const entrance = fiberPoint(tx, angle, 0.995);
        const inside = fiberPoint(tx, angle + 0.03, 0.79);
        const junction = fiberPoint(tx, angle, 0.56);
        const route = curve([entrance, inside, junction]);
        taperedTube(item, ttMat, route, u => 0.038 + 0.034 * (1 - u) ** 2, 15, 8);
        const pulse = sphere(item, glow('#9bedec', 0.67), 0.053, 0.053, 0.053, entrance.x, entrance.y, entrance.z, 8);
        tPulses.push({ pulse, route });
      }
    }
  }, false);
  createAnchor(sarcoObj, anchors, 'muscle_sarco_main', 0, 0.35, 0.6);
  const tagTtub = addTag(sarcoObj, 'Sarcolema + Túbulos T (despolarização)', 0, 1.92, 0.4, '#5ce0ed', '#d9fbff', 0.22);

  // B. Peripheral Flattened Multinucleated Nuclei with visible nucleoli
  const nucObj = build('muscle_nuclei', [0, 0, 0], item => {
    const nucMat = proteinMaterial('#9682f0', { emissive: '#4d3ca6', emissiveIntensity: 0.3, clearcoat: 0.84 });
    const nolusMat = glow('#ff9ed4', 0.68);
    for (const [x, angle] of [[-2.7, 1.26], [-0.4, 1.92], [1.9, 1.32], [2.8, -1.74]]) {
      const p = fiberPoint(x, angle, 0.875);
      const submembrane = group(item, p.x, p.y, p.z);
      submembrane.rotation.x = -angle;
      const nucleus = mesh(submembrane, organicDisplace(new T.SphereGeometry(0.41, 24, 16), 0.052, 3, x), nucMat);
      nucleus.scale.set(1.54, 0.65, 0.36);
      sphere(submembrane, nolusMat, 0.102, 0.069, 0.064, 0.13, 0.025, 0.041, 12);
    }
  }, false);
  createAnchor(nucObj, anchors, 'muscle_nuclei_main', -1.8, 1.32, 0.35);
  const tagMultinuc = addTag(nucObj, 'Núcleos periféricos (sincício multinucleado)', -1.5, 2.0, 0.4, '#a894ff', '#ece6ff', 0.22);

  // C. Sculpted Contracting Myofibrils & Sarcomeres (Z-disc, Myosin II Cross-Bridges, Actin + Troponin, Elastic Titin!)
  const sarcomereUnits = [];
  const myosinHeads = [];
  const bundledFibrils = [];
  const sarcoMeshObj = build('muscle_sarcomere', [0, 0, 0], item => {
    const zMat = proteinMaterial('#deb976', { emissive: '#866038', emissiveIntensity: 0.25, clearcoat: 0.72 });
    const zDiscMat = gelMaterial('#ce9f6b', { opacity: 0.58, roughness: 0.36 });
    const myosinMat = proteinMaterial('#e0526c', { emissive: '#8f1e38', emissiveIntensity: 0.34, clearcoat: 0.84 });
    const headMat = proteinMaterial('#ff889e', { emissive: '#b8324e', emissiveIntensity: 0.44, clearcoat: 0.9 });
    const actinMat = proteinMaterial('#68e0f5', { emissive: '#1e788f', emissiveIntensity: 0.32, clearcoat: 0.84 });
    const tropoMat = glow('#82ffbe', 0.85);
    const titinMat = proteinMaterial('#e6c28b', { emissiveIntensity: 0.21 });
    const mLineMat = proteinMaterial('#d991ae', { emissiveIntensity: 0.22 });
    const titinSpiral = curve(Array.from({ length: 25 }, (_, i) => {
      const u = i / 24, phase = u * tau * 4;
      const radius = 0.031 * Math.sin(Math.PI * u);
      return v(u, Math.cos(phase) * radius, Math.sin(phase) * radius);
    }));
    const titinGeo = new T.TubeGeometry(titinSpiral, 32, 0.012, 7);
    const fibrilMat = gelMaterial('#b85f69', { opacity: 0.54, roughness: 0.33, bumpScale: 0.012 });
    for (const [index, [y, z]] of [[0.95, -0.63], [-0.93, -0.58], [0.06, -1.11], [0.81, 0.04], [-0.82, -0.015], [0.04, 0.95]].entries()) {
      const extent = halfLength - 0.095;
      const profile = Array.from({ length: 81 }, (_, i) => {
        const x = T.MathUtils.lerp(-extent, extent, i / 80);
        const band = 0.038 * Math.cos(x * tau / 2.4) + 0.016 * Math.cos(x * tau / 0.8);
        return [0.26 + band + 0.01 * Math.sin(index * 1.9 + x), x];
      });
      profile.unshift([0, -extent]);
      profile.push([0, extent]);
      const fibril = lathe(item, fibrilMat, profile, 20, 0, y, z);
      fibril.rotation.z = -Math.PI / 2;
      bundledFibrils.push(fibril);
    }

    const bundleOffsets = [[0, 0.46, 0.48], [0, -0.46, 0.48], [0, 0, -0.45]];
    for (let bi = 0; bi < bundleOffsets.length; bi++) {
      const [bx, by, bz] = bundleOffsets[bi];
      const bundle = group(item, bx, by, bz);
      for (const [index, sx] of [-2.4, 0, 2.4].entries()) {
        const unit = group(bundle, sx, 0, 0);
        const mLine = torus(unit, mLineMat, 0.235, 0.021);
        mLine.rotation.y = Math.PI / 2;
        for (let r = 0; r < 5; r++) {
          const a = (r / 5) * tau;
          const ry = Math.cos(a) * 0.21, rz = Math.sin(a) * 0.21;
          const m = cylinder(unit, myosinMat, 0.038, 0.038, 1.18, 0, ry, rz, 8);
          m.rotation.z = Math.PI / 2;
          rod(unit, mLineMat, v(0, 0, 0), v(0, Math.cos(a) * 0.233, Math.sin(a) * 0.233), 0.015, 6);
          // Sculpted angled Myosin II cross-bridge heads on the hero top bundle!
          if (bi === 0 && sx === 0) {
            for (const hx of [-0.46, -0.26, 0.26, 0.46]) {
              const hg = group(unit, hx, ry, rz);
              const outY = Math.cos(a) * 0.068, outZ = Math.sin(a) * 0.068;
              rod(hg, headMat, v(0, 0, 0), v(Math.sign(hx) * 0.04, outY, outZ), 0.013, 6);
              sphere(hg, headMat, 0.026, 0.022, 0.022, Math.sign(hx) * 0.055, outY * 1.15, outZ * 1.15, 7);
              myosinHeads.push({ grp: hg, dir: Math.sign(hx), phase: hx * 4 + r });
            }
          }
        }
        // Left & Right sliding Z-discs + Actin filaments + Troponin Ca2+ beads + Elastic Titin links!
        const leftZ = group(unit, -1.2, 0, 0);
        const rightZ = group(unit, 1.2, 0, 0);
        // Adjacent sarcomeres share a single Z disc without separating during contraction.
        for (const disc of index === 2 ? [leftZ, rightZ] : [leftZ]) {
          cylinder(disc, zDiscMat, 0.365, 0.365, 0.048, 0, 0, 0, 24).rotation.z = Math.PI / 2;
          torus(disc, zMat, 0.374, 0.024).rotation.y = Math.PI / 2;
        }
        for (let r = 0; r < 6; r++) {
          const a = (r / 6) * tau + 0.3;
          const ry = Math.cos(a) * 0.29, rz = Math.sin(a) * 0.29;
          const aL = cylinder(leftZ, actinMat, 0.019, 0.019, 0.88, 0.44, ry, rz, 6);
          aL.rotation.z = Math.PI / 2;
          const aR = cylinder(rightZ, actinMat, 0.019, 0.019, 0.88, -0.44, ry, rz, 6);
          aR.rotation.z = Math.PI / 2;
          if (bi === 0 && sx === 0 && r % 2 === 0) {
            sphere(leftZ, tropoMat, 0.024, 0.024, 0.024, 0.56, ry, rz, 6);
            sphere(rightZ, tropoMat, 0.024, 0.024, 0.024, -0.56, ry, rz, 6);
          }
        }
        // The spring starts on the thick filament and stays attached to the moving Z disc.
        const titL = mesh(unit, titinGeo, titinMat, -0.56, 0.21, 0);
        const titR = mesh(unit, titinGeo, titinMat, 0.56, 0.21, 0);
        sarcomereUnits.push({ unit, index: index - 1, leftZ, rightZ, titL, titR });
      }
    }
  }, false);
  createAnchor(sarcoMeshObj, anchors, 'muscle_sarcomere_main', 0, 0.46, 0.55);
  const tagZLine = addTag(sarcoMeshObj, 'Linha Z · Banda I (clara) · Titina elástica', -1.05, 1.12, 0.88, '#ffd266', '#fff2cc', 0.19);
  const tagMyosin = addTag(sarcoMeshObj, 'Banda A (Miosina II + pontes cruzadas) · Zona H', 0.12, 0.96, 0.92, '#ff889e', '#ffe0e6', 0.19);
  const tagActin = addTag(sarcoMeshObj, 'Actina + Troponina/Ca²⁺ (deslizamento com ATP)', 0.95, -0.05, 0.96, '#68e0f5', '#dcfbff', 0.19);

  // D. Sarcoplasmic Reticulum Triads (Terminal Cisternae flanking each T-tubule!) + Ca2+ release cloud
  let caIons = null, putCa = null, srMat = null;
  const srObj = build('muscle_sr', [0, 0, 0], item => {
    srMat = proteinMaterial('#58ba99', { emissive: '#295c49', emissiveIntensity: 0.22, clearcoat: 0.68 });
    const cisternaOffset = 0.15;
    const cisternaScale = 0.58;
    for (const tx of triadXs) {
      for (const side of [-cisternaOffset, cisternaOffset]) {
        tube(item, srMat, ringPoints(tx + side, cisternaScale), 0.065, true, 44, 9);
      }
    }
    // Longitudinal branches physically join the adjacent cisternae.
    for (let i = 0; i < triadXs.length - 1; i++) {
      const from = triadXs[i] + cisternaOffset;
      const to = triadXs[i + 1] - cisternaOffset;
      for (let j = 0; j < 8; j++) {
        const angle = j * tau / 8;
        tube(item, srMat, [fiberPoint(from, angle, cisternaScale), fiberPoint(T.MathUtils.lerp(from, to, 0.28), angle + 0.10, 0.61),
          fiberPoint(T.MathUtils.lerp(from, to, 0.70), angle - 0.08, 0.62),
          fiberPoint(to, angle, cisternaScale)], 0.035, false, 18, 7);
      }
    }
    caIons = instances(item, new T.SphereGeometry(0.044, 8, 6), glow('#7dffbf', 1.05), 30, true);
    putCa = instanceUpdater(caIons);
  }, false);
  createAnchor(srObj, anchors, 'muscle_sr_main', -0.45, -0.2, 0.92);
  const tagTriad = addTag(srObj, 'Tríade muscular (1 Túbulo T + 2 Cisternas terminais)', -0.2, 0.92, 1.08, '#5ce0ed', '#dcfbff', 0.2);
  const tagSR = addTag(srObj, 'Retículo sarcoplasmático · Ca²⁺ (Rianodina / SERCA)', -0.4, -1.2, 1.08, '#7dffbf', '#dcffef', 0.2);

  // E. Sculpted Cutaway Aligned Mitochondria (with internal cristae!) fueling contraction
  let mAtp = null, putMAtp = null;
  const mitoObj = build('muscle_mito', [0, 0, 0], item => {
    for (const [i, [mx, my, mz]] of mitochondria.entries()) {
      miniCutMito(item, mx, my, mz, 0.88 + i * 0.045, 0.09 * Math.sin(i * 1.65));
    }
    mAtp = instances(item, new T.SphereGeometry(0.048, 8, 6), glow('#82ffd4', 1.02), 18, true);
    putMAtp = instanceUpdater(mAtp);
  }, false);
  createAnchor(mitoObj, anchors, 'muscle_mito_main', 1.4, -0.95, 0.45);
  const tagMMito = addTag(mitoObj, 'Mitocôndrias interfibrilares (ATP para miosina e SERCA)', 1.2, -1.66, 0.6, '#e87c66', '#ffe0d9', 0.2);

  let contractionPhase = 0, beat = 0;
  updaters.push((t, dt, _key, activeAnim) => {
    const isSarco = activeAnim === 'muscle_sarco';
    const isNuc = activeAnim === 'muscle_nuclei';
    const isBands = activeAnim === 'muscle_bands';
    const isContract = activeAnim === 'muscle_contract';
    const isTriad = activeAnim === 'muscle_triad';
    const isSR = activeAnim === 'muscle_sr';
    const isMito = activeAnim === 'muscle_mito';

    tagTtub.visible = isSarco;
    tagMultinuc.visible = isNuc;
    tagZLine.visible = isContract || isBands;
    tagMyosin.visible = isContract || isBands;
    tagActin.visible = isContract;
    tagTriad.visible = isTriad;
    tagSR.visible = isSR || isTriad;
    tagMMito.visible = isMito;

    const contracting = isContract || activeAnim === 'muscle_overview';
    if (contracting) contractionPhase = (contractionPhase + dt * 2.9) % tau;
    const targetBeat = contracting ? 0.5 - 0.5 * Math.cos(contractionPhase) : 0;
    beat += (targetBeat - beat) * (1 - Math.exp(-dt * 13));
    if (!contracting && beat < 0.002) contractionPhase = 0;
    const span = 1.2 - beat * 0.28;
    const axialScale = span / 1.2;
    const radialScale = 1 / Math.sqrt(axialScale);
    sarcoObj.scale.set(axialScale, radialScale, radialScale);
    nucObj.scale.copy(sarcoObj.scale);
    srObj.scale.copy(sarcoObj.scale);
    mitoObj.scale.copy(sarcoObj.scale);
    sarcoMeshObj.scale.set(1, radialScale, radialScale);
    for (const s of sarcomereUnits) {
      s.leftZ.position.x = -span;
      s.rightZ.position.x = span;
      s.unit.position.x = s.index * 2 * span;
      s.titL.scale.x = -(span - 0.56);
      s.titR.scale.x = span - 0.56;
    }
    for (const fibril of bundledFibrils) fibril.scale.y = axialScale;
    // Cross-bridge myosin II heads actively rowing toward M-line!
    for (const mh of myosinHeads) {
      mh.grp.rotation.z = contracting ? Math.sin(t * 7.2 + mh.phase) * 0.34 * mh.dir : 0;
    }

    for (const [i, { pulse, route }] of tPulses.entries()) {
      pulse.visible = isSarco || isTriad;
      if (pulse.visible) {
        const p = (t * 0.9 + i * 0.22) % 1;
        route.getPointAt(p, pulse.position);
        pulse.scale.setScalar(Math.sin(p * Math.PI));
      }
    }

    srMat.emissiveIntensity = isSR || isTriad ? 0.48 : 0.22;
    caIons.visible = isSR || isContract || isTriad;
    if (caIons.visible) {
      for (let i = 0; i < caIons.count; i++) {
        const p = (t * 0.78 + i / caIons.count) % 1;
        const tx = triadXs[i % triadXs.length] + (i % 2 ? 0.15 : -0.15);
        const angle = Math.floor(i / triadXs.length) * 0.63;
        const q = fiberPoint(tx, angle, 0.58 - p * 0.19);
        putCa(i, q.x, q.y, q.z, Math.sin(p * Math.PI) * 0.82);
      }
      caIons.instanceMatrix.needsUpdate = true;
    }

    mAtp.visible = isMito || isContract;
    if (mAtp.visible) {
      for (let i = 0; i < mAtp.count; i++) {
        const p = (t * 0.65 + i / mAtp.count) % 1;
        const [mx, my, mz] = mitochondria[i % mitochondria.length];
        putMAtp(i, mx + p * 0.22, T.MathUtils.lerp(my, Math.sign(my) * 0.47, p),
          T.MathUtils.lerp(mz, 0.48, p), Math.sin(p * Math.PI) * 0.78);
      }
      mAtp.instanceMatrix.needsUpdate = true;
    }
  });
  return updaters;
}

// ============================================================================
// 3. CÉLULA-TRONCO (PLURIPOTENTE INDIFERENCIADA)
//    Nicho extracelular + Receptores Notch/Wnt + Núcleo gigante eucromático
//    Silhuetas 3D reais das linhagens diferenciadas + Divisão assimétrica!
// ============================================================================
function buildStemModel({ build, anchors }) {
  const updaters = [];
  let nucCore = null, fates = [], fateFlux = null, putFlux = null, daughterOrb = null;

  const memObj = build('stem_membrane', [0, 0, 0], item => {
    const geo = organicDisplace(new T.SphereGeometry(2.55, 44, 28, Math.PI * 0.78, Math.PI * 1.44), 0.02, 3.0, 11);
    const mat = membraneMaterial('#66e0f2', { opacity: 0.28, clearcoat: 0.92, iridescence: 0.35, bumpScale: 0.024 });
    mat.userData.shell = 0.28;
    mesh(item, geo, mat);
    // Subtle extracellular matrix niche cradle supporting stem cell
    torus(item, gelMaterial('#88f5dc', { opacity: 0.32 }), 2.35, 0.09, 0, -2.42, 0).rotation.x = Math.PI / 2;
    // Sculpted dimeric niche receptors (Wnt / Notch / BMP) with Y-shaped extracellular sensors
    const rMat = proteinMaterial('#7dffdf', { emissive: '#1e8a72', emissiveIntensity: 0.42, clearcoat: 0.88 });
    const up = v(0, 1, 0);
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * tau;
      const dir = v(Math.cos(a), Math.sin(a), 0).normalize();
      const rg = group(item, dir.x * 2.55, dir.y * 2.55, 0);
      rg.quaternion.setFromUnitVectors(up, dir);
      cylinder(rg, rMat, 0.032, 0.036, 0.26, 0, 0.13, 0, 8);
      sphere(rg, glow('#9effe6', 0.78), 0.056, 0.048, 0.048, -0.055, 0.29, 0, 8);
      sphere(rg, glow('#9effe6', 0.78), 0.056, 0.048, 0.048, 0.055, 0.29, 0, 8);
    }
  }, false);
  createAnchor(memObj, anchors, 'stem_mem_main', 0, 0.4, 0.6);
  const tagRec = addTag(memObj, 'Receptores do nicho (vias Wnt / Notch / BMP)', -1.7, 2.25, 0.4, '#8effe0', '#dbfff4', 0.21);

  // Huge Central Euchromatin-Rich Nucleus (~65% cell volume) + nuclear pores + Oct4/Sox2/Nanog hubs!
  const nucObj = build('stem_nucleus', [0, 0, 0], item => {
    const nGeo = organicDisplace(new T.SphereGeometry(1.68, 38, 24, Math.PI * 0.72, Math.PI * 1.46), 0.02, 2.8, 3);
    mesh(item, nGeo, membraneMaterial('#9882f5', { opacity: 0.56, clearcoat: 0.86 }));
    // Octameric nuclear pores on envelope surface
    const poreMat = glow('#d8c8ff', 0.45);
    for (let i = 0; i < 18; i++) {
      const phi = Math.PI * 0.78 + (i % 6) * 0.65;
      const th = 0.55 + Math.floor(i / 6) * 0.92;
      const p = v(-Math.cos(phi) * Math.sin(th) * 1.69, Math.cos(th) * 1.69, Math.sin(phi) * Math.sin(th) * 1.69);
      const tr = torus(item, poreMat, 0.068, 0.018, p.x, p.y, p.z);
      tr.quaternion.setFromUnitVectors(v(0, 0, 1), p.clone().normalize());
    }
    nucCore = group(item);
    mesh(nucCore, organicDisplace(new T.SphereGeometry(0.46, 18, 14), 0.07, 4, 2),
      proteinMaterial('#ff9ed4', { emissive: '#b53c82', emissiveIntensity: 0.48, clearcoat: 0.82 }), 0.2, 0.15, -0.1);
    const euMat = glow('#d4beff', 0.58);
    const tfMat = glow('#ffe370', 1.05);
    for (let i = 0; i < 6; i++) {
      const pts = Array.from({ length: 16 }, (_, j) => {
        const a = j * 0.58 + i * 1.05;
        return v(Math.cos(a) * (0.72 + i * 0.09), (j - 7.5) * 0.14, Math.sin(a * 1.2) * 0.75);
      });
      tube(nucCore, euMat, pts, 0.034, false, 30, 7);
      // Oct4/Sox2/Nanog active pluripotency transcription hubs sitting on euchromatin loops!
      sphere(nucCore, tfMat, 0.068, 0.068, 0.068, pts[8].x, pts[8].y, pts[8].z, 8);
    }
  }, false);
  createAnchor(nucObj, anchors, 'stem_nuc_main', 0, 0.1, 0.4);
  const tagEuch = addTag(nucObj, 'Núcleo amplo · Eucromatina aberta (Oct4 / Sox2 / Nanog)', 0, 1.9, 0.55, '#c4b0ff', '#f0ebff', 0.21);

  // Sparse undifferentiated cytoplasm with young mitochondria & free ribosomes
  const cytoObj = build('stem_cytoplasm', [0, 0, 0], item => {
    for (const [x, y, z] of [[1.95, -0.5, 0.4], [-1.9, -0.8, 0.45], [0.6, -2.0, 0.35]]) {
      miniCutMito(item, x, y, z, 0.65, 0.6);
    }
    const ribos = instances(item, new T.SphereGeometry(0.048, 8, 6), glow('#7ce8f5', 0.68), 28);
    const putR = instanceUpdater(ribos);
    for (let i = 0; i < 28; i++) {
      const a = i * 2.399, r = 1.88 + (i % 3) * 0.18;
      putR(i, Math.cos(a) * r, Math.sin(a) * r * 0.88, Math.sin(i * 1.7) * 0.6);
    }
    ribos.instanceMatrix.needsUpdate = true;
  }, false);
  createAnchor(cytoObj, anchors, 'stem_cyto_main', 1.4, -1.2, 0.5);
  const tagSparse = addTag(cytoObj, 'Citoplasma reduzido · Alta razão núcleo/citoplasma', 1.15, -2.2, 0.55, '#7ce8f5', '#dcfbff', 0.2);

  // Pluripotency Lineage Halo with ACTUAL SCULPTED 3D MINI-CELLS (Neuron, Muscle, Biconcave RBC, Stellate Osteocyte!)
  const potObj = build('stem_potency', [0, 0, 0], item => {
    torus(item, glow('#8effd8', 0.5, { transparent: true, opacity: 0.48, depthWrite: false }), 3.45, 0.025);
    const fateDefs = [
      { ang: 0.52, hex: '#a88cff', txt: '→ Neurônio (ectoderme)', kind: 'neuron' },
      { ang: -0.52, hex: '#eb6e7a', txt: '→ Fibra muscular (mesoderme)', kind: 'muscle' },
      { ang: Math.PI - 0.52, hex: '#ff5268', txt: '→ Hemácia bicôncava (sangue)', kind: 'rbc' },
      { ang: -Math.PI + 0.52, hex: '#f0c46c', txt: '→ Osteócito estrelado (osso)', kind: 'osteo' }
    ];
    for (const f of fateDefs) {
      const fx = Math.cos(f.ang) * 3.65, fy = Math.sin(f.ang) * 3.15;
      const orb = group(item, fx, fy, 0.28);
      const m = proteinMaterial(f.hex, { emissive: f.hex, emissiveIntensity: 0.36, clearcoat: 0.85 });
      if (f.kind === 'neuron') {
        sphere(orb, m, 0.24, 0.22, 0.22, -0.18, 0, 0, 12);
        cylinder(orb, m, 0.04, 0.04, 0.62, 0.22, 0, 0, 8).rotation.z = Math.PI / 2;
        for (let d = 0; d < 4; d++) rod(orb, m, v(-0.22, 0, 0), v(-0.48, (d - 1.5) * 0.22, 0.05), 0.024, 6);
      } else if (f.kind === 'muscle') {
        cylinder(orb, m, 0.18, 0.18, 0.72, 0, 0, 0, 14).rotation.z = Math.PI / 2;
        for (const sx of [-0.22, 0, 0.22]) torus(orb, glow('#ffd266', 0.7), 0.19, 0.018, sx, 0, 0).rotation.y = Math.PI / 2;
      } else if (f.kind === 'rbc') {
        torus(orb, m, 0.22, 0.11, 0, 0, 0);
        sphere(orb, m, 0.18, 0.18, 0.05, 0, 0, 0, 12);
      } else {
        sphere(orb, m, 0.22, 0.16, 0.16, 0, 0, 0, 12);
        for (let k = 0; k < 6; k++) {
          const ka = (k / 6) * tau;
          rod(orb, m, v(0, 0, 0), v(Math.cos(ka) * 0.44, Math.sin(ka) * 0.38, 0), 0.022, 6);
        }
      }
      const tag = addTag(orb, f.txt, 0, 0.56, 0.15, f.hex, '#ffffff', 0.2);
      fates.push({ orb, tag, fx, fy });
    }
    // Asymmetric self-renewal daughter stem cell emerging cleanly during stem_asymmetric!
    daughterOrb = group(item, 0, 0, 0.2);
    mesh(daughterOrb, new T.SphereGeometry(0.95, 22, 16), gelMaterial('#66e0f2', { opacity: 0.38, iridescence: 0.4 }));
    mesh(daughterOrb, new T.SphereGeometry(0.62, 18, 12), proteinMaterial('#9882f5', { emissive: '#4d38a8', emissiveIntensity: 0.35, clearcoat: 0.85 }));
    daughterOrb.visible = false;

    fateFlux = instances(item, new T.SphereGeometry(0.056, 8, 6), glow('#9effe0', 1.05), 16, true);
    putFlux = instanceUpdater(fateFlux);
  }, false);
  createAnchor(potObj, anchors, 'stem_pot_main', 0.5, 0.2, 0.4);
  const tagAsym = addTag(potObj, 'Divisão assimétrica: 1 célula-tronco + 1 progenitora', 0, 3.15, 0.45, '#8effd8', '#dcfff4', 0.21);

  updaters.push((t, _dt, _key, activeAnim) => {
    const isRec = activeAnim === 'stem_receptors';
    const isNuc = activeAnim === 'stem_nucleus';
    const isCyto = activeAnim === 'stem_cyto';
    const isDiff = activeAnim === 'stem_differentiate';
    const isAsym = activeAnim === 'stem_asymmetric';

    tagRec.visible = isRec;
    tagEuch.visible = isNuc;
    tagSparse.visible = isCyto;
    tagAsym.visible = isAsym;
    nucCore.rotation.y = t * (isNuc ? 0.9 : 0.25);

    for (let i = 0; i < fates.length; i++) {
      const f = fates[i];
      f.tag.visible = isDiff;
      const bob = Math.sin(t * 2.2 + i * 1.4) * 0.14;
      f.orb.position.set(f.fx, f.fy + bob, 0.28);
      f.orb.rotation.y = t * 0.8 + i;
      f.orb.scale.setScalar(isDiff ? 1.15 + Math.sin(t * 4 + i) * 0.08 : 0.82);
    }
    daughterOrb.visible = isAsym;
    if (isAsym) {
      const p = (t * 0.42) % 1;
      const e = smootherstep(p);
      daughterOrb.position.set(-2.95 * e, 1.55 * e, 0.3);
      daughterOrb.scale.setScalar(0.35 + e * 0.65);
    }
    fateFlux.visible = isDiff || isAsym;
    if (fateFlux.visible) {
      for (let i = 0; i < fateFlux.count; i++) {
        const f = fates[i % fates.length];
        const p = (t * 0.55 + i / fateFlux.count) % 1;
        putFlux(i, f.fx * (0.45 + p * 0.55), f.fy * (0.45 + p * 0.55), 0.28, Math.sin(p * Math.PI) * 1.15);
      }
      fateFlux.instanceMatrix.needsUpdate = true;
    }
  });
  return updaters;
}

// ============================================================================
// 4. NEURÔNIO MULTIPOLAR (TECIDO NERVOSO)
//    Soma + Corpúsculos de Nissl (pilhas RER reais!) + Espinhas dendríticas
//    Bainha de mielina concêntrica (núcleos Schwann) + Ranvier (Nav1.6) + Sinapse SNARE
// ============================================================================
function buildNeuronModel({ build, anchors }) {
  const updaters = [];
  const somaPos = [-3.3, 0.1, 0];
  const terminalX = 4.45;
  const axonPoint = x => v(x, 0.086 * Math.sin(x * 0.8) * (1 - smootherstep((x - 3.1) / 1.35)),
    0.085 * Math.sin(x * 0.9) * (1 - smootherstep((x - 3.1) / 1.35)));
  const boutons = [v(0.93, 0.84, 0.15), v(1.08, 0, 0), v(0.90, -0.84, -0.12)];
  const boutonRadius = 0.27;
  const cleftWidth = 0.09;

  // A. Soma + Euchromatic Nucleus + Sculpted Stacked Nissl Bodies (RER + ribosomes, no boxes!)
  const somaObj = build('neuron_soma', somaPos, item => {
    const sGeo = organicDisplace(new T.SphereGeometry(1.34, 48, 32, Math.PI * 0.75, Math.PI * 1.48), 0.09, 3.2, 7);
    sGeo.scale(1, 0.96, 0.90);
    const sMat = membraneMaterial('#9d86d7', { opacity: 0.47, clearcoat: 0.79 });
    sMat.userData.shell = 0.47;
    mesh(item, sGeo, sMat);
    const somaFluid = organicDisplace(new T.SphereGeometry(1.285, 38, 24), 0.09, 3.2, 7);
    somaFluid.scale(1, 0.96, 0.90);
    const somaFluidMat = gelMaterial('#775991', { opacity: 0.34, roughness: 0.36, bumpScale: 0.012 });
    somaFluidMat.userData.shell = 0.34;
    mesh(item, somaFluid, somaFluidMat);
    const nucleus = mesh(item, organicDisplace(new T.SphereGeometry(0.62, 26, 18), 0.05, 3, 11),
      gelMaterial('#ba9aed', { opacity: 0.78, roughness: 0.29 }), -0.11, 0.01, -0.14);
    nucleus.scale.set(1.05, 0.93, 0.91);
    sphere(item, proteinMaterial('#eb9dca', { emissiveIntensity: 0.18 }), 0.18, 0.15, 0.17, 0.03, 0.09, 0.08, 16);
    // Authentic stacked blue RER Nissl cisternae studded with ribosomes around nucleus!
    const nisslMat = proteinMaterial('#52b4e8', { emissive: '#1e6999', emissiveIntensity: 0.38, clearcoat: 0.82 });
    const ribMat = glow('#b8f4ff', 0.82);
    for (const [nx, ny, nz, rz] of [[-0.72, 0.48, 0.34, 0.55], [-0.58, -0.62, 0.32, -0.5], [0.62, 0.56, 0.28, -0.45], [0.58, -0.58, 0.3, 0.5]]) {
      const nb = group(item, nx, ny, nz);
      nb.rotation.z = rz;
      for (let l = -1; l <= 1; l++) {
        const y = l * 0.095;
        const cisterna = curve([v(-0.16, y + 0.01, -0.035), v(-0.06, y, 0),
          v(0.06, y + 0.013, 0.018), v(0.15, y + 0.036, -0.015)]);
        taperedTube(nb, nisslMat, cisterna, u => 0.023 + 0.027 * Math.sin(u * Math.PI), 12, 7);
        sphere(nb, ribMat, 0.022, 0.022, 0.022, -0.08 + l * 0.04, l * 0.095 + 0.048, 0.02, 6);
        sphere(nb, ribMat, 0.022, 0.022, 0.022, 0.08 - l * 0.03, l * 0.095 + 0.048, 0.02, 6);
      }
    }
  }, false);
  createAnchor(somaObj, anchors, 'neuron_soma_main', 0, 0.1, 0.35);
  const tagSoma = addTag(somaObj, 'Soma · Núcleo + Corpúsculos de Nissl (pilhas de RER)', 0, 1.58, 0.45, '#a894ff', '#f0ebff', 0.21);

  // B. Branched Dendrites studded with Mushroom-Shaped Dendritic Spines (Neuroplasticity!)
  let dendSparks = null, putDend = null;
  const dendPaths = [];
  const dendObj = build('neuron_dendrites', somaPos, item => {
    const dMat = proteinMaterial('#9880c5', { emissive: '#4b326e', emissiveIntensity: 0.19, clearcoat: 0.64, roughness: 0.31 });
    const spineMat = proteinMaterial('#b7a5de', { emissive: '#665798', emissiveIntensity: 0.15 });
    const angles = [2.04, 2.58, 3.16, -2.68, -2.10, 1.44];
    for (let i = 0; i < angles.length; i++) {
      const a = angles[i];
      const span = 2.51 + 0.34 * Math.sin(i * 2.3);
      const depth = 0.26 * Math.cos(i * 2.04);
      const p0 = v(Math.cos(a) * 0.73, Math.sin(a) * 0.73, depth * 0.7);
      const p1 = v(Math.cos(a + 0.06) * 1.43, Math.sin(a + 0.06) * 1.40, depth);
      const p2 = v(Math.cos(a - 0.07) * 2.08, Math.sin(a - 0.07) * 1.92, depth * 1.75);
      const p3 = v(Math.cos(a + 0.15 * Math.cos(i)) * (span + 0.31),
        Math.sin(a + 0.15 * Math.cos(i)) * span, depth * 2.4 + 0.08);
      const trunk = curve([p0, p1, p2, p3]);
      taperedTube(item, dMat, trunk, u =>
        0.019 + (0.21 + 0.025 * Math.cos(i)) * (1 - u) ** 1.42 * smootherstep(u / 0.21), 38, 10);
      for (const [fork, spread] of [[0.48, -0.28], [0.70, 0.24]]) {
        const root = trunk.getPointAt(fork);
        const toward = v(Math.cos(a + spread), Math.sin(a + spread), -depth * 0.8);
        const end = root.clone().addScaledVector(toward, 0.66 + 0.22 * Math.sin(i + fork * 3));
        const mid = root.clone().lerp(end, 0.54).add(v(-0.04, 0.035, spread * 0.25));
        taperedTube(item, dMat, curve([root, mid, end]), u => 0.012 + 0.063 * (1 - u) ** 1.4, 15, 7);
      }
      for (const u of [0.44, 0.57, 0.72, 0.83]) {
        const start = trunk.getPointAt(u);
        const normal = trunk.getTangentAt(u).cross(v(0, 0, 1)).normalize().multiplyScalar(i % 2 ? 1 : -1);
        const end = start.clone().addScaledVector(normal, 0.19 - u * 0.073).add(v(0, 0, 0.04));
        rod(item, spineMat, start, end, 0.014, 6);
        sphere(item, spineMat, 0.043, 0.037, 0.04, end.x, end.y, end.z, 8);
      }
      dendPaths.push(curve([p3, p2, p1, p0]));
    }
    dendSparks = instances(item, new T.SphereGeometry(0.042, 8, 6), glow('#8bdce9', 0.8), 20, true);
    putDend = instanceUpdater(dendSparks);
  }, false);
  createAnchor(dendObj, anchors, 'neuron_dend_main', -1.85, 0.75, 0.35);
  const tagDend = addTag(dendObj, 'Dendritos + Espinhas dendríticas (recepção sináptica)', -1.9, 2.25, 0.45, '#70f8ff', '#dcfbff', 0.21);

  // C. Myelinated Axon + Concentric Schwann Cell Wraps (with Schwann Nuclei!) + Nav1.6 Nodes of Ranvier!
  const nodeXs = [-1.65, -0.05, 1.55, 3.10];
  let apPulse = null, apRing = null, apRingMat = null;
  const myelinObj = build('neuron_myelin', [0, 0.1, 0], item => {
    const axMat = proteinMaterial('#729ecc', { emissive: '#315671', emissiveIntensity: 0.21, clearcoat: 0.68 });
    const axon = curve([-2.57, -2.22, -1.65, -0.60, 0.53, 1.67, 2.81, 3.68, terminalX].map(axonPoint));
    taperedTube(item, axMat, axon, u => {
      const hillock = smootherstep(u / 0.061) * (1 - smootherstep((u - 0.061) / 0.09));
      return 0.024 + 0.118 * smootherstep(u / 0.06) + 0.15 * hillock;
    }, 78, 12);
    const myeOuter = proteinMaterial('#dbbf87', { emissive: '#826031', emissiveIntensity: 0.17, clearcoat: 0.77, roughness: 0.29 });
    const myeInner = proteinMaterial('#edcf98', { emissive: '#855f2d', emissiveIntensity: 0.12, clearcoat: 0.65 });
    const schwNuc = proteinMaterial('#9e88bd', { emissive: '#544178', emissiveIntensity: 0.19 });
    for (const mx of [-0.85, 0.75, 2.35, 3.85]) {
      const center = axonPoint(mx);
      const sheath = group(item, center.x, center.y, center.z);
      const tangent = axonPoint(mx + 0.05).sub(axonPoint(mx - 0.05)).normalize();
      sheath.quaternion.setFromUnitVectors(v(1, 0, 0), tangent);
      const profile = [[0.14, -0.69], [0.20, -0.685], [0.27, -0.61], [0.34, -0.49], [0.36, -0.2],
        [0.35, 0.12], [0.37, 0.35], [0.33, 0.49], [0.27, 0.6], [0.20, 0.68], [0.14, 0.69], [0.14, -0.69]];
      const wrap = lathe(sheath, myeOuter, profile, 32);
      organicDisplace(wrap.geometry, 0.047, 5.1, mx);
      wrap.rotation.z = -Math.PI / 2;
      for (const side of [-1, 1]) {
        for (const [x, r] of [[0.64, 0.233], [0.58, 0.276], [0.51, 0.315]]) {
          torus(sheath, myeInner, r, 0.013, x * side, 0, 0).rotation.y = Math.PI / 2;
        }
      }
      const sn = sphere(sheath, schwNuc, 0.19, 0.085, 0.13, 0.12, 0.335, 0.08, 14);
      sn.rotation.z = 0.08;
    }
    const nodeMat = proteinMaterial('#83c8d4', { emissive: '#2b778c', emissiveIntensity: 0.2 });
    for (const nx of nodeXs) {
      const p = axonPoint(nx);
      for (let i = 0; i < 8; i++) {
        const a = i / 8 * tau;
        sphere(item, nodeMat, 0.045, 0.032, 0.03, nx, p.y + Math.sin(a) * 0.145,
          p.z + Math.cos(a) * 0.145, 7);
      }
    }
    apPulse = mesh(item, new T.SphereGeometry(0.13, 14, 12), glow('#fff070', 0.9), nodeXs[0], 0, 0);
    apRingMat = glow('#ffe35e', 1.15, { transparent: true, opacity: 0.85, depthWrite: false });
    apRing = torus(item, apRingMat, 0.157, 0.019, nodeXs[0], 0, 0);
    apRing.rotation.y = Math.PI / 2;
  }, false);
  createAnchor(myelinObj, anchors, 'neuron_myelin_main', 0.9, 0.05, 0.3);
  const tagMyelin = addTag(myelinObj, 'Bainha de mielina (Células de Schwann · isolante)', 0.75, 1.02, 0.45, '#f2cf80', '#fff4d4', 0.21);
  const tagRanvier = addTag(myelinObj, 'Nódulo de Ranvier (canais Nav1.6 · salto do impulso)', 1.55, -0.95, 0.45, '#fff070', '#fff7cc', 0.21);

  // D. Synaptic Axon Terminals (Ca2+ Channels + Presynaptic Mitochondrion + Curved Organic Postsynaptic Receptors!)
  let synVes = null, putSyn = null, synCa = null, putSynCa = null;
  const synObj = build('neuron_synapse', [terminalX, 0.1, 0], item => {
    const tMat = proteinMaterial('#729ecc', { emissive: '#315671', emissiveIntensity: 0.21, clearcoat: 0.68 });
    const boutonMat = gelMaterial('#829cd7', { opacity: 0.68, roughness: 0.30, emissive: '#495883', emissiveIntensity: 0.18 });
    const vesicleMat = proteinMaterial('#8dcfba', { roughness: 0.33, emissiveIntensity: 0.16 });
    for (const [i, end] of boutons.entries()) {
      const root = axonPoint(terminalX - 0.16);
      root.x -= terminalX;
      const branch = curve([root, v(0.23, end.y * 0.19, end.z * 0.38),
        v(0.58, end.y * 0.72, end.z * 0.80), end]);
      taperedTube(item, tMat, branch, u => 0.144 - 0.075 * u, 22, 9);
      const bulb = mesh(item, organicDisplace(new T.SphereGeometry(boutonRadius, 22, 16), 0.063, 5, i + 2),
        boutonMat, end.x, end.y, end.z);
      bulb.scale.set(1, 0.86, 0.93);
      miniCutMito(item, end.x - 0.08, end.y - 0.057, end.z, 0.31, 0.55);
      for (let j = 0; j < 5; j++) {
        const a = j * 2.4;
        sphere(item, vesicleMat, 0.032, 0.031, 0.031, end.x + 0.085 + Math.sin(a) * 0.057,
          end.y + Math.cos(a) * 0.096, end.z + 0.046 + Math.sin(a) * 0.038, 8);
      }
    }
    const dendriteRadius = 0.29;
    const postCenters = boutons.map(p => p.clone().add(v(boutonRadius + cleftWidth + dendriteRadius, 0, 0)));
    const post = curve([postCenters[0].clone().add(v(0.17, 0.67, -0.14)), ...postCenters,
      postCenters[2].clone().add(v(0.21, -0.66, -0.16))]);
    taperedTube(item, gelMaterial('#5ba99f', { opacity: 0.65, roughness: 0.33 }),
      post, u => {
        const cap = Math.max(0, (Math.abs(u - 0.5) - 0.43) / 0.07);
        return dendriteRadius * (0.89 + 0.11 * Math.sin(u * Math.PI)) * Math.sqrt(Math.max(0.0001, 1 - cap * cap));
      }, 48, 14);
    const recMat = proteinMaterial('#d9b971', { emissive: '#8c632d', emissiveIntensity: 0.21 });
    boutons.forEach((p, i) => {
      const wallX = postCenters[i].x - dendriteRadius;
      for (const z of [-0.046, 0.046]) {
        lathe(item, recMat, [[0.018, -0.045], [0.044, -0.026], [0.038, 0.03], [0.025, 0.043]],
          10, wallX, p.y, p.z + z).rotation.z = Math.PI / 2;
      }
    });
    synVes = instances(item, new T.SphereGeometry(0.032, 8, 6), glow('#7dffcc', 0.85), 18, true);
    putSyn = instanceUpdater(synVes);
    synCa = instances(item, new T.SphereGeometry(0.044, 8, 6), glow('#ffe36e', 1.05), 12, true);
    putSynCa = instanceUpdater(synCa);
  }, false);
  createAnchor(synObj, anchors, 'neuron_syn_main', 1.25, 0, 0.25);
  const tagSynCa = addTag(synObj, 'Influxo de Ca²⁺ → fusão vesicular SNARE', 0.95, -1.48, 0.4, '#ffe36e', '#fff4cc', 0.2);
  const tagSyn = addTag(synObj, 'Fenda sináptica · Neurotransmissores → Receptores', 1.45, 1.52, 0.4, '#7dffcc', '#dcffef', 0.2);

  const pt = v();
  updaters.push((t, _dt, _key, activeAnim) => {
    const isSoma = activeAnim === 'neuron_soma';
    const isDend = activeAnim === 'neuron_dendrites';
    const isMye = activeAnim === 'neuron_myelin_wrap';
    const isSalt = activeAnim === 'neuron_saltatory';
    const isSynCa = activeAnim === 'neuron_syn_ca';
    const isSyn = activeAnim === 'neuron_synapse';

    tagSoma.visible = isSoma;
    tagDend.visible = isDend;
    tagMyelin.visible = isSalt || isMye;
    tagRanvier.visible = isSalt;
    tagSynCa.visible = isSynCa;
    tagSyn.visible = isSyn || isSynCa;

    dendSparks.visible = isDend;
    if (isDend) {
      for (let i = 0; i < dendSparks.count; i++) {
        const p = (t * 0.72 + i / dendSparks.count) % 1;
        dendPaths[i % dendPaths.length].getPointAt(p, pt);
        putDend(i, pt.x, pt.y, pt.z, Math.sin(p * Math.PI) * 0.88);
      }
      dendSparks.instanceMatrix.needsUpdate = true;
    }

    const segCount = nodeXs.length - 1;
    const raw = (t * (isSalt ? 1.15 : 0.72)) % segCount;
    const seg = Math.floor(raw);
    const u = raw - seg;
    const lx = T.MathUtils.lerp(nodeXs[seg], nodeXs[seg + 1], smootherstep(u));
    apPulse.visible = isSalt;
    apRing.visible = isSalt;
    if (isSalt) {
      apPulse.position.copy(axonPoint(lx));
      apPulse.scale.setScalar(0.73 + Math.sin(u * Math.PI) * 0.24);
      apRing.position.copy(axonPoint(u < 0.5 ? nodeXs[seg] : nodeXs[seg + 1]));
      apRingMat.opacity = (1 - Math.sin(u * Math.PI)) * 0.92;
    }

    synVes.visible = isSyn || isSynCa;
    if (synVes.visible) {
      for (let i = 0; i < synVes.count; i++) {
        const p = (t * 0.85 + i / synVes.count) % 1;
        const b = boutons[i % boutons.length];
        const start = isSyn ? boutonRadius : 0.035;
        const end = isSyn ? boutonRadius + cleftWidth : boutonRadius - 0.025;
        putSyn(i, b.x + T.MathUtils.lerp(start, end, p), b.y + Math.sin(i * 2.3) * 0.055,
          b.z + Math.cos(i * 2.3) * 0.045, Math.sin(p * Math.PI) * (isSyn ? 0.62 : 0.92));
      }
      synVes.instanceMatrix.needsUpdate = true;
    }

    synCa.visible = isSynCa;
    if (synCa.visible) {
      for (let i = 0; i < synCa.count; i++) {
        const p = (t * 0.76 + i / synCa.count) % 1;
        const b = boutons[i % boutons.length];
        const side = i % 2 ? 1 : -1;
        putSynCa(i, b.x - 0.08 + 0.11 * p, b.y + side * (0.25 - p * 0.20),
          b.z + 0.038, Math.sin(p * Math.PI) * 0.73);
      }
      synCa.instanceMatrix.needsUpdate = true;
    }
  });
  return updaters;
}

// ============================================================================
// 5. OSTEÓCITO (TECIDO ÓSSEO / ESQUELÉTICO)
//    Lamelas colágeno I + Hidroxiapatita hexagonal + Cílio primário mecanossensor
//    Prolongamentos em canalículos + Junções comunicantes (Conexina 43 / Gap)
// ============================================================================
function buildOsteocyteModel({ build, anchors }) {
  const updaters = [];

  const lacObj = build('osteocyte_lacuna', [0, 0, 0], item => {
    const geo = organicDisplace(new T.SphereGeometry(2.68, 38, 24, Math.PI * 0.76, Math.PI * 1.46), 0.045, 3.0, 9);
    tintGeometry(geo, '#e8dec6', '#a4957a', 2.2, 4);
    const mat = membraneMaterial('#ffffff', { vertexColors: true, opacity: 0.36, clearcoat: 0.48, roughness: 0.44 });
    mat.userData.shell = 0.36;
    mesh(item, geo, mat);
    // Concentric Collagen-I Lamellae rings + faceted Hexagonal Hydroxyapatite mineral crystals!
    const lamMat = glow('#f0e2c4', 0.32, { transparent: true, opacity: 0.56, depthWrite: false });
    torus(item, lamMat, 2.38, 0.034);
    torus(item, lamMat, 1.92, 0.026);
    const haMat = proteinMaterial('#f5ebd2', { emissive: '#8f7d58', emissiveIntensity: 0.22, clearcoat: 0.85, roughness: 0.18 });
    for (let i = 0; i < 16; i++) {
      const a = Math.PI * 0.82 + (i / 15) * Math.PI * 1.34;
      const cry = cylinder(item, haMat, 0.085, 0.085, 0.24, -Math.cos(a) * 2.52, Math.sin(i * 1.9) * 1.1, Math.sin(a) * 2.52, 6);
      cry.rotation.set(i, a, 0.6);
    }
  }, false);
  createAnchor(lacObj, anchors, 'osteo_lac_main', 0, 0.3, 0.45);
  const tagMatrix = addTag(lacObj, 'Matriz óssea · Colágeno I + Hidroxiapatita (Ca₁₀(PO₄)₆(OH)₂)', 0, 2.52, 0.45, '#f0e2c4', '#fff8e8', 0.2);

  // Almond-shaped Stellate Osteocyte Cell Body + Nucleus + Primary Cilium Mechanosensor!
  let primCilium = null;
  const bodyObj = build('osteocyte_body', [0, 0, 0], item => {
    const bGeo = organicDisplace(new T.SphereGeometry(1, 28, 18), 0.06, 3.2, 5);
    const bMesh = mesh(item, bGeo, proteinMaterial('#e8b268', { emissive: '#945e1c', emissiveIntensity: 0.28, clearcoat: 0.82 }));
    bMesh.scale.set(1.22, 0.78, 0.76);
    mesh(item, new T.SphereGeometry(0.48, 16, 12), proteinMaterial('#9a84f0', { emissive: '#4d3ca6', emissiveIntensity: 0.36, clearcoat: 0.84 }), 0, 0, 0.24);
    // Primary cilium mechanosensor bending gently with pericellular fluid flow!
    primCilium = group(item, 0.28, 0.72, 0.25);
    tube(primCilium, glow('#82f8ff', 0.9), [v(0, 0, 0), v(0.08, 0.28, 0.06), v(0.22, 0.56, 0.1)], 0.032, false, 14, 7);
  }, false);
  createAnchor(bodyObj, anchors, 'osteo_body_main', 0, 0.05, 0.35);
  const tagBody = addTag(bodyObj, 'Corpo do osteócito + Cílio primário mecanossensor', 0, 1.38, 0.55, '#e8b268', '#fff0d4', 0.21);

  // 14 Radiating Cytoplasmic Processes inside Bony Canaliculi + Gap Junction (Conexina 43) Plaques!
  const procPaths = [];
  let caPulses = null, putCaP = null, gapRings = [];
  const procObj = build('osteocyte_processes', [0, 0, 0], item => {
    const pMat = proteinMaterial('#f2c87a', { emissive: '#9e6820', emissiveIntensity: 0.34, clearcoat: 0.8 });
    const canalMat = gelMaterial('#e0d5be', { opacity: 0.28, clearcoat: 0.35 });
    const gapMat = proteinMaterial('#68f0d8', { emissive: '#1e9c85', emissiveIntensity: 0.55, clearcoat: 0.9 });
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * tau;
      const elev = Math.sin(i * 2.1) * 0.52;
      const dir = v(Math.cos(a), Math.sin(a) * 0.82, elev).normalize();
      const mid = dir.clone().multiplyScalar(2.15).add(v(0, Math.cos(i) * 0.22, 0));
      const tip = dir.clone().multiplyScalar(3.55);
      const pts = [dir.clone().multiplyScalar(0.85), mid, tip];
      tube(item, pMat, pts, 0.052, false, 20, 7);
      tube(item, canalMat, pts, 0.095, false, 16, 7);
      // Hexagonal Connexin-43 Gap Junction plaque connecting to neighboring osteocyte!
      const plaque = cylinder(item, gapMat, 0.11, 0.11, 0.08, tip.x, tip.y, tip.z, 6);
      plaque.quaternion.setFromUnitVectors(v(0, 1, 0), dir);
      gapRings.push(plaque);
      procPaths.push(curve(pts));
    }
    caPulses = instances(item, new T.SphereGeometry(0.068, 8, 6), glow('#70f8ff', 1.05), 32, true);
    putCaP = instanceUpdater(caPulses);
  }, false);
  createAnchor(procObj, anchors, 'osteo_proc_main', 1.85, 0.55, 0.4);
  const tagCan = addTag(procObj, 'Canalículos · Fluxo de fluido e mecanotransdução (Ca²⁺)', 1.5, 1.65, 0.55, '#70f8ff', '#dcfbff', 0.2);
  const tagGap = addTag(procObj, 'Junções comunicantes (Conexina 43) entre osteócitos', 2.4, -0.45, 0.55, '#68f0d8', '#dcfff8', 0.2);

  const pt = v();
  updaters.push((t, _dt, _key, activeAnim) => {
    tagMatrix.visible = activeAnim === 'osteo_lacuna';
    tagBody.visible = activeAnim === 'osteo_body';
    const isProc = activeAnim === 'osteo_canaliculi';
    const isGap = activeAnim === 'osteo_gap';
    tagCan.visible = isProc;
    tagGap.visible = isGap;
    primCilium.rotation.z = Math.sin(t * 2.4) * 0.18;

    for (let i = 0; i < gapRings.length; i++) {
      gapRings[i].scale.setScalar(isGap ? 1.25 + Math.sin(t * 5 + i) * 0.18 : 1);
    }
    for (let i = 0; i < caPulses.count; i++) {
      const p = (t * (isProc || isGap ? 0.68 : 0.32) + i / caPulses.count) % 1;
      const dirP = i % 2 === 0 ? p : 1 - p;
      procPaths[i % procPaths.length].getPoint(dirP, pt);
      putCaP(i, pt.x, pt.y, pt.z, Math.sin(p * Math.PI) * 1.18);
    }
    caPulses.instanceMatrix.needsUpdate = true;
  });
  return updaters;
}

// ============================================================================
// 6. HEMÁCIA / ERITRÓCITO (TECIDO SANGUÍNEO)
//    Disco bicôncavo Evans-Fung + Rede cortical de Espectrina-Anquirina & Banda 3
//    Anucleada + Tetrâmeros de Hemoglobina (2α 2β + anel porfirina Heme Fe²⁺ + O₂)
// ============================================================================
function buildErythrocyteModel({ build, anchors }) {
  const updaters = [];

  function makeBiconcaveGeo(phiStart, phiLen, scale = 2.65) {
    const geo = new T.SphereGeometry(1, 52, 30, phiStart, phiLen);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      const r2 = Math.min(1, x * x + z * z);
      const halfThick = 0.5 * Math.sqrt(Math.max(0.0001, 1 - r2)) * (0.24 + 1.24 * r2 - 0.58 * r2 * r2);
      pos.setXYZ(i, x * scale, Math.sign(y) * halfThick * scale, z * scale);
    }
    geo.computeVertexNormals();
    return geo;
  }

  let rbcShell = null, spectrinMesh = null;
  const memObj = build('rbc_membrane', [0, 0, 0], item => {
    const shellGrp = group(item);
    shellGrp.rotation.x = 0.52;
    rbcShell = shellGrp;

    const geo = makeBiconcaveGeo(Math.PI * 0.85, Math.PI * 1.5, 2.75);
    tintGeometry(geo, '#e63e52', '#94182a', 2.4, 2);
    const mat = membraneMaterial('#ffffff', { vertexColors: true, opacity: 0.68, clearcoat: 0.94, roughness: 0.14 });
    mat.userData.shell = 0.68;
    mesh(shellGrp, geo, mat);

    // Authentic Submembrane Spectrin-Ankyrin Elastic Triangulated Lattice + Band 3 Transmembrane Anchors!
    const specGeo = makeBiconcaveGeo(Math.PI * 0.88, Math.PI * 1.44, 2.58);
    spectrinMesh = new T.LineSegments(new T.WireframeGeometry(specGeo),
      new T.LineBasicMaterial({ color: '#ffbe8a', transparent: true, opacity: 0.42 }));
    shellGrp.add(spectrinMesh);

    const band3Mat = proteinMaterial('#68e8f5', { emissive: '#1e7894', emissiveIntensity: 0.4, clearcoat: 0.9 });
    for (let i = 0; i < 10; i++) {
      const a = Math.PI * 0.95 + (i / 9) * Math.PI * 1.3;
      sphere(shellGrp, band3Mat, 0.08, 0.12, 0.08, -Math.cos(a) * 2.15, 0.66, Math.sin(a) * 2.15, 9);
    }
  }, false);
  createAnchor(memObj, anchors, 'rbc_mem_main', 0, 0.2, 0.4);
  const tagBiconc = addTag(memObj, 'Disco bicôncavo flexível (~7,5 μm · deformação capilar)', 0, 2.08, 0.5, '#ff758a', '#ffe0e5', 0.21);
  const tagSpec = addTag(memObj, 'Rede cortical de Espectrina–Anquirina + Banda 3', 0, -1.92, 0.65, '#ffbe8a', '#fff0e0', 0.21);

  const anucObj = build('rbc_anucleate', [0, 0, 0], item => {
    const ringMat = glow('#ff9ec4', 0.68, { transparent: true, opacity: 0.58, depthWrite: false });
    const ring = torus(item, ringMat, 0.72, 0.028, -0.35, 0.15, 0.35);
    ring.rotation.x = 0.52;
  }, false);
  createAnchor(anucObj, anchors, 'rbc_anuc_main', -0.35, 0.15, 0.45);
  const tagAnuc = addTag(anucObj, 'Anucleada e sem mitocôndrias (~270 mi Hb / célula)', -0.35, 0.96, 0.65, '#ff9ec4', '#ffe6f0', 0.2);

  // Sculpted Tetrameric Hemoglobin (2α + 2β subunits + Flat Porphyrin Heme Rings + Central Fe2+!)
  const hbClusters = [];
  let o2Mols = null, putO2 = null;
  const hbObj = build('rbc_hemoglobin', [0, 0, 0], item => {
    const aMat = proteinMaterial('#f06878', { emissive: '#941e32', emissiveIntensity: 0.36, clearcoat: 0.88 });
    const bMat = proteinMaterial('#e89468', { emissive: '#94451e', emissiveIntensity: 0.34, clearcoat: 0.88 });
    const porphMat = proteinMaterial('#ffbd4a', { emissive: '#b56e14', emissiveIntensity: 0.55, clearcoat: 0.9 });
    const feMat = glow('#fff078', 1.2);
    const coords = [[0.75, 0.05, 0.45], [-1.1, -0.1, 0.38], [0.15, -0.35, 0.65], [1.45, 0.22, -0.25], [-0.4, 0.42, -0.55]];
    for (const [hx, hy, hz] of coords) {
      const hb = group(item, hx, hy, hz);
      const subOffsets = [[-0.15, 0.13, 0.09], [0.15, 0.13, -0.09], [-0.13, -0.13, -0.09], [0.13, -0.13, 0.09]];
      subOffsets.forEach((o, idx) => {
        mesh(hb, organicDisplace(new T.SphereGeometry(0.16, 13, 10), 0.12, 4, idx + 1), idx < 2 ? aMat : bMat, o[0], o[1], o[2]);
        // Flat porphyrin ring + central glowing Fe2+ ion!
        const pr = torus(hb, porphMat, 0.062, 0.015, o[0] * 1.18, o[1] * 1.18, o[2] * 1.18 + 0.08);
        pr.lookAt(o[0] * 2, o[1] * 2, o[2] * 2 + 1);
        sphere(hb, feMat, 0.032, 0.032, 0.032, o[0] * 1.18, o[1] * 1.18, o[2] * 1.18 + 0.08, 8);
      });
      hbClusters.push(hb);
    }
    o2Mols = instances(item, new T.SphereGeometry(0.056, 8, 6), glow('#70f8ff', 1.1), 20, true);
    putO2 = instanceUpdater(o2Mols);
  }, false);
  createAnchor(hbObj, anchors, 'rbc_hb_main', 0.72, 0.05, 0.55);
  const tagHb = addTag(hbObj, 'Hemoglobina (2α + 2β + anel heme porfirínico Fe²⁺)', 0.65, -0.82, 0.85, '#ffd25a', '#fff4cc', 0.2);
  const tagO2Bind = addTag(hbObj, 'Ligação cooperativa de 4 O₂ (efeito Bohr)', 0.85, 0.78, 0.85, '#70f8ff', '#dcfbff', 0.2);

  updaters.push((t, _dt, _key, activeAnim) => {
    const isFlex = activeAnim === 'rbc_flex';
    const isSpec = activeAnim === 'rbc_spectrin';
    const isAnuc = activeAnim === 'rbc_anucleate';
    const isHb = activeAnim === 'rbc_hemoglobin';

    tagBiconc.visible = isFlex;
    tagSpec.visible = isSpec;
    tagAnuc.visible = isAnuc;
    tagHb.visible = isHb;
    tagO2Bind.visible = isHb;

    spectrinMesh.material.opacity = isSpec ? 0.92 : isFlex ? 0.55 : 0.25;
    const squeeze = Math.sin(t * (isFlex ? 2.4 : 1.1)) * (isFlex ? 0.14 : 0.03);
    rbcShell.scale.set(1 + squeeze, 1 - squeeze * 0.62, 1 - squeeze * 0.42);

    for (let i = 0; i < hbClusters.length; i++) {
      hbClusters[i].rotation.y = t * (isHb ? 0.8 : 0.25) + i;
      hbClusters[i].rotation.x = Math.sin(t + i) * 0.2;
    }
    for (let i = 0; i < o2Mols.count; i++) {
      const hb = hbClusters[i % hbClusters.length].position;
      const p = (t * (isHb ? 0.65 : 0.35) + i / o2Mols.count) % 1;
      const approach = Math.abs(p - 0.5) * 2;
      const a = i * 2.1 + t * 1.4;
      const r = 0.16 + approach * approach * 0.75;
      putO2(i, hb.x + Math.cos(a) * r, hb.y + Math.sin(a) * r * 0.75, hb.z + 0.12 + approach * 0.35, 0.85 + (1 - approach) * 0.45);
    }
    o2Mols.instanceMatrix.needsUpdate = true;
  });
  return updaters;
}

// ============================================================================
// 7. CÉLULA EPITELIAL INTESTINAL (ENTERÓCITO POLARIZADO)
//    Borda em escova (Actina + Trama terminal + SGLT1) · Complexo juncional completo
//    (Zônula oclusão → Zônula adesão → Desmossomos) · Polaridade + GLUT2 · Lâmina basal
// ============================================================================
function buildEpithelialModel({ build, anchors, rng }) {
  const updaters = [];
  const halfHeight = 2.225;
  const apex = 2.25;
  const junctionY = 1.2;
  const basalY = -2.42;
  const cutStart = Math.PI * 0.29;
  const cutArc = Math.PI * 1.50;
  const rounded = value => Math.sign(value) * Math.abs(value) ** 0.78;

  function wallPoint(angle, y, scale = 1) {
    const u = y / halfHeight;
    const radius = scale * (1.24 + 0.055 * u + 0.085 * (1 - u * u)
      + 0.028 * Math.sin(3 * angle + 1.5 * y) + 0.014 * Math.cos(6 * angle - 1.3 * y));
    return v(rounded(Math.sin(angle)) * radius + 0.055 * Math.sin(y * 1.1), y,
      rounded(Math.cos(angle)) * radius * 0.92);
  }

  function bodySurface(geo, scale, fixedY = null) {
    const positions = geo.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i), y = positions.getY(i), z = positions.getZ(i);
      const point = wallPoint(Math.atan2(x, z), fixedY ?? y, scale * Math.hypot(x, z));
      positions.setXYZ(i, point.x, y, point.z);
    }
    geo.computeVertexNormals();
    return geo;
  }

  // A. Dense Wavy Apical Microvilli Brush Border + Terminal Web + SGLT1 Cotransporters!
  const villi = [];
  const glycoFilaments = [];
  let nutrients = null, putNut = null;
  const microObj = build('epi_microvilli', [0, apex, 0], item => {
    const vMat = gelMaterial('#68bba3', {
      opacity: 0.75, roughness: 0.35, clearcoat: 0.44, envMapIntensity: 0.75, depthWrite: true
    });
    const actMat = proteinMaterial('#a8e8cc', { emissiveIntensity: 0.12, roughness: 0.35 });
    const sgltMat = proteinMaterial('#e8bd69', { emissive: '#93611c', emissiveIntensity: 0.23 });
    const plate = bodySurface(new T.CylinderGeometry(1, 1, 0.12, 42), 0.99, halfHeight);
    mesh(item, plate, gelMaterial('#79d5be', { opacity: 0.56 }), 0, -0.065, 0);
    for (let ix = -4; ix <= 4; ix++) {
      for (let iz = -4; iz <= 4; iz++) {
        const phase = ix * 1.47 + iz * 2.08;
        const vx = ix * 0.248 + (iz % 2) * 0.09 + 0.024 * Math.sin(phase);
        const vz = iz * 0.237 + 0.027 * Math.cos(phase * 1.2);
        if ((vx / 1.13) ** 4 + (vz / 1.04) ** 4 > 0.86) continue;
        const finger = group(item, vx, -0.045, vz);
        const length = 0.60 + 0.12 * Math.sin(phase) + 0.07 * Math.cos(ix * 0.7);
        const lean = vx * 0.052 + Math.sin(phase * 1.3) * 0.04;
        const tip = v(lean, length, vz * 0.058);
        const stalk = curve([v(0, -0.075, 0), v(lean * 0.24, length * 0.34, 0), tip]);
        taperedTube(finger, vMat, stalk, u => {
          const cap = Math.max(0, (u - 0.82) / 0.18);
          return (0.083 + 0.025 * Math.exp(-u * 11)) * Math.sqrt(Math.max(0.0001, 1 - cap * cap));
        }, 20, 9);
        tube(finger, actMat, [v(0, -0.20, 0), v(lean * 0.24, length * 0.34, 0), tip.clone().multiplyScalar(0.81)], 0.022, false, 12, 6);
        if ((ix + iz) % 3 === 0) sphere(finger, sgltMat, 0.035, 0.031, 0.032, 0.076 + lean * 0.6, length * 0.66, 0.018, 7);
        villi.push({ finger, length, lean });
        const root = finger.position.clone().add(tip);
        for (let strand = 0; strand < 4; strand++) {
          const angle = phase + strand * tau / 4;
          const dx = Math.cos(angle), dz = Math.sin(angle);
          const height = 0.10 + (1 + Math.sin(phase + strand * 1.7)) * 0.075;
          const stem = root.clone().add(v(dx * 0.026, -0.019, dz * 0.026));
          const center = root.clone().add(v(dx * 0.053, height * 0.45, dz * 0.053));
          const end = root.clone().add(v(dx * 0.067, height, dz * 0.067));
          glycoFilaments.push(new T.TubeGeometry(curve([stem, center, end]), 5, 0.008, 4));
        }
      }
    }
    nutrients = instances(item, new T.SphereGeometry(0.062, 8, 6), glow('#ffd86b', 1.05), 24, true);
    putNut = instanceUpdater(nutrients);
  }, false);
  createAnchor(microObj, anchors, 'epi_villi_main', 0, 0.55, 0.4);
  const tagVilli = addTag(microObj, 'Microvilosidades (Actina + Trama terminal + SGLT1 · ×20 área)', 0, 1.44, 0.5, '#68d8c2', '#dcfff8', 0.2);

  const glycoObj = build('epi_glycocalyx', [0, apex, 0], item => {
    mesh(item, mergeGeos(glycoFilaments), proteinMaterial('#e4c17d', {
      emissive: '#88591c', emissiveIntensity: 0.18, roughness: 0.58
    }));
  }, false);
  createAnchor(glycoObj, anchors, 'epi_glyco_main', 0, 0.79, 0.62);

  const terminalObj = build('epi_terminal', [0, apex, 0], item => {
    const actin = proteinMaterial('#b0df9d', { roughness: 0.45, emissiveIntensity: 0.13 });
    for (let i = -5; i <= 5; i++) {
      const offset = i * 0.182;
      const extent = Math.sqrt(1.17 - offset * offset);
      for (const across of [false, true]) {
        const points = Array.from({ length: 9 }, (_, j) => {
          const along = (j / 4 - 1) * extent;
          const y = -0.209 + Math.sin(j * 1.6 + i * 0.8) * 0.025 + (across ? 0.028 : 0);
          return across ? v(along, y, offset) : v(offset, y, along);
        });
        tube(item, actin, points, 0.017, false, 16, 6);
      }
    }
  }, false);
  createAnchor(terminalObj, anchors, 'epi_terminal_main', 0, -0.20, 0.75);

  // B. Complete Apical-to-Basal Junctional Complex: Tight Junction -> Adherens Belt -> Desmosomes + Keratin!
  const juncObj = build('epi_junctions', [0, junctionY, 0], item => {
    const tjMat = proteinMaterial('#e6bd68', { emissive: '#87551c', emissiveIntensity: 0.27 });
    const adhMat = proteinMaterial('#66cfa8', { emissive: '#2c7459', emissiveIntensity: 0.22 });
    const desmMat = proteinMaterial('#d985a1', { emissive: '#873d61', emissiveIntensity: 0.22 });
    const kerMat = proteinMaterial('#b799dc', { emissiveIntensity: 0.1 });
    const neighborMat = gelMaterial('#429d9a', { opacity: 0.24, roughness: 0.33 });
    const junctionPoint = (angle, y) => wallPoint(angle, y + junctionY).setY(y);

    for (const side of [-1, 1]) {
      const center = side * Math.PI / 2;
      const panel = new T.PlaneGeometry(1, halfHeight * 2, 16, 26);
      const pos = panel.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const u = pos.getX(i);
        const y = pos.getY(i) - junctionY;
        const point = junctionPoint(center + u * 1.35, y);
        pos.setXYZ(i, point.x + side * (0.115 + 0.19 * u * u), y, point.z);
      }
      panel.computeVertexNormals();
      mesh(item, panel, neighborMat);
      // Each belt and its short contacts follow the same wall as the neighboring cell fragment.
      for (const [height, mat, radius] of [[0.72, tjMat, 0.033], [0.59, tjMat, 0.022], [0.34, adhMat, 0.039]]) {
        const strand = Array.from({ length: 13 }, (_, i) =>
          junctionPoint(center + (i / 12 - 0.5) * 1.33, height + 0.018 * Math.sin(i * 0.7)));
        tube(item, mat, strand, radius, false, 26, 7);
        tube(item, mat, strand.map((p, i) => p.clone().add(v(side * (0.115 + 0.19 * (i / 12 - 0.5) ** 2), 0, 0))), radius, false, 26, 7);
        for (let i = 1; i < 12; i += 2) {
          const p = strand[i];
          rod(item, mat, p, p.clone().add(v(side * (0.115 + 0.19 * (i / 12 - 0.5) ** 2), 0, 0)), 0.019, 6);
        }
      }
      for (const y of [-0.33, -1.23, -2.2]) {
        const p = junctionPoint(center - side * 0.18, y);
        const other = p.clone().add(v(side * 0.125, 0, 0));
        sphere(item, desmMat, 0.043, 0.14, 0.14, p.x, y, p.z, 12);
        sphere(item, desmMat, 0.043, 0.14, 0.14, other.x, y, other.z, 12);
        rod(item, desmMat, p, other, 0.035, 8);
        for (const d of [-1, 1]) {
          tube(item, kerMat, [p, p.clone().add(v(-side * 0.18, d * 0.13, -0.03)),
            p.clone().add(v(-side * 0.55, d * 0.2, -0.12))], 0.018, false, 12, 6);
        }
      }
    }
  }, false);
  createAnchor(juncObj, anchors, 'epi_junc_main', 1.15, 0.25, 0.35);
  const tagTJ = addTag(juncObj, '1. Zônula de oclusão · 2. Zônula de adesão · 3. Desmossomos', 1.0, 1.06, 0.55, '#ffe37d', '#fff5cc', 0.2);

  // C. Polarized Columnar Body (Basal Oval Nucleus + Supranuclear Golgi + Cutaway Mitochondria + Basolateral GLUT2 Transcytosis!)
  let basoExport = null, putBaso = null;
  const bodyObj = build('epi_body', [0, 0, 0], item => {
    const cGeo = bodySurface(new T.CylinderGeometry(1, 1, halfHeight * 2, 48, 24, true, cutStart, cutArc), 1.0);
    const mat = membraneMaterial('#52cbbb', { opacity: 0.42, clearcoat: 0.79 });
    mat.userData.shell = 0.42;
    mesh(item, cGeo, mat);
    const cytosol = gelMaterial('#3b8e85', { opacity: 0.29, roughness: 0.37, bumpScale: 0.012 });
    cytosol.userData.shell = 0.29;
    mesh(item, bodySurface(new T.CylinderGeometry(1, 1, halfHeight * 2 - 0.08, 40, 16, true, cutStart, cutArc), 0.96), cytosol);
    mesh(item, bodySurface(new T.CylinderGeometry(1, 1, 0.045, 42), 0.99, -halfHeight), mat, 0, -halfHeight, 0);
    const rim = proteinMaterial('#6bb9ab', { roughness: 0.38 });
    for (const angle of [cutStart, cutStart + cutArc]) {
      tube(item, rim, Array.from({ length: 22 }, (_, i) => wallPoint(angle, -halfHeight + i * halfHeight * 2 / 21)),
        0.023, false, 32, 7);
    }
    const nucleus = group(item, 0, -1.08, -0.09);
    nucleus.scale.set(0.86, 1.27, 0.84);
    const envelope = membraneMaterial('#8b75d2', { opacity: 0.66, clearcoat: 0.64 });
    const chromatin = proteinMaterial('#b4a0ed', { roughness: 0.51 });
    for (const radius of [0.65, 0.69]) {
      mesh(nucleus, organicDisplace(new T.SphereGeometry(radius, 32, 22, Math.PI * 0.78, Math.PI * 1.43),
        0.025, 3.5, 2), envelope);
    }
    sphere(nucleus, gelMaterial('#6c5d9e', { opacity: 0.48 }), 0.62, 0.63, 0.53, 0, 0, -0.11, 22);
    sphere(nucleus, proteinMaterial('#d9b2ed', { roughness: 0.5 }), 0.19, 0.16, 0.16, 0.07, 0.06, 0.38, 19);
    for (let i = 0; i < 22; i++) {
      const angle = rng() * tau;
      const y = (rng() - 0.5) * 0.98;
      const reach = 0.54 * Math.sqrt(1 - (y / 0.64) ** 2);
      const size = 0.042 + rng() * 0.038;
      sphere(nucleus, chromatin, size, size * 0.7, size * 0.8,
        Math.cos(angle) * reach, y, Math.sin(angle) * reach * 0.62, 7);
    }
    const rer = proteinMaterial('#6f88c9', { roughness: 0.5 });
    const ribosome = proteinMaterial('#c6daef', { roughness: 0.53 });
    for (const side of [-1, 1]) {
      for (let i = 0; i < 4; i++) {
        const y = -0.64 - i * 0.18;
        const sheet = curve([v(side * 0.55, y + 0.18, -0.30), v(side * 0.76, y, -0.04),
          v(side * 0.80, y - 0.067, 0.32), v(side * 0.73, y - 0.13, 0.54)]);
        taperedTube(item, rer, sheet, u => 0.027 + Math.sin(u * Math.PI) * 0.028, 15, 7);
        for (let j = 1; j < 6; j++) {
          const p = sheet.getPointAt(j / 7);
          sphere(item, ribosome, 0.025, 0.024, 0.027, p.x, p.y + 0.052, p.z, 7);
        }
      }
    }
    // Supranuclear curved Golgi cisternae
    const gMat = proteinMaterial('#f0ae54', { emissive: '#9c5c1a', emissiveIntensity: 0.3, clearcoat: 0.82 });
    for (let i = 0; i < 4; i++) {
      const y = 0.25 + i * 0.13;
      const half = 0.48 - i * 0.04;
      const cisterna = curve([v(-half, y + 0.07, 0.16), v(-half * 0.58, y - 0.02, -0.055),
        v(0, y - 0.03, -0.14), v(half * 0.68, y + 0.015, -0.04), v(half, y + 0.09, 0.19)]);
      taperedTube(item, gMat, cisterna, u => 0.035 + 0.023 * Math.sin(u * Math.PI), 20, 8).scale.z = 1.3;
    }
    // Cutaway Mitochondria cleanly spaced away from basal nucleus & supranuclear Golgi!
    for (const [mx, my, mz] of [[-0.78, 1.24, 0.24], [0.78, 1.18, 0.24], [-0.84, 0.14, 0.34], [0.84, -0.22, 0.32]]) {
      miniCutMito(item, mx, my, mz, 0.60, 1.35);
    }
    const glut = proteinMaterial('#75d6a5', { emissive: '#267155', emissiveIntensity: 0.18 });
    for (const angle of [-2.2, -1.65, 1.6, 2.12]) {
      const p = wallPoint(angle, -1.55, 0.98);
      sphere(item, glut, 0.055, 0.092, 0.067, p.x, p.y, p.z, 10);
    }
    // Basolateral export stays close to the membrane transporters.
    basoExport = instances(item, new T.SphereGeometry(0.056, 8, 6), glow('#7dffbe', 1.05), 14, true);
    putBaso = instanceUpdater(basoExport);
  }, false);
  createAnchor(bodyObj, anchors, 'epi_body_main', 0, -0.35, 0.45);
  const tagPolar = addTag(bodyObj, 'Polaridade apicobasal (Golgi supranuclear · Núcleo basal)', 0, -0.15, 0.88, '#a894ff', '#f0ebff', 0.2);
  const tagTrans = addTag(bodyObj, 'Transporte de glicose · SGLT1 apical e GLUT2 basolateral', 0, -1.78, 0.92, '#7dffbe', '#dcffef', 0.2);

  // D. Woven Collagen IV / Laminin Basal Lamina + Hemidesmosomes anchoring cell base!
  const basalObj = build('epi_basal', [0, basalY, 0], item => {
    cylinder(item, material('#75618f', { roughness: 0.65 }), 1.55, 1.58, 0.115, 0, 0.046, 0, 52).scale.z = 0.83;
    const sheet = new T.CircleGeometry(1, 48);
    sheet.rotateX(-Math.PI / 2);
    const pos = sheet.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i), a = Math.atan2(z, x);
      const irregular = Math.hypot(x, z) < 0.1 ? 1 : 1 + 0.035 * Math.sin(a * 5) + 0.022 * Math.cos(a * 8);
      pos.setXYZ(i, 1.66 * x * irregular, 0.115 + 0.026 * Math.sin(x * 4 + z * 3), 1.36 * z * irregular);
    }
    sheet.computeVertexNormals();
    mesh(item, sheet, gelMaterial('#a991cb', { opacity: 0.68, roughness: 0.4 }));
    const fibMat = proteinMaterial('#c1abd7', { emissiveIntensity: 0.12, roughness: 0.43 });
    for (let i = -3; i <= 3; i++) {
      const offset = i * 0.28;
      const extent = Math.sqrt(1.24 - offset ** 2);
      tube(item, fibMat, [v(-1.4 * extent, 0.135, offset), v(-0.46, 0.15, offset + 0.07),
        v(0.48, 0.132, offset - 0.08), v(1.4 * extent, 0.14, offset)], 0.019, false, 22, 6);
      tube(item, fibMat, [v(offset, 0.143, -extent), v(offset - 0.08, 0.14, -0.36),
        v(offset + 0.08, 0.15, 0.42), v(offset, 0.14, extent)], 0.015, false, 22, 6);
    }
    const hdMat = proteinMaterial('#df8da9', { emissive: '#813555', emissiveIntensity: 0.22 });
    for (const [x, z] of [[-0.72, 0.55], [0, 0.72], [0.72, 0.55], [-0.55, -0.45], [0.55, -0.45]]) {
      sphere(item, hdMat, 0.125, 0.051, 0.11, x, 0.197, z, 10);
      rod(item, hdMat, v(x, 0.12, z), v(x, 0.218, z), 0.043, 8);
      tube(item, fibMat, [v(x, 0.2, z), v(x * 0.92, 0.34, z - 0.04),
        v(x * 0.67, 0.49, z - 0.09)], 0.018, false, 12, 6);
    }
  }, false);
  createAnchor(basalObj, anchors, 'epi_basal_main', 0, 0.1, 0.45);
  const tagBasal = addTag(basalObj, 'Lâmina basal · Laminina, colágeno IV e pontos de adesão', 0, -0.62, 0.65, '#dec4ff', '#f5ecff', 0.2);

  const supportObj = build('epi_support', [0, basalY - 0.17, 0], item => {
    const matrix = organelleMaterial('#77625e', { roughness: 0.76, clearcoat: 0.05 });
    const fibers = proteinMaterial('#c6a28c', { roughness: 0.68 });
    const pad = organicDisplace(new T.CylinderGeometry(1.62, 1.68, 0.31, 48, 5), 0.031, 4, 7);
    mesh(item, pad, matrix).scale.z = 0.82;
    for (let i = -4; i <= 4; i++) {
      const offset = i * 0.27;
      const end = Math.sqrt(2.13 - offset ** 2);
      const pts = Array.from({ length: 11 }, (_, j) => {
        const x = (j / 5 - 1) * end;
        const z = offset + 0.055 * Math.sin(j * 1.3 + i);
        return v(x, 0.158 + Math.sin(j + i) * 0.022, z * 0.84);
      });
      tube(item, fibers, pts, 0.022, false, 19, 6);
    }
  }, false);
  createAnchor(supportObj, anchors, 'epi_support_main', 0, 0.05, 0.95);

  updaters.push((t, _dt, _key, activeAnim) => {
    const isVilli = activeAnim === 'epi_microvilli';
    const isJunc = activeAnim === 'epi_junctions';
    const isPolar = activeAnim === 'epi_polarity';
    const isTrans = activeAnim === 'epi_transcytosis';
    const isBasal = activeAnim === 'epi_basal';

    tagVilli.visible = isVilli;
    tagTJ.visible = isJunc;
    tagPolar.visible = isPolar;
    tagTrans.visible = isTrans;
    tagBasal.visible = isBasal;

    nutrients.visible = isVilli || isTrans;
    if (nutrients.visible) {
      for (let i = 0; i < nutrients.count; i++) {
        const { finger, length, lean } = villi[(i * 7) % villi.length];
        const p = (t * 0.67 + i / nutrients.count) % 1;
        const side = p < 0.3 ? 0.18 * (1 - p / 0.3) : 0;
        putNut(i, finger.position.x + lean * (1 - p) + side, length * (0.87 - p * 0.94),
          finger.position.z, Math.sin(p * Math.PI) * 0.57);
      }
      nutrients.instanceMatrix.needsUpdate = true;
    }

    basoExport.visible = isTrans;
    if (basoExport.visible) {
      for (let i = 0; i < basoExport.count; i++) {
        const p = (t * 0.56 + i / basoExport.count) % 1;
        const angle = [-2.2, -1.65, 1.6, 2.12][i % 4];
        const point = wallPoint(angle, -1.55, 0.79 + p * 0.33);
        putBaso(i, point.x, point.y, point.z, Math.sin(p * Math.PI) * 0.62);
      }
      basoExport.instanceMatrix.needsUpdate = true;
    }
  });
  return updaters;
}
