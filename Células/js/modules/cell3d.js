import * as T from 'three';
import { organelles } from '../data/organelles.js?v=21';
import {
  v, group, mesh, material, glow, sphere, torus, tube, cylinder, lathe, curve, random,
  instances, instanceUpdater, membraneMaterial, gelMaterial, proteinMaterial, organelleMaterial,
  organicDisplace, tintGeometry, textures
} from '../core/geometry.js';
import { node, select, range, button, toggle, heading, card, row, showTooltip, hideTooltip } from '../core/ui.js?v=9';
import { release } from '../core/sceneManager.js?v=26';
import {
  attachMembraneMicro, attachCytoplasmMicro, attachNucleusMicro,
  attachMitoMicro, attachVacuoleMicro, attachChloroplastMicro, attachBacteriaMicro
} from './cellMicroDetails.js?v=19';
import {
  attachRERMicro, attachSERMicro, attachGolgiMicro,
  attachLysosomeMicro, attachPeroxisomeMicro, attachCentrosomeMicro,
  attachCytoskeletonMicro, attachWallMicro, attachCapsuleMicro
} from './cellOrganelleDetails.js?v=21';
import {
  buildExtraModel, EXTRA_OUTER_KEYS, EXTRA_LABEL_OFFSETS, EXTRA_CAMERAS
} from './cellModels.js?v=22';
import {
  VIRUS_SUBTYPES, VIRUS_SUMMARY, VIRUS_LABEL_OFFSETS, VIRUS_CAMERAS, buildVirusSubtype
} from './virusLibrary.js?v=19';
import {
  BACTERIA_SUBTYPES, BACTERIA_SUMMARY, BACTERIA_LABEL_OFFSETS, BACTERIA_CAMERAS, buildBacteriaSubtype
} from './bacteriaLibrary.js?v=9';

// Wide full-cell overview animations where the entire cell should stay in crisp focus (no DoF background blur)
const WIDE_ANIMS = new Set([
  'membrane_fluid', 'cyto_gel', 'wall_overview', 'capsule_overview',
  'ribo_overview', 'flag_overview', 'skel_overview'
]);

const ALL_LABEL_OFFSETS = { ...EXTRA_LABEL_OFFSETS, ...VIRUS_LABEL_OFFSETS, ...BACTERIA_LABEL_OFFSETS };
const VIRUS_KEY_TO_SUB = {
  v_hiv: 'hiv', v_hbv: 'hbv', v_ebola: 'ebola', v_adeno: 'adenovirus', v_influenza: 'influenza',
  v_lyssa: 'lyssavirus', v_phage: 'phage', v_hpv: 'hpv', v_rota: 'rotavirus', v_herpes: 'herpes'
};
const BACTERIA_KEY_TO_SUB = {
  b_cocci: 'cocci', b_diplococci: 'diplococci', b_streptococci: 'streptococci',
  b_staphylococci: 'staphylococci', b_bacilli: 'bacilli', b_streptobacilli: 'streptobacilli',
  b_vibrio: 'vibrio', b_spirilla: 'spirilla', b_spirochetes: 'spirochetes'
};

const types = {
  'Tipos fundamentais (4)': {
    animal: 'Célula animal (eucarionte)',
    plant: 'Célula vegetal (eucarionte)',
    bacteria: 'Procarionte / Bactéria',
    virus: 'Vírus (acelular · parasita obrigatório)'
  },
  'Exemplos de tecidos e formatos': {
    muscle: 'Fibra muscular esquelética (estriada)',
    stem: 'Célula-tronco (pluripotente)',
    neuron: 'Neurônio (tecido nervoso)',
    osteocyte: 'Osteócito (tecido ósseo / esquelético)',
    erythrocyte: 'Hemácia / Eritrócito (sangue)',
    epithelial: 'Célula epitelial (microvilosidades)'
  }
};
const typeLabels = Object.assign({}, ...Object.values(types));
const modelFacts = {
  animal: 'Eucarionte com núcleo, citoplasma dinâmico, membrana fluida com colesterol/glicocálix, organelas membranosas e centrossomo. Clique em qualquer estrutura para explorar em micro-zoom.',
  plant: 'Eucarionte fotossintético com parede celulósica, plasmodesmos, membrana com fitoesteróis/aquaporinas, cloroplastos e grande vacúolo central.',
  bacteria: 'Modelo procariótico flagelado e encapsulado, sem envelope nuclear, com membrana contendo hopanoides e mesossomo respiratório.',
  virus: 'Entidade ACELULAR (parasita intracelular obrigatório): não possui metabolismo próprio nem ribossomos. Compare um vírus envelopado com espículas e capsídeo ao lado de um Bacteriófago T4.',
  muscle: 'Célula muscular esquelética (miócito estriado): fibra cilíndrica longa e multinucleada com núcleos periféricos, túbulos T, retículo sarcoplasmático (Ca²⁺) e sarcômeros em contração ativa.',
  stem: 'Célula-tronco indiferenciada: formato esférico compacto com enorme núcleo de eucromatina aberta (alta razão núcleo/citoplasma), capaz de autorrenovação e diferenciação em múltiplos tecidos.',
  neuron: 'Célula nervosa altamente polarizada: dendritos receptores, soma com corpúsculos de Nissl, axônio mielinizado com condução saltatória nos nódulos de Ranvier e sinapses químicas.',
  osteocyte: 'Célula óssea madura de formato estrelado: habita uma lacuna na matriz mineralizada de hidroxiapatita e estende prolongamentos por canalículos para detectar esforço mecânico.',
  erythrocyte: 'Hemácia (eritrócito) de mamífero: disco bicôncavo flexível, ANUCLEADO e sem mitocôndrias, especializado em maximizar o espaço interno para hemoglobina (Fe²⁺) e transporte de O₂.',
  epithelial: 'Enterócito de um epitélio simples cilíndrico. Explore o glicocálix, a borda em escova, a trama terminal, as junções laterais, as organelas e a interface com o tecido conjuntivo.'
};
const CORE_TYPES = new Set(['animal', 'plant', 'bacteria']);
const CONNECTED_MODELS = new Set(['epithelial', 'neuron', 'muscle']);
const cutStart = Math.PI * .86;
const cutArc = Math.PI * 1.47;
const meridians = [cutStart, cutStart + cutArc];
const tau = 2 * Math.PI;
const OUTER_KEYS = new Set(['membrane', 'wall', 'capsule', 'cytoplasm', 'cytoskeleton', 'ribosome', ...EXTRA_OUTER_KEYS]);

function shellShape(type, p, radius = 1) {
  const squeeze = (x, n) => Math.sign(x) * Math.pow(Math.abs(x), n);
  const exponents = type === 'plant' ? [.42, .43, .42] : type === 'bacteria' ? [.69, .85, .85] : [1, 1, 1];
  const scales = type === 'plant' ? [4.14, 2.89, 2.77] : type === 'bacteria' ? [4.18, 1.99, 2.04] : [4.16, 2.9, 2.89];
  const organicAmp = type === 'animal' ? 0.032 : type === 'bacteria' ? 0.016 : 0.012;
  const ripple = 1 + organicAmp * (
    Math.sin(p.x * 3.4 + p.y * 2.5) * Math.cos(p.z * 2.9) * 0.62 +
    Math.sin(p.y * 4.8 - p.z * 3.6 + p.x * 1.9) * 0.38
  );
  return v(
    squeeze(p.x, exponents[0]) * scales[0] * radius * ripple,
    squeeze(p.y, exponents[1]) * scales[1] * radius * ripple,
    squeeze(p.z, exponents[2]) * scales[2] * radius * ripple
  );
}

function shellPoint(type, theta, phi, radius) {
  return shellShape(type, v(-Math.cos(phi) * Math.sin(theta), Math.cos(theta), Math.sin(phi) * Math.sin(theta)), radius);
}

function shell(parent, mat, type, radius, edgeColor) {
  const geo = new T.SphereGeometry(1, 56, 34, cutStart, cutArc);
  const points = geo.attributes.position;
  const point = v();
  for (let i = 0; i < points.count; i++) {
    const next = shellShape(type, point.fromBufferAttribute(points, i), radius);
    points.setXYZ(i, next.x, next.y, next.z);
  }
  geo.computeVertexNormals();
  const surface = mesh(parent, geo, mat);
  const rimMat = glow(edgeColor, 0.36, { roughness: 0.25 });
  for (const phi of meridians) {
    tube(parent, rimMat,
      Array.from({ length: 38 }, (_, i) => shellPoint(type, i * Math.PI / 37, phi, radius)),
      0.025, false, 52, 8);
  }
  return surface;
}

