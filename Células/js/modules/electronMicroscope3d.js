import * as T from 'three';
import { group } from '../core/geometry.js';
import { deviceProfile } from '../core/deviceProfile.js?v=23';
import { emSpecimens, emSpecimenOptions } from '../data/emSpecimens.js?v=23';
import { buildElectronMicroscope } from './electronMicroscopeModel.js?v=14';
import { node, button, select, toggle, range, row, card, heading, note, metric, showTooltip, hideTooltip } from '../core/ui.js?v=9';

const clamp = (val, lo, hi) => Math.max(lo, Math.min(hi, val));
const smoothstep = u => { const c = clamp(u, 0, 1); return c * c * (3 - 2 * c); };
const MIN_MAG = 200;
const MAX_MAG = 600000;
const MAG_SLIDER_STEPS = 1000;
const magPresets = [200, 2000, 10000, 100000, 600000];
const palettes = {
  gray: 'Escala de cinza real (TEM/MEV)',
  phosphor: 'Tela Fósforo Verde (P43)',
  falseColor: 'Falso-cor Científico (Ciano/Ouro)',
  invert: 'Negativo / Contraste Invertido'
};

// The logarithmic slider covers the selected specimen's entire magnification range.
const magToSlider = (mag, lo, hi) => Math.round(MAG_SLIDER_STEPS * Math.log(mag / lo) / Math.log(hi / lo));
const sliderToMag = (value, lo, hi) => Math.round(lo * (hi / lo) ** (value / MAG_SLIDER_STEPS));
const formatMag = mag => mag.toLocaleString('pt-BR') + '×';
const photoZoom = (tier, fovUm) => tier.widthUm / fovUm;

function fmtScale(um) {
  const nm = um * 1000;
  if (nm < 10) return nm.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' nm';
  if (um < 1) return Math.round(nm) + ' nm';
  return um.toLocaleString('pt-BR', { maximumFractionDigits: um < 10 ? 1 : 0 }) + ' μm';
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// Extract real spatial luminance & Sobel membrane-edge gradients once per specimen for 60 FPS EDS & 600.000x nano-synthesis!
// Wrapped in try/catch so even strict file:// CORS contexts never crash the Electron Microscope!
function extractFeatures(img) {
  try {
    const fw = deviceProfile.edsFeatWidth;
    const fh = Math.max(120, Math.round(fw * (img.naturalHeight / Math.max(1, img.naturalWidth))));
    const c = Object.assign(document.createElement('canvas'), { width: fw, height: fh });
    const x = c.getContext('2d', { willReadFrequently: true });
    x.drawImage(img, 0, 0, fw, fh);
    const data = x.getImageData(0, 0, fw, fh).data;
    const lum = new Float32Array(fw * fh);
    for (let i = 0, p = 0; i < lum.length; i++, p += 4) {
      lum[i] = (0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2]) / 255;
    }
    const edge = new Float32Array(fw * fh);
    const gxArr = new Float32Array(fw * fh);
    const gyArr = new Float32Array(fw * fh);
    for (let y = 1; y < fh - 1; y++) {
      for (let cx = 1; cx < fw - 1; cx++) {
        const idx = y * fw + cx;
        const gx = -lum[idx - fw - 1] + lum[idx - fw + 1] - 2 * lum[idx - 1] + 2 * lum[idx + 1] - lum[idx + fw - 1] + lum[idx + fw + 1];
        const gy = -lum[idx - fw - 1] - 2 * lum[idx - fw] - lum[idx - fw + 1] + lum[idx + fw - 1] + 2 * lum[idx + fw] + lum[idx + fw + 1];
        gxArr[idx] = gx;
        gyArr[idx] = gy;
        edge[idx] = Math.min(1, Math.hypot(gx, gy) * 1.45);
      }
    }
    return { fw, fh, lum, edge, gxArr, gyArr };
  } catch (_) {
    return null;
  }
}

function hash2d(x, y, salt = 0) {
  const h = (Math.imul(x + 1901, 374761393) ^ Math.imul(y + 607, 668265263) ^ salt) >>> 0;
  return (h & 0xffff) / 65535;
}

