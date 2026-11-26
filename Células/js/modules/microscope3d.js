import * as T from 'three';
import {
  group, mesh, box, sphere, cylinder, lathe, torus, rod, tube, v, glow, material, platform,
  enamelMaterial, metalMaterial, anodizedMaterial, glassMaterial, frostedGlassMaterial, gelMaterial
} from '../core/geometry.js';
import { tissues, stains, readySlides } from '../data/tissues.js?v=24';
import { lenses, fovFor, apertureFor, depthOfField, fmt, Ocular } from '../core/microscopeOptics.js?v=25';
import { onBeePhotoLoad, isBeePhotoReady } from '../core/histofield.js?v=24';
import { insectReference } from '../core/insectReference.js?v=1';
import { deviceProfile } from '../core/deviceProfile.js?v=23';
import { node, button, select, toggle, range, row, card, heading, note, metric, showTooltip, hideTooltip } from '../core/ui.js?v=9';

// Helper: beveled rounded-rectangle slab (replaces harsh sharp boxes across clinical instruments!)
function roundedSlab(parent, mat, w, d, h, r, bevel = 0.045, x = 0, y = 0, z = 0) {
  const hw = w / 2, hd = d / 2, cr = Math.min(r, hw * 0.48, hd * 0.48);
  const s = new T.Shape();
  s.moveTo(-hw + cr, -hd);
  s.lineTo(hw - cr, -hd);
  s.quadraticCurveTo(hw, -hd, hw, -hd + cr);
  s.lineTo(hw, hd - cr);
  s.quadraticCurveTo(hw, hd, hw - cr, hd);
  s.lineTo(-hw + cr, hd);
  s.quadraticCurveTo(-hw, hd, -hw, hd - cr);
  s.lineTo(-hw, -hd + cr);
  s.quadraticCurveTo(-hw, -hd, -hw + cr, -hd);
  const geo = new T.ExtrudeGeometry(s, {
    depth: Math.max(0.01, h - bevel * 2),
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 4,
    curveSegments: 12
  });
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, -h / 2 + bevel, 0);
  geo.computeVertexNormals();
  return mesh(parent, geo, mat, x, y, z);
}

