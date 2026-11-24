import * as T from 'three';
import {
  v, group, mesh, box, sphere, cylinder, torus, rod, tube, curve,
  material, glow, instances, instanceUpdater,
  membraneMaterial, gelMaterial, proteinMaterial, organelleMaterial, organicDisplace, textures
} from '../core/geometry.js';
import { buildBioEnvironment } from './bioEnvironment3d.js?v=20';
import { node, select, range, button, toggle, heading, card, legend, metric, note, row, formatNumber, showTooltip, hideTooltip } from '../core/ui.js?v=9';

const tau = Math.PI * 2;
const innerMemY = x => 0.28 + 0.13 * Math.sin(x * 1.12);
const innerMemZ = x => 0.78 + 0.16 * Math.cos(x * 0.72);
const thylaMemY = x => 0.04 * Math.sin(x * 1.15);

// Exact curved mitochondrial outer/inner boundary clamps so ZERO H+ particles or IMS haze ever leak outside!
const MITO_CX = 2.18, MITO_CY = -0.12;
const mitoOuterTopY = x => {
  const u = (x - MITO_CX) / 5.14;
  return u * u >= 1 ? MITO_CY : MITO_CY + 2.40 * Math.sqrt(1 - u * u);
};
const mitoOuterBotY = x => {
  const u = (x - MITO_CX) / 4.82;
  return u * u >= 1 ? -0.10 : -0.10 - 2.02 * Math.sqrt(1 - u * u);
};

