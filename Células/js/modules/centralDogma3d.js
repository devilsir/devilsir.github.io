import * as T from 'three';
import {
  v, group, mesh, sphere, cylinder, torus, tube, material, glow,
  instances, instanceUpdater, membraneMaterial, gelMaterial, proteinMaterial, organelleMaterial, organicDisplace
} from '../core/geometry.js';
import { buildBioEnvironment } from './bioEnvironment3d.js?v=15';
import { reference, intron, baseColors, complements, translate, classify, aminoNames } from '../data/codons.js';
import { node, button, range, heading, card, note, row, legend, showTooltip, hideTooltip } from '../core/ui.js?v=9';

const stages = [
  { name: 'Estrutura do DNA', duration: 7, eye: [-5.15, 2.25, 11.4], target: [-5.08, .12, .25],
    text: 'Cada nucleotídeo une fosfato, pentose (desoxirribose no DNA; ribose no RNA) e base nitrogenada. A pareia com T (2 pontes de H) e C com G (3 pontes de H) em fitas antiparalelas.' },
  { name: 'Replicação semiconservativa', duration: 10, eye: [-5.0, 2.35, 12.1], target: [-5.1, .1, .55],
    text: 'A Helicase rompe as pontes de hidrogênio abrindo a forquilha de replicação. Enzimas DNA polimerase unem nucleotídeos complementares (verificando erros), formando duas duplas-hélices que conservam 1 fita original azul + 1 fita nova verde (semiconservativa).' },
  { name: 'Transcrição', duration: 11, eye: [-4.45, 2.15, 11.6], target: [-4.48, .1, .45],
    text: 'A RNA polimerase abre localmente a hélice, lê a fita molde 3′ → 5′ e sintetiza RNA de fita simples 5′ → 3′, substituindo Timina (T) por Uracila (U) e usando a pentose ribose.' },
  { name: 'Processamento e exportação', duration: 10, eye: [-.78, 1.55, 10.9], target: [-.75, -.25, .55],
    text: 'O spliceossomo remove os íntrons (trechos não codificantes) e une os éxons. Com cap 5′ e cauda poli(A), o RNAm maduro atravessa o poro nuclear rumo ao citosol.' },
  { name: 'Tradução', duration: 15, eye: [4.95, 2.45, 11.3], target: [4.45, .36, .88],
    text: 'O ribossomo (com RNAr catalítico) lê cada trinca (códon) do RNAm nos sítios A, P e E. O RNAt traz aminoácidos unidos por ligações peptídicas (com liberação de H₂O) formando a proteína.' }
];

const amino3 = {
  F: 'Phe', L: 'Leu', S: 'Ser', Y: 'Tyr', C: 'Cys', W: 'Trp',
  P: 'Pro', H: 'His', Q: 'Gln', R: 'Arg', I: 'Ile', M: 'Met',
  T: 'Thr', N: 'Asn', K: 'Lys', V: 'Val', A: 'Ala', D: 'Asp',
  E: 'Glu', G: 'Gly', '*': 'STOP'
};
const purines = new Set(['A', 'G']);
const originalRef = translate(reference);

const total = stages.reduce((n, item) => n + item.duration, 0);
const beginnings = stages.map((_, index) => stages.slice(0, index).reduce((sum, item) => sum + item.duration, 0));
const capacity = 44;
const pt = v();
const up = v(0, 1, 0);
const temp = new T.Object3D();

function bond(batch, index, a, b, radius = 1) {
  pt.copy(b).sub(a);
  const len = Math.max(0.0001, pt.length());
  temp.position.copy(a).lerp(b, .5);
  temp.scale.set(radius, len, radius);
  temp.quaternion.setFromUnitVectors(up, pt.divideScalar(len));
  temp.updateMatrix();
  batch.setMatrixAt(index, temp.matrix);
}

function makeAminoTexture(code, tintHex) {
  const canvas = document.createElement('canvas');
  canvas.width = 96;
  canvas.height = 56;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(11, 16, 23, 0.88)';
  ctx.strokeStyle = tintHex;
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.roundRect(4, 6, 88, 44, 14);
  ctx.fill();
  ctx.stroke();
  ctx.font = '700 24px Consolas, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#f3fafd';
  ctx.fillText(code, 48, 29);
  const tex = new T.CanvasTexture(canvas);
  tex.colorSpace = T.SRGBColorSpace;
  return tex;
}

// Truly HOLLOW open-ended biological channel/tunnel (outer wall + open central bore!)
function hollowTunnel(parent, mat, outerR, innerR, height, x = 0, y = 0, z = 0, segs = 24, boreColor = '#06111c') {
  const hh = height * 0.5;
  const pts = [
    new T.Vector2(innerR, -hh), new T.Vector2(outerR, -hh),
    new T.Vector2(outerR * 1.05, 0), new T.Vector2(outerR, hh),
    new T.Vector2(innerR, hh), new T.Vector2(innerR, -hh)
  ];
  const geo = new T.LatheGeometry(pts, segs);
  geo.computeVertexNormals();
  const m = mesh(parent, geo, mat, x, y, z);
  m.castShadow = true; m.receiveShadow = true;
  const bore = new T.Mesh(
    new T.CylinderGeometry(innerR * 0.98, innerR * 0.98, height * 0.98, segs, 1, true),
    new T.MeshBasicMaterial({ color: boreColor, side: T.BackSide })
  );
  bore.position.set(x, y, z);
  parent.add(bore);
  return m;
}

