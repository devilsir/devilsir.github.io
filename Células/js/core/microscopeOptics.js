import { paintField, isBeePhotoReady } from './histofield.js?v=23';

// Standard widefield eyepiece FN = 18 mm (FOV = 18 mm / M_obj):
// 4x -> 4500 um | 10x -> 1800 um | 40x -> 450 um | 100x Oil -> 180 um | 1000x (100x Apo + Optovar 2.5x) -> 72 um!
export const lenses = [
  { power: 4, total: 40, label: '4×', color: '#dc484e', na: .1, wd: 17, parfocal: .8, fov: 4500, oil: false },
  { power: 10, total: 100, label: '10×', color: '#e4bc3b', na: .25, wd: 7.5, parfocal: .25, fov: 1800, oil: false },
  { power: 40, total: 400, label: '40×', color: '#3e7ee0', na: .65, wd: .6, parfocal: -.12, fov: 450, oil: false },
  { power: 100, total: 1000, label: '100×', color: '#f2f5f7', na: 1.25, wd: .23, parfocal: -.19, fov: 180, oil: true },
  { power: 1000, total: 1000, label: '1000×', color: '#9c78f5', na: 1.40, wd: .13, parfocal: -.24, fov: 72, oil: true, ultra: true }
];
export const fovFor = lens => lens.fov || (18000 / lens.power);
export const apertureFor = (lens, iris, oil) => lens.na * (.35 + .65 * iris) * (lens.oil && !oil ? .46 : 1);
export const depthOfField = (lens, iris, oil) => .55 * (lens.oil && oil ? 1.515 : 1) / apertureFor(lens, iris, oil) ** 2;
export const fmt = (value, precision = 1) => value.toLocaleString('pt-BR', { maximumFractionDigits: precision });
export const focusPlanes = thickness => [-.42, 0, .42].map(factor => factor * thickness);
const planeNames = ['Plano profundo', 'Plano nuclear', 'Superfície'];

function surface(size) {
  return Object.assign(document.createElement('canvas'), { width: size, height: size });
}

export class Ocular {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.layers = Array.from({ length: 3 }, () => surface(canvas.width));
    this.image = surface(canvas.width);
    const half = canvas.width / 2;
    this.vignette = this.ctx.createRadialGradient(half, half, canvas.width * .28, half, half, canvas.width * .506);
    this.vignette.addColorStop(0, 'rgba(5, 8, 14, 0)');
    this.vignette.addColorStop(.68, 'rgba(6, 9, 15, 0.08)');
    this.vignette.addColorStop(.86, 'rgba(5, 8, 14, 0.38)');
    this.vignette.addColorStop(.96, 'rgba(4, 6, 11, 0.82)');
    this.vignette.addColorStop(1, 'rgba(3, 5, 9, 0.96)');

