import { random } from './geometry.js';
import { insectTissues } from '../data/insectSpecimens.js?v=2';

// Real end-of-course honeybee microscope photograph (dissected crop, ribbed ventriculus, Malpighian tubules & tracheae!)
const beeCourseImg = new Image();
beeCourseImg.decoding = 'async';
const beeLoadListeners = new Set();
const BEE_MASK_SIZE = 256;
let beeMaskData = null;

function extractBeeMask() {
  if (beeMaskData || !beeCourseImg.complete || !beeCourseImg.naturalWidth) return;
  try {
    const c = document.createElement('canvas');
    c.width = BEE_MASK_SIZE;
    c.height = BEE_MASK_SIZE;
    const mctx = c.getContext('2d', { willReadFrequently: true });
    mctx.drawImage(beeCourseImg, 0, 0, BEE_MASK_SIZE, BEE_MASK_SIZE);
    beeMaskData = mctx.getImageData(0, 0, BEE_MASK_SIZE, BEE_MASK_SIZE).data;
  } catch (_) {
    beeMaskData = null;
  }
}

beeCourseImg.onload = () => {
  extractBeeMask();
  for (const fn of beeLoadListeners) fn();
};
beeCourseImg.src = './assets/micro/bee_course_final.jpg?v=20';

function sampleBeeMask(wx, wy, span = 4500) {
  if (!beeMaskData) return { r: 0, g: 0, b: 0, lum: 0, yellow: 0 };
  const u = (wx / span + 0.5) * (BEE_MASK_SIZE - 1);
  const v = (wy / span + 0.5) * (BEE_MASK_SIZE - 1);
  if (u < 0 || v < 0 || u >= BEE_MASK_SIZE - 1 || v >= BEE_MASK_SIZE - 1) {
    return { r: 0, g: 0, b: 0, lum: 0, yellow: 0 };
  }
  const x0 = u | 0, y0 = v | 0;
  const fx = u - x0, fy = v - y0;
  const i00 = (y0 * BEE_MASK_SIZE + x0) * 4;
  const i10 = i00 + 4;
  const i01 = i00 + BEE_MASK_SIZE * 4;
  const i11 = i01 + 4;
  const w00 = (1 - fx) * (1 - fy), w10 = fx * (1 - fy), w01 = (1 - fx) * fy, w11 = fx * fy;
  const d = beeMaskData;
  const r = d[i00] * w00 + d[i10] * w10 + d[i01] * w01 + d[i11] * w11;
  const g = d[i00 + 1] * w00 + d[i10 + 1] * w10 + d[i01 + 1] * w01 + d[i11 + 1] * w11;
  const b = d[i00 + 2] * w00 + d[i10 + 2] * w10 + d[i01 + 2] * w01 + d[i11 + 2] * w11;
  const lum = 0.30 * r + 0.62 * g + 0.08 * b;
  // Autofluorescence yellow-green discriminator: cleanly locks onto genuine bee tissue & ignores bluish glare spots!
  const yellow = Math.max(0, (r * 0.48 + g * 0.52) - b * 0.85);
  return { r, g, b, lum, yellow };
}

function sampleBeeGrad(wx, wy, step = 18, span = 4500) {
  const sx1 = sampleBeeMask(wx + step, wy, span).yellow;
  const sx0 = sampleBeeMask(wx - step, wy, span).yellow;
  const sy1 = sampleBeeMask(wx, wy + step, span).yellow;
  const sy0 = sampleBeeMask(wx, wy - step, span).yellow;
  const gx = (sx1 - sx0) * 0.5;
  const gy = (sy1 - sy0) * 0.5;
  return { gx, gy, ang: Math.atan2(gy, gx), mag: Math.hypot(gx, gy) };
}

function darkfieldRgba(r, g, b, mul, alpha, lift = 0) {
  const cr = Math.max(0, Math.min(255, (r * mul + lift) | 0));
  const cg = Math.max(0, Math.min(255, (g * mul + lift * 1.05) | 0));
  const cb = Math.max(0, Math.min(255, (b * mul * 0.72 + lift * 0.35) | 0));
  return `rgba(${cr},${cg},${cb},${Math.max(0, Math.min(1, alpha)).toFixed(3)})`;
}

// Classifies which dissected honeybee organ lies at world coordinate (wx, wy) in the real mini-course photo
function beeOrganAt(wx, wy, span = 4500) {
  const nx = wx / span + 0.5;
  const ny = wy / span + 0.5;
  if (nx > 0.53 && ny < 0.43) return 'crop';        // Papo / Inglúvio
  if (nx >= 0.18 && nx <= 0.56 && ny >= 0.21 && ny <= 0.55) return 'ventriculus'; // Ventrículo anelado
  if (nx < 0.63 && ny >= 0.55) return 'malpighi';   // Piloro & Túbulos de Malpighi
  return 'trachea';                                 // Traqueias & fibras periféricas
}

// Deterministic shared lattice vertex jitter so adjacent polygonal epithelial cells interlock seamlessly with ZERO gaps!
function hexVertex(vx, vy, scale) {
  const r = random(hash(vx * 31 + 17, vy * 47 + 29, 613));
  return [(r() - 0.5) * scale * 0.44, (r() - 0.5) * scale * 0.44];
}

