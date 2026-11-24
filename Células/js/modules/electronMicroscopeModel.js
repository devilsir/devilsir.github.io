import * as T from 'three';
import {
  v, group, mesh, box, sphere, cylinder, lathe, torus, rod,
  material, glow, enamelMaterial, metalMaterial, anodizedMaterial, glassMaterial
} from '../core/geometry.js';

function roundedSlab(parent, mat, w, d, h, r, bevel = 0.04, x = 0, y = 0, z = 0) {
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
    bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 4, curveSegments: 10
  });
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, -h / 2 + bevel, 0);
  geo.computeVertexNormals();
  return mesh(parent, geo, mat, x, y, z);
}

// Egg-crate grey acoustic foam room backdrop texture matching the real Hitachi HT7800 EM room photo!
function makeAcousticFoamTexture() {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 512;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#555d66';
  ctx.fillRect(0, 0, 512, 512);
  const step = 32;
  for (let y = 0; y < 512; y += step) {
    for (let x = 0; x < 512; x += step) {
      const g = ctx.createRadialGradient(x + step * 0.38, y + step * 0.34, 2, x + step * 0.5, y + step * 0.5, step * 0.65);
      g.addColorStop(0, '#858e98');
      g.addColorStop(0.55, '#59616b');
      g.addColorStop(1, '#31373e');
      ctx.fillStyle = g;
      ctx.fillRect(x, y, step, step);
    }
  }
  ctx.strokeStyle = 'rgba(20, 24, 30, 0.45)';
  ctx.lineWidth = 3;
  for (let p = 0; p <= 512; p += 256) {
    ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, 512); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(512, p); ctx.stroke();
  }
  const tex = new T.CanvasTexture(c);
  tex.wrapS = tex.wrapT = T.RepeatWrapping;
  tex.repeat.set(5.5, 2.5);
  tex.colorSpace = T.SRGBColorSpace;
  return tex;
}

// Speckled lab granite countertop texture for the Shimadzu Rayny EDX-720 bench (exact match to photo 2!)
function makeGraniteTexture() {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 256;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#a2a7ad';
  ctx.fillRect(0, 0, 256, 256);
  let s = 4211;
  const rnd = () => { s = (Math.imul(1664525, s) + 1013904223) >>> 0; return s / 4294967296; };
  for (let i = 0; i < 1600; i++) {
    const shade = rnd() > 0.5 ? '#262b30' : rnd() > 0.4 ? '#d8dde2' : '#656c75';
    ctx.fillStyle = shade;
    ctx.fillRect(rnd() * 256, rnd() * 256, 2 + rnd() * 4, 2 + rnd() * 4);
  }
  const tex = new T.CanvasTexture(c);
  tex.wrapS = tex.wrapT = T.RepeatWrapping;
  tex.repeat.set(2, 2);
  tex.colorSpace = T.SRGBColorSpace;
  return tex;
}

// Crisp Hitachi HT7800 front navy panel badge texture
function makeHitachiBadgeTexture() {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 384;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#1b2842';
  ctx.fillRect(0, 0, 256, 384);
  ctx.fillStyle = '#0e141f';
  ctx.fillRect(46, 26, 164, 58);
  ctx.strokeStyle = '#3f506e';
  ctx.lineWidth = 3;
  ctx.strokeRect(46, 26, 164, 58);
  for (const gx of [76, 146]) {
    ctx.shadowColor = '#5dff8f';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#62ff96';
    ctx.fillRect(gx, 40, 34, 30);
    ctx.shadowBlur = 0;
  }
  ctx.fillStyle = '#dce6f2';
  ctx.font = '800 36px Inter, Segoe UI, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('HT7800', 128, 212);
  ctx.fillStyle = '#8fa4c2';
  ctx.font = '600 13px Consolas, monospace';
  ctx.fillText('TEM · 600.000×', 128, 236);
  ctx.fillStyle = '#8295b0';
  ctx.fillRect(82, 256, 92, 34);
  ctx.fillStyle = '#1b2842';
  ctx.font = '700 11px Consolas, monospace';
  ctx.fillText('120 kV · EDS', 128, 277);
  const tex = new T.CanvasTexture(c);
  tex.colorSpace = T.SRGBColorSpace;
  return tex;
}