function bilayer(parent, type) {
  const headHex = type === 'plant' ? '#7cf7d5' : type === 'bacteria' ? '#84f5c9' : '#84f7eb';
  const headMat = proteinMaterial(headHex, {
    emissive: '#258a92', emissiveIntensity: 0.24,
    roughness: 0.14, clearcoat: 1.0, clearcoatRoughness: 0.09, iridescence: 0.28
  });
  const tailMat = material('#297d96', { roughness: 0.42, clearcoat: 0.28 });
  const protMat = proteinMaterial('#5b9cf2', { emissive: '#1e4b8c', emissiveIntensity: 0.24, clearcoat: 0.92, iridescence: 0.22 });
  const cholMat = proteinMaterial(type === 'bacteria' ? '#d4e874' : '#f7c963', { emissive: '#946218', emissiveIntensity: 0.28, clearcoat: 0.85 });

  // Lush translucent gelatinous lipid-matrix ribbon sandwiched between inner & outer polar head rims
  const coreRibbonMat = gelMaterial('#1c738f', { opacity: 0.36, iridescence: 0.42 });
  for (const phi of meridians) {
    const pts = Array.from({ length: 44 }, (_, i) => shellPoint(type, .05 + i * (Math.PI - .1) / 43, phi, .998));
    tube(parent, coreRibbonMat, pts, 0.048, false, 52, 9);
    // Wet glistening extracellular & cytosolic meniscus lines along the cut bilayer
    const outerPts = Array.from({ length: 44 }, (_, i) => shellPoint(type, .05 + i * (Math.PI - .1) / 43, phi, 1.028));
    const innerPts = Array.from({ length: 44 }, (_, i) => shellPoint(type, .05 + i * (Math.PI - .1) / 43, phi, .968));
    tube(parent, gelMaterial('#86f5f0', { opacity: 0.26 }), outerPts, 0.015, false, 48, 6);
    tube(parent, gelMaterial('#5ccce0', { opacity: 0.22 }), innerPts, 0.015, false, 48, 6);
  }

  // Sculpted hourglass transmembrane protein barrel profile (LatheGeometry — zero plain cylinders!)
  const barrelProfile = [
    [0.022, -0.115], [0.068, -0.105], [0.072, -0.068], [0.048, -0.028],
    [0.042, 0.0], [0.048, 0.028], [0.074, 0.072], [0.066, 0.108], [0.024, 0.115]
  ];
  const sterolProfile = [
    [0.008, -0.064], [0.024, -0.048], [0.016, -0.022], [0.028, 0.004],
    [0.018, 0.028], [0.026, 0.052], [0.012, 0.066]
  ];

  // Dense double-leaflet polar heads + hydrophobic tails along BOTH cutaway meridians
  const perMeridian = 58;
  const heads = instances(parent, new T.SphereGeometry(.044, 12, 9), headMat, perMeridian * 4);
  const tails = instances(parent, new T.CylinderGeometry(.009, .011, 1, 6), tailMat, perMeridian * 8);
  const head = instanceUpdater(heads);
  const dummy = new T.Object3D();
  const upVec = v(0, 1, 0);
  const barrelMatrices = [], sterolMatrices = [];
  let index = 0;

  for (const phi of meridians) {
    for (let i = 0; i < perMeridian; i++) {
      const angle = .06 + i * (Math.PI - .12) / (perMeridian - 1);
      // Sculpted rhythmic transmembrane protein barrels along the cutaway rim
      const isBarrel = i % 11 === 5 && i > 8 && i < perMeridian - 8;
      const isSterol = i % 7 === 2 && i > 6 && i < perMeridian - 6;
      if (isBarrel || isSterol) {
        const mid = shellPoint(type, angle, phi, .998);
        const out = shellPoint(type, angle, phi, 1.05).sub(mid).normalize();
        dummy.position.copy(mid);
        dummy.quaternion.setFromUnitVectors(upVec, out);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        (isBarrel ? barrelMatrices : sterolMatrices).push(dummy.matrix.clone());
      }

      for (const layer of [1.019, .977]) {
        const p = shellPoint(type, angle, phi, layer);
        const end = shellPoint(type, angle, phi, .998);
        head(index, p.x, p.y, p.z);
        for (let j = 0; j < 2; j++) {
          const tip = end.clone();
          tip.x += j ? .022 : -.016;
          dummy.position.copy(p).lerp(tip, .5);
          dummy.scale.set(1, Math.max(0.001, p.distanceTo(tip)), 1);
          dummy.quaternion.setFromUnitVectors(upVec, tip.clone().sub(p).normalize());
          dummy.updateMatrix();
          tails.setMatrixAt(index * 2 + j, dummy.matrix);
        }
        index++;
      }
    }
  }
  heads.count = index;
  tails.count = index * 2;
  heads.instanceMatrix.needsUpdate = tails.instanceMatrix.needsUpdate = true;

  const barrelGeo = new T.LatheGeometry(barrelProfile.map(([x, y]) => new T.Vector2(x, y)), 16);
  const sterolGeo = new T.LatheGeometry(sterolProfile.map(([x, y]) => new T.Vector2(x, y)), 10);
  const outerRingGeo = new T.TorusGeometry(.046, .012, 12, 48).rotateX(Math.PI / 2).translate(0, .105, 0);
  const innerRingGeo = new T.TorusGeometry(.042, .01, 12, 48).rotateX(Math.PI / 2).translate(0, -.102, 0);
  for (const [geo, mat, matrices] of [
    [barrelGeo, protMat, barrelMatrices],
    [sterolGeo, cholMat, sterolMatrices],
    [outerRingGeo, glow('#7ef8ff', 0.72), barrelMatrices],
    [innerRingGeo, glow('#62d6f5', 0.48), barrelMatrices]
  ]) {
    const batch = instances(parent, geo, mat, matrices.length);
    matrices.forEach((matrix, i) => batch.setMatrixAt(i, matrix));
    batch.instanceMatrix.needsUpdate = true;
    // Each ring previously had its own material. The barrels and sterols shared theirs.
    if (mat === protMat || mat === cholMat) batch.userData.materialUses = matrices.length;
  }

  // Type-specific membrane ultrastructure:
  // Plant -> sculpted trumpet-shaped plasmodesmata cytoplasmic bridges with central desmotubule
  if (type === 'plant') {
    const plasmoWallMat = gelMaterial('#7ef7c6', { opacity: 0.62, emissive: '#229e74', emissiveIntensity: 0.35 });
    const desmoMat = glow('#b8ffde', 0.85);
    for (const ang of [0.82, 1.56, 2.28]) {
      const p0 = shellPoint(type, ang, cutStart + 0.02, 0.99);
      const p1 = shellPoint(type, ang, cutStart + 0.02, 1.1);
      const bridge = group(parent, p0.x, p0.y, p0.z);
      const dir = p1.clone().sub(p0);
      const len = dir.length();
      bridge.quaternion.setFromUnitVectors(upVec, dir.clone().normalize());
      lathe(bridge, plasmoWallMat, [
        [0.062, 0], [0.044, len * 0.22], [0.036, len * 0.5], [0.044, len * 0.78], [0.064, len]
      ], 14);
      cylinder(bridge, desmoMat, 0.014, 0.014, len * 1.06, 0, len * 0.5, 0, 8);
    }
  }
  // Bacteria -> sculpted gelatinous inward respiratory mesosome foldings with membrane protein complexes
  if (type === 'bacteria') {
    const mesoMat = proteinMaterial('#5ce0c6', { emissive: '#1e8572', emissiveIntensity: 0.28, clearcoat: 0.9, iridescence: 0.28 });
    const mesoGel = gelMaterial('#7cf7e4', { opacity: 0.36 });
    const mp = shellPoint(type, 1.92, cutStart + 0.25, 0.94);
    const meso = group(parent, mp.x, mp.y, mp.z);
    const foldPts = [v(0, 0, 0), v(-0.18, 0.07, 0.14), v(-0.29, -0.09, 0.05), v(-0.16, -0.17, -0.07), v(0.02, -0.06, 0)];
    tube(meso, mesoMat, foldPts, 0.046, false, 28, 10);
    tube(meso, mesoGel, foldPts, 0.066, false, 24, 10);
    for (const fp of foldPts.slice(1, 4)) {
      sphere(meso, glow('#ffd67a', 0.65), 0.024, 0.024, 0.024, fp.x, fp.y + 0.04, fp.z + 0.03, 8);
    }
  }
}

function cisterna(parent, mat, y, width, depth, bend = .16, seed = 0, primaryHex = null, secondaryHex = null) {
  const shape = new T.Shape();
  shape.moveTo(-width, 0);
  shape.bezierCurveTo(-width * .94, -depth * 1.06, width * .86, -depth * .98, width, -.02);
  shape.bezierCurveTo(width * .56, depth * .76, -width * .48, depth * 1.04, -width, 0);
  const geo = new T.ExtrudeGeometry(shape, {
    depth: .062, bevelThickness: .058, bevelSize: .078, bevelSegments: 4, steps: 1, curveSegments: 16
  });
  geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), py = p.getY(i), z = p.getZ(i);
    const wave = Math.sin(x * 3.8 + seed) * 0.022 + Math.cos(z * 4.5 - seed) * 0.015;
    p.setY(i, py + bend * (x / width) ** 2 + wave);
  }
  geo.computeVertexNormals();
  if (primaryHex && secondaryHex) tintGeometry(geo, primaryHex, secondaryHex, 2.8, seed);
  return mesh(parent, geo, mat, 0, y, 0);
}

export function mitochondrion(parent, scale = 1) {
  const outerGeo = organicDisplace(new T.SphereGeometry(1, 36, 22, Math.PI, Math.PI * 1.44), 0.028, 3.2, 4);
  tintGeometry(outerGeo, '#d46c5e', '#9c433e', 2.4, 2);
  const outer = organelleMaterial('#ffffff', {
    vertexColors: true, transparent: true, opacity: .88, side: T.DoubleSide,
    roughness: 0.28, clearcoat: 0.65, bumpMap: textures.membraneBump(), bumpScale: 0.028
  });
  const body = mesh(parent, outerGeo, outer);
  body.scale.set(1.16, .5, .51);

  const rimPts = Array.from({ length: 28 }, (_, i) => {
    const t = i * Math.PI / 27;
    return v(-Math.cos(Math.PI) * Math.sin(t) * 1.16, Math.cos(t) * .5, Math.sin(Math.PI) * Math.sin(t) * .51);
  });
  const rimPts2 = Array.from({ length: 28 }, (_, i) => {
    const t = i * Math.PI / 27;
    const phi = Math.PI * 2.44;
    return v(-Math.cos(phi) * Math.sin(t) * 1.16, Math.cos(t) * .5, Math.sin(phi) * Math.sin(t) * .51);
  });
  const rimMat = glow('#f0957f', 0.26);
  tube(parent, rimMat, rimPts, 0.022, false, 28, 6);
  tube(parent, rimMat, rimPts2, 0.022, false, 28, 6);
  // Subtle concentric inner boundary membrane rim framing the intermembrane space
  const innerRimMat = glow('#f5b48a', 0.22);
  tube(parent, innerRimMat, rimPts.map(p => p.clone().multiplyScalar(0.91)), 0.015, false, 24, 6);
  tube(parent, innerRimMat, rimPts2.map(p => p.clone().multiplyScalar(0.91)), 0.015, false, 24, 6);

  const matrixMat = organelleMaterial('#6e2c2e', { roughness: 0.62, clearcoat: 0.2 });
  const interior = sphere(parent, matrixMat, 1.04, .34, .34, 0, 0, -.15, 24);

  const cristaMat = organelleMaterial('#f5a578', {
    emissive: '#a8472f', emissiveIntensity: 0.14, roughness: 0.3, clearcoat: 0.52,
    bumpMap: textures.membraneBump(), bumpScale: 0.025
  });
  const serpentine = [];
  for (let i = -3; i <= 3; i++) {
    const x = i * .26;
    const dir = i % 2 === 0 ? 1 : -1;
    serpentine.push(
      v(x - .09, -dir * .27, .12),
      v(x - .03, 0, .33),
      v(x + .05, dir * .26, .24),
      v(x + .11, dir * .29, .05)
    );
  }
  tube(parent, cristaMat, serpentine, 0.044, false, 78, 8);
  tube(parent, organelleMaterial('#dc7c5c', { roughness: 0.36 }),
    serpentine.map(p => p.clone().add(v(0, 0, -0.075))), 0.036, false, 64, 7);

  const mtDna = torus(parent, glow('#f5d08a', 0.42), 0.12, 0.016, 0.24, -0.04, 0.24);
  mtDna.rotation.set(0.5, 0.3, 0.2);
  parent.scale.setScalar(scale);
  return { body, interior, mtDna };
}

// Helper: genuine open-ended hollow microtubule / nuclear pore cylinder (double-walled LatheGeometry!)
function hollowPipe(parent, mat, outerR, innerR, len, x = 0, y = 0, z = 0, segs = 12) {
  const h = len * 0.5;
  const prof = [
    [innerR, -h], [outerR, -h], [outerR, h], [innerR, h], [innerR, -h]
  ];
  return lathe(parent, mat, prof, segs, x, y, z);
}

// Sculpted 3D Supercoiled Double-Helix Circular Plasmid (cccDNA) with base-pair rungs & oriC / ampR loci!
function makePlasmid3D(parent, R = 0.28, x = 0, y = 0, z = 0, rot = [0.62, 0.55, 0.2]) {
  const host = group(parent, x, y, z);
  host.rotation.set(rot[0], rot[1], rot[2]);

  const turns = Math.max(10, Math.round(R * 52));
  const samples = turns * 5;
  const helixR = Math.max(0.024, R * 0.115);
  const writhe = R * 0.24;

  const strandA = [];
  const strandB = [];
  const centerAt = u => v(
    Math.cos(u) * R,
    Math.sin(u) * R * 0.88,
    Math.sin(u * 2) * writhe
  );

  for (let i = 0; i < samples; i++) {
    const u = (i / samples) * tau;
    const c = centerAt(u);
    const cNext = centerAt(u + 0.01);
    const tan = cNext.clone().sub(c).normalize();
    const radOut = v(Math.cos(u), Math.sin(u), 0).normalize();
    const binorm = new T.Vector3().crossVectors(tan, radOut).normalize();
    const norm = new T.Vector3().crossVectors(binorm, tan).normalize();

    const ang = u * turns;
    const ca = Math.cos(ang) * helixR, sa = Math.sin(ang) * helixR;
    strandA.push(c.clone().addScaledVector(norm, ca).addScaledVector(binorm, sa));
    strandB.push(c.clone().addScaledVector(norm, -ca).addScaledVector(binorm, -sa));
  }

  const matA = proteinMaterial('#f7c454', { emissive: '#b57218', emissiveIntensity: 0.32, clearcoat: 0.92, roughness: 0.18 });
  const matB = proteinMaterial('#eb7d4c', { emissive: '#993a16', emissiveIntensity: 0.28, clearcoat: 0.9, roughness: 0.2 });
  tube(host, matA, strandA, Math.max(0.011, R * 0.044), true, samples, 7);
  tube(host, matB, strandB, Math.max(0.011, R * 0.044), true, samples, 7);

  // Complementary base-pair rungs bridging the twin antiparallel helical backbones
  const rungCount = Math.floor(samples / 2);
  const rungGeo = new T.CylinderGeometry(Math.max(0.0045, R * 0.018), Math.max(0.0045, R * 0.018), 1, 5);
  const rungMat = proteinMaterial('#ffffff', { emissive: '#504068', emissiveIntensity: 0.24, clearcoat: 0.72 });
  const rungs = instances(host, rungGeo, rungMat, rungCount);
  const dummy = new T.Object3D();
  const up = v(0, 1, 0);
  const bpCols = [new T.Color('#6ef2e8'), new T.Color('#ff8aa8'), new T.Color('#ffe07a'), new T.Color('#a88eff')];
  for (let i = 0; i < rungCount; i++) {
    const idx = i * 2;
    const a = strandA[idx], b = strandB[idx];
    dummy.position.copy(a).lerp(b, 0.5);
    const diff = b.clone().sub(a);
    dummy.scale.set(1, Math.max(0.005, diff.length()), 1);
    dummy.quaternion.setFromUnitVectors(up, diff.normalize());
    dummy.updateMatrix();
    rungs.setMatrixAt(i, dummy.matrix);
    rungs.setColorAt(i, bpCols[i % 4]);
  }
  rungs.instanceMatrix.needsUpdate = true;
  if (rungs.instanceColor) rungs.instanceColor.needsUpdate = true;

  // Color-coded functional genetic loci wraps along the plasmid loop (oriC cyan, ampR rose, promoter violet)
  const addLocusArc = (uStart, uEnd, hex) => {
    const pts = [];
    for (let k = 0; k <= 10; k++) {
      pts.push(centerAt(uStart + (k / 10) * (uEnd - uStart)));
    }
    tube(host, gelMaterial(hex, { opacity: 0.52, emissive: hex, emissiveIntensity: 0.65 }), pts, helixR * 1.48, false, 18, 8);
  };
  addLocusArc(0.15, 0.92, '#52f0d4'); // oriC
  addLocusArc(2.15, 3.25, '#ff6892'); // ampR / antibiotic resistance gene
  addLocusArc(4.45, 5.15, '#b88aff'); // promoter / MCS
  return host;
}