// Photo-guided confocal/darkfield cellular & ultrastructural synthesis for high zoom (40x -> 1000x)
// Strictly masked to genuine photographed honeybee tissue contours with organ-specific histology!
function drawBeeCourseDetails(ctx, b, layer, fov, zoom, detailAlpha, anchor) {
  const span = 4500;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // === LAYER 0: Deep Striated Circular Visceral Muscle Ribbons (2.8 um sarcomeres) & Spiral Tracheal Taenidia ===
  if (layer === 0) {
    const step = fov > 280 ? 20 : fov > 110 ? 14 : 10;
    eachTile(b, step, step, step * 2.2, (i, j, x, y) => {
      const r = random(hash(i, j, 409));
      const px = x + (r() - 0.5) * step * 0.42;
      const py = y + (r() - 0.5) * step * 0.42;
      const s = sampleBeeMask(px, py, span);
      if (s.yellow < 16) return;
      const tissueW = Math.min(1, (s.yellow - 16) / 68);
      const a = detailAlpha * tissueW;
      const organ = beeOrganAt(px, py, span);
      const grad = sampleBeeGrad(px, py, 22, span);
      // Tangent curves smoothly along the real photographed organ walls & annular ribs
      const tan = grad.mag > 2.2 ? grad.ang + Math.PI * 0.5 : (0.35 + Math.sin(px * 0.0045 + py * 0.0035) * 0.55);
      const nx = Math.cos(tan), ny = Math.sin(tan);
      const pxn = -ny, pyn = nx;

      // 1) Helical chitinous taenidia along narrower tracheal branches
      if ((organ === 'trachea' || (s.yellow < 66 && grad.mag > 4.2)) && fov <= 800) {
        const halfW = 3.2 + r() * 2.4;
        const pitch = 2.2;
        const count = fov <= 140 ? 6 : 4;
        // Soft translucent chitinous lumen wall
        line(ctx, px - nx * count * pitch, py - ny * count * pitch, px + nx * count * pitch, py + ny * count * pitch,
          darkfieldRgba(s.r, s.g, s.b, 0.45, 0.34 * a), halfW * 2.1);
        for (let k = -count; k <= count; k++) {
          const ox = px + nx * k * pitch;
          const oy = py + ny * k * pitch;
          ctx.beginPath();
          ctx.moveTo(ox - pxn * halfW, oy - pyn * halfW);
          ctx.quadraticCurveTo(ox + nx * 0.65, oy + ny * 0.65, ox + pxn * halfW, oy + pyn * halfW);
          ctx.strokeStyle = darkfieldRgba(s.r, s.g, s.b, 1.32, 0.56 * a, 30);
          ctx.lineWidth = fov <= 130 ? 0.42 : 0.68;
          ctx.stroke();
        }
        anchor('Traqueia (tênidia espiral)', px, py, 0);
        return;
      }

      // 2) Continuous curving visceral muscle myofibril ribbons (dominant in Ventriculus, reticular in Crop)
      const ribbonLen = step * (1.35 + r() * 0.55);
      const halfW = organ === 'crop' ? step * 0.16 : step * (0.28 + r() * 0.12);
      const bend = (r() - 0.5) * step * 0.24;
      const x0 = px - nx * ribbonLen * 0.5, y0 = py - ny * ribbonLen * 0.5;
      const x1 = px + nx * ribbonLen * 0.5, y1 = py + ny * ribbonLen * 0.5;
      const cx = px + pxn * bend, cy = py + pyn * bend;

      // Soft shadowed endomysium cleft + luminous sarcoplasmic myofibril body
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.quadraticCurveTo(cx, cy, x1, y1);
      ctx.strokeStyle = darkfieldRgba(s.r, s.g, s.b, 0.28, 0.36 * a);
      ctx.lineWidth = halfW * 1.9;
      ctx.stroke();

      ctx.strokeStyle = darkfieldRgba(s.r, s.g, s.b, 1.15, 0.30 * a, 16);
      ctx.lineWidth = halfW * 1.25;
      ctx.stroke();

      // Delicate longitudinal myofibril filaments at 100x & 1000x
      if (fov <= 260) {
        for (const off of [-halfW * 0.45, 0, halfW * 0.45]) {
          ctx.beginPath();
          ctx.moveTo(x0 + pxn * off, y0 + pyn * off);
          ctx.quadraticCurveTo(cx + pxn * off, cy + pyn * off, x1 + pxn * off, y1 + pyn * off);
          ctx.strokeStyle = darkfieldRgba(s.r, s.g, s.b, 1.30, 0.24 * a, 24);
          ctx.lineWidth = fov <= 120 ? 0.28 : 0.42;
          ctx.stroke();
        }
      }

      // Authentic Apis mellifera sarcomere A/I cross-striations (2.8 um Z-to-Z -> 1.4 um half-period) + Z-discs!
      if (fov <= 540 && s.yellow > 28 && organ !== 'malpighi') {
        const sarcoVis = Math.min(1, (540 - fov) / 260) * a * (organ === 'crop' ? 0.55 : 0.95);
        const halfBands = fov <= 140 ? 7 : 5;
        for (let k = -halfBands; k <= halfBands; k++) {
          const t = 0.5 + (k * 1.4) / ribbonLen;
          if (t < 0.05 || t > 0.95) continue;
          const it = 1 - t;
          const bx = it * it * x0 + 2 * it * t * cx + t * t * x1;
          const by = it * it * y0 + 2 * it * t * cy + t * t * y1;
          const isDarkA = (k & 1) === 0;
          line(ctx, bx - pxn * halfW * 0.88, by - pyn * halfW * 0.88,
            bx + pxn * halfW * 0.88, by + pyn * halfW * 0.88,
            isDarkA ? darkfieldRgba(s.r, s.g, s.b, 0.24, 0.46 * sarcoVis) : darkfieldRgba(s.r, s.g, s.b, 1.36, 0.38 * sarcoVis, 30),
            isDarkA ? 0.72 : 0.46);
          // Razor-fine Z-disc centered in light I-band resolved at 100x & 1000x!
          if (!isDarkA && fov <= 240) {
            line(ctx, bx - pxn * halfW * 0.85, by - pyn * halfW * 0.85,
              bx + pxn * halfW * 0.85, by + pyn * halfW * 0.85,
              darkfieldRgba(s.r, s.g, s.b, 0.14, 0.56 * sarcoVis), 0.18);
          }
        }
        if (((i + j) & 3) === 0) anchor('Anel muscular (sarcômero 2,8 μm)', px, py, 0);
      }
    });
    return;
  }

  // === LAYER 1: Seamless Interlocking Polygonal Epithelial Mosaic + Soft Confocal Nuclei + Brush Border ===
  if (layer === 1) {
    const cellR = fov > 280 ? 11.5 : 9.4; // realistic ~16-22 um insect digestive enterocytes!
    const dx = cellR * 1.5;
    const dy = cellR * Math.sqrt(3);
    const iMin = Math.floor((b.left - cellR * 2) / dx);
    const iMax = Math.ceil((b.right + cellR * 2) / dx);
    const jMin = Math.floor((b.top - cellR * 2) / dy);
    const jMax = Math.ceil((b.bottom + cellR * 2) / dy);

    for (let i = iMin; i <= iMax; i++) {
      for (let j = jMin; j <= jMax; j++) {
        const cx = i * dx;
        const cy = j * dy + (i & 1 ? dy * 0.5 : 0);
        const s = sampleBeeMask(cx, cy, span);
        if (s.yellow < 26) continue;
        const organ = beeOrganAt(cx, cy, span);
        const tissueW = Math.min(1, (s.yellow - 26) / 76);
        const a = detailAlpha * tissueW;
        const r = random(hash(i, j, 731));
        const grad = sampleBeeGrad(cx, cy, 18, span);

        // Build shared-vertex irregular hexagon (ZERO gaps between neighboring cells!)
        const verts = [];
        for (let k = 0; k < 6; k++) {
          const ang = (k * Math.PI) / 3;
          const vx = cx + Math.cos(ang) * cellR;
          const vy = cy + Math.sin(ang) * cellR;
          const keyX = Math.round(vx * 2);
          const keyY = Math.round(vy * 2);
          const [jx, jy] = hexVertex(keyX, keyY, cellR);
          verts.push([vx + jx, vy + jy]);
        }

        // Smooth softly-rounded polygonal cell contour
        ctx.beginPath();
        for (let k = 0; k < 6; k++) {
          const p0 = verts[k];
          const p1 = verts[(k + 1) % 6];
          const mx = (p0[0] + p1[0]) * 0.5;
          const my = (p0[1] + p1[1]) * 0.5;
          if (k === 0) ctx.moveTo(mx, my);
          else ctx.quadraticCurveTo(p0[0], p0[1], mx, my);
        }
        ctx.quadraticCurveTo(verts[0][0], verts[0][1], (verts[0][0] + verts[1][0]) * 0.5, (verts[0][1] + verts[1][1]) * 0.5);
        ctx.closePath();

        // Soft confocal radial cytoplasmic autofluorescence gradient (organic 3D dome, NOT flat cartoon fill!)
        const cGrad = ctx.createRadialGradient(
          cx - cellR * 0.16, cy - cellR * 0.16, cellR * 0.08,
          cx, cy, cellR * 1.08
        );
        const cellShade = 0.92 + r() * 0.22;
        cGrad.addColorStop(0, darkfieldRgba(s.r, s.g, s.b, 1.18 * cellShade, 0.28 * a, 16));
        cGrad.addColorStop(0.68, darkfieldRgba(s.r, s.g, s.b, 0.96 * cellShade, 0.22 * a, 4));
        cGrad.addColorStop(1, darkfieldRgba(s.r, s.g, s.b, 0.34, 0.42 * a));
        ctx.fillStyle = cGrad;
        ctx.fill();

        // Razor-thin translucent intercellular septate junction wall (never thick black circles!)
        ctx.strokeStyle = darkfieldRgba(s.r, s.g, s.b, 0.26, 0.44 * a);
        ctx.lineWidth = fov <= 130 ? 0.34 : 0.52;
        ctx.stroke();

        // Subtle luminous inner plasma membrane rim highlight
        if (fov <= 320) {
          ctx.strokeStyle = darkfieldRgba(s.r, s.g, s.b, 1.32, 0.18 * a, 28);
          ctx.lineWidth = fov <= 130 ? 0.18 : 0.28;
          ctx.stroke();
        }

        // Translucent confocal ovoid nucleus with heterochromatin clouds & nucleolus (no harsh outline!)
        if (s.yellow > 42 && r() > 0.14) {
          const nrx = cellR * (organ === 'malpighi' ? 0.44 : 0.34 + r() * 0.09);
          const nry = cellR * (organ === 'malpighi' ? 0.40 : 0.27 + r() * 0.08);
          const nx = cx + (r() - 0.5) * cellR * 0.34;
          const ny = cy + (r() - 0.5) * cellR * 0.34;
          const nAng = (grad.mag > 2.2 ? grad.ang + Math.PI * 0.5 : r() * tau) + (r() - 0.5) * 0.4;

          ctx.save();
          ctx.translate(nx, ny);
          ctx.rotate(nAng);
          const nGrad = ctx.createRadialGradient(-nrx * 0.15, -nry * 0.15, nrx * 0.06, 0, 0, Math.max(nrx, nry));
          nGrad.addColorStop(0, darkfieldRgba(s.r, s.g, s.b, 0.44, 0.56 * a));
          nGrad.addColorStop(0.74, darkfieldRgba(s.r, s.g, s.b, 0.66, 0.48 * a));
          nGrad.addColorStop(0.92, darkfieldRgba(s.r, s.g, s.b, 1.44, 0.56 * a, 46));
          nGrad.addColorStop(1, darkfieldRgba(s.r, s.g, s.b, 1.20, 0.0));
          ctx.beginPath();
          ctx.ellipse(0, 0, nrx, nry, 0, 0, tau);
          ctx.fillStyle = nGrad;
          ctx.fill();

          if (fov <= 320) {
            // Soft mottled heterochromatin clumps
            const clumps = fov <= 130 ? 7 : 4;
            for (let c = 0; c < clumps; c++) {
              const lx = (r() - 0.5) * nrx * 1.15;
              const ly = (r() - 0.5) * nry * 1.15;
              ellipse(ctx, lx, ly, Math.max(0.22, nrx * (0.15 + r() * 0.12)), Math.max(0.18, nry * (0.14 + r() * 0.10)),
                r() * tau, darkfieldRgba(s.r, s.g, s.b, 1.46, 0.44 * a, 50));
            }
            // Prominent dense nucleolus with bright perinucleolar rim
            ellipse(ctx, (r() - 0.5) * nrx * 0.35, (r() - 0.5) * nry * 0.35, nrx * 0.24, nry * 0.24, 0,
              darkfieldRgba(s.r, s.g, s.b, 0.20, 0.62 * a),
              darkfieldRgba(s.r, s.g, s.b, 1.48, 0.42 * a, 48), 0.18);
          }
          ctx.restore();

          if (((i * 7 + j * 13) & 7) === 0) {
            anchor(organ === 'malpighi' ? 'Núcleo (Túb. Malpighi)' : 'Núcleo epitelial', nx, ny, 1);
            anchor(organ === 'crop' ? 'Epitélio do papo (intima)' : organ === 'malpighi' ? 'Epitélio excretor' : 'Enterócito (ventrículo)', cx, cy, 1);
          }
        }

        // Dense apical microvilli / brush border filaments radiating into dark lumen along sharp organ edges!
        if (fov <= 540 && grad.mag > 11 && s.yellow < 130 && organ !== 'crop') {
          const outX = -Math.cos(grad.ang), outY = -Math.sin(grad.ang);
          const tanX = -outY, tanY = outX;
          const count = fov <= 140 ? 9 : 5;
          for (let m = -count; m <= count; m++) {
            const bx = cx + tanX * m * 0.92;
            const by = cy + tanY * m * 0.92;
            const vLen = 2.5 + r() * 2.1;
            line(ctx, bx, by, bx + outX * vLen, by + outY * vLen,
              darkfieldRgba(s.r, s.g, s.b, 1.38, 0.52 * a, 40), fov <= 130 ? 0.20 : 0.34);
          }
          anchor('Borda em escova (microvilos)', cx + outX * 2.8, cy + outY * 2.8, 1);
        }
      }
    }
    return;
  }

  // === LAYER 2: Luminous Mineral Spherites (Malpighi), Sarcosome Rows (100x/1000x) & Secretory Vesicles ===
  if (layer === 2 && fov <= 540) {
    const step = fov <= 140 ? 6.2 : 10.5;
    eachTile(b, step, step, step, (i, j, x, y) => {
      const r = random(hash(i, j, 977));
      const px = x + (r() - 0.5) * step * 0.82;
      const py = y + (r() - 0.5) * step * 0.82;
      const s = sampleBeeMask(px, py, span);
      if (s.yellow < 36) return;
      const organ = beeOrganAt(px, py, span);
      const tissueW = Math.min(1, (s.yellow - 36) / 80);
      const a = detailAlpha * tissueW;

      if (organ === 'malpighi') {
        // Bright autofluorescent concentric mineral/uric-acid concretion spherites inside Malpighian cells!
        const rad = fov <= 140 ? (0.65 + r() * 0.95) : (0.95 + r() * 1.15);
        const g = ctx.createRadialGradient(px - rad * 0.25, py - rad * 0.25, rad * 0.05, px, py, rad);
        g.addColorStop(0, darkfieldRgba(s.r, s.g, s.b, 1.55, 0.62 * a, 68));
        g.addColorStop(0.65, darkfieldRgba(s.r, s.g, s.b, 1.22, 0.36 * a, 28));
        g.addColorStop(1, darkfieldRgba(s.r, s.g, s.b, 0.4, 0));
        ctx.beginPath();
        ctx.arc(px, py, rad, 0, tau);
        ctx.fillStyle = g;
        ctx.fill();
        if (fov <= 260 && ((i * 5 + j * 11) & 15) === 0) anchor('Esferitos (Túb. Malpighi)', px, py, 2);
      } else {
        // Fine secretory digestive vesicles & aligned sarcosome rows (mitochondria between myofibrils)
        const rad = fov <= 140 ? (0.38 + r() * 0.58) : (0.62 + r() * 0.78);
        const g = ctx.createRadialGradient(px, py, rad * 0.08, px, py, rad);
        g.addColorStop(0, darkfieldRgba(s.r, s.g, s.b, 1.48, 0.50 * a, 52));
        g.addColorStop(1, darkfieldRgba(s.r, s.g, s.b, 0.8, 0));
        ctx.beginPath();
        ctx.arc(px, py, rad, 0, tau);
        ctx.fillStyle = g;
        ctx.fill();
        if (fov <= 220 && ((i * 5 + j * 11) & 15) === 0) anchor('Sarcossomos / vesículas', px, py, 2);
      }
    });
  }
}