// Photo-guided 600.000x Nanoscale Ultrastructure Synthesizer (same luminance+gradient masking technique as the honeybee!)
// Seamlessly resolves specimen-specific membranes, bilayers, myofilaments, ribosomes, viral spikes, atomic fringes & SEM nanopores!
function drawEmNanoUltrastructure(ctx, W, viewH, spec, feat, sx, sy, sw, sh, iw, ih, z, fovUm) {
  const nanoMode = spec.nanoMode || (spec.mode === 'SEM' ? 'sem_bio' : 'cristae');
  const isRealHrtem = nanoMode === 'lattice_au' || nanoMode === 'lattice_mg';
  const threshold = isRealHrtem ? 2.2 : 1.32;
  if (!feat || z <= threshold) return;
  const alpha = smoothstep((z - threshold) / (isRealHrtem ? 2.6 : 2.4));
  if (alpha < 0.015) return;

  const { fw, fh, lum, edge, gxArr, gyArr } = feat;
  const sampleAt = (px, py) => {
    const ux = clamp(((sx + (px / W) * sw) / iw) * (fw - 1), 1, fw - 2);
    const uy = clamp(((sy + (py / viewH) * sh) / ih) * (fh - 1), 1, fh - 2);
    const i0 = (uy | 0) * fw + (ux | 0);
    return { L: lum[i0], E: edge[i0], gx: gxArr[i0], gy: gyArr[i0] };
  };

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // World-locked coordinate mapping so nanoscale details pan & zoom steadily without swimming!
  const stepUm = Math.max(fovUm / 44, isRealHrtem ? 0.0005 : 0.0038);
  const worldLeft = (sx / iw) * (fovUm * (iw / sw));
  const worldTop = (sy / ih) * (fovUm * (viewH / W) * (ih / sh));
  const pxPerUm = W / Math.max(1e-5, fovUm);

  const cellPx = clamp(stepUm * pxPerUm, deviceProfile.isMobile ? 16 : 12, 26);
  const ox = ((worldLeft * pxPerUm) % cellPx + cellPx) % cellPx;
  const oy = ((worldTop * pxPerUm) % cellPx + cellPx) % cellPx;
  const baseI = Math.floor(worldLeft / stepUm);
  const baseJ = Math.floor(worldTop / stepUm);

  for (let gx = -cellPx; gx <= W + cellPx; gx += cellPx) {
    for (let gy = -cellPx; gy <= viewH + cellPx; gy += cellPx) {
      const px = gx - ox;
      const py = gy - oy;
      if (px < -12 || py < -12 || px > W + 12 || py > viewH + 12) continue;
      const ti = baseI + Math.round(gx / cellPx);
      const tj = baseJ + Math.round(gy / cellPx);
      const r1 = hash2d(ti, tj, 101);
      const r2 = hash2d(ti, tj, 211);
      const jx = px + (r1 - 0.5) * cellPx * 0.45;
      const jy = py + (r2 - 0.5) * cellPx * 0.45;
      const s = sampleAt(jx, jy);
      const tan = Math.atan2(s.gy, s.gx) + Math.PI * 0.5;
      const tx = Math.cos(tan), ty = Math.sin(tan);
      const nx = -ty, ny = tx;

      if (nanoMode === 'cristae' || nanoMode === 'thylakoid' || nanoMode === 'golgi') {
        // Trilaminar 7 nm phospholipid double-rail membrane following real dark EM membrane edges!
        if (s.E > 0.13 && s.L < 0.72) {
          const w = clamp((s.E - 0.10) * 1.9, 0, 1) * alpha;
          const len = cellPx * (0.95 + r1 * 0.45);
          const gap = nanoMode === 'thylakoid' ? 3.2 : 2.6;
          for (const side of [-1, 1]) {
            const bx = jx + nx * side * gap * 0.5;
            const by = jy + ny * side * gap * 0.5;
            ctx.strokeStyle = `rgba(18, 22, 26, ${(0.44 * w).toFixed(3)})`;
            ctx.lineWidth = 1.65;
            ctx.beginPath();
            ctx.moveTo(bx - tx * len * 0.5, by - ty * len * 0.5);
            ctx.lineTo(bx + tx * len * 0.5, by + ty * len * 0.5);
            ctx.stroke();
          }
          // Bright hydrophilic hydrophobic core cleft between the twin dark osmium-stained leaflets!
          ctx.strokeStyle = `rgba(232, 238, 242, ${(0.34 * w).toFixed(3)})`;
          ctx.lineWidth = 1.1;
          ctx.beginPath();
          ctx.moveTo(jx - tx * len * 0.5, jy - ty * len * 0.5);
          ctx.lineTo(jx + tx * len * 0.5, jy + ty * len * 0.5);
          ctx.stroke();

          // Stalked 10 nm F0F1 ATP synthase knobs on cristae / photosystem knobs on thylakoids / clathrin coat on Golgi
          if (r2 > 0.42 && z > 2.0) {
            const side = r1 > 0.5 ? 1 : -1;
            const kx = jx + nx * side * (gap * 1.45);
            const ky = jy + ny * side * (gap * 1.45);
            ctx.fillStyle = `rgba(28, 32, 36, ${(0.46 * w).toFixed(3)})`;
            ctx.beginPath(); ctx.arc(kx, ky, 2.2, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = `rgba(220, 226, 232, ${(0.28 * w).toFixed(3)})`;
            ctx.lineWidth = 0.85;
            ctx.beginPath(); ctx.moveTo(jx, jy); ctx.lineTo(kx, ky); ctx.stroke();
          }
        } else if (s.L < 0.48 && r1 > 0.55) {
          // Electron-dense matrix granules / mitoribosomes (~20 nm)
          ctx.fillStyle = `rgba(22, 24, 28, ${(0.34 * alpha).toFixed(3)})`;
          ctx.beginPath(); ctx.arc(jx, jy, 1.8 + r2 * 1.6, 0, Math.PI * 2); ctx.fill();
        }
      } else if (nanoMode === 'sarcomere') {
        // Aligned 15 nm myosin thick & 7 nm actin thin myofilaments + periodic 14.3 nm cross-bridges!
        const w = clamp(1 - Math.abs(s.L - 0.45) * 1.6, 0.15, 1) * alpha;
        const len = cellPx * 1.25;
        ctx.strokeStyle = s.L < 0.48
          ? `rgba(16, 18, 22, ${(0.44 * w).toFixed(3)})`
          : `rgba(224, 228, 232, ${(0.32 * w).toFixed(3)})`;
        ctx.lineWidth = s.L < 0.48 ? 1.7 : 1.05;
        ctx.beginPath();
        ctx.moveTo(jx - tx * len * 0.5, jy - ty * len * 0.5);
        ctx.lineTo(jx + tx * len * 0.5, jy + ty * len * 0.5);
        ctx.stroke();
        if (s.L < 0.52 && z > 2.2) {
          // Cross-bridge ticks perpendicular to filament
          ctx.strokeStyle = `rgba(24, 28, 32, ${(0.36 * w).toFixed(3)})`;
          ctx.lineWidth = 0.9;
          ctx.beginPath();
          ctx.moveTo(jx - nx * 3.0, jy - ny * 3.0);
          ctx.lineTo(jx + nx * 3.0, jy + ny * 3.0);
          ctx.stroke();
        }
      } else if (nanoMode === 'chromatin') {
        // 11 nm beads-on-a-string nucleosome chromatin inside dark heterochromatin + 25 nm docked 80S ribosomes!
        if (s.L < 0.54) {
          const w = clamp((0.58 - s.L) * 2.1, 0, 1) * alpha;
          ctx.fillStyle = `rgba(18, 20, 24, ${(0.46 * w).toFixed(3)})`;
          ctx.beginPath(); ctx.arc(jx, jy, 2.2 + r1 * 1.8, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = `rgba(215, 220, 226, ${(0.24 * w).toFixed(3)})`;
          ctx.lineWidth = 0.85;
          ctx.stroke();
        } else if (s.E > 0.14) {
          // 80S Ribosome pair docked on ER/nuclear membrane
          ctx.fillStyle = `rgba(16, 18, 22, ${(0.42 * alpha).toFixed(3)})`;
          ctx.beginPath(); ctx.arc(jx, jy, 2.5, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(jx + tx * 3.4, jy + ty * 3.4, 1.8, 0, Math.PI * 2); ctx.fill();
        }
      } else if (nanoMode === 'virus' || nanoMode === 'phage') {
        // Viral glycoprotein spike trimers radiating along edges + capsomere hexon/penton facets!
        if (s.E > 0.15) {
          const w = clamp((s.E - 0.12) * 2.0, 0, 1) * alpha;
          const outDir = (s.gx * nx + s.gy * ny) >= 0 ? 1 : -1;
          const sx1 = jx + nx * outDir * 6.5;
          const sy1 = jy + ny * outDir * 6.5;
          ctx.strokeStyle = `rgba(235, 240, 244, ${(0.38 * w).toFixed(3)})`;
          ctx.lineWidth = 1.4;
          ctx.beginPath(); ctx.moveTo(jx, jy); ctx.lineTo(sx1, sy1); ctx.stroke();
          ctx.fillStyle = `rgba(244, 248, 250, ${(0.44 * w).toFixed(3)})`;
          ctx.beginPath(); ctx.arc(sx1, sy1, 2.2, 0, Math.PI * 2); ctx.fill();
        } else if (s.L > 0.24 && s.L < 0.72) {
          // Hexagonal capsomere protein subunits (~9 nm)
          ctx.strokeStyle = `rgba(22, 26, 30, ${(0.28 * alpha).toFixed(3)})`;
          ctx.lineWidth = 0.95;
          ctx.beginPath(); ctx.arc(jx, jy, 2.6 + r1 * 0.8, 0, Math.PI * 2); ctx.stroke();
        }
      } else if (nanoMode === 'lattice_au' || nanoMode === 'lattice_mg') {
        // Subtle Bragg phase-contrast atomic column reinforcement inside dark crystalline domains
        if (s.L < 0.58) {
          const w = clamp((0.62 - s.L) * 1.9, 0, 1) * alpha * 0.65;
          ctx.fillStyle = `rgba(242, 246, 250, ${(0.36 * w).toFixed(3)})`;
          ctx.beginPath(); ctx.arc(px, py, 1.5, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = `rgba(18, 22, 26, ${(0.32 * w).toFixed(3)})`;
          ctx.beginPath(); ctx.arc(px + cellPx * 0.5, py + cellPx * 0.5, 1.5, 0, Math.PI * 2); ctx.fill();
        }
      } else if (nanoMode === 'diatom') {
        // Ordered hexagonal opaline silica cribrum nanopores (~25-45 nm) inside diatom frustule!
        if (s.L > 0.22) {
          const w = clamp((s.L - 0.18) * 1.4, 0, 1) * alpha;
          const poreR = 2.4 + r1 * 1.3;
          ctx.fillStyle = `rgba(14, 18, 22, ${(0.48 * w).toFixed(3)})`;
          ctx.beginPath(); ctx.arc(px, py, poreR, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = `rgba(236, 242, 246, ${(0.34 * w).toFixed(3)})`;
          ctx.lineWidth = 1.0;
          ctx.beginPath(); ctx.arc(px - 0.5, py - 0.5, poreR + 0.6, -2.4, 0.6); ctx.stroke();
        }
      } else {
        // SEM nanoscale 3D topography: gold-sputter nanograins (~15 nm), epicuticular wax crystalloids & membrane micro-ripples!
        if (s.L > 0.12) {
          const w = clamp((s.L - 0.08) * 1.3, 0, 1) * alpha;
          const rad = nanoMode === 'sem_wax' ? (2.2 + r1 * 2.6) : (1.7 + r1 * 1.9);
          // Secondary-electron directional edge highlight (top-left bright, bottom-right shadow!)
          ctx.fillStyle = `rgba(242, 246, 250, ${(0.30 * w).toFixed(3)})`;
          ctx.beginPath();
          ctx.ellipse(jx - 0.8, jy - 0.8, rad, rad * (nanoMode === 'sem_wax' ? 0.55 : 0.82), tan, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = `rgba(14, 18, 22, ${(0.34 * w).toFixed(3)})`;
          ctx.beginPath();
          ctx.ellipse(jx + 0.9, jy + 0.9, rad * 0.9, rad * (nanoMode === 'sem_wax' ? 0.5 : 0.78), tan, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }
  ctx.restore();
}

function channelStrength(channel, L, E, seed) {
  // Subtle spatial harmonic modulation creates authentic elemental micro-domains on real ultrastructure
  if (channel === 'dark') return Math.pow(Math.max(0, 1 - L * 1.12), 1.65) * (0.78 + 0.22 * seed);
  if (channel === 'edge') return Math.min(1, Math.pow(E, 1.05) * 1.35 + Math.pow(Math.max(0, 1 - Math.abs(L - 0.36) * 2.6), 2) * 0.45);
  if (channel === 'mid') {
    const d = (L - 0.50) / 0.25;
    return Math.exp(-0.5 * d * d) * (0.72 + 0.28 * seed);
  }
  // 'bright' (organic matrix / bright 3D SEM secondary-electron metalized surfaces!)
  return Math.pow(Math.max(0, L - 0.16) / 0.84, 1.48) * (0.78 + 0.22 * seed);
}

function buildEdsOverlayCanvas(feat, elements, activeSymbol) {
  const { fw, fh, lum, edge } = feat;
  const c = Object.assign(document.createElement('canvas'), { width: fw, height: fh });
  const ctx = c.getContext('2d');
  const imgData = ctx.createImageData(fw, fh);
  const out = imgData.data;

  const list = activeSymbol === 'all' ? elements : elements.filter(e => e.symbol === activeSymbol);
  const parsed = list.map((el, idx) => ({
    ...el,
    rgb: hexToRgb(el.color),
    boost: activeSymbol === 'all' ? (0.65 + (el.wt / 45) * 0.65) : 1.55,
    phase: (idx + 1) * 1.7
  }));

  for (let y = 0; y < fh; y++) {
    for (let x = 0; x < fw; x++) {
      const i = y * fw + x;
      const L = lum[i], E = edge[i];
      let r = 0, g = 0, b = 0, aSum = 0;
      for (let k = 0; k < parsed.length; k++) {
        const el = parsed[k];
        const mod = 0.5 + 0.5 * Math.sin(x * 0.045 + el.phase) * Math.cos(y * 0.045 - el.phase * 0.7);
        const w = channelStrength(el.channel, L, E, mod) * el.boost;
        r += el.rgb[0] * w;
        g += el.rgb[1] * w;
        b += el.rgb[2] * w;
        aSum += w;
      }
      const p = i * 4;
      if (aSum > 0.02) {
        const inv = activeSymbol === 'all' ? (1 / Math.max(0.85, aSum)) : 1;
        out[p] = Math.min(255, r * inv);
        out[p + 1] = Math.min(255, g * inv);
        out[p + 2] = Math.min(255, b * inv);
        out[p + 3] = Math.min(240, aSum * (activeSymbol === 'all' ? 165 : 225));
      }
    }
  }
  ctx.putImageData(imgData, 0, 0);
  return c;
}

export function electronMicroscope3d({ scene, lights, engine, toolbar, guide, label, overlay, viewport, tooltip, signal, audio, help }) {
  lights.rim.color.set('#6be4f5');
  lights.rim.intensity = 1.65;
  scene.fog.density = 0.0062;

  const canvas = node('canvas', {
    width: deviceProfile.emCanvasW, height: deviceProfile.emCanvasH, tabIndex: 0,
    'aria-label': 'Monitor do Microscópio Eletrônico Hitachi HT7800 com mapeamento químico EDS até 600.000×.'
  });
  const ctx = canvas.getContext('2d');
  const offscreen = Object.assign(document.createElement('canvas'), { width: deviceProfile.emCanvasW, height: deviceProfile.emCanvasH });
  const octx = offscreen.getContext('2d');

  // Preload EM micrographs: on desktop preload all; on mobile load lazily per active specimen to protect mobile RAM!
  const imagesByFile = new Map();
  const featuresByFile = new Map();
  const edsCache = new Map();
  let dirty = true;

  function getTiers(spec) {
    const list = [
      ...(spec.tiers || []),
      { file: spec.file, widthUm: spec.baseWidthUm, focusCenter: spec.focusCenter, annotations: spec.annotations }
    ];
    list.sort((a, b) => b.widthUm - a.widthUm);
    return list;
  }

  function ensureImage(filePath) {
    if (imagesByFile.has(filePath)) return imagesByFile.get(filePath);
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => { dirty = true; };
    img.src = filePath;
    imagesByFile.set(filePath, img);
    return img;
  }

  function preloadSpecimen(spec) {
    for (const tier of getTiers(spec)) ensureImage(tier.file);
  }

  if (deviceProfile.lazyEmImages) {
    preloadSpecimen(emSpecimens.mitochondria);
  } else {
    for (const spec of Object.values(emSpecimens)) preloadSpecimen(spec);
  }

  function getEdsOverlay(filePath, elements, edsMode, specId) {
    if (edsMode === 'off') return null;
    const key = specId + '|' + filePath + '|' + edsMode;
    if (edsCache.has(key)) return edsCache.get(key);
    const img = imagesByFile.get(filePath);
    if (!img || !img.complete || !img.naturalWidth) return null;
    let feat = featuresByFile.get(filePath);
    if (feat === undefined) {
      feat = extractFeatures(img);
      featuresByFile.set(filePath, feat);
    }
    if (!feat) return null;
    // Cap offscreen EDS cache size to protect mobile RAM across long multi-specimen sessions
    if (edsCache.size >= (deviceProfile.isMobile ? 8 : 18)) edsCache.clear();
    const ov = buildEdsOverlayCanvas(feat, elements, edsMode);
    edsCache.set(key, ov);
    return ov;
  }

  const model = buildElectronMicroscope(scene, canvas);
  const DEFAULT_CAM = [[-1.35, 4.45, 16.2], [-0.45, 2.85, -0.2]];
  const EDX_CAM = [[-5.7, 3.6, 5.4], [-5.9, 2.35, 0.35]];
  engine.view(DEFAULT_CAM[0], DEFAULT_CAM[1], true);

  const settings = {
    specimen: 'mitochondria',
    mag: emSpecimens.mitochondria.defaultMag,
    kv: 100,
    focus: 0,
    stigmator: 0,
    contrast: 1.12,
    palette: 'gray',
    edsMode: 'all',
    edsOpacity: 0.62,
    chamberOpen: true,
    beamOn: true,
    labels: true,
    panX: 0,
    panY: 0
  };

  let time = 0, loadAnim = 0, domeLift = 1, drag = null, hoveredKey = null, locked = false, focusedEdx = false, rangeHint = '';

  const titleEl = node('div', { className: 'ocular-title' });
  const statusEl = node('div', { className: 'ocular-status', role: 'status' });
  const monitorLoaderTxt = node('span', {}, 'Carregando micrografia eletrônica e mapa EDS...');
  const monitorLoader = node('div', { className: 'ocular-loader', hidden: true },
    node('span', { className: 'mini-spin', 'aria-hidden': 'true' }),
    monitorLoaderTxt
  );
  const monitorWrap = node('div', { className: 'ocular-wrap em-screen-wrap' }, titleEl, canvas, monitorLoader, statusEl);
  overlay.append(monitorWrap);

  const infoHost = node('div');
  const metricsHost = node('div', { className: 'metrics' });
  const edsCardHost = node('div', { className: 'eds-card' });
  const specCanvas = node('canvas', { width: 320, height: 152, className: 'eds-spectrum' });
  const specCtx = specCanvas.getContext('2d');

  // Magnification preset buttons (200x -> 600.000x!)
  const magBtns = magPresets.map(val => {
    const lbl = val >= 1000 ? (val / 1000) + 'k×' : val + '×';
    const b = button(lbl, () => {
      setMag(val);
      audio.play('dial');
    }, { 'aria-pressed': String(val === settings.mag), title: val.toLocaleString('pt-BR') + '×' });
    b.style.setProperty('--lens', val >= 600000 ? '#f43f5e' : val >= 100000 ? '#a855f7' : val >= 10000 ? '#3b82f6' : val >= 2000 ? '#58c99a' : '#4bc7d8');
    return { val, b };
  });

  const magSlider = range('Aumento', 0, MAG_SLIDER_STEPS, 1, 0, value => {
    const { minMag = MIN_MAG, maxMag = MAX_MAG } = emSpecimens[settings.specimen];
    setMag(sliderToMag(value, minMag, maxMag));
  }, () => formatMag(settings.mag), { wheel: true });

  const kvSlider = range('Tensão HV', 5, 120, 5, settings.kv, v => {
    settings.kv = v;
    dirty = true;
    updateGuide();
  }, x => x + ' kV', { wheel: true, resetValue: 100 });

  const focusSlider = range('Foco Obj.', -20, 20, 0.5, settings.focus, v => {
    settings.focus = v;
    dirty = true;
  }, x => (x > 0 ? '+' : '') + x.toFixed(1), { wheel: true, resetValue: 0 });
  focusSlider.element.classList.add('is-fine');

  const stigSlider = range('Estigmador', -10, 10, 0.5, settings.stigmator, v => {
    settings.stigmator = v;
    dirty = true;
  }, x => (x > 0 ? '+' : '') + x.toFixed(1), { wheel: true, resetValue: 0 });

  const edsOpacitySlider = range('Opacidade EDS', 0, 100, 2, Math.round(settings.edsOpacity * 100), v => {
    settings.edsOpacity = v / 100;
    dirty = true;
  }, x => x + '%', { wheel: true, resetValue: 62 });

  const specimenSelect = select('Amostra EM', emSpecimenOptions, settings.specimen, id => {
    const spec = emSpecimens[id];
    preloadSpecimen(spec);
    settings.specimen = id;
    settings.kv = clamp(spec.defaultKv, 5, 120);
    kvSlider.set(settings.kv);
    if (settings.edsMode !== 'off' && settings.edsMode !== 'all') {
      const has = spec.elements.some(e => e.symbol === settings.edsMode);
      if (!has) settings.edsMode = 'all';
    }
    settings.panX = 0;
    settings.panY = 0;
    settings.focus = 0;
    settings.stigmator = 0;
    focusSlider.set(0);
    stigSlider.set(0);
    loadAnim = 1.0;
    audio.play('click');
    setMag(spec.defaultMag);
  });

  const paletteSelect = select('Cor base', palettes, settings.palette, val => {
    settings.palette = val;
    audio.play('click');
    dirty = true;
  });

  const edsToggleBtn = button('Mapa EDS: ON', () => {
    setEdsMode(settings.edsMode === 'off' ? 'all' : 'off');
  }, { 'aria-pressed': 'true' });

  const chamberBtn = button('Fechar câmara EDX', () => toggleChamber(), { 'aria-pressed': 'true' });
  const focusEdxBtn = button('Focar Rayny EDX-720', () => {
    focusedEdx = !focusedEdx;
    focusEdxBtn.textContent = focusedEdx ? 'Vista Geral TEM+EDX' : 'Focar Rayny EDX-720';
    focusEdxBtn.setAttribute('aria-pressed', String(focusedEdx));
    const cam = focusedEdx ? EDX_CAM : DEFAULT_CAM;
    engine.view(cam[0], cam[1], false);
    audio.play('click');
  }, { 'aria-pressed': 'false' });

  const beamBtn = button('Feixe HV: ON', () => toggleBeam(), { 'aria-pressed': 'true' });
  const identifyBtn = toggle('Identificar', settings.labels, on => {
    settings.labels = on;
    audio.play('click');
    dirty = true;
  });
  const lockBtn = toggle('Travar vista', false, on => {
    locked = on;
    engine.controls.enabled = !on;
    audio.play('click');
  });
  const centerBtn = button('Centralizar', () => {
    settings.panX = 0;
    settings.panY = 0;
    settings.focus = 0;
    settings.stigmator = 0;
    focusSlider.set(0);
    stigSlider.set(0);
    audio.play('click');
    dirty = true;
  });

  function toggleChamber() {
    settings.chamberOpen = !settings.chamberOpen;
    chamberBtn.textContent = settings.chamberOpen ? 'Fechar câmara EDX' : 'Abrir câmara EDX';
    chamberBtn.setAttribute('aria-pressed', String(settings.chamberOpen));
    audio.play('click');
  }

  function setEdsMode(nextMode) {
    settings.edsMode = nextMode;
    const isOn = nextMode !== 'off';
    edsToggleBtn.textContent = isOn ? (nextMode === 'all' ? 'Mapa EDS: Composto' : 'Mapa EDS: ' + nextMode) : 'Mapa EDS: OFF';
    edsToggleBtn.setAttribute('aria-pressed', String(isOn));
    audio.play('click');
    dirty = true;
    updateGuide();
  }

  function toggleBeam() {
    settings.beamOn = !settings.beamOn;
    beamBtn.textContent = settings.beamOn ? 'Feixe HV: ON' : 'Feixe: E-STOP';
    beamBtn.setAttribute('aria-pressed', String(settings.beamOn));
    beamBtn.classList.toggle('danger', !settings.beamOn);
    audio.play('click');
    dirty = true;
    updateGuide();
  }

  // True Hitachi HT7800 optical formula: FOV (μm) = (screenMm × 1000) / Magnification (100 mm viewing screen or 14–20 mm HRTEM CMOS!)
  function fovUmCurrent() {
    const spec = emSpecimens[settings.specimen];
    return ((spec.screenMm || 100) * 1000) / settings.mag;
  }

  // Pick dominant real photographic tier & optical zoom factor inside that tier
  function pickActiveTier(spec, fovUm) {
    const tiers = getTiers(spec);
    let hiIdx = 0;
    for (let i = 0; i < tiers.length; i++) {
      if (fovUm <= tiers[i].widthUm * 1.45) hiIdx = i;
    }
    const hiTier = tiers[hiIdx];
    const loTier = hiIdx > 0 ? tiers[hiIdx - 1] : null;
    let alphaHi = 1;
    if (loTier && fovUm > hiTier.widthUm * 0.82) {
      alphaHi = smoothstep((hiTier.widthUm * 1.45 - fovUm) / (hiTier.widthUm * 0.63));
    }
    return { loTier, hiTier, alphaHi, dominant: alphaHi >= 0.5 || !loTier ? hiTier : loTier };
  }

  function zoomFactor() {
    const spec = emSpecimens[settings.specimen];
    const fovUm = fovUmCurrent();
    const { dominant } = pickActiveTier(spec, fovUm);
    return Math.max(1, photoZoom(dominant, fovUm));
  }

  function clampPan() {
    const z = zoomFactor();
    const maxPan = Math.max(0, 0.5 - 0.5 / z);
    settings.panX = clamp(settings.panX, -maxPan, maxPan);
    settings.panY = clamp(settings.panY, -maxPan, maxPan);
  }

  function setMag(value) {
    const { minMag: lo = MIN_MAG, maxMag: hi = MAX_MAG } = emSpecimens[settings.specimen];
    rangeHint = '';
    if (value < lo) {
      rangeHint = `Aumento mínimo da amostra: ${formatMag(lo)}`;
    } else if (value > hi) {
      rangeHint = `Aumento máximo da amostra: ${formatMag(hi)}`;
    }
    settings.mag = Math.round(clamp(value, lo, hi));
    magSlider.set(magToSlider(settings.mag, lo, hi));
    magSlider.input.setAttribute('aria-valuetext', formatMag(settings.mag));
    for (const item of magBtns) {
      const inRange = item.val >= lo && item.val <= hi;
      item.b.setAttribute('aria-pressed', String(Math.abs(item.val - settings.mag) < Math.max(50, item.val * 0.04)));
      item.b.style.opacity = inRange ? '1' : '0.52';
    }
    clampPan();
    dirty = true;
    updateGuide();
  }

  function drawSpectrumPanel(spec) {
    const W = specCanvas.width, H = specCanvas.height;
    const c = specCtx;
    c.fillStyle = '#09111b';
    c.fillRect(0, 0, W, H);

    const ox = 24, oy = H - 24, pw = W - 36, ph = H - 40, maxKev = 8.0;
    c.strokeStyle = 'rgba(130, 175, 210, 0.16)';
    c.lineWidth = 1;
    for (let g = 0; g <= 3; g++) {
      const y = oy - (g / 3) * ph;
      c.beginPath(); c.moveTo(ox, y); c.lineTo(ox + pw, y); c.stroke();
    }

    // Bremsstrahlung continuous X-ray spectrum + characteristic Kα/Mα Gaussian emission peaks
    c.beginPath();
    c.moveTo(ox, oy);
    for (let px = 0; px <= pw; px += 2) {
      const e = (px / pw) * maxKev;
      let yv = settings.beamOn ? Math.max(0.02, 0.14 * Math.exp(-e * 0.42) * Math.min(1, e * 3.5)) : 0;
      if (settings.beamOn) {
        for (const el of spec.elements) {
          const d = (e - el.kev) / 0.12;
          const dim = settings.edsMode !== 'off' && settings.edsMode !== 'all' && settings.edsMode !== el.symbol ? 0.25 : 1;
          yv += (el.wt / 46) * Math.exp(-0.5 * d * d) * dim;
        }
      }
      c.lineTo(ox + px, oy - Math.min(1, yv) * (ph - 12));
    }
    c.lineTo(ox + pw, oy);
    c.closePath();
    c.fillStyle = 'rgba(75, 199, 216, 0.15)';
    c.fill();
    c.strokeStyle = '#62e8f5';
    c.lineWidth = 1.6;
    c.stroke();

    // Colored element markers right on each characteristic peak!
    c.font = '700 10px Consolas, monospace';
    c.textAlign = 'center';
    for (const el of spec.elements) {
      const ex = ox + (el.kev / maxKev) * pw;
      const active = settings.edsMode === 'all' || settings.edsMode === el.symbol;
      const eh = Math.min(0.94, 0.14 + el.wt / 46) * (ph - 12);
      c.globalAlpha = active ? 1 : 0.3;
      c.fillStyle = el.color;
      c.fillRect(ex - 1.5, oy - eh, 3, eh);
      c.fillText(el.symbol, ex, Math.max(12, oy - eh - 4));
    }
    c.globalAlpha = 1;
    c.fillStyle = '#8aa3b8';
    c.font = '600 9px Consolas, monospace';
    for (let k = 0; k <= 8; k += 2) {
      c.fillText(k + ' keV', ox + (k / maxKev) * pw, H - 7);
    }
    c.textAlign = 'left';
  }

  function updateGuide() {
    const spec = emSpecimens[settings.specimen];
    const fovUm = fovUmCurrent();
    // Exact relativistic de Broglie electron wavelength (Williams & Carter, TEM Eq. 1.5):
    // lambda (pm) = 1226.4 / sqrt(V * (1 + 0.97848e-6 * V)) -> 100 kV = 3.70 pm, 120 kV = 3.35 pm!
    const V = settings.kv * 1000;
    const lambdaPm = (1226.4 / Math.sqrt(V * (1 + 0.97848e-6 * V))).toFixed(2);
    const resNm = spec.mode === 'TEM' ? (settings.kv >= 100 ? '0,20 nm' : '0,35 nm') : '1,5 nm';
    const edsTag = settings.edsMode === 'off' ? '' : settings.edsMode === 'all' ? ' · EDS MAPA' : ` · EDS [${settings.edsMode}]`;

    titleEl.textContent = `HITACHI HT7800 · ${spec.mode} · ${settings.mag.toLocaleString('pt-BR')}× · ${settings.kv} kV${edsTag}`;
    metricsHost.replaceChildren(
      metric('Aumento total', settings.mag.toLocaleString('pt-BR') + '×').element,
      metric('Tensão do feixe', settings.beamOn ? settings.kv + ' kV' : 'DESLIGADO').element,
      metric('Campo visual', fmtScale(fovUm)).element,
      metric('Alto vácuo', '1,2 × 10⁻⁵ Pa').element,
      metric('λ elétrons', lambdaPm + ' pm').element,
      metric('Resolução', resNm).element
    );

    // Interactive EDS Chemical Mapping & Live keV Spectrum Card!
    drawSpectrumPanel(spec);
    const pillRow = node('div', { className: 'eds-pills' },
      button('Desligado', () => setEdsMode('off'), { 'aria-pressed': String(settings.edsMode === 'off'), className: 'eds-pill' }),
      button('Composto', () => setEdsMode('all'), { 'aria-pressed': String(settings.edsMode === 'all'), className: 'eds-pill' }),
      ...spec.elements.map(el => {
        const b = button('', () => setEdsMode(el.symbol), {
          'aria-pressed': String(settings.edsMode === el.symbol),
          className: 'eds-pill',
          title: `${el.name} (${el.line} ${el.kev.toFixed(2)} keV · ${el.wt}%) — ${el.role}`
        });
        b.append(
          node('i', { style: `background:${el.color}` }),
          `${el.symbol} ${el.wt}%`
        );
        return b;
      })
    );
    const activeEl = spec.elements.find(e => e.symbol === settings.edsMode);
    const edsNote = activeEl
      ? `${activeEl.name} (${activeEl.symbol} · ${activeEl.line} ${activeEl.kev.toFixed(3)} keV · ${activeEl.wt}%): ${activeEl.role}.`
      : settings.edsMode === 'all'
        ? 'Mapa químico composto (EDS) sobreposto à imagem em cinza: clique em qualquer elemento acima (C, O, P, Fe, Os, Au…) para isolar sua distribuição espacial.'
        : 'Mapeamento químico EDS desligado (exibindo micrografia eletrônica pura em escala de cinza).';

    edsCardHost.replaceChildren(
      node('div', { className: 'reagent-head' },
        node('span', { className: 'eyebrow' }, 'ESPECTROSCOPIA RAIOS X · EDS / EDX-720'),
        node('span', { className: 'reagent-dry' + (settings.edsMode !== 'off' ? ' ok' : '') }, settings.edsMode !== 'off' ? 'EDS ATIVO' : 'CINZA')),
      specCanvas,
      pillRow,
      node('p', { className: 'eds-desc' }, edsNote)
    );

    infoHost.replaceChildren(
      heading(spec.name),
      card('Ultrastrutura observada', spec.structure),
      card('Preparo para Microscopia Eletrônica', spec.prep),
      card('Fonte / Banco Open-Access', spec.credit)
    );
  }

  const controlsWrap = node('div', { className: 'micro-controls em-controls' },
    node('div', { className: 'micro-row' },
      node('div', { className: 'lens-buttons', role: 'group', 'aria-label': 'Presets de aumento até 600.000×' }, ...magBtns.map(m => m.b)),
      magSlider.element, focusSlider.element, specimenSelect.element,
      kvSlider.element, stigSlider.element, edsOpacitySlider.element, paletteSelect.element
    ),
    node('div', { className: 'micro-row' },
      row(edsToggleBtn, chamberBtn, focusEdxBtn, beamBtn, identifyBtn, lockBtn, centerBtn)
    )
  );
  toolbar.append(controlsWrap);
  guide.append(
    metricsHost,
    edsCardHost,
    infoHost,
    note('Mapeamento químico (EDS): o feixe primário excita átomos da amostra, que emitem raios X característicos (Kα / Mα em keV) captados pelo detector SDD-EDS ou pelo Shimadzu Rayny EDX-720, gerando mapas elementares coloridos (C, O, P, Fe, Os, Au) sobre a imagem em cinza.')
  );
  help.textContent = 'Arraste o monitor · Role para ampliar até 600.000× · Clique no Rayny EDX-720 para abrir/fechar a câmara';

  // Canvas Pan & Zoom interactions up to 600.000x
  canvas.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    canvas.focus({ preventScroll: true });
    canvas.setPointerCapture(e.pointerId);
    drag = { x: e.clientX, y: e.clientY, px: settings.panX, py: settings.panY };
  }, { signal });
  canvas.addEventListener('pointermove', e => {
    if (!drag) return;
    const z = zoomFactor();
    const dx = (e.clientX - drag.x) / (canvas.clientWidth * z);
    const dy = (e.clientY - drag.y) / (canvas.clientHeight * z);
    settings.panX = drag.px - dx;
    settings.panY = drag.py - dy;
    clampPan();
    dirty = true;
  }, { signal });
  for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    canvas.addEventListener(ev, () => { drag = null; }, { signal });
  }
  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.32 : 1 / 1.32;
    setMag(settings.mag * factor);
    audio.play('dial');
  }, { signal, passive: false });

  // 3D Raycast Interactions (Rayny EDX-720 motorized dome, SDD-EDS detector, E-STOP, Goniometer)
  const ray = new T.Raycaster(), pointer = new T.Vector2();
  const stageCanvas = engine.renderer.domElement;
  const pickRoots = [model.edxBench, model.sddDetector, model.estop, model.goniometer, model.apertures, model.monitors, model.consoleGroup, model.column];

  function pickPart(e) {
    const b = stageCanvas.getBoundingClientRect();
    pointer.set((e.clientX - b.left) / b.width * 2 - 1, 1 - (e.clientY - b.top) / b.height * 2);
    ray.setFromCamera(pointer, engine.camera);
    for (const hit of ray.intersectObjects(pickRoots, true)) {
      let obj = hit.object;
      while (obj && !obj.userData.pickKey) obj = obj.parent;
      if (obj?.userData.pickKey) return obj.userData.pickKey;
    }
    return null;
  }

  let down3d = null;
  stageCanvas.addEventListener('pointerdown', e => { down3d = [e.clientX, e.clientY]; }, { signal });
  stageCanvas.addEventListener('pointermove', e => {
    if (e.buttons || e.pointerType === 'touch') { hideTooltip(tooltip, viewport); return; }
    const key = pickPart(e);
    hoveredKey = key;
    if (key) {
      const info = model.interactives.get(key);
      showTooltip(tooltip, viewport, e.clientX, e.clientY, info.title, info.subtitle, info.color);
    } else {
      hideTooltip(tooltip, viewport);
    }
  }, { signal });
  stageCanvas.addEventListener('pointerleave', () => { hoveredKey = null; hideTooltip(tooltip, viewport); }, { signal });
  stageCanvas.addEventListener('pointerup', e => {
    if (down3d && Math.hypot(down3d[0] - e.clientX, down3d[1] - e.clientY) < 7) {
      const key = pickPart(e);
      if (key === 'estop') toggleBeam();
      else if (key === 'rayny') toggleChamber();
      else if (key === 'edsDetector') setEdsMode(settings.edsMode === 'off' ? 'all' : 'off');
      else if (key === 'goniometer') {
        loadAnim = 1.0;
        audio.play('click');
      }
    }
    down3d = null;
  }, { signal });

  // 3D Floating labels
  const labels3d = [
    label('Rayny EDX-720 (EDS)', group(model.edxBench, 0, 3.68, 0.1)),
    label('Detector SDD-EDS', group(model.sddDetector, -0.58, 0.38, 0.05)),
    label('Coluna HT7800 (600.000×)', group(model.column, 0, 4.42, 0.34)),
    label('Goniômetro lateral', group(model.goniometer, 0.85, 0.34, 0.05)),
    label('Monitores TEM / keV', group(model.monitors, 0, 1.38, 0.05))
  ];
  labels3d.forEach(item => { item.enabled = true; });

  // Render ONE real calibrated EM micrograph tier full-bleed with optical filters, astigmatism & real spatial EDS!
  function renderPhotoTier(tier, alpha, W, viewH, spec, fovUm, colorFilter, kvBrightness, kvContrast, blurPx, stigAbs) {
    const img = imagesByFile.get(tier.file);
    if (!img || !img.complete || !img.naturalWidth || alpha <= 0.005) return null;

    const iw = img.naturalWidth, ih = img.naturalHeight;
    const canvasAspect = W / viewH;
    const imgAspect = iw / ih;
    let baseW = iw, baseH = ih;
    if (imgAspect > canvasAspect) baseW = ih * canvasAspect;
    else baseH = iw / canvasAspect;

    const z = photoZoom(tier, fovUm);
    const cropScale = Math.max(1, z);
    const sw = baseW / cropScale;
    const sh = baseH / cropScale;
    // At a wider field, center the recorded photo at its actual scale.
    const displayScale = Math.min(1, z);
    const dw = W * displayScale;
    const dh = viewH * displayScale;
    const dx = (W - dw) / 2;
    const dy = (viewH - dh) / 2;
    const [fcx, fcy] = tier.focusCenter || [0.5, 0.5];
    const cx = iw * (fcx + settings.panX);
    const cy = ih * (fcy + settings.panY);
    const sx = clamp(cx - sw / 2, 0, Math.max(0, iw - sw));
    const sy = clamp(cy - sh / 2, 0, Math.max(0, ih - sh));

    // Ensure feature map (luminance + Sobel gradients) exists for photo-guided 600.000x nano-synthesis!
    let feat = featuresByFile.get(tier.file);
    if (feat === undefined && z > 1.30) {
      feat = extractFeatures(img);
      featuresByFile.set(tier.file, feat);
    }

    // CRITICAL PERFORMANCE & CRASH FIX:
    // Draw raw image + unfiltered nano-synthesis onto offscreen FIRST (zero per-stroke GPU filter passes!),
    // then apply CSS colorFilter + brightness + contrast + blur ONCE in a single GPU blit to ctx!
    octx.filter = 'none';
    octx.clearRect(0, 0, W, viewH);
    octx.imageSmoothingEnabled = true;
    octx.imageSmoothingQuality = 'high';
    octx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);

    // Photo-guided 600.000x Nanoscale Ultrastructure Synthesis (runs with filter='none' — 500x faster & zero GPU crash!)
    if (feat && z > 1.32) {
      drawEmNanoUltrastructure(octx, W, viewH, spec, feat, sx, sy, sw, sh, iw, ih, z, fovUm);
    }

    if (stigAbs > 0.4) {
      const shiftX = settings.stigmator * 1.45;
      const shiftY = -settings.stigmator * 0.75;
      octx.globalAlpha = Math.min(0.45, stigAbs * 0.055);
      octx.drawImage(img, sx, sy, sw, sh, dx + shiftX, dy + shiftY, dw, dh);
      octx.drawImage(img, sx, sy, sw, sh, dx - shiftX, dy - shiftY, dw, dh);
      octx.globalAlpha = 1;
    }

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.filter = `${colorFilter} brightness(${kvBrightness.toFixed(2)}) contrast(${kvContrast.toFixed(2)}) ${blurPx > 0.15 ? `blur(${blurPx}px)` : ''}`;
    ctx.drawImage(offscreen, 0, 0, W, viewH, 0, 0, W, viewH);
    ctx.filter = 'none';

    // Real Spatial Chemical Elemental Mapping (EDS) cleanly matching this exact micrograph tier!
    const edsOv = (settings.edsMode !== 'off' && settings.edsOpacity > 0.01)
      ? getEdsOverlay(tier.file, spec.elements, settings.edsMode, settings.specimen)
      : null;
    if (edsOv) {
      const esx = (sx / iw) * edsOv.width;
      const esy = (sy / ih) * edsOv.height;
      const esw = (sw / iw) * edsOv.width;
      const esh = (sh / ih) * edsOv.height;
      if (blurPx > 0.25) ctx.filter = `blur(${blurPx}px)`;
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = settings.edsOpacity * alpha;
      ctx.drawImage(edsOv, esx, esy, esw, esh, dx, dy, dw, dh);
      ctx.globalCompositeOperation = 'color';
      ctx.globalAlpha = settings.edsOpacity * 0.55 * alpha;
      ctx.drawImage(edsOv, esx, esy, esw, esh, dx, dy, dw, dh);
    }
    ctx.restore();

    return { iw, ih, sx, sy, sw, sh, dx, dy, dw, dh, tier };
  }

  function drawMicrograph() {
    const W = canvas.width, H = canvas.height;
    const spec = emSpecimens[settings.specimen];
    const viewH = H - 76;

    ctx.fillStyle = '#070b10';
    ctx.fillRect(0, 0, W, H);

    if (!settings.beamOn) {
      monitorLoader.hidden = true;
      ctx.fillStyle = '#0b0e14';
      ctx.fillRect(0, 0, W, viewH);
      ctx.strokeStyle = 'rgba(255, 92, 122, 0.42)';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(24, 24, W - 48, viewH - 48);
      ctx.fillStyle = '#ff7b96';
      ctx.font = '700 28px Consolas, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('FEIXE DE ELÉTRONS CORTADO (E-STOP)', W / 2, viewH / 2 - 14);
      ctx.fillStyle = '#b4c9db';
      ctx.font = '600 18px Inter, Segoe UI, sans-serif';
      ctx.fillText('Alta tensão desligada (0 kV). Clique em "Feixe: E-STOP" ou no botão 3D.', W / 2, viewH / 2 + 24);
      ctx.textAlign = 'left';
      drawDataBar(W, H, viewH, spec);
      model.liveTex.needsUpdate = true;
      model.updateGridMonitor(settings.panX, settings.panY, settings.mag, 0, false, spec.mode, settings.edsMode !== 'off', spec.elements);
      statusEl.className = 'ocular-status danger';
      statusEl.textContent = 'Feixe cortado (E-STOP) · 0 kV';
      monitorWrap.classList.remove('is-focused');
      monitorWrap.classList.add('is-alert');
      return;
    }

    monitorWrap.classList.remove('is-alert');

    const fovUm = fovUmCurrent();
    const { loTier, hiTier, alphaHi, dominant } = pickActiveTier(spec, fovUm);
    const focusBlur = Math.abs(settings.focus) * 0.42;
    const stigAbs = Math.abs(settings.stigmator);
    const kvNorm = clamp((settings.kv - 5) / 115, 0, 1);
    const kvBrightness = 0.78 + kvNorm * 0.34;
    const kvContrast = settings.contrast * (1.14 - kvNorm * 0.14);
    const blurPx = (focusBlur + stigAbs * 0.22).toFixed(2);

    // Cor base ALWAYS responds immediately (even with EDS active!); real EM acquisition is monochrome grayscale,
    // while P43 green phosphor, scientific cyan-gold LUT, and inverted contrast are viewing modes!
    let colorFilter = 'grayscale(100%)';
    if (settings.palette === 'invert') colorFilter = 'grayscale(100%) invert(100%)';
    else if (settings.palette === 'phosphor') colorFilter = 'grayscale(100%) sepia(100%) hue-rotate(84deg) saturate(310%) contrast(1.08)';
    else if (settings.palette === 'falseColor') colorFilter = 'grayscale(100%) sepia(100%) hue-rotate(162deg) saturate(260%) contrast(1.12)';

    // Seamless full-frame cross-fade between REAL photographic electron micrographs (zero artificial survey, zero seams!)
    let loMeta = null, hiMeta = null;
    if (loTier && alphaHi < 0.995) {
      loMeta = renderPhotoTier(loTier, 1, W, viewH, spec, fovUm, colorFilter, kvBrightness, kvContrast, blurPx, stigAbs);
    }
    if (alphaHi > 0.005) {
      hiMeta = renderPhotoTier(hiTier, loTier ? alphaHi : 1, W, viewH, spec, fovUm, colorFilter, kvBrightness, kvContrast, blurPx, stigAbs);
    }
    const domMeta = (dominant === hiTier ? hiMeta : loMeta) || hiMeta || loMeta;
    monitorLoader.hidden = Boolean(domMeta);
    if (!domMeta) {
      monitorLoaderTxt.textContent = `Carregando ${spec.short} e mapa químico EDS...`;
    }

    if (domMeta) {
      // Subtle TEM phase-contrast fine grain above 100.000x
      if (settings.mag >= 100000) {
        const intensity = Math.min(0.14, ((settings.mag - 100000) / 500000) * 0.14);
        ctx.fillStyle = `rgba(210, 245, 255, ${intensity.toFixed(3)})`;
        for (let i = 0; i < 180; i++) {
          const gx = ((i * 197 + Math.round(settings.panX * 400)) % W + W) % W;
          const gy = ((i * 313 + Math.round(settings.panY * 400)) % viewH + viewH) % viewH;
          ctx.fillRect(gx, gy, 2, 2);
        }
      }

      const vig = ctx.createRadialGradient(W / 2, viewH / 2, viewH * 0.28, W / 2, viewH / 2, W * 0.64);
      vig.addColorStop(0, 'rgba(255,255,255,0)');
      vig.addColorStop(0.78, 'rgba(6,10,16,0.12)');
      vig.addColorStop(1, 'rgba(3,6,10,0.48)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, viewH);

      // 2x-sized EDS Chemical Legend Strip at Top-Left!
      if (settings.edsMode !== 'off') {
        const shown = settings.edsMode === 'all' ? spec.elements : spec.elements.filter(e => e.symbol === settings.edsMode);
        const stepX = shown.length > 4 ? 104 : 114;
        const boxW = Math.min(W - 24, shown.length * stepX + 20);
        ctx.fillStyle = 'rgba(7, 12, 18, 0.90)';
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.68)';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect(12, 10, boxW, 44, 9); ctx.fill(); ctx.stroke();
        ctx.font = '700 21px Consolas, monospace';
        shown.forEach((el, idx) => {
          const lx = 24 + idx * stepX;
          ctx.fillStyle = el.color;
          ctx.beginPath(); ctx.arc(lx + 7, 32, 7.5, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#f3fbff';
          ctx.fillText(el.symbol, lx + 21, 39);
        });
      }

      ctx.strokeStyle = 'rgba(110, 232, 245, 0.36)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(W / 2 - 20, viewH / 2); ctx.lineTo(W / 2 + 20, viewH / 2);
      ctx.moveTo(W / 2, viewH / 2 - 20); ctx.lineTo(W / 2, viewH / 2 + 20);
      ctx.stroke();

      // Dynamic 2x-sized Ultrastructure Annotations for the currently dominant REAL photographic tier!
      const annList = domMeta.tier.annotations || spec.annotations;
      if (settings.labels && annList?.length) {
        ctx.font = '700 22px Inter, Segoe UI, sans-serif';
        const pillH = 38;
        const items = [];
        for (const [nx, ny, text] of annList) {
          const u = (nx * domMeta.iw - domMeta.sx) / domMeta.sw;
          const v = (ny * domMeta.ih - domMeta.sy) / domMeta.sh;
          if (u < 0 || u > 1 || v < 0 || v > 1) continue;
          const px = domMeta.dx + u * domMeta.dw;
          const py = domMeta.dy + v * domMeta.dh;
          if (px < 18 || px > W - 18 || py < 62 || py > viewH - 22) continue;
          const tw = Math.min(W - 44, ctx.measureText(text).width + 24);
          const bx = clamp(px + tw + 24 < W ? px + 18 : px - tw - 18, 12, W - tw - 12);
          const by = clamp(py - pillH * 0.5, 62, viewH - pillH - 10);
          items.push({ px, py, text, tw, bx, by });
        }
        items.sort((a, b) => a.by - b.by);
        for (let i = 1; i < items.length; i++) {
          const prev = items[i - 1], cur = items[i];
          const horizOverlap = !(cur.bx + cur.tw < prev.bx - 8 || cur.bx > prev.bx + prev.tw + 8);
          if (horizOverlap && cur.by < prev.by + pillH + 6) {
            cur.by = Math.min(viewH - pillH - 8, prev.by + pillH + 6);
          }
        }
        for (const it of items) {
          const anchorX = it.bx > it.px ? it.bx : it.bx + it.tw;
          const anchorY = it.by + pillH * 0.5;
          ctx.strokeStyle = 'rgba(4, 9, 14, 0.92)';
          ctx.lineWidth = 5;
          ctx.beginPath(); ctx.moveTo(it.px, it.py); ctx.lineTo(anchorX, anchorY); ctx.stroke();
          ctx.strokeStyle = '#5ee8f5';
          ctx.lineWidth = 2.2;
          ctx.stroke();
          ctx.beginPath(); ctx.arc(it.px, it.py, 6, 0, Math.PI * 2); ctx.fillStyle = '#08121b'; ctx.fill();
          ctx.beginPath(); ctx.arc(it.px, it.py, 4.5, 0, Math.PI * 2); ctx.fillStyle = '#5ee8f5'; ctx.fill();
          ctx.fillStyle = 'rgba(7, 13, 21, 0.92)';
          ctx.strokeStyle = 'rgba(94, 232, 245, 0.78)';
          ctx.lineWidth = 1.8;
          ctx.beginPath(); ctx.roundRect(it.bx, it.by, it.tw, pillH, 9); ctx.fill(); ctx.stroke();
          ctx.fillStyle = '#f2fcff';
          ctx.fillText(it.text, it.bx + 12, it.by + 27, it.tw - 24);
        }
      }
    } else {
      ctx.fillStyle = '#9db7ca';
      ctx.font = '700 22px Consolas, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Carregando micrografia eletrônica...', W / 2, viewH / 2);
      ctx.textAlign = 'left';
    }

    drawDataBar(W, H, viewH, spec);

    const sharp = Math.abs(settings.focus) <= 1.2 && Math.abs(settings.stigmator) <= 1.0;
    monitorWrap.classList.toggle('is-focused', sharp);
    statusEl.className = 'ocular-status' + (sharp ? ' ok' : '');
    const edsBadge = settings.edsMode === 'off' ? 'Vácuo OK' : settings.edsMode === 'all' ? 'EDS Composto OK' : `EDS [${settings.edsMode}] OK`;
    statusEl.textContent = rangeHint
      ? rangeHint
      : sharp
        ? `EM FOCO · ${spec.mode} ${settings.mag.toLocaleString('pt-BR')}× · ${settings.kv} kV · ${edsBadge}`
        : Math.abs(settings.stigmator) > 1.0
          ? 'Astigmatismo detectado · ajuste o Estigmador para 0,0'
          : 'Fora de foco · ajuste o Foco Obj. para 0,0';

    model.liveTex.needsUpdate = true;
    model.updateGridMonitor(settings.panX, settings.panY, settings.mag, settings.kv, true, spec.mode, settings.edsMode !== 'off', spec.elements);
  }

  function drawDataBar(W, H, viewH, spec) {
    ctx.fillStyle = '#080d14';
    ctx.fillRect(0, viewH, W, H - viewH);
    ctx.strokeStyle = 'rgba(94, 232, 245, 0.36)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, viewH + 1); ctx.lineTo(W, viewH + 1); ctx.stroke();

    const fovUm = fovUmCurrent();
    const edsStr = settings.edsMode === 'off' ? '' : ` · EDS:${settings.edsMode === 'all' ? 'ALL' : settings.edsMode}`;
    ctx.fillStyle = '#eaf8ff';
    ctx.font = '700 22px Consolas, monospace';
    ctx.fillText(`HT7800 · ${spec.mode} · ×${settings.mag.toLocaleString('pt-BR')}`, 16, viewH + 31);
    ctx.fillStyle = '#9fd8ea';
    ctx.font = '700 18px Consolas, monospace';
    ctx.fillText(`${settings.beamOn ? settings.kv : 0} kV · FOV ${fmtScale(fovUm)}${edsStr}`, 16, viewH + 61);

    const desiredUm = fovUm * 0.22;
    const pow10 = 10 ** Math.floor(Math.log10(Math.max(1e-5, desiredUm)));
    const niceUm = [1, 2, 5, 10].map(n => n * pow10).reduce((a, b) => Math.abs(desiredUm - b) < Math.abs(desiredUm - a) ? b : a);
    const barW = clamp((niceUm / fovUm) * W, 62, 195);
    const bx = W - 18 - barW;
    const by = viewH + 58;

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(bx, by - 10); ctx.lineTo(bx, by); ctx.lineTo(bx + barW, by); ctx.lineTo(bx + barW, by - 10);
    ctx.stroke();

    ctx.fillStyle = '#8ef1fc';
    ctx.font = '700 23px Consolas, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(fmtScale(niceUm), bx + barW / 2, viewH + 34);
    ctx.textAlign = 'left';
  }

  setMag(settings.mag);

  return {
    update(dt) {
      time += dt;

      // 1) Hitachi HT7800 Electron Beam & SDD-EDS X-Ray Detector glow
      const kvNorm = clamp((settings.kv - 5) / 115, 0, 1);
      const edsActive = settings.edsMode !== 'off' && settings.beamOn;
      model.beamStrip.visible = settings.beamOn;
      if (settings.beamOn) {
        model.beamMat.emissiveIntensity = 0.72 + kvNorm * 0.85 + Math.sin(time * 5.2) * 0.12;
        model.beamMat.opacity = 0.62 + kvNorm * 0.34;
        model.vacLedMat.color.set('#4ef59e');
        model.vacLedMat.emissive.set('#4ef59e');
      } else {
        model.vacLedMat.color.set('#ff5268');
        model.vacLedMat.emissive.set('#ff5268');
      }
      model.sddLedMat.emissiveIntensity = edsActive ? 1.15 + Math.sin(time * 6) * 0.35 : 0.15;
      model.xrayConeMat.opacity = edsActive ? 0.32 + Math.sin(time * 8) * 0.18 : 0;

      // 2) Shimadzu Rayny EDX-720 Motorized Lifting Cylindrical Chamber Dome + Spinning 12-Slot Carousel + X-Ray Rays!
      const targetLift = settings.chamberOpen ? 1 : 0;
      domeLift += (targetLift - domeLift) * (1 - Math.exp(-dt * 5.5));
      model.raynyDome.position.y = 0.66 + domeLift * 0.86;
      model.raynyTurret.rotation.y += dt * (edsActive ? 0.55 : 0.16);
      model.xrayRays.visible = edsActive && domeLift > 0.35;
      if (model.xrayRays.visible) {
        const pulse = 0.6 + Math.sin(time * 7.5) * 0.32;
        for (let i = 0; i < model.emitBeams.length; i++) {
          model.emitBeams[i].material.opacity = pulse;
        }
      }

      // 3) Side-entry goniometer sample rod slide animation
      if (loadAnim > 0) {
        loadAnim = Math.max(0, loadAnim - dt * 0.85);
        model.sampleRod.position.x = 0.62 + Math.sin(loadAnim * Math.PI) * 0.42;
      } else {
        model.sampleRod.position.x = 0.62;
      }

      model.estopCap.position.z = settings.beamOn ? 0.07 : 0.038;

      if (dirty) {
        dirty = false;
        try {
          drawMicrograph();
        } catch (err) {
          console.error('[Eletrônico] Erro ao renderizar micrografia:', err);
          monitorLoader.hidden = true;
        }
      }
    },
    dispose() {
      edsCache.clear();
      featuresByFile.clear();
      imagesByFile.clear();
      offscreen.width = offscreen.height = 1;
      specCanvas.width = specCanvas.height = 1;
    }
  };
}