function nucleus(parent, rng) {
  const phiStart = Math.PI * 0.76;
  const phiLen = Math.PI * 1.42;
  const phiEnd = phiStart + phiLen;

  // 1. Sculpted Outer Nuclear Membrane (Carioteca externa — organic displaced, high clearcoat & warm/cool lighting)
  const outerGeo = organicDisplace(new T.SphereGeometry(1.06, 44, 28, phiStart, phiLen), 0.020, 3.2, 7);
  tintGeometry(outerGeo, '#8b7cf0', '#4f469e', 2.4, 3);
  const outer = mesh(parent, outerGeo, membraneMaterial('#ffffff', {
    vertexColors: true, opacity: 0.84, clearcoat: 0.86, roughness: 0.22, iridescence: 0.22,
    bumpMap: textures.organicBump(), bumpScale: 0.036
  }));
  outer.scale.y = 0.93;

  // 2. Concentric Inner Nuclear Membrane (Carioteca interna — framing visible perinuclear space!)
  const innerGeo = new T.SphereGeometry(0.985, 38, 24, phiStart, phiLen);
  const innerEnv = mesh(parent, innerGeo, membraneMaterial('#b7a8ff', {
    opacity: 0.44, clearcoat: 0.72, roughness: 0.26, side: T.DoubleSide
  }));
  innerEnv.scale.y = 0.93;

  // Crisp double-walled cutaway cross-section rims (Outer membrane + Perinuclear space + Inner membrane!)
  const outerRimMat = glow('#d0c4ff', 0.34);
  const innerRimMat = glow('#8ef0dc', 0.42);
  for (const phi of [phiStart, phiEnd]) {
    const oPts = Array.from({ length: 30 }, (_, i) => {
      const th = i * Math.PI / 29;
      return v(-Math.cos(phi) * Math.sin(th) * 1.06, Math.cos(th) * 1.06 * 0.93, Math.sin(phi) * Math.sin(th) * 1.06);
    });
    const iPts = oPts.map(p => p.clone().multiplyScalar(0.928));
    tube(parent, outerRimMat, oPts, 0.022, false, 34, 7);
    tube(parent, innerRimMat, iPts, 0.016, false, 34, 6);
  }

  // 3. Fibrous Nuclear Lamina mesh (Lâmina nuclear — Lamins A/B/C lining the inner nuclear membrane!)
  const lamMat = glow('#6ce8c8', 0.36, { transparent: true, opacity: 0.56 });
  for (let lat = 0; lat < 5; lat++) {
    const th = 0.48 + lat * 0.52;
    const pts = Array.from({ length: 20 }, (_, i) => {
      const phi = phiStart + 0.08 + (i / 19) * (phiLen - 0.16);
      return v(-Math.cos(phi) * Math.sin(th) * 0.955, Math.cos(th) * 0.955 * 0.93, Math.sin(phi) * Math.sin(th) * 0.955);
    });
    tube(parent, lamMat, pts, 0.011, false, 22, 5);
  }

  // 4. Translucent gelatinous Nucleoplasm interior core (gives luminous aqueous depth!)
  const plasmaGeo = new T.SphereGeometry(0.92, 26, 18, phiStart + 0.06, phiLen - 0.12);
  const plasma = mesh(parent, plasmaGeo, gelMaterial('#5c4ca8', { opacity: 0.18, iridescence: 0.25, depthWrite: false }));
  plasma.scale.y = 0.92;

  // 5. Spongy Fibrillar-Granular Nucleolus (Nucléolo — non-membranous rRNA & ribosome factory!)
  const nucleolusGrp = group(parent, -0.14, 0.06, 0.16);
  const nucCoreGeo = organicDisplace(new T.SphereGeometry(0.36, 26, 18), 0.09, 5.2, 11);
  tintGeometry(nucCoreGeo, '#e06bb8', '#7d2868', 4.2, 5);
  mesh(nucleolusGrp, nucCoreGeo, organelleMaterial('#ffffff', {
    vertexColors: true, roughness: 0.36, clearcoat: 0.45, bumpScale: 0.07
  })).scale.set(1.04, 0.92, 0.98);
  // Spongy fibrillar rDNA transcription loops wrapping the nucleolus surface (matching reference image!)
  const fibMat = glow('#ffa6e2', 0.52);
  for (let f = 0; f < 5; f++) {
    const fPts = Array.from({ length: 14 }, (_, k) => {
      const a = k * 0.55 + f * 1.25;
      const r = 0.355;
      return v(Math.cos(a) * r, Math.sin(a * 1.3 + f) * 0.24, Math.sin(a) * r);
    });
    tube(nucleolusGrp, fibMat, fPts, 0.018, false, 20, 6);
  }

  // 6. Recessed Hollow Octameric Nuclear Pore Craters (Poros nucleares perfurando a carioteca!)
  const poreRing = instances(parent, new T.TorusGeometry(0.056, 0.019, 8, 12),
    proteinMaterial('#d6c8ff', { emissive: '#6e52c9', emissiveIntensity: 0.34, clearcoat: 0.85 }), 42);
  const poreDark = instances(parent, new T.CylinderGeometry(0.036, 0.036, 0.072, 10),
    material('#120c24', { roughness: 0.9 }), 42);
  const temp = new T.Object3D();
  const zAxis = v(0, 0, 1), yAxis = v(0, 1, 0);
  for (let i = 0; i < 42; i++) {
    const phi = phiStart + 0.08 + rng() * (phiLen - 0.16);
    const theta = 0.24 + rng() * 2.62;
    const pos = v(-Math.cos(phi) * Math.sin(theta) * 1.062, Math.cos(theta) * 1.062 * 0.93, Math.sin(phi) * Math.sin(theta) * 1.062);
    const norm = pos.clone().normalize();
    temp.position.copy(pos);
    temp.quaternion.setFromUnitVectors(zAxis, norm);
    temp.scale.setScalar(1);
    temp.updateMatrix();
    poreRing.setMatrixAt(i, temp.matrix);
    temp.position.copy(pos).addScaledVector(norm, -0.022);
    temp.quaternion.setFromUnitVectors(yAxis, norm);
    temp.updateMatrix();
    poreDark.setMatrixAt(i, temp.matrix);
  }
  poreRing.instanceMatrix.needsUpdate = true;
  poreDark.instanceMatrix.needsUpdate = true;

  // 7. Outer Nuclear Membrane Ribosomes (showing continuous identity with Rough ER!)
  const outerRibos = instances(parent, new T.SphereGeometry(0.030, 8, 6),
    proteinMaterial('#74e0ff', { emissive: '#2284a8', emissiveIntensity: 0.38, clearcoat: 0.8 }), 68);
  const putOR = instanceUpdater(outerRibos);
  for (let i = 0; i < 68; i++) {
    const phi = phiStart + 0.06 + rng() * (phiLen - 0.12);
    const theta = 0.2 + rng() * 2.74;
    putOR(i, -Math.cos(phi) * Math.sin(theta) * 1.095, Math.cos(theta) * 1.095 * 0.93, Math.sin(phi) * Math.sin(theta) * 1.095);
  }
  outerRibos.instanceMatrix.needsUpdate = true;

  // 8. Peripheral Condensed Heterochromatin (dark violet clumps hugging the Nuclear Lamina)
  const heteroMat = organelleMaterial('#53328f', { emissive: '#2a1259', emissiveIntensity: 0.24, roughness: 0.45, clearcoat: 0.35 });
  for (let h = 0; h < 10; h++) {
    const phi = phiStart + 0.22 + (h / 9) * (phiLen - 0.44);
    const th = 0.72 + (h % 3) * 0.72;
    const hp = v(-Math.cos(phi) * Math.sin(th) * 0.82, Math.cos(th) * 0.82 * 0.9, Math.sin(phi) * Math.sin(th) * 0.82);
    const hg = organicDisplace(new T.SphereGeometry(0.14, 12, 10), 0.18, 4, h * 7);
    mesh(parent, hg, heteroMat, hp.x, hp.y, hp.z).scale.set(1.25, 0.82, 0.95);
  }

  // 9. Loose Active Euchromatin Loops (bright lavender chromatin fibers suspended in central nucleoplasm!)
  const euchMat = proteinMaterial('#d6b4ff', { emissive: '#7e4ee0', emissiveIntensity: 0.30, clearcoat: 0.65 });
  for (let i = 0; i < 6; i++) {
    tube(parent, euchMat, Array.from({ length: 18 }, (_, n) => {
      const a = n * 0.62 + i * 1.08;
      const rad = 0.42 + (i % 3) * 0.08 + Math.sin(n * 0.7) * 0.08;
      return v(Math.cos(a) * rad, -0.46 + n * 0.056, Math.sin(a * 1.15) * rad * 0.82);
    }), 0.020, false, 36, 7);
  }

  // 10. Sculpted Outer-Membrane Luminal Continuity Necks facing the RER (-X flank)
  const neckMat = organelleMaterial('#6898de', { roughness: 0.30, clearcoat: 0.65 });
  for (const ny of [-0.22, 0.18]) {
    const n = cylinder(parent, neckMat, 0.085, 0.105, 0.24, -1.12, ny, -0.05, 12);
    n.rotation.z = Math.PI / 2;
  }
}

function roughER(parent, rng) {
  const mat = organelleMaterial('#ffffff', {
    vertexColors: true, roughness: 0.32, clearcoat: 0.56, bumpMap: textures.membraneBump(), bumpScale: 0.042
  });
  const beads = instances(parent, new T.SphereGeometry(.048, 8, 6), glow('#9ee0fa', .24), 192);
  const put = instanceUpdater(beads);
  for (let layer = 0; layer < 6; layer++) {
    const y = (layer - 2.5) * .195;
    cisterna(parent, mat, y, .98 - layer * .034, .51, .16, layer * 1.3, '#52a7d4', '#2c6f96');
    for (let i = 0; i < 32; i++) {
      const x = (rng() - .5) * (1.72 - layer * .065);
      put(layer * 32 + i, x, y + .115 + .14 * x * x, .32 * (rng() * 2 - 1) * (1 - x * x * .65));
    }
  }
  beads.instanceMatrix.needsUpdate = true;
}

function smoothER(parent) {
  const mat = organelleMaterial('#3bb7a2', {
    roughness: 0.26, clearcoat: 0.72, bumpMap: textures.membraneBump(), bumpScale: 0.032
  });
  const nodes = [];
  for (let i = 0; i < 11; i++) {
    const seed = i * .63;
    const pts = Array.from({ length: 9 }, (_, j) =>
      v((j - 4) * .21, Math.sin(seed + j * .84) * .33 + (i - 5) * .026, Math.cos(seed + j * .72) * .34));
    tube(parent, mat, pts, .042, false, 26, 9);
    nodes.push(pts[3], pts[6]);
  }
  // Cross-anastomosing bridges connecting tubules into a genuine polygonal ER network!
  for (let i = 0; i < nodes.length - 3; i += 2) {
    tube(parent, mat, [nodes[i], nodes[i].clone().lerp(nodes[i + 3], 0.5).add(v(0, 0.06, 0.08)), nodes[i + 3]], .032, false, 12, 7);
  }
}