export function isBeePhotoReady() {
  if (beeCourseImg.complete && beeCourseImg.naturalWidth > 0) {
    if (!beeMaskData) extractBeeMask();
    return true;
  }
  return false;
}
export function onBeePhotoLoad(fn) {
  if (isBeePhotoReady()) fn();
  else beeLoadListeners.add(fn);
  return () => beeLoadListeners.delete(fn);
}

const palettes = {
  historesin: { bg: '#f4f1ea', matrix: '#d8e7f4', cyto: '#9ec4e6', edge: '#4f82bd', nucleus: '#264d8f',
    core: '#132859', fiber: '#79addc', blood: '#5889c4', signal: '#3862ad', accent: '#c9e0f5', bacteria1: '#355ea6', bacteria2: '#6b9ed4' },
  he: { bg: '#f8e2e8', matrix: '#eeafc2', cyto: '#e592ad', edge: '#b25e86', nucleus: '#5b2878',
    core: '#36134e', fiber: '#de95aa', blood: '#d9647c', signal: '#df9ec0', accent: '#f6cdd9', bacteria1: '#6e528d', bacteria2: '#ab708c' },
  pas: { bg: '#f7e4f0', matrix: '#e1b8cd', cyto: '#e6a5cc', edge: '#a33c80', nucleus: '#573d84',
    core: '#321e54', fiber: '#d4a1b8', blood: '#d67498', signal: '#b51271', accent: '#f0b6de', bacteria1: '#613c85', bacteria2: '#a45f96' },
  masson: { bg: '#f6eae9', matrix: '#c5cadb', cyto: '#d45e80', edge: '#9a3b5f', nucleus: '#412f4a',
    core: '#291736', fiber: '#4a72b8', blood: '#b33d50', signal: '#6258a0', accent: '#f0a2b5', bacteria1: '#61487d', bacteria2: '#ba617d' },
  gram: { bg: '#f7ede9', matrix: '#ebd7e4', cyto: '#df9ab6', edge: '#9f527d', nucleus: '#743476',
    core: '#411b4e', fiber: '#d19aad', blood: '#b84f71', signal: '#7c439a', accent: '#e0a2bc', bacteria1: '#592e8a', bacteria2: '#d95c88' },
  giemsa: { bg: '#f5f0f2', matrix: '#ecdce3', cyto: '#b8c8e2', edge: '#c66f80', nucleus: '#4b227a',
    core: '#281048', fiber: '#d2a8bc', blood: '#e6939a', signal: '#6d3da0', accent: '#fae0e4', bacteria1: '#4b227a', bacteria2: '#d97e8c' },
  botany: { bg: '#eef5ea', matrix: '#d8ecd0', cyto: '#b7dfb0', edge: '#467a4e', nucleus: '#2d683b',
    core: '#1d4a28', fiber: '#c96f88', blood: '#4da852', signal: '#328240', accent: '#e4f5dc', bacteria1: '#2d683b', bacteria2: '#82bf78' },
  fresh: { bg: '#e2e8e2', matrix: '#cfdace', cyto: '#c4d1c5', edge: '#9fb0a5', nucleus: '#93a197',
    core: '#84968c', fiber: '#b1c1b3', blood: '#a6b7a6', signal: '#b4c5ba', accent: '#d9e3d8', bacteria1: '#9ead9f', bacteria2: '#a8b6aa' },
  paraffin: { bg: '#f2e8d4', matrix: '#ded0b0', cyto: '#d0ba98', edge: '#b39876', nucleus: '#9c856b',
    core: '#8f795e', fiber: '#c1a985', blood: '#aa8e75', signal: '#b6a080', accent: '#ecd8b6', bacteria1: '#a28c78', bacteria2: '#b79e88' }
};

function hexToRgb(hex) {
  const v = parseInt(hex.slice(1), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

const parsedPalettes = Object.fromEntries(
  Object.entries(palettes).map(([k, pal]) => [k, Object.fromEntries(Object.entries(pal).map(([ck, hex]) => [ck, hexToRgb(hex)]))])
);

function tint(rgb, delta = 0, alpha = 1) {
  const r = Math.max(0, Math.min(255, (rgb[0] + delta) | 0));
  const g = Math.max(0, Math.min(255, (rgb[1] + delta * 0.9) | 0));
  const b = Math.max(0, Math.min(255, (rgb[2] + delta * 1.08) | 0));
  return alpha >= 0.999 ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
}

const tau = Math.PI * 2;
const hash = (x, y, salt = 0) => (Math.imul(x + 1901, 374761393) ^ Math.imul(y + 607, 668265263) ^ salt) >>> 0;

function ellipse(ctx, x, y, a, b, angle, fill, stroke, width = 1) {
  ctx.beginPath();
  ctx.ellipse(x, y, Math.max(.015, a), Math.max(.015, b), angle, 0, tau);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.stroke(); }
}

function line(ctx, x, y, ex, ey, color, width) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(ex, ey);
  ctx.stroke();
}

function curve(ctx, points, color, width) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length - 1; i++) {
    const [x, y] = points[i];
    const [a, b] = points[i + 1];
    ctx.quadraticCurveTo(x, y, (x + a) * .5, (y + b) * .5);
  }
  ctx.lineTo(...points.at(-1));
  ctx.stroke();
}

// Organic chromatin-stippled nucleus renderer (adds realistic nuclear texture at medium/high zoom)
function drawNucleus(ctx, x, y, rx, ry, angle, rgbNuc, rgbCore, r, zoom) {
  const shade = (r() - 0.5) * 28;
  ellipse(ctx, x, y, rx, ry, angle, tint(rgbNuc, shade, 0.94), tint(rgbCore, -10, 0.85), Math.max(0.22, Math.min(rx, ry) * 0.14));
  if (zoom > 0.35 && rx * zoom > 2.2) {
    const ca = Math.cos(angle), sa = Math.sin(angle);
    // Stippled heterochromatin granules inside nucleus
    const dots = zoom > 1.2 ? 7 : 4;
    for (let d = 0; d < dots; d++) {
      const lx = (r() - 0.5) * rx * 1.25;
      const ly = (r() - 0.5) * ry * 1.25;
      const px = x + lx * ca - ly * sa;
      const py = y + lx * sa + ly * ca;
      ellipse(ctx, px, py, Math.max(0.28, rx * (0.14 + r() * 0.11)), Math.max(0.24, ry * (0.12 + r() * 0.1)), r() * tau,
        tint(rgbCore, -14 + r() * 18, 0.58));
    }
    // Distinct dark nucleolus
    const nx = (r() - 0.5) * rx * 0.45, ny = (r() - 0.5) * ry * 0.45;
    ellipse(ctx, x + nx * ca - ny * sa, y + nx * sa + ny * ca, rx * 0.24, ry * 0.24, 0, tint(rgbCore, -20, 0.86));
  }
}

function eachTile(bounds, stepX, stepY, border, fn) {
  const { left, right, top, bottom } = bounds;
  const fromX = Math.floor((left - border) / stepX), toX = Math.ceil((right + border) / stepX);
  const fromY = Math.floor((top - border) / stepY), toY = Math.ceil((bottom + border) / stepY);
  for (let j = fromY; j <= toY; j++) for (let i = fromX; i <= toX; i++) fn(i, j, i * stepX, j * stepY);
}