    // Subtle field illumination dome (brighter center like real Köhler brightfield)
    this.kohler = this.ctx.createRadialGradient(half, half, canvas.width * .04, half, half, canvas.width * .5);
    this.kohler.addColorStop(0, 'rgba(255, 253, 245, 0.11)');
    this.kohler.addColorStop(0.55, 'rgba(255, 252, 242, 0.03)');
    this.kohler.addColorStop(1, 'rgba(18, 22, 32, 0.12)');
  }

  draw(settings, lens) {
    const { slide, x, y, macro, micro, lamp, iris, oil, labels, cracked } = settings;
    const fov = fovFor(lens);
    const size = this.canvas.width;
    const center = size / 2;
    const isDarkfieldPhoto = slide.tissue === 'bee' && slide.stain === 'historesin' && isBeePhotoReady();
    const stainPhase = slide.stainPhase ?? 4;
    const key = [slide.tissue, slide.stain, stainPhase, lens.power, x, y, labels, isDarkfieldPhoto ? 1 : 0].join('/');
    if (this.key !== key) {
      this.key = key;
      this.anchors = [];
      for (let layer = 0; layer < 3; layer++) {
        this.anchors.push(...paintField(this.layers[layer], slide, { layer, fov, x, y, stainPhase, gramPhase: stainPhase, collect: labels }));
      }
    }

    const noOil = Boolean(lens.oil && !oil);
    const dof = depthOfField(lens, iris, oil);
    const planes = focusPlanes(slide.thickness);
    const focal = macro + micro - lens.parfocal;

    // Distinct multi-layer optical defocus per Z stratum (surface, nuclear, deep fibers)
    const effNA = apertureFor(lens, iris, oil);
    const diffraction = Math.max(0, (0.28 / effNA) * Math.min(4.2, size / fov) - 0.85);
    const blur = planes.map(z => {
      const defocus = Math.max(0, Math.abs(focal - z) - dof * .24);
      const scalePower = Math.min(180, lens.power);
      const rawBlur = defocus * (.56 + scalePower * .018) / Math.sqrt(Math.max(.55, dof)) + diffraction;
      return Math.min(20, rawBlur + (noOil ? 5.6 : 0));
    });

    let bestLayer = 1;
    if (blur[0] <= blur[1] && blur[0] <= blur[2]) bestLayer = 0;
    else if (blur[2] <= blur[1] && blur[2] <= blur[0]) bestLayer = 2;

    const image = this.image.getContext('2d');
    image.clearRect(0, 0, size, size);
    for (let i = 0; i < 3; i++) {
      // Gently attenuate severely out-of-focus foreground layers so in-focus strata underneath read clearly!
      const layerAlpha = i === 0 ? 1 : Math.max(0.42, 1 - Math.max(0, blur[i] - 2.2) * 0.042);
      image.globalAlpha = layerAlpha;
      image.filter = blur[i] > .24 ? `blur(${blur[i].toFixed(2)}px)` : 'none';
      if (noOil) {
        // Air-gap spherical aberration & refractive ghosting in 100x without immersion oil
        image.drawImage(this.layers[i], -6, -3, size + 12, size + 6);
        image.globalAlpha = layerAlpha * 0.34;
        image.drawImage(this.layers[i], 5, 4, size - 4, size - 4);
      } else {
        image.drawImage(this.layers[i], 0, 0);
      }
    }
    image.globalAlpha = 1;
    image.filter = 'none';

    const ctx = this.ctx;
    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, center - 1, 0, Math.PI * 2);
    ctx.clip();

    ctx.fillStyle = '#252730';
    ctx.fillRect(0, 0, size, size);

    const fresh = slide.stain === 'fresh';
    const exposure = lamp <= 0.005 ? 0.025 : isDarkfieldPhoto
      ? Math.max(0.10, 0.25 + lamp * (0.85 + iris * 0.35))
      : Math.max(.06, .12 + lamp * (.68 + iris * .54));
    const contrast = (fresh ? 1.12 + (1 - iris) * 1.38 : isDarkfieldPhoto ? 1.02 + (1 - iris) * 0.28 : .93 + (1 - iris) * .32) * (noOil ? .72 : 1);
    const sat = noOil ? 0.78 : isDarkfieldPhoto ? 1.12 : 1.02;
    ctx.filter = `brightness(${exposure.toFixed(3)}) contrast(${contrast.toFixed(3)}) saturate(${sat.toFixed(2)})`;
    ctx.drawImage(this.image, 0, 0);
    ctx.filter = 'none';

    // Subtle Köhler brightfield light dome (skipped on darkfield photo so black field stays crisp) + circular vignette
    if (!isDarkfieldPhoto) {
      ctx.fillStyle = this.kohler;
      ctx.fillRect(0, 0, size, size);
    }
    ctx.fillStyle = this.vignette;
    ctx.fillRect(0, 0, size, size);

    // Milky refractive haze & peripheral spherical dispersion when 100x lacks immersion oil
    if (noOil) {
      const haze = ctx.createRadialGradient(center * .84, center * .84, center * .18, center, center, center);
      haze.addColorStop(0, 'rgba(236, 232, 242, 0.14)');
      haze.addColorStop(.72, 'rgba(210, 198, 224, 0.22)');
      haze.addColorStop(1, 'rgba(130, 114, 152, 0.44)');
      ctx.fillStyle = haze;
      ctx.fillRect(0, 0, size, size);
    }

    if (cracked) this.crack(ctx, size);
    if (labels && !cracked) this.label(ctx, size, blur);
    this.reticle(ctx, size, fov);
    ctx.restore();
    return { blur, focal, dof, planeName: planeNames[bestLayer] };
  }

  crack(ctx, size) {
    ctx.save();
    const lines = [
      [[.18, .88], [[.38, .58], [.34, .51], [.61, .35], [.81, .12]]],
      [[.38, .58], [[.51, .64], [.72, .59], [.92, .68]]],
      [[.61, .35], [[.48, .26], [.45, .04]]],
      [[.38, .58], [[.22, .45], [.08, .39]]],
      [[.51, .64], [[.56, .82], [.64, .95]]]
    ];
    for (const [start, points] of lines) {
      ctx.beginPath();
      ctx.moveTo(start[0] * size, start[1] * size);
      for (const [x, y] of points) ctx.lineTo(x * size, y * size);
      ctx.lineWidth = 3.6;
      ctx.strokeStyle = 'rgba(42, 16, 32, 0.65)';
      ctx.stroke();
      ctx.lineWidth = 1.25;
      ctx.strokeStyle = 'rgba(255, 248, 252, 0.95)';
      ctx.stroke();
    }
    ctx.restore();
  }

  label(ctx, size, blur) {
    const center = size / 2;
    const priority = [...this.anchors].sort((a, b) =>
      Math.hypot(a.x - center, a.y - center) + blur[a.depth] * 7.5 -
      (Math.hypot(b.x - center, b.y - center) + blur[b.depth] * 7.5));
    const seen = new Set();
    const visible = [];
    for (const anchor of priority) {
      if (seen.has(anchor.label) || visible.some(other => Math.hypot(other.x - anchor.x, other.y - anchor.y) < size * .055)) continue;
      visible.push(anchor);
      seen.add(anchor.label);
      if (visible.length === 4) break;
    }
    // Split visible anchors into top vs bottom halves and sort each row left-to-right by X so leader lines NEVER cross!
    const byY = [...visible].sort((a, b) => a.y - b.y);
    const topRow = byY.slice(0, Math.min(2, byY.length)).sort((a, b) => a.x - b.x);
    const botRow = byY.slice(Math.min(2, byY.length)).sort((a, b) => a.x - b.x);
    const paired = [
      ...topRow.map((anchor, idx) => ({ anchor, right: topRow.length === 1 ? anchor.x >= center : idx === 1, ty: size * .22 })),
      ...botRow.map((anchor, idx) => ({ anchor, right: botRow.length === 1 ? anchor.x >= center : idx === 1, ty: size * .75 }))
    ];
    ctx.font = '700 ' + Math.round(size / 44) + 'px Inter, Segoe UI, sans-serif';
    for (const { anchor: { x, y, label }, right, ty } of paired) {
      const w = ctx.measureText(label).width + 18;
      const dy = Math.max(Math.abs(ty - 22 - center), Math.abs(ty + 8 - center));
      const chordHalf = Math.sqrt(Math.max(16, (center - 16) ** 2 - dy * dy));
      const minX = center - chordHalf;
      const maxX = center + chordHalf - w;
      const tx = right
        ? Math.max(minX, Math.min(maxX, center + size * .03))
        : Math.min(maxX, Math.max(minX, center - w - size * .03));
      const edge = right ? tx : tx + w;
      ctx.strokeStyle = 'rgba(11, 20, 30, 0.85)';
      ctx.lineWidth = 3.2;
      ctx.beginPath(); ctx.moveTo(edge, ty - 6); ctx.lineTo(x, y); ctx.stroke();
      ctx.strokeStyle = '#73e2eb';
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.beginPath(); ctx.arc(x, y, 4.2, 0, Math.PI * 2); ctx.fillStyle = '#5cdce8'; ctx.fill();
      ctx.fillStyle = 'rgba(11, 17, 25, 0.92)';
      ctx.strokeStyle = 'rgba(75, 199, 216, 0.65)';
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.roundRect(tx, ty - 22, w, 30, 6); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#ebf8fc';
      ctx.fillText(label, tx + 9, ty - 2);
    }
  }

  reticle(ctx, size, fov) {
    const m = size * .5;
    const desired = fov * .18;
    const unit = 10 ** Math.floor(Math.log10(desired));
    const nice = [1, 2, 5, 10].map(n => n * unit).reduce((best, n) => Math.abs(desired - n) < Math.abs(desired - best) ? n : best);
    const width = nice / fov * size;
    const x = m - width / 2;
    const y = size * .885;

    // Razor-sharp eyepiece pointer needle & dynamic scale bar
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(9, 14, 22, 0.86)';
    ctx.lineWidth = 3.6;
    ctx.beginPath();
    ctx.moveTo(m + 24, m - 13); ctx.lineTo(m + 2, m); ctx.lineTo(m + 27, m + 3);
    ctx.moveTo(x, y - 5); ctx.lineTo(x, y); ctx.lineTo(x + width, y); ctx.lineTo(x + width, y - 5);
    ctx.stroke();

    ctx.strokeStyle = '#f2fcff';
    ctx.lineWidth = 1.45;
    ctx.stroke();

    ctx.font = '700 ' + Math.round(size / 47) + 'px Consolas, monospace';
    ctx.textAlign = 'center';
    ctx.strokeStyle = 'rgba(9, 14, 22, 0.9)';
    ctx.lineWidth = 3.8;
    ctx.strokeText(fmt(nice) + ' μm', m, y + size * .028);
    ctx.fillStyle = '#effafe';
    ctx.fillText(fmt(nice) + ' μm', m, y + size * .028);
  }
}