function golgi(parent) {
  const mat = organelleMaterial('#ffffff', {
    vertexColors: true, roughness: 0.26, clearcoat: 0.74, bumpMap: textures.membraneBump(), bumpScale: 0.036
  });
  // Cis -> Medial -> Trans subtle polarity color progression (warm gold -> copper-coral)
  const tones = [
    ['#f5c964', '#c98834'], ['#f2b959', '#c27930'], ['#efa852', '#ba6b2d'],
    ['#eb964d', '#b05d2c'], ['#e6844d', '#a6502e'], ['#df7654', '#9c4536']
  ];
  for (let i = 0; i < 6; i++) {
    const y = (i - 2.5) * .162;
    const w = .96 - i * .055;
    cisterna(parent, mat, y, w, .45, .34, i * 1.7 + 4, tones[i][0], tones[i][1]);
    const budMat = proteinMaterial(tones[i][0], { emissive: tones[i][1], emissiveIntensity: 0.18, clearcoat: 0.8 });
    sphere(parent, budMat, .092, .076, .084, w * .97, y + .34, .06, 12);
    sphere(parent, budMat, .084, .072, .078, -w * .96, y + .34, -.04, 12);
  }
}

function chloroplast(parent) {
  const wallGeo = organicDisplace(new T.SphereGeometry(1, 36, 22, 2.5, 4.85), 0.024, 3.0, 9);
  tintGeometry(wallGeo, '#55b869', '#2e7d4a', 2.4, 1);
  const wall = mesh(parent, wallGeo, membraneMaterial('#ffffff', {
    vertexColors: true, opacity: .66, clearcoat: 0.72, bumpMap: textures.organicBump(), bumpScale: 0.038
  }));
  wall.scale.set(1.08, .52, .49);
  // Crisp concentric double-envelope cutaway rims (outer + inner membrane framing intermembrane gap)
  const makeRim = (phi, scaleFac, col, rad) => {
    const pts = Array.from({ length: 24 }, (_, i) => {
      const t = i * Math.PI / 23;
      return v(-Math.cos(phi) * Math.sin(t) * 1.08 * scaleFac, Math.cos(t) * .52 * scaleFac, Math.sin(phi) * Math.sin(t) * .49 * scaleFac);
    });
    tube(parent, glow(col, 0.24), pts, rad, false, 24, 6);
  };
  makeRim(2.5, 1.0, '#85e898', 0.019);
  makeRim(2.5 + 4.85, 1.0, '#85e898', 0.019);
  makeRim(2.5, 0.92, '#5cc778', 0.013);
  makeRim(2.5 + 4.85, 0.92, '#5cc778', 0.013);

  sphere(parent, organelleMaterial('#26694a', { roughness: 0.56 }), .98, .34, .29, 0, 0, -.15);

  const discMat = organelleMaterial('#96dc6c', { roughness: 0.32, clearcoat: 0.45 });
  for (let x = -2; x <= 2; x++) {
    const count = 4 + (Math.abs(x) % 2);
    for (let i = 0; i < count; i++) {
      cylinder(parent, discMat, .155, .155, .048, x * .33, i * .078 - .18, .16, 16);
    }
  }
  const lamellaMat = organelleMaterial('#68ba5b', { roughness: 0.36 });
  for (let i = 0; i < 3; i++) {
    tube(parent, lamellaMat, [v(-.8, i * .11 - .1, .11), v(0, i * .11 - .06, .14), v(.82, i * .11 - .1, .09)], .025, false, 20, 7);
  }
}

function centriole(parent) {
  const tubA = proteinMaterial('#f5b462', { emissive: '#945218', emissiveIntensity: 0.24, clearcoat: 0.88 });
  const tubB = proteinMaterial('#e69848', { emissive: '#824014', emissiveIntensity: 0.20, clearcoat: 0.84 });
  const tubC = proteinMaterial('#d47d38', { emissive: '#6e3210', emissiveIntensity: 0.18, clearcoat: 0.82 });
  const cutRimMat = glow('#ffe498', 0.65);
  const hubMat = proteinMaterial('#ffe282', { emissive: '#b57c18', emissiveIntensity: 0.52, clearcoat: 0.92 });
  const linkMat = glow('#ffb86c', 0.45);
  const appMat = proteinMaterial('#7ce8f5', { emissive: '#22859c', emissiveIntensity: 0.42, clearcoat: 0.9 });

  // Cutaway Translucent Pericentriolar Material (PCM) halo cloud (open in front so cut centrioles shine!)
  const pcmGeo = new T.SphereGeometry(0.56, 22, 16, Math.PI * 0.78, Math.PI * 1.44);
  mesh(parent, pcmGeo, gelMaterial('#f5c478', { opacity: 0.14, iridescence: 0.34, side: T.DoubleSide }), 0, 0, 0).scale.set(1.06, 0.95, 0.9);

  for (let k = 0; k < 2; k++) {
    const isMother = k === 1;
    const base = group(parent, isMother ? 0.22 : -0.23, isMother ? 0.10 : -0.07, 0);
    if (isMother) base.rotation.z = -Math.PI / 2;
    else base.rotation.x = Math.PI / 2; // axial barrel facing camera for crisp 9×3 cutaway pinwheel!

    // Authentic HOLLOW central SAS-6 Cartwheel Hub + 9 radial spokes + stacked proximal cartwheel tiers!
    hollowPipe(base, hubMat, 0.036, 0.018, 0.26, 0, -0.12, 0, 12);
    for (const tierY of [-0.20, -0.10, 0.0]) {
      torus(base, hubMat, 0.036, 0.007, 0, tierY, 0).rotation.x = Math.PI / 2;
    }

    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * tau;
      // Longitudinal cutaway on front 3 triplets of Mother Centriole (and partial bevel cut on Daughter) so interior cartwheel & lumen are exposed!
      const isCutBlade = isMother ? (i === 1 || i === 2 || i === 3) : (i === 2 || i === 3);
      const bladeLen = isCutBlade ? 0.24 : 0.54;
      const bladeY = isCutBlade ? -0.15 : 0;

      // Radial SAS-6 spokes at proximal & mid tiers linking central hollow hub to A-tubule!
      for (const tierY of [-0.18, -0.08]) {
        const sp = cylinder(base, hubMat, 0.0075, 0.0075, 0.115, Math.cos(a) * 0.074, tierY, Math.sin(a) * 0.074, 6);
        sp.rotation.z = Math.PI / 2;
        sp.rotation.y = -a;
      }

      // A–C Linker protein strut bridging neighboring triplet blades around the inner wall
      const aNext = ((i + 1) / 9) * tau;
      if (!isCutBlade) {
        const p1 = v(Math.cos(a) * 0.145, -0.06, Math.sin(a) * 0.145);
        const p2 = v(Math.cos(aNext) * 0.178, -0.06, Math.sin(aNext) * 0.178);
        tube(base, linkMat, [p1, p2], 0.0055, false, 6, 5);
      }

      // Authentic 40°-tilted HOLLOW microtubule triplet blade (complete 13-pf A-tubule + fused B & C hollow tubules!)
      const blade = group(base, Math.cos(a) * 0.145, bladeY, Math.sin(a) * 0.145);
      blade.rotation.y = -a + 0.68;
      hollowPipe(blade, tubA, 0.021, 0.012, bladeLen, 0, 0, 0, 10);
      hollowPipe(blade, tubB, 0.019, 0.010, bladeLen, 0.028, 0, 0.010, 9);
      hollowPipe(blade, tubC, 0.018, 0.009, Math.max(0.20, bladeLen - 0.02), 0.054, -0.008, 0.020, 9);

      // Luminous transverse cut-section highlights on the cutaway face showing hollow A-B-C rings!
      if (isCutBlade) {
        const topY = bladeLen * 0.5;
        for (const [tx, tz, rad] of [[0, 0, 0.017], [0.028, 0.010, 0.015], [0.054, 0.020, 0.014]]) {
          torus(blade, cutRimMat, rad, 0.0045, tx, topY, tz).rotation.x = Math.PI / 2;
        }
      }

      // Mother centriole carries iconic distal appendages (membrane docking blades) & subdistal anchors on intact blades!
      if (isMother && !isCutBlade) {
        const distApp = group(base, Math.cos(a) * 0.22, 0.24, Math.sin(a) * 0.22);
        distApp.rotation.y = -a + 0.35;
        cylinder(distApp, appMat, 0.012, 0.024, 0.11, 0.035, 0, 0, 8).rotation.z = -Math.PI / 2;
        sphere(base, hubMat, 0.024, 0.02, 0.024, Math.cos(a) * 0.215, 0.08, Math.sin(a) * 0.215, 8);
      }
    }
  }
}

function cytoskeleton(parent, type, rng) {
  const network = group(parent);
  const filament = { transparent: true, depthWrite: false };
  const mtMat = glow('#4ecde8', .28, { ...filament, opacity: .76 });
  for (let i = 0; i < 16; i++) {
    const a = i * 2.38;
    const radius = .81 + rng() * .045;
    const theta = .48 + rng() * 2.2;
    const phi = i < 10 ? 1.03 + (i / 9) * 1.68 : a;
    const end = shellPoint(type, theta, phi, radius);
    const bend = end.clone().multiplyScalar(.64).add(v(.32, .38, .10));
    tube(network, mtMat, [v(1.02, 1.24, .63), bend, end], .040, false, 22, 6);
  }

  // Extend the cortical mesh along the exposed face of the cutaway.
  const actMat = glow('#ee7799', .30, { ...filament, opacity: .70 });
  for (let i = 0; i < 8; i++) {
    const pts = Array.from({ length: 12 }, (_, j) => {
      const phi = cutStart + .18 - (j / 11) * (tau - cutArc + .36);
      const theta = .64 + i * .263 + Math.sin(j * .92 + i * 1.3) * .084;
      return shellPoint(type, theta, phi, .86);
    });
    tube(network, actMat, pts, .023, false, 28, 6);
  }
  for (let i = 0; i < 4; i++) {
    const pts = Array.from({ length: 10 }, (_, j) => {
      const theta = .68 + j * .20;
      const phi = 1.18 + i * .43 + Math.sin(j * .75 + i) * .14;
      return shellPoint(type, theta, phi, .855);
    });
    tube(network, actMat, pts, .021, false, 24, 6);
  }

  const ifMat = glow('#b290ee', .28, { ...filament, opacity: .73 });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * tau;
    tube(network, ifMat, [
      v(-.60 + Math.cos(a) * 1.30, .25 + Math.sin(a) * 1.04, .55),
      v(-.60 + Math.cos(a + .9) * 1.78, .25 + Math.sin(a + .9) * 1.38, 1.17),
      v(Math.cos(a + 1.5) * 2.72, Math.sin(a + 1.5) * 1.75, .94)
    ], .030, false, 22, 6);
  }
  return network;
}