function epithelial(ctx, b, p, rgb, layer, anchor, zoom) {
  const smooth = (x, track) =>
    track * 167 + 34 * Math.sin(x / 184 + track * 1.2) + 23 * Math.sin(x / 63 - track * .46) + 7 * Math.cos(x / 29 + track * 2.1);

  if (layer === 0) {
    for (let j = Math.floor(b.top / 167) - 2; j <= Math.ceil(b.bottom / 167) + 1; j++) {
      const trace = offset => Array.from({ length: Math.ceil((b.right - b.left) / 14) + 4 },
        (_, i) => [b.left - 20 + i * 14, smooth(b.left - 20 + i * 14, j) + offset]);
      // Soft lamina propria background band
      const band = [...trace(12), ...trace(64).reverse()];
      ctx.beginPath(); ctx.moveTo(...band[0]); for (const part of band.slice(1)) ctx.lineTo(...part);
      ctx.closePath(); ctx.fillStyle = tint(rgb.matrix, 0, 0.86); ctx.fill();

      // Graded basement membrane transition (feathered sub-basal lamina + crisp PAS-positive basal lamina)
      curve(ctx, trace(15.5), tint(rgb.matrix, -14, 0.48), 7.2);
      curve(ctx, trace(13.2), tint(rgb.signal, 8, 0.42), 4.2);
      curve(ctx, trace(11.8), p.signal, zoom > 0.8 ? 1.8 : 2.3);
      // Apical brush-border basal zone
      curve(ctx, trace(-23.5), tint(rgb.edge, 0, 0.68), zoom > 1 ? 1.2 : 2.1);
      curve(ctx, trace(-26.5), tint(rgb.accent, 6, 0.72), 4.0);
    }
  }

  if (layer === 2) {
    // Deep lamina propria stromal nuclei & fine collagen wisps
    eachTile(b, 23, 167, 42, (i, j, x) => {
      const r = random(hash(i, j, 18));
      const y = smooth(x, j) + 28 + r() * 28;
      const ang = (smooth(x + 2, j) - smooth(x - 2, j)) * 0.25 + (r() - 0.5) * 0.7;
      if (zoom > 0.35) {
        line(ctx, x - 9, y + 2, x + 12, y - 1 + (r() - 0.5) * 4, tint(rgb.fiber, -8, 0.34), 1.4);
      }
      drawNucleus(ctx, x + (r() - 0.5) * 11, y, 3.6 + r() * 2.4, 1.25 + r() * 0.55, ang, rgb.nucleus, rgb.core, r, zoom);
    });
    return;
  }

  if (layer !== 1) return;
  const step = zoom < .19 ? 22 : 11;
  eachTile(b, step, 167, 34, (i, j, x) => {
    const stable = Math.round(x / 11);
    const r = random(hash(stable, j, 29));
    const xJit = x + (r() - 0.5) * (step * 0.16);
    const y = smooth(xJit, j);
    const slope = (smooth(xJit + 1, j) - y);
    const cellH = 16.5 + r() * 2.6;
    const cellW = step * (0.46 + r() * 0.11);
    const goblet = r() < .14 || (stable === 1 && j === 0);
    const cytoTone = tint(goblet ? rgb.accent : rgb.cyto, (r() - 0.5) * 22, 0.94);
    const borderTone = tint(rgb.edge, (r() - 0.5) * 14, 0.65);

    ellipse(ctx, xJit, y - 5.8, cellW, cellH, slope * .56, cytoTone, borderTone, .44);

    if (goblet) {
      // Mucin goblet chalice with clustered secretory mucigen droplets
      ellipse(ctx, xJit, y - 12.5, step * .35, 8.6, slope * 0.7, tint(rgb.signal, 16, 0.85), borderTone, .32);
      if (zoom > 0.5) {
        for (let m = 0; m < 5; m++) {
          ellipse(ctx, xJit + (r() - 0.5) * step * 0.36, y - 10 - r() * 6.5, 1.3 + r() * 0.9, 1.2 + r() * 0.8, 0,
            tint(rgb.accent, 14, 0.55), tint(rgb.signal, -12, 0.4), 0.2);
        }
      }
      anchor('Célula caliciforme', xJit, y - 13, 1);
    } else if (zoom > .55) {
      // Fine apical microvillous brush border
      for (let n = -3.5; n <= 3.5; n += 1.0) {
        const bx = xJit + n * 1.12;
        line(ctx, bx, y - 22.2, bx + slope * 1.4, y - 25.5 - r() * 0.7, tint(rgb.accent, 10, 0.85), .55);
      }
    }

    // Basal-polarized ovoid nucleus with chromatin stippling
    const nucY = y + (goblet ? 6.8 : 3.4 + (r() - 0.5) * 2.4);
    drawNucleus(ctx, xJit + slope * -1.8, nucY, goblet ? 1.85 : 2.6 + r() * 0.65, goblet ? 3.2 : 4.2 + r() * 1.25,
      slope * 0.85 + (r() - 0.5) * 0.14, rgb.nucleus, rgb.core, r, zoom);

    anchor('Núcleo', xJit, nucY, 1);
    anchor('Membrana basal', xJit, y + 12, 0);
    anchor('Borda em escova', xJit, y - 24, 0);
  });
}

function connective(ctx, b, p, rgb, layer, anchor, zoom) {
  if (layer < 2) {
    const stride = zoom < .25 ? 3 : 1;
    eachTile(b, 140, 24 * stride, 138, (i, j, x, y) => {
      j *= stride;
      if (((i + j) & 1) !== layer) return;
      const r = random(hash(i, j, 349));
      const offset = (r() - .5) * 26;
      const angle = .11 + .58 * Math.sin(j * .27 + i * .12) + (r() - 0.5) * 0.22;
      const w = 2.8 + r() * 8.4;
      const phase = r() * tau;
      const trace = Array.from({ length: 8 }, (_, n) => [
        x - 92 + n * 34,
        y + offset + Math.sin(n * .88 + phase) * (10 + w * 0.9) + (n - 3.5) * 28 * angle
      ]);
      const alpha = layer ? .74 : .46;
      const toneDelta = (r() - 0.5) * 26;
      curve(ctx, trace, tint(rgb.fiber, toneDelta, alpha), w * (zoom < .25 ? 1.85 : 1));
      // Delicate longitudinal fibrillar substructure inside collagen bundles
      if (zoom > 0.45 && w > 4.2) {
        curve(ctx, trace.map(([fx, fy]) => [fx, fy - w * .18]), tint(rgb.accent, 12, alpha * 0.65), w * .13);
        curve(ctx, trace.map(([fx, fy]) => [fx, fy + w * .21]), tint(rgb.edge, -8, alpha * 0.35), w * .1);
      }
      // Occasional delicate dark crisscrossing elastic micro-fiber
      if (r() > 0.62 && zoom > 0.35) {
        const ex = x + (r() - 0.5) * 60, ey = y + (r() - 0.5) * 35;
        curve(ctx, [[ex - 26, ey - 14], [ex, ey + 6], [ex + 28, ey - 8]], tint(rgb.core, 10, 0.28), 0.72);
      }
      anchor('Fibra colágena', ...trace[3], layer);
    });
  }

  if (layer === 2) {
    // Spindle-shaped fibroblasts with organic jitter & chromatin nuclei
    eachTile(b, 35, 37, 30, (i, j, x, y) => {
      const r = random(hash(i, j, 652));
      x += (r() - .5) * 28; y += (r() - .5) * 30;
      const angle = .32 + .45 * Math.sin(y * .018 + x * .011) + (r() - .5) * .68;
      ellipse(ctx, x, y, 10.5 + r() * 4.5, 2.4 + r() * 1.1, angle, tint(rgb.cyto, (r() - 0.5) * 18, 0.72));
      drawNucleus(ctx, x, y, 4.6 + r() * 1.9, 1.45 + r() * 0.55, angle, rgb.nucleus, rgb.core, r, zoom);
      anchor('Fibroblasto', x, y, 2);
    });
  }

  if (layer !== 1) return;
  // Small blood vessels with endothelial nuclei and shaded biconcave erythrocytes
  eachTile(b, 375, 410, 74, (i, j, x, y) => {
    const r = random(hash(i, j, 901));
    x += (r() - .5) * 130 + 52;
    y += (r() - .5) * 150 - 36;
    const ang = 0.25 + r() * 0.7;
    const rx = 22 + r() * 9, ry = 11 + r() * 4.5;
    ellipse(ctx, x, y, rx, ry, ang, tint(rgb.bg, 6, 0.95), tint(rgb.edge, -8, 0.85), 2.1);
    // Endothelial wall nuclei
    for (let e = 0; e < 3; e++) {
      const ea = ang + e * 2.1 + r() * 0.4;
      ellipse(ctx, x + Math.cos(ea) * (rx * 0.95), y + Math.sin(ea) * (ry * 0.95), 3.6, 1.1, ea + Math.PI / 2, p.nucleus);
    }
    // Biconcave erythrocytes with subtle central pallor
    for (let n = 0; n < 12; n++) {
      const fx = (r() - .5) * rx * 1.15, fy = (r() - .5) * ry * 1.05;
      const ex = x + fx * Math.cos(ang) - fy * Math.sin(ang);
      const ey = y + fx * Math.sin(ang) + fy * Math.cos(ang);
      ellipse(ctx, ex, ey, 3.1 + r() * 0.5, 2.5 + r() * 0.4, r() * tau, tint(rgb.blood, (r() - 0.5) * 20, 0.92));
      if (zoom > 0.6) ellipse(ctx, ex, ey, 1.15, 0.95, 0, tint(rgb.accent, 10, 0.45));
    }
    anchor('Vaso sanguíneo', x, y, 1);
  });
}

function muscular(ctx, b, p, rgb, layer, anchor, zoom) {
  const track = (x, y, phase) => y + .14 * x + Math.sin(x / 172 + phase) * 5.6 + Math.cos(x / 78 - phase * 0.6) * 1.8;

  for (let j = Math.floor((b.top - .14 * b.right) / 39) - 2; j <= Math.ceil((b.bottom - .14 * b.left) / 39) + 2; j++) {
    if (Math.abs(j) % 3 !== layer) continue;
    const rf = random(hash(j, 31, 412));
    const base = j * 39 + (rf() - 0.5) * 5.2;
    const fiberW = 30.5 + rf() * 6.2;
    const phase = rf() * 3.2;
    const toneShift = (rf() - 0.5) * 22;

    const band = Array.from({ length: 16 }, (_, i) => {
      const x = b.left - 22 + i * (b.right - b.left + 44) / 15;
      return [x, track(x, base, phase)];
    });

    // Endomysium border + fiber sarcoplasm + subtle longitudinal myofibril streaks
    curve(ctx, band, tint(rgb.edge, toneShift - 8, 0.72), fiberW + 2.4);
    curve(ctx, band, tint(rgb.cyto, toneShift, 0.96), fiberW);
    if (zoom > 0.4) {
      for (const off of [-fiberW * 0.28, 0, fiberW * 0.25]) {
        curve(ctx, band.map(([x, y]) => [x, y + off]), tint(rgb.accent, toneShift + 8, 0.24), 1.9);
      }
    }

    // True textbook skeletal muscle sarcomere spacing: 2.4 μm Z-to-Z (half-period 1.2 μm A/I band — constant at every zoom!)
    // Optically resolved from 40× upward (zoom > 0.35); below 40×, diffraction blends striations smoothly!
    const halfH = fiberW * 0.47;
    if (zoom > 0.35) {
      const delta = 1.2; // true 1.2 μm half-sarcomere (2.4 μm full sarcomere, Ross & Pawlina / Junqueira!)
      const vis = Math.min(1, (zoom - 0.35) / 0.65);
      for (let x = Math.floor(b.left / delta) * delta; x <= b.right + delta; x += delta) {
        const y = track(x, base, phase);
        if (y < b.top - 22 || y > b.bottom + 22) continue;
        const idx = Math.round(x / delta);
        const isDark = (idx & 1) === 0;
        line(ctx, x + 2.1, y - halfH, x - 2.1, y + halfH,
          isDark ? tint(rgb.edge, toneShift - 18, 0.36 * vis) : tint(rgb.accent, 14, 0.26 * vis),
          delta * (isDark ? 0.52 : 0.34));
        // Razor-fine Z-disc centered inside light I-band resolved at 100× and 1000×!
        if (!isDark && zoom > 2.2) {
          line(ctx, x + 2.0, y - halfH * 0.95, x - 2.0, y + halfH * 0.95, tint(rgb.core, 10, 0.30), 0.24);
        }
        if (idx % 16 === 0) anchor('Sarcômero (2,4 μm)', x, y, layer);
      }
    }

    // Flattened subsarcolemmal peripheral nuclei with chromatin stippling
    for (let i = Math.floor(b.left / 56) - 1; i <= Math.ceil(b.right / 56) + 1; i++) {
      const r = random(hash(i, j, 74));
      const x = i * 56 + r() * 42;
      const side = r() > .5 ? 1 : -1;
      const y = track(x, base, phase) + side * (halfH - 1.9);
      drawNucleus(ctx, x, y, 5.2 + r() * 1.9, 1.65 + r() * 0.5, .14 + (r() - 0.5) * 0.08, rgb.nucleus, rgb.core, r, zoom);
      anchor('Núcleo periférico', x, y, layer);
    }
  }
}