function structures(scene, label) {
  const interactives = new Map();

  // 1. TRULY HOLLOW 8-fold Nuclear Pore Complex centered EXACTLY on the mRNA export axis (z = 0.66)!
  const pore = group(scene, -.35, -.23, .66);
  pore.userData.pickKey = 'pore';
  const wallMat = membraneMaterial('#5b73b5', { opacity: .28, clearcoat: 0.92, iridescence: 0.42 });
  // Open-ended hollow central channel sleeve (inner clear bore r = 0.44 — mRNA passes cleanly through air!)
  const poreSleeve = hollowTunnel(pore, proteinMaterial('#7e72cc', { emissive: '#3e3485', emissiveIntensity: 0.22, clearcoat: 0.85 }), 0.60, 0.44, 0.48, 0, 0, 0, 24, '#081022');
  poreSleeve.rotation.z = Math.PI / 2;

  for (const x of [-.22, .22]) {
    const rim = torus(pore, proteinMaterial('#8a7ed6', { emissive: '#4d4196', emissiveIntensity: 0.24, clearcoat: 0.88 }), .62, .085, x);
    rim.rotation.y = Math.PI / 2;
    const boundary = new T.RingGeometry(.66, 3.35, 48, 2, Math.PI * .17, Math.PI * 1.66);
    boundary.rotateY(Math.PI / 2);
    const surface = new T.Mesh(boundary, wallMat);
    surface.position.x = x;
    pore.add(surface);
  }
  const spokeMat = proteinMaterial('#a592ed', { roughness: 0.24, clearcoat: 0.85 });
  const basketMat = gelMaterial('#b8a8ff', { opacity: 0.56, emissive: '#6e5cd6', emissiveIntensity: 0.35 });
  for (let i = 0; i < 8; i++) {
    const angle = i * Math.PI / 4;
    const sy = Math.sin(angle), cz = Math.cos(angle);
    // Scaffold subunits strictly OUTSIDE the open bore (r = 0.60)
    const sub = sphere(pore, spokeMat, .24, .11, .11, 0, sy * .60, cz * .60, 14);
    sub.rotation.x = angle;
    sub.castShadow = true;
    // Open hollow nuclear basket struts (-X nucleoplasm side)
    tube(pore, basketMat, [v(-0.26, sy * 0.58, cz * 0.58), v(-0.82, sy * 0.40, cz * 0.40)], 0.024, false, 8, 6);
    // Open cytoplasmic guide filaments (+X cytosol side)
    tube(pore, basketMat, [v(0.26, sy * 0.58, cz * 0.58), v(0.72, sy * 0.74, cz * 0.74)], 0.02, false, 8, 6);
  }
  const basketRing = torus(pore, basketMat, 0.40, 0.026, -0.82, 0, 0);
  basketRing.rotation.y = Math.PI / 2;
  interactives.set('pore', {
    object: pore, title: 'Complexo do Poro Nuclear (NPC oco · 8 subunidades)', subtitle: 'Canal central oco com cesto nuclear e filamentos citoplasmáticos por onde o RNAm maduro é exportado',
    color: '#a592ed', stageIndex: 3
  });

  // 2. Sculpted HOLLOW Spliceosome Ring (U1–U6 snRNP) wrapping cleanly around the looping intron lariat!
  const spliceosome = group(scene, -2.5, 0.9, 0.66);
  spliceosome.userData.pickKey = 'spliceosome';
  const spMatA = proteinMaterial('#b46ee8', { emissive: '#6a2ea8', emissiveIntensity: 0.34, clearcoat: 0.88 });
  const spMatB = proteinMaterial('#e694f5', { emissive: '#8f38b0', emissiveIntensity: 0.28, clearcoat: 0.85 });
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const lobe = mesh(spliceosome, organicDisplace(new T.SphereGeometry(0.19, 14, 12), 0.1, 5, i + 2), i % 2 ? spMatB : spMatA,
      Math.cos(a) * 0.36, Math.sin(a) * 0.34, 0);
    lobe.castShadow = true;
  }
  torus(spliceosome, glow('#f2b6ff', 0.65), 0.36, 0.024, 0, 0, 0);
  spliceosome.visible = false;
  interactives.set('spliceosome', {
    object: spliceosome, title: 'Spliceossomo (Complexo U1–U6 snRNP)',
    subtitle: 'Anel catalítico que remove íntrons em forma de laço (lariat) e liga os éxons codificantes',
    color: '#d99aef', stageIndex: 3
  });

  // 3. Sculpted 80S Ribosome (60S with REAL HOLLOW VERTICAL POLYPEPTIDE EXIT TUNNEL + 40S with mRNA Decoding Groove!)
  //    Exact 1-codon spacing: 3 bases × 0.22 = 0.66 => E (-0.66) · P (0.00) · A (+0.66)!
  const ribosome = group(scene, 4.68, -.28, .44);
  ribosome.userData.pickKey = 'ribosome';
  const largeMat = proteinMaterial('#3f969e', { roughness: 0.24, clearcoat: 0.84, iridescence: 0.22, bumpScale: 0.042 });
  const smallMat = proteinMaterial('#72c4a6', { roughness: 0.26, clearcoat: 0.80, iridescence: 0.18, bumpScale: 0.036 });
  // 60S Large Subunit sculpted in left/right/back arches AROUND the open hollow exit tunnel (x = 0, z = 0.52)!
  for (const [x, y, z, sx, sy, sz, seed] of [
    [-.86, .48, -.06, .66, .74, .48, 1],
    [.86, .48, -.06, .62, .74, .46, 3],
    [0, .62, -.42, 1.12, .86, .46, 2],
    [-.46, .92, .16, .42, .44, .34, 4],
    [.46, .92, .16, .42, .44, .34, 7]
  ]) {
    const g = organicDisplace(new T.SphereGeometry(1, 24, 16), 0.05, 3.8, seed);
    const m = mesh(ribosome, g, largeMat, x, y, z);
    m.scale.set(sx, sy, sz);
    m.castShadow = true; m.receiveShadow = true;
  }
  // GENUINE HOLLOW POLYPEPTIDE EXIT TUNNEL running vertically straight up from P-site PTC (y = 0.68 -> 1.48, x = 0, z = 0.52)!
  hollowTunnel(ribosome, proteinMaterial('#4db8bd', { emissive: '#1a6870', emissiveIntensity: 0.24, clearcoat: 0.88 }), 0.27, 0.165, 0.82, 0.0, 1.08, 0.52, 24, '#05151a');
  const tunnelRing = torus(ribosome, glow('#7cf2eb', 0.45), 0.21, 0.03, 0.0, 1.49, 0.52);
  tunnelRing.rotation.x = Math.PI / 2;

  // 40S Small Subunit sitting cleanly BELOW the mRNA groove (mRNA runs at local y = -0.18, z = 0.52)!
  const smallGeoA = organicDisplace(new T.SphereGeometry(1, 26, 18), 0.04, 3.6, 5);
  const sA = mesh(ribosome, smallGeoA, smallMat, 0.0, -.58, .26);
  sA.scale.set(1.48, .28, .62); sA.castShadow = true;
  const smallGeoB = organicDisplace(new T.SphereGeometry(1, 20, 14), 0.04, 3.8, 6);
  const sB = mesh(ribosome, smallGeoB, smallMat, -.82, -.68, .38);
  sB.scale.set(.56, .18, .48); sB.castShadow = true;

  // Exact E (-0.66), P (0.00), A (+0.66) codon-decoding pockets centered at z = 0.52!
  const siteColors = ['#66d0cc', '#ebb86b', '#d98bc5'];
  const sites = [-.66, 0, .66].map((x, i) => {
    const object = group(ribosome, x, -.08, .52);
    torus(object, glow(siteColors[i], .38), .16, .022).rotation.x = Math.PI / 2;
    label(['Sítio E (Saída)', 'Sítio P (Peptidil)', 'Sítio A (Aminoacil)'][i], object, v(0, -.36, .34));
    return object;
  });
  interactives.set('ribosome', {
    object: ribosome, title: 'Ribossomo 80S (60S com túnel oco + 40S)', subtitle: 'Lê o RNAm 5′→3′ nos sítios A → P → E; a cadeia polipeptídica sai pelo túnel oco da subunidade 60S',
    color: '#66d0cc', stageIndex: 4
  });

  // 4. TRULY HOLLOW Hexameric MCM2-7 Helicase Ring encircling the DNA fork cleanly at z = 0.63!
  const helicase = group(scene);
  helicase.userData.pickKey = 'helicase';
  const heliMat = proteinMaterial('#f0a254', { emissive: '#a65c19', emissiveIntensity: 0.34, clearcoat: 0.88 });
  const heliRing = hollowTunnel(helicase, heliMat, 0.44, 0.25, 0.34, 0, 0, 0, 18, '#1a0e05');
  heliRing.rotation.z = Math.PI / 2;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const sub = mesh(helicase, organicDisplace(new T.SphereGeometry(0.145, 14, 12), 0.09, 6, i + 1), heliMat, 0, Math.cos(a) * 0.40, Math.sin(a) * 0.40);
    sub.castShadow = true;
  }
  interactives.set('helicase', {
    object: helicase, title: 'Helicase oca (Anel hexamérico MCM2-7)', subtitle: 'Envolve a fita de DNA e rompe as pontes de hidrogênio com gasto de ATP abrindo a forquilha',
    color: '#f0a254', stageIndex: 1
  });

  // 5. Twin DNA Polymerases (Leading ε -> +X, Lagging δ -> -X) with HOLLOW PCNA Sliding Clamps centered ON the DNA axis!
  const dnaPols = [0, 1].map(idx => {
    const dp = group(scene);
    dp.userData.pickKey = 'dnaPol';
    const dpMat = proteinMaterial('#4fd19b', { emissive: '#177550', emissiveIntensity: 0.24, clearcoat: 0.88, transparent: true, opacity: 0.82 });
    // Sculpted palm-fingers cleft embracing the daughter duplex cleanly (hollow open center along X!)
    const cuff = hollowTunnel(dp, dpMat, 0.40, 0.22, 0.46, 0, 0, 0, 18, '#081c16');
    cuff.rotation.z = Math.PI / 2;
    // Truly HOLLOW PCNA Sliding Clamp ring trailing behind the polymerase along the exact duplex axis!
    const pcnaDir = idx === 0 ? -0.44 : 0.44; // Leading moves +X (PCNA behind at -X); Lagging synthesizes 5'->3' toward -X (PCNA behind at +X)!
    const pcna = hollowTunnel(dp, proteinMaterial('#7ce8ff', { emissive: '#229bb5', emissiveIntensity: 0.48, clearcoat: 0.92 }), 0.34, 0.21, 0.16, pcnaDir, 0, 0, 18, '#061a24');
    pcna.rotation.z = Math.PI / 2;
    return dp;
  });
  interactives.set('dnaPol', {
    object: dnaPols[0], title: 'DNA Polimerase + Grampo Deslizante oco (PCNA)', subtitle: 'Sintetiza fitas novas sempre 5′→3′ (líder contínua rumo à forquilha; retardada em fragmentos de Okazaki)',
    color: '#4fd19b', stageIndex: 1
  });

  // 6. Sculpted HOLLOW Crab-Claw RNA Polymerase II seated directly around the transcription bubble (z = 0.63)!
  const polymerase = group(scene);
  polymerase.userData.pickKey = 'polymerase';
  const polyMat = proteinMaterial('#d178ba', { emissive: '#782e66', emissiveIntensity: 0.24, clearcoat: 0.86, transparent: true, opacity: 0.72, bumpScale: 0.036 });
  const polyCore = proteinMaterial('#ad5098', { roughness: 0.26, clearcoat: 0.82, transparent: true, opacity: 0.78 });
  // Open upper clamp + lower jaw framing a clear central catalytic channel around the DNA bubble
  const upperJaw = mesh(polymerase, organicDisplace(new T.SphereGeometry(1, 22, 16), 0.06, 4.2, 8), polyMat, 0, 0.36, -0.18);
  upperJaw.scale.set(.72, .32, .48); upperJaw.castShadow = true;
  const lowerJaw = mesh(polymerase, organicDisplace(new T.SphereGeometry(1, 22, 16), 0.06, 4.2, 9), polyCore, 0.12, -0.34, -0.14);
  lowerJaw.scale.set(.68, .30, .46); lowerJaw.castShadow = true;
  // Hollow RNA exit pore on the lower-left rear of RNA Pol II
  const rnaExit = hollowTunnel(polymerase, glow('#f5b4e4', 0.45), 0.22, 0.12, 0.24, -0.46, -0.26, 0.22, 16, '#1c0a18');
  rnaExit.rotation.z = 0.72;
  interactives.set('polymerase', {
    object: polymerase, title: 'RNA Polimerase II (Fenda Catalítica)', subtitle: 'Abre a bolha de transcrição (~14 pb), lê a fita molde 3′→5′ e sintetiza pré-RNAm 5′→3′',
    color: '#e592d1', stageIndex: 2
  });

  const names = [
    [label('Núcleo', group(scene, -6.5, 2.38, 0)), [0, 2, 3]],
    [label('Fita codificante · 5′ → 3′', group(scene, -5.65, 1.98, 1.04)), [0]],
    [label('Fita molde · 3′ → 5′', group(scene, -5.65, -1.72, 1.04)), [0]],
    [label('Helicase oca (MCM2-7)', helicase, v(0, 0.76, 0.32)), [1]],
    [label('DNA pol ε · Fita líder (5′→3′ →)', dnaPols[0], v(0.2, 0.66, 0.3)), [1]],
    [label('DNA pol δ · Retardada (← 5′→3′ Okazaki)', dnaPols[1], v(0.2, -0.68, 0.3)), [1]],
    [label('Hélice-filha 1 (1 original + 1 nova)', group(scene, -7.85, 2.24, 0.9)), [1]],
    [label('Hélice-filha 2 (1 original + 1 nova)', group(scene, -7.85, -2.32, 0.9)), [1]],
    [label('Poro nuclear oco (NPC)', pore, v(0, 1.15, .27)), [3]],
    [label('Spliceossomo (snRNP)', spliceosome, v(0, 0.68, .28)), [3]],
    [label('Ribossomo 80S (Túnel oco 60S + 40S)', ribosome, v(-1.12, 1.72, 0.2)), [3, 4]],
    [label('RNA polimerase II', polymerase, v(.04, .82, .25)), [2]],
    [label('Citosol · RER', group(scene, 3.32, 2.12, 0)), [3, 4]]
  ];

  // Sculpted L-shaped tRNAs: 3 anticodon tips at y = 0.00 (locking directly onto mRNA codon at y = -0.14!),
  // 3' CCA amino-acid acceptor stem cleanly at top (x = 0.00, y = +0.62, z = 0.00) right beneath the 60S Exit Tunnel!
  const tRNAs = ['#d68fd8', '#ebb373', '#8ed9cc'].map(color => {
    const root = group(ribosome);
    const mat = proteinMaterial(color, { roughness: 0.22, clearcoat: 0.85 });
    // Authentic L-shaped 3D tRNA fold (anticodon stem vertical + D/T elbow + 3' CCA stem pointing cleanly up into PTC!)
    tube(root, mat, [
      v(-.20, .02, 0), v(0, .05, 0), v(.20, .02, 0),
      v(.10, .24, -.04), v(-.08, .38, -.06), v(-.18, .50, -.04), v(-.04, .58, 0), v(0, .66, 0)
    ], .038, false, 30, 8);
    torus(root, mat, 0.075, 0.02, -0.16, 0.44, -0.04).rotation.y = 0.4;
    const cargo = sphere(root, proteinMaterial('#ffffff', { emissive: color, emissiveIntensity: 0.38, clearcoat: 0.9 }), .145, .145, .145, 0, .74, 0, 14);
    // Exact 0.22 base spacing matching mRNA codon bases 1:1!
    const tips = [-.22, 0, .22].map(x => sphere(root, proteinMaterial(color, { clearcoat: 0.85 }), .058, .054, .058, x, -.03, 0, 10));
    // 3 golden codon-anticodon hydrogen-bond ticks visible when paired in A/P site!
    const hBonds = [-.22, 0, .22].map(x => cylinder(root, glow('#ffe68a', 0.9), 0.014, 0.014, 0.11, x, -.10, 0, 6));
    return { root, cargo, tips, hBonds };
  });

  const releaseFactor = group(ribosome, .66, .16, .52);
  sphere(releaseFactor, proteinMaterial('#eb8ca3', { emissive: '#b83c5c', emissiveIntensity: 0.34, clearcoat: 0.88 }), .20, .34, .20, 0, .26, 0, 16);
  sphere(releaseFactor, glow('#f7bc88', .45), .12, .18, .12, 0, -.06, 0, 12);
  const releaseLabel = label('Fator de liberação (eRF1)', releaseFactor, v(.12, .78, .28));

  // H2O droplet released right at the Peptidyl-Transferase Center when each peptide bond condenses!
  const waterRelease = group(ribosome, 0.32, 0.68, 0.68);
  sphere(waterRelease, glow('#6beaff', 0.92), 0.075, 0.075, 0.075, 0, 0, 0, 12);
  sphere(waterRelease, glow('#eefaff', 0.82), 0.042, 0.042, 0.042, -0.065, 0.048, 0, 9);
  sphere(waterRelease, glow('#eefaff', 0.82), 0.042, 0.042, 0.042, 0.065, 0.048, 0, 9);
  const waterLabel = label('H₂O (ligação peptídica)', waterRelease, v(0.14, 0.22, 0));
  waterRelease.visible = false;
  waterLabel.enabled = false;

  return { ribosome, polymerase, helicase, dnaPols, spliceosome, pore, sites, names, tRNAs, releaseFactor, releaseLabel, waterRelease, waterLabel, interactives };
}