function microscope(scene) {
  platform(scene, false);
  const root = group(scene, -2.55, 0, 0);

  // Authentic clinical Zeiss/Leica studio material palette
  const enamel = enamelMaterial('#e1e6ea', { roughness: 0.28, clearcoat: 0.55 });
  const enamelDark = enamelMaterial('#c5ced6', { roughness: 0.34, clearcoat: 0.42 });
  const silver = metalMaterial('#bcc8d2', { roughness: 0.22, metalness: 0.88 });
  const chrome = metalMaterial('#e6eef4', { metalness: 0.95, roughness: 0.11 });
  const brass = metalMaterial('#c7ad78', { metalness: 0.82, roughness: 0.28 });
  const dark = anodizedMaterial('#1d2530', { roughness: 0.32, metalness: 0.6 });
  const black = anodizedMaterial('#10161e', { roughness: 0.28, metalness: 0.52 });
  const rubber = material('#141920', { roughness: 0.78, metalness: 0.05 });
  const markerCyan = glow('#52e0f0', 0.72);
  const markerFine = glow('#58d8a2', 0.85);
  const lightMat = glow('#ffe7b0', 1.25);
  const lensGlass = glassMaterial('#58b4d4', { opacity: 0.9, iridescence: 0.62, roughness: 0.04, clearcoat: 1.0 });
  const blueFilterMat = glassMaterial('#4ea4f0', { opacity: 0.56, iridescence: 0.38, roughness: 0.06 });
  const glass = glassMaterial('#d0f2f8', { opacity: 0.44, clearcoat: 1.0 });
  const frosted = frostedGlassMaterial('#d8e6ec');

  const interactives = new Map();

  // =========================================================================
  // 1. SCULPTED DIE-CAST ERGONOMIC BASE & KÖHLER COLLECTOR ILLUMINATOR
  // =========================================================================
  roundedSlab(root, dark, 3.36, 3.74, 0.28, 0.42, 0.05, 0, 0.17, 0.36);
  roundedSlab(root, enamel, 3.06, 3.44, 0.24, 0.36, 0.055, 0, 0.41, 0.34);
  // Chamfered brushed-chrome front edge trim + glowing power rocker & LED status bar
  roundedSlab(root, silver, 2.55, 0.14, 0.075, 0.04, 0.015, 0, 0.42, 2.04);
  box(root, markerCyan, 0.38, 0.028, 0.032, -0.82, 0.435, 2.09);
  roundedSlab(root, black, 0.26, 0.14, 0.11, 0.03, 0.014, -1.16, 0.42, 1.98);
  // Subtle rubber isolation feet
  for (const fx of [-1.36, 1.36]) {
    for (const fz of [-1.18, 1.88]) {
      lathe(root, rubber, [[0.01, 0], [0.16, 0], [0.17, 0.04], [0.14, 0.08]], 16, fx, 0, fz);
    }
  }
  // Rear brushed-aluminum lamp-house heat-sink cooling fins
  for (let i = 0; i < 6; i++) {
    box(root, dark, 0.82, 0.028, 0.18, 0, 0.22 + i * 0.065, -1.52);
  }

  // Sculpted Köhler field-lens collector well on front base deck
  lathe(root, dark, [
    [0.24, 0.50], [0.49, 0.50], [0.51, 0.58], [0.44, 0.65], [0.32, 0.65], [0.30, 0.57]
  ], 28, 0, 0, 0.87);
  torus(root, chrome, 0.36, 0.022, 0, 0.655, 0.87).rotation.x = Math.PI / 2;
  cylinder(root, lightMat, 0.31, 0.31, 0.06, 0, 0.6, 0.87, 26);
  cylinder(root, blueFilterMat, 0.325, 0.325, 0.018, 0, 0.642, 0.87, 26);
  const lamp = new T.PointLight('#ffe8b8', 2.2, 6.2, 1.7);
  lamp.position.set(0, 0.84, 0.87);
  root.add(lamp);

  // =========================================================================
  // 2. SCULPTED CURVED ZEISS/LEICA C-ARM & VERTICAL RACK-AND-PINION RAIL
  // =========================================================================
  const arm = group(root, 0, 0.5, -0.78);
  // Sculpted solid curved C-arm arching FORWARD (+Z) directly over the optical axis to cradle Head & Nosepiece!
  const armShape = new T.Shape();
  armShape.moveTo(-0.56, 0.0);
  armShape.lineTo(0.24, 0.0);
  armShape.bezierCurveTo(0.16, 0.9, 0.04, 2.25, 0.28, 2.98);
  armShape.bezierCurveTo(0.48, 3.42, 0.86, 3.52, 1.44, 3.52);
  armShape.lineTo(1.44, 4.02);
  armShape.bezierCurveTo(0.56, 4.06, -0.18, 3.85, -0.56, 3.22);
  armShape.bezierCurveTo(-0.96, 2.52, -0.98, 1.05, -0.56, 0.0);
  const armGeo = new T.ExtrudeGeometry(armShape, {
    depth: 0.72, bevelEnabled: true, bevelThickness: 0.11, bevelSize: 0.09, bevelSegments: 5, curveSegments: 22
  });
  // rotateY(-PI/2) maps +X -> +Z so the upper cantilevered arm sweeps FORWARD directly over head & revolver!
  armGeo.rotateY(-Math.PI / 2);
  armGeo.translate(0.36, 0, 0);
  armGeo.computeVertexNormals();
  mesh(arm, armGeo, enamel);

  // Brushed dark-anodized recessed ergonomic side grip panels hugging the curved C-arm flanks
  for (const sx of [-0.475, 0.475]) {
    tube(arm, dark, [v(sx, 0.62, -0.44), v(sx, 1.55, -0.66), v(sx, 2.60, -0.56), v(sx, 3.38, 0.05)], 0.056, false, 28, 10);
    tube(arm, silver, [v(sx * 1.02, 0.62, -0.36), v(sx * 1.02, 1.55, -0.58), v(sx * 1.02, 2.60, -0.48), v(sx * 1.02, 3.38, 0.13)], 0.018, false, 24, 8);
  }
  // Sculpted vertical brushed-chrome dovetail guide rail + brass gear rack teeth behind the stage!
  roundedSlab(arm, dark, 0.62, 0.24, 2.35, 0.05, 0.02, 0, 1.85, 0.18);
  box(arm, chrome, 0.1, 2.18, 0.08, -0.19, 1.85, 0.31);
  box(arm, chrome, 0.1, 2.18, 0.08, 0.19, 1.85, 0.31);
  // Brass rack teeth (visible as mechanical stage glides up and down with Macrométrico!)
  for (let i = 0; i < 18; i++) {
    box(arm, brass, 0.12, 0.042, 0.06, 0, 0.9 + i * 0.11, 0.31);
  }
  // Cylindrical focus-shaft cross-barrel housing inside the lower C-arm
  const shaftBarrel = cylinder(arm, dark, 0.36, 0.36, 1.66, 0, 0.99, -0.32, 26);
  shaftBarrel.rotation.z = Math.PI / 2;
  torus(arm, chrome, 0.37, 0.018, 0.82, 0.99, -0.32).rotation.y = Math.PI / 2;
  torus(arm, chrome, 0.37, 0.018, -0.82, 0.99, -0.32).rotation.y = Math.PI / 2;

  // =========================================================================
  // 3. SCULPTED BINOCULAR SIEDENTOPF VIEWING HEAD & WIDEFIELD 10× OCULARS
  // =========================================================================
  const head = group(root, 0, 4.46, 0.24);
  head.userData.pickKey = 'eyepieces';
  // Rotating Siedentopf dovetail neck collar seated solidly INTO the top of the forward C-arm!
  lathe(head, dark, [[0.46, -0.26], [0.60, -0.22], [0.62, -0.02], [0.56, 0.08]], 28);
  torus(head, chrome, 0.61, 0.020, 0, -0.06, 0).rotation.x = Math.PI / 2;
  // Prismatic ergonomic binocular housing
  roundedSlab(head, enamel, 1.62, 1.32, 0.52, 0.28, 0.09, 0, 0.28, 0.14);
  roundedSlab(head, enamelDark, 1.32, 0.96, 0.32, 0.24, 0.08, 0, 0.56, 0.18);
  // Central Siedentopf interpupillary adjustment dial bridge (55–75 mm scale)
  const ipdDial = cylinder(head, chrome, 0.22, 0.22, 0.18, 0, 0.58, 0.54, 24);
  ipdDial.rotation.x = Math.PI / 2;
  torus(head, dark, 0.19, 0.022, 0, 0.58, 0.63);
  // Glowing cyan optical power accent bar on flank
  box(head, markerCyan, 0.04, 0.05, 0.34, 0.83, 0.3, 0.16);

  // Dual widefield 10×/22mm ocular tubes with knurled diopter rings, contoured rubber eyecups & coated lenses!
  const eyecupProfile = [
    [0.245, 0.0], [0.265, 0.08], [0.27, 0.42], [0.285, 0.46], [0.285, 0.54],
    [0.265, 0.58], [0.275, 0.72], [0.335, 0.86], [0.305, 0.9], [0.235, 0.82], [0.22, 0.72]
  ];
  for (const x of [-0.46, 0.46]) {
    const barrel = group(head, x, 0.62, 0.32);
    barrel.rotation.x = 0.64;
    // Lower metallic housing + knurled chrome diopter collar
    lathe(barrel, dark, eyecupProfile.slice(0, 6), 24);
    cylinder(barrel, chrome, 0.282, 0.282, 0.075, 0, 0.5, 0, 26);
    // Matte rubber contoured eyecup
    lathe(barrel, rubber, eyecupProfile.slice(5), 24);
    // Multi-coated cyan-emerald recessed eyepiece lens
    cylinder(barrel, lensGlass, 0.225, 0.215, 0.03, 0, 0.77, 0, 24);
    torus(barrel, chrome, 0.232, 0.014, 0, 0.785, 0).rotation.x = Math.PI / 2;
  }
  interactives.set('eyepieces', {
    object: head, title: 'Oculares binoculares 10× (22 mm)', subtitle: 'Cabeçote Siedentopf · Multiplique pela objetiva ativa', color: '#52e0f0'
  });

  // =========================================================================
  // 4. UPPER OPTICAL CARRIER BRIDGE + REVOLVING NOSEPIECE TURRET (FLUSH-BOLTED!)
  // =========================================================================
  // Solid beveled nosepiece carrier housing connecting the forward C-arm flush down into the revolving turret dome!
  roundedSlab(root, enamelDark, 1.06, 1.18, 0.34, 0.16, 0.05, 0, 4.16, 0.26);
  roundedSlab(root, dark, 0.96, 1.04, 0.14, 0.14, 0.03, 0, 3.99, 0.30);
  // Coaxial chrome bearing sleeve linking the nosepiece carrier solidly into the rotating turret center (ZERO floating gap!)
  lathe(root, dark, [[0.38, 3.84], [0.62, 3.88], [0.64, 4.02], [0.56, 4.18], [0.46, 4.24]], 32, 0, 0, 0.34);
  torus(root, chrome, 0.63, 0.022, 0, 3.98, 0.34).rotation.x = Math.PI / 2;
  // Side dovetail locking thumbscrew on the nosepiece carrier
  const lockScrew = cylinder(root, chrome, 0.068, 0.068, 0.22, 0.56, 4.14, 0.32, 16);
  lockScrew.rotation.z = Math.PI / 2;

  const nosePivot = group(root, 0, 3.74, 0.34);
  nosePivot.rotation.x = 0.06;
  const turret = group(nosePivot);
  // Sculpted concave revolving turret dome extending seamlessly up into the chrome bearing sleeve!
  lathe(turret, dark, [
    [0.01, -0.06], [0.84, -0.04], [0.95, 0.04], [0.97, 0.16], [0.91, 0.25], [0.64, 0.33], [0.54, 0.38], [0.01, 0.38]
  ], 36);
  torus(turret, chrome, 0.96, 0.022, 0, 0.2, 0).rotation.x = Math.PI / 2;
  // Machined rubber knurled grip ribs around turret rim
  for (let k = 0; k < 28; k++) {
    const a = (k / 28) * Math.PI * 2;
    const rib = box(turret, rubber, 0.028, 0.14, 0.036, Math.sin(a) * 0.955, 0.1, Math.cos(a) * 0.955);
    rib.rotation.y = a;
  }

  const lensStep = (Math.PI * 2) / lenses.length;
  const sockets = lenses.map((lens, index) => {
    const angle = index * lensStep;
    const x = Math.sin(angle) * 0.58, z = Math.cos(angle) * 0.58;
    const objective = group(turret, x, -0.04, z);
    objective.rotation.z = -x * 0.22;
    objective.rotation.x = -z * 0.2;
    const pKey = 'obj_' + index;
    objective.userData.pickKey = pKey;
    objective.userData.objective = index;
    const len = [0.46, 0.62, 0.78, 0.92, 1.03][index] || 0.92;

    // Sculpted stepped Plan-Apochromat objective barrel (LatheGeometry — zero flat cylinders!)
    lathe(objective, black, [
      [0.195, 0.04], [0.195, -0.11], [0.172, -0.13]
    ], 22);
    lathe(objective, chrome, [
      [0.172, -0.13], [0.168, -0.14 - len * 0.65], [0.140, -0.14 - len * 0.82],
      [0.122, -0.15 - len], [0.086, -0.24 - len], [0.066, -0.27 - len]
    ], 24);
    // High-contrast ISO DIN color-coded ring band
    cylinder(objective, enamelMaterial(lens.color, { roughness: 0.2, clearcoat: 0.88 }),
      0.174, 0.174, 0.095, 0, -0.15 - len * 0.26, 0, 24);
    // Secondary satin-black oil-immersion identification band on 100× & 1000×
    if (lens.oil) {
      cylinder(objective, black, 0.171, 0.171, 0.058, 0, -0.26 - len * 0.34, 0, 24);
    }
    // Recessed coated multi-layer front optical element
    cylinder(objective, dark, 0.084, 0.070, 0.05, 0, -0.265 - len, 0, 20);
    cylinder(objective, lensGlass, 0.060, 0.060, 0.024, 0, -0.292 - len, 0, 20);

    interactives.set(pKey, {
      object: objective, objectiveIndex: index,
      title: lens.ultra ? `Lente ${lens.power}× Ultra-Imersão (AN ${lens.na})` : `Objetiva Plan ${lens.power}× (Total ${lens.power * 10}× · AN ${lens.na})`,
      subtitle: lens.oil ? 'Imersão em óleo · Clique para girar o revólver quíntuplo' : 'Clique para girar esta objetiva ao eixo óptico',
      color: lens.color
    });
    return objective;
  });

  // =========================================================================
  // 5. ABBE 1.25 NA CONDENSER, 10-BLADE METALLIC IRIS, LEVER & LIGHT CONE
  // =========================================================================
  const condenser = group(root, 0, 1.06, 0.87);
  condenser.userData.pickKey = 'condenser';
  lathe(condenser, black, [
    [0.28, -0.30], [0.47, -0.28], [0.50, -0.12], [0.45, 0.04], [0.35, 0.14], [0.27, 0.14]
  ], 28);
  torus(condenser, chrome, 0.48, 0.018, 0, -0.08, 0).rotation.x = Math.PI / 2;
  cylinder(condenser, lightMat, 0.255, 0.275, 0.048, 0, 0.135, 0, 24);

  // 10 metallic overlapping iris diaphragm blades
  const iris = [];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const carrier = group(condenser, Math.cos(a) * 0.25, 0.165, Math.sin(a) * 0.25);
    carrier.rotation.y = -a;
    const blade = box(carrier, dark, 0.19, 0.02, 0.1, -0.075, 0.014, 0.014);
    iris.push(blade);
  }
  // External chrome iris diaphragm lever (physically swings as Diafragma slider changes!)
  const irisLever = group(condenser, 0, -0.08, 0);
  rod(irisLever, chrome, v(0.46, 0, 0), v(0.76, 0, 0.14), 0.024, 10);
  mesh(irisLever, new T.SphereGeometry(0.052, 12, 10), black, 0.77, 0, 0.145);

  // Condenser mounting bracket connecting back to C-arm
  roundedSlab(condenser, dark, 0.56, 0.85, 0.14, 0.06, 0.02, 0, -0.14, -0.62);
  interactives.set('condenser', {
    object: condenser, title: 'Condensador de Abbe (AN 1,25) e diafragma',
    subtitle: 'Focaliza o cone luminoso de Köhler e controla contraste e abertura numérica', color: '#ffe7b0'
  });

  // Volumetric Köhler translucent light beam cone (base -> condenser -> mechanical stage specimen)
  const beamMat = new T.MeshBasicMaterial({
    color: '#ffefbf', transparent: true, opacity: 0.16, depthWrite: false, side: T.DoubleSide, blending: T.AdditiveBlending
  });
  const lowerBeam = mesh(root, new T.CylinderGeometry(0.25, 0.31, 0.36, 26, 1, true), beamMat, 0, 0.82, 0.87);
  const upperBeam = mesh(root, new T.CylinderGeometry(0.11, 0.25, 1.25, 26, 1, true), beamMat, 0, 1.76, 0.87);

  // =========================================================================
  // 6. PRECISION MECHANICAL STAGE (PLATINA), VERNIER RAIL & BOROSILICATE SLIDE
  //    (Moves vertically EXCLUSIVELY via Macrométrico — NEVER Micrométrico!)
  // =========================================================================
  const stage = group(root, 0, 2.28, 0.86);
  stage.userData.pickKey = 'stage';
  // Stage carriage bracket riding smoothly up/down on the C-arm dovetail rail!
  roundedSlab(stage, dark, 0.76, 0.66, 0.44, 0.06, 0.025, 0, -0.16, -1.14);
  box(stage, chrome, 0.8, 0.04, 0.06, 0, 0.02, -1.14);

  // Beveled ceramic-anodized mechanical stage plate with recessed optical window
  roundedSlab(stage, black, 2.66, 1.98, 0.175, 0.14, 0.028, 0, 0, 0);
  roundedSlab(stage, silver, 2.68, 2.0, 0.026, 0.14, 0.008, 0, 0.095, 0);
  roundedSlab(stage, black, 2.54, 1.84, 0.036, 0.11, 0.01, 0, 0.12, 0);
  torus(stage, chrome, 0.26, 0.026, 0, 0.148, 0).rotation.x = Math.PI / 2;
  // Subtle X-vernier ruler rail along back of stage
  box(stage, silver, 2.15, 0.024, 0.09, 0, 0.145, -0.76);
  for (let i = -8; i <= 8; i++) {
    box(stage, black, 0.012, 0.008, 0.055, i * 0.12, 0.16, -0.76);
  }

  // Charriot X/Y slide carrier with sculpted curved spring-steel retaining clips!
  const chariot = group(stage, 0, 0.155, 0);
  roundedSlab(chariot, silver, 1.72, 0.22, 0.056, 0.04, 0.012, 0, 0, -0.36);
  // Left stationary L-stop + right spring-loaded curved retaining arm
  rod(chariot, chrome, v(-0.74, 0.024, -0.36), v(-0.66, 0.024, 0.30), 0.032, 10);
  tube(chariot, chrome, [v(0.70, 0.028, -0.36), v(0.74, 0.04, -0.05), v(0.66, 0.034, 0.24), v(0.56, 0.026, 0.28)], 0.026, false, 18, 8);
  cylinder(chariot, brass, 0.045, 0.045, 0.06, 0.70, 0.035, -0.36, 12);

  // Borosilicate glass slide + frosted label + stained tissue section + iridescent coverslip
  const specimen = group(chariot);
  box(specimen, glass, 1.32, 0.036, 0.56, 0, 0.042, 0);
  box(specimen, frosted, 0.26, 0.039, 0.53, -0.51, 0.044, 0);
  const tint = material('#d987ac', { roughness: 0.4, clearcoat: 0.5 });
  box(specimen, tint, 0.56, 0.014, 0.37, 0.1, 0.064, 0);
  const cover = box(specimen, glassMaterial('#dcf8ff', { opacity: 0.45, iridescence: 0.34 }), 0.66, 0.015, 0.43, 0.1, 0.075, 0);

  // Glossy refractive immersion oil droplet (100× oil immersion)
  const oilMat = gelMaterial('#def6ff', { opacity: 0.78, ior: 1.515, iridescence: 0.34, clearcoat: 1.0, roughness: 0.02 });
  const drip = sphere(specimen, oilMat, 0.148, 0.084, 0.128, 0.036, 0.124, 0.01, 24);
  sphere(drip, glow('#ffffff', 0.95, { transparent: true, opacity: 0.65 }), 0.22, 0.12, 0.22, 0.24, 0.64, 0.24, 10);

  // Cracked slide overlay lines (only visible on severe collision!)
  const crack = group(specimen);
  const fracture = glow('#f7f9fc', 0.45);
  for (const [a, b] of [
    [v(-0.32, 0.088, 0.23), v(-0.07, 0.088, 0.06)],
    [v(-0.07, 0.088, 0.06), v(0.27, 0.088, -0.2)],
    [v(-0.07, 0.088, 0.06), v(0.32, 0.088, 0.13)],
    [v(-0.07, 0.088, 0.06), v(-0.28, 0.088, -0.12)]
  ]) rod(crack, fracture, a, b, 0.0095);

  interactives.set('stage', {
    object: stage, title: 'Platina mecânica e lâmina',
    subtitle: 'Sobe e desce apenas com o Macrométrico; o Charriot move em X e Y', color: '#bcc8d2'
  });

  // =========================================================================
  // 7. PRECISION COAXIAL KNURLED DIALS (DISTINCT MACRO vs MICRO + CHARRIOT + REOSTAT)
  // =========================================================================
  function dial(parent, mat, radius, width, x, y, z, axle = 'x', dialKey = null, accentMat = chrome, ribs = 26) {
    const control = group(parent, x, y, z);
    if (dialKey) control.userData.pickKey = dialKey;
    const wheel = group(control);
    if (axle === 'x') wheel.rotation.z = Math.PI / 2;
    else if (axle === 'z') wheel.rotation.x = Math.PI / 2;
    lathe(wheel, mat, [
      [0.01, -width * 0.5], [radius * 0.9, -width * 0.5], [radius, -width * 0.42],
      [radius, width * 0.42], [radius * 0.9, width * 0.5], [0.01, width * 0.5]
    ], 32);
    torus(wheel, accentMat, radius * 0.94, 0.016, 0, width * 0.45, 0).rotation.x = Math.PI / 2;
    torus(wheel, accentMat, radius * 0.94, 0.012, 0, -width * 0.45, 0).rotation.x = Math.PI / 2;
    for (let i = 0; i < ribs; i++) {
      const a = (i / ribs) * Math.PI * 2;
      const grip = box(wheel, silver, 0.02, width * 0.72, 0.026, Math.sin(a) * radius, 0, Math.cos(a) * radius);
      grip.rotation.y = a;
    }
    return control;
  }

  // Coaxial Macro (large outer wheel with cyan bezel) + Micro (protruding chrome fine drum with emerald graduated ring!)
  const macro = dial(root, dark, 0.42, 0.21, 0.98, 1.49, -1.10, 'x', 'macro', markerCyan, 28);
  const micro = dial(root, chrome, 0.23, 0.16, 1.18, 1.49, -1.10, 'x', 'micro', markerFine, 20);
  const leftMacro = dial(root, dark, 0.42, 0.21, -0.98, 1.49, -1.10, 'x', 'macro', markerCyan, 28);
  const leftMicro = dial(root, chrome, 0.23, 0.16, -1.18, 1.49, -1.10, 'x', 'micro', markerFine, 20);

  // Hanging coaxial Charriot X/Y control shaft under the right side of the stage
  cylinder(stage, chrome, 0.048, 0.048, 0.54, 1.06, -0.27, 0.21, 14);
  const charX = dial(stage, dark, 0.145, 0.13, 1.06, -0.25, 0.21, 'y', 'charX', chrome, 18);
  const charY = dial(stage, black, 0.175, 0.15, 1.06, -0.43, 0.21, 'y', 'charY', chrome, 20);
  // Smooth glowing illuminator rheostat knob on front-right base apron
  const reostat = dial(root, dark, 0.155, 0.13, 1.08, 0.42, 2.02, 'z', 'reostat', glow('#ffe49e', 0.7), 18);

  interactives.set('macro', {
    object: macro, alt: leftMacro, dial: 'macro',
    title: 'Parafuso macrométrico (grosso)',
    subtitle: 'Move a altura da platina (−500 a +500 μm) · Use em 4× e 10×', color: '#52e0f0'
  });
  interactives.set('micro', {
    object: micro, alt: leftMicro, dial: 'micro',
    title: 'Parafuso micrométrico (fino)',
    subtitle: 'Ajuste óptico preciso (−60 a +60 μm) sem alterar a altura da platina', color: '#58d8a2'
  });
  interactives.set('charX', {
    object: charX, dial: 'charX',
    title: 'Charriot · Eixo X', subtitle: 'Desloca a lâmina horizontalmente (−3500 a +3500 μm)', color: '#e2b05c'
  });
  interactives.set('charY', {
    object: charY, dial: 'charY',
    title: 'Charriot · Eixo Y', subtitle: 'Desloca a lâmina em profundidade (−3500 a +3500 μm)', color: '#e2b05c'
  });
  interactives.set('reostat', {
    object: reostat, dial: 'reostat',
    title: 'Reostato de iluminação', subtitle: 'Controla a intensidade da lâmpada (0% a 100%)', color: '#ffe7b0'
  });

  return {
    root, turret, sockets, stage, chariot, tint, cover, drip, crack,
    lamp, iris, irisLever, lightMat, lowerBeam, upperBeam, beamMat,
    macro, micro, leftMacro, leftMicro, charX, charY, reostat, interactives
  };
}