function drawDendriteBranch(ctx, x, y, angle, length, width, depth, color, r) {
  if (depth <= 0 || length < 4) return;
  const steps = 4;
  const pts = [[x, y]];
  let cx = x, cy = y, ca = angle;
  const segLen = length / steps;
  for (let s = 1; s <= steps; s++) {
    ca += (r() - 0.5) * 0.36;
    cx += Math.cos(ca) * segLen;
    cy += Math.sin(ca) * segLen;
    pts.push([cx, cy]);
  }
  curve(ctx, pts, color, width);
  // Progressive organic bifurcation into thinner daughter twigs
  if (depth > 1) {
    const mid = pts[2];
    drawDendriteBranch(ctx, mid[0], mid[1], ca + (0.38 + r() * 0.32), length * (0.55 + r() * 0.16), width * 0.58, depth - 1, color, r);
    drawDendriteBranch(ctx, cx, cy, ca - (0.32 + r() * 0.35), length * (0.52 + r() * 0.18), width * 0.54, depth - 1, color, r);
    if (r() > 0.45) {
      drawDendriteBranch(ctx, cx, cy, ca + (0.28 + r() * 0.3), length * 0.44, width * 0.48, depth - 1, color, r);
    }
  }
}

function nervous(ctx, b, p, rgb, layer, anchor, zoom) {
  // Subtle fibrillar neuropil mesh background in layer 0
  if (layer === 0 && zoom > 0.25) {
    eachTile(b, 56, 56, 32, (i, j, x, y) => {
      const r = random(hash(i, j, 509));
      const a = r() * tau;
      const len = 18 + r() * 26;
      curve(ctx, [
        [x, y],
        [x + Math.cos(a + 0.25) * len * 0.5, y + Math.sin(a + 0.25) * len * 0.5],
        [x + Math.cos(a) * len, y + Math.sin(a) * len]
      ], tint(rgb.fiber, -6, 0.22), 0.7);
    });
  }

  if (layer < 2) {
    const stride = zoom < .2 ? 3 : 1;
    eachTile(b, 92 * stride, 92 * stride, 124, (i, j, x, y) => {
      i *= stride;
      j *= stride;
      if (((i + j) & 1) !== layer) return;
      const r = random(hash(i, j, 643));
      x += (r() - .5) * 92 * .74; y += (r() - .5) * 92 * .76;
      if (i === 0 && j === 0) { x = 3; y = -5; }
      const size = 12.5 + r() * 13.5;
      const angle = r() * tau;
      const dendColor = tint(rgb.edge, (r() - 0.5) * 16, 0.85);

      // Long slender axon emerging from axon hillock
      const axonAngle = angle;
      const axonPts = [
        [x, y],
        [x + Math.cos(axonAngle + 0.08) * size * 1.4, y + Math.sin(axonAngle + 0.08) * size * 1.4],
        [x + Math.cos(axonAngle - 0.06) * (size + 42), y + Math.sin(axonAngle - 0.06) * (size + 42)],
        [x + Math.cos(axonAngle + 0.05) * (size + 78), y + Math.sin(axonAngle + 0.05) * (size + 78)]
      ];
      curve(ctx, axonPts, dendColor, 1.55);
      anchor('Axônio', axonPts[2][0], axonPts[2][1], layer);

      // Natural tapering & recursively branching dendritic tree
      const dendCount = 4 + Math.floor(r() * 3);
      for (let k = 1; k <= dendCount; k++) {
        const a = angle + (k / (dendCount + 1)) * tau * 0.85 + (r() - 0.5) * 0.35;
        const len = size * 0.9 + 18 + r() * 24;
        const startX = x + Math.cos(a) * size * 0.55;
        const startY = y + Math.sin(a) * size * 0.55;
        drawDendriteBranch(ctx, startX, startY, a, len, 2.7, zoom > 0.35 ? 3 : 2, dendColor, r);
        anchor('Dendrito', x + Math.cos(a) * (size + len * 0.42), y + Math.sin(a) * (size + len * 0.42), layer);
      }

      // Smooth concave-walled multipolar soma
      const lobes = 5 + (Math.floor(r() * 2));
      const verts = [];
      for (let k = 0; k < lobes; k++) {
        const a = angle + k * tau / lobes + (r() - 0.5) * 0.22;
        const d = size * (0.78 + r() * 0.28);
        verts.push([x + Math.cos(a) * d, y + Math.sin(a) * d]);
      }
      ctx.beginPath();
      for (let k = 0; k < lobes; k++) {
        const curr = verts[k];
        const next = verts[(k + 1) % lobes];
        // Pull control point softly inward toward soma center for organic concave neuron outline
        const cx = (curr[0] + next[0]) * 0.36 + x * 0.28;
        const cy = (curr[1] + next[1]) * 0.36 + y * 0.28;
        if (k === 0) ctx.moveTo(curr[0], curr[1]);
        ctx.quadraticCurveTo(cx, cy, next[0], next[1]);
      }
      ctx.closePath();
      ctx.fillStyle = tint(rgb.cyto, (r() - 0.5) * 20, 0.95);
      ctx.strokeStyle = dendColor;
      ctx.lineWidth = 1.1;
      ctx.fill();
      ctx.stroke();

      // Nissl bodies (tigroid rough ER granules inside perikaryon)
      if (zoom > 0.45) {
        for (let nb = 0; nb < 8; nb++) {
          const na = r() * tau, nr = size * (0.36 + r() * 0.28);
          ellipse(ctx, x + Math.cos(na) * nr, y + Math.sin(na) * nr, 1.3 + r() * 1.1, 0.8 + r() * 0.7, na,
            tint(rgb.nucleus, 10, 0.44));
        }
      }

      // Large pale vesicular nucleus with prominent central dark nucleolus ("owl's eye")
      ellipse(ctx, x + 0.8, y, size * .33, size * .29, angle, tint(rgb.accent, 14, 0.92), tint(rgb.nucleus, -8, 0.9), .85);
      ellipse(ctx, x + 0.8, y, size * .105, size * .1, angle, p.core);
      anchor('Corpo celular do neurônio', x, y, layer);
    });
    return;
  }

  // Diverse glial cell nuclei (dense small oligodendrocytes & paler oval astrocytes)
  eachTile(b, 24, 25, 10, (i, j, x, y) => {
    const r = random(hash(i, j, 841));
    x += (r() - .5) * 24; y += (r() - .5) * 25;
    const isAstro = r() > 0.58;
    drawNucleus(ctx, x, y, isAstro ? 2.8 + r() * 1.3 : 1.9 + r() * 0.8, isAstro ? 2.1 + r() * 0.7 : 1.7 + r() * 0.55,
      r() * tau, isAstro ? rgb.nucleus : rgb.core, rgb.core, r, zoom);
    anchor('Núcleo glial', x, y, 2);
  });
}

function bacteria(ctx, b, p, rgb, layer, anchor, zoom, gramPhase) {
  const step = 4.1;
  const stride = zoom < .26 ? 8 : zoom < 1 ? 2 : 1;
  if (zoom < .29 && layer === 0) {
    eachTile(b, 270, 285, 115, (i, j, x, y) => {
      const r = random(hash(i, j, 124));
      ellipse(ctx, x + r() * 124, y + r() * 118, 32 + r() * 54, 22 + r() * 28, r() * tau, tint(rgb.matrix, 0, 0.16));
    });
  }
  if (zoom < .26) return;
  eachTile(b, step * stride, step * stride, 4, (i, j, x, y) => {
    i *= stride;
    j *= stride;
    if (((i * 13 + j * 11) % 3 + 3) % 3 !== layer) return;
    const r = random(hash(i, j, 795));
    const colony = .54 + .28 * Math.cos(x / 34 + Math.sin(y / 28)) * Math.cos(y / 30);
    if (r() > colony) return;
    x += (r() - .5) * step * 1.15; y += (r() - .5) * step * 1.15;
    const positive = r() > .48;
    const rodShape = r() > .5;
    const baseRgb = gramPhase === 1 || gramPhase === 2 ? rgb.bacteria1 :
      gramPhase === 3 && !positive ? parsedPalettes.fresh.bacteria2 : positive ? rgb.bacteria1 : rgb.bacteria2;
    const col = tint(baseRgb, (r() - 0.5) * 20, 0.94);
    const rim = tint(baseRgb, -28, 0.55);
    const a = r() * tau;
    const size = .4 + r() * 0.08;

    if (rodShape) {
      // Bacilli (single or end-to-end diplobacilli)
      const pairs = r() > 0.68 ? 2 : 1;
      for (let n = 0; n < pairs; n++) {
        const bx = x + Math.cos(a) * n * size * 4.5;
        const by = y + Math.sin(a) * n * size * 4.5;
        ellipse(ctx, bx, by, size * (2.25 + r() * 1.45), size * .76, a + (r() - 0.5) * 0.18, col, zoom > 1.2 ? rim : null, 0.12);
      }
    } else {
      // Cocci in natural pairs, short streptococcal chains, or staphylococcal clusters
      const form = r();
      const count = form > 0.72 ? 5 : form > 0.4 ? 3 : 2;
      const isCluster = form > 0.72;
      for (let n = 0; n < count; n++) {
        const cx = isCluster ? x + (r() - 0.5) * size * 3.4 : x + Math.cos(a + n * .22) * n * size * 1.85;
        const cy = isCluster ? y + (r() - 0.5) * size * 3.4 : y + Math.sin(a + n * .22) * n * size * 1.85;
        ellipse(ctx, cx, cy, size, size * .95, a, col, zoom > 1.2 ? rim : null, 0.12);
      }
    }
    if (zoom > .9) anchor(p === palettes.gram && gramPhase >= 4 ?
      (rodShape ? 'Bacilo Gram' : 'Coco Gram') + (positive ? '+' : '−') : rodShape ? 'Bacilo' : 'Coco', x, y, layer);
  });
}