function makeHitachiWordmarkTexture() {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 64;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#e7eaee';
  ctx.fillRect(0, 0, 256, 64);
  ctx.fillStyle = '#252c36';
  ctx.font = '800 36px Inter, Segoe UI, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('HITACHI', 128, 44);
  const tex = new T.CanvasTexture(c);
  tex.colorSpace = T.SRGBColorSpace;
  return tex;
}

// Authentic blue Shimadzu "Rayny EDX-720" dome logo texture (matches user's attached photos 1 & 2!)
function makeRaynyLogoTexture() {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 256;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#ebeae4';
  ctx.fillRect(0, 0, 256, 256);
  ctx.fillStyle = '#3362b8';
  ctx.font = '800 68px Inter, Segoe UI, sans-serif';
  ctx.fillText('Ray', 40, 114);
  ctx.strokeStyle = '#3362b8';
  ctx.lineWidth = 5;
  ctx.font = '800 64px Inter, Segoe UI, sans-serif';
  ctx.strokeText('ny', 120, 168);
  ctx.fillStyle = '#3b424c';
  ctx.font = '700 17px Consolas, monospace';
  ctx.fillText('EDX-720', 44, 152);
  ctx.fillStyle = '#b6353a';
  ctx.fillRect(44, 182, 18, 12);
  ctx.fillStyle = '#404854';
  ctx.font = '700 13px Inter, sans-serif';
  ctx.fillText('SHIMADZU · EDS', 68, 193);
  const tex = new T.CanvasTexture(c);
  tex.colorSpace = T.SRGBColorSpace;
  return tex;
}