// Builds a curved crescent strip strictly inside the mitochondrion between yBottom(x) and yTop(x) with left-to-right color ramp!
function buildCurvedBand(xMin, xMax, yBottomFn, yTopFn, zFn, colLeftHex, colRightHex, steps = 38) {
  const positions = [];
  const colors = [];
  const indices = [];
  const cL = new T.Color(colLeftHex);
  const cR = new T.Color(colRightHex);
  const cCur = new T.Color();
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = xMin + (xMax - xMin) * t;
    const y0 = yBottomFn(x);
    const y1 = Math.max(y0 + 0.04, yTopFn(x));
    const z = zFn(x);
    // Smooth horizontal edge taper + stronger intensity toward the right/final end!
    const endFade = Math.sin(Math.min(1, t * 5.5) * Math.PI * 0.5) * Math.sin(Math.min(1, (1 - t) * 5.5) * Math.PI * 0.5);
    const ramp = Math.pow(t, 1.25) * endFade;
    cCur.copy(cL).lerp(cR, ramp);
    positions.push(x, y0, z, x, y1, z);
    colors.push(cCur.r, cCur.g, cCur.b, cCur.r * 0.72, cCur.g * 0.78, cCur.b * 0.85);
    if (i < steps) {
      const a = i * 2, b = a + 1, c = a + 2, d = a + 3;
      indices.push(a, c, b, b, c, d);
    }
  }
  const geo = new T.BufferGeometry();
  geo.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
  geo.setAttribute('color', new T.Float32BufferAttribute(colors, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

// Truly HOLLOW open-ended transmembrane barrel/channel (LatheGeometry with outer wall + inner clear lumen!)
function hollowBarrel(parent, mat, outerR, innerR, height, x = 0, y = 0, z = 0, segs = 20) {
  const hh = height * 0.5;
  const pts = [
    new T.Vector2(innerR, -hh),
    new T.Vector2(outerR, -hh),
    new T.Vector2(outerR * 1.06, -hh * 0.55),
    new T.Vector2(outerR * 0.94, 0),
    new T.Vector2(outerR * 1.06, hh * 0.55),
    new T.Vector2(outerR, hh),
    new T.Vector2(innerR, hh),
    new T.Vector2(innerR, -hh)
  ];
  const geo = new T.LatheGeometry(pts, segs);
  geo.computeVertexNormals();
  const m = mesh(parent, geo, mat, x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  // Dark shadowed inner open bore sleeve so the hollow lumen reads unmistakably!
  const bore = new T.CylinderGeometry(innerR * 0.98, innerR * 0.98, height * 0.98, segs, 1, true);
  const boreMat = new T.MeshBasicMaterial({ color: '#06111a', side: T.BackSide });
  const bm = new T.Mesh(bore, boreMat);
  bm.position.set(x, y, z);
  parent.add(bm);
  return m;
}
const modes = {
  aerobic: 'Catabolismo · Respiração aeróbica',
  lactate: 'Catabolismo · Fermentação lática',
  alcohol: 'Catabolismo · Fermentação alcoólica',
  photosynthesis: 'Anabolismo · Fotossíntese (Cloroplasto)'
};
// Aerobic camera + interactive gradient progression stages:
// [title, eye, target, gradStageKey, stageDescription]
// Physiological rigor: in a living cell, the intermembrane space (EIM) is ALWAYS maintained at a higher [H+]
// (lower pH) than the mitochondrial matrix — the matrix is never more concentrated than the EIM under normal conditions!
const stages = [
  ['Visão geral', [0.9, 4.2, 19.6], [.05, .15, 0], 'full',
    'CATABOLISMO (C₆H₁₂O₆ + 6 O₂ → 6 CO₂ + 6 H₂O + ~30–32 ATP). A cadeia respiratória cria e mantém um acúmulo (maior concentração) de H⁺ no espaço intermembranar (em cima, pH ~6,8) em relação à matriz mitocondrial (embaixo, pH ~7,8), onde há H⁺ basais alimentando as bombas e a redução do O₂.'],
  ['1. Glicólise', [-5.0, 2.0, 7.6], [-5.1, -.15, .6], 'full',
    'Etapa 1 — Glicólise (citosol, anaeróbica): a glicose (6C) é quebrada em 2 piruvatos (3C), com saldo de 2 ATP e 2 NADH. Os piruvatos cruzam a membrana externa pela porina oca VDAC e a interna pelo carreador MPC até a matriz mitocondrial.'],
  ['2. Ciclo de Krebs', [1.45, -.35, 6.5], [.02, -1.25, .8], 'full',
    'Etapa 2 — Ciclo de Krebs (matriz mitocondrial): o Acetil-CoA é oxidado liberando CO₂, 2 ATP/GTP e carregando coenzimas reduzidas (NADH e FADH₂) na própria matriz — que alimentam os Complexos I e II.'],
  ['3. Base · EIM > Matriz', [2.1, 1.35, 9.6], [2.1, -0.05, 0.78], 'basal_grad',
    'Etapa 3 — Estado fisiológico basal: na célula viva, o espaço intermembranar (em cima, pH ~7,1) JÁ é mantido mais concentrado em H⁺ do que a matriz (embaixo, pH ~7,6) — a matriz nunca fica mais concentrada que o EIM em condições normais. Os H⁺ presentes na matriz alimentam continuamente o bombeamento.'],
  ['4. Bombeamento I→III→IV', [1.55, 2.15, 8.8], [1.65, 0.45, 0.86], 'pumping',
    'Etapa 4 — Bombeamento ativo (Complexos I, III e IV): o fluxo de elétrons de NADH/FADH₂ bombeia H⁺ da matriz para o espaço intermembranar (4 H⁺ no I, 4 H⁺ no III e 2 H⁺ no IV). Isso cria/mantém um acúmulo (maior concentração) de H⁺ no espaço intermembranar em relação à matriz!'],
  ['5. Acúmulo no final (EIM)', [3.55, 2.05, 7.2], [3.65, 0.62, 0.92], 'peak_end',
    'Etapa 5 — Acúmulo máximo mantido no EIM: o bombeamento contínuo (I → III → IV), somado ao consumo de H⁺ na matriz em ½ O₂ + 2 H⁺ → H₂O, mantém a matriz alcalina (pH ~7,8, H⁺ basais) e concentra um denso acúmulo de H⁺ na extremidade final do espaço intermembranar (pH ~6,8), gerando força próton-motriz (~200 mV).'],
  ['6. Quimiosmose · ATP sintase', [5.55, 1.45, 5.4], [5.23, .08, 1.09], 'chemiosmosis',
    'Etapa 6 — Quimiosmose (retorno de H⁺ pela ATP sintase): os H⁺ acumulados em maior concentração no espaço intermembranar descem a favor do gradiente eletroquímico pelo canal oco F₀ de volta para a matriz, girando o rotor γ e sintetizando ATP em F₁ (~28 ATP na fosforilação oxidativa).']
];
const photoStages = [
  ['Visão geral', [0, 2.2, 16.2], [0.2, 0.1, 0.4]],
  ['Tilacoide · PSII / b₆f / PSI', [-1.62, 0.52, 7.25], [-1.72, -0.35, 1.35]],
  ['Canal CF₀ · ATP sintase', [0.55, 0.45, 5.2], [0.45, -0.22, 1.35]],
  ['Ciclo de Calvin', [3.25, 0.5, 7.4], [3.35, -0.15, 0.8]]
];
const complexes = [
  ['I', -1.65, '#8276e8', 'NADH desidrogenase', 'NADH reduz o Complexo I (NADH → NAD⁺ + e⁻), que transfere elétrons a Q e bombeia H⁺ da matriz para o espaço intermembranas.'],
  ['II', -.53, '#4fc4a6', 'Succinato desidrogenase', 'FADH₂ reduz o Complexo II (FADH₂ → FAD + e⁻), transferindo elétrons para Q sem bombear H⁺.'],
  ['Q', .53, '#ebb45b', 'Ubiquinona (coenzima Q)', 'Transportador lipossolúvel móvel na membrana interna que leva elétrons de I ou II até o Complexo III.'],
  ['III', 1.58, '#d474ab', 'Citocromo bc₁', 'Oxida QH₂, transfere elétrons ao citocromo c e bombeia prótons H⁺ para o espaço intermembranas.'],
  ['Cit. c', 2.61, '#f09a65', 'Citocromo c', 'Proteína heme móvel no espaço intermembranas que leva elétrons do Complexo III ao IV.'],
  ['IV', 3.62, '#53b0eb', 'Citocromo c oxidase (reduz O₂ → H₂O)', 'Recebe elétrons do citocromo c (centro Cu_A), reduz o O₂ a H₂O diretamente em seu sítio catalítico heme a₃/Cu_B na face da matriz (½ O₂ + 2 H⁺ + 2 e⁻ → H₂O) e bombeia 2 H⁺ para o espaço intermembranar. Bloqueado pelo cianeto.']
];

function buildCarrier(parent, key, color) {
  const mainMat = proteinMaterial(color, { roughness: 0.24, clearcoat: 0.86, iridescence: 0.22, bumpScale: 0.036 });
  const accentCol = new T.Color(color).lerp(new T.Color('#ffffff'), 0.28);
  const accentMat = proteinMaterial(accentCol, { emissive: color, emissiveIntensity: 0.24, roughness: 0.22, clearcoat: 0.92 });
  const redoxMat = glow('#ffe391', 0.78);
  const cast = obj => { obj.castShadow = true; obj.receiveShadow = true; return obj; };

  if (key === 'I') {
    // Classic L-shaped NADH dehydrogenase: transmembrane hollow H+ barrel + hydrophilic arm protruding DOWN into MATRIX (-Y)!
    hollowBarrel(parent, mainMat, 0.25, 0.11, 0.76, 0.04, 0.02, 0, 20);
    cast(sphere(parent, mainMat, 0.30, 0.19, 0.24, -0.22, -0.04, 0.02, 18));
    const armGeo = organicDisplace(new T.CylinderGeometry(0.18, 0.14, 0.68, 18), 0.045, 5, 2);
    const arm = cast(mesh(parent, armGeo, accentMat, -0.34, -0.44, 0.06));
    arm.rotation.z = 0.26;
    cast(sphere(parent, mainMat, 0.23, 0.21, 0.21, -0.44, -0.74, 0.08, 18));
    torus(parent, glow('#7cf0ff', 0.7), 0.14, 0.028, 0.04, 0.40, 0).rotation.x = Math.PI / 2;
    // Fe-S & FMN redox centers leading from matrix NADH binding site up to membrane Q site
    for (const [rx, ry, rz] of [[-0.42, -0.66, 0.22], [-0.34, -0.46, 0.22], [-0.22, -0.22, 0.22]]) {
      sphere(parent, redoxMat, 0.046, 0.046, 0.046, rx, ry, rz, 10);
    }
  } else if (key === 'II') {
    // Succinate dehydrogenase: anchored ONLY on the MATRIX (-Y) leaflet of inner membrane (never protrudes into IMS, pumps 0 H+!)
    cast(sphere(parent, mainMat, 0.24, 0.15, 0.22, 0, -0.14, 0.02, 18));
    cast(sphere(parent, accentMat, 0.23, 0.24, 0.21, 0.04, -0.40, 0.08, 18));
    cast(sphere(parent, mainMat, 0.18, 0.18, 0.18, -0.14, -0.48, 0.10, 16));
    sphere(parent, redoxMat, 0.05, 0.05, 0.05, 0.02, -0.40, 0.25, 10);
  } else if (key === 'Q') {
    // Lipophilic Ubiquinone seated INSIDE the hydrophobic lipid bilayer core (y = 0, z = 0.02)!
    const head = torus(parent, accentMat, 0.125, 0.044, 0, 0, 0.06);
    head.rotation.y = 0.35;
    sphere(parent, redoxMat, 0.05, 0.05, 0.05, 0, 0, 0.07, 10);
    tube(parent, mainMat, [v(0, -0.06, 0.06), v(0.11, -0.09, 0.02), v(0.22, 0.03, 0.04), v(0.32, -0.05, 0.0)], 0.026, false, 18, 7);
  } else if (key === 'III') {
    // Dimeric Cytochrome bc1 with central hollow H+ channel + heme b / Rieske Fe-S core!
    hollowBarrel(parent, mainMat, 0.24, 0.11, 0.84, 0, 0.02, 0, 20);
    for (const s of [-1, 1]) {
      cast(sphere(parent, accentMat, 0.19, 0.18, 0.19, s * 0.20, 0.42, 0.04, 16));
      cast(sphere(parent, mainMat, 0.19, 0.21, 0.20, s * 0.18, -0.36, 0.04, 16));
    }
    torus(parent, glow('#ff896b', 0.72), 0.08, 0.018, 0, 0.10, 0.25);
    sphere(parent, redoxMat, 0.052, 0.052, 0.052, 0, 0.10, 0.24, 10);
  } else if (key === 'Cit. c') {
    // Water-soluble peripheral heme protein strictly on the INTERMEMBRANE SPACE (+Y) surface!
    const glob = organicDisplace(new T.SphereGeometry(0.19, 20, 16), 0.055, 5, 11);
    cast(mesh(parent, glob, mainMat, 0, 0.56, 0.06));
    const heme = torus(parent, glow('#ff896b', 0.75), 0.095, 0.024, 0, 0.56, 0.23);
    heme.rotation.x = 0.25;
  } else if (key === 'IV') {
    // Cytochrome c oxidase: hollow H+ pumping channel + Cu_A (IMS) -> Heme a3/Cu_B catalytic O2 reduction site on MATRIX side (-Y)!
    hollowBarrel(parent, mainMat, 0.26, 0.11, 0.86, 0, 0.02, 0, 20);
    torus(parent, accentMat, 0.22, 0.052, 0, 0.42, 0.02).rotation.x = Math.PI / 2;
    cast(sphere(parent, accentMat, 0.26, 0.22, 0.26, 0, -0.38, 0.06, 18));
    // Cu_A (IMS docking face) and Heme a3/Cu_B (Matrix O2 reduction pocket!)
    sphere(parent, glow('#78e0ff', 0.82), 0.068, 0.068, 0.068, -0.08, 0.36, 0.22, 10);
    sphere(parent, glow('#ff9c54', 0.85), 0.065, 0.065, 0.065, 0.08, -0.34, 0.24, 10);
  }
}

function particles(parent, color, radius, count, intensity = 0.72) {
  const item = instances(parent, new T.SphereGeometry(radius, 8, 6), glow(color, intensity), count, true);
  item.count = 0;
  return { item, max: count, put: instanceUpdater(item) };
}

function drawParticles(batch, count, transform) {
  const size = Math.round(Math.max(0, Math.min(1, count)) * batch.max);
  batch.item.count = size;
  for (let i = 0; i < size; i++) transform(batch.put, i);
  if (size) batch.item.instanceMatrix.needsUpdate = true;
}

// Sculpted 3D Chloroplast Photosynthesis Diorama (Anabolism: 6 CO2 + 12 H2O + Luz -> C6H12O6 + 6 O2 + 6 H2O)
// Includes envelope OEP/TOC-TIC channels + cutaway thylakoid membrane (PSII, PQ, Cyt b6f, PC, PSI/FNR, CF0-CF1 ATP synthase)!
function buildPhotosynthesisScene(scene, label) {
  const root = group(scene);
  root.visible = false;
  const pLabels = [];
  const pInteractives = new Map();
  const addPLabel = (text, target, offset) => {
    const e = label(text, target, offset);
    e.enabled = false;
    pLabels.push(e);
    return e;
  };

  // Translucent double-membrane chloroplast cutaway envelope
  const envGeo = organicDisplace(new T.SphereGeometry(1, 44, 26), 0.018, 3.0, 7);
  const env = mesh(root, envGeo, membraneMaterial('#48ba6d', { opacity: 0.26, clearcoat: 0.78 }), 0.2, 0.05, -0.85);
  env.scale.set(5.9, 2.8, 1.1);
  const rimOut = torus(root, glow('#7de694', 0.24), 1, 0.016, 0.2, 0.05, -0.5);
  rimOut.scale.set(5.8, 2.7, 1);
  const rimIn = torus(root, material('#3a9158'), 1, 0.014, 0.2, 0.05, -0.22);
  rimIn.scale.set(5.45, 2.38, 1);

  // Outer-envelope hollow β-barrel porins (OEP) & TOC/TIC import pores along upper envelope rim
  const envChGroup = group(root);
  envChGroup.userData.pickKey = 'EnvCh';
  const oepMat = proteinMaterial('#5ec9b8', { emissive: '#1e7869', emissiveIntensity: 0.32, clearcoat: 0.85 });
  for (const [ex, ey, ez, rz] of [[-2.9, 2.35, -0.32, 0.42], [-0.4, 2.72, -0.36, 0.06], [2.2, 2.52, -0.34, -0.36]]) {
    const p = group(envChGroup, ex, ey, ez);
    p.rotation.z = rz;
    hollowBarrel(p, oepMat, 0.19, 0.095, 0.38, 0, 0, 0, 16);
    torus(p, glow('#82ffea', 0.78, { transparent: true, opacity: 0.68, depthWrite: false }), 0.14, 0.022, 0, 0.19, 0).rotation.x = Math.PI / 2;
  }
  pInteractives.set('EnvCh', {
    object: envChGroup, title: 'Porinas OEP e Canais TOC/TIC (Envelope)',
    subtitle: 'Canais nas membranas externa e interna do cloroplasto para CO₂, H₂O e importação de proteínas',
    color: '#5ec9b8', focusEye: [-0.4, 2.6, 8.8], focusTarget: [-0.4, 2.2, -0.3]
  });

  // Stacked Thylakoid Grana in background depth (z = 0.25)
  const grana = group(root, -2.25, -0.1, 0.25);
  const discMat = organelleMaterial('#84de68', { emissive: '#2c7830', emissiveIntensity: 0.2, clearcoat: 0.58 });
  for (const [gx, gz, count] of [[-1.18, 0.02, 6], [0, 0.18, 7], [1.18, 0.02, 6]]) {
    for (let i = 0; i < count; i++) {
      cylinder(grana, discMat, 0.52, 0.52, 0.14, gx, i * 0.22 - 0.65, gz, 22);
    }
  }
  const lamMat = organelleMaterial('#5eb858', { roughness: 0.36 });
  for (const y of [-0.35, 0.05, 0.42]) {
    tube(grana, lamMat, [v(-1.18, y, 0.02), v(0, y + 0.06, 0.18), v(1.18, y, 0.02)], 0.065, false, 24, 8);
  }

  // --- HERO CUTAWAY HOLLOW THYLAKOID SAC (z = 1.32, y = -0.38): Upper Bilayer + Hollow Translucent Lumen + Lower Bilayer! ---
  const thyla = group(root, -1.45, -0.38, 1.32);
  const thylaPoints = Array.from({ length: 18 }, (_, i) => {
    const tx = -2.42 + (i / 17) * 4.84;
    return v(tx, thylaMemY(tx), 0);
  });
  const thylaLowPoints = thylaPoints.map(p => v(p.x, p.y - 0.96, 0));
  tube(thyla, gelMaterial('#42b862', { opacity: 0.64, clearcoat: 0.95, iridescence: 0.35 }), thylaPoints, 0.125, false, 44, 10);
  tube(thyla, gelMaterial('#349650', { opacity: 0.54, clearcoat: 0.88, iridescence: 0.3 }), thylaLowPoints, 0.105, false, 40, 9);
  // Curved closed sac margins sealing left & right ends of the cutaway hollow thylakoid sac
  tube(thyla, gelMaterial('#3aa658', { opacity: 0.6 }), [thylaPoints[0], v(-2.68, -0.48, 0), thylaLowPoints[0]], 0.105, false, 14, 8);
  tube(thyla, gelMaterial('#3aa658', { opacity: 0.6 }), [thylaPoints.at(-1), v(2.68, -0.48, 0), thylaLowPoints.at(-1)], 0.105, false, 14, 8);

  // Dual phospholipid polar head beads lining upper (stromal) & lower (luminal) bilayer leaflets!
  const tLipids = instances(thyla, new T.SphereGeometry(0.042, 8, 6), proteinMaterial('#8ef598', { clearcoat: 0.8 }), 92);
  const putTLip = instanceUpdater(tLipids);
  for (let i = 0; i < 46; i++) {
    const tx = -2.38 + (i / 45) * 4.76;
    const ty = thylaMemY(tx);
    putTLip(i * 2, tx, ty + 0.12, 0.11);
    putTLip(i * 2 + 1, tx, ty - 0.12, 0.11);
  }
  tLipids.instanceMatrix.needsUpdate = true;
  const lumenHazeMat = new T.MeshBasicMaterial({ color: '#58e8ff', transparent: true, opacity: 0.14, depthWrite: false, side: T.DoubleSide });
  mesh(thyla, new T.PlaneGeometry(4.95, 0.84), lumenHazeMat, 0, -0.48, -0.06);

  // 1) Photosystem II (PSII + 6-petal LHCII Chlorophyll Antenna Rosette + Mn4CaO5 OEC on LUMINAL side -Y!)
  const ps2 = group(thyla, -1.9, thylaMemY(-1.9), 0);
  ps2.userData.pickKey = 'PSII';
  const ps2Mat = proteinMaterial('#3ec96b', { emissive: '#1a7a3a', emissiveIntensity: 0.36, clearcoat: 0.85 });
  mesh(ps2, organicDisplace(new T.CylinderGeometry(0.22, 0.24, 0.56, 18), 0.055, 5, 4), ps2Mat);
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * tau;
    sphere(ps2, glow('#8eff78', 0.65), 0.078, 0.052, 0.078, Math.cos(a) * 0.24, 0.22, Math.sin(a) * 0.24, 10);
  }
  // Mn4CaO5 Oxygen-Evolving Complex seated strictly on the LUMINAL (-Y) face of PSII!
  mesh(ps2, organicDisplace(new T.SphereGeometry(0.14, 12, 10), 0.1, 6, 9), glow('#62d8ff', 0.94), 0, -0.36, 0.06);
  pInteractives.set('PSII', {
    object: ps2, title: 'Fotossistema II (PSII · P680) + OEC (Mn₄CaO₅)',
    subtitle: 'Absorve fótons (680 nm) e quebra 2 H₂O no LÚMEN (OEC), liberando O₂, 4 H⁺ diretamente no lúmen e 4 e⁻ para PQ',
    color: '#52e07c', focusEye: [-3.2, 0.5, 5.4], focusTarget: [-3.3, -0.4, 1.35]
  });

  // 2) Mobile Lipophilic Plastoquinone (PQ) oscillating strictly INSIDE the thylakoid membrane (-1.42 <-> -0.86)!
  const pqCar = group(thyla, -1.14, thylaMemY(-1.14), 0.12);
  torus(pqCar, glow('#ffd466', 0.92), 0.095, 0.032, 0, 0, 0);

  // 3) Cytochrome b6f dimer with HOLLOW proton-pumping channel (Stroma +Y -> Lumen -Y!)
  const b6f = group(thyla, -0.38, thylaMemY(-0.38), 0);
  b6f.userData.pickKey = 'b6f';
  const b6fMat = proteinMaterial('#6e82f0', { emissive: '#3142a8', emissiveIntensity: 0.34, clearcoat: 0.85 });
  hollowBarrel(b6f, b6fMat, 0.23, 0.10, 0.64, 0, 0, 0, 18);
  torus(b6f, glow('#a3b8ff', 0.82), 0.16, 0.025, 0, -0.32, 0).rotation.x = Math.PI / 2;
  pInteractives.set('b6f', {
    object: b6f, title: 'Complexo Citocromo b₆f (Bomba de H⁺)',
    subtitle: 'Oxida plastoquinol (PQH₂) e bombeia prótons H⁺ do ESTROMA (+Y) para o LÚMEN (−Y) acidificando o lúmen (pH ~5)',
    color: '#7a94ff', focusEye: [-1.8, 0.45, 5.4], focusTarget: [-1.8, -0.4, 1.35]
  });

  // 4) Water-soluble Mobile Plastocyanin (PC) shuttling strictly INSIDE the LUMEN (-Y) between b6f and PSI!
  const pcCar = mesh(thyla, new T.SphereGeometry(0.105, 12, 10), glow('#6ce3ff', 0.88), 0.28, -0.42, 0.08);

  // 5) Photosystem I (PSI · P700) + Ferredoxin/FNR NADP+ Reductase on STROMAL side (+Y)!
  const ps1 = group(thyla, 0.92, thylaMemY(0.92), 0);
  ps1.userData.pickKey = 'PSI';
  const ps1Mat = proteinMaterial('#2ec4a3', { emissive: '#147560', emissiveIntensity: 0.36, clearcoat: 0.85 });
  mesh(ps1, organicDisplace(new T.CylinderGeometry(0.20, 0.21, 0.56, 18), 0.055, 5, 8), ps1Mat);
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * tau;
    sphere(ps1, glow('#7dffe0', 0.68), 0.07, 0.05, 0.07, Math.cos(a) * 0.22, 0.21, Math.sin(a) * 0.22, 10);
  }
  mesh(ps1, organicDisplace(new T.SphereGeometry(0.145, 14, 12), 0.1, 6, 3), glow('#c294ff', 0.9), 0.10, 0.44, 0.04); // Ferredoxin + FNR
  pInteractives.set('PSI', {
    object: ps1, title: 'Fotossistema I (PSI · P700) + Ferredoxina / FNR',
    subtitle: 'Reexcita elétrons (700 nm) e reduz NADP⁺ + H⁺ → NADPH na face do ESTROMA (+Y) para o Ciclo de Calvin',
    color: '#c294ff', focusEye: [-0.4, 0.55, 5.4], focusTarget: [-0.5, -0.3, 1.35]
  });

  // 6) Rotating HOLLOW CF0-CF1 ATP Synthase (Lumen H+ flows UP through hollow CF0 -> Stroma CF1 makes ATP!)
  const cfAtp = group(thyla, 1.94, thylaMemY(1.94), 0);
  cfAtp.userData.pickKey = 'CF0CF1';
  const cf0Mat = proteinMaterial('#46ccba', { emissive: '#19786b', emissiveIntensity: 0.34, clearcoat: 0.85 });
  const cfStalkMat = proteinMaterial('#d9fff5', { emissive: '#58cca8', emissiveIntensity: 0.38, clearcoat: 0.88 });
  const cfStatorMat = proteinMaterial('#8eb8a8', { roughness: 0.32, metalness: 0.22 });
  const cf1A = proteinMaterial('#68e8a8', { emissive: '#228f5c', emissiveIntensity: 0.28, clearcoat: 0.8 });
  const cf1B = proteinMaterial('#a6ffbe', { emissive: '#34ad6d', emissiveIntensity: 0.36, clearcoat: 0.86 });
  const cfRotor = group(cfAtp);
  hollowBarrel(cfRotor, cf0Mat, 0.21, 0.105, 0.44, 0, 0, 0, 18);
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * tau;
    cylinder(cfRotor, cf0Mat, 0.036, 0.036, 0.42, Math.cos(a) * 0.18, 0, Math.sin(a) * 0.18, 8);
  }
  const cf0Ring = torus(cfAtp, glow('#70f8ff', 0.92, { transparent: true, opacity: 0.68, depthWrite: false }), 0.18, 0.028, 0, -0.23, 0);
  cf0Ring.rotation.x = Math.PI / 2;
  cylinder(cfRotor, cfStalkMat, 0.052, 0.068, 0.48, 0, 0.42, 0, 12);
  tube(cfAtp, cfStatorMat, [v(0.24, -0.18, 0), v(0.38, 0.18, 0.04), v(0.36, 0.62, 0.04), v(0.11, 0.9, 0)], 0.038, false, 18, 7);
  const cf1Subs = [];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * tau;
    const isBeta = i % 2 === 1;
    const sub = mesh(cfAtp, new T.SphereGeometry(0.135, 12, 10), isBeta ? cf1B : cf1A, Math.cos(a) * 0.18, 0.72, Math.sin(a) * 0.18);
    sub.scale.set(0.95, 1.32, 0.95);
    cf1Subs.push({ mesh: sub, angle: a, isBeta });
  }
  const cfPulseRing = torus(cfAtp, glow('#8effc4', 1.0, { transparent: true, opacity: 0, depthWrite: false }), 0.3, 0.028, 0, 0.96, 0);
  cfPulseRing.rotation.x = Math.PI / 2;
  pInteractives.set('CF0CF1', {
    object: cfAtp, title: 'ATP Sintase Tilacoide (Canal oco CF₀ · Cabeça CF₁)',
    subtitle: 'Prótons H⁺ retornam do LÚMEN pelo canal oco CF₀ para o ESTROMA, girando o rotor γ para sintetizar ATP',
    color: '#8effc4', focusEye: photoStages[2][1], focusTarget: photoStages[2][2]
  });

  // Golden Z-scheme electron pathway arc cleanly inside PSII -> PQ (bilayer) -> b6f -> PC (lumen) -> PSI -> FNR (stroma)!
  const zCurve = curve([
    v(-1.9, -0.34, 0.22), v(-1.9, 0.04, 0.22), v(-1.14, thylaMemY(-1.14), 0.22),
    v(-0.38, thylaMemY(-0.38), 0.22), v(0.28, -0.40, 0.20), v(0.92, 0.04, 0.22), v(1.02, 0.44, 0.20)
  ]);
  const zArcMat = glow('#ffe97a', 0.85, { transparent: true, opacity: 0.42, depthWrite: false });
  mesh(thyla, new T.TubeGeometry(zCurve, 44, 0.024, 6, false), zArcMat);

  // Sun beam emitter top-left (explicit-radius SphereGeometry prevents scale-overwrite bloat, cleared from HUD title!)
  const sun = mesh(root, new T.SphereGeometry(0.46, 20, 16), glow('#fff07c', 1.15), -5.05, 2.05, 0.6);
  const sunHalo = mesh(sun, new T.SphereGeometry(0.68, 16, 12),
    glow('#ffe96e', 0.65, { transparent: true, opacity: 0.2, depthWrite: false }));
  const photonPath = curve([v(-4.72, 1.85, 0.6), v(-3.9, 1.1, 0.95), v(-3.35, 0.25, 1.32), v(-3.35, -0.2, 1.36)]);
  const sunBeam = tube(root, glow('#fff07c', 0.45, { transparent: true, opacity: 0.22, depthWrite: false }), photonPath.points, 0.13, false, 24, 8);

  // Rotating Calvin Cycle in the Stroma + Sculpted 3D RuBisCO Hexadecamer (L8S8) Enzyme + Starch Granule!
  const calvin = group(root, 3.0, -0.15, 0.72);
  calvin.userData.pickKey = 'Calvin';
  const calvinRing = torus(calvin, proteinMaterial('#5cc9b2', { emissive: '#207566', emissiveIntensity: 0.28, clearcoat: 0.8 }), 1.22, 0.055);
  calvinRing.scale.y = 0.78;
  // Sculpted RuBisCO L8S8 hexadecamer complex seated at the heart of the Calvin-Benson Cycle!
  const rubisco = group(calvin, 0, 0, 0.06);
  const rubLMat = proteinMaterial('#4dd6a4', { emissive: '#167554', emissiveIntensity: 0.32, clearcoat: 0.85 });
  const rubSMat = proteinMaterial('#b2ffda', { emissive: '#38a67c', emissiveIntensity: 0.35, clearcoat: 0.9 });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * tau;
    sphere(rubisco, rubLMat, 0.13, 0.15, 0.13, Math.cos(a) * 0.24, Math.sin(a) * 0.22, (i % 2 ? 0.08 : -0.08), 10);
    sphere(rubisco, rubSMat, 0.075, 0.075, 0.075, Math.cos(a + 0.2) * 0.16, Math.sin(a + 0.2) * 0.14, (i % 2 ? 0.20 : -0.20), 8);
  }
  // Pearlescent Starch Granule & circular cpDNA ring in the chloroplast stroma!
  const starchGeo = organicDisplace(new T.SphereGeometry(0.42, 18, 14), 0.1, 4, 6);
  mesh(root, starchGeo, proteinMaterial('#efe8c8', { roughness: 0.36, clearcoat: 0.55 }), 4.15, 1.48, -0.15).scale.set(1.25, 0.76, 0.82);
  const cpDna = torus(root, glow('#70f0b4', 0.45), 0.34, 0.02, 1.85, -1.65, 0.1);
  cpDna.rotation.set(0.6, 0.4, 0);
  const calvinBeads = instances(calvin, new T.SphereGeometry(0.13, 10, 8), glow('#7ef5d4', 0.52), 8);
  const putCalvin = instanceUpdater(calvinBeads);
  const calvinMarker = sphere(calvin, glow('#ffeb82', 0.85), 0.16);
  pInteractives.set('Calvin', {
    object: calvin, title: 'Ciclo de Calvin-Benson · RuBisCO (L₈S₈)',
    subtitle: 'Enzima RuBisCO fixa 6 CO₂ consumindo 18 ATP + 12 NADPH para sintetizar 1 Glicose (Taiz & Zeiger)',
    color: '#5cc9b2', focusEye: photoStages[3][1], focusTarget: photoStages[3][2]
  });

  // Hexagonal Glucose Product (C6H12O6) emerging from Calvin Cycle!
  const glucose = group(root, 5.25, -0.25, 0.92);
  const glucMat = glow('#6ce3ec', 0.48);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * tau, b = ((i + 1) / 6) * tau;
    const p = v(Math.cos(a) * 0.34, Math.sin(a) * 0.34, 0);
    const q = v(Math.cos(b) * 0.34, Math.sin(b) * 0.34, 0);
    sphere(glucose, glucMat, 0.105, 0.105, 0.105, p.x, p.y, 0, 12);
    rod(glucose, glucMat, p, q, 0.028);
  }

  // Energy bridge (ATP + NADPH from PSI & CF0-CF1 -> Calvin Cycle)
  const energyBridge = curve([v(0.42, 0.55, 1.32), v(1.15, 0.95, 1.1), v(1.85, 0.42, 0.85)]);
  tube(root, glow('#9effc4', 0.35, { transparent: true, opacity: 0.35, depthWrite: false }), energyBridge.points, 0.032, false, 24, 6);

  // Particles for Photosynthesis (photons, H2O, paired diatomic O2, Z-scheme e-, lumen H+, CF0 H+ return, ATP+NADPH, CO2, glucose!)
  const photons = particles(root, '#fff380', 0.088, 18, 1.0);
  const waterIn = particles(root, '#58c8ff', 0.08, 12, 0.85);
  const o2Out = particles(root, '#82f5ff', 0.072, 24, 0.92);
  const zElec = particles(thyla, '#ffe975', 0.068, 18, 1.0);
  const thylaHPump = particles(thyla, '#66eaff', 0.062, 16, 0.95);
  const lumenH = particles(thyla, '#72f0ff', 0.056, 26, 0.88);
  const cfHReturn = particles(cfAtp, '#70f8ff', 0.066, 12, 0.98);
  const atpNadph = particles(root, '#94ffbe', 0.085, 14, 0.95);
  const co2In = particles(root, '#f2b892', 0.082, 14, 0.85);
  const glucOut = particles(root, '#6ce8f5', 0.09, 10, 0.9);

  addPLabel('LUZ SOLAR (FÓTONS)', sun, v(-0.28, -0.78, 0.1));
  addPLabel('PSII · b₆f · PSI · Canal CF₀F₁', thyla, v(-0.1, -1.16, 0.32));
  addPLabel('12 H₂O (entrada)', group(root, -4.35, -2.02, 0.85), v(0, 0, 0));
  addPLabel('6 O₂ (liberado · fotólise)', group(root, -2.6, 2.18, 0.95), v(0, 0, 0));
  addPLabel('ATP + NADPH', group(root, 0.95, 1.32, 1.05), v(0, 0, 0));
  addPLabel('Ciclo de Calvin (Estroma)', calvin, v(0, 1.25, 0.2));
  addPLabel('6 CO₂ (absorvido)', group(root, 3.0, -2.0, 0.8), v(0, 0, 0));
  addPLabel('Glicose · C₆H₁₂O₆', glucose, v(0, 0.75, 0.2));

  const pt = v();
  let cfPulseAge = 1, pFlow = 0;
  return {
    root,
    labels: pLabels,
    interactives: pInteractives,
    update(phase, dt, rate) {
      // Smooth integrated phase prevents carrier reversals/jumps when dragging Light Intensity slider!
      pFlow += dt * (0.08 + rate * 0.92);
      sun.scale.setScalar(0.76 + rate * 0.28 + Math.sin(phase * 4) * 0.03 * rate);
      sunHalo.material.opacity = 0.04 + rate * 0.22;
      sunBeam.material.opacity = 0.05 + rate * 0.22;
      discMat.emissiveIntensity = 0.08 + rate * 0.28;
      zArcMat.opacity = 0.08 + rate * 0.42;
      lumenHazeMat.opacity = 0.03 + rate * 0.16;

      // Mobile carriers PQ (strictly inside bilayer between PSII & b6f) & PC (strictly inside lumen between b6f & PSI)!
      const pqX = -1.14 + Math.sin(pFlow * 2.3) * 0.26 * rate;
      pqCar.position.set(pqX, thylaMemY(pqX), 0.12);
      pcCar.position.set(0.28 + Math.sin(pFlow * 2.6 + 1.1) * 0.22 * rate, -0.44, 0.08);
      rubisco.rotation.z = pFlow * 0.55;
      rubisco.rotation.y = Math.sin(pFlow * 0.8) * 0.22;
      const prevRot = cfRotor.rotation.y;
      cfRotor.rotation.y += dt * rate * 9.5;
      for (const s of cf1Subs) {
        if (s.isBeta) {
          const conf = Math.sin(cfRotor.rotation.y - s.angle) * rate * 0.14;
          s.mesh.scale.set(0.95 + conf, 1.32 - conf * 0.8, 0.95 + conf);
        }
      }
      if (rate > 0.1 && Math.floor(cfRotor.rotation.y / (tau / 3)) !== Math.floor(prevRot / (tau / 3))) cfPulseAge = 0;
      if (cfPulseAge < 1) {
        cfPulseAge = Math.min(1, cfPulseAge + dt * 2.5);
        cfPulseRing.scale.setScalar(0.7 + cfPulseAge * 1.45);
        cfPulseRing.material.opacity = (1 - cfPulseAge) * 0.82 * rate;
      } else cfPulseRing.material.opacity = 0;

      calvinMarker.visible = rate > 0.04;
      calvinMarker.position.set(Math.cos(pFlow * 1.9) * 1.22, Math.sin(pFlow * 1.9) * 0.95, 0.08);
      for (let i = 0; i < 8; i++) putCalvin(i, Math.cos(i * tau / 8) * 1.22, Math.sin(i * tau / 8) * 0.95, 0.02, 0.45 + rate * 0.55);
      calvinBeads.instanceMatrix.needsUpdate = true;
      glucose.rotation.z = pFlow * 0.45;
      glucose.scale.setScalar(0.75 + rate * 0.35);

      drawParticles(photons, rate, (put, i) => {
        const p = (pFlow * 0.75 + i / photons.max) % 1;
        photonPath.getPoint(p, pt);
        put(i, pt.x, pt.y + Math.sin(p * 12 + i) * 0.14, pt.z, 0.85 + Math.sin(p * Math.PI) * 0.4);
      });
      // H2O enters the luminal Mn4CaO5 OEC cleanly from below-left
      drawParticles(waterIn, rate, (put, i) => {
        const p = (pFlow * 0.55 + i / waterIn.max) % 1;
        put(i, -4.35 + p * 1.0, -1.92 + p * 1.12, 1.38, Math.sin(p * Math.PI) * 0.6 + 0.5);
      });
      // Diatomic O2 diffuses cleanly from PSII OEC outward around the left sac edge (never clipping through PSII cylinder!)
      drawParticles(o2Out, rate, (put, i) => {
        const pair = Math.floor(i / 2);
        const atom = i % 2 === 0 ? -0.062 : 0.062;
        const p = (pFlow * 0.5 + pair / (o2Out.max / 2)) % 1;
        const ox = -3.72 - Math.sin(p * Math.PI) * 0.45 + Math.sin(pair * 2.1 + p * 4) * 0.22;
        const oy = -0.68 + p * 2.75;
        const tilt = pFlow * 2.4 + pair;
        put(i, ox + Math.cos(tilt) * atom, oy + Math.sin(tilt) * atom, 1.56, 1.05 - p * 0.3);
      });
      drawParticles(zElec, rate, (put, i) => {
        const p = (pFlow * 0.54 + i / zElec.max) % 1;
        zCurve.getPoint(p, pt);
        put(i, pt.x, pt.y, pt.z, 0.9 + Math.sin(phase * 9 + i) * 0.18);
      });
      // Scientifically faithful H+ accumulation:
      //  - Cytochrome b6f (-0.38) pumps H+ DOWN through its hollow bore from Stroma (+Y) -> Lumen (-Y)
      //  - PSII OEC (-1.9, y = -0.38) releases photolysis H+ directly INSIDE THE LUMEN (not pumped from stroma!)
      drawParticles(thylaHPump, rate, (put, i) => {
        const p = (pFlow * 0.66 + i / thylaHPump.max) % 1;
        if (i % 3 === 0) {
          put(i, -1.9 + Math.sin(p * 6 + i) * 0.14, -0.38 - p * 0.36, 0.12, Math.sin(p * Math.PI) * 0.6 + 0.55);
        } else {
          put(i, -0.38 + Math.sin(p * 8 + i) * 0.03, 0.42 - p * 0.96, 0.02, Math.sin(p * Math.PI) * 0.6 + 0.55);
        }
      });
      drawParticles(lumenH, rate, (put, i) => {
        const rawU = (pFlow * 0.22 + i / lumenH.max) % 1;
        const u = Math.pow(rawU, 0.72); // Higher luminal H+ density (pH ~5) accumulating toward hollow CF0!
        put(i, -1.95 + u * 3.88, -0.54 + Math.sin(pFlow * 2.8 + i * 1.9) * 0.16, 0.04 + ((i * 7) % 9) * 0.015, 0.85);
      });
      // Luminal H+ streams straight UP through the hollow open CF0 bore (x=0, z=0 local to cfAtp)!
      drawParticles(cfHReturn, rate, (put, i) => {
        const p = (pFlow * 0.76 + i / cfHReturn.max) % 1;
        put(i, Math.sin(p * 9 + i) * 0.035, -0.52 + p * 0.92, Math.cos(p * 9 + i) * 0.035, Math.sin(p * Math.PI) * 0.6 + 0.55);
      });
      drawParticles(atpNadph, rate, (put, i) => {
        const p = (pFlow * 0.6 + i / atpNadph.max) % 1;
        energyBridge.getPoint(p, pt);
        put(i, pt.x, pt.y, pt.z, 0.85 + Math.sin(p * Math.PI) * 0.4);
      });
      drawParticles(co2In, rate, (put, i) => {
        const p = (pFlow * 0.5 + i / co2In.max) % 1;
        put(i, 3.0 + Math.cos(i * 2.3) * 0.45 * (1 - p), -1.95 + p * 1.15, 0.8, Math.sin(p * Math.PI) * 0.55 + 0.55);
      });
      drawParticles(glucOut, rate, (put, i) => {
        const p = (pFlow * 0.48 + i / glucOut.max) % 1;
        put(i, 4.15 + p * 1.15, -0.2 + Math.sin(p * Math.PI) * 0.35, 0.85, Math.sin(p * Math.PI) * 0.6 + 0.5);
      });
    }
  };
}