// Authentic Bee Historesin section renderer (inspired directly by course slides: striated flight muscles, cuticular edge & midgut epithelial villi!)
function beeHistoresin(ctx, b, p, rgb, layer, anchor, zoom) {
  // Layer 0: Translucent parallel bundles of striated insect thoracic muscle fibers & pale cuticular lamina
  if (layer === 0) {
    const stride = zoom < 0.25 ? 2 : 1;
    for (let j = Math.floor((b.top - 0.36 * b.right) / (26 * stride)) - 2; j <= Math.ceil((b.bottom - 0.36 * b.left) / (26 * stride)) + 2; j++) {
      const idx = j * stride;
      const r = random(hash(idx, 77, 811));
      const base = idx * 26 + (r() - 0.5) * 4;
      const w = 18 + r() * 6;
      const pts = Array.from({ length: 14 }, (_, k) => {
        const x = b.left - 30 + k * (b.right - b.left + 60) / 13;
        return [x, base + 0.36 * x + Math.sin(x / 150 + idx * 0.4) * 7.5];
      });
      curve(ctx, pts, tint(rgb.edge, -12, 0.46), w + 1.8);
      curve(ctx, pts, tint(rgb.cyto, (r() - 0.5) * 20, 0.88), w);
      if (zoom > 0.35) {
        curve(ctx, pts.map(([fx, fy]) => [fx, fy - w * 0.22]), tint(rgb.accent, 14, 0.45), 1.4);
        curve(ctx, pts.map(([fx, fy]) => [fx, fy + w * 0.24]), tint(rgb.fiber, -10, 0.42), 1.2);
      }
      // True Apis mellifera flight muscle sarcomere spacing: 2.8 μm Z-to-Z (half-period 1.4 μm — physically constant across zooms!)
      if (zoom > 0.35) {
        const step = 1.4;
        const vis = Math.min(1, (zoom - 0.35) / 0.65);
        for (let x = Math.floor(b.left / step) * step; x <= b.right + step; x += step) {
          const y = base + 0.36 * x + Math.sin(x / 150 + idx * 0.4) * 7.5;
          if (y < b.top - 20 || y > b.bottom + 20) continue;
          const darkBand = Math.round(x / step) % 2 === 0;
          line(ctx, x - 2, y - w * 0.44, x + 2, y + w * 0.44,
            darkBand ? tint(rgb.signal, -12, 0.38 * vis) : tint(rgb.accent, 16, 0.28 * vis), step * 0.52);
          if (!darkBand && zoom > 2.2) {
            line(ctx, x - 2, y - w * 0.43, x + 2, y + w * 0.43, tint(rgb.core, 6, 0.28), 0.24);
          }
        }
      }
      anchor('Fibra muscular (Abelha)', pts[6][0], pts[6][1], 0);
    }
  }

  // Layer 1: Ventriculus (midgut) folded epithelium + tracheal rings + bright peritrophic lamina
  if (layer === 1) {
    eachTile(b, 260, 260, 80, (i, j, x, y) => {
      const r = random(hash(i, j, 521));
      const cx = x + (r() - 0.5) * 110;
      const cy = y + (r() - 0.5) * 110;
      const rad = 24 + r() * 14;
      // Circular tracheal cross-section with spiral taenidia ring!
      ellipse(ctx, cx, cy, rad, rad * (0.72 + r() * 0.24), r() * tau, tint(rgb.bg, 4, 0.92), tint(rgb.edge, -16, 0.9), 3.0);
      ellipse(ctx, cx, cy, rad * 0.78, rad * 0.62, r() * tau, null, tint(rgb.signal, -8, 0.65), 1.3);
      anchor('Traqueia (tênidia)', cx, cy, 1);

      // Adjacent digestive epithelial cells with brush border
      for (let c = 0; c < 6; c++) {
        const a = (c / 6) * tau + r() * 0.4;
        const ex = cx + Math.cos(a) * (rad + 14);
        const ey = cy + Math.sin(a) * (rad + 14);
        ellipse(ctx, ex, ey, 9.5, 6.2, a, tint(rgb.cyto, (r() - 0.5) * 18, 0.84), tint(rgb.edge, -8, 0.6), 1.1);
        drawNucleus(ctx, ex, ey, 3.8, 2.8, a, rgb.nucleus, rgb.core, r, zoom);
      }
      anchor('Epitélio do ventrículo', cx + rad + 14, cy, 1);
    });
  }

  // Layer 2: Crisp basophilic muscle & fat-body nuclei + cuticular chitin border
  if (layer === 2) {
    eachTile(b, 46, 44, 24, (i, j, x, y) => {
      const r = random(hash(i, j, 919));
      const nx = x + (r() - 0.5) * 30;
      const ny = y + (r() - 0.5) * 30;
      const ang = 0.34 + (r() - 0.5) * 0.28;
      drawNucleus(ctx, nx, ny, 4.6 + r() * 2.0, 1.85 + r() * 0.7, ang, rgb.nucleus, rgb.core, r, zoom);
      if (zoom > 1.8 && r() > 0.45) {
        // Fine sarcosomes (mitochondria rows) visible at 100× and 1000× ultra-zoom!
        for (let m = -2; m <= 2; m++) {
          ellipse(ctx, nx + m * 2.8, ny + 4.4, 0.9, 0.6, ang, tint(rgb.signal, -15, 0.65));
        }
      }
      anchor('Núcleo (Azul de Toluidina)', nx, ny, 2);
    });
  }
}

// Peripheral Human Blood Smear (Giemsa / Panótico): biconcave erythrocytes (7.5 um), multilobed neutrophils, lymphocytes & platelets!
function bloodSmear(ctx, b, p, rgb, layer, anchor, zoom) {
  const stride = zoom < 0.25 ? 3 : zoom < 0.6 ? 2 : 1;
  // Layer 0: Dense monolayer of pink biconcave erythrocytes (7.5 um diameter) with central pallor!
  if (layer === 0) {
    const step = 11.5 * stride;
    eachTile(b, step, step, 14, (i, j, x, y) => {
      const gi = i * stride, gj = j * stride;
      const r = random(hash(gi, gj, 311));
      if (r() < 0.16) return;
      const px = x + (r() - 0.5) * 9.5;
      const py = y + (r() - 0.5) * 9.5;
      const rx = 3.5 + r() * 0.48;
      const ry = 3.3 + r() * 0.45;
      const ang = r() * tau;
      ellipse(ctx, px, py, rx, ry, ang, tint(rgb.blood, (r() - 0.5) * 20, 0.94), tint(rgb.edge, -12, 0.58), 0.42);
      // Classic central pallor of biconcave disc
      ellipse(ctx, px, py, rx * 0.46, ry * 0.46, ang, tint(rgb.accent, 8, 0.65));
      if (((gi * 5 + gj * 7) & 31) === 0) anchor('Hemácia (eritrócito ~7,5 μm)', px, py, 0);
    });
    return;
  }
  // Layer 1: White blood cells (segmented neutrophils with 3-5 purple lobes, lymphocytes & monocytes)
  if (layer === 1) {
    eachTile(b, 84, 84, 24, (i, j, x, y) => {
      const r = random(hash(i, j, 619));
      const px = x + (r() - 0.5) * 54;
      const py = y + (r() - 0.5) * 54;
      const kind = r();
      if (kind < 0.58) {
        // Segmented Neutrophil (~12-14 um) with 3-4 interconnected purple lobes + fine azurophilic granules
        const rad = 6.2 + r() * 1.1;
        ellipse(ctx, px, py, rad, rad * 0.95, r() * tau, tint(rgb.cyto, 18, 0.88), tint(rgb.edge, 0, 0.55), 0.55);
        const lobes = 3 + (r() > 0.45 ? 1 : 0);
        let prev = null;
        for (let k = 0; k < lobes; k++) {
          const a = (k / lobes) * tau + r() * 0.5;
          const lx = px + Math.cos(a) * rad * 0.46;
          const ly = py + Math.sin(a) * rad * 0.46;
          if (prev) line(ctx, prev[0], prev[1], lx, ly, tint(rgb.core, 0, 0.85), 0.65);
          drawNucleus(ctx, lx, ly, 2.0 + r() * 0.55, 1.45 + r() * 0.45, a, rgb.nucleus, rgb.core, r, zoom);
          prev = [lx, ly];
        }
        if (zoom > 0.7) {
          for (let g = 0; g < 8; g++) {
            ellipse(ctx, px + (r() - 0.5) * rad * 1.1, py + (r() - 0.5) * rad * 1.1, 0.35, 0.35, 0, tint(rgb.signal, 12, 0.45));
          }
        }
        anchor('Neutrófilo (núcleo multilobulado)', px, py, 1);
      } else {
        // Small Lymphocyte (~8-9 um): large round basophilic nucleus + thin sky-blue rim
        const rad = 4.5 + r() * 0.7;
        ellipse(ctx, px, py, rad, rad * 0.96, r() * tau, tint(rgb.cyto, -4, 0.92), tint(rgb.nucleus, 20, 0.48), 0.45);
        drawNucleus(ctx, px + 0.35, py - 0.2, rad * 0.78, rad * 0.74, r() * tau, rgb.nucleus, rgb.core, r, zoom);
        anchor('Linfócito', px, py, 1);
      }
    });
    return;
  }
  // Layer 2: Tiny granular violet Platelet clusters (~2-3 um)
  eachTile(b, 56, 56, 12, (i, j, x, y) => {
    const r = random(hash(i, j, 941));
    if (r() < 0.35) return;
    const px = x + (r() - 0.5) * 40;
    const py = y + (r() - 0.5) * 40;
    const n = 2 + Math.floor(r() * 4);
    for (let k = 0; k < n; k++) {
      ellipse(ctx, px + (r() - 0.5) * 4.5, py + (r() - 0.5) * 4.5, 0.95 + r() * 0.45, 0.75 + r() * 0.35, r() * tau,
        tint(rgb.signal, (r() - 0.5) * 18, 0.82), tint(rgb.core, 0, 0.45), 0.25);
    }
    anchor('Plaquetas (~2 μm)', px, py, 2);
  });
}