function createMotileFlagellum(parent) {
  const motorMat = organelleMaterial('#d99762', { roughness: 0.32, clearcoat: 0.5 });
  const ringMat = material('#93bcc8', { metalness: 0.35, roughness: 0.35 });
  const basal = group(parent, -0.05, 0, 0);
  const ms = cylinder(basal, ringMat, .19, .19, .08, -0.14, 0, 0, 18);
  ms.rotation.z = Math.PI / 2;
  const pRing = cylinder(basal, motorMat, .16, .16, .09, -0.02, 0, 0, 18);
  pRing.rotation.z = Math.PI / 2;
  const hook = cylinder(basal, motorMat, .09, .12, .22, 0.12, 0, 0, 14);
  hook.rotation.z = Math.PI / 2;

  const segs = 48;
  const radial = 8;
  const verts = (segs + 1) * radial;
  const positions = new Float32Array(verts * 3);
  const indices = [];
  for (let i = 0; i < segs; i++) {
    for (let j = 0; j < radial; j++) {
      const a = i * radial + j;
      const b = i * radial + ((j + 1) % radial);
      const c = (i + 1) * radial + ((j + 1) % radial);
      const d = (i + 1) * radial + j;
      indices.push(a, b, d, b, c, d);
    }
  }
  const geo = new T.BufferGeometry();
  geo.setAttribute('position', new T.BufferAttribute(positions, 3));
  geo.setIndex(indices);
  const filamentMat = organelleMaterial('#e8a36c', {
    emissive: '#c46f3b', emissiveIntensity: 0.16, roughness: 0.28, clearcoat: 0.65
  });
  const filament = mesh(parent, geo, filamentMat, 0.18, 0, 0);

  const center = v(), nextCenter = v(), tangent = v(), normal = v(), binormal = v(), refUp = v(0, 1, 0);
  const evalCenter = (s, t, out) => {
    const env = Math.min(1, s * 4.2) * (0.14 + 0.31 * s);
    const phase = s * 19.5 - t * 8.6;
    out.set(s * 2.95, Math.sin(phase) * env, Math.cos(phase) * env * 0.92);
    return out;
  };

  let wavePhase = 0;
  const update = (dt, boost = 1) => {
    wavePhase += dt * boost;
    basal.rotation.x = wavePhase * 6.5;
    const posAttr = geo.attributes.position;
    for (let i = 0; i <= segs; i++) {
      const s = i / segs;
      const rad = 0.044 * (1 - s * 0.36);
      evalCenter(s, wavePhase, center);
      evalCenter(Math.min(1, s + 0.01), wavePhase, nextCenter);
      tangent.copy(nextCenter).sub(center).normalize();
      normal.crossVectors(tangent, refUp);
      if (normal.lengthSq() < 0.001) normal.set(0, 0, 1);
      else normal.normalize();
      binormal.crossVectors(tangent, normal).normalize();
      for (let j = 0; j < radial; j++) {
        const a = (j / radial) * tau;
        const ca = Math.cos(a) * rad, sa = Math.sin(a) * rad;
        const idx = i * radial + j;
        posAttr.setXYZ(
          idx,
          center.x + normal.x * ca + binormal.x * sa,
          center.y + normal.y * ca + binormal.y * sa,
          center.z + normal.z * ca + binormal.z * sa
        );
      }
    }
    posAttr.needsUpdate = true;
    geo.computeVertexNormals();
  };
  update(0, 1);
  return { update, filament };
}

// Mathematically audited zero-overlap organelle coordinates inside each cell shell!
const eukaryote = {
  nucleus: [-0.45, 0.26, -0.42], rer: [-2.38, 0.24, -0.45], ser: [2.32, 0.42, -0.58], golgi: [0.92, -0.98, 1.36],
  mitochondria: [-1.62, -1.32, 0.92], lysosome: [2.78, -0.48, 0.94], peroxisome: [-3.06, -0.62, 0.58],
  centrosome: [1.18, 1.54, 0.56], cytoskeleton: [0, 0, 0]
};
const vegetal = {
  nucleus: [-2.58, -0.32, 0.32], rer: [-2.62, 1.24, 0.16], ser: [2.78, 0.92, -0.46], golgi: [2.36, -0.46, 1.24],
  mitochondria: [-2.24, -1.78, 1.10], peroxisome: [2.98, -1.58, 0.66], cytoskeleton: [0, 0, 0],
  vacuole: [0.12, -0.10, -0.68], chloroplast: [1.16, 1.88, 0.72]
};
const prokaryote = { nucleoid: [-0.92, 0.02, 0.04], plasmid: [2.08, 0.18, 0.52], ribosome: [0, 0, 0], flagellum: [3.98, 0.02, 0] };