export function respiration3d({ scene, lights, engine, label, toolbar, guide, viewport, tooltip, signal, audio }) {
  let mode = 'aerobic', oxygen = 100, inhibited = false, activeStage = 0;
  let phase = 0, chainPhase = 0, gradPhase = 0, gradient = 1, chainRate = 1, lastPulse = 0, nextLive = 0;
  let stageBuild = 1, matrixLevel = 0.34, imsDensity = 0.92;
  let hoveredKey = null;

  scene.fog.density = 0.0058;
  lights.rim.color.set('#9ec6d4');
  lights.rim.intensity = 1.45;
  engine.view(stages[0][1], stages[0][2], true);

  // Living Translucent Eukaryotic Cytosol Backdrop (neutral warm-slate depth so ZERO blue haze bleeds outside mitochondrion!)
  const bioEnv = buildBioEnvironment(scene, { mode: 'cytosol' });

  const mitoLight = new T.PointLight('#eef6fb', 2.4, 18, 1.45);
  mitoLight.position.set(2.2, 3.2, 4.8);
  mitoLight.castShadow = true;
  const studioWarm = new T.PointLight('#ffebd2', 1.65, 22, 1.5);
  studioWarm.position.set(-3.2, 5.2, 6.2);
  const cytoLight = new T.PointLight('#f0a95b', 0.65, 14, 1.5);
  cytoLight.position.set(-5.6, 1.8, 3.6);
  const alertLight = new T.PointLight('#ff4d6a', 0, 5.2, 1.6);
  alertLight.position.set(3.62, 0.75, 2.1);
  const photoLight = new T.PointLight('#d6ff9e', 0, 18, 1.4);
  photoLight.position.set(-1.5, 3.2, 5.4);
  scene.add(mitoLight, studioWarm, cytoLight, alertLight, photoLight);

  const photo = buildPhotosynthesisScene(scene, label);
  const catabRoot = group(scene);
  const mito = group(catabRoot);
  const interactives = new Map();

  const outerGeo = organicDisplace(new T.SphereGeometry(1, 44, 26), 0.015, 3.0, 2);
  const outerMat = membraneMaterial('#d97d7a', { opacity: 0.23, clearcoat: 0.75, bumpMap: textures.membraneBump(), bumpScale: 0.03 });
  const outerBack = mesh(mito, outerGeo, outerMat, 2.18, -.12, -.92);
  outerBack.scale.set(5.38, 2.58, .92);

  const outline = torus(mito, glow('#ea988a', .24), 1, .022, 2.18, -.12, -.64);
  outline.scale.set(5.28, 2.48, 1);
  const innerShell = torus(mito, proteinMaterial('#b55966', { roughness: 0.34, clearcoat: 0.65 }), 1, .024, 2.18, -.1, -.39);
  innerShell.scale.set(4.96, 2.12, 1);

  // Sculpted background mitochondrial cristae invaginations + circular mtDNA plasmid + 70S mitoribosomes!
  const cristaMat = gelMaterial('#a84d68', { opacity: 0.38, clearcoat: 0.75 });
  for (const [cx, cy] of [[-0.6, -1.65], [1.9, -1.78], [4.1, -1.55]]) {
    tube(mito, cristaMat, [v(cx - 0.55, cy - 0.25, -0.35), v(cx, cy + 0.55, -0.18), v(cx + 0.55, cy - 0.25, -0.35)], 0.14, false, 18, 8);
  }
  const mtDna = torus(mito, glow('#ffd478', 0.55), 0.32, 0.022, 3.05, -1.52, 0.22);
  mtDna.rotation.set(0.75, 0.35, 0);
  const mRiboMat = proteinMaterial('#e89cc4', { emissive: '#8f3a6b', emissiveIntensity: 0.24, clearcoat: 0.7 });
  for (const [rx, ry, rz] of [[2.45, -1.25, 0.35], [3.62, -1.32, 0.28], [1.52, -1.62, 0.42], [-1.32, -1.55, 0.35]]) {
    sphere(mito, mRiboMat, 0.08, 0.065, 0.075, rx, ry, rz, 10);
  }

  // Outer-membrane hollow VDAC Porin β-barrels + Inner-membrane hollow Pyruvate Carrier (MPC) aligned DEAD-CENTER on pyruvatePath!
  const mitoChannels = group(mito);
  mitoChannels.userData.pickKey = 'MitoCh';
  const vdacMat = proteinMaterial('#53b9cf', { emissive: '#1e6e85', emissiveIntensity: 0.34, clearcoat: 0.86 });
  for (const [vx, vy, vz, rz] of [[-1.6, 1.65, -0.5, 0.56], [0.8, 2.28, -0.58, 0.16], [3.5, 2.26, -0.58, -0.18], [5.8, 1.62, -0.5, -0.55]]) {
    const pore = group(mitoChannels, vx, vy, vz);
    pore.rotation.z = rz;
    hollowBarrel(pore, vdacMat, 0.175, 0.088, 0.36, 0, 0, 0, 16);
    torus(pore, glow('#7cf2ff', 0.78, { transparent: true, opacity: 0.65, depthWrite: false }), 0.125, 0.022, 0, 0.18, 0).rotation.x = Math.PI / 2;
  }
  // Entry VDAC pore on the outer membrane & MPC channel on the inner membrane along the exact pyruvate import trajectory!
  const vdacEntry = group(mitoChannels, -3.28, -0.96, 1.04);
  vdacEntry.rotation.z = Math.PI / 2 + 0.22;
  hollowBarrel(vdacEntry, vdacMat, 0.18, 0.095, 0.36, 0, 0, 0, 16);

  const mpcGroup = group(mitoChannels, -2.44, -1.28, 1.02);
  mpcGroup.rotation.z = Math.PI / 2 + 0.18;
  const mpcMat = proteinMaterial('#5ce09e', { emissive: '#1d8252', emissiveIntensity: 0.38, clearcoat: 0.88 });
  hollowBarrel(mpcGroup, mpcMat, 0.18, 0.098, 0.44, 0, 0, 0, 18);
  torus(mpcGroup, glow('#94ffd0', 0.85, { transparent: true, opacity: 0.72, depthWrite: false }), 0.145, 0.024, 0, 0.22, 0).rotation.x = Math.PI / 2;
  interactives.set('MitoCh', {
    object: mitoChannels, title: 'Porinas ocas (VDAC) e Carreador de Piruvato (MPC)',
    subtitle: 'Piruvato atravessa o canal oco VDAC (membrana externa) e o canal oco MPC (membrana interna) até a matriz',
    color: '#5ce09e', focusEye: [-2.6, -0.35, 6.2], focusTarget: [-2.6, -1.1, 1.0]
  });

  // Curved crescent IMS proton-gradient glow clipped 100% STRICTLY INSIDE the curved mitochondrial outer membrane!
  // Intensifies naturally left-to-right toward Complex IV & ATP Synthase (zero rectangular blue haze leaking outside!)
  const imsBandGeo = buildCurvedBand(
    -1.95, 5.72,
    x => innerMemY(x) + 0.18,
    x => Math.max(innerMemY(x) + 0.24, mitoOuterTopY(x) - 0.16),
    x => innerMemZ(x) - 0.22,
    '#0e3a4c', '#4ee2fa', 40
  );
  const gradientHazeMat = new T.MeshBasicMaterial({
    vertexColors: true, transparent: true, opacity: 0.14, depthWrite: false, side: T.DoubleSide
  });
  mesh(mito, imsBandGeo, gradientHazeMat);

  // Subtle alkaline Matrix lower tint crescent strictly inside the lower mitochondrial oval (warm rose-slate contrast!)
  const matrixBandGeo = buildCurvedBand(
    -1.85, 5.45,
    x => mitoOuterBotY(x) + 0.16,
    x => innerMemY(x) - 0.20,
    x => innerMemZ(x) - 0.34,
    '#281822', '#3a1e2a', 32
  );
  const matrixHazeMat = new T.MeshBasicMaterial({
    vertexColors: true, transparent: true, opacity: 0.11, depthWrite: false, side: T.DoubleSide
  });
  mesh(mito, matrixBandGeo, matrixHazeMat);

  // UNIFIED exact inner mitochondrial membrane curve (core, upper IMS rim, lower Matrix rim & lipids ALL share innerMemY/Z!)
  const band = Array.from({ length: 28 }, (_, i) => {
    const x = -2.65 + i * 0.355;
    return v(x, innerMemY(x), innerMemZ(x));
  });
  tube(mito, gelMaterial('#9c546e', { opacity: 0.72, clearcoat: 0.85, iridescence: 0.28 }), band, .115, false, 64, 10);
  tube(mito, glow('#df8e9c', .22), band.map(p => p.clone().add(v(0, .135, .04))), .042, false, 60, 8);
  tube(mito, organelleMaterial('#c96d8c', { roughness: 0.34 }), band.map(p => p.clone().add(v(0, -.135, .04))), .042, false, 60, 8);

  const lipids = instances(mito, new T.SphereGeometry(.044, 8, 6),
    proteinMaterial('#eea0ac', { roughness: 0.26, clearcoat: 0.78 }), 160);
  const placeLipid = instanceUpdater(lipids);
  for (let index = 0; index < 80; index++) {
    const x = -2.58 + index * .114;
    const yy = innerMemY(x);
    const z = innerMemZ(x) + 0.095;
    placeLipid(2 * index, x, yy + .135, z);
    placeLipid(2 * index + 1, x, yy - .135, z);
  }
  lipids.instanceMatrix.needsUpdate = true;

  const catabLabels = [];
  const addLabel = (name, parent, offset) => {
    const entry = label(name, parent, offset);
    catabLabels.push(entry);
    return entry;
  };
  addLabel('CITOSOL', group(catabRoot, -5.25, 2.08, .5));
  addLabel('Membrana externa', group(mito, 5.55, 2.12, -.65));
  const imsLabel = addLabel('EIM · acúmulo H⁺ → (pH ~6,8)', group(mito, 1.05, 2.18, .35));
  addLabel('Membrana interna / crista', group(mito, 6.72, 0.08, .65));
  const matLabel = addLabel('Matriz · H⁺ basal (pH ~7,8)', group(mito, 2.75, -2.30, .72));

  const carrierObjects = {};
  const labelOffsets = {
    I: v(-0.18, 0.86, 0.24),
    II: v(0.05, -0.92, 0.24),
    Q: v(0, 0.56, 0.24),
    III: v(0, 0.94, 0.24),
    'Cit. c': v(0.05, 1.06, 0.24),
    IV: v(0, 0.86, 0.24)
  };
  const positioned = complexes.map(([key, x, color, subtitle]) => {
    const y = innerMemY(x);
    const z = innerMemZ(x);
    const object = group(mito, x, y, z);
    object.userData.pickKey = key;
    buildCarrier(object, key, color);
    carrierObjects[key] = { object, base: v(x, y, z) };
    interactives.set(key, {
      object, title: ['Q', 'Cit. c'].includes(key) ? key : 'Complexo ' + key,
      subtitle, color, focusEye: [x + 0.2, y + 1.4, 5.8], focusTarget: [x, y, z]
    });
    addLabel(['Q', 'Cit. c'].includes(key) ? key : 'Complexo ' + key, object, labelOffsets[key]);
    return object.position.clone();
  });

  // SCIENTIFICALLY ACCURATE (Lehninger Cap. 19 / Iwata et al.):
  // O2 binds DIRECTLY at Complex IV's binuclear heme a3–Cu_B catalytic pocket on its MATRIX (-Y) face (x = 3.62),
  // NOT floating off in empty space toward ATP Synthase!
  const oxygenTarget = group(mito, 3.68, innerMemY(3.62) - 0.52, innerMemZ(3.62) + 0.20);
  const oxygenMat = glow('#6ea8ff', .68, { roughness: 0.2 });
  sphere(oxygenTarget, oxygenMat, .11, .11, .11, -.075, 0, 0, 14);
  sphere(oxygenTarget, oxygenMat, .11, .11, .11, .075, 0, 0, 14);
  rod(oxygenTarget, oxygenMat, v(-.075, 0, 0), v(.075, 0, 0), 0.036);
  addLabel('½ O₂ + 2 H⁺ + 2 e⁻ → H₂O (sítio do Complexo IV)', oxygenTarget, v(-.18, -.52, 0.16));

  // HOLLOW F0/F1 ATP Synthase seated DEAD-CENTER inside innerMemY(5.23), innerMemZ(5.23)!
  const atp = group(mito, 5.23, innerMemY(5.23), innerMemZ(5.23));
  atp.userData.pickKey = 'ATP';
  const statorMat = proteinMaterial('#467fa6', { metalness: 0.16, roughness: 0.3, clearcoat: 0.65 });
  const alphaMat = proteinMaterial('#3d8ca8', { roughness: 0.28, clearcoat: 0.68 });
  const betaMat = proteinMaterial('#5be0bc', { emissive: '#22876f', emissiveIntensity: 0.24, roughness: 0.24, clearcoat: 0.8 });
  const stalkMat = proteinMaterial('#8cf2d4', { emissive: '#38b594', emissiveIntensity: 0.3, roughness: 0.22, clearcoat: 0.84 });

  sphere(atp, statorMat, 0.14, 0.22, 0.16, 0.34, 0.08, 0.04, 16).rotation.z = -0.08;
  tube(atp, statorMat, [v(0.36, 0.24, 0.04), v(0.49, 0.02, 0.08), v(0.54, -0.36, 0.12), v(0.46, -0.80, 0.1), v(0.18, -0.98, 0.03)], 0.042, false, 24, 8);
  sphere(atp, statorMat, 0.22, 0.09, 0.22, 0, -0.96, 0, 16);

  const rotor = group(atp);
  // Truly HOLLOW F0 transmembrane c-ring conducting IMS H+ downward (+Y -> -Y) cleanly into Matrix!
  hollowBarrel(rotor, alphaMat, 0.23, 0.115, 0.40, 0, 0.02, 0, 20);
  for (let i = 0; i < 10; i++) {
    const a = i * tau / 10;
    cylinder(rotor, i % 2 ? betaMat : alphaMat, .042, .042, .38, Math.sin(a) * .215, .02, Math.cos(a) * .215, 8);
  }
  tube(rotor, stalkMat, [v(0, -0.14, 0), v(0.03, -0.34, 0.02), v(-0.04, -0.54, -0.02), v(0, -0.74, 0)], 0.062, false, 18, 9);

  const head = group(atp, 0, -.64, 0);
  const f1Subunits = [];
  for (let i = 0; i < 6; i++) {
    const a = i * tau / 6;
    const isBeta = i % 2 === 1;
    const subGeo = organicDisplace(new T.SphereGeometry(1, 16, 12), 0.04, 4, i);
    const sub = mesh(head, subGeo, isBeta ? betaMat : alphaMat, Math.sin(a) * .26, 0, Math.cos(a) * .26);
    sub.scale.set(0.19, 0.25, 0.19);
    f1Subunits.push({ mesh: sub, angle: a, isBeta });
  }
  const atpPulseRing = torus(atp, glow('#8effd8', 0.85, { transparent: true, opacity: 0, depthWrite: false }), 0.42, 0.022, 0, -0.74, 0);
  atpPulseRing.rotation.x = Math.PI / 2;
  let atpPulseAge = 1;

  interactives.set('ATP', {
    object: atp, title: 'ATP sintase (Canal oco F₀ / Cabeça F₁)',
    subtitle: 'Prótons H⁺ retornam do espaço intermembranas pelo canal oco F₀ até a matriz, girando o rotor γ para sintetizar ATP',
    color: '#5be0bc', focusEye: stages[6][1], focusTarget: [5.23, innerMemY(5.23) - 0.15, innerMemZ(5.23)]
  });
  addLabel('ATP sintase · F₀/F₁', atp, v(.14, .72, .4));

  const krebs = group(mito, .03, -1.39, 1.03);
  krebs.userData.pickKey = 'Krebs';
  const ring = torus(krebs, organelleMaterial('#68b88a', { roughness: 0.34, clearcoat: 0.5 }), .74, .038);
  ring.scale.y = .58;
  const krebsBeads = instances(krebs, new T.SphereGeometry(.105, 10, 8), glow('#7ce6a6', .38), 8);
  const putKrebs = instanceUpdater(krebsBeads);
  const cycleMarker = sphere(krebs, glow('#f2f096', .52), .13);
  interactives.set('Krebs', {
    object: krebs, title: 'Ciclo de Krebs (Ácido Cítrico)',
    subtitle: 'Oxida Acetil-CoA (Citrato → Isocitrato → α-Cetoglutarato → Succinato → Oxaloacetato)',
    color: '#7ce6a6', focusEye: stages[2][1], focusTarget: stages[2][2]
  });
  addLabel('Ciclo de Krebs', krebs, v(0, -.76, .15));

  const glycol = group(catabRoot, -5.75, -.08, .79);
  glycol.userData.pickKey = 'Glycol';
  const glycolPath = curve([v(-1.26, .79, .08), v(-.7, .3, .22), v(0, .03, .11), v(.46, -.32, .15), v(1.04, -.57, .17)]);
  const fermentationPath = curve([v(1.04, -.57, .17), v(.72, -.94, .26), v(.11, -1.27, .37), v(-.63, -.97, .19), v(-.97, -.43, .06)]);
  const glycolTubeMat = proteinMaterial('#3893ab', { emissive: '#1e5b6e', emissiveIntensity: 0.18, clearcoat: 0.75 });
  tube(glycol, glycolTubeMat, glycolPath.points, .042, false, 44, 10);
  // Key cytosolic glycolysis enzymes along the cascade (Hexokinase, PFK-1, Pyruvate Kinase!)
  const enzMat = proteinMaterial('#5ce0d8', { emissive: '#1e8580', emissiveIntensity: 0.26, clearcoat: 0.85 });
  for (const tFrac of [0.22, 0.52, 0.80]) {
    const ep = glycolPath.getPoint(tFrac);
    const enz = mesh(glycol, organicDisplace(new T.SphereGeometry(0.145, 14, 12), 0.14, 6, tFrac * 17), enzMat, ep.x, ep.y, ep.z - 0.14);
    enz.castShadow = true;
  }
  const fermentation = group(glycol);
  const fermTubeMat = organelleMaterial('#e09b5c', { emissive: '#b86825', emissiveIntensity: 0.25, clearcoat: 0.55 });
  tube(fermentation, fermTubeMat, fermentationPath.points, .042, false, 36, 8);
  const substrates = glow('#6ce3ec', .34);
  for (let i = 0; i < 6; i++) {
    const a = i * tau / 6, b = (i + 1) * tau / 6;
    const p = v(-1.26 + Math.cos(a) * .24, .79 + Math.sin(a) * .24, .08);
    const q = v(-1.26 + Math.cos(b) * .24, .79 + Math.sin(b) * .24, .08);
    sphere(glycol, substrates, .086, .086, .086, ...p.toArray(), 12);
    rod(glycol, substrates, p, q, .022);
  }
  for (const z of [-.08, .26]) {
    const a = v(.92, -.59, z), b = v(1.08, -.61, z), c = v(1.22, -.46, z);
    for (const pt of [a, b, c]) sphere(glycol, substrates, .068, .068, .068, ...pt.toArray(), 10);
    rod(glycol, substrates, a, b, .024);
    rod(glycol, substrates, b, c, .024);
  }
  interactives.set('Glycol', {
    object: glycol, title: 'Glicólise e Fermentação (Citosol)',
    subtitle: 'Quebra 1 Glicose em 2 Piruvatos (saldo de 2 ATP + 2 NADH); etapa anaeróbica',
    color: '#6ce3ec', focusEye: stages[1][1], focusTarget: stages[1][2]
  });
  addLabel('Glicose', glycol, v(-1.27, 1.12, .18));
  addLabel('Glicólise', glycol, v(-.29, .48, .2));
  addLabel('2 piruvatos', glycol, v(1.06, -.26, .28));
  const fermLabel = addLabel('NAD⁺ regenerado', fermentation, v(0, -1.28, .42));
  const productLabel = addLabel('Lactato', fermentation, v(-1.07, -.26, .24));

  // Pyruvate threads cleanly through hollow VDAC (-3.28,-0.96,1.04) -> hollow MPC (-2.44,-1.28,1.02) -> PDH -> Krebs Cycle!
  const pyruvatePath = curve([v(-4.72, -.65, .98), v(-3.28, -.96, 1.04), v(-2.44, -1.28, 1.02), v(-.74, -1.38, 1.02)]);
  const bridge = group(catabRoot);
  tube(bridge, organelleMaterial('#5bb592', { roughness: 0.4 }), pyruvatePath.points, .026);
  addLabel('Piruvato → Acetil-CoA (PDH)', bridge, v(-2.64, -.73, .85));

  // Textbook Electron Transfer Pathway:
  //   I (matrix arm) / II (matrix face) -> Q (inside bilayer) -> III -> Cit. c (IMS +Y) -> IV (IMS Cu_A -> Matrix Cu_B/O2!)
  const fullRoute = (start, stop) => curve([
    positioned[start].clone().add(v(start === 0 ? -0.34 : 0, -0.46, 0.22)),
    positioned[start].clone().add(v(0, start === 0 ? 0.0 : -0.1, 0.24)),
    positioned[2].clone().add(v(0, 0.0, 0.24)),       // Q strictly inside bilayer!
    positioned[3].clone().add(v(0, 0.12, 0.26)),      // Complex III
    positioned[4].clone().add(v(0, 0.56, 0.22)),      // Cit. c strictly in IMS (+Y)!
    positioned[5].clone().add(v(-0.08, 0.34, 0.26)),  // Complex IV Cu_A (IMS face)
    positioned[5].clone().add(v(0.02, 0.0, 0.26)),    // Complex IV heme a (internal core)
    stop
      ? positioned[5].clone().add(v(0.02, -0.08, 0.28))
      : oxygenTarget.position.clone().add(v(0, 0.06, 0.04)) // O2 reduction INSIDE Complex IV heme a3/Cu_B pocket!
  ]);
  const routes = [[fullRoute(0, false), fullRoute(1, false)], [fullRoute(0, true), fullRoute(1, true)]];

  const arcMatI = glow('#ffe37d', 0.72, { transparent: true, opacity: 0.34, depthWrite: false });
  const arcMatII = glow('#a8f0c0', 0.6, { transparent: true, opacity: 0.24, depthWrite: false });
  const arcI = mesh(mito, new T.TubeGeometry(routes[0][0], 56, 0.022, 6, false), arcMatI);
  const arcII = mesh(mito, new T.TubeGeometry(routes[0][1], 44, 0.017, 6, false), arcMatII);

  const blockade = group(mito, 3.62, innerMemY(3.62) + 0.2, innerMemZ(3.62) + 0.42);
  const alertMat = glow('#ff526c', 0.95);
  for (const d of [-1, 1]) rod(blockade, alertMat, v(-.21, d * -.21, 0), v(.21, d * .21, 0), .045);
  const alertRing = torus(blockade, glow('#ff824a', 0.85, { transparent: true, opacity: 0.75, depthWrite: false }), 0.46, 0.024, 0, -0.35, -0.2);

  const acetylDots = particles(bridge, '#9ee895', .076, 12, 0.65);
  // Scientifically accurate Matrix routes: NADH & FADH2 originate INSIDE THE MATRIX from Krebs Cycle -> Complex I & II!
  const nadhRoute = curve([v(-0.62, -1.24, 1.05), v(-1.38, -0.96, 1.08), positioned[0].clone().add(v(-0.42, -0.68, 0.2))]);
  const fadhRoute = curve([v(-0.22, -1.04, 1.06), v(-0.42, -0.78, 1.06), positioned[1].clone().add(v(0.0, -0.44, 0.18))]);
  const nadhFeed = particles(mito, '#7ff5c8', 0.068, 10, 0.9);
  const fadhFeed = particles(mito, '#ffd478', 0.064, 8, 0.88);
  addLabel('NADH / FADH₂ (Matriz)', mito, v(-1.12, -0.92, 1.18));
  addLabel('ADP + Pi → ATP', atp, v(.11, -1.24, .38));
  const glycolDots = particles(glycol, '#8df7ea', .066, 10, 0.7);
  const fermDots = particles(fermentation, '#ffbf78', .07, 16, 0.78);
  const e = particles(mito, '#ffea75', .068, 46, 0.95);
  // Dual-compartment H+ pools strictly contained INSIDE the curved mitochondrial oval:
  // 1) protons: Intermembrane Space (IMS, ABOVE inner membrane — builds progressively & packs densest at the final right end!)
  // 2) matrixProtons: Mitochondrial Matrix (BELOW inner membrane — always present at baseline, high initially & depleted as pumping builds!)
  const protons = particles(mito, '#4ae6ff', .068, 148, 0.92);
  const matrixProtons = particles(mito, '#36c4f2', .064, 64, 0.84);
  const pumped = particles(mito, '#80f4ff', .074, 36, 0.94);
  const returning = particles(mito, '#56e8ff', .072, 22, 0.94);
  const outward = particles(mito, '#8cffd4', .082, 14, 0.92);
  const waters = particles(mito, '#68e2eb', .056, 12, 0.7);
  const co2 = particles(krebs, '#f2b892', .06, 13, 0.65);

  const yieldValue = metric('BALANÇO ENERGÉTICO', '≈30–32 ATP');
  const nadh = metric('NADH · PRODUÇÃO / REOX.', '10 / 10');
  const fadh = metric('FADH₂ · PRODUÇÃO / REOX.', '2 / 2');
  const consumption = metric('FLUXO RELATIVO', '100%');
  const products = metric('PRODUTOS PRINCIPAIS', '6 CO₂ + 6 H₂O');
  const circuit = metric('GRADIENTE · pH (EIM/MAT)', '6,8 / 7,8');
  const meter = node('progress', { max: 32, value: 32, 'aria-label': 'Rendimento energético estimado' });
  const explanation = node('div');
  const stagesHeading = node('h3', {}, 'Etapas do metabolismo e gradiente de H⁺');
  const stagesBar = row();
  const status = node('p', { className: 'pill', role: 'status' });

  function updateGuide() {
    const isPhoto = mode === 'photosynthesis';
    const curStage = stages[activeStage] || stages[0];
    const text = isPhoto
      ? 'ANABOLISMO (síntese de glicose com gasto de energia luminosa): 6 CO₂ + 12 H₂O + Luz → C₆H₁₂O₆ + 6 O₂ + 6 H₂O. Nos tilacoides (fase fotoquímica), a luz excita elétrons e quebra H₂O liberando O₂, gerando ATP e NADPH. No estroma (Ciclo de Calvin), CO₂ é fixado formando glicose. Característico de seres autótrofos.'
      : mode === 'aerobic' ? (inhibited
        ? 'O cianeto bloqueia o Complexo IV. O fluxo de elétrons para o O₂ cessa, os H⁺ voltam ao equilíbrio entre matriz e espaço intermembranas, o gradiente se dissipa e a ATP sintase para.'
        : oxygen === 0
        ? 'Sem O₂ (aceptor final) no Complexo IV, a cadeia engargala, o gradiente de H⁺ colapsa para o equilíbrio e o metabolismo desloca-se para o citosol.'
        : curStage[4])
      : (mode === 'lactate'
        ? 'Fermentação lática (anaeróbica no citosol): piruvato aceita elétrons do NADH gerando 2 lactatos e regenerando NAD⁺ para manter o saldo de 2 ATP da glicólise. Comum em contração muscular vigorosa e eritrócitos.'
        : 'Fermentação alcoólica (anaeróbica no citosol, ex.: leveduras): o piruvato libera CO₂ e forma etanol (2 EtOH + 2 CO₂), regenerando NAD⁺ para sustentar os 2 ATP da glicólise.');
    explanation.replaceChildren(card('O que está acontecendo', text));
    if (mode === 'aerobic' && (oxygen === 0 || inhibited)) {
      explanation.append(note('Sem respiração mitocondrial ativa, a glicólise só mantém 2 ATP se uma via fermentativa regenerar NAD⁺.'));
    } else if (mode === 'aerobic') {
      explanation.append(note('Use as etapas 3 → 4 → 5 → 6 acima para observar como o bombeamento (I/III/IV) cria e mantém o acúmulo de H⁺ no espaço intermembranar sempre maior do que na matriz, impulsionando a ATP sintase.'));
    }
    stagesHeading.hidden = false;
    stagesBar.hidden = false;
    const camList = isPhoto ? photoStages : stages;
    stagesBar.replaceChildren(...camList.map((entry, idx) =>
      button(entry[0], () => {
        if (!isPhoto) activeStage = idx;
        engine.view(entry[1], entry[2]);
        audio.play('click');
        updateGuide();
      }, !isPhoto ? { 'aria-pressed': String(idx === activeStage) } : {})
    ));
  }

  const inhibitor = toggle('Inibidor · Cianeto (IV)', false, value => {
    inhibited = value;
    audio.play(value ? 'alert' : 'click');
    updateGuide();
  });
  const oxygenControl = range('Disponibilidade de O₂', 0, 100, 1, oxygen, value => { oxygen = value; updateGuide(); }, x => x + '%', { wheel: true, reset: 100 });
  const sliderLabelNode = oxygenControl.element.querySelector('.field-title').firstChild;

  toolbar.append(
    select('Via metabólica', modes, mode, value => {
      mode = value;
      activeStage = 0;
      const isPhoto = mode === 'photosynthesis';
      inhibitor.disabled = mode !== 'aerobic';
      if (mode !== 'aerobic' && inhibited) {
        inhibited = false;
        inhibitor.setAttribute('aria-pressed', 'false');
      }
      const nextVal = mode === 'aerobic' || isPhoto ? 100 : 0;
      oxygenControl.set(nextVal);
      oxygen = nextVal;
      if (sliderLabelNode) sliderLabelNode.textContent = isPhoto ? 'Intensidade luminosa' : 'Disponibilidade de O₂';
      if (isPhoto) engine.view([0, 2.2, 16.2], [0.2, 0.1, 0.4]);
      else engine.view(stages[0][1], stages[0][2]);
      audio.play('click');
      updateGuide();
    }).element,
    oxygenControl.element,
    inhibitor
  );

  guide.append(
    status, heading('Balanço metabólico'), meter,
    node('div', { className: 'metrics' }, ...[yieldValue, nadh, fadh, consumption, products, circuit].map(item => item.element)),
    legend([['#ffea75', 'e⁻ / Fótons'], ['#66e6ff', 'H⁺ / H₂O'], ['#8cffd4', 'ATP'], ['#f2b892', 'CO₂']]),
    stagesHeading, stagesBar, explanation,
    card('Anabolismo × Catabolismo e Homeostase',
      'Metabolismo é o conjunto de reações químicas que mantêm a vida e a homeostase (equilíbrio interno estável, como um termostato). Anabolismo constrói moléculas complexas gastando energia (ex.: Fotossíntese em autótrofos); Catabolismo quebra moléculas gerando energia (ex.: Respiração celular e Fermentação em autótrofos e heterótrofos).'),
    card('Fermentação × respiração anaeróbica', 'Na fermentação, um composto orgânico recebe elétrons no citosol e o ATP vem da glicólise. Na respiração anaeróbica há cadeia transportadora com aceptores inorgânicos (ex.: NO₃⁻ ou SO₄²⁻).'),
    node('details', {}, node('summary', {}, 'Estequiometria e Bibliografia (Lehninger · Alberts · Taiz & Zeiger)'),
      card('Balanço de ATP (Lehninger, 8ª ed.)', 'Glicólise (citosol): 2 ATP líquidos + 2 NADH. Oxidação do piruvato (PDH): 2 NADH + 2 CO₂. Ciclo de Krebs (2 voltas): 2 GTP/ATP + 6 NADH + 2 FADH₂ + 4 CO₂. Cadeia respiratória: Complexos I (4 H⁺), III (4 H⁺) e IV (2 H⁺) geram ~2,5 ATP/NADH e ~1,5 ATP/FADH₂ → saldo real de 30 a 32 ATP por glicose (dependendo da lançadeira mitocondrial malato-aspartato ou glicerol-3-P).'),
      card('Fotossíntese (Taiz & Zeiger)', 'Equação global: 6 CO₂ + 12 H₂O + luz → C₆H₁₂O₆ + 6 O₂ + 6 H₂O. A cadeia em Z (PSII P680 → PQ → Cit b₆f → PC → PSI P700 → FNR) fornece 18 ATP e 12 NADPH consumidos no Ciclo de Calvin-Benson catalisado pela RuBisCO (L₈S₈).')),
    node('details', {}, node('summary', {}, 'Redox na cadeia transportadora (Complexos I–IV)'),
      ...complexes.map(([key, , , , description]) => card(['Q', 'Cit. c'].includes(key) ? key : 'Complexo ' + key, description)))
  );

  const ray = new T.Raycaster();
  const pointer = new T.Vector2();
  const canvas = engine.renderer.domElement;
  const pickRoots = Array.from(interactives.values(), item => item.object);
  const photoPickRoots = Array.from(photo.interactives.values(), item => item.object);

  function activeInteractives() {
    return mode === 'photosynthesis' ? photo.interactives : interactives;
  }

  function pickAt(event) {
    const roots = mode === 'photosynthesis' ? photoPickRoots : pickRoots;
    const bounds = canvas.getBoundingClientRect();
    pointer.set((event.clientX - bounds.left) / bounds.width * 2 - 1, 1 - (event.clientY - bounds.top) / bounds.height * 2);
    ray.setFromCamera(pointer, engine.camera);
    for (const hit of ray.intersectObjects(roots, true)) {
      let obj = hit.object;
      while (obj && !obj.userData.pickKey) obj = obj.parent;
      if (obj?.userData.pickKey) return obj.userData.pickKey;
    }
    return null;
  }

  let downAt = null;
  canvas.addEventListener('pointermove', event => {
    if (event.buttons) { hideTooltip(tooltip, viewport); return; }
    const key = pickAt(event);
    hoveredKey = key;
    if (key) {
      const info = activeInteractives().get(key);
      if (info) showTooltip(tooltip, viewport, event.clientX, event.clientY, info.title, info.subtitle, info.color);
    } else {
      hideTooltip(tooltip, viewport);
    }
  }, { signal });
  canvas.addEventListener('pointerleave', () => { hoveredKey = null; hideTooltip(tooltip, viewport); }, { signal });
  canvas.addEventListener('pointerdown', event => { downAt = [event.clientX, event.clientY]; }, { signal });
  canvas.addEventListener('pointerup', event => {
    const orig = downAt;
    downAt = null;
    if (!orig || Math.hypot(orig[0] - event.clientX, orig[1] - event.clientY) > 7) return;
    const key = pickAt(event);
    if (key) {
      const info = activeInteractives().get(key);
      if (info) {
        audio.play('click');
        engine.view(info.focusEye, info.focusTarget);
      }
    }
  }, { signal });

  updateGuide();
  const point = v();
  const place = (put, i, p, scale = 1) => put(i, p.x, p.y, p.z, scale);
  const cAlert = new T.Color('#ff4d5e');
  const cAmber = new T.Color('#ffb347');
  const cTmp = new T.Color();

  return {
    update(dt) {
      phase += dt;
      bioEnv.update(phase);
      const isPhoto = mode === 'photosynthesis';
      const aerobic = mode === 'aerobic';
      const supplied = oxygen / 100;
      bioEnv.setTint(isPhoto ? '#142a1e' : '#131a21');

      // Toggle cleanly between Chloroplast Photosynthesis (Anabolism) & Mitochondria/Cytosol (Catabolism)
      photo.root.visible = isPhoto;
      catabRoot.visible = !isPhoto;
      for (const l of photo.labels) l.enabled = isPhoto;
      for (const l of catabLabels) l.enabled = !isPhoto;

      const lightBlend = 1 - Math.exp(-dt * 4);
      photoLight.intensity += ((isPhoto ? 1.5 + supplied * 3.2 : 0) - photoLight.intensity) * lightBlend;

      if (isPhoto) {
        mitoLight.intensity += (0 - mitoLight.intensity) * lightBlend;
        cytoLight.intensity += (0 - cytoLight.intensity) * lightBlend;
        alertLight.intensity += (0 - alertLight.intensity) * lightBlend;
        photo.update(phase, dt, supplied);
        if (phase >= nextLive) {
          nextLive = phase + 0.16;
          const pct = Math.round(supplied * 100);
          status.className = 'pill' + (pct === 0 ? ' warn' : '');
          status.textContent = pct > 0 ? 'ANABOLISMO · FOTOSSÍNTESE ATIVA' : 'SEM LUZ · FASE CLARA PARADA';
          yieldValue.value.textContent = pct > 0 ? '1 Glicose' : '0 Glicose';
          meter.value = supplied * 32;
          nadh.value.textContent = 'NADPH ' + pct + '%';
          fadh.value.textContent = 'ATP (clara) ' + pct + '%';
          consumption.value.textContent = 'Luz ' + pct + '%';
          products.value.textContent = pct > 0 ? 'C₆H₁₂O₆ + 6 O₂' : 'Aguardando luz';
          circuit.value.textContent = 'Luz ' + pct + '%';
        }
        return;
      }

      // Stage-responsive biochemical gradient state (respects O2 & cyanide inhibition overrides!)
      // Physiological invariant: under normal aerobic conditions, IMS [H+] is ALWAYS > Matrix [H+]!
      const activeKey = aerobic && !inhibited && supplied > 0 ? (stages[activeStage]?.[3] || 'full') : 'off';
      let targetChain = aerobic && !inhibited ? supplied : 0;
      let targetGrad = targetChain;
      let targetMatrix = aerobic ? 0.30 : 0.42;
      let targetIms = aerobic ? 0.94 : 0.18;
      let targetBuild = aerobic ? 0.92 : 0;
      if (activeKey === 'basal_grad') {
        // Living cell physiological baseline: EIM ALREADY has higher [H+] (~80) than Matrix (~23)!
        targetChain = supplied * 0.45;
        targetGrad = supplied * 0.42;
        targetMatrix = 0.36; // ~23 basal Matrix H+ (pH ~7.6)
        targetIms = 0.54;    // ~80 EIM H+ (pH ~7.1 — ALREADY > Matrix!)
        targetBuild = 0.42;
      } else if (activeKey === 'pumping') {
        targetChain = supplied;
        targetGrad = supplied * 0.72;
        targetMatrix = 0.30; // ~19 Matrix H+ (pH ~7.7)
        targetIms = 0.78;    // ~115 EIM H+ building up along crista (pH ~6.9)
        targetBuild = 0.74;
      } else if (activeKey === 'peak_end') {
        targetChain = supplied;
        targetGrad = supplied * 0.98;
        targetMatrix = 0.26; // ~17 alkaline Matrix H+ (pH ~7.8)
        targetIms = 1.0;     // 148 dense EIM H+ concentrated toward Complex IV & F0 (pH ~6.8)
        targetBuild = 1.0;
      } else if (activeKey === 'chemiosmosis' || activeKey === 'full') {
        targetMatrix = 0.30;
        targetIms = 0.94 * supplied;
        targetBuild = 0.92 * supplied;
      } else if (aerobic) {
        // Anoxia or cyanide blockade: gradient dissipates toward equilibrium (EIM ≈ Matrix, pH ~7.3 / 7.3 — never inverted!)
        targetMatrix = 0.46;
        targetIms = 0.20;
        targetBuild = 0.0;
      }

      const blend = 1 - Math.exp(-dt * (inhibited ? 6.5 : 2.8));
      chainRate += (targetChain - chainRate) * blend;
      gradient += (targetGrad - gradient) * (1 - Math.exp(-dt * 1.8));
      matrixLevel += (targetMatrix - matrixLevel) * (1 - Math.exp(-dt * 2.2));
      imsDensity += (targetIms - imsDensity) * (1 - Math.exp(-dt * 2.2));
      stageBuild += (targetBuild - stageBuild) * (1 - Math.exp(-dt * 2.2));

      // Smooth integrated biochemical phase prevents any jump/reversal when O2, stage or inhibitor toggles!
      chainPhase += dt * (0.06 + chainRate * 0.94);
      gradPhase += dt * (0.04 + gradient * 0.96);
      mtDna.rotation.z = phase * 0.25;

      const backing = aerobic && (inhibited || supplied === 0);
      const cytosolFocus = !aerobic || backing;

      mitoLight.intensity += ((cytosolFocus ? 0.95 : 1.7 + chainRate * 1.1) - mitoLight.intensity) * lightBlend;
      cytoLight.intensity += ((cytosolFocus ? 4.2 : 0.65) - cytoLight.intensity) * lightBlend;
      alertLight.intensity += ((backing ? (inhibited ? 3.2 : 1.8) + Math.sin(phase * 7) * 0.9 : 0) - alertLight.intensity) * (1 - Math.exp(-dt * 7));

      fermTubeMat.emissiveIntensity += ((cytosolFocus ? 0.55 : 0.14) - fermTubeMat.emissiveIntensity) * lightBlend;
      glycolTubeMat.emissiveIntensity += ((cytosolFocus ? 0.42 : 0.14) - glycolTubeMat.emissiveIntensity) * lightBlend;

      outerBack.material.opacity = .12 + chainRate * .14;
      gradientHazeMat.opacity = Math.max(0.015, stageBuild * 0.18);
      bridge.visible = aerobic;
      fermentation.visible = !aerobic;
      fermLabel.enabled = productLabel.enabled = !aerobic;
      const productName = mode === 'lactate' ? '2 Lactatos' : '2 Etanol + 2 CO₂';
      if (!aerobic && productLabel.item.textContent !== productName) productLabel.item.textContent = productName;

      blockade.visible = aerobic && inhibited;
      if (blockade.visible) {
        const pulse = 0.5 + 0.5 * Math.sin(phase * 7.5);
        alertRing.scale.setScalar(0.92 + pulse * 0.24);
        alertRing.material.opacity = 0.45 + pulse * 0.45;
      }
      oxygenTarget.visible = aerobic;
      oxygenMat.emissiveIntensity = 0.2 + supplied * 0.55;

      const hoverBlend = 1 - Math.exp(-dt * 10);
      for (const [key, item] of interactives) {
        const isHov = key === hoveredKey;
        const isAlertIV = key === 'IV' && backing;
        item.object.traverse(child => {
          const mat = child.material;
          if (!mat || !mat.isMeshStandardMaterial) return;
          if (mat.userData.baseEm === undefined) {
            mat.userData.baseEm = mat.emissive.clone();
            mat.userData.baseEmInt = mat.emissiveIntensity;
          }
          if (isAlertIV) {
            const wPulse = 0.5 + 0.5 * Math.sin(phase * 6.5);
            cTmp.copy(cAlert).lerp(cAmber, wPulse * 0.45);
            mat.emissive.lerp(cTmp, hoverBlend);
            mat.emissiveIntensity += ((0.55 + wPulse * 0.48) - mat.emissiveIntensity) * hoverBlend;
          } else if (isHov) {
            mat.emissive.lerp(mat.color, hoverBlend);
            mat.emissiveIntensity += ((mat.userData.baseEmInt + 0.36) - mat.emissiveIntensity) * hoverBlend;
          } else {
            mat.emissive.lerp(mat.userData.baseEm, hoverBlend);
            mat.emissiveIntensity += (mat.userData.baseEmInt - mat.emissiveIntensity) * hoverBlend;
          }
        });
      }

      if (carrierObjects.Q) {
        // Ubiquinone (Q) stays strictly INSIDE the hydrophobic bilayer between Complex II & III (zero clipping!)
        const qx = 0.53 + Math.sin(chainPhase * 2.1) * 0.32 * chainRate;
        carrierObjects.Q.object.position.set(qx, innerMemY(qx), innerMemZ(qx));
      }
      if (carrierObjects['Cit. c']) {
        // Cytochrome c glides strictly on the IMS (+Y) face between Complex III & IV (zero clipping!)
        const cx = 2.61 + Math.sin(chainPhase * 2.4 + 1.1) * 0.32 * chainRate;
        carrierObjects['Cit. c'].object.position.set(cx, innerMemY(cx) + Math.abs(Math.cos(chainPhase * 2.4)) * 0.05 * chainRate, innerMemZ(cx));
      }

      arcI.visible = aerobic;
      arcII.visible = aerobic;
      if (aerobic) {
        const arcPulse = 0.85 + 0.15 * Math.sin(phase * 6);
        arcMatI.opacity = backing ? 0.18 * arcPulse : Math.max(0.05, chainRate * 0.4 * arcPulse);
        arcMatI.color.set(backing ? '#ff9d5c' : '#ffe37d');
        arcMatI.emissive.set(backing ? '#ff763b' : '#ffe37d');
        arcMatII.opacity = backing ? 0.1 : Math.max(0.03, chainRate * 0.28);
      }

      const krebsRate = aerobic ? chainRate : 0;
      ring.material.color.set(krebsRate > .06 ? '#68b88a' : '#4a5861');
      cycleMarker.visible = krebsRate > .025;
      cycleMarker.position.set(Math.cos(chainPhase * 2.15) * .74, Math.sin(chainPhase * 2.15) * .43, .06);
      for (let i = 0; i < 8; i++) putKrebs(i, Math.cos(i * tau / 8) * .74, Math.sin(i * tau / 8) * .43, .02, .38 + krebsRate * .62);
      krebsBeads.instanceMatrix.needsUpdate = true;

      const prevAngle = rotor.rotation.y;
      rotor.rotation.y += dt * gradient * 10.8;
      for (const s of f1Subunits) {
        if (s.isBeta) {
          const conf = Math.sin(rotor.rotation.y - s.angle) * gradient;
          s.mesh.scale.set(0.19 + conf * 0.026, 0.25 - conf * 0.022, 0.19 + conf * 0.026);
        }
      }
      if (gradient > 0.12 && Math.floor(rotor.rotation.y / (tau / 3)) !== Math.floor(prevAngle / (tau / 3))) atpPulseAge = 0;
      if (atpPulseAge < 1) {
        atpPulseAge = Math.min(1, atpPulseAge + dt * 2.4);
        atpPulseRing.scale.setScalar(0.65 + atpPulseAge * 1.45);
        atpPulseRing.material.opacity = (1 - atpPulseAge) * 0.72 * gradient;
      } else atpPulseRing.material.opacity = 0;

      drawParticles(glycolDots, aerobic ? .38 + chainRate * .62 : 1, (put, i) =>
        place(put, i, glycolPath.getPoint((phase * .48 + i * .17) % 1, point)));
      drawParticles(acetylDots, aerobic ? chainRate : 0, (put, i) =>
        place(put, i, pyruvatePath.getPoint((chainPhase * .55 + i * .128) % 1, point)));
      drawParticles(nadhFeed, aerobic ? chainRate : 0, (put, i) =>
        place(put, i, nadhRoute.getPoint((chainPhase * .62 + i / nadhFeed.max) % 1, point), 0.92));
      drawParticles(fadhFeed, aerobic ? chainRate : 0, (put, i) =>
        place(put, i, fadhRoute.getPoint((chainPhase * .56 + i / fadhFeed.max) % 1, point), 0.88));
      drawParticles(fermDots, aerobic ? 0 : 1, (put, i) =>
        place(put, i, fermentationPath.getPoint((phase * .54 + i * .109) % 1, point), mode === 'lactate' ? .88 : 1.1));

      drawParticles(e, aerobic ? (backing ? .58 : chainRate) : 0, (put, i) => {
        const p = ((backing ? phase * .22 : chainPhase * .48) + i * .078) % 1;
        const route = routes[Number(backing)][i % 5 === 0 ? 1 : 0];
        if (backing) {
          const stalled = Math.min(0.95, p * 1.85);
          route.getPoint(stalled, point);
          const jitter = stalled > 0.8 ? Math.sin(phase * 14 + i * 2.3) * 0.09 : 0;
          put(i, point.x + jitter, point.y + Math.cos(phase * 11 + i) * (stalled > 0.8 ? 0.08 : 0.02), point.z, stalled > 0.85 ? 1.15 : 0.82);
        } else {
          route.getPoint(p, point);
          place(put, i, point, 0.92 + Math.sin(phase * 9 + i) * 0.16);
        }
      });

      // 1) IMS Protons (ABOVE inner membrane): strictly clipped INSIDE the curved mitochondrial outer shell!
      // Power-law spatial mapping shifts H+ density progressively left-to-right so there are MORE H+ accumulated at the final right end (near IV & ATP Synthase)!
      drawParticles(protons, Math.max(0, Math.min(1, imsDensity)), (put, i) => {
        const rawU = (gradPhase * (0.065 + stageBuild * 0.085) + i * 0.0473) % 1;
        // skew = 1.0 -> uniform (initial equilibrium); skew = 0.52 -> strong right-end accumulation!
        const skew = 1.0 - stageBuild * 0.48;
        const u = Math.pow(rawU, skew);
        const px = -1.85 + u * 7.45; // strictly inside [-1.85, +5.60]
        const yMin = innerMemY(px) + 0.28;
        const yMax = Math.max(yMin + 0.08, mitoOuterTopY(px) - 0.22);
        const yFrac = ((i * 19) % 23) / 22;
        const py = Math.min(yMax, Math.max(yMin, yMin + yFrac * (yMax - yMin) + Math.sin(phase * 2.1 + i) * 0.065));
        const pz = innerMemZ(px) - 0.14 + (((i * 7) % 13) / 12) * 0.46;
        // Slightly larger / brighter feel toward the concentrated right end!
        const sc = 0.78 + stageBuild * u * 0.26;
        put(i, px, py, pz, sc);
      });

      // 2) Matrix Protons (BELOW inner membrane): ALWAYS present inside the lower mitochondrial oval!
      // High concentration initially (pH ~7.3), visibly decreases as I/III/IV pump H+ up (pH ~7.8), feeding pumps & O2 -> H2O!
      drawParticles(matrixProtons, Math.max(0, Math.min(1, matrixLevel)), (put, i) => {
        const u = (phase * 0.055 + i * 0.0617) % 1;
        const px = -1.72 + u * 7.05; // strictly inside [-1.72, +5.33]
        const yBot = mitoOuterBotY(px) + 0.24;
        const yTop = Math.max(yBot + 0.08, innerMemY(px) - 0.36);
        const yFrac = ((i * 17) % 19) / 18;
        const py = Math.min(yTop, Math.max(yBot, yBot + yFrac * (yTop - yBot) + Math.cos(phase * 1.9 + i * 1.3) * 0.07));
        const pz = 0.40 + (((i * 11) % 13) / 12) * 0.62;
        put(i, px, py, pz, 0.80 + matrixLevel * 0.14);
      });

      // 3) H+ pumped strictly THROUGH the hollow transmembrane bores of Complexes I (4 H+), III (4 H+) & IV (2 H+)!
      drawParticles(pumped, chainRate, (put, i) => {
        const p = (chainPhase * .68 + i * .161) % 1;
        const idx = [0, 0, 3, 3, 5][i % 5]; // authentic 4 : 4 : 2 stoichiometric pumping ratio!
        const source = positioned[idx];
        const boreX = idx === 0 ? source.x + 0.04 : source.x;
        const topReach = Math.min(source.y + 0.96, mitoOuterTopY(boreX) - 0.24);
        const botStart = source.y - 0.54;
        put(i, boreX + .032 * Math.cos(p * 8 + i), botStart + p * (topReach - botStart), source.z + .032 * Math.sin(p * 8 + i), Math.sin(p * Math.PI) * .62 + .38);
      });

      // 4) H+ funnels DOWN straight through hollow F0 c-ring of ATP Synthase (IMS +Y -> Matrix -Y) & fans back into Matrix!
      drawParticles(returning, gradient, (put, i) => {
        const p = (gradPhase * .74 + i * .089) % 1;
        const fan = Math.max(0, (p - 0.68) / 0.32);
        const spreadX = Math.sin(i * 2.4) * 0.55 * fan;
        const spreadZ = Math.cos(i * 1.7) * 0.25 * fan;
        const rx = atp.position.x + .035 * Math.sin(p * 9 + i) + spreadX;
        const ry = Math.max(mitoOuterBotY(rx) + 0.24, atp.position.y + .78 - p * 1.56);
        put(i, rx, ry, atp.position.z + .035 * Math.cos(p * 9 + i) + spreadZ, .82 - fan * 0.18);
      });
      // ATP released into the Mitochondrial Matrix (-Y) from the catalytic F1 beta subunits!
      drawParticles(outward, gradient, (put, i) => {
        const p = (gradPhase * .6 + i * .112) % 1;
        const spread = (i % 3 - 1) * 0.24;
        put(i, atp.position.x + p * (.85 + spread), atp.position.y - .72 - p * .58, atp.position.z + .24 + .12 * Math.sin(i * 2.1), 1.38 - p * .45);
      });
      // Newly formed H2O exits straight DOWN into the Matrix directly from Complex IV's heme a3/Cu_B pocket!
      drawParticles(waters, chainRate, (put, i) => {
        const p = (chainPhase * .75 + i * .18) % 1;
        put(i, oxygenTarget.position.x + Math.sin(i * 1.9) * 0.16 * p, oxygenTarget.position.y - 0.10 - p * 0.82, oxygenTarget.position.z + Math.cos(i * 1.4) * .14, 1.12 - p * 0.80);
      });
      drawParticles(co2, krebsRate, (put, i) => {
        const p = (chainPhase * .52 + i * .145) % 1;
        put(i, -.57 - p * 1.2, -.09 + p * .68, .24 + Math.cos(i * 2.1) * .22, 1 - p * .65);
      });

      if (aerobic && gradient > .22 && phase - lastPulse > 1.25 / gradient) {
        audio.play('atp');
        lastPulse = phase;
      }

      if (phase < nextLive) return;
      nextLive = phase + .16;
      const living = Math.round(chainRate * 100);
      const proton = Math.round(gradient * 100);
      const energetic = aerobic ? 2 + 2 * chainRate + 28 * gradient : 2;
      status.className = 'pill' + (aerobic && inhibited ? ' danger' : (aerobic && supplied === 0) || !aerobic ? ' warn' : '');
      status.textContent = aerobic ? inhibited ? 'COMPLEXO IV INIBIDO · CIANETO' : supplied ? 'CATABOLISMO · RESPIRAÇÃO AERÓBICA' : 'ANOXIA · FOCO NO CITOSOL' :
        mode === 'lactate' ? 'CATABOLISMO · FERMENTAÇÃO LÁTICA' : 'CATABOLISMO · FERMENTAÇÃO ALCOÓLICA';
      yieldValue.value.textContent = aerobic && living >= 98 && proton >= 98 ? '≈30–32 ATP' : energetic < 2.15 ? (aerobic ? '2* ATP' : '2 ATP') : '≈' + formatNumber(energetic, 1) + ' ATP';
      meter.value = energetic;
      nadh.value.textContent = aerobic ? (living >= 98 ? '10 / 10' : 'Cadeia ' + living + '%') : '2 / 2';
      fadh.value.textContent = aerobic ? (living >= 98 ? '2 / 2' : 'Oxidação ' + living + '%') : '0 / 0';
      consumption.value.textContent = 'O₂ ' + (aerobic ? living : 0) + '%';
      products.value.textContent = aerobic ? living >= 98 ? '6 CO₂ + 6 H₂O' : living ? 'CO₂ reduzido' : 'Bloqueado' :
        mode === 'lactate' ? '2 lactatos' : '2 etanóis + 2 CO₂';
      const phIms = 7.35 - stageBuild * 0.55;
      const phMat = 7.35 + stageBuild * 0.48;
      const imsTxt = stageBuild < 0.15
        ? `EIM · gradiente dissipado (pH ~${formatNumber(phIms, 1)})`
        : stageBuild < 0.60
        ? `EIM · H⁺ já > Matriz (pH ~${formatNumber(phIms, 1)})`
        : `EIM · acúmulo H⁺ → (pH ~${formatNumber(phIms, 1)})`;
      const matTxt = stageBuild < 0.15
        ? `Matriz · equilíbrio (pH ~${formatNumber(phMat, 1)})`
        : `Matriz · H⁺ basal (pH ~${formatNumber(phMat, 1)})`;
      if (imsLabel.item.textContent !== imsTxt) imsLabel.item.textContent = imsTxt;
      if (matLabel.item.textContent !== matTxt) matLabel.item.textContent = matTxt;
      circuit.value.textContent = `pH ${formatNumber(phIms, 1)} / ${formatNumber(phMat, 1)}`;
    }
  };
}