export function centralDogma3d({ scene, lights, engine, label, toolbar, guide, viewport, tooltip, signal, audio, help }) {
  scene.fog.density = 0.0072;
  lights.rim.color.set('#6ae4f8');
  lights.rim.intensity = 2.15;

  // Living Split Nucleoplasm (left) <-> Nuclear Envelope <-> Cytosol + Rough ER (right) + 3-point bio-studio lights!
  const bioEnv = buildBioEnvironment(scene, { mode: 'dogma' });
  const keyWarm = new T.PointLight('#fff0d8', 2.0, 26, 1.4);
  keyWarm.position.set(1.5, 5.8, 7.6);
  keyWarm.castShadow = true;
  const nucGlow = new T.PointLight('#9e80ff', 1.45, 18, 1.5);
  nucGlow.position.set(-6.5, 2.2, 3.8);
  const cytoGlow = new T.PointLight('#52e0ee', 1.55, 18, 1.5);
  cytoGlow.position.set(5.2, 2.4, 4.4);
  scene.add(keyWarm, nucGlow, cytoGlow);

  const models = structures(scene, label);
  let dna = [...reference].map((base, index) => ({ base, index }));
  let selected = 0;
  let playing = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  let time = 0, speed = 1, stage = 0;
  let sequence = reference, result = translate(sequence);
  let previewProtein = false, lastCodon = -2, changed = true;
  let clock = 0;
  let lastMutatedIndex = -1;
  let mutationFlash = 0;
  let hoveredKey = null;

  // Lustrous parental DNA double-helix instanced batches
  const SUB = 3;
  const dnaBackbone = instances(scene, new T.CylinderGeometry(.044, .044, 1, 9),
    organelleMaterial('#6f96e3', { emissive: '#2a4b8f', emissiveIntensity: 0.2, roughness: 0.2, clearcoat: 0.9 }), capacity * 2 * SUB, true);
  const backboneBeads = instances(scene, new T.SphereGeometry(.088, 10, 8),
    organelleMaterial('#b6c8f7', { emissive: '#5675bd', emissiveIntensity: 0.16, roughness: 0.22, clearcoat: 0.85 }), capacity * 2, true);
  const stems = instances(scene, new T.CylinderGeometry(.06, .06, 1, 10),
    organelleMaterial('#ffffff', { roughness: 0.28, clearcoat: 0.65 }), capacity * 2, true);
  const pairs = instances(scene, new T.CylinderGeometry(.02, .02, 1, 7),
    glow('#f0df9e', .46), capacity * 3, true);

  // Newly synthesized emerald daughter DNA strands + Helicase H-bond cleavage sparks (Stage 1)
  const newBackbone = instances(scene, new T.CylinderGeometry(.042, .042, 1, 8),
    organelleMaterial('#4ed69d', { emissive: '#1e8a60', emissiveIntensity: 0.3, roughness: 0.2, clearcoat: 0.9 }), capacity * 2, true);
  const newBeads = instances(scene, new T.SphereGeometry(.082, 9, 7),
    organelleMaterial('#8ef7cc', { emissive: '#2ea376', emissiveIntensity: 0.24, roughness: 0.22, clearcoat: 0.85 }), capacity * 2, true);
  const newStems = instances(scene, new T.CylinderGeometry(.056, .056, 1, 9),
    organelleMaterial('#ffffff', { roughness: 0.28, clearcoat: 0.65 }), capacity * 2, true);
  const newPairs = instances(scene, new T.CylinderGeometry(.018, .018, 1, 6),
    glow('#9effda', .5), capacity * 4, true);
  const heliSparks = instances(scene, new T.SphereGeometry(.038, 8, 6), glow('#ffe07a', 1.15), 8, true);
  const putHeliSpark = instanceUpdater(heliSparks);

  // mRNA strand + distinct Uracil glow halos
  const rnaBeads = instances(scene, new T.SphereGeometry(.085, 11, 8),
    organelleMaterial('#ffffff', { roughness: 0.26, clearcoat: 0.72 }), capacity, true);
  const rnaLinks = instances(scene, new T.CylinderGeometry(.032, .032, 1, 8),
    organelleMaterial('#8da8db', { roughness: 0.28, clearcoat: 0.7 }), capacity, true);
  const uracilHalos = instances(scene, new T.TorusGeometry(.125, .018, 7, 16),
    glow('#e08aff', .85, { transparent: true, opacity: 0.85, depthWrite: false }), capacity, true);

  // Polypeptide amino acids + glossy peptide bonds + amino acid 3-letter sprite pool
  const aminoBeads = instances(scene, new T.SphereGeometry(.155, 14, 10),
    organelleMaterial('#ffffff', { roughness: 0.24, clearcoat: 0.8 }), capacity, true);
  const peptideLinks = instances(scene, new T.CylinderGeometry(.048, .048, 1, 9),
    organelleMaterial('#e8ba92', { roughness: 0.3, clearcoat: 0.65 }), capacity, true);

  // Mutation visual feedback rings
  const dnaPulseRing = torus(scene, glow('#ffbe55', 1.1, { transparent: true, opacity: 0, depthWrite: false }), 0.24, 0.024);
  dnaPulseRing.visible = false;
  const rnaCodonHalo = group(scene);
  const rnaCodonRings = [0, 1, 2].map(() => torus(rnaCodonHalo,
    glow('#ffbe55', 0.9, { transparent: true, opacity: 0.8, depthWrite: false }), 0.145, 0.02));
  rnaCodonHalo.visible = false;
  const proteinMutationRings = instances(scene, new T.TorusGeometry(0.22, 0.022, 8, 22),
    glow('#ffae42', 1.0, { transparent: true, opacity: 0.9, depthWrite: false }), capacity, true);
  proteinMutationRings.count = 0;
  const nonsenseMarker = group(scene);
  torus(nonsenseMarker, glow('#ff5773', 1.0), 0.25, 0.032);
  torus(nonsenseMarker, glow('#ffb259', 0.75, { transparent: true, opacity: 0.65 }), 0.34, 0.016);
  nonsenseMarker.visible = false;
  const nonsenseLabel = label('Truncamento (Nonsense)', nonsenseMarker, v(0, 0.48, 0.25));
  nonsenseLabel.enabled = false;

  const aminoTextures = new Map();
  const aminoTintsHex = ['#e89894', '#ecc06b', '#6dd1c3', '#a698eb', '#69aee0', '#b5db84'];
  const aminoTints = aminoTintsHex.map(value => new T.Color(value));
  const aminoSprites = [];
  for (let i = 0; i < capacity; i++) {
    const spr = new T.Sprite(new T.SpriteMaterial({ transparent: true, depthWrite: false }));
    spr.scale.set(0.46, 0.27, 1);
    spr.layers.set(1);
    spr.visible = false;
    scene.add(spr);
    aminoSprites.push(spr);
  }
  function getAminoTex(letter, tintHex) {
    const k = letter + tintHex;
    if (!aminoTextures.has(k)) aminoTextures.set(k, makeAminoTexture(amino3[letter] || letter, tintHex));
    return aminoTextures.get(k);
  }

  const cap = sphere(scene, glow('#f0c86e', .48), .128, .128, .128, 0, 0, 0, 14);
  const tail = instances(scene, new T.SphereGeometry(.064, 9, 7), glow('#6ce8b2', .36), 5, true);
  const baseTints = Object.fromEntries(Object.entries(baseColors).map(([key, color]) => [key, new T.Color(color)]));
  const intronTint = new T.Color('#b878d9');
  const mutHighlightTint = new T.Color('#ffc457');

  const putBackbone = instanceUpdater(backboneBeads);
  const putNewBead = instanceUpdater(newBeads);
  const putRNA = instanceUpdater(rnaBeads);
  const putUracil = instanceUpdater(uracilHalos);
  const putAA = instanceUpdater(aminoBeads);
  const putMutRing = instanceUpdater(proteinMutationRings);
  const putTail = instanceUpdater(tail);

  const helix = Array.from({ length: capacity }, () => [v(), v(), v(), v()]);
  const daughterPos = Array.from({ length: capacity }, () => [v(), v()]);
  const transcript = Array.from({ length: capacity }, () => v());
  const peptide = Array.from({ length: capacity }, () => v());
  const tips = [v(), v()];
  const subA = v(), subB = v(), repMid = v();
  const exonJoin = () => dna.findIndex(base => base.index >= 9);
  const spliceAt = () => exonJoin() < 0 ? dna.length : exonJoin();

  let mutationInfo = { kind: 'Sequência de referência', affectedCodonStart: -1, alteredProteinIndices: new Set(), isNonsense: false, isSilent: false };
  function computeMutationDiff() {
    const [kind] = classify(sequence);
    const alteredProteinIndices = new Set();
    const isMutated = sequence !== reference;
    let firstDiffBase = -1;
    if (isMutated) {
      for (let i = 0; i < Math.max(sequence.length, reference.length); i++) {
        if (sequence[i] !== reference[i]) { firstDiffBase = i; break; }
      }
      for (let i = 0; i < result.protein.length; i++) {
        if (result.protein[i] !== originalRef.protein[i]) alteredProteinIndices.add(i);
      }
    }
    const targetBase = lastMutatedIndex >= 0 ? Math.min(lastMutatedIndex, Math.max(0, sequence.length - 1)) : firstDiffBase;
    const affectedCodonStart = targetBase >= 0 && result.start >= 0 && targetBase >= result.start
      ? result.start + Math.floor((targetBase - result.start) / 3) * 3 : -1;
    mutationInfo = {
      kind, targetBase, affectedCodonStart, alteredProteinIndices,
      isNonsense: kind === 'Nonsense', isSilent: kind === 'Mutação silenciosa', isFrameshift: kind === 'Frameshift'
    };
  }

  // UI elements
  const stageText = node('p');
  const stageTitle = heading(stages[0].name);
  const timeBar = range('Linha do tempo', 0, total, .05, 0, value => seek(value),
    value => value.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' s', { wheel: true, reset: 0 });
  const play = button(playing ? 'Pausar' : 'Reproduzir', () => {
    if (!playing && time >= total) seek(0);
    playing = !playing;
    play.textContent = playing ? 'Pausar' : 'Reproduzir';
    audio.play('click');
  });
  const stageButtons = stages.map((item, index) => button(item.name, () => {
    previewProtein = false;
    seek(beginnings[index]);
    audio.play('click');
  }, { 'aria-pressed': String(index === 0) }));
  const step = row(...stageButtons);
  const seq = node('div', { className: 'sequence', 'aria-label': 'Bases da fita codificante' });
  const controls = row();
  const mutationText = node('div', { 'aria-live': 'polite' });
  const codonRows = node('tbody');
  const dataReadout = node('div', { className: 'card' });
  const referenceHelp = card('Genes, alelos e mutações',
    'Genes são trechos de DNA que codificam proteínas; alelos são versões alternativas do mesmo gene. Edite uma base abaixo para criar um novo alelo/mutação e ver seu efeito imediato na proteína 3D.');

  function setStage(index, instant = false) {
    stage = index;
    models.names.forEach(([entry, visibility]) => { entry.enabled = visibility.includes(index); });
    stageTitle.textContent = stages[index].name;
    stageText.textContent = stages[index].text;
    stageButtons.forEach((control, i) => control.setAttribute('aria-pressed', String(index === i)));
    engine.view(stages[index].eye, stages[index].target, instant);
    changed = true;
  }

  function seek(next) {
    time = Math.min(total, Math.max(0, next));
    timeBar.set(time);
    if (time < beginnings[4]) previewProtein = false;
    const current = beginnings.findLastIndex(value => time >= value);
    if (current !== stage) setStage(current);
    changed = true;
  }

  function renderSelection() {
    for (const b of seq.children) b.setAttribute('aria-pressed', String(Number(b.dataset.base) === selected));
    controls.replaceChildren();
    const active = dna[selected];
    if (!active) return;
    controls.append(node('span', { className: 'pill' }, 'Base ' + (selected + 1) + ' · ' + active.base));
    for (const candidate of ['A', 'T', 'C', 'G']) {
      controls.append(button(candidate, () => mutation(candidate), {
        title: 'Substituir por ' + candidate, 'aria-label': 'Substituir por ' + candidate, disabled: candidate === active.base
      }));
    }
    controls.append(button('Deletar', () => mutation(null), { className: 'danger', disabled: dna.length <= 1 }));
  }

  function renderSequence() {
    computeMutationDiff();
    seq.replaceChildren(...dna.map(({ base, index }, i) => {
      const isDiff = base !== reference[index] || i !== index;
      return node('button', {
        type: 'button',
        className: isDiff ? 'mutated' : '',
        style: 'color:' + baseColors[base],
        'data-base': i,
        'aria-pressed': String(i === selected),
        'aria-label': 'Base ' + (i + 1) + ', ' + base + (isDiff ? ', alterada' : ''),
        onClick: () => { selected = i; renderSelection(); audio.play('click'); }
      }, base);
    }));
    renderSelection();
    const [kind, detail] = classify(sequence);
    const badgeClass = kind === 'Nonsense' || kind === 'Frameshift' ? 'pill danger' :
      kind === 'Sequência de referência' || kind === 'Mutação silenciosa' ? 'pill' : 'pill warn';
    mutationText.replaceChildren(
      node('div', { className: 'card' },
        node('p', { className: badgeClass, style: 'margin-bottom:.42rem' }, kind.toUpperCase()),
        node('p', {}, detail))
    );
    dataReadout.replaceChildren(
      node('p', {}, node('b', {}, 'RNAm 5′ → 3′ '), result.rna),
      node('p', {}, node('b', {}, 'Proteína '), result.protein.map(letter => `${amino3[letter]} (${aminoNames[letter]})`).join(' · ') || 'Sem tradução'),
      node('p', {}, result.start < 0 ? 'AUG ausente' : result.stop < 0 ? 'Sem códon de parada no trecho' :
        'Término em ' + result.rna.slice(result.stop, result.stop + 3)));
    codonRows.replaceChildren(...result.entries.map(({ index, codon, amino }, rowIdx) => {
      const origEntry = originalRef.entries[rowIdx];
      const isAltered = sequence !== reference && (!origEntry || origEntry.codon !== codon || origEntry.amino !== amino);
      return node('tr', { className: isAltered ? 'mutated-row' : '' },
        node('td', {}, String(index + 1)),
        node('td', {}, codon),
        node('td', {}, `${amino3[amino]} · ${aminoNames[amino]}`));
    }));
    lastCodon = -2;
  }

  function mutation(value) {
    lastMutatedIndex = selected;
    mutationFlash = 1.0;
    if (value === null && dna.length > 1) {
      dna.splice(selected, 1);
      selected = Math.min(selected, dna.length - 1);
      lastMutatedIndex = selected;
    } else if (value) {
      dna[selected].base = value;
    }
    updateSequence();
    audio.play('mutate');
  }

  function updateSequence() {
    sequence = dna.map(item => item.base).join('');
    result = translate(sequence);
    renderSequence();
    previewProtein = true;
    playing = false;
    play.textContent = 'Reproduzir';
    if (stage !== 4) setStage(4);
    time = beginnings[4];
    timeBar.set(time);
    changed = true;
  }

  toolbar.append(
    play,
    timeBar.element,
    range('Velocidade', .5, 2, .25, 1, value => { speed = value; }, value => value.toLocaleString('pt-BR') + '×', { wheel: true }).element,
    button('Cena inteira', () => { audio.play('click'); engine.view([0, 4.6, 21.8], [0, .1, 0]); }),
    step
  );
  guide.append(
    stageTitle, stageText,
    legend([['#73e5bb', 'A'], ['#f39f9d', 'T (DNA)'], ['#75c5fa', 'C'], ['#f1cc80', 'G'], ['#d99aef', 'U (RNA)'], ['#4ed69d', 'Fita nova (replicação)']]),
    card('Nucleotídeos e tipos de RNA',
      'Um nucleotídeo tem Fosfato + Pentose (Desoxirribose no DNA; Ribose no RNA) + Base nitrogenada. Os 3 tipos principais de RNA são: RNAm (leva o código genético ao citoplasma), RNAt (transporta aminoácidos ao ribossomo) e RNAr (compõe os ribossomos com ação enzimática).'),
    card('Proteínas, aminoácidos e ligação peptídica',
      'Proteínas são cadeias formadas por 20 tipos de aminoácidos (cada um com grupo amina primária –NH₂, carboxila –COOH e radical variável –R). Na tradução, o RNAr 28S da subunidade 60S atua como ribozima (peptidil-transferase), formando a ligação peptídica com liberação de H₂O.'),
    node('details', {}, node('summary', {}, 'Geometria Molecular e Bibliografia (Alberts · Watson · Lehninger)'),
      card('B-DNA (Watson & Crick / Alberts)', 'Dupla-hélice dextrógira de 2,0 nm de diâmetro e passo de 3,4 nm (~10,5 pares de bases por volta), apresentando sulco maior e sulco menor. Purinas de anel duplo (A, G) pareiam sempre com pirimidinas de anel simples (T, C), mantendo largura constante.'),
      card('Fidelidade e Splicing (Lehninger)', 'O grampo deslizante PCNA aumenta a processividade da DNA polimerase, que corrige erros pela atividade exonucleásica 3′→5′ (~1 erro/10⁹ pb). No núcleo, o spliceossomo (snRNPs U1–U6) remove íntrons em laço antes da exportação pelo poro nuclear (NPC).')),
    heading('Lab de mutações e alelos'), referenceHelp, seq, controls, mutationText, dataReadout,
    node('table', { className: 'codon-table', 'aria-label': 'Códons traduzidos' },
      node('thead', {}, node('tr', {}, node('th', {}, 'Base'), node('th', {}, 'Códon'), node('th', {}, 'Aminoácido'))), codonRows),
    row(
      button('Restaurar DNA', () => {
        dna = [...reference].map((base, index) => ({ base, index }));
        selected = 0;
        lastMutatedIndex = -1;
        mutationFlash = 0;
        updateSequence();
        audio.play('click');
      }),
      button('Ver replicação', () => { previewProtein = false; seek(beginnings[1]); audio.play('click'); })
    ),
    note('Mutações em gametas (óvulo/espermatozoide) originam novos alelos transmissíveis aos descendentes.')
  );
  help.textContent = 'Arraste para orbitar · Use as etapas para ver Replicação, Transcrição e Tradução';

  const ray = new T.Raycaster();
  const pointer = new T.Vector2();
  const canvas = engine.renderer.domElement;
  const pickRoots = Array.from(models.interactives.values(), item => item.object);

  function pickAt(event) {
    const bounds = canvas.getBoundingClientRect();
    pointer.set((event.clientX - bounds.left) / bounds.width * 2 - 1, 1 - (event.clientY - bounds.top) / bounds.height * 2);
    ray.setFromCamera(pointer, engine.camera);
    for (const hit of ray.intersectObjects(pickRoots, true)) {
      let obj = hit.object;
      while (obj && !obj.userData.pickKey) obj = obj.parent;
      if (obj?.userData.pickKey) return obj.userData.pickKey;
    }
    return null;
  }

  let downPos = null;
  canvas.addEventListener('pointermove', event => {
    if (event.buttons) { hideTooltip(tooltip, viewport); return; }
    const key = pickAt(event);
    hoveredKey = key;
    if (key) {
      const info = models.interactives.get(key);
      showTooltip(tooltip, viewport, event.clientX, event.clientY, info.title, info.subtitle, info.color);
    } else {
      hideTooltip(tooltip, viewport);
    }
  }, { signal });
  canvas.addEventListener('pointerleave', () => { hoveredKey = null; hideTooltip(tooltip, viewport); }, { signal });
  canvas.addEventListener('pointerdown', event => { downPos = [event.clientX, event.clientY]; }, { signal });
  canvas.addEventListener('pointerup', event => {
    const orig = downPos;
    downPos = null;
    if (!orig || Math.hypot(orig[0] - event.clientX, orig[1] - event.clientY) > 7) return;
    const key = pickAt(event);
    if (key) {
      const info = models.interactives.get(key);
      previewProtein = false;
      seek(beginnings[info.stageIndex]);
      audio.play('click');
    }
  }, { signal });

  renderSequence();
  setStage(0, true);

  function evalStrandPoint(idxFloat, strand, enzymeAt, out) {
    const a = idxFloat * .57 + strand * Math.PI;
    const x = -8.05 + idxFloat * .194;
    if (stage === 1) {
      // Semiconservative replication fork: everything left of helicase splits smoothly into two diverging forks!
      const behind = Math.max(0, enzymeAt - idxFloat);
      const split = Math.min(1, behind / 3.8);
      const easeSplit = split * split * (3 - 2 * split);
      const forkY = (strand === 0 ? 1.12 : -1.12) * easeSplit;
      const helixR = 0.68 - easeSplit * 0.28;
      out.set(x, forkY + Math.cos(a) * helixR, Math.sin(a) * helixR + .63);
      return easeSplit;
    }
    const dist = idxFloat - enzymeAt;
    const open = stage === 2 ? Math.exp(-(dist * dist) / 7.2) : 0;
    const spread = .68 + open * .56;
    out.set(x, Math.cos(a) * spread + (strand ? -.42 : .42) * open, Math.sin(a) * spread + .63);
    return open;
  }

  function drawDNA(progress) {
    const index = spliceAt();
    const inserted = [...intron].map(base => base === 'U' ? 'T' : base).join('');
    const genomic = sequence.slice(0, index) + inserted + sequence.slice(index);
    const length = genomic.length;
    const enzymeAt = Math.max(0, Math.min(length - 1, progress * length));
    const dnaVisible = stage <= 2;

    models.polymerase.visible = stage === 2;
    models.polymerase.position.set(-8.05 + enzymeAt * .194, .02 + Math.sin(clock * 2.8) * 0.02, .63);
    models.polymerase.rotation.z = Math.sin(clock * 1.9) * 0.03;

    // Helicase & twin DNA polymerases seated DEAD-CENTER on the DNA strands (z = 0.63, zero offset/clipping!)
    const isRep = stage === 1;
    models.helicase.visible = isRep;
    models.dnaPols[0].visible = isRep;
    models.dnaPols[1].visible = isRep;
    heliSparks.visible = isRep;
    const okChunk = 5;
    const okBlock = Math.floor(Math.max(0, enzymeAt - 1.6) / okChunk);
    const okPhase = (Math.max(0, enzymeAt - 1.6) % okChunk) / okChunk;
    const lagHead = okBlock * okChunk + (1 - okPhase) * okChunk;
    if (isRep) {
      const hx = -8.05 + enzymeAt * .194;
      models.helicase.position.set(hx, 0, .63);
      models.helicase.rotation.x = clock * 4.2;
      // Golden H-bond cleavage sparks flying off the unzipping helicase fork!
      for (let k = 0; k < 8; k++) {
        const sp = (clock * 1.8 + k / 8) % 1;
        const ang = k * 0.785 + clock * 2.2;
        const rad = 0.24 + sp * 0.34;
        putHeliSpark(k, hx - sp * 0.22, Math.cos(ang) * rad, 0.63 + Math.sin(ang) * rad, Math.sin(sp * Math.PI) * 1.15);
      }
      heliSparks.instanceMatrix.needsUpdate = true;

      const leadPolX = -8.05 + Math.max(0, enzymeAt - 2.0) * .194;
      const lagPolX = -8.05 + Math.max(0, Math.min(enzymeAt - 1.8, lagHead)) * .194;
      models.dnaPols[0].position.set(leadPolX, 1.12, 0.63);
      models.dnaPols[1].position.set(lagPolX, -1.12, 0.63);
    }

    const batchSet = [dnaBackbone, backboneBeads, stems, pairs];
    const repBatchSet = [newBackbone, newBeads, newStems, newPairs];
    if (!dnaVisible) {
      for (const batch of [...batchSet, ...repBatchSet]) batch.count = 0;
      dnaPulseRing.visible = false;
      return;
    }

    let pairCount = 0, spineCount = 0;
    let newBeadCount = 0, newSpineCount = 0, newStemCount = 0, newPairCount = 0;
    const mutatedGenomicIdx = mutationInfo.targetBase >= 0
      ? (mutationInfo.targetBase >= index ? mutationInfo.targetBase + inserted.length : mutationInfo.targetBase) : -1;

    for (let i = 0; i < length; i++) {
      const base = genomic[i];
      const isIntron = i >= index && i < index + inserted.length;
      const isMutBase = i === mutatedGenomicIdx && sequence !== reference;
      let openVal = 0;

      for (let strand = 0; strand < 2; strand++) {
        const out = helix[i][strand];
        const mid = helix[i][strand + 2];
        openVal = evalStrandPoint(i, strand, enzymeAt, out);

        const strandBase = strand ? complements[base] : base;
        if (isRep && openVal > 0.35) {
          const forkCenterY = strand === 0 ? 1.12 * openVal : -1.12 * openVal;
          const a = i * .57 + (strand + 1) * Math.PI;
          const r = 0.68 - openVal * 0.28;
          const dPos = daughterPos[i][strand];
          dPos.set(out.x, forkCenterY + Math.cos(a) * r, Math.sin(a) * r + .63);
          mid.copy(out).lerp(dPos, 0.45);

          // Upper strand (0) = Leading continuous; Lower strand (1) = Lagging Okazaki fragments (synthesizing away from fork!)
          const isSynth = strand === 0
            ? i < enzymeAt - 1.6
            : (i < okBlock * okChunk || (i >= lagHead && i < (okBlock + 1) * okChunk && i < enzymeAt - 1.6));
          const prevSynth = strand === 0
            ? (i - 1) < enzymeAt - 1.6
            : ((i - 1) < okBlock * okChunk || ((i - 1) >= lagHead && (i - 1) < (okBlock + 1) * okChunk && (i - 1) < enzymeAt - 1.6));
          // Show distinct Okazaki nick between completed fragments and the newest fragment until ligated
          const isOkazakiGap = strand === 1 && i === okBlock * okChunk && okPhase < 0.82;

          if (isSynth) {
            putNewBead(newBeadCount++, dPos.x, dPos.y, dPos.z, 1);
            repMid.copy(dPos).lerp(out, 0.45);
            bond(newStems, newStemCount, dPos, repMid);
            newStems.setColorAt(newStemCount++, baseTints[complements[strandBase]]);
            bond(newPairs, newPairCount++, mid, repMid);
            if (i > 0 && prevSynth && !isOkazakiGap && evalStrandPoint(i - 1, strand, enzymeAt, subA) > 0.35) {
              bond(newBackbone, newSpineCount++, daughterPos[i - 1][strand], dPos);
            }
          }
        } else {
          const reach = openVal > 0.25 ? 0.42 : (purines.has(strandBase) ? 0.77 : 0.65);
          mid.copy(out).lerp(tips[strand].set(out.x, strand ? -.19 : .19, .63), reach);
        }

        const beadScale = isMutBase ? 1.25 + Math.sin(clock * 7) * 0.14 : 1;
        putBackbone(i * 2 + strand, out.x, out.y, out.z, beadScale);
        bond(stems, i * 2 + strand, out, mid);
        stems.setColorAt(i * 2 + strand, isIntron ? intronTint : (isMutBase && mutationFlash > 0.15 ? mutHighlightTint : baseTints[strandBase]));

        if (i > 0) {
          for (let s = 0; s < SUB; s++) {
            evalStrandPoint(i - 1 + s / SUB, strand, enzymeAt, subA);
            evalStrandPoint(i - 1 + (s + 1) / SUB, strand, enzymeAt, subB);
            bond(dnaBackbone, spineCount++, subA, subB);
          }
        }
      }

      if (openVal < .34) {
        const count = base === 'A' || base === 'T' ? 2 : 3;
        for (let j = 0; j < count; j++) {
          const from = (j + .14) / count;
          const to = (j + .72) / count;
          tips[0].copy(helix[i][2]).lerp(helix[i][3], from);
          tips[1].copy(helix[i][2]).lerp(helix[i][3], to);
          bond(pairs, pairCount++, tips[0], tips[1]);
        }
      }

      if (isMutBase) {
        dnaPulseRing.visible = true;
        dnaPulseRing.position.copy(helix[i][0]).lerp(helix[i][1], 0.5);
        const pulse = 0.85 + 0.35 * Math.sin(clock * 6.5) + mutationFlash * 0.6;
        dnaPulseRing.scale.setScalar(pulse);
        dnaPulseRing.material.opacity = Math.min(1, 0.55 + mutationFlash * 0.45);
      }
    }
    if (mutatedGenomicIdx < 0 || sequence === reference) dnaPulseRing.visible = false;

    dnaBackbone.count = spineCount;
    backboneBeads.count = stems.count = length * 2;
    pairs.count = pairCount;
    newBackbone.count = newSpineCount;
    newBeads.count = newBeadCount;
    newStems.count = newStemCount;
    newPairs.count = newPairCount;

    for (const batch of [...batchSet, ...repBatchSet]) batch.instanceMatrix.needsUpdate = true;
    stems.instanceColor.needsUpdate = true;
    if (newStems.instanceColor) newStems.instanceColor.needsUpdate = true;
  }

  const smoother = x => {
    const c = Math.max(0, Math.min(1, x));
    return c * c * c * (c * (c * 6 - 15) + 10);
  };

  function drawRNA(progress, transState) {
    const split = spliceAt();
    const before = stage <= 2 || (stage === 3 && progress < .43);
    const shown = before ? result.rna.slice(0, split) + intron + result.rna.slice(split) : result.rna;
    const size = stage < 2 ? 0 : stage === 2 ? Math.floor(progress * shown.length) : shown.length;
    const shift = stage === 3 ? smoother((progress - .38) / .62) : 0;

    // Exact 1:1 mRNA codon alignment inside Ribosome decoding channel (world y = -0.44, z = 0.96; 0.22/base -> 0.66/codon!)
    // Center base of P-site codon sits at world x = 4.68 (ribosome local x = 0.00)!
    const activeCodon = transState.active;
    const transloc = transState.transloc;
    const pCodonStart = activeCodon <= 0
      ? Math.max(0, result.start)
      : (result.entries[activeCodon - 1]?.index ?? Math.max(0, result.start));
    const pCenterFloat = pCodonStart + 1 + (activeCodon > 0 ? 3 * transloc : 0);
    const activeBaseStart = result.entries[activeCodon]?.index ?? Math.max(0, result.start);

    rnaBeads.count = size;
    rnaLinks.count = Math.max(0, size - 1);
    let uCount = 0;

    const showCodonHighlight = !before && sequence !== reference && mutationInfo.affectedCodonStart >= 0 && stage >= 3;
    rnaCodonHalo.visible = showCodonHighlight;
    let haloRingIdx = 0;

    for (let i = 0; i < size; i++) {
      const point = transcript[i];
      const base = shown[i];
      const isIntron = before && i >= split && i < split + intron.length;
      const spliceCurve = isIntron && stage === 3 ? Math.sin((i - split + 1) / (intron.length + 1) * Math.PI) *
        Math.min(1.55, progress * 3.7) : 0;

      if (stage === 2) {
        // Nascent 5'->3' pre-mRNA exits cleanly from the lower-left hollow RNA exit pore of RNA Pol II (z = 0.63 -> 0.88)
        const lead = Math.min(shown.length - 1, progress * shown.length);
        const trailing = lead - i;
        const exitBlend = 1 - Math.exp(-trailing * 0.38);
        point.set(
          -8.05 + lead * .194 - trailing * .168,
          -.22 - .56 * exitBlend + Math.sin(i * .42 - clock * 2.2) * .055 * exitBlend,
          .63 + .24 * exitBlend + .012 * trailing
        );
      } else if (stage === 3) {
        // Mature mRNA glides DEAD-CENTER through the hollow open Nuclear Pore Complex bore (y = -0.23, z = 0.66)!
        const wave = Math.sin(i * .46 - clock * 2.6 + progress * 2.4) * (isIntron ? 0.08 : 0.055);
        point.set(-5.23 + i * .16 + 6.35 * shift, -.23 + wave + spliceCurve, .66);
      } else {
        // Stage 4: mRNA runs flat and taut inside the 40S decoding groove (world y = -0.44, z = 0.96), exact 0.22 spacing!
        const localX = (i - pCenterFloat) * 0.22;
        const outsideRib = Math.max(0, Math.abs(localX) - 1.25);
        const gentleWave = Math.sin(i * .5 - clock * 2.0) * Math.min(0.06, outsideRib * 0.04);
        point.set(4.68 + localX, -0.44 + gentleWave, 0.96);
      }

      const isActiveCodon = stage === 4 && i >= activeBaseStart && i < activeBaseStart + 3 && activeCodon >= 0;
      const isUracil = !isIntron && base === 'U';
      const isInMutCodon = showCodonHighlight && i >= mutationInfo.affectedCodonStart && i < mutationInfo.affectedCodonStart + 3;

      const scale = isActiveCodon ? 1.24 : isInMutCodon ? 1.2 + Math.sin(clock * 6) * 0.1 : isUracil ? 1.1 : 1;
      putRNA(i, point.x, point.y, point.z, scale);
      rnaBeads.setColorAt(i, isIntron ? intronTint : baseTints[base]);

      if (isUracil) putUracil(uCount++, point.x, point.y, point.z, 1 + Math.sin(clock * 4 + i) * 0.08);

      if (isInMutCodon && haloRingIdx < 3) {
        const ring = rnaCodonRings[haloRingIdx++];
        ring.position.copy(point);
        const pScale = 1.05 + Math.sin(clock * 7 + haloRingIdx) * 0.14 + mutationFlash * 0.55;
        ring.scale.setScalar(pScale);
        ring.material.color.set(mutationInfo.isSilent ? '#58c99a' : '#ffbe55');
        ring.material.emissive.set(mutationInfo.isSilent ? '#58c99a' : '#ff9a3c');
      }

      if (i) bond(rnaLinks, i - 1, transcript[i - 1], point);
    }

    uracilHalos.count = uCount;
    // Animate the hollow Spliceosome ring cleanly encircling the intron lariat base in Stage 3!
    const spliceOn = stage === 3 && progress > 0.04 && progress < 0.48;
    models.spliceosome.visible = spliceOn;
    if (spliceOn && size > split) {
      const midIdx = Math.min(size - 1, split + Math.floor(intron.length * 0.5));
      const spPos = transcript[midIdx];
      models.spliceosome.position.set(spPos.x, spPos.y - 0.18, spPos.z);
      models.spliceosome.rotation.z = clock * 0.75;
      models.spliceosome.scale.setScalar(0.88 + Math.sin(Math.min(1, progress / 0.46) * Math.PI) * 0.2);
    }
    cap.visible = stage >= 3 && size > 0;
    tail.count = cap.visible && !before ? 5 : 0;
    if (cap.visible) cap.position.copy(transcript[0]).add(tips[0].set(-.16, .01, 0));
    for (let i = 0; i < tail.count; i++) {
      const end = transcript[size - 1];
      putTail(i, end.x + .12 + i * .09, end.y + Math.sin(i * .7 + clock * 2) * .04, end.z);
    }
    for (const batch of [rnaBeads, rnaLinks, uracilHalos, tail]) batch.instanceMatrix.needsUpdate = true;
    if (rnaBeads.instanceColor) rnaBeads.instanceColor.needsUpdate = true;
  }

  // Smooth deterministic polypeptide path:
  //   0 <= s <= 3.0: strictly straight UP inside the HOLLOW 60S Exit Tunnel (world x = 4.68, z = 0.96, y = 0.46 -> 1.24)!
  //   s > 3.0: emerges cleanly above the 60S tunnel rim into a stable, non-jumping α-helical fold!
  function evalPeptidePos(s, attachX, releaseDrift, out) {
    const baseY = 0.46; // ribosome y (-0.28) + tRNA top cargo (0.74) = exact peptidyl-transferase center!
    if (s <= 0) {
      out.set(4.68 + attachX, baseY + releaseDrift * 0.34, 0.96);
      return out;
    }
    if (s <= 3.0) {
      // Smooth entry from PTC into vertical hollow tunnel bore (zero clipping through 60S wall!)
      const entryPull = Math.exp(-s * 1.85);
      out.set(4.68 + attachX * entryPull, baseY + s * 0.275 + releaseDrift * 0.34, 0.96);
      return out;
    }
    // Emerged above hollow 60S exit tunnel rim (y > 1.28): stable stationary α-helical fold!
    const above = s - 3.0;
    const rad = Math.min(0.28, above * 0.095);
    const ang = above * 1.45;
    out.set(
      4.68 + Math.sin(ang) * rad - Math.min(0.62, above * 0.09),
      baseY + 3.0 * 0.275 + above * 0.235 + releaseDrift * 0.34,
      0.96 + Math.cos(ang) * rad * 0.72
    );
    return out;
  }

  function drawTranslation(progress) {
    const stepCount = result.entries.length;
    const moving = stage === 4 && stepCount > 0;
    const active = moving ? Math.min(stepCount - 1, Math.floor(progress * stepCount)) : -1;
    const cycle = moving ? Math.min(1, progress * stepCount - active) : 0;
    const current = result.entries[active];
    const ending = current?.amino === '*';
    const activeVisual = active >= 0;

    // 4-phase elongation timing:
    //   0.00 -> 0.34: Codon recognition (aminoacyl-tRNA docks into A-site, or initiator Met-tRNA into P-site when active=0)
    //   0.34 -> 0.58: Peptide bond formation at PTC (chain links onto new amino acid + H2O released!)
    //   0.58 -> 0.88: Translocation (mRNA + tRNAs glide smoothly left -0.66; peptide advances +1 up hollow 60S tunnel!)
    //   0.88 -> 1.00: Empty tRNA exits cleanly from E-site!
    const bondFormed = active === 0 ? cycle >= 0.34 : cycle >= 0.44;
    const transloc = active > 0 && !ending ? smoother((cycle - 0.58) / 0.30) : 0;
    const built = stage !== 4 ? 0 : previewProtein ? result.protein.length :
      Math.min(result.protein.length, Math.max(0, active) + Number(!ending && bondFormed));

    models.releaseFactor.visible = activeVisual && ending && cycle > .14;
    models.releaseLabel.enabled = models.releaseFactor.visible;
    if (models.releaseFactor.visible) {
      const dock = smoother((cycle - 0.14) / 0.3);
      models.releaseFactor.position.set(0.66 + (1 - dock) * 0.55, 0.16 + (1 - dock) * 0.75, 0.52);
    }

    // H2O droplet emerging cleanly right at the Peptidyl-Transferase Center when peptide bond forms!
    const showH2O = activeVisual && !ending && active > 0 && cycle > 0.44 && cycle < 0.88;
    models.waterRelease.visible = showH2O;
    models.waterLabel.enabled = showH2O;
    if (showH2O) {
      const u = (cycle - 0.44) / 0.44;
      models.waterRelease.position.set(0.32 + u * 0.76, 0.74 + Math.sin(u * Math.PI) * 0.36, 0.72 + u * 0.22);
      models.waterRelease.scale.setScalar(Math.sin(u * Math.PI) * 1.05 + 0.35);
    }

    // Exact 1:1 tRNA docking, base-pairing & translocation across A (+0.66) -> P (0.00) -> E (-0.66) at z_local = 0.52!
    models.tRNAs.forEach(({ root, cargo, tips: codonTips, hBonds }, index) => {
      const target = result.entries[active - index];
      // tRNA[0]: incoming codon (P-site if active=0, A-site->P-site if active>0)
      // tRNA[1]: P-site -> E-site (previous codon active-1)
      // tRNA[2]: departing from E-site at start of cycle (codon active-2)
      const isDepartOld = index === 2;
      root.visible = activeVisual && Boolean(target) && target.amino !== '*'
        && !(isDepartOld && cycle > 0.36);
      if (!root.visible) return;

      const isInit = active === 0 && index === 0;
      let paired = false;

      if (isInit) {
        // Initiator Met-tRNAi enters directly into P-site (0.00) pairing with AUG!
        const arrive = smoother(cycle / 0.34);
        const inv = 1 - arrive;
        root.position.set(inv * 0.55, -0.02 + inv * 0.92, 0.52 + inv * 0.18);
        root.rotation.z = -inv * 0.32;
        paired = cycle >= 0.30;
        cargo.visible = !bondFormed;
      } else if (index === 0) {
        // Incoming aminoacyl-tRNA docks at A-site (+0.66), pairs with codon, accepts chain, then translocates -> P-site (0.00)!
        if (cycle < 0.34) {
          const arrive = smoother(cycle / 0.34);
          const inv = 1 - arrive;
          root.position.set(0.66 + inv * 0.85, -0.02 + inv * 0.95, 0.52 + inv * 0.18);
          root.rotation.z = -inv * 0.38;
          paired = cycle > 0.28;
        } else {
          root.position.set(0.66 * (1 - transloc), -0.02, 0.52);
          root.rotation.z = 0;
          paired = true;
        }
        cargo.visible = !bondFormed;
      } else if (index === 1) {
        // Previous peptidyl-tRNA sits at P-site (0.00), hands off chain, translocates -> E-site (-0.66), then lifts off!
        const liftOut = cycle > 0.88 ? smoother((cycle - 0.88) / 0.12) : 0;
        root.position.set(-0.66 * transloc - liftOut * 0.45, -0.02 + liftOut * 0.52, 0.52 + liftOut * 0.14);
        root.rotation.z = liftOut * 0.34;
        paired = cycle < 0.88;
        cargo.visible = false;
      } else {
        // Previously deacylated tRNA finishing departure from E-site (-0.66) into cytosol
        const depart = smoother(cycle / 0.36);
        root.position.set(-0.66 - 0.45 - depart * 0.72, 0.50 + depart * 0.65, 0.66 + depart * 0.15);
        root.rotation.z = 0.34 + depart * 0.32;
        paired = false;
        cargo.visible = false;
      }

      if (cargo.visible && target.amino) {
        const tintIdx = target.amino.charCodeAt(0) % aminoTints.length;
        cargo.material.color.copy(aminoTints[tintIdx]);
        cargo.material.emissive.copy(aminoTints[tintIdx]);
      }
      codonTips.forEach((part, i) => {
        const base = { U: 'A', A: 'U', G: 'C', C: 'G' }[target.codon[i]];
        part.material.color.copy(baseTints[base]);
      });
      for (const hb of hBonds) hb.visible = paired;
    });

    aminoBeads.count = built;
    peptideLinks.count = Math.max(0, built - 1);
    let mutRingCount = 0;
    for (let i = 0; i < capacity; i++) aminoSprites[i].visible = false;

    // Continuous smooth chain elevation inside the hollow 60S exit tunnel!
    const releaseDrift = (ending && cycle > 0.52) ? smoother((cycle - 0.52) / 0.48) : 0;
    // Where the C-terminal residue attaches right now:
    //   - Before peptide transfer: P-site tRNA (attachX = 0)
    //   - Right after peptide transfer (0.44..0.58): bonded to A-site tRNA (attachX = +0.66)
    //   - During translocation (0.58..0.88): glides smoothly back to P-site (attachX = +0.66 -> 0.00)!
    const chainAttachX = (previewProtein || active <= 0 || ending || !bondFormed) ? 0 : 0.66 * (1 - transloc);
    const chainTipProgress = previewProtein
      ? Math.max(0, built - 1)
      : (active <= 0 ? 0 : (bondFormed ? (active - 1 + transloc) : Math.max(0, active - 1)));

    for (let i = 0; i < built; i++) {
      const p = peptide[i];
      // Residue i=0 (Met) is oldest (highest s); residue i=built-1 is newest (at PTC / tunnel entry)!
      const s = (previewProtein || ending)
        ? (built - 1 - i)
        : (i === built - 1 && bondFormed && active > 0)
          ? 0
          : Math.max(0, chainTipProgress - i + (bondFormed && active > 0 ? 0.55 * (1 - transloc) + transloc : 0));
      evalPeptidePos(s, chainAttachX, releaseDrift, p);

      const letter = result.protein[i];
      const tintIdx = letter.charCodeAt(0) % aminoTints.length;
      const isAltered = mutationInfo.alteredProteinIndices.has(i);
      const scale = isAltered ? 1.18 + Math.sin(clock * 6.5 + i) * 0.08 : 1;
      putAA(i, p.x, p.y, p.z, scale);
      aminoBeads.setColorAt(i, aminoTints[tintIdx]);

      const spr = aminoSprites[i];
      spr.visible = true;
      spr.material.map = getAminoTex(letter, isAltered ? '#ffbe55' : aminoTintsHex[tintIdx]);
      spr.material.needsUpdate = true;
      spr.position.set(p.x + (i % 2 === 0 ? 0.36 : -0.36), p.y + 0.05, p.z + 0.16);

      if (isAltered) {
        const ringPulse = 1.0 + Math.sin(clock * 7 + i * 0.7) * 0.14 + mutationFlash * 0.45;
        putMutRing(mutRingCount++, p.x, p.y, p.z, ringPulse);
      }
      if (i) bond(peptideLinks, i - 1, peptide[i - 1], p);
    }

    const showNonsense = stage === 4 && mutationInfo.isNonsense && built > 0;
    nonsenseMarker.visible = showNonsense;
    nonsenseLabel.enabled = showNonsense;
    if (showNonsense) {
      const tipPos = peptide[built - 1];
      nonsenseMarker.position.set(tipPos.x, tipPos.y + 0.34, tipPos.z);
      nonsenseMarker.rotation.y = clock * 1.4;
      nonsenseMarker.scale.setScalar(1 + Math.sin(clock * 7) * 0.1 + mutationFlash * 0.4);
    }

    proteinMutationRings.count = mutRingCount;
    proteinMutationRings.instanceMatrix.needsUpdate = true;
    aminoBeads.instanceMatrix.needsUpdate = peptideLinks.instanceMatrix.needsUpdate = true;
    if (aminoBeads.instanceColor) aminoBeads.instanceColor.needsUpdate = true;

    if (active !== lastCodon) {
      Array.from(codonRows.children).forEach((tr, i) => tr.classList.toggle('current', i === active));
      lastCodon = active;
    }
    return { active, transloc };
  }

  return {
    update(dt) {
      clock += dt;
      bioEnv.update(clock);
      if (mutationFlash > 0) mutationFlash = Math.max(0, mutationFlash - dt * 1.6);

      const hoverBlend = 1 - Math.exp(-dt * 10);
      for (const [key, item] of models.interactives) {
        const isHov = key === hoveredKey;
        item.object.traverse(child => {
          const mat = child.material;
          if (!mat || !mat.isMeshStandardMaterial) return;
          if (mat.userData.baseEm === undefined) {
            mat.userData.baseEm = mat.emissive.clone();
            mat.userData.baseEmInt = mat.emissiveIntensity;
          }
          if (isHov) {
            mat.emissive.lerp(mat.color, hoverBlend);
            mat.emissiveIntensity += ((mat.userData.baseEmInt + 0.32) - mat.emissiveIntensity) * hoverBlend;
          } else {
            mat.emissive.lerp(mat.userData.baseEm, hoverBlend);
            mat.emissiveIntensity += (mat.userData.baseEmInt - mat.emissiveIntensity) * hoverBlend;
          }
        });
      }

      if (playing) {
        if (previewProtein) previewProtein = false;
        seek(time + dt * speed);
        if (time >= total) { playing = false; play.textContent = 'Reproduzir'; }
      }

      changed = false;
      const progress = Math.max(0, Math.min(1, (time - beginnings[stage]) / stages[stage].duration));
      const activeCodon = drawTranslation(progress);
      drawDNA(progress);
      drawRNA(progress, activeCodon);
    },
    dispose() {
      for (const tex of aminoTextures.values()) tex.dispose();
      aminoTextures.clear();
    }
  };
}