// Plant Leaf Epidermis, Guard Cells / Stomata & Spiral Xylem Vessels!
function leafEpidermis(ctx, b, p, rgb, layer, anchor, zoom) {
  // Layer 0: Deep spiral-thickened xylem vascular bundle strands
  if (layer === 0) {
    for (let j = Math.floor(b.top / 160) - 1; j <= Math.ceil(b.bottom / 160) + 1; j++) {
      const baseY = j * 160 + 20;
      const pts = Array.from({ length: 12 }, (_, i) => {
        const vx = b.left - 30 + (i / 11) * (b.right - b.left + 60);
        return [vx, baseY + Math.sin(vx / 130 + j) * 26];
      });
      curve(ctx, pts, tint(rgb.fiber, 0, 0.38), 16);
      if (zoom > 0.35) {
        for (let vx = Math.floor(b.left / 4.5) * 4.5; vx <= b.right; vx += 4.5) {
          const vy = baseY + Math.sin(vx / 130 + j) * 26;
          line(ctx, vx - 1.5, vy - 7, vx + 1.5, vy + 7, tint(rgb.fiber, -18, 0.52), 1.0);
        }
      }
      anchor('Vaso xilemático (lignina)', pts[5][0], pts[5][1], 0);
    }
    return;
  }
  // Layer 1: Interlocking wavy jigsaw epidermal pavement cells
  if (layer === 1) {
    const cellR = 24;
    const dx = cellR * 1.5, dy = cellR * Math.sqrt(3);
    const iMin = Math.floor((b.left - cellR * 2) / dx), iMax = Math.ceil((b.right + cellR * 2) / dx);
    const jMin = Math.floor((b.top - cellR * 2) / dy), jMax = Math.ceil((b.bottom + cellR * 2) / dy);
    for (let i = iMin; i <= iMax; i++) {
      for (let j = jMin; j <= jMax; j++) {
        const cx = i * dx, cy = j * dy + (i & 1 ? dy * 0.5 : 0);
        const r = random(hash(i, j, 557));
        const verts = [];
        for (let k = 0; k < 6; k++) {
          const a = (k * Math.PI) / 3;
          const vx = cx + Math.cos(a) * cellR, vy = cy + Math.sin(a) * cellR;
          const [jx, jy] = hexVertex(Math.round(vx), Math.round(vy), cellR * 0.9);
          verts.push([vx + jx, vy + jy]);
        }
        ctx.beginPath();
        for (let k = 0; k < 6; k++) {
          const p0 = verts[k], p1 = verts[(k + 1) % 6];
          const mx = (p0[0] + p1[0]) * 0.5, my = (p0[1] + p1[1]) * 0.5;
          if (k === 0) ctx.moveTo(mx, my);
          else ctx.quadraticCurveTo(p0[0], p0[1], mx, my);
        }
        ctx.closePath();
        ctx.fillStyle = tint(rgb.cyto, (r() - 0.5) * 18, 0.72);
        ctx.strokeStyle = tint(rgb.edge, -8, 0.78);
        ctx.lineWidth = zoom > 0.8 ? 1.3 : 1.9;
        ctx.fill();
        ctx.stroke();
        if (((i + j) & 7) === 0) anchor('Célula epidérmica vegetal', cx, cy, 1);
      }
    }
    return;
  }
  // Layer 2: Stomatal complexes (paired kidney-shaped guard cells packed with green chloroplasts around dark ostiole!)
  eachTile(b, 86, 86, 26, (i, j, x, y) => {
    const r = random(hash(i, j, 823));
    const sx = x + (r() - 0.5) * 46;
    const sy = y + (r() - 0.5) * 46;
    const ang = (r() - 0.5) * 1.1;
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(ang);
    // Two bean-shaped guard cells
    ellipse(ctx, 0, -4.6, 12.5, 4.6, 0, tint(rgb.blood, 12, 0.9), tint(rgb.core, 0, 0.85), 1.1);
    ellipse(ctx, 0, 4.6, 12.5, 4.6, 0, tint(rgb.blood, 12, 0.9), tint(rgb.core, 0, 0.85), 1.1);
    // Central stomatal pore (ostiole)
    ellipse(ctx, 0, 0, 7.2, 2.2, 0, tint(rgb.bg, -28, 0.95), tint(rgb.core, 0, 0.82), 0.9);
    // Vivid green chloroplasts lined inside both guard cells!
    for (let c = -3; c <= 3; c++) {
      ellipse(ctx, c * 3.0, -4.8 + (r() - 0.5) * 1.6, 1.35, 1.05, r() * tau, tint(rgb.signal, -12, 0.95));
      ellipse(ctx, c * 3.0, 4.8 + (r() - 0.5) * 1.6, 1.35, 1.05, r() * tau, tint(rgb.signal, -12, 0.95));
    }
    ctx.restore();
    anchor('Estômato (células-guarda)', sx, sy - 6, 2);
    anchor('Cloroplastos', sx + 6, sy + 5, 2);
  });
}

// Hyaline Cartilage (Trachea): basophilic homogeneous matrix, territorial rings & isogenous chondrocyte groups in lacunae!
function hyalineCartilage(ctx, b, p, rgb, layer, anchor, zoom) {
  if (layer === 0) {
    // Smooth glassy basophilic interterritorial matrix + subtle collagen-II fibrils
    eachTile(b, 92, 92, 36, (i, j, x, y) => {
      const r = random(hash(i, j, 401));
      ellipse(ctx, x + (r() - 0.5) * 35, y + (r() - 0.5) * 35, 34 + r() * 24, 24 + r() * 18, r() * tau, tint(rgb.nucleus, 96, 0.14));
    });
    return;
  }
  if (layer === 1) {
    // Isogenous groups of 2-4 chondrocytes nestled in clear lacunae surrounded by darker basophilic territorial matrix!
    eachTile(b, 68, 68, 28, (i, j, x, y) => {
      const r = random(hash(i, j, 719));
      const gx = x + (r() - 0.5) * 38;
      const gy = y + (r() - 0.5) * 38;
      const members = r() > 0.55 ? 3 : 2;
      const ang0 = r() * tau;
      // Intense basophilic territorial matrix halo
      ellipse(ctx, gx, gy, 15.5 + members * 2.2, 13.5 + members * 1.6, ang0, tint(rgb.nucleus, 64, 0.36));
      for (let m = 0; m < members; m++) {
        const a = ang0 + (m / members) * tau;
        const dist = members === 2 ? 5.6 : 6.8;
        const cx = gx + Math.cos(a) * dist;
        const cy = gy + Math.sin(a) * dist;
        // Clear pale lacuna rim + shrunken ovoid chondrocyte + dark nucleus
        ellipse(ctx, cx, cy, 6.2 + r() * 1.4, 5.1 + r() * 1.1, a + 0.5, tint(rgb.bg, 6, 0.94), tint(rgb.nucleus, 18, 0.72), 1.0);
        ellipse(ctx, cx, cy, 4.3, 3.6, a, tint(rgb.cyto, 10, 0.85));
        drawNucleus(ctx, cx, cy, 2.2, 1.8, a, rgb.nucleus, rgb.core, r, zoom);
      }
      anchor('Grupo isógeno (condrócitos)', gx, gy, 1);
      anchor('Matriz territorial', gx + 14, gy + 8, 1);
    });
    return;
  }
  // Layer 2: Occasional flat chondroblasts near perichondrium edge
  eachTile(b, 110, 110, 20, (i, j, x, y) => {
    const r = random(hash(i, j, 913));
    const px = x + (r() - 0.5) * 60, py = y + (r() - 0.5) * 60;
    ellipse(ctx, px, py, 8.2, 3.6, 0.3 + r() * 0.4, tint(rgb.bg, 4, 0.86), tint(rgb.nucleus, 24, 0.65), 0.75);
    drawNucleus(ctx, px, py, 3.4, 1.3, 0.3, rgb.nucleus, rgb.core, r, zoom);
    anchor('Lacuna cartilaginosa', px, py, 2);
  });
}

// Hepatic Lobule (Liver): central vein, radiating Remak plates of polyhedral binucleated hepatocytes & blood sinusoids!
function liverLobule(ctx, b, p, rgb, layer, anchor, zoom) {
  if (layer === 0) {
    // Pale branching hepatic sinusoids containing scattered erythrocytes
    eachTile(b, 44, 44, 18, (i, j, x, y) => {
      const r = random(hash(i, j, 523));
      line(ctx, x - 18, y + (r() - 0.5) * 14, x + 22, y + (r() - 0.5) * 18, tint(rgb.bg, 8, 0.92), 5.6);
      if (r() > 0.45) ellipse(ctx, x + (r() - 0.5) * 14, y, 2.8, 2.3, r() * tau, tint(rgb.blood, 0, 0.82));
    });
    return;
  }
  if (layer === 1) {
    // Polyhedral eosinophilic hepatocytes arranged in anastomosing cords (many binucleated!)
    const cellR = 13.5;
    const dx = cellR * 1.55, dy = cellR * 1.72;
    const iMin = Math.floor((b.left - 30) / dx), iMax = Math.ceil((b.right + 30) / dx);
    const jMin = Math.floor((b.top - 30) / dy), jMax = Math.ceil((b.bottom + 30) / dy);
    for (let i = iMin; i <= iMax; i++) {
      for (let j = jMin; j <= jMax; j++) {
        const cx = i * dx + ((j & 1) ? dx * 0.42 : 0), cy = j * dy;
        // Leave clear central vein lumina every ~360 um
        const modX = ((cx % 360) + 540) % 360 - 180;
        const modY = ((cy % 360) + 540) % 360 - 180;
        if (Math.hypot(modX, modY) < 42) continue;
        const r = random(hash(i, j, 761));
        if (r() < 0.12) continue; // Sinusoid lumen gap
        const verts = [];
        for (let k = 0; k < 6; k++) {
          const a = (k * Math.PI) / 3 + (r() - 0.5) * 0.25;
          const rad = cellR * (0.76 + r() * 0.22);
          verts.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]);
        }
        ctx.beginPath();
        ctx.moveTo(verts[0][0], verts[0][1]);
        for (let k = 1; k < 6; k++) ctx.lineTo(verts[k][0], verts[k][1]);
        ctx.closePath();
        ctx.fillStyle = tint(rgb.cyto, (r() - 0.5) * 20, 0.95);
        ctx.strokeStyle = tint(rgb.edge, -8, 0.65);
        ctx.lineWidth = 0.7;
        ctx.fill();
        ctx.stroke();

        // ~30% of mature hepatocytes are classically binucleated!
        if (r() < 0.30) {
          drawNucleus(ctx, cx - 3.2, cy - 1.2, 3.1, 2.9, r() * tau, rgb.nucleus, rgb.core, r, zoom);
          drawNucleus(ctx, cx + 3.2, cy + 1.4, 3.0, 2.8, r() * tau, rgb.nucleus, rgb.core, r, zoom);
          anchor('Hepatócito binucleado', cx, cy, 1);
        } else {
          drawNucleus(ctx, cx + (r() - 0.5) * 2.5, cy + (r() - 0.5) * 2.5, 3.6, 3.4, r() * tau, rgb.nucleus, rgb.core, r, zoom);
          if (((i + j) & 7) === 0) anchor('Hepatócito (cordão de Remak)', cx, cy, 1);
        }
      }
    }
    return;
  }
  // Layer 2: Central vein endothelial rings + Kupffer macrophages lining sinusoids
  eachTile(b, 360, 360, 60, (i, j, x, y) => {
    ellipse(ctx, x, y, 40, 34, 0.25, tint(rgb.bg, 8, 0.96), tint(rgb.edge, -12, 0.85), 2.4);
    for (let e = 0; e < 6; e++) {
      const a = (e / 6) * tau;
      ellipse(ctx, x + Math.cos(a) * 39, y + Math.sin(a) * 33, 3.8, 1.1, a + Math.PI / 2, p.nucleus);
    }
    anchor('Veia centrolobular', x, y, 2);
  });
}