const slideColors = { historesin: '#6ea8dc', he: '#d987ac', pas: '#dc78aa', masson: '#889cd0', gram: '#a36dc4', giemsa: '#d89ab4', botany: '#7bc484', fresh: '#c5d3bb' };
const clamp = (x, low, high) => Math.max(low, Math.min(high, x));
const normalize = angle => Math.atan2(Math.sin(angle), Math.cos(angle));

export function microscope3d({ scene, lights, engine, toolbar, guide, label, overlay, viewport, tooltip, help, state, audio, signal }) {
  lights.rim.color.set('#7ee2f5');
  lights.rim.intensity = 1.85;
  scene.fog.density = 0.0075;

  const model = microscope(scene);
  const settings = {
    slide: state.slide || readySlides.bee, x: 0, y: 0, macro: 0, micro: 0, lamp: 0.78, iris: 0.68,
    oil: false, labels: false, cracked: false
  };
  let index = 0, angleAim = 0, spin = 0, imageDirty = true, timer = 0, time = 0;
  const offBeeLoad = onBeePhotoLoad(() => { imageDirty = true; });
  signal.addEventListener('abort', offBeeLoad, { once: true });
  let drag = null, dialDrag = null, hoveredKey = null, alertFlash = 0;

  const viewLocked = (instant = false) => {
    const compact = engine.camera.aspect < 1;
    engine.view(compact ? [-0.15, 4.6, 16.0] : [0.42, 4.58, 14.7], compact ? [-0.65, 2.85, 0.08] : [-0.08, 2.86, 0.08], instant);
  };
  viewLocked(true);
  engine.controls.enabled = false;

  const ocularSize = deviceProfile.ocularSize;
  const canvas = node('canvas', {
    width: ocularSize, height: ocularSize, tabIndex: 0,
    'aria-label': 'Campo visual da ocular. Arraste para mover a lâmina e role o mouse para foco fino.'
  });
  const caption = node('span', { className: 'ocular-title' });
  const status = node('span', { className: 'ocular-status', role: 'status' });
  const ocularLoader = node('div', { className: 'ocular-loader', hidden: true },
    node('span', { className: 'mini-spin', 'aria-hidden': 'true' }),
    node('span', {}, 'Carregando lâmina de alta resolução...')
  );
  const syncOcularLoader = () => {
    const waitingBee = settings.slide.tissue === 'bee' && settings.slide.stain === 'historesin' && !isBeePhotoReady();
    ocularLoader.hidden = !waitingBee;
  };
  syncOcularLoader();
  const offBeeLoaderSync = onBeePhotoLoad(() => { syncOcularLoader(); imageDirty = true; });
  signal.addEventListener('abort', offBeeLoaderSync, { once: true });
  const ocularWrap = node('div', { className: 'ocular-wrap' }, caption, canvas, ocularLoader, status);
  overlay.append(ocularWrap);
  const ocular = new Ocular(canvas);

  const atLens = () => lenses[index];
  const alert = node('p', { className: 'note', role: 'status', hidden: true });
  const lensBar = row();
  lensBar.classList.add('lens-buttons');
  const powers = lenses.map((lens, i) => button(lens.power + '×', () => objective(i),
    { style: '--lens:' + lens.color, 'aria-label': 'Objetiva ' + lens.power + '×', 'aria-pressed': String(i === 0) }));
  lensBar.append(...powers);

  const field = metric('CAMPO VISUAL', '—');
  const working = metric('DISTÂNCIA DE TRABALHO', '—');
  const aperture = metric('ABERTURA NUMÉRICA', '—');
  const depth = metric('PROFUNDIDADE DE CAMPO', '—');
  const macroRead = metric('PLATINA (MACRO)', '—');
  const microRead = metric('FOCO FINO (MICRO)', '—');
  const discovered = card('Lâmina montada', '');
  const fmtUm = (value, dec = 1) => (value > 0 ? '+' : '') + fmt(value, dec) + ' μm';

  // Expanded ranges & distinct coarse (Macro -> moves stage) vs fine (Micro -> fine optical focus ONLY!)
  const macro = range('Macrométrico', -500, 500, 2, settings.macro, val => { audio.play('dial'); setMacro(val); }, v => fmtUm(v, 0), { wheel: true, reset: 0 });
  const micro = range('Micrométrico', -60, 60, 0.1, settings.micro, value => {
    audio.play('dial');
    settings.micro = Number(clamp(value, -60, 60).toFixed(2));
    change();
  }, v => fmtUm(v, 1), { wheel: true, reset: 0 });
  micro.element.classList.add('is-fine');

  const xAxis = range('Charriot X', -3500, 3500, 5, 0, value => pan(value, settings.y), v => fmtUm(v, 0), { wheel: true, reset: 0 });
  const yAxis = range('Charriot Y', -3500, 3500, 5, 0, value => pan(settings.x, value), v => fmtUm(v, 0), { wheel: true, reset: 0 });
  const light = range('Reostato', 0, 100, 1, Math.round(settings.lamp * 100), value => { settings.lamp = value / 100; change(); }, x => x + '%', { wheel: true, reset: 78 });
  const iris = range('Diafragma', 5, 100, 1, Math.round(settings.iris * 100), value => { settings.iris = value / 100; change(); }, x => x + '%', { wheel: true, reset: 68 });

  const trayLabels = Object.fromEntries(Object.entries(readySlides).map(([id, slide]) =>
    [id, tissues[slide.tissue].short + ' · ' + stains[slide.stain].short]));
  if (state.slide) trayLabels.prepared = 'Preparada · ' + tissues[state.slide.tissue].short + ' · ' + stains[state.slide.stain].short;
  const tray = select('Lâmina', trayLabels, state.slide ? 'prepared' : 'bee', id => {
    settings.slide = id === 'prepared' ? state.slide : readySlides[id];
    replace();
  });

  const oil = button('Óleo de imersão', () => {
    settings.oil = !settings.oil;
    oil.textContent = settings.oil ? 'Remover óleo' : 'Óleo de imersão';
    oil.setAttribute('aria-pressed', String(settings.oil));
    audio.play('glass');
    change();
  }, { 'aria-pressed': 'false' });

  const exchange = button('Substituir lâmina trincada', replace, { className: 'danger', hidden: true });
  const quickReplaceOcular = button('Substituir lâmina', replace, { className: 'danger', hidden: true });
  ocularWrap.append(quickReplaceOcular);

  const resolutionHelp = note('O Macrométrico (−500 a +500 μm) desloca a altura física da platina (use em 4× e 10×). O Micrométrico (−60 a +60 μm) faz o ajuste óptico fino da nitidez sem mover a platina (ideal em 40× e 100×). Dê duplo clique em qualquer slider para restaurar o padrão.');

  const rowTop = node('div', { className: 'micro-row' }, lensBar, macro.element, micro.element, tray.element);
  const rowBottom = node('div', { className: 'micro-row' },
    xAxis.element, yAxis.element, light.element, iris.element,
    row(
      oil,
      toggle('Identificar', false, active => { settings.labels = active; audio.play('click'); change(); }),
      toggle('Travar vista', true, value => {
        engine.controls.enabled = !value;
        if (value) viewLocked();
        audio.play('click');
        help.textContent = value
          ? 'Arraste os botões 3D ou a ocular · Role na ocular para foco fino (Shift = macro)'
          : 'Arraste o fundo 3D para orbitar o microscópio · Role na ocular para foco fino';
      }),
      button('Centralizar', () => {
        audio.play('click');
        if (settings.slide.tissue === 'bee' && settings.slide.stain === 'historesin' && index >= 2) {
          pan(-675, -630);
        } else {
          pan(0, 0);
        }
      }),
      exchange
    )
  );
  toolbar.append(node('div', { className: 'micro-controls' }, rowTop, rowBottom));

  const beeRegions = node('div', { className: 'row', hidden: true },
    button('Ventrículo anelado', () => { audio.play('click'); pan(-675, -630); }),
    button('Papo / Inglúvio', () => { audio.play('click'); pan(810, -1125); }),
    button('Túb. Malpighi', () => { audio.play('click'); pan(-360, 765); }),
    button('Traqueias', () => { audio.play('click'); pan(1170, 810); })
  );
  const beeRegionsHead = heading('Regiões da abelha (Minicurso)');
  beeRegionsHead.hidden = true;

  const referenceHost = node('div', { hidden: true });
  let currentReference = null;
  guide.append(
    heading('Óptica e controles'), discovered, referenceHost,
    beeRegionsHead, beeRegions,
    node('div', { className: 'metrics' }, field.element, working.element, aperture.element, depth.element, macroRead.element, microRead.element),
    alert, resolutionHelp,
    card('Macrométrico × Micrométrico', 'Macrométrico (roda externa ciano): desloca a altura da platina no trilho vertical para encontrar o plano grosso. Micrométrico (tambor interno verde): ajusta a nitidez fina em 0,1 μm sem movimentar a platina.'),
    card('Aumento total e limite de Abbe', 'Multiplique a objetiva pela ocular de 10× (FN = 18 mm → FOV = 18 mm / M_obj). A lente 1000× usa 100× Apo (AN 1,40) + Optovar 2,5× (FOV 72 μm), atingindo o limite físico de difração da luz visível (~0,20 μm = 200 nm). Para vírus e cristas mitocondriais, use o módulo Eletrônico.'),
    card('Charriot e iluminação', 'Arraste diretamente na ocular ou nos botões X/Y para varrer a lâmina; ajuste Reostato (0–100%) e Diafragma (5–100%) para regular brilho e contraste.')
  );
  help.textContent = 'Arraste os botões 3D ou a ocular · Role na ocular para foco fino (Shift = macro)';

  function updateDetails() {
    const lens = atLens();
    const slide = settings.slide;
    const isBeeCourse = slide.tissue === 'bee' && slide.stain === 'historesin';
    const reference = tissues[slide.tissue].figure;
    if (reference !== currentReference) {
      currentReference = reference;
      referenceHost.hidden = !reference;
      referenceHost.replaceChildren(...(reference ? [
        note('A ocular mostra o corte simulado. A figura abaixo é a referência publicada.'),
        insectReference(reference)
      ] : []));
    }
    beeRegionsHead.hidden = !isBeeCourse;
    beeRegions.hidden = !isBeeCourse;
    caption.textContent = lens.ultra
      ? 'OCULAR 10× · 1000× (100× APO AN 1,40 + OPTOVAR · FOV 72 μm)'
      : 'OCULAR 10× · OBJETIVA ' + lens.power + '× · TOTAL ' + lens.power * 10 + '×';
    discovered.querySelector('p').textContent = tissues[slide.tissue].name + ' · ' + stains[slide.stain].short + ' · ' + slide.thickness + ' μm';
    field.value.textContent = fmt(fovFor(lens)) + ' μm';
    working.value.textContent = fmt(lens.wd, 2) + ' mm';
    aperture.value.textContent = fmt(apertureFor(lens, settings.iris, settings.oil), 2);
    depth.value.textContent = '≈' + fmt(depthOfField(lens, settings.iris, settings.oil), 2) + ' μm';
    macroRead.value.textContent = fmtUm(settings.macro, 0);
    microRead.value.textContent = fmtUm(settings.micro, 1);
    model.tint.color.set(slideColors[slide.stain] || '#d987ac');
    model.cover.visible = slide.coverslip ?? (slide.stain !== 'gram');
    model.crack.visible = settings.cracked;
    model.drip.visible = settings.oil;
    exchange.hidden = !settings.cracked;
    quickReplaceOcular.hidden = !settings.cracked;
  }

  function change() {
    imageDirty = true;
    updateDetails();
  }

  function message(text, critical = false) {
    alert.hidden = !text;
    alert.textContent = text;
    if (critical) {
      audio.play('alert');
      alertFlash = 1.0;
      ocularWrap.classList.add('is-alert');
    } else if (!text) {
      ocularWrap.classList.remove('is-alert');
    }
  }

  let beeAutoCentered = false;

  function objective(next) {
    if (index === next) return;
    const prev = index;
    index = next;
    const lensStep = (Math.PI * 2) / lenses.length;
    angleAim = spin + normalize(-next * lensStep - spin);
    // Smart auto-framing on the mini-course bee micrograph: avoid zooming straight into the empty dark center!
    if (settings.slide.tissue === 'bee' && settings.slide.stain === 'historesin') {
      if (next >= 2 && Math.hypot(settings.x, settings.y) < 280) {
        pan(-675, -630); // Right onto the glowing ribbed Ventriculus!
        beeAutoCentered = true;
      } else if (next === 0 && prev >= 2 && beeAutoCentered && Math.hypot(settings.x + 675, settings.y + 630) < 90) {
        pan(0, 0); // Restore full circular framing at 4x!
        beeAutoCentered = false;
      }
    }
    if (!settings.cracked) message('');
    if (settings.oil && !lenses[index].oil) message('A gota de óleo permanece na lâmina. Remova-a antes de usar objetivas secas.');
    else if (!settings.oil && lenses[index].oil) message('Objetiva de imersão (' + lenses[index].power + '×): ative "Óleo de imersão" para eliminar a aberração esférica e obter nitidez máxima.');
    powers.forEach((control, i) => control.setAttribute('aria-pressed', String(i === next)));
    audio.play('lens');
    change();
  }

  function setMacro(value) {
    const clamped = clamp(Math.round(value), -500, 500);
    const diff = clamped - settings.macro;
    // Lowering the stage (diff <= 0) is always completely safe!
    if (index >= 2 && diff > 0 && clamped > 34) {
      if (diff >= 24 && clamped > 58) {
        settings.cracked = true;
        settings.macro = 30;
        engine.shake(0.16, 0.4);
        message('Lâmina trincada! A platina subiu bruscamente contra a objetiva de alta ampliação. Substitua a lâmina e use o micrométrico.', true);
      } else {
        settings.macro = 34;
        engine.shake(0.06, 0.2);
        message('Trava superior da platina atingida em ' + atLens().power + '×. Utilize o micrométrico para o ajuste fino de foco.');
      }
      macro.set(settings.macro);
    } else {
      settings.macro = clamped;
      macro.set(settings.macro);
      if (!settings.cracked && !(settings.oil && !lenses[index].oil)) message('');
    }
    change();
  }

  function pan(x, y) {
    settings.x = Math.round(clamp(x, -3500, 3500));
    settings.y = Math.round(clamp(y, -3500, 3500));
    xAxis.set(settings.x);
    yAxis.set(settings.y);
    imageDirty = true;
  }

  function replace() {
    settings.oil = settings.cracked = false;
    settings.macro = 0;
    settings.micro = 0;
    macro.set(0);
    micro.set(0);
    oil.textContent = 'Óleo de imersão';
    oil.setAttribute('aria-pressed', 'false');
    ocularWrap.classList.remove('is-alert');
    message('');
    if (index !== 0) objective(0);
    pan(0, 0);
    audio.play('glass');
    change();
  }

  // Ocular direct interactions: drag to pan Charriot X/Y, mouse wheel to focus Micro (Shift+Wheel = Macro)
  canvas.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    canvas.focus({ preventScroll: true });
    canvas.setPointerCapture(event.pointerId);
    drag = { x: event.clientX, y: event.clientY, sampleX: settings.x, sampleY: settings.y };
  }, { signal });
  canvas.addEventListener('pointermove', event => {
    if (!drag) return;
    const ratio = fovFor(atLens()) / canvas.clientWidth;
    pan(drag.sampleX - (event.clientX - drag.x) * ratio, drag.sampleY - (event.clientY - drag.y) * ratio);
  }, { signal });
  for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    canvas.addEventListener(event, () => { drag = null; }, { signal });
  }
  canvas.addEventListener('wheel', event => {
    event.preventDefault();
    const dir = event.deltaY < 0 ? 1 : -1;
    audio.play('dial');
    if (event.shiftKey) {
      setMacro(settings.macro + dir * (index >= 2 ? 4 : 10));
    } else {
      settings.micro = Number(clamp(settings.micro + dir * 0.4, -60, 60).toFixed(1));
      micro.set(settings.micro);
      change();
    }
  }, { signal, passive: false });
  canvas.addEventListener('keydown', event => {
    const move = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[event.key];
    if (!move) return;
    event.preventDefault();
    const step = fovFor(atLens()) * 0.054;
    pan(settings.x + move[0] * step, settings.y + move[1] * step);
  }, { signal });

  // Direct 3D Microscope Raycast: click objectives, drag 3D dials (Macro/Micro/Charriot/Reostat), smart hover tooltips!
  const ray = new T.Raycaster(), pointer = new T.Vector2();
  const stageCanvas = engine.renderer.domElement;
  const pickRoots = [
    model.micro, model.leftMicro, model.macro, model.leftMacro,
    model.charX, model.charY, model.reostat, ...model.sockets,
    model.root
  ];

  function pickPart(event) {
    const bounds = stageCanvas.getBoundingClientRect();
    pointer.set((event.clientX - bounds.left) / bounds.width * 2 - 1, 1 - (event.clientY - bounds.top) / bounds.height * 2);
    ray.setFromCamera(pointer, engine.camera);
    for (const hit of ray.intersectObjects(pickRoots, true)) {
      let obj = hit.object;
      while (obj && !obj.userData.pickKey) obj = obj.parent;
      if (obj?.userData.pickKey) return obj.userData.pickKey;
    }
    return null;
  }

  let down3d = null;
  stageCanvas.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    down3d = [event.clientX, event.clientY];
    const key = pickPart(event);
    const info = key ? model.interactives.get(key) : null;
    if (info?.dial) {
      event.stopImmediatePropagation();
      dialDrag = { id: event.pointerId, dial: info.dial, lastX: event.clientX, lastY: event.clientY };
      viewport.classList.add('is-dragging');
      stageCanvas.setPointerCapture(event.pointerId);
    }
  }, { signal, capture: true });

  stageCanvas.addEventListener('pointermove', event => {
    if (dialDrag?.id === event.pointerId) {
      const dx = event.clientX - dialDrag.lastX;
      const dy = dialDrag.lastY - event.clientY;
      dialDrag.lastX = event.clientX;
      dialDrag.lastY = event.clientY;
      const delta = dy + dx * 0.4;
      if (Math.abs(delta) < 0.2) return;
      audio.play('dial');
      if (dialDrag.dial === 'macro') {
        setMacro(settings.macro + delta * (index >= 2 ? 0.5 : 1.6));
      } else if (dialDrag.dial === 'micro') {
        settings.micro = Number(clamp(settings.micro + delta * 0.16, -60, 60).toFixed(1));
        micro.set(settings.micro);
        change();
      } else if (dialDrag.dial === 'charX') {
        pan(settings.x + delta * 12, settings.y);
      } else if (dialDrag.dial === 'charY') {
        pan(settings.x, settings.y + delta * 12);
      } else if (dialDrag.dial === 'reostat') {
        settings.lamp = clamp(settings.lamp + delta * 0.006, 0, 1);
        light.set(Math.round(settings.lamp * 100));
        change();
      }
      return;
    }
    if (event.buttons || event.pointerType === 'touch') { hideTooltip(tooltip, viewport); return; }
    const key = pickPart(event);
    hoveredKey = key;
    if (key) {
      const info = model.interactives.get(key);
      showTooltip(tooltip, viewport, event.clientX, event.clientY, info.title, info.subtitle, info.color);
    } else {
      hideTooltip(tooltip, viewport);
    }
  }, { signal });

  stageCanvas.addEventListener('pointerleave', () => { hoveredKey = null; hideTooltip(tooltip, viewport); }, { signal });

  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    stageCanvas.addEventListener(type, event => {
      if (dialDrag) {
        dialDrag = null;
        viewport.classList.remove('is-dragging');
        return;
      }
      if (type === 'pointerup' && down3d && Math.hypot(down3d[0] - event.clientX, down3d[1] - event.clientY) < 7) {
        const key = pickPart(event);
        const info = key ? model.interactives.get(key) : null;
        if (info?.objectiveIndex !== undefined) objective(info.objectiveIndex);
      }
      down3d = null;
    }, { signal });
  }

  const projection = [
    label('Oculares 10×', group(model.root, 0.65, 5.25, 0.45)),
    label('Revólver', group(model.root, -1.06, 3.88, 0.44)),
    label('Platina', group(model.stage, -0.92, 0.24, 0.48)),
    label('Macro / Micro', group(model.root, 1.48, 1.38, -0.85))
  ];
  projection.forEach(item => { item.enabled = true; });
  updateDetails();
  const hoverTint = new T.Color();

  return {
    update(dt) {
      time += dt;
      const lens = atLens();
      const blend = 1 - Math.exp(-dt * 9.5);
      spin += (angleAim - spin) * blend;
      model.turret.rotation.y = spin;

      // Stage mechanical height moves EXCLUSIVELY with Macrométrico (coarse rack-and-pinion)!
      // Micrométrico adjusts ultra-fine optical focal plane WITHOUT moving the 3D stage plate!
      const coarseTravel = clamp(settings.macro, -500, 500) * 0.00105;
      const baseStageY = [2.46, 2.38, 2.28, 2.20, 2.15][index] ?? 2.2;
      const targetStageY = clamp(baseStageY + coarseTravel, 1.68, 2.84);
      model.stage.position.y += (targetStageY - model.stage.position.y) * blend;
      model.chariot.position.x += (-settings.x * 0.00024 - model.chariot.position.x) * blend;
      model.chariot.position.z += (settings.y * 0.00024 - model.chariot.position.z) * blend;

      // Synchronized independent physical rotation of coaxial Macro (outer) & Micro (inner) knobs!
      model.macro.rotation.x = model.leftMacro.rotation.x = settings.macro * 0.022;
      model.micro.rotation.x = model.leftMicro.rotation.x = settings.micro * 0.36;
      model.charX.rotation.y = settings.x * 0.0055;
      model.charY.rotation.y = settings.y * 0.0055;
      model.reostat.rotation.z = settings.lamp * 4.8;

      // Illuminator lamp + 10-blade condenser iris + external lever + live volumetric Köhler light cone
      model.lamp.intensity = settings.lamp * (1.2 + settings.iris * 4.4);
      model.lightMat.emissiveIntensity = settings.lamp <= 0.005 ? 0.02 : (0.18 + settings.lamp * 2.4);
      model.iris.forEach(blade => {
        blade.rotation.y = 0.22 + settings.iris * 1.38;
        blade.position.x = -0.14 + settings.iris * 0.11;
      });
      model.irisLever.rotation.y = -0.45 + settings.iris * 0.9;

      const beamAlpha = settings.lamp <= 0.005 ? 0 : settings.lamp * (0.04 + settings.iris * 0.2);
      model.beamMat.opacity = beamAlpha;
      const beamScale = 0.42 + settings.iris * 0.72;
      const span = Math.max(0.35, model.stage.position.y - 1.15);
      model.upperBeam.scale.set(beamScale, span / 1.25, beamScale);
      model.upperBeam.position.y = 1.15 + span * 0.5;
      model.lowerBeam.scale.set(0.65 + settings.iris * 0.4, 1, 0.65 + settings.iris * 0.4);

      if (model.drip.visible) {
        const immersionTouch = lens.oil ? 1.16 : 1.0;
        model.drip.scale.set(0.148 * immersionTouch, 0.084 * (lens.oil ? 1.32 : 1), 0.128 * immersionTouch);
      }

      // Smooth hover emissive feedback on interactive 3D microscope parts
      const hBlend = 1 - Math.exp(-dt * 11);
      for (const [key, item] of model.interactives) {
        const isHov = key === hoveredKey;
        const targets = item.alt ? [item.object, item.alt] : [item.object];
        for (const rootObj of targets) {
          rootObj.traverse(child => {
            const mat = child.material;
            if (!mat || !mat.isMeshStandardMaterial) return;
            if (mat.userData.baseEm === undefined) {
              mat.userData.baseEm = mat.emissive.clone();
              mat.userData.baseEmInt = mat.emissiveIntensity;
            }
            if (isHov) {
              hoverTint.set(item.color || '#52e0f0');
              mat.emissive.lerp(hoverTint, hBlend);
              mat.emissiveIntensity += ((mat.userData.baseEmInt + 0.28) - mat.emissiveIntensity) * hBlend;
            } else {
              mat.emissive.lerp(mat.userData.baseEm, hBlend);
              mat.emissiveIntensity += (mat.userData.baseEmInt - mat.emissiveIntensity) * hBlend;
            }
          });
        }
      }

      if (alertFlash > 0 && !settings.cracked) {
        alertFlash = Math.max(0, alertFlash - dt * 1.4);
        if (alertFlash === 0) ocularWrap.classList.remove('is-alert');
      }

      if (!imageDirty || time < timer) return;
      timer = time + (drag || dialDrag ? 0.055 : 0.028);
      imageDirty = false;
      const optical = ocular.draw(settings, lens);
      const minBlur = Math.min(...optical.blur);
      const inFocus = !settings.cracked && settings.lamp > 0.04 && minBlur <= 1.85 && !(lens.oil && !settings.oil);
      ocularWrap.classList.toggle('is-focused', inFocus);
      const warning = settings.cracked ? 'Lâmina trincada · substitua a lâmina' :
        settings.lamp <= 0.02 ? 'Lâmpada desligada · aumente o Reostato' :
        lens.oil && !settings.oil ? `${lens.power}× · aplique óleo de imersão` :
        minBlur > 1.85 ? 'Fora de foco · ajuste ' + (index <= 1 ? 'Macrométrico ou Micrométrico' : 'o Micrométrico') :
          `${optical.planeName} · ${fmt(fovFor(lens))} μm · Z ${fmtUm(optical.focal, 1)}`;
      status.className = 'ocular-status' + (settings.cracked ? ' danger' : inFocus ? ' ok' : '');
      if (status.textContent !== warning) status.textContent = warning;
    }
  };
}