// Authentic Shimadzu Rayny EDX-720 curved trapezoidal 4-button front panel (Green START, Blue CLOSE/OPEN, Red STOP!)
function makeRaynyPanelTexture() {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 192;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#d8dad5';
  ctx.fillRect(0, 0, 512, 192);
  ctx.strokeStyle = '#9aa09a';
  ctx.lineWidth = 5;
  ctx.strokeRect(8, 8, 496, 176);

  // 6 status indicator LEDs along top strip
  const leds = ['POWER', 'X-RAY', 'SHUTTER', 'READY', 'VACUUM', 'EDS ON'];
  for (let i = 0; i < leds.length; i++) {
    const lx = 48 + i * 82;
    ctx.fillStyle = i === 1 || i === 5 ? '#f59e0b' : '#22c55e';
    ctx.beginPath(); ctx.arc(lx, 34, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#31363c';
    ctx.font = '700 11px Consolas, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(leds[i], lx, 56);
  }
  // 4 iconic colored circular tactile buttons (Green START, Blue CLOSE, Blue OPEN, Red STOP!)
  const btns = [
    [116, '#2bb673', 'START'],
    [208, '#3b74c8', 'CLOSE'],
    [304, '#3b74c8', 'OPEN'],
    [396, '#d94854', 'STOP']
  ];
  for (const [bx, col, lbl] of btns) {
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(bx, 126, 26, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#252a30';
    ctx.font = '700 13px Inter, sans-serif';
    ctx.fillText(lbl, bx, 90);
  }
  ctx.textAlign = 'left';
  const tex = new T.CanvasTexture(c);
  tex.colorSpace = T.SRGBColorSpace;
  return tex;
}

// Right LCD monitor: switches dynamically between Copper Grid Stage Map AND Live EDS X-Ray Spectrum (keV)!
function makeGridMonitorTexture() {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 320;
  const ctx = c.getContext('2d');
  const tex = new T.CanvasTexture(c);
  tex.colorSpace = T.SRGBColorSpace;

  function draw(panX = 0, panY = 0, mag = 1000, kv = 100, beamOn = true, mode = 'TEM', edsActive = false, elements = null) {
    ctx.fillStyle = '#0e1928';
    ctx.fillRect(0, 0, 512, 320);
    ctx.fillStyle = '#172840';
    ctx.fillRect(0, 0, 512, 34);
    ctx.fillStyle = edsActive ? '#fbbf24' : '#7ce4f5';
    ctx.font = '700 14px Consolas, monospace';
    ctx.fillText(edsActive ? 'RAYNY EDX-720 / SDD-EDS · ESPECTRO RAIOS X (keV)' : 'HITACHI HT7800 · STAGE MAP (GRADE Cu 3 mm)', 14, 22);

    if (edsActive && elements && elements.length) {
      // Live mini X-Ray Spectrum right on the 3D desk LCD monitor!
      const ox = 36, oy = 270, pw = 452, ph = 205, maxKev = 8.0;
      ctx.strokeStyle = 'rgba(130, 175, 210, 0.28)';
      ctx.lineWidth = 1;
      for (let g = 0; g <= 4; g++) {
        const y = oy - (g / 4) * ph;
        ctx.beginPath(); ctx.moveTo(ox, y); ctx.lineTo(ox + pw, y); ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      for (let px = 0; px <= pw; px += 2) {
        const e = (px / pw) * maxKev;
        // Bremsstrahlung continuum + Gaussian characteristic Kα/Mα peaks!
        let yv = beamOn ? Math.max(0.02, 0.16 * Math.exp(-e * 0.42) * Math.min(1, e * 3.5)) : 0;
        if (beamOn) {
          for (const el of elements) {
            const d = (e - el.kev) / 0.14;
            yv += (el.wt / 46) * Math.exp(-0.5 * d * d);
          }
        }
        ctx.lineTo(ox + px, oy - Math.min(1, yv) * (ph - 18));
      }
      ctx.strokeStyle = '#60f0ff';
      ctx.lineWidth = 2;
      ctx.stroke();

      for (const el of elements) {
        const ex = ox + (el.kev / maxKev) * pw;
        const eh = Math.min(0.95, 0.14 + el.wt / 46) * (ph - 18);
        ctx.fillStyle = el.color;
        ctx.fillRect(ex - 2, oy - eh, 4, eh);
        ctx.font = '700 12px Consolas, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(el.symbol, ex, oy - eh - 6);
      }
      ctx.fillStyle = '#9db5ca';
      ctx.font = '600 11px Consolas, monospace';
      for (let k = 0; k <= 8; k += 2) {
        ctx.fillText(k + ' keV', ox + (k / maxKev) * pw, oy + 18);
      }
      ctx.textAlign = 'left';
      tex.needsUpdate = true;
      return;
    }

    // Default: Copper EM Grid Stage Map
    const cx = 160, cy = 180, r = 104;
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = '#07111a';
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.strokeStyle = 'rgba(214, 152, 92, 0.42)';
    ctx.lineWidth = 1.5;
    for (let g = -r; g <= r; g += 22) {
      ctx.beginPath(); ctx.moveTo(cx + g, cy - r); ctx.lineTo(cx + g, cy + r); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - r, cy + g); ctx.lineTo(cx + r, cy + g); ctx.stroke();
    }
    const px = cx + panX * r * 0.72;
    const py = cy + panY * r * 0.72;
    ctx.strokeStyle = beamOn ? '#4ef5a8' : '#ff5f7d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px - 18, py); ctx.lineTo(px + 18, py);
    ctx.moveTo(px, py - 18); ctx.lineTo(px, py + 18);
    ctx.stroke();
    ctx.beginPath(); ctx.arc(px, py, 9, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();

    ctx.strokeStyle = '#d49a5d';
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();

    const rows = [
      ['MODO', mode],
      ['AUMENTO', mag.toLocaleString('pt-BR') + '×'],
      ['FEIXE HV', beamOn ? kv + ' kV · ON' : 'DESLIGADO'],
      ['VÁCUO COL.', '1.2×10⁻⁵ Pa'],
      ['DETECTOR', 'SDD-EDS PRONTO'],
      ['EMISSÃO', beamOn ? '12.4 μA' : '0.0 μA'],
      ['STAGE X/Y', `${(panX * 400).toFixed(0)} / ${(panY * 400).toFixed(0)} μm`]
    ];
    let ry = 68;
    for (const [k, val] of rows) {
      ctx.fillStyle = '#7e97b0';
      ctx.font = '600 12px Consolas, monospace';
      ctx.fillText(k, 298, ry);
      ctx.fillStyle = k === 'FEIXE HV' && !beamOn ? '#ff6f8c' : '#dff6ff';
      ctx.font = '700 15px Consolas, monospace';
      ctx.fillText(val, 298, ry + 18);
      ry += 36;
    }
    tex.needsUpdate = true;
  }
  draw();
  return { texture: tex, update: draw };
}

export function buildElectronMicroscope(scene, liveMonitorCanvas) {
  const floor = mesh(scene, new T.PlaneGeometry(42, 32),
    material('#394048', { roughness: 0.78, metalness: 0.08 }), 0, 0, 0);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;

  const tileGrid = new T.GridHelper(36, 36, '#5a6572', '#444d57');
  tileGrid.position.y = 0.008;
  scene.add(tileGrid);

  const foamMat = new T.MeshStandardMaterial({
    map: makeAcousticFoamTexture(), roughness: 0.92, metalness: 0.02
  });
  const backWall = mesh(scene, new T.PlaneGeometry(30, 12), foamMat, -1.6, 6.0, -4.6);
  backWall.receiveShadow = true;
  const leftWall = mesh(scene, new T.PlaneGeometry(16, 12), foamMat, -12.5, 6.0, 2.0);
  leftWall.rotation.y = Math.PI / 2;

  const labSpot = new T.PointLight('#eef6ff', 1.85, 22, 1.4);
  labSpot.position.set(-2.2, 8.2, 4.8);
  const edxSpot = new T.PointLight('#fff0d6', 1.3, 12, 1.6);
  edxSpot.position.set(-6.0, 4.8, 3.0);
  scene.add(labSpot, edxSpot);

  const white = enamelMaterial('#e9edf0', { roughness: 0.24, clearcoat: 0.62 });
  const raynyWhite = enamelMaterial('#ebeae4', { roughness: 0.26, clearcoat: 0.56 });
  const offWhite = enamelMaterial('#dfe4e8', { roughness: 0.30, clearcoat: 0.45 });
  const navy = enamelMaterial('#1b2a46', { roughness: 0.28, clearcoat: 0.52 });
  const dark = anodizedMaterial('#181f2a', { roughness: 0.34, metalness: 0.55 });
  const black = anodizedMaterial('#0f141c', { roughness: 0.28, metalness: 0.45 });
  const chrome = metalMaterial('#e2ebf2', { metalness: 0.96, roughness: 0.08 });
  const steel = metalMaterial('#aebbc6', { metalness: 0.88, roughness: 0.24 });

  const root = group(scene, -1.55, 0, 0);
  const interactives = new Map();

  // =========================================================================
  // 1. HITACHI HT7800 MAIN CABINET, COLUMN & SILICON-DRIFT EDS DETECTOR!
  // =========================================================================
  const tem = group(root, -1.35, 0, -0.35);

  roundedSlab(tem, white, 2.92, 2.74, 2.28, 0.08, 0.04, 0, 1.18, 0.1);
  roundedSlab(tem, dark, 2.78, 2.58, 0.14, 0.06, 0.02, 0, 0.07, 0.1);
  box(tem, navy, 0.64, 2.24, 0.07, 0, 1.18, 1.505);
  mesh(tem, new T.PlaneGeometry(0.58, 0.86),
    new T.MeshStandardMaterial({ map: makeHitachiBadgeTexture(), emissiveMap: makeHitachiBadgeTexture(), emissive: new T.Color('#88ffb8'), emissiveIntensity: 0.34, roughness: 0.30 }),
    0, 1.72, 1.546);
  mesh(tem, new T.PlaneGeometry(0.62, 0.155),
    new T.MeshStandardMaterial({ map: makeHitachiWordmarkTexture(), roughness: 0.28 }),
    0.94, 1.98, 1.522);

  roundedSlab(tem, offWhite, 2.52, 1.76, 0.62, 0.08, 0.035, 0, 2.62, -0.22);

  const column = group(tem, 0, 2.88, -0.26);
  column.userData.pickKey = 'column';
  roundedSlab(column, white, 1.92, 1.38, 3.12, 0.14, 0.04, 0, 1.56, -0.36);
  box(column, navy, 0.32, 3.04, 0.88, -0.58, 1.54, 0.06);
  box(column, navy, 0.32, 3.04, 0.88, 0.58, 1.54, 0.06);

  cylinder(column, white, 0.42, 0.44, 4.18, 0, 2.18, 0.34, 32);
  torus(column, offWhite, 0.425, 0.025, 0, 4.26, 0.34).rotation.x = Math.PI / 2;
  cylinder(column, offWhite, 0.25, 0.26, 3.68, -0.68, 1.92, -0.45, 24);
  roundedSlab(column, white, 0.54, 0.48, 0.92, 0.08, 0.03, 0, 0.48, 0.72);

  const beamMat = glow('#5ef0ff', 1.15, { transparent: true, opacity: 0.9 });
  const beamStrip = cylinder(column, beamMat, 0.022, 0.022, 2.65, 0, 2.1, 0.785, 10);
  box(column, dark, 0.09, 2.74, 0.04, 0, 2.1, 0.765);

  const apertures = group(column, 0, 0, 0.78);
  apertures.userData.pickKey = 'apertures';
  for (const [ay, r] of [[2.22, 0.11], [1.74, 0.11], [1.26, 0.10]]) {
    cylinder(apertures, steel, r, r, 0.18, 0, ay, 0.06, 20).rotation.x = Math.PI / 2;
    cylinder(apertures, chrome, r * 0.62, r * 0.62, 0.24, 0, ay, 0.12, 18).rotation.x = Math.PI / 2;
    cylinder(apertures, dark, 0.045, 0.045, 0.22, -0.14, ay, 0.04, 14).rotation.z = Math.PI / 2;
  }

  // Coupled Silicon-Drift X-Ray EDS Detector (SDD-EDS) mounted angled on the LEFT of the TEM specimen chamber!
  const sddDetector = group(column, -0.58, 1.78, 0.42);
  sddDetector.rotation.z = 0.44;
  sddDetector.userData.pickKey = 'edsDetector';
  cylinder(sddDetector, chrome, 0.12, 0.14, 0.45, -0.16, 0, 0, 20).rotation.z = Math.PI / 2;
  cylinder(sddDetector, anodizedMaterial('#213654', { metalness: 0.65, roughness: 0.26 }), 0.19, 0.19, 0.56, -0.62, 0, 0, 22).rotation.z = Math.PI / 2;
  const sddLedMat = glow('#fbbf24', 0.35);
  torus(sddDetector, sddLedMat, 0.195, 0.02, -0.40, 0, 0).rotation.y = Math.PI / 2;
  // Subtle X-ray fluorescence beam indicator pulsing when EDS mapping is active
  const xrayConeMat = glow('#fbbf24', 0.9, { transparent: true, opacity: 0.0, depthWrite: false });
  const xrayCone = cylinder(sddDetector, xrayConeMat, 0.03, 0.11, 0.42, 0.16, 0, 0, 14);
  xrayCone.rotation.z = Math.PI / 2;
  interactives.set('edsDetector', {
    object: sddDetector, title: 'Detector de Raios X SDD-EDS acoplado à coluna',
    subtitle: 'Capta raios X característicos (Kα / Mα) emitidos pela amostra para o mapeamento químico', color: '#fbbf24'
  });

  // Side-Entry Specimen Goniometer & Retractable Sample Rod (right side of column)
  const goniometer = group(column, 0.54, 1.72, 0.34);
  goniometer.userData.pickKey = 'goniometer';
  roundedSlab(goniometer, offWhite, 0.36, 0.42, 0.42, 0.05, 0.02, 0.14, -0.12, 0.04);
  cylinder(goniometer, white, 0.22, 0.24, 0.58, 0.32, 0.04, 0.02, 24).rotation.z = Math.PI / 2;
  torus(goniometer, chrome, 0.21, 0.024, 0.60, 0.04, 0.02).rotation.y = Math.PI / 2;
  const sampleRod = group(goniometer, 0.62, 0.04, 0.02);
  cylinder(sampleRod, chrome, 0.085, 0.095, 0.44, 0.18, 0, 0, 18).rotation.z = Math.PI / 2;
  cylinder(sampleRod, offWhite, 0.13, 0.13, 0.12, 0.40, 0, 0, 20).rotation.z = Math.PI / 2;
  const vacLedMat = glow('#4ef59e', 1.1);
  sphere(goniometer, vacLedMat, 0.032, 0.032, 0.032, 0.24, -0.14, 0.26, 10);

  interactives.set('column', {
    object: column, title: 'Coluna de Elétrons · Hitachi HT7800 (até 600.000×)',
    subtitle: 'Canhão de elétrons 40–120 kV, lentes eletromagnéticas e alto vácuo (1,2×10⁻⁵ Pa)', color: '#5ef0ff'
  });
  interactives.set('apertures', {
    object: apertures, title: 'Aberturas Condensadora e Objetiva',
    subtitle: 'Controlam coerência do feixe de elétrons e contraste de difração TEM', color: '#c4d8e6'
  });
  interactives.set('goniometer', {
    object: goniometer, title: 'Goniômetro Lateral e Porta-amostra (Grade Cu 3 mm)',
    subtitle: 'Clique para simular troca da grade de cobre no sistema de pré-vácuo', color: '#4ef59e'
  });

  // =========================================================================
  // 2. BENCHTOP SHIMADZU "Rayny EDX-720" X-RAY SPECTROMETER (LEFT BENCH!)
  //    (Faithful to user's attached photos 1, 2 & X-ray diagram 3!)
  // =========================================================================
  const edxBench = group(root, -4.35, 0, 0.35);
  edxBench.userData.pickKey = 'rayny';
  // Speckled grey granite lab counter & cabinet underneath (matches photo 2!)
  roundedSlab(edxBench, offWhite, 2.38, 2.15, 1.56, 0.04, 0.02, 0, 0.78, 0);
  const granMat = new T.MeshStandardMaterial({ map: makeGraniteTexture(), roughness: 0.32, metalness: 0.08 });
  roundedSlab(edxBench, granMat, 2.48, 2.24, 0.10, 0.03, 0.015, 0, 1.61, 0);

  // Rayny EDX-720 main unit seated cleanly atop the granite bench (y = 1.66)
  const rayny = group(edxBench, 0, 1.66, 0.05);
  // Twin iconic vertical curved white side wing towers flanking the cylindrical chamber!
  roundedSlab(rayny, raynyWhite, 0.44, 1.38, 1.48, 0.09, 0.03, -0.84, 0.76, -0.04);
  roundedSlab(rayny, raynyWhite, 0.44, 1.38, 1.48, 0.09, 0.03, 0.84, 0.76, -0.04);
  // Rear spine housing
  roundedSlab(rayny, raynyWhite, 1.42, 0.46, 1.44, 0.08, 0.025, 0, 0.74, -0.48);

  // Curved semi-cylindrical white front lower apron pedestal + iconic trapezoidal 4-button panel!
  cylinder(rayny, raynyWhite, 0.86, 0.88, 0.66, 0, 0.33, 0.14, 32);
  const panelPlane = mesh(rayny, new T.PlaneGeometry(0.92, 0.34),
    new T.MeshStandardMaterial({ map: makeRaynyPanelTexture(), roughness: 0.34 }), 0, 0.665, 0.82);
  panelPlane.rotation.x = -0.68;

  // Gleaming mirror-polished stainless-steel cylindrical X-ray chamber bowl inside!
  cylinder(rayny, chrome, 0.76, 0.76, 0.24, 0, 0.66, 0.08, 32);
  cylinder(rayny, dark, 0.70, 0.70, 0.22, 0, 0.68, 0.08, 30);

  // Spinning White 12-Position Circular Perforated Sample Turret Carousel inside chamber (Photo 2!)
  const raynyTurret = group(rayny, 0, 0.80, 0.08);
  cylinder(raynyTurret, white, 0.60, 0.60, 0.055, 0, 0, 0, 32);
  cylinder(raynyTurret, chrome, 0.15, 0.15, 0.09, 0, 0.03, 0, 22); // gleaming chrome center hub!
  // 12 circular sample wells arranged around the turret perimeter!
  const sampleGlowColors = ['#ef4444', '#22c55e', '#fbbf24', '#3b82f6', '#d946ef', '#f97316'];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const wx = Math.cos(a) * 0.42, wz = Math.sin(a) * 0.42;
    cylinder(raynyTurret, black, 0.072, 0.072, 0.062, wx, 0.008, wz, 14);
    cylinder(raynyTurret, metalMaterial(sampleGlowColors[i % 6], { metalness: 0.6, roughness: 0.3 }), 0.05, 0.05, 0.02, wx, 0.04, wz, 12);
  }

  // Animated Primary X-Ray & Colored Characteristic Fluorescent X-Ray Emission Rays (Photo 3!)
  const xrayRays = group(rayny, 0, 0.85, 0.08);
  const rayPrimary = cylinder(xrayRays, glow('#f59e0b', 1.4, { transparent: true, opacity: 0.75 }), 0.018, 0.048, 0.56, 0, 0.30, 0, 10);
  const emitSpecs = [
    [-0.24, 0.36, 0.12, '#ec4899'], // Fe magenta-rose
    [-0.14, 0.44, -0.14, '#84cc16'], // Mo / Mg green
    [0.18, 0.42, 0.10, '#0ea5e9'],  // Cr / Os cyan-blue
    [0.26, 0.34, -0.12, '#a855f7']  // Ni / P violet
  ];
  const emitBeams = emitSpecs.map(([ex, ey, ez, hex]) => {
    const target = new T.Vector3(ex, ey, ez);
    const len = target.length();
    const beam = cylinder(xrayRays, glow(hex, 1.3, { transparent: true, opacity: 0.82 }), 0.014, 0.008, len, 0, 0, 0, 8);
    beam.position.copy(target).multiplyScalar(0.5);
    beam.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), target.clone().normalize());
    return beam;
  });
  xrayRays.visible = false;

  // Motorized Lifting Cylindrical White Chamber Dome with Iconic Blue "Rayny EDX-720" Logo!
  const raynyDome = group(rayny, 0, 0.66, 0.08);
  cylinder(raynyDome, raynyWhite, 0.68, 0.71, 1.06, 0, 0.56, 0, 32);
  sphere(raynyDome, raynyWhite, 0.68, 0.16, 0.68, 0, 1.09, 0, 24);
  // Mirror-chrome bottom sealing lip ring of the lifting dome (clearly visible in Photo 1 & 2!)
  cylinder(raynyDome, chrome, 0.725, 0.725, 0.08, 0, 0.04, 0, 32);
  // Curved front "Rayny EDX-720" blue logo graphic!
  const logoGeo = new T.CylinderGeometry(0.708, 0.716, 0.44, 18, 1, true, -0.34, 0.68);
  mesh(raynyDome, logoGeo, new T.MeshStandardMaterial({ map: makeRaynyLogoTexture(), roughness: 0.32 }), 0, 0.62, 0);

  interactives.set('rayny', {
    object: edxBench, title: 'Espectrômetro Shimadzu Rayny EDX-720 (EDS / XRF)',
    subtitle: 'Clique para abrir/fechar a câmara motorizada e observar o carrossel de 12 amostras e fluorescência de raios X!', color: '#3b82f6'
  });

  // =========================================================================
  // 3. ADJACENT WHITE OPERATOR DESK, DUAL LIVE LCD MONITORS & E-STOP!
  // =========================================================================
  const desk = group(root, 1.65, 0, -0.22);
  roundedSlab(desk, white, 3.16, 1.98, 0.11, 0.04, 0.02, 0, 1.92, 0.1);
  roundedSlab(desk, offWhite, 0.14, 1.72, 1.88, 0.03, 0.015, -1.48, 0.94, 0.08);
  roundedSlab(desk, offWhite, 1.98, 0.08, 1.25, 0.02, 0.01, -0.45, 1.26, -0.68);

  roundedSlab(desk, white, 1.06, 1.78, 1.88, 0.05, 0.025, 1.02, 0.94, 0.08);
  box(desk, black, 0.56, 1.08, 0.12, 1.02, 0.68, 0.94);
  box(desk, glow('#48c8ff', 0.8), 0.12, 0.018, 0.02, 1.02, 1.10, 1.01);
  box(desk, offWhite, 0.42, 0.24, 0.04, 0.76, 1.56, 0.97);
  box(desk, glow('#62ff96', 0.95), 0.09, 0.11, 0.03, 0.68, 1.56, 0.995);
  box(desk, glow('#62ff96', 0.95), 0.09, 0.11, 0.03, 0.84, 1.56, 0.995);

  const estop = group(desk, 1.30, 1.56, 0.98);
  estop.userData.pickKey = 'estop';
  cylinder(estop, enamelMaterial('#e6b828', { roughness: 0.35 }), 0.17, 0.17, 0.06, 0, 0, 0, 24).rotation.x = Math.PI / 2;
  const estopCap = cylinder(estop, enamelMaterial('#d92b34', { roughness: 0.22, clearcoat: 0.75 }), 0.12, 0.11, 0.13, 0, 0, 0.07, 24);
  estopCap.rotation.x = Math.PI / 2;
  interactives.set('estop', {
    object: estop, title: 'Botão de Emergência (EMERG / Feixe HV)',
    subtitle: 'Clique para cortar ou religar instantaneamente o feixe de elétrons (kV)', color: '#ff5268'
  });

  const monitors = group(desk, -0.04, 1.98, -0.35);
  monitors.userData.pickKey = 'monitors';
  const liveTex = new T.CanvasTexture(liveMonitorCanvas);
  liveTex.colorSpace = T.SRGBColorSpace;
  const gridMonitor = makeGridMonitorTexture();

  for (const [mx, tex] of [[-0.78, liveTex], [0.78, gridMonitor.texture]]) {
    roundedSlab(monitors, black, 0.56, 0.42, 0.045, 0.04, 0.01, mx, 0.022, 0.02);
    cylinder(monitors, dark, 0.065, 0.08, 0.42, mx, 0.22, -0.06, 14);
    roundedSlab(monitors, black, 1.48, 0.08, 0.94, 0.03, 0.015, mx, 0.68, 0.0);
    const scrMat = new T.MeshStandardMaterial({
      map: tex, emissiveMap: tex, emissive: new T.Color('#ffffff'), emissiveIntensity: 0.78, roughness: 0.16
    });
    mesh(monitors, new T.PlaneGeometry(1.38, 0.84), scrMat, mx, 0.68, 0.062);
  }
  interactives.set('monitors', {
    object: monitors, title: 'Monitores Duplos de Aquisição TEM & Espectro EDS',
    subtitle: 'Monitor esquerdo espelha o mapa ao vivo; direito mostra grade de cobre ou espectro de raios X (keV)', color: '#4bc7d8'
  });

  const consoleGroup = group(desk, -0.08, 1.98, 0.48);
  consoleGroup.userData.pickKey = 'console';
  roundedSlab(consoleGroup, white, 0.36, 0.38, 0.08, 0.04, 0.015, -1.06, 0.04, 0.05);
  sphere(consoleGroup, dark, 0.065, 0.055, 0.065, -1.06, 0.085, 0.04, 16);
  roundedSlab(consoleGroup, white, 0.96, 0.46, 0.11, 0.05, 0.018, -0.26, 0.055, 0.04);
  for (const dx of [-0.54, -0.26, 0.02]) {
    cylinder(consoleGroup, dark, 0.072, 0.08, 0.075, dx, 0.135, 0.02, 18);
    torus(consoleGroup, chrome, 0.065, 0.008, dx, 0.172, 0.02).rotation.x = Math.PI / 2;
  }
  roundedSlab(consoleGroup, black, 1.12, 0.38, 0.045, 0.03, 0.01, 0.86, 0.022, -0.02);
  box(consoleGroup, enamelMaterial('#1e3d78', { roughness: 0.72 }), 0.48, 0.012, 0.38, 0.66, 0.006, 0.34);
  sphere(consoleGroup, black, 0.075, 0.042, 0.115, 0.66, 0.032, 0.34, 14);
  interactives.set('console', {
    object: consoleGroup, title: 'Console de Comando (Foco, Estigmador e Aumento 600.000×)',
    subtitle: 'Botões rotativos de precisão eletromagnética até 600.000×', color: '#e9edf0'
  });

  return {
    root, tem, column, beamMat, beamStrip, apertures, goniometer, sampleRod, vacLedMat,
    sddDetector, sddLedMat, xrayConeMat,
    edxBench, rayny, raynyDome, raynyTurret, xrayRays, emitBeams,
    desk, estop, estopCap, monitors, liveTex, updateGridMonitor: gridMonitor.update,
    consoleGroup, interactives
  };
}