function insectSection(ctx, _b, p, rgb, layer, anchor, zoom, sample) {
  const gut = sample.region === 'gut';
  const trachea = sample.region === 'trachea';
  const r = sample.radius;
  const sections = gut ? [[0, 0, 1], [r * 1.8, -r * 0.66, 0.35]]
    : trachea ? [[-32, 4, 1.15], [25, -27, 0.75], [29, 33, 0.62], [-49, -35, 0.37], [2, 46, 0.35]]
      : [[-40, 14, 1], [32, -20, 0.85], [24, 46, 0.70]];

  for (const [i, [x, y, scale]] of sections.entries()) {
    const rx = r * scale;
    const ry = rx * (gut ? 0.73 : 0.86);
    const phase = i * 1.76 + r * 0.03;
    const steps = gut ? 72 : 42;
    const points = (a, inner) => {
      const fold = inner && gut ? 0.13 * Math.cos(a * (sample.animal === 'copris' ? 7 : 5) + phase) : 0;
      const contour = (inner ? (trachea ? 0.75 : 0.56) : 1) + fold
        + 0.044 * Math.cos(a * 3 + phase) + 0.025 * Math.sin(a * 7 - phase);
      return [x + Math.cos(a) * rx * contour, y + Math.sin(a) * ry * contour];
    };
    const trace = inner => {
      for (let k = 0; k < steps; k++) {
        const xy = points(k * tau / steps, inner);
        if (k === 0) ctx.moveTo(...xy);
        else ctx.lineTo(...xy);
      }
      ctx.closePath();
    };

    if (layer === 0) {
      ellipse(ctx, x, y, rx * 1.22, ry * 1.24, 0, tint(rgb.matrix, 4, 0.45));
      ctx.beginPath();
      trace(false);
      ctx.fillStyle = p.cyto;
      ctx.fill();
      ctx.strokeStyle = p.edge;
      ctx.lineWidth = gut ? 4 : 2;
      ctx.stroke();
      ctx.beginPath();
      trace(true);
      ctx.fillStyle = tint(rgb.bg, 18, 1);
      ctx.fill();
      continue;
    }
    if (layer === 2) {
      ctx.beginPath();
      trace(true);
      ctx.strokeStyle = tint(rgb.edge, -12, 0.54);
      ctx.lineWidth = trachea ? 2.5 : 1.4;
      ctx.stroke();
      anchor(trachea ? 'Lúmen traqueal' : gut ? 'Lúmen intestinal' : 'Lúmen do túbulo de Malpighi', x, y, 2);
      continue;
    }
    const rng = random(338 + i * 37 + Math.round(r));
    const cells = Math.max(9, Math.round(rx * (gut ? 0.42 : 0.6)));
    for (let j = 0; j < cells; j++) {
      const a = j * tau / cells;
      const outer = points(a, false);
      const inner = points(a, true);
      ctx.strokeStyle = tint(rgb.edge, 8, 0.29);
      ctx.lineWidth = 0.55;
      ctx.beginPath();
      ctx.moveTo(...outer);
      ctx.quadraticCurveTo((outer[0] + inner[0]) * 0.5 + 1.2, (outer[1] + inner[1]) * 0.5, ...inner);
      ctx.stroke();
      if (!trachea || j % 4 === 0) {
        const cx = outer[0] * 0.68 + inner[0] * 0.32;
        const cy = outer[1] * 0.68 + inner[1] * 0.32;
        drawNucleus(ctx, cx, cy, gut ? 3.8 : 2.55, gut ? 2.7 : 1.65, a,
          rgb.nucleus, rgb.core, rng, zoom);
      }
    }
    anchor(trachea ? 'Parede traqueal' : gut ? 'Epitélio intestinal' : 'Epitélio do túbulo', x + rx * 0.83, y, 1);
  }
}

const drawing = {
  bee: beeHistoresin, blood: bloodSmear, leaf: leafEpidermis, cartilage: hyalineCartilage, liver: liverLobule,
  epithelial, connective, muscle: muscular, nervous, bacteria
};

function stagePalette(stain, phase) {
  const full = palettes[stain] || palettes.fresh;
  const fullRgb = parsedPalettes[stain] || parsedPalettes.fresh;
  const fresh = palettes.fresh;
  const freshRgb = parsedPalettes.fresh;
  if (phase >= 4) return { p: full, rgb: fullRgb };
  if (stain === 'he') return {
    p: { ...fresh, nucleus: full.nucleus, core: full.core },
    rgb: { ...freshRgb, nucleus: fullRgb.nucleus, core: fullRgb.core }
  };
  if (stain === 'pas') return {
    p: { ...fresh, signal: full.signal, accent: full.accent },
    rgb: { ...freshRgb, signal: fullRgb.signal, accent: fullRgb.accent }
  };
  if (stain === 'masson') {
    const extraP = phase === 1 ? {} : { cyto: full.cyto, blood: full.blood, edge: full.edge };
    const extraRgb = phase === 1 ? {} : { cyto: fullRgb.cyto, blood: fullRgb.blood, edge: fullRgb.edge };
    return {
      p: { ...fresh, nucleus: full.nucleus, core: full.core, ...extraP },
      rgb: { ...freshRgb, nucleus: fullRgb.nucleus, core: fullRgb.core, ...extraRgb }
    };
  }
  return { p: full, rgb: fullRgb };
}

export function paintField(canvas, slide, { fov = 400, x = 0, y = 0, layer = 1, gramPhase = 4, stainPhase = 4, clear = true, collect = false } = {}) {
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const zoom = width / fov;
  const heightUm = height / zoom;
  const { p, rgb } = stagePalette(slide.stain, stainPhase);
  const b = { left: x - fov / 2, right: x + fov / 2, top: y - heightUm / 2, bottom: y + heightUm / 2 };
  const annotations = [];
  ctx.save();
  if (clear) ctx.clearRect(0, 0, width, height);

  // Real end-of-course honeybee microscope photograph for the finished Historesin bee slide!
  const useBeeCoursePhoto = slide.tissue === 'bee' && slide.stain === 'historesin' && stainPhase >= 4 && isBeePhotoReady();
  if (useBeeCoursePhoto) {
    // Full photo spans 4500 x 4500 um (matches 4x objective 1:1); smoothly resolves photo-masked cellular ultrastructure from 40x to 1000x!
    const photoSpanUm = 4500;
    const halfSpan = photoSpanUm * 0.5;
    const rawDetail = Math.max(0, Math.min(1, (1350 - fov) / 920));
    const detailAlpha = rawDetail * rawDetail * (3 - 2 * rawDetail);
    const pushAnchor = (label, px, py, depth) => {
      if (!collect || annotations.length > 1200) return;
      const localX = (px - b.left) * zoom;
      const localY = (py - b.top) * zoom;
      if (Math.hypot((localX - width * 0.5) / width, (localY - height * 0.5) / height) < 0.40) {
        annotations.push({ label, x: localX, y: localY, depth });
      }
    };

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    if (layer === 0) {
      ctx.fillStyle = '#040504';
      ctx.fillRect(0, 0, width, height);
      if (detailAlpha > 0.02) {
        ctx.scale(zoom, zoom);
        ctx.translate(-b.left, -b.top);
        drawBeeCourseDetails(ctx, b, 0, fov, zoom, detailAlpha, pushAnchor);
      }
    } else if (layer === 1) {
      ctx.scale(zoom, zoom);
      ctx.translate(-b.left, -b.top);
      // Keep the real course photograph's exact illumination, contours & glowing gradient at every zoom level!
      ctx.globalAlpha = 1 - detailAlpha * 0.10;
      ctx.drawImage(beeCourseImg, -halfSpan, -halfSpan, photoSpanUm, photoSpanUm);
      ctx.globalAlpha = 1;
      if (detailAlpha > 0.02) {
        drawBeeCourseDetails(ctx, b, 1, fov, zoom, detailAlpha, pushAnchor);
      }
      if (collect && fov >= 750) {
        const markers = [
          ['Papo / Inglúvio (néctar)', 0.68, 0.25],
          ['Ventrículo (estômago anelado)', 0.35, 0.36],
          ['Túbulos de Malpighi (excreção)', 0.42, 0.67],
          ['Traqueias ramificadas', 0.76, 0.68]
        ];
        for (const [label, nx, ny] of markers) {
          pushAnchor(label, (nx - 0.5) * photoSpanUm, (ny - 0.5) * photoSpanUm, 1);
        }
      }
    } else if (layer === 2) {
      ctx.scale(zoom, zoom);
      ctx.translate(-b.left, -b.top);
      if (detailAlpha < 0.85) {
        ctx.globalAlpha = 0.14 * (1 - detailAlpha * 0.7);
        ctx.drawImage(beeCourseImg, -halfSpan, -halfSpan, photoSpanUm, photoSpanUm);
        ctx.globalAlpha = 1;
      }
      if (detailAlpha > 0.02) {
        drawBeeCourseDetails(ctx, b, 2, fov, zoom, detailAlpha, pushAnchor);
      }
    }
    ctx.restore();
    return annotations;
  }

  if (layer === 0) {
    ctx.fillStyle = p.bg;
    ctx.fillRect(0, 0, width, height);
    if (slide.tissue !== 'bacteria') {
      const tintGrad = ctx.createRadialGradient(width * 0.45, height * 0.42, width * 0.08, width * 0.5, height * 0.5, width * 0.72);
      tintGrad.addColorStop(0, tint(rgb.bg, 6, 0.25));
      tintGrad.addColorStop(0.65, tint(rgb.matrix, 4, 0.2));
      tintGrad.addColorStop(1, tint(rgb.matrix, -10, 0.28));
      ctx.fillStyle = tintGrad;
      ctx.fillRect(0, 0, width, height);
    }
  }
  ctx.scale(zoom, zoom);
  ctx.translate(-b.left, -b.top);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const specimen = insectTissues[slide.tissue];
  const draw = specimen ? insectSection : drawing[slide.tissue];
  draw(ctx, b, p, rgb, layer, (label, px, py, depth) => {
    if (!collect || annotations.length > 1700) return;
    const localX = (px - b.left) * zoom, localY = (py - b.top) * zoom;
    if (Math.hypot((localX - width * .5) / width, (localY - height * .5) / height) < .38) {
      annotations.push({ label, x: localX, y: localY, depth });
    }
  }, zoom, specimen || gramPhase);
  ctx.restore();
  return annotations;
}

export function paintPreview(canvas, slide, options) {
  for (let layer = 0; layer < 3; layer++) paintField(canvas, slide, { ...options, layer, clear: layer === 0 });
}