export function cell3d({ scene, lights, engine, label, overlay, signal, toolbar, guide, viewport, tooltip, audio, labelsVisible, setLabelsVisible, onLabelsChange, runWithLoader }) {
  lights.rim.color.set('#5ee7f5');
  lights.rim.intensity = 2.05;
  lights.key.shadow.mapSize.set(2048, 2048);
  lights.key.shadow.radius = 2.6;
  lights.key.shadow.bias = -0.00035;
  lights.key.shadow.normalBias = 0.022;
  const warmBounce = new T.PointLight('#ffdfba', 0.95, 22, 1.6);
  warmBounce.position.set(5.2, -3.4, 5.8);
  warmBounce.layers.enable(2);
  scene.add(warmBounce);
  scene.fog.density = 0.01;

  const stand = group(scene, 0, -3.28, 0);
  const standMat = material('#2e5263', { opacity: .34, transparent: true, depthWrite: false, roughness: 0.6 });
  for (const r of [3.0, 4.3, 5.45]) torus(stand, standMat, r, .009).rotation.x = Math.PI / 2;

  // 3D Target Beacon Ring & Active Step Callout Pin (follows exact micro-anchor in 3D!)
  const beacon = group(scene);
  const beaconOuter = torus(beacon, glow('#ffbe55', 1.1, { transparent: true, opacity: 0.85, depthWrite: false }), 0.28, 0.016);
  const beaconInner = torus(beacon, glow('#64e8f5', 0.9, { transparent: true, opacity: 0.72, depthWrite: false }), 0.18, 0.012);
  beacon.visible = false;
  const stepPin = label('', beacon, v(0, 0.32, 0));
  stepPin.item.classList.add('step-pin');
  stepPin.enabled = false;

  // Compact Floating Step-Tour HUD Bar (tucked cleanly above bottom toolbar when exploring an organelle)
  const hudTag = node('span', { className: 'step-hud-tag' });
  const hudTitle = node('span', { className: 'step-hud-title' });
  const hudPrev = button('← Anterior', () => changeStep(stepIndex - 1), { className: 'quiet' });
  const hudNext = button('Próximo →', () => changeStep(stepIndex + 1), { className: 'primary' });
  const hudClose = button('Visão geral', () => resetCamera(), { className: 'quiet' });
  const stepHud = node('div', { className: 'step-hud', hidden: true },
    node('div', { className: 'step-hud-info' }, hudTag, hudTitle),
    hudPrev, hudNext, hudClose
  );
  const bottomDock = toolbar.parentElement;
  bottomDock.insertBefore(stepHud, toolbar);
  signal.addEventListener('abort', () => stepHud.remove(), { once: true });

  const model = group(scene);
  const labels = new Map();
  const structures = new Map();
  const materialGroups = [];
  const anchors = new Map();
  const focusGroups = new Map();
  const focusScratch = [];
  const microUpdaters = [];
  const motions = [];
  const scratch = v();
  const ray = new T.Raycaster();
  const pointer = new T.Vector2();
  const pickables = [], intersections = [];
  const canvas = engine.renderer.domElement;
  const details = node('div');
  const shortcuts = node('div', { className: 'structure-list' });
  const summary = node('p');

  let type = 'animal';
  let virusSubtype = 'gallery';
  let bacteriaSubtype = 'complete';
  let selected = 'nucleus';
  let stepIndex = 0;
  let tourActive = false;
  let focusMode = false;
  let hovered = null;
  let pendingHover = null;
  let rerObj = null, golgiObj = null, flagellumCtrl = null, mainMito = null;
  let secVesicles = null, erVesicles = null, fusionRings = null, cytoFlowMesh = null;
  let putSec = null, putEr = null, putRing = null;
  let guideLines = null, guidePositions = null;
  let secondMito = null, secondChlor = null;
  let updateCytoskeleton = null;
  let exploded = 0, xray = false, paused = false, time = 0;
  let animateMuscle = true;

  const getSteps = (key = selected) => {
    const data = organelles[key];
    if (!data) return [];
    if (type === 'bacteria' && data.bacteriaSteps?.length) return data.bacteriaSteps;
    if (type === 'plant' && data.plantSteps?.length) return data.plantSteps;
    return data.steps || [];
  };

  function syncOrganelleLabels() {
    const visible = labelsVisible ? labelsVisible() : true;
    const hasSteps = Boolean(getSteps(selected).length);
    for (const [key, entry] of labels) {
      if (!visible) {
        entry.enabled = false;
      } else if (tourActive) {
        // When an organelle is clicked/explored, hide ALL other organelles' labels!
        // Keep only this organelle's step pin + its 3D micro-tags (or its name if it has no steps).
        entry.enabled = key === selected && !hasSteps;
      } else {
        entry.enabled = true;
      }
    }
  }

  const activeStepData = () => {
    const steps = getSteps(selected);
    if (!steps.length) return null;
    return steps[Math.max(0, Math.min(steps.length - 1, stepIndex))];
  };

  function focusCurrentStep(instant = false) {
    const st = activeStepData();
    if (!st) return;
    const anchorObj = anchors.get(st.anchor) || structures.get(selected);
    if (!anchorObj) return;
    anchorObj.getWorldPosition(scratch);
    const [dx, dy, dz] = st.cam || [1.2, 0.9, 3.6];
    engine.view([scratch.x + dx, scratch.y + dy, scratch.z + dz], [scratch.x, scratch.y, scratch.z], instant);
  }

  function renderDetails() {
    const data = organelles[selected];
    const steps = getSteps(selected);
    const st = activeStepData();

    const tourNodes = [];
    if (steps.length) {
      const dots = node('div', { className: 'tour-dots' }, ...steps.map((s, idx) =>
        node('button', {
          type: 'button',
          className: 'tour-dot' + (idx === stepIndex ? ' active' : idx < stepIndex ? ' done' : ''),
          title: `Etapa ${idx + 1}: ${s.title}`,
          'aria-label': `Ir para etapa ${idx + 1}: ${s.title}`,
          onClick: () => { tourActive = true; changeStep(idx); }
        })
      ));
      const isLast = stepIndex >= steps.length - 1;
      const nextBtn = button(
        !tourActive ? 'Explorar em zoom →' : isLast ? '↺ Rever etapa 1' : 'Próximo →',
        () => {
          if (!tourActive) {
            tourActive = true;
            changeStep(0);
          } else {
            changeStep(isLast ? 0 : stepIndex + 1);
          }
        },
        { className: 'primary' }
      );
      const prevBtn = button('← Anterior', () => {
        tourActive = true;
        changeStep(stepIndex - 1);
      }, { disabled: !tourActive || stepIndex <= 0 });

      const navBtns = steps.length > 1 ? [prevBtn, nextBtn] : [nextBtn];
      if (type === 'virus' && virusSubtype === 'gallery' && VIRUS_KEY_TO_SUB[selected]) {
        navBtns.push(button('Ver modelo em destaque →', () => {
          virusSubtype = VIRUS_KEY_TO_SUB[selected];
          virusSelect.input.value = virusSubtype;
          audio.play('click');
          rebuildModel();
        }, { className: 'primary' }));
      } else if (type === 'virus' && virusSubtype !== 'gallery' && virusSubtype !== 'comparison') {
        navBtns.push(button('← Voltar à galeria (10 vírus)', () => {
          virusSubtype = 'gallery';
          virusSelect.input.value = 'gallery';
          audio.play('click');
          rebuildModel();
        }));
      } else if (type === 'bacteria' && bacteriaSubtype === 'gallery' && BACTERIA_KEY_TO_SUB[selected]) {
        navBtns.push(button('Ver formato isolado →', () => {
          bacteriaSubtype = BACTERIA_KEY_TO_SUB[selected];
          bacteriaSelect.input.value = bacteriaSubtype;
          audio.play('click');
          rebuildModel();
        }, { className: 'primary' }));
      } else if (type === 'bacteria' && bacteriaSubtype !== 'gallery' && bacteriaSubtype !== 'complete') {
        navBtns.push(button('← Voltar à galeria (9 formatos)', () => {
          bacteriaSubtype = 'gallery';
          bacteriaSelect.input.value = 'gallery';
          audio.play('click');
          rebuildModel();
        }));
      }

      tourNodes.push(
        node('section', { className: 'tour-card' },
          node('div', { className: 'tour-head' },
            node('span', { className: 'tour-count' }, `ETAPA ${stepIndex + 1} DE ${steps.length}`),
            node('span', { className: 'tour-badge' }, st.badge)
          ),
          dots,
          node('h4', { className: 'tour-title' }, st.title),
          node('p', { className: 'tour-text' }, st.text),
          node('div', { className: 'tour-nav' }, ...navBtns)
        )
      );

      // Sync floating 3D Step HUD Bar
      stepHud.hidden = !tourActive;
      if (tourActive) {
        hudTag.textContent = `${data.name} · ${stepIndex + 1}/${steps.length}`;
        hudTitle.textContent = st.title;
        hudPrev.disabled = stepIndex <= 0;
        hudNext.textContent = isLast ? '↺ Etapa 1' : 'Próximo →';
      }
    } else {
      stepHud.hidden = true;
    }

    details.replaceChildren(
      node('p', { className: 'pill' }, tourActive ? 'EXPLORAÇÃO EM ETAPAS' : 'ESTRUTURA SELECIONADA'),
      heading(data.name),
      ...tourNodes,
      card('Estrutura', data.structure),
      card('Função principal', data.role),
      card('Processos metabólicos', data.metabolism),
      card('Relação clínica ou curiosidade', data.application)
    );
  }

  function changeStep(nextIdx) {
    const steps = getSteps(selected);
    if (!steps.length) return;
    stepIndex = ((nextIdx % steps.length) + steps.length) % steps.length;
    tourActive = true;
    focusMode = !OUTER_KEYS.has(selected);
    focusToggle.setAttribute('aria-pressed', String(focusMode));
    audio.play('click');
    syncOrganelleLabels();
    renderDetails();
    focusCurrentStep(false);
  }

  const resetCamera = (instant = false) => {
    tourActive = false;
    focusMode = false;
    focusToggle.setAttribute('aria-pressed', 'false');
    stepHud.hidden = true;
    beacon.visible = false;
    stepPin.enabled = false;
    syncOrganelleLabels();
    renderDetails();
    if (type === 'virus' && virusSubtype !== 'comparison' && VIRUS_CAMERAS[virusSubtype]) {
      const cam = VIRUS_CAMERAS[virusSubtype];
      engine.view(cam.eye, cam.target, instant);
    } else if (type === 'bacteria' && bacteriaSubtype !== 'complete' && BACTERIA_CAMERAS[bacteriaSubtype]) {
      const cam = BACTERIA_CAMERAS[bacteriaSubtype];
      engine.view(cam.eye, cam.target, instant);
    } else if (EXTRA_CAMERAS[type]) {
      const extraCam = EXTRA_CAMERAS[type];
      engine.view(extraCam.eye, extraCam.target, instant);
    } else {
      engine.view(
        type === 'bacteria' ? [4.4, 3.6, 17.6] : [2.3, 3.3, 15.8],
        type === 'bacteria' ? [.55, 0, 0] : [0, 0, 0],
        instant
      );
    }
  };

  function pick(key, focus = true) {
    if (!structures.has(key)) return;
    selected = key;
    stepIndex = 0;
    for (const item of shortcuts.children) item.setAttribute('aria-pressed', String(item.dataset.key === key));
    if (focus) {
      tourActive = true;
      focusMode = !OUTER_KEYS.has(key);
      focusToggle.setAttribute('aria-pressed', String(focusMode));
      audio.play('click');
      syncOrganelleLabels();
      renderDetails();
      focusCurrentStep(false);
    } else {
      tourActive = false;
      syncOrganelleLabels();
      renderDetails();
    }
  }

  const highlightColor = new T.Color();
  const tmpDimCol = new T.Color();

  function updateMaterials(dt, activeAnim) {
    const decay = -dt * 9.5;
    const baseBlend = 1 - Math.exp(decay);
    const emphasizeInterior = (focusMode && !OUTER_KEYS.has(selected)) || activeAnim === 'skel_overview';

    for (const { key, materials, isOuter } of materialGroups) {
      const isHovered = key === hovered;
      const highlight = isHovered || (key === selected && !isOuter);
      const minEmissive = isHovered ? 0.34 : highlight ? 0.14 : 0;
      const dimmed = emphasizeInterior && !highlight && !isOuter;
      // Extra transparency on lysosome/peroxisome outer shell during interior zoom steps!
      const peekInside = tourActive && (
        (key === 'lysosome' && ['lyso_enzymes', 'lyso_fusion', 'lyso_digest'].includes(activeAnim)) ||
        (key === 'peroxisome' && ['perox_betaox', 'perox_crystal', 'perox_bubbles'].includes(activeAnim))
      );
      if (highlight) highlightColor.set(organelles[key]?.color || '#6ce8f3');

      for (const { mat, uses } of materials) {
        // Preserve the per-mesh interpolation rate when a shared material is batched.
        const blend = uses === undefined ? baseBlend : 1 - Math.exp(decay * uses);
        if (mat.userData.baseEmissiveIntensity === undefined) {
          mat.userData.baseEmissiveIntensity = mat.emissiveIntensity;
          mat.userData.baseEmissive = mat.emissive.clone();
          mat.userData.baseOpacity = mat.opacity;
          mat.userData.baseTransparent = mat.transparent;
          mat.userData.baseColor = mat.color.clone();
        }
        const targetEmissive = highlight ? Math.max(mat.userData.baseEmissiveIntensity, minEmissive) : mat.userData.baseEmissiveIntensity;
        mat.emissiveIntensity += (targetEmissive - mat.emissiveIntensity) * blend;
        const targetColor = !highlight ? mat.userData.baseEmissive : mat.vertexColors ? highlightColor : mat.userData.baseColor;
        mat.emissive.lerp(targetColor, blend);

        if (mat.userData.shell) {
          const targetOp = xray ? 0.055 : (emphasizeInterior ? mat.userData.shell * 0.52 : mat.userData.shell);
          mat.opacity += (targetOp - mat.opacity) * blend;
        } else if (mat.userData.peekShell) {
          const targetOp = peekInside ? 0.22 : (dimmed ? 0.28 : mat.userData.baseOpacity);
          mat.opacity += (targetOp - mat.opacity) * blend;
        } else if (!isOuter) {
          const targetOp = dimmed ? Math.min(mat.userData.baseOpacity, 0.3) : mat.userData.baseOpacity;
          if (dimmed && !mat.transparent) {
            mat.transparent = true;
            mat.needsUpdate = true;
          }
          mat.opacity += (targetOp - mat.opacity) * blend;
          if (!dimmed && !mat.userData.baseTransparent && mat.opacity > 0.985) {
            mat.opacity = 1;
            if (mat.transparent) {
              mat.transparent = false;
              mat.needsUpdate = true;
            }
          }
          tmpDimCol.copy(mat.userData.baseColor);
          if (dimmed) tmpDimCol.multiplyScalar(0.56);
          mat.color.lerp(tmpDimCol, blend);
        }
      }
    }
  }

  function rebuildModel() {
    const name = typeLabels[type] || 'modelo celular';
    runWithLoader(name, 'Preparando o modelo e seus componentes 3D…', loadModel);
  }

  function loadModel() {
    engine.clearFocusFilter(true);
    release(model);
    structures.clear();
    materialGroups.length = 0;
    anchors.clear();
    focusGroups.clear();
    microUpdaters.length = 0;
    for (const entry of labels.values()) entry.remove();
    labels.clear();
    motions.length = 0;
    pendingHover = null;
    hovered = flagellumCtrl = secVesicles = erVesicles = fusionRings = cytoFlowMesh = mainMito = null;
    putSec = putEr = putRing = null;
    secondMito = secondChlor = rerObj = golgiObj = guideLines = guidePositions = null;
    updateCytoskeleton = null;
    tourActive = false;
    focusMode = false;
    stepIndex = 0;
    focusToggle.setAttribute('aria-pressed', 'false');
    stepHud.hidden = true;
    beacon.visible = false;
    stepPin.enabled = false;
    hideTooltip(tooltip, viewport);

    const rng = random(type === 'bacteria' ? 97 : 54);
    const build = (key, position, make, floating = true) => {
      const object = group(model, ...position);
      object.userData.key = key;
      structures.set(key, object);
      if (floating) motions.push({ object, origin: v(...position), phase: rng() * tau, baseScale: 1 });
      make(object);
      const offset = ALL_LABEL_OFFSETS[key] || (key === 'membrane' ? v(0, 2.86, 0) : key === 'wall' ? v(2.77, 2.58, -.68) :
        key === 'capsule' ? v(-2.55, 1.43, -.2) : key === 'cytoplasm' ? v(0.85, 0.8, 1.45) :
        key === 'cytoskeleton' ? v(-.32, -1.52, 2.02) : v(0, .46, .24));
      const entry = label(organelles[key].name, object, offset);
      entry.enabled = labelsVisible ? labelsVisible() : true;
      if (key === 'cytoskeleton') {
        const item = entry.item;
        item.tabIndex = 0;
        item.setAttribute('role', 'button');
        item.style.pointerEvents = 'auto';
        item.style.cursor = 'pointer';
        item.addEventListener('click', () => pick(key));
        item.addEventListener('keydown', event => {
          if (event.key !== 'Enter' && event.key !== ' ') return;
          event.preventDefault();
          pick(key);
        });
      }
      labels.set(key, entry);
      return object;
    };

    const isVirusGallery = type === 'virus' && virusSubtype === 'gallery';
    const isBactGallery = type === 'bacteria' && bacteriaSubtype === 'gallery';
    const connected = CONNECTED_MODELS.has(type);
    stand.visible = !connected && !(isVirusGallery || isBactGallery);
    explodedControl.element.hidden = connected;
    muscleControls.hidden = type !== 'muscle';
    virusSelect.element.hidden = type !== 'virus';
    bacteriaSelect.element.hidden = type !== 'bacteria';

    const useCoreCutaway = CORE_TYPES.has(type) && !(type === 'bacteria' && bacteriaSubtype !== 'complete');

    if (type === 'virus' && virusSubtype !== 'comparison') {
      microUpdaters.push(...buildVirusSubtype(virusSubtype, { build, anchors }));
    } else if (type === 'bacteria' && bacteriaSubtype !== 'complete') {
      microUpdaters.push(...buildBacteriaSubtype(bacteriaSubtype, { build, anchors }));
    } else if (!useCoreCutaway) {
      microUpdaters.push(...buildExtraModel(type, { build, anchors, rng }));
    } else {
      // 1. Plasma Membrane (+ wet gelatinous cortical layer, sculpted Fluid Bilayer, Sterols, Aquaporin & Exocytosis SNARE)
      const memObj = build('membrane', [0, 0, 0], item => {
        const mat = membraneMaterial('#42b8c7', { opacity: .26, clearcoat: 1.0, iridescence: 0.36, bumpScale: 0.032 });
        mat.userData.shell = .26;
        shell(item, mat, type, 1, '#58ebf2');
        // Subtle inner translucent gelatinous cortical fluid film just beneath the lipid leaflet
        const gelCoat = gelMaterial('#208fa3', { opacity: .13, iridescence: 0.42 });
        gelCoat.userData.shell = .13;
        shell(item, gelCoat, type, .974, '#36b5c4');
        bilayer(item, type);
      }, false);
      microUpdaters.push(...attachMembraneMicro(memObj, type, shellPoint, cutStart, cutArc, anchors, focusGroups));

      // 2. Explicit Cytoplasm & Cytosol (+ aqueous gel, streaming macromolecules & free cytosolic polyribosomes)
      const cytoObj = build('cytoplasm', [0, 0, 0], () => {}, false);
      const cytoRes = attachCytoplasmMicro(cytoObj, type, rng, anchors);
      cytoFlowMesh = cytoRes.cytoFlow;
      microUpdaters.push(...cytoRes.updaters);

      // 3. Cell Wall (Plant & Bacteria) + Cellulose/Peptidoglycan lattice & channels
      if (type !== 'animal') {
        const wallObj = build('wall', [0, 0, 0], item => {
          const mat = membraneMaterial(type === 'plant' ? '#6db56e' : '#c7a26b', {
            opacity: .36, clearcoat: 0.65, bumpScale: type === 'plant' ? 0.065 : 0.036
          });
          mat.userData.shell = .36;
          shell(item, mat, type, 1.068, type === 'plant' ? '#6db56e' : '#c7a26b');
        }, false);
        microUpdaters.push(...attachWallMicro(wallObj, type, shellPoint, cutStart, cutArc, anchors));
      }

      if (type === 'bacteria') {
      const capObj = build('capsule', [0, 0, 0], item => {
        const mat = gelMaterial('#5db8d6', { opacity: .18, clearcoat: 0.92, iridescence: 0.42 });
        mat.userData.shell = .18;
        shell(item, mat, type, 1.145, '#68e4f5');
      }, false);
      microUpdaters.push(...attachCapsuleMicro(capObj, shellPoint, cutStart, cutArc, anchors));
      build('nucleoid', prokaryote.nucleoid, item => {
        const chrom = organelleMaterial('#9e74e8', { roughness: 0.34, clearcoat: 0.5 });
        const points = Array.from({ length: 68 }, (_, i) => {
          const a = i * tau / 68;
          return v(1.57 * Math.cos(a) + .22 * Math.sin(a * 6), .71 * Math.sin(a * 3), .52 * Math.sin(a * 5));
        });
        tube(item, chrom, points, .062, true, 100, 8);
        tube(item, glow('#cca6fa', .16), points.map((p, i) => p.clone().add(v(.07 * Math.sin(i * .8), .07 * Math.cos(i * .8), .08))), .031, true, 100, 7);
      });
      build('plasmid', prokaryote.plasmid, item => {
        // 3 Non-overlapping sculpted supercoiled double-helix circular dsDNA plasmids (cccDNA)!
        makePlasmid3D(item, 0.28, -0.24, 0.24, 0.16, [0.58, 0.42, 0.18]);
        makePlasmid3D(item, 0.21, 0.38, -0.34, 0.08, [0.92, -0.35, 0.42]);
        makePlasmid3D(item, 0.18, 0.46, 0.46, -0.22, [0.35, 0.85, -0.28]);
      });
      build('ribosome', prokaryote.ribosome, item => {
        const beads = instances(item, new T.SphereGeometry(1, 8, 6), organelleMaterial('#72bede', { roughness: 0.38 }), 272);
        const place = instanceUpdater(beads);
        let placed = 0;
        for (let tries = 0; tries < 600 && placed < 120; tries++) {
          const x = (rng() * 2 - 1) * 3.25;
          const a = rng() * tau;
          const r = (0.38 + rng() * 0.56) * Math.sqrt(Math.max(0.05, 1 - (x / 4.05) ** 2));
          const y = Math.cos(a) * r * 1.32;
          const z = Math.sin(a) * r * 1.40;
          // Exclude nucleoid core & plasmid zone so ribosomes never clip through DNA!
          if (Math.hypot((x + 0.92) / 1.55, y / 0.78, z / 0.65) < 1.02) continue;
          if (Math.hypot(x - 2.08, y - 0.18, z - 0.52) < 0.88) continue;
          place(placed * 2, x, y, z, 0.06, 0.045, 0.052);
          place(placed * 2 + 1, x + 0.035, y + 0.044, z, 0.042, 0.032, 0.038);
          placed++;
        }
        beads.count = placed * 2;
        beads.instanceMatrix.needsUpdate = true;
      }, false);
      build('flagellum', prokaryote.flagellum, item => {
        flagellumCtrl = createMotileFlagellum(item);
      }, false);
      microUpdaters.push(...attachBacteriaMicro(structures, shellPoint, cutStart, cutArc, anchors));
    } else {
      const positions = type === 'plant' ? vegetal : eukaryote;

      build('cytoskeleton', positions.cytoskeleton, item => {
        const network = cytoskeleton(item, type, rng);
        updateCytoskeleton = attachCytoskeletonMicro(item, anchors, network);
      }, false);

      const nucObj = build('nucleus', positions.nucleus, item => {
        nucleus(item, rng);
        const sc = type === 'plant' ? 0.70 : 0.94;
        item.scale.setScalar(sc);
        motions.at(-1).baseScale = sc;
      });
      microUpdaters.push(...attachNucleusMicro(nucObj, anchors));

      rerObj = build('rer', positions.rer, item => {
        roughER(item, rng);
        const sc = type === 'plant' ? 0.68 : 0.80;
        item.scale.setScalar(sc);
        motions.at(-1).baseScale = sc;
        item.rotation.z = type === 'plant' ? 0.14 : 0.22;
      });
      microUpdaters.push(...attachRERMicro(rerObj, anchors));

      const serObj = build('ser', positions.ser, item => {
        smoothER(item);
        const sc = type === 'plant' ? 0.72 : 0.82;
        item.scale.setScalar(sc);
        motions.at(-1).baseScale = sc;
      });
      microUpdaters.push(...attachSERMicro(serObj, anchors));

      golgiObj = build('golgi', positions.golgi, item => {
        golgi(item);
        const sc = type === 'plant' ? 0.76 : 0.85;
        item.scale.setScalar(sc);
        motions.at(-1).baseScale = sc;
        item.rotation.z = -0.38;
      });
      microUpdaters.push(...attachGolgiMicro(golgiObj, anchors));

      // Secretory pathway vesicles & exocytosis fusion rings
      erVesicles = instances(model, new T.SphereGeometry(.082, 10, 8),
        organelleMaterial('#74cbe8', { emissive: '#358fb5', emissiveIntensity: 0.28, clearcoat: 0.7 }), 5, true);
      secVesicles = instances(model, new T.SphereGeometry(.096, 12, 8),
        organelleMaterial('#f2b666', { emissive: '#c47b33', emissiveIntensity: 0.28, clearcoat: 0.75 }), 7, true);
      fusionRings = instances(model, new T.TorusGeometry(.16, .016, 6, 20),
        glow('#86f0e6', 0.55, { transparent: true, opacity: 0.75, depthWrite: false }), 7, true);
      putEr = instanceUpdater(erVesicles);
      putSec = instanceUpdater(secVesicles);
      putRing = instanceUpdater(fusionRings);

      const mitoObj = build('mitochondria', positions.mitochondria, item => {
        const sc = type === 'plant' ? 0.74 : 0.86;
        mainMito = mitochondrion(item, sc);
        motions.at(-1).baseScale = sc;
        item.rotation.z = 0.22;
      });
      microUpdaters.push(...attachMitoMicro(mitoObj, anchors));

      const m2Pos = type === 'plant' ? [-1.12, 1.98, 0.46] : [-1.58, 1.66, 0.36];
      const m2Scale = type === 'plant' ? 0.54 : 0.56;
      secondMito = group(model, ...m2Pos);
      secondMito.userData.key = 'mitochondria';
      mitochondrion(secondMito, m2Scale);
      secondMito.rotation.z = -0.36;
      motions.push({ object: secondMito, origin: secondMito.position.clone(), phase: 1.9, baseScale: m2Scale });

      const granule = (key, hueA, hueB, speckle, radius) => build(key, positions[key], item => {
        // Sculpted cutaway spherical bilayer with glowing membrane edge so internal Cryo-EM enzymes & crystals shine!
        const g = organicDisplace(new T.SphereGeometry(1, 28, 18, Math.PI * 0.72, Math.PI * 1.48), 0.042, 3.6, radius * 40);
        tintGeometry(g, hueA, hueB, 3.2, radius * 17);
        const shellMat = membraneMaterial('#ffffff', {
          vertexColors: true, opacity: 0.74, clearcoat: 0.88, roughness: 0.2, iridescence: 0.28, side: T.DoubleSide
        });
        shellMat.userData.peekShell = true;
        const body = mesh(item, g, shellMat);
        body.scale.set(radius, radius * .92, radius);
        // Subtle bilayer rim tube highlighting the cutaway opening
        const rimMat = glow(speckle, 0.44);
        for (const phi of [Math.PI * 0.72, Math.PI * 2.20]) {
          const pts = Array.from({ length: 18 }, (_, i) => {
            const th = i * Math.PI / 17;
            return v(-Math.cos(phi) * Math.sin(th) * radius, Math.cos(th) * radius * 0.92, Math.sin(phi) * Math.sin(th) * radius);
          });
          tube(item, rimMat, pts, 0.012, false, 20, 6);
        }
      });

      if (type === 'animal') {
        const lysoObj = granule('lysosome', '#c46aa8', '#8a3e78', '#f0b6d6', 0.36);
        microUpdaters.push(...attachLysosomeMicro(lysoObj, anchors));

        const centroObj = build('centrosome', positions.centrosome, item => {
          centriole(item);
          item.scale.setScalar(0.88);
          motions.at(-1).baseScale = 0.88;
        });
        microUpdaters.push(...attachCentrosomeMicro(centroObj, anchors));
      }

      const peroxObj = granule('peroxisome', '#d1aa4d', '#99752b', '#faea9d', type === 'plant' ? 0.28 : 0.30);
      microUpdaters.push(...attachPeroxisomeMicro(peroxObj, anchors));

      if (type === 'plant') {
        const vacObj = build('vacuole', positions.vacuole, item => {
          const vg = organicDisplace(new T.SphereGeometry(1, 32, 22), 0.04, 2.8, 19);
          const vMesh = mesh(item, vg, membraneMaterial('#4fa6d6', { opacity: .36, clearcoat: 0.85 }));
          vMesh.scale.set(1.56, 1.34, 0.90);
          torus(item, glow('#7ed8f0', .18), 1, .011, 0, 0, .24).scale.set(1.46, 1.26, 1);
        });
        microUpdaters.push(...attachVacuoleMicro(vacObj, anchors));

        const chloroObj = build('chloroplast', positions.chloroplast, item => {
          chloroplast(item);
          item.scale.setScalar(0.88);
          motions.at(-1).baseScale = 0.88;
          item.rotation.z = 0.22;
        });
        microUpdaters.push(...attachChloroplastMicro(chloroObj, anchors));

        secondChlor = group(model, 0.14, -1.88, 1.18);
        secondChlor.userData.key = 'chloroplast';
        chloroplast(secondChlor);
        secondChlor.scale.setScalar(0.86);
        secondChlor.rotation.z = -0.18;
        motions.push({ object: secondChlor, origin: secondChlor.position.clone(), phase: 3.1, baseScale: 0.86 });
      }
    }
    }

    // Cache the animated materials in traversal order, including repeated uses of shared materials.
    const dimmableMaterials = new Set();
    for (const object of [...structures.values(), secondMito, secondChlor]) {
      if (!object) continue;
      const key = object.userData.key;
      const isOuter = OUTER_KEYS.has(key);
      const materials = [];
      object.traverse(item => {
        const mat = item.material;
        if (!mat?.isMeshStandardMaterial) return;
        materials.push({ mat, uses: item.userData.materialUses });
        if (!isOuter && !mat.transparent && !mat.userData.shell && !mat.userData.peekShell) dimmableMaterials.add(mat);
      });
      materialGroups.push({ key, isOuter, materials });
    }
    if (structures.size > 1 || focusGroups.size) engine.prepareFocusFilter(scene, dimmableMaterials);

    // Exploded view guide lines
    guidePositions = new Float32Array(motions.length * 6);
    const guideGeo = new T.BufferGeometry();
    guideGeo.setAttribute('position', new T.BufferAttribute(guidePositions, 3));
    const guideMat = new T.LineBasicMaterial({ color: '#61d2e0', transparent: true, opacity: 0, depthWrite: false });
    guideLines = new T.LineSegments(guideGeo, guideMat);
    guideLines.frustumCulled = false;
    model.add(guideLines);

    summary.textContent = type === 'virus'
      ? (VIRUS_SUMMARY[virusSubtype] || modelFacts.virus)
      : type === 'bacteria'
        ? (BACTERIA_SUMMARY[bacteriaSubtype] || modelFacts.bacteria)
        : modelFacts[type];
    shortcuts.replaceChildren(...Array.from(structures.keys(), key =>
      button('', () => pick(key), { 'data-key': key })));
    for (const item of shortcuts.children) {
      const data = organelles[item.dataset.key];
      item.append(node('i', { style: 'background:' + data.color }), data.name);
    }
    const defaultPick = useCoreCutaway
      ? (type === 'bacteria' ? 'nucleoid' : 'nucleus')
      : Array.from(structures.keys())[0];
    pick(defaultPick, false);
    resetCamera(true);
  }

  function intersectStructures(interior) {
    const collect = object => {
      if (object !== cytoFlowMesh && object.raycast !== T.Object3D.prototype.raycast) pickables.push(object);
    };
    for (const root of model.children) {
      const key = root.userData.key;
      if (!key) continue;
      const isInterior = key === 'cytoskeleton' || !OUTER_KEYS.has(key);
      if (isInterior === interior) root.traverseVisible(collect);
    }
    intersections.length = 0;
    ray.intersectObjects(pickables, false, intersections);
    pickables.length = 0;
  }

  function hit(event) {
    const bounds = canvas.getBoundingClientRect();
    pointer.set((event.clientX - bounds.left) / bounds.width * 2 - 1, 1 - (event.clientY - bounds.top) / bounds.height * 2);
    ray.setFromCamera(pointer, engine.camera);

    // Interior structures take priority, so only test the outer surfaces as a fallback.
    intersectStructures(true);
    if (intersections.length) {
      const key = hitKey(intersections[0].object);
      intersections.length = 0;
      return key;
    }

    let outerSurface = null;
    intersectStructures(false);
    for (const { object } of intersections) {
      const key = hitKey(object);
      if (key === 'membrane') {
        outerSurface = key;
        break;
      }
      outerSurface ??= key;
    }
    intersections.length = 0;
    return outerSurface;
  }

  function hitKey(object) {
    while (!object.userData.key) object = object.parent;
    return object.userData.key;
  }

  function updateHover(event) {
    const next = hit(event);
    hovered = next || null;
    if (next) {
      const info = organelles[next];
      const count = getSteps(next).length;
      const sub = count ? `Clique para explorar ${count} etapas em zoom` : info.role.split('.')[0];
      showTooltip(tooltip, viewport, event.clientX, event.clientY, info.name, sub, info.color);
    } else {
      hideTooltip(tooltip, viewport);
    }
  }

  let start;
  canvas.addEventListener('pointermove', event => {
    if (event.buttons || event.pointerType === 'touch') {
      pendingHover = null;
      hideTooltip(tooltip, viewport);
      return;
    }
    pendingHover = event;
  }, { signal });
  canvas.addEventListener('pointerleave', () => {
    pendingHover = hovered = null;
    hideTooltip(tooltip, viewport);
  }, { signal });
  canvas.addEventListener('pointerdown', event => {
    pendingHover = null;
    start = [event.clientX, event.clientY];
  }, { signal });
  canvas.addEventListener('pointerup', event => {
    const origin = start;
    start = null;
    if (!origin || Math.hypot(origin[0] - event.clientX, origin[1] - event.clientY) > 7) return;
    const key = hit(event);
    if (key) {
      pick(key);
    } else if (tourActive || focusMode) {
      resetCamera();
    }
  }, { signal });

  const focusToggle = toggle('Modo foco', false, value => {
    focusMode = value;
    audio.play('click');
  });
  const labelsToggle = button('Rótulos 3D', () => {
    setLabelsVisible?.(!(labelsVisible ? labelsVisible() : true));
    audio.play('click');
  }, { 'aria-pressed': String(labelsVisible ? labelsVisible() : true) });
  onLabelsChange?.(visible => {
    labelsToggle.setAttribute('aria-pressed', String(visible));
    syncOrganelleLabels();
  });

  const virusSelect = select('Tipo de vírus', VIRUS_SUBTYPES, virusSubtype, value => {
    virusSubtype = value;
    audio.play('click');
    rebuildModel();
  });
  virusSelect.element.hidden = true;

  const bacteriaSelect = select('Formato bacteriano', BACTERIA_SUBTYPES, bacteriaSubtype, value => {
    bacteriaSubtype = value;
    audio.play('click');
    rebuildModel();
  });
  bacteriaSelect.element.hidden = true;

  const explodedControl = range('Vista explodida', 0, 100, 1, 0,
    value => { exploded = value / 100; }, value => value + '%', { wheel: true, reset: 0 });
  const muscleControls = row(
    toggle('Contração na vista geral', true, value => { animateMuscle = value; audio.play('click'); }),
    button('Ver contração de perto', () => {
      pick('muscle_sarcomere', false);
      changeStep(getSteps('muscle_sarcomere').findIndex(step => step.anim === 'muscle_contract'));
    })
  );
  toolbar.append(
    select('Modelo celular', types, type, value => {
      type = value;
      audio.play('click');
      rebuildModel();
    }).element,
    virusSelect.element,
    bacteriaSelect.element,
    explodedControl.element,
    muscleControls,
    row(
      focusToggle,
      toggle('Raio-X', false, value => { xray = value; audio.play('click'); }),
      labelsToggle,
      toggle('Pausar', false, value => { paused = value; audio.play('click'); }),
      button('Resetar câmera', () => { audio.play('click'); resetCamera(); })
    )
  );
  guide.append(summary, details, node('h3', {}, 'Seleção rápida'), shortcuts);
  loadModel();

  const endpoint = v(), pt = v(), ringDummy = new T.Object3D(), upAxis = v(0, 0, 1);
  const erPts = [v(), v(), v()];
  const erRoute = curve(erPts);
  const exPts = [v(), v(), v()];
  const exRoute = curve(exPts);
  const exNorm = v();
  const erOffA = v(0.4, -0.1, 0.35), erOffB = v(-0.45, 0.15, -0.15);

  return {
    update(dt) {
      if (pendingHover) {
        updateHover(pendingHover);
        pendingHover = null;
      }
      if (!paused) time += dt;
      const step = tourActive ? activeStepData() : null;
      const contractionOverview = !tourActive && type === 'muscle' && animateMuscle;
      const activeAnim = tourActive ? step?.anim : contractionOverview ? 'muscle_overview' : null;

      // Subtle organic breathing + exploded displacement + guide lines
      let gIdx = 0;
      const showGuideLines = exploded > 0.015;
      const expFactor = 1 + exploded * 0.48;
      const amp = tourActive ? 0.025 : 0.068;
      for (const item of motions) {
        const { object, origin, phase, baseScale } = item;
        object.position.copy(origin).multiplyScalar(expFactor);
        // Calm motion slightly when deeply zoomed into a nanoscopic step so details stay crisp!
        object.position.y += Math.sin(time * 1.12 + phase) * amp;
        object.position.z += Math.cos(time * .84 + phase) * (amp * 0.75);
        const breathe = baseScale * (1 + Math.sin(time * 1.55 + phase) * (tourActive ? 0.008 : 0.018));
        object.scale.setScalar(breathe);

        if (showGuideLines) {
          guidePositions[gIdx++] = origin.x;
          guidePositions[gIdx++] = origin.y;
          guidePositions[gIdx++] = origin.z;
          guidePositions[gIdx++] = object.position.x;
          guidePositions[gIdx++] = object.position.y;
          guidePositions[gIdx++] = object.position.z;
        }
      }

      if (guideLines) {
        guideLines.visible = showGuideLines;
        if (showGuideLines) {
          guideLines.material.opacity = Math.min(0.42, exploded * 0.48);
          guideLines.geometry.attributes.position.needsUpdate = true;
        }
      }

      // Spin mitochondrial mtDNA ring subtly (faster during mito_matrix step)
      if (mainMito?.mtDna) {
        mainMito.mtDna.rotation.z = time * (activeAnim === 'mito_matrix' ? 1.8 : 0.45);
        mainMito.mtDna.material.emissiveIntensity = activeAnim === 'mito_matrix' ? 0.95 : 0.38;
      }

      updateMaterials(dt, activeAnim);
      updateCytoskeleton?.(time, activeAnim);

      // Update all bespoke micro-structure & step-triggered animations
      if (!paused) {
        for (const fn of microUpdaters) fn(time, dt, tourActive ? selected : null, activeAnim);
      }

      // Update 3D Pulsing Beacon & Active Step Callout Pin
      const st = selected !== 'cytoskeleton' ? step : null;
      if (st) {
        const anchorObj = anchors.get(st.anchor) || structures.get(selected);
        if (anchorObj) {
          anchorObj.getWorldPosition(beacon.position);
          beacon.visible = true;
          beacon.lookAt(engine.camera.position);
          const camDist = engine.camera.position.distanceTo(beacon.position);
          const scaleBase = Math.max(0.16, Math.min(1.65, camDist * 0.13));
          beaconOuter.scale.setScalar(scaleBase * (1 + Math.sin(time * 5.2) * 0.14));
          beaconInner.scale.setScalar(scaleBase * (0.95 + Math.cos(time * 5.2) * 0.1));
          stepPin.enabled = labelsVisible ? labelsVisible() : true;
          stepPin.offset.set(0, Math.max(0.16, scaleBase * 0.48), 0);
          const pinText = `${stepIndex + 1}/${getSteps(selected).length} · ${st.title}`;
          if (stepPin.item.textContent !== pinText) stepPin.item.textContent = pinText;
        }
      } else {
        beacon.visible = false;
        stepPin.enabled = false;
      }

      // GPU Selective Depth-of-Field background blur during close-up zoomed animation steps!
      if (tourActive && activeAnim && !WIDE_ANIMS.has(activeAnim)) {
        const specific = focusGroups.get(activeAnim);
        if (specific?.length) {
          focusScratch.length = 0;
          for (let i = 0; i < specific.length; i++) focusScratch.push(specific[i]);
          if (beacon.visible) focusScratch.push(beacon);
          engine.setFocusFilter(focusScratch, 0.96);
        } else if (structures.size > 1) {
          const selObj = structures.get(selected);
          if (selObj) {
            focusScratch.length = 0;
            focusScratch.push(selObj);
            if (beacon.visible) focusScratch.push(beacon);
            engine.setFocusFilter(focusScratch, 0.85);
          } else {
            engine.setFocusFilter(null, 0);
          }
        } else {
          engine.setFocusFilter(null, 0);
        }
      } else {
        engine.setFocusFilter(null, 0);
      }

      // Traveling helical wave on bacterial flagellum (accelerates during flag_motor / flag_wave)
      if (flagellumCtrl && !paused) {
        const boost = activeAnim === 'flag_wave' ? 1.75 : activeAnim === 'flag_motor' ? 1.45 : 1.0;
        flagellumCtrl.update(dt, boost);
      }

      // Secretory pathway: RER -> Golgi -> Plasma Membrane Exocytosis (intensifies on related steps!)
      const erBoost = activeAnim === 'rer_bud' || activeAnim === 'golgi_cis' ? 1.65 : 1.0;
      const exBoost = activeAnim === 'membrane_exocytosis' || activeAnim === 'golgi_exocytosis' ? 1.55 : 1.0;

      if (erVesicles && rerObj && golgiObj) {
        erPts[0].copy(rerObj.position).add(erOffA);
        erPts[2].copy(golgiObj.position).add(erOffB);
        erPts[1].copy(rerObj.position).lerp(golgiObj.position, 0.5);
        erPts[1].y += 0.48;
        erPts[1].z += 0.65;
        for (let i = 0; i < erVesicles.count; i++) {
          const p = (time * 0.28 * erBoost + i / erVesicles.count) % 1;
          erRoute.getPoint(p, pt);
          const sc = (Math.sin(p * Math.PI) * 0.45 + 0.55) * (erBoost > 1 ? 1.25 : 1);
          putEr(i, pt.x, pt.y, pt.z, sc);
        }
        erVesicles.instanceMatrix.needsUpdate = true;
      }

      if (secVesicles && fusionRings) {
        const hideSecForSkel = tourActive && selected === 'cytoskeleton' && ['skel_track', 'skel_motors', 'skel_actin', 'skel_intermediate'].includes(activeAnim);
        secVesicles.visible = fusionRings.visible = !hideSecForSkel;
      }
      if (secVesicles?.visible && fusionRings && golgiObj) {
        exPts[0].set(golgiObj.position.x + 0.25, golgiObj.position.y - 0.1, golgiObj.position.z + 0.25);
        for (let i = 0; i < secVesicles.count; i++) {
          const progress = (time * .3 * exBoost + i / secVesicles.count) % 1;
          const theta = 1.78 + .11 * Math.sin(i * 1.7);
          const phi = cutStart + .14 + .16 * Math.cos(i * 1.4);
          endpoint.copy(shellPoint(type, theta, phi, .985));
          exPts[2].copy(endpoint);
          exPts[1].copy(exPts[0]).lerp(endpoint, 0.52);
          exPts[1].x += 0.18 * Math.sin(i * 2.1);
          exPts[1].y += 0.42;
          exPts[1].z += 0.35;
          const travel = Math.min(1, progress / 0.84);
          exRoute.getPoint(travel, pt);

          if (progress < 0.84) {
            const sc = Math.min(1, travel * 7) * (exBoost > 1 ? 1.22 : 1);
            putSec(i, pt.x, pt.y, pt.z, sc);
            putRing(i, 0, -99, 0, 0.001);
          } else {
            const fuse = (progress - 0.84) / 0.16;
            const flatten = Math.max(0.01, 1 - fuse);
            putSec(i, endpoint.x, endpoint.y, endpoint.z, 1 + fuse * 0.5, flatten, 1 + fuse * 0.5);
            ringDummy.position.copy(endpoint);
            exNorm.copy(endpoint).normalize();
            ringDummy.quaternion.setFromUnitVectors(upAxis, exNorm);
            const rScale = (0.35 + fuse * 1.9) * (exBoost > 1 ? 1.35 : 1);
            ringDummy.scale.set(rScale, rScale, Math.max(0.05, 1 - fuse));
            ringDummy.updateMatrix();
            fusionRings.setMatrixAt(i, ringDummy.matrix);
          }
        }
        secVesicles.instanceMatrix.needsUpdate = true;
        fusionRings.instanceMatrix.needsUpdate = true;
      }
    }
  };
}
