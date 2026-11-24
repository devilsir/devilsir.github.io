import { getOptionLabels } from '../config.js';

function seededRng(seed = 17) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function drawMark(ctx, cx, cy, r, style, rng) {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (style === 'faint') {
    ctx.globalAlpha = 0.16;
    ctx.strokeStyle = '#2b3340';
    ctx.lineWidth = r * 0.32;
    for (let i = 0; i < 4; i += 1) {
      const dy = (i - 1.5) * r * 0.27;
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.62, cy + dy + (rng() - 0.5) * 3);
      ctx.lineTo(cx + r * 0.62, cy + dy + (rng() - 0.5) * 3);
      ctx.stroke();
    }
  } else if (style === 'x-mark') {
    ctx.strokeStyle = '#18202c';
    ctx.lineWidth = Math.max(2.6, r * 0.26);
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.72, cy - r * 0.68);
    ctx.lineTo(cx + r * 0.72, cy + r * 0.68);
    ctx.moveTo(cx + r * 0.72, cy - r * 0.68);
    ctx.lineTo(cx - r * 0.72, cy + r * 0.68);
    ctx.stroke();
  } else if (style === 'circled') {
    ctx.strokeStyle = '#151c27';
    ctx.lineWidth = Math.max(2.8, r * 0.24);
    ctx.beginPath();
    ctx.ellipse(cx, cy, r * 1.12, r * 1.05, (rng() - 0.5) * 0.2, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    ctx.fillStyle = '#1e2732';
    ctx.beginPath();
    ctx.ellipse(cx, cy, r * 0.74, r * 0.68, (rng() - 0.5) * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.75;
    ctx.strokeStyle = '#101722';
    ctx.lineWidth = r * 0.19;
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.65, cy + (rng() - 0.5) * r * 0.4);
    ctx.lineTo(cx + r * 0.6, cy + (rng() - 0.5) * r * 0.4);
    ctx.stroke();
  }

  ctx.restore();
}

export const CAPTURE_CONDITIONS = Object.freeze({
  perfect: { label: 'Perfeita (estúdio / alta nitidez)', short: 'Perfeita' },
  medium: { label: 'Mediana (celular normal)', short: 'Mediana' },
  shadow: { label: 'Sombra forte (iluminação irregular)', short: 'Sombra forte' },
  bright: { label: 'Claridade alta (superexposta)', short: 'Muito clara' },
  dark: { label: 'Baixa claridade (ambiente escuro)', short: 'Escura' },
  lowres: { label: 'Baixa definição / desfocada', short: 'Baixa def.' },
  highres: { label: 'Alta definição + inclinação', short: 'Alta def.' }
});

function applyCaptureCondition(canvas, condition = 'medium', seed = 91) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const rng = seededRng(seed);

  ctx.save();

  if (condition === 'perfect') {
    // Almost studio clean: tiny ambient falloff only
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.02)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.03)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
    return;
  }

  if (condition === 'medium' || condition === 'highres') {
    const grad = ctx.createLinearGradient(w * 0.05, h * 0.15, w * 0.96, h * 0.86);
    grad.addColorStop(0, 'rgba(255, 244, 214, 0.08)');
    grad.addColorStop(0.55, 'rgba(0, 0, 0, 0.015)');
    grad.addColorStop(1, 'rgba(13, 18, 25, 0.17)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    const vignette = ctx.createRadialGradient(w * 0.46, h * 0.4, w * 0.2, w * 0.5, h * 0.5, w * 0.9);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.16)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);

    ctx.globalAlpha = condition === 'highres' ? 0.022 : 0.034;
    const grainCount = condition === 'highres' ? 14000 : 18000;
    for (let i = 0; i < grainCount; i += 1) {
      const shade = Math.floor(rng() * 255);
      ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
      ctx.fillRect(Math.floor(rng() * w), Math.floor(rng() * h), 1, 1);
    }
    ctx.restore();
    return;
  }

  if (condition === 'shadow') {
    // Hard diagonal cast shadow (like a phone/hand blocking a desk lamp across half the sheet)
    const shadowGrad = ctx.createLinearGradient(w * 0.18, h * 0.12, w * 0.78, h * 0.72);
    shadowGrad.addColorStop(0, 'rgba(255, 248, 224, 0.10)');
    shadowGrad.addColorStop(0.42, 'rgba(20, 24, 32, 0.04)');
    shadowGrad.addColorStop(0.54, 'rgba(10, 14, 22, 0.44)');
    shadowGrad.addColorStop(1, 'rgba(8, 12, 20, 0.52)');
    ctx.fillStyle = shadowGrad;
    ctx.fillRect(0, 0, w, h);

    // Secondary soft circular shadow patch in the lower-left
    const patch = ctx.createRadialGradient(w * 0.28, h * 0.66, w * 0.05, w * 0.28, h * 0.66, w * 0.38);
    patch.addColorStop(0, 'rgba(8, 10, 18, 0.28)');
    patch.addColorStop(1, 'rgba(8, 10, 18, 0)');
    ctx.fillStyle = patch;
    ctx.fillRect(0, 0, w, h);

    ctx.globalAlpha = 0.04;
    for (let i = 0; i < 20000; i += 1) {
      const shade = Math.floor(rng() * 255);
      ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
      ctx.fillRect(Math.floor(rng() * w), Math.floor(rng() * h), 1, 1);
    }
    ctx.restore();
    return;
  }

  if (condition === 'bright') {
    // Overexposed / harsh flash glare: washes dark ink toward mid-gray and clips highlights
    ctx.fillStyle = 'rgba(255, 255, 250, 0.34)';
    ctx.fillRect(0, 0, w, h);

    const flash = ctx.createRadialGradient(w * 0.45, h * 0.38, w * 0.04, w * 0.45, h * 0.38, w * 0.65);
    flash.addColorStop(0, 'rgba(255, 255, 255, 0.28)');
    flash.addColorStop(0.55, 'rgba(255, 255, 255, 0.08)');
    flash.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = flash;
    ctx.fillRect(0, 0, w, h);

    ctx.globalAlpha = 0.025;
    for (let i = 0; i < 12000; i += 1) {
      const shade = Math.floor(140 + rng() * 115);
      ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
      ctx.fillRect(Math.floor(rng() * w), Math.floor(rng() * h), 1, 1);
    }
    ctx.restore();
    return;
  }

  if (condition === 'dark') {
    // Dimly lit room + stronger ISO noise
    ctx.fillStyle = 'rgba(6, 10, 16, 0.46)';
    ctx.fillRect(0, 0, w, h);

    const vignette = ctx.createRadialGradient(w * 0.5, h * 0.48, w * 0.15, w * 0.5, h * 0.5, w * 0.82);
    vignette.addColorStop(0, 'rgba(255, 245, 220, 0.06)');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.28)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);

    ctx.globalAlpha = 0.07;
    for (let i = 0; i < 30000; i += 1) {
      const shade = Math.floor(rng() * 190);
      ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
      ctx.fillRect(Math.floor(rng() * w), Math.floor(rng() * h), 2, 2);
    }
    ctx.restore();
    return;
  }

  if (condition === 'lowres') {
    // Mild motion/focus blur + soft ambient lighting + grain
    const copy = document.createElement('canvas');
    copy.width = w;
    copy.height = h;
    copy.getContext('2d', { alpha: false }).drawImage(canvas, 0, 0);

    ctx.filter = 'blur(1.25px)';
    ctx.drawImage(copy, 0, 0);
    ctx.filter = 'none';
    copy.width = 1;
    copy.height = 1;

    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, 'rgba(255, 248, 232, 0.06)');
    grad.addColorStop(1, 'rgba(15, 20, 28, 0.18)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.globalAlpha = 0.045;
    for (let i = 0; i < 14000; i += 1) {
      const shade = Math.floor(rng() * 255);
      ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
      ctx.fillRect(Math.floor(rng() * w), Math.floor(rng() * h), 1, 1);
    }
    ctx.restore();
  }
}

function warpSheetAsPhoto(cv, flatCanvas, { isLandscape = false, condition = 'medium', seed = 91 } = {}) {
  let outW;
  let outH;
  if (condition === 'perfect' || condition === 'highres') {
    outW = isLandscape ? 1640 : 1280;
    outH = isLandscape ? 1180 : 1640;
  } else if (condition === 'lowres') {
    outW = isLandscape ? 880 : 660;
    outH = isLandscape ? 640 : 860;
  } else {
    outW = isLandscape ? 1280 : 960;
    outH = isLandscape ? 920 : 1216;
  }

  const src = cv.imread(flatCanvas);
  const dst = new cv.Mat();
  const srcQuad = cv.matFromArray(4, 1, cv.CV_32FC2, [
    0, 0,
    flatCanvas.width - 1, 0,
    flatCanvas.width - 1, flatCanvas.height - 1,
    0, flatCanvas.height - 1
  ]);

  let relQuad;
  if (condition === 'perfect') {
    relQuad = [
      { x: 0.04, y: 0.04 },
      { x: 0.96, y: 0.04 },
      { x: 0.96, y: 0.96 },
      { x: 0.04, y: 0.96 }
    ];
  } else if (condition === 'highres') {
    // Stronger perspective trapezoid
    relQuad = isLandscape
      ? [
          { x: 0.10, y: 0.09 },
          { x: 0.91, y: 0.04 },
          { x: 0.97, y: 0.93 },
          { x: 0.04, y: 0.88 }
        ]
      : [
          { x: 0.17, y: 0.08 },
          { x: 0.87, y: 0.04 },
          { x: 0.96, y: 0.95 },
          { x: 0.05, y: 0.90 }
        ];
  } else {
    relQuad = isLandscape
      ? [
          { x: 0.075, y: 0.08 },
          { x: 0.934, y: 0.056 },
          { x: 0.96, y: 0.93 },
          { x: 0.05, y: 0.893 }
        ]
      : [
          { x: 0.162, y: 0.076 },
          { x: 0.885, y: 0.041 },
          { x: 0.941, y: 0.946 },
          { x: 0.061, y: 0.907 }
        ];
  }

  const quad = relQuad.map((p) => ({ x: Math.round(p.x * outW), y: Math.round(p.y * outH) }));
  const dstQuad = cv.matFromArray(4, 1, cv.CV_32FC2, quad.flatMap((p) => [p.x, p.y]));
  const M = cv.getPerspectiveTransform(srcQuad, dstQuad);
  const outCanvas = document.createElement('canvas');
  outCanvas.width = outW;
  outCanvas.height = outH;

  try {
    cv.warpPerspective(
      src,
      dst,
      M,
      new cv.Size(outW, outH),
      cv.INTER_LINEAR,
      cv.BORDER_CONSTANT,
      new cv.Scalar(33, 39, 47, 255)
    );
    cv.imshow(outCanvas, dst);
    applyCaptureCondition(outCanvas, condition, seed);
    return { canvas: outCanvas, documentQuad: quad };
  } finally {
    src.delete();
    dst.delete();
    srcQuad.delete();
    dstQuad.delete();
    M.delete();
    flatCanvas.width = 1;
    flatCanvas.height = 1;
  }
}

/* ========================= SHEET GENERATORS ========================= */

function createEnemVerticalSheet({ withAnomalies = false } = {}) {
  const w = 1160;
  const h = 1640;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { alpha: false });
  const rng = seededRng(2048);
  const labels = getOptionLabels('upper', 5);
  const answers = Array.from({ length: 30 }, (_, i) => labels[(i * 3 + 1) % 5]);

  ctx.fillStyle = '#fbfaf5';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#20242c';
  ctx.lineWidth = 3;
  ctx.strokeRect(30, 30, 1100, 1580);
  ctx.fillStyle = '#111820';
  [[52, 52], [1086, 52], [52, 1566], [1086, 1566]].forEach(([x, y]) => ctx.fillRect(x, y, 22, 22));

  ctx.font = '700 34px Arial, sans-serif';
  ctx.fillText('FOLHA DE RESPOSTAS', 90, 120);
  ctx.font = '500 16px Arial, sans-serif';
  ctx.fillStyle = '#5a616b';
  ctx.fillText(withAnomalies ? 'VERTICAL BOLHAS A–E · COM CASOS ESPECIAIS' : 'VERTICAL BOLHAS A–E · 30 QUESTÕES', 90, 153);
  ctx.strokeStyle = '#c5c8c5';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(90, 185);
  ctx.lineTo(1070, 185);
  ctx.stroke();

  const expectedSpecial = withAnomalies ? { 8: 'blank', 12: 'multiple', 17: 'ambiguous' } : {};

  [90, 620].forEach((colX, colIdx) => {
    ctx.fillStyle = '#e8e7df';
    ctx.fillRect(colX - 18, 255, 454, 32);
    ctx.fillStyle = '#242a32';
    ctx.font = '700 13px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(colIdx === 0 ? 'QUESTÕES 01–15' : 'QUESTÕES 16–30', colX, 276);

    for (let r = 0; r < 15; r += 1) {
      const q = colIdx * 15 + r + 1;
      const cy = 302 + r * 77;
      ctx.fillStyle = r % 2 ? '#f5f4ed' : '#fbfaf5';
      ctx.fillRect(colX - 18, cy - 29, 454, 58);
      ctx.fillStyle = '#222831';
      ctx.font = '700 17px Arial, sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(q).padStart(2, '0'), colX + 34, cy);

      for (let o = 0; o < 5; o += 1) {
        const cx = colX + 98 + o * 62;
        ctx.strokeStyle = '#343b45';
        ctx.lineWidth = 2.5;
        ctx.fillStyle = '#fbfaf5';
        ctx.beginPath();
        ctx.ellipse(cx, cy, 17, 17, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#59616c';
        ctx.font = '600 11px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(labels[o], cx, cy + 0.5);
      }

      if (withAnomalies && q === 8) continue;
      if (withAnomalies && q === 12) {
        drawMark(ctx, colX + 98, cy, 17, 'filled', rng);
        drawMark(ctx, colX + 98 + 124, cy, 17, 'filled', rng);
        continue;
      }
      const idx = labels.indexOf(answers[q - 1]);
      const cx = colX + 98 + idx * 62;
      if (withAnomalies && q === 17) drawMark(ctx, cx, cy, 17, 'faint', rng);
      else if (q === 22 || q === 5) drawMark(ctx, cx, cy, 17, 'x-mark', rng);
      else drawMark(ctx, cx, cy, 17, 'filled', rng);
    }
  });

  return {
    canvas,
    answers,
    expectedSpecial,
    questionCount: 30,
    optionCount: 5,
    optionScheme: 'upper',
    orientation: 'vertical',
    markStyle: 'auto',
    isLandscape: false
  };
}

function createVerticalBoxesSheet() {
  const w = 1160;
  const h = 1600;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { alpha: false });
  const rng = seededRng(3102);
  const labels = getOptionLabels('upper', 4);
  const answers = Array.from({ length: 20 }, (_, i) => labels[(i * 3 + 0) % 4]);

  ctx.fillStyle = '#fbfaf5';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#20242c';
  ctx.lineWidth = 3;
  ctx.strokeRect(30, 30, w - 60, h - 60);

  ctx.fillStyle = '#111820';
  ctx.font = '700 32px Arial, sans-serif';
  ctx.fillText('GABARITO VERTICAL · QUADRADOS A–D', 86, 118);
  ctx.font = '500 16px Arial, sans-serif';
  ctx.fillStyle = '#5a616b';
  ctx.fillText('20 QUESTÕES · CAIXAS COM PREENCHIMENTO E X', 86, 150);

  [110, 625].forEach((colX, cIdx) => {
    for (let r = 0; r < 10; r += 1) {
      const q = cIdx * 10 + r + 1;
      const cy = 285 + r * 112;
      ctx.fillStyle = '#1d2430';
      ctx.font = '700 20px Arial, sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(q).padStart(2, '0'), colX + 34, cy);

      for (let o = 0; o < 4; o += 1) {
        const cx = colX + 112 + o * 90;
        const size = 38;
        ctx.strokeStyle = '#2e3540';
        ctx.lineWidth = 2.6;
        ctx.fillStyle = '#fbfaf5';
        ctx.fillRect(cx - size / 2, cy - size / 2, size, size);
        ctx.strokeRect(cx - size / 2, cy - size / 2, size, size);
        ctx.fillStyle = '#606875';
        ctx.font = '600 14px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(labels[o], cx, cy + 0.5);
      }

      const idx = labels.indexOf(answers[q - 1]);
      const cx = colX + 112 + idx * 90;
      drawMark(ctx, cx, cy, 18, q % 2 === 0 ? 'x-mark' : 'filled', rng);
    }
  });

  return {
    canvas,
    answers,
    expectedSpecial: {},
    questionCount: 20,
    optionCount: 4,
    optionScheme: 'upper',
    orientation: 'vertical',
    markStyle: 'auto',
    isLandscape: false
  };
}

function createHorizontalTableSheet() {
  const w = 1560;
  const h = 1100;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { alpha: false });
  const rng = seededRng(4096);
  const labels = getOptionLabels('upper', 4);
  const answers = Array.from({ length: 20 }, (_, i) => labels[(i * 3 + 2) % 4]);

  ctx.fillStyle = '#fbfaf5';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#20242c';
  ctx.lineWidth = 3;
  ctx.strokeRect(28, 28, w - 56, h - 56);
  ctx.fillStyle = '#111820';
  ctx.font = '700 32px Arial, sans-serif';
  ctx.fillText('GABARITO HORIZONTAL (TABELA TRANSPOSTA)', 84, 108);
  ctx.font = '500 16px Arial, sans-serif';
  ctx.fillStyle = '#5a616b';
  ctx.fillText('20 QUESTÕES EM 2 FAIXAS · ALTERNATIVAS A–D NA VERTICAL', 84, 140);

  const cellW = 118;
  const cellH = 66;
  const startX = 190;
  const bandYs = [220, 620];

  bandYs.forEach((bandY, bIdx) => {
    ctx.strokeStyle = '#2a313c';
    ctx.lineWidth = 2.4;
    ctx.fillStyle = '#eceae2';
    ctx.fillRect(startX, bandY, cellW * 10, cellH);

    ctx.font = '700 20px Arial, sans-serif';
    ctx.fillStyle = '#222831';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let o = 0; o < 4; o += 1) {
      ctx.fillText(labels[o], startX - 44, bandY + (o + 1.5) * cellH);
    }

    for (let col = 0; col < 10; col += 1) {
      const qNum = bIdx * 10 + col + 1;
      const x = startX + col * cellW;
      ctx.strokeRect(x, bandY, cellW, cellH);
      ctx.fillStyle = '#1f252e';
      ctx.font = '700 20px Arial, sans-serif';
      ctx.fillText(String(qNum).padStart(2, '0'), x + cellW / 2, bandY + cellH / 2);

      for (let o = 0; o < 4; o += 1) {
        const y = bandY + (o + 1) * cellH;
        ctx.strokeRect(x, y, cellW, cellH);
        ctx.fillStyle = '#6c7480';
        ctx.font = '600 16px Arial, sans-serif';
        ctx.fillText(labels[o], x + cellW / 2, y + cellH / 2);
      }

      const ansIdx = labels.indexOf(answers[qNum - 1]);
      const markX = x + cellW / 2;
      const markY = bandY + (ansIdx + 1.5) * cellH;
      drawMark(ctx, markX, markY, 22, qNum % 4 === 0 ? 'x-mark' : 'filled', rng);
    }
  });

  return {
    canvas,
    answers,
    expectedSpecial: {},
    questionCount: 20,
    optionCount: 4,
    optionScheme: 'upper',
    orientation: 'horizontal',
    markStyle: 'auto',
    isLandscape: true
  };
}

function createHorizontalBubblesSheet() {
  const w = 1560;
  const h = 1120;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { alpha: false });
  const rng = seededRng(4812);
  const labels = getOptionLabels('upper', 5);
  const answers = Array.from({ length: 16 }, (_, i) => labels[(i * 2 + 1) % 5]);

  ctx.fillStyle = '#fbfaf5';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#20242c';
  ctx.lineWidth = 3;
  ctx.strokeRect(28, 28, w - 56, h - 56);
  ctx.fillStyle = '#111820';
  ctx.font = '700 32px Arial, sans-serif';
  ctx.fillText('GABARITO HORIZONTAL · BOLHAS A–E', 84, 108);
  ctx.font = '500 16px Arial, sans-serif';
  ctx.fillStyle = '#5a616b';
  ctx.fillText('16 QUESTÕES EM 2 FAIXAS · ALTERNATIVAS EMPILHADAS NA VERTICAL', 84, 140);

  const startX = 220;
  const colStep = 152;
  const bandYs = [250, 665];
  const optStep = 64;

  bandYs.forEach((bandY, bIdx) => {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let o = 0; o < 5; o += 1) {
      ctx.fillStyle = '#242a32';
      ctx.font = '700 18px Arial, sans-serif';
      ctx.fillText(labels[o], startX - 75, bandY + o * optStep);
    }

    for (let col = 0; col < 8; col += 1) {
      const qNum = bIdx * 8 + col + 1;
      const cx = startX + col * colStep;
      ctx.fillStyle = '#1b222c';
      ctx.font = '700 20px Arial, sans-serif';
      ctx.fillText(String(qNum).padStart(2, '0'), cx, bandY - 52);

      for (let o = 0; o < 5; o += 1) {
        const cy = bandY + o * optStep;
        ctx.strokeStyle = '#343b45';
        ctx.lineWidth = 2.6;
        ctx.fillStyle = '#fbfaf5';
        ctx.beginPath();
        ctx.ellipse(cx, cy, 20, 20, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#5f6772';
        ctx.font = '600 13px Arial, sans-serif';
        ctx.fillText(labels[o], cx, cy + 0.5);
      }

      const ansIdx = labels.indexOf(answers[qNum - 1]);
      const cy = bandY + ansIdx * optStep;
      drawMark(ctx, cx, cy, 20, qNum % 3 === 0 ? 'x-mark' : 'filled', rng);
    }
  });

  return {
    canvas,
    answers,
    expectedSpecial: {},
    questionCount: 16,
    optionCount: 5,
    optionScheme: 'upper',
    orientation: 'horizontal',
    markStyle: 'auto',
    isLandscape: true
  };
}

function createParenthesesLowerSheet() {
  const w = 1160;
  const h = 1600;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { alpha: false });
  const rng = seededRng(5120);
  const labels = getOptionLabels('lower', 4);
  const answers = Array.from({ length: 20 }, (_, i) => labels[(i * 5 + 1) % 4]);

  ctx.fillStyle = '#fbfaf5';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#222831';
  ctx.lineWidth = 3;
  ctx.strokeRect(30, 30, w - 60, h - 60);
  ctx.fillStyle = '#111820';
  ctx.font = '700 32px Arial, sans-serif';
  ctx.fillText('GABARITO COM PARÊNTESES (a) (b) (c) (d)', 86, 118);
  ctx.font = '500 16px Arial, sans-serif';
  ctx.fillStyle = '#5a616b';
  ctx.fillText('20 QUESTÕES · MARCAÇÃO EM X E PREENCHIMENTO', 86, 150);

  [105, 625].forEach((colX, cIdx) => {
    for (let r = 0; r < 10; r += 1) {
      const q = cIdx * 10 + r + 1;
      const cy = 280 + r * 110;
      ctx.fillStyle = '#1d2430';
      ctx.font = '700 22px Arial, sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${String(q).padStart(2, '0')}.`, colX + 38, cy);

      for (let o = 0; o < 4; o += 1) {
        const cx = colX + 115 + o * 92;
        ctx.fillStyle = '#28303d';
        ctx.font = '600 26px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`(${labels[o]})`, cx, cy);
      }

      const idx = labels.indexOf(answers[q - 1]);
      const cx = colX + 115 + idx * 92;
      drawMark(ctx, cx, cy, 20, q % 2 === 0 ? 'x-mark' : 'filled', rng);
    }
  });

  return {
    canvas,
    answers,
    expectedSpecial: {},
    questionCount: 20,
    optionCount: 4,
    optionScheme: 'lower',
    orientation: 'vertical',
    markStyle: 'delimited',
    isLandscape: false
  };
}

function createEmptyParenthesesSheet() {
  const w = 1160;
  const h = 1600;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { alpha: false });
  const rng = seededRng(6122);
  const labels = getOptionLabels('upper', 4);
  const answers = Array.from({ length: 20 }, (_, i) => labels[(i * 3 + 1) % 4]);

  ctx.fillStyle = '#fbfaf5';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#222831';
  ctx.lineWidth = 3;
  ctx.strokeRect(30, 30, w - 60, h - 60);
  ctx.fillStyle = '#111820';
  ctx.font = '700 32px Arial, sans-serif';
  ctx.fillText('GABARITO COM PARÊNTESES VAZIOS (   )', 86, 118);
  ctx.font = '500 16px Arial, sans-serif';
  ctx.fillStyle = '#5a616b';
  ctx.fillText('20 QUESTÕES · CABEÇALHO A B C D · MARCAÇÃO EM X E PREENCHIMENTO', 86, 150);

  [105, 625].forEach((colX, cIdx) => {
    // Column headers A B C D
    ctx.fillStyle = '#242a32';
    ctx.font = '700 20px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let o = 0; o < 4; o += 1) {
      ctx.fillText(labels[o], colX + 115 + o * 92, 224);
    }

    for (let r = 0; r < 10; r += 1) {
      const q = cIdx * 10 + r + 1;
      const cy = 288 + r * 108;
      ctx.fillStyle = '#1d2430';
      ctx.font = '700 20px Arial, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(String(q).padStart(2, '0'), colX + 34, cy);

      for (let o = 0; o < 4; o += 1) {
        const cx = colX + 115 + o * 92;
        ctx.fillStyle = '#28303d';
        ctx.font = '600 28px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('(   )', cx, cy);
      }

      const idx = labels.indexOf(answers[q - 1]);
      const cx = colX + 115 + idx * 92;
      drawMark(ctx, cx, cy, 18, q % 2 === 1 ? 'x-mark' : 'filled', rng);
    }
  });

  return {
    canvas,
    answers,
    expectedSpecial: {},
    questionCount: 20,
    optionCount: 4,
    optionScheme: 'upper',
    orientation: 'vertical',
    markStyle: 'delimited',
    isLandscape: false
  };
}

function createQuotesRomanSheet() {
  const w = 1160;
  const h = 1600;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { alpha: false });
  const rng = seededRng(7777);
  const labels = getOptionLabels('roman', 5);
  const answers = Array.from({ length: 15 }, (_, i) => labels[(i * 2 + 1) % 5]);

  ctx.fillStyle = '#fbfaf5';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#222831';
  ctx.lineWidth = 3;
  ctx.strokeRect(30, 30, w - 60, h - 60);
  ctx.fillStyle = '#111820';
  ctx.font = '700 32px Arial, sans-serif';
  ctx.fillText('GABARITO ROMANO COM ASPAS "I"–"V"', 86, 118);
  ctx.font = '500 16px Arial, sans-serif';
  ctx.fillStyle = '#5a616b';
  ctx.fillText('15 QUESTÕES · CÍRCULO MANUAL, X E PREENCHIMENTO', 86, 150);

  for (let r = 0; r < 15; r += 1) {
    const q = r + 1;
    const cy = 250 + r * 84;
    ctx.fillStyle = '#1d2430';
    ctx.font = '700 22px Arial, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${String(q).padStart(2, '0')}`, 175, cy);

    for (let o = 0; o < 5; o += 1) {
      const cx = 290 + o * 165;
      ctx.fillStyle = '#28303d';
      ctx.font = '600 26px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText(`"${labels[o]}"`, cx, cy);
    }

    const idx = labels.indexOf(answers[q - 1]);
    const cx = 290 + idx * 165;
    const style = q % 3 === 0 ? 'circled' : q % 3 === 1 ? 'x-mark' : 'filled';
    drawMark(ctx, cx, cy, 24, style, rng);
  }

  return {
    canvas,
    answers,
    expectedSpecial: {},
    questionCount: 15,
    optionCount: 5,
    optionScheme: 'roman',
    orientation: 'vertical',
    markStyle: 'delimited',
    isLandscape: false
  };
}

function createPlainLowerSheet() {
  const w = 1160;
  const h = 1600;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { alpha: false });
  const rng = seededRng(8421);
  const labels = getOptionLabels('lower', 4);
  const answers = Array.from({ length: 16 }, (_, i) => labels[(i * 3 + 2) % 4]);

  ctx.fillStyle = '#fbfaf5';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#222831';
  ctx.lineWidth = 3;
  ctx.strokeRect(30, 30, w - 60, h - 60);
  ctx.fillStyle = '#111820';
  ctx.font = '700 32px Arial, sans-serif';
  ctx.fillText('GABARITO LETRAS SOLTAS a  b  c  d', 86, 118);
  ctx.font = '500 16px Arial, sans-serif';
  ctx.fillStyle = '#5a616b';
  ctx.fillText('16 QUESTÕES · MARCAÇÃO EM X E CÍRCULO MANUAL', 86, 150);

  [110, 620].forEach((colX, cIdx) => {
    for (let r = 0; r < 8; r += 1) {
      const q = cIdx * 8 + r + 1;
      const cy = 295 + r * 140;
      ctx.fillStyle = '#1d2430';
      ctx.font = '700 22px Arial, sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${String(q).padStart(2, '0')})`, colX + 34, cy);

      for (let o = 0; o < 4; o += 1) {
        const cx = colX + 120 + o * 94;
        ctx.fillStyle = '#28303d';
        ctx.font = '700 28px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(labels[o], cx, cy);
      }

      const idx = labels.indexOf(answers[q - 1]);
      const cx = colX + 120 + idx * 94;
      drawMark(ctx, cx, cy, 22, q % 2 === 0 ? 'circled' : 'x-mark', rng);
    }
  });

  return {
    canvas,
    answers,
    expectedSpecial: {},
    questionCount: 16,
    optionCount: 4,
    optionScheme: 'lower',
    orientation: 'vertical',
    markStyle: 'plain',
    isLandscape: false
  };
}

function createVFVerticalSheet() {
  const w = 1160;
  const h = 1600;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { alpha: false });
  const rng = seededRng(9090);
  const labels = getOptionLabels('vf', 2);
  const answers = Array.from({ length: 20 }, (_, i) => labels[(i * 7 + (i % 3)) % 2]);

  ctx.fillStyle = '#fbfaf5';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#222831';
  ctx.lineWidth = 3;
  ctx.strokeRect(30, 30, w - 60, h - 60);
  ctx.fillStyle = '#111820';
  ctx.font = '700 32px Arial, sans-serif';
  ctx.fillText('GABARITO VERDADEIRO OU FALSO (V / F)', 86, 118);
  ctx.font = '500 16px Arial, sans-serif';
  ctx.fillStyle = '#5a616b';
  ctx.fillText('20 ITENS · MARCAÇÃO EM BOLHA OU X', 86, 150);

  [140, 660].forEach((colX, cIdx) => {
    for (let r = 0; r < 10; r += 1) {
      const q = cIdx * 10 + r + 1;
      const cy = 285 + r * 108;
      ctx.fillStyle = '#1d2430';
      ctx.font = '700 22px Arial, sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(q).padStart(2, '0'), colX + 36, cy);

      for (let o = 0; o < 2; o += 1) {
        const cx = colX + 130 + o * 115;
        ctx.strokeStyle = '#343b45';
        ctx.lineWidth = 2.6;
        ctx.fillStyle = '#fbfaf5';
        ctx.beginPath();
        ctx.ellipse(cx, cy, 22, 22, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#48505c';
        ctx.font = '700 16px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(labels[o], cx, cy + 1);
      }

      const idx = labels.indexOf(answers[q - 1]);
      const cx = colX + 130 + idx * 115;
      drawMark(ctx, cx, cy, 22, q % 3 === 0 ? 'x-mark' : 'filled', rng);
    }
  });

  return {
    canvas,
    answers,
    expectedSpecial: {},
    questionCount: 20,
    optionCount: 2,
    optionScheme: 'vf',
    orientation: 'vertical',
    markStyle: 'auto',
    isLandscape: false
  };
}

function createVFHorizontalTableSheet() {
  const w = 1560;
  const h = 1040;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { alpha: false });
  const rng = seededRng(9450);
  const labels = getOptionLabels('vf', 2);
  const answers = Array.from({ length: 16 }, (_, i) => labels[(i * 3 + Math.floor(i / 2)) % 2]);

  ctx.fillStyle = '#fbfaf5';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#20242c';
  ctx.lineWidth = 3;
  ctx.strokeRect(28, 28, w - 56, h - 56);
  ctx.fillStyle = '#111820';
  ctx.font = '700 32px Arial, sans-serif';
  ctx.fillText('GABARITO HORIZONTAL · VERDADEIRO OU FALSO', 84, 108);
  ctx.font = '500 16px Arial, sans-serif';
  ctx.fillStyle = '#5a616b';
  ctx.fillText('16 ITENS EM 2 FAIXAS · TABELA V / F NA VERTICAL', 84, 140);

  const cellW = 145;
  const cellH = 82;
  const startX = 210;
  const bandYs = [240, 620];

  bandYs.forEach((bandY, bIdx) => {
    ctx.strokeStyle = '#2a313c';
    ctx.lineWidth = 2.6;
    ctx.fillStyle = '#eceae2';
    ctx.fillRect(startX, bandY, cellW * 8, cellH);

    ctx.font = '700 22px Arial, sans-serif';
    ctx.fillStyle = '#222831';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let o = 0; o < 2; o += 1) {
      ctx.fillText(labels[o], startX - 48, bandY + (o + 1.5) * cellH);
    }

    for (let col = 0; col < 8; col += 1) {
      const qNum = bIdx * 8 + col + 1;
      const x = startX + col * cellW;
      ctx.strokeRect(x, bandY, cellW, cellH);
      ctx.fillStyle = '#1f252e';
      ctx.font = '700 22px Arial, sans-serif';
      ctx.fillText(String(qNum).padStart(2, '0'), x + cellW / 2, bandY + cellH / 2);

      for (let o = 0; o < 2; o += 1) {
        const y = bandY + (o + 1) * cellH;
        ctx.strokeRect(x, y, cellW, cellH);
        ctx.fillStyle = '#6c7480';
        ctx.font = '700 18px Arial, sans-serif';
        ctx.fillText(labels[o], x + cellW / 2, y + cellH / 2);
      }

      const ansIdx = labels.indexOf(answers[qNum - 1]);
      const markX = x + cellW / 2;
      const markY = bandY + (ansIdx + 1.5) * cellH;
      drawMark(ctx, markX, markY, 26, qNum % 3 === 0 ? 'x-mark' : 'filled', rng);
    }
  });

  return {
    canvas,
    answers,
    expectedSpecial: {},
    questionCount: 16,
    optionCount: 2,
    optionScheme: 'vf',
    orientation: 'horizontal',
    markStyle: 'auto',
    isLandscape: true
  };
}

function createCEParenthesesSheet() {
  const w = 1160;
  const h = 1600;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { alpha: false });
  const rng = seededRng(9988);
  const labels = getOptionLabels('ce', 2);
  const answers = Array.from({ length: 20 }, (_, i) => labels[(i + Math.floor(i / 3)) % 2]);

  ctx.fillStyle = '#fbfaf5';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#222831';
  ctx.lineWidth = 3;
  ctx.strokeRect(30, 30, w - 60, h - 60);
  ctx.fillStyle = '#111820';
  ctx.font = '700 32px Arial, sans-serif';
  ctx.fillText('GABARITO CERTO OU ERRADO (C) (E)', 86, 118);
  ctx.font = '500 16px Arial, sans-serif';
  ctx.fillStyle = '#5a616b';
  ctx.fillText('20 ITENS · PARÊNTESES COM X E PREENCHIMENTO', 86, 150);

  [145, 665].forEach((colX, cIdx) => {
    for (let r = 0; r < 10; r += 1) {
      const q = cIdx * 10 + r + 1;
      const cy = 285 + r * 108;
      ctx.fillStyle = '#1d2430';
      ctx.font = '700 22px Arial, sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(q).padStart(2, '0'), colX + 36, cy);

      for (let o = 0; o < 2; o += 1) {
        const cx = colX + 135 + o * 125;
        ctx.fillStyle = '#28303d';
        ctx.font = '600 28px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`(${labels[o]})`, cx, cy);
      }

      const idx = labels.indexOf(answers[q - 1]);
      const cx = colX + 135 + idx * 125;
      drawMark(ctx, cx, cy, 22, q % 2 === 0 ? 'x-mark' : 'filled', rng);
    }
  });

  return {
    canvas,
    answers,
    expectedSpecial: {},
    questionCount: 20,
    optionCount: 2,
    optionScheme: 'ce',
    orientation: 'vertical',
    markStyle: 'delimited',
    isLandscape: false
  };
}

/* ========================= CURATED 22-CASE TEST MATRIX ========================= */

export const DEMO_PRESETS = Object.freeze([
  // Vertical Bolhas & Caixas (condições variadas)
  { id: 'enem-perfect', group: 'Vertical · Bolhas e Caixas', label: 'Bolhas A–E · Perfeita (estúdio)', generator: 'enem-clean', condition: 'perfect' },
  { id: 'enem-vertical', group: 'Vertical · Bolhas e Caixas', label: 'Bolhas A–E (branco/múltipla/fraca/X) · Mediana', generator: 'enem-anomalies', condition: 'medium' },
  { id: 'enem-shadow', group: 'Vertical · Bolhas e Caixas', label: 'Bolhas A–E · Sombra forte', generator: 'enem-clean', condition: 'shadow' },
  { id: 'enem-bright', group: 'Vertical · Bolhas e Caixas', label: 'Bolhas A–E · Claridade alta (superexposta)', generator: 'enem-clean', condition: 'bright' },
  { id: 'enem-dark', group: 'Vertical · Bolhas e Caixas', label: 'Bolhas A–E · Baixa claridade (escura)', generator: 'enem-clean', condition: 'dark' },
  { id: 'enem-lowres', group: 'Vertical · Bolhas e Caixas', label: 'Bolhas A–E · Baixa definição / desfocada', generator: 'enem-clean', condition: 'lowres' },
  { id: 'boxes-vertical-highres', group: 'Vertical · Bolhas e Caixas', label: 'Quadrados ☐ A–D · Alta def. + inclinação', generator: 'vertical-boxes', condition: 'highres' },

  // Gabaritos Horizontais (transpostos)
  { id: 'horizontal-table-perfect', group: 'Horizontal (opções na vertical)', label: 'Tabela A–D · Perfeita', generator: 'horizontal-table', condition: 'perfect' },
  { id: 'horizontal-table', group: 'Horizontal (opções na vertical)', label: 'Tabela A–D · Mediana', generator: 'horizontal-table', condition: 'medium' },
  { id: 'horizontal-table-shadow', group: 'Horizontal (opções na vertical)', label: 'Tabela A–D · Sombra forte', generator: 'horizontal-table', condition: 'shadow' },
  { id: 'horizontal-bubbles-medium', group: 'Horizontal (opções na vertical)', label: 'Bolhas A–E · Mediana', generator: 'horizontal-bubbles', condition: 'medium' },

  // Parênteses, Aspas, Minúsculas e Romanos
  { id: 'parentheses-lower-perfect', group: 'Parênteses, Aspas, a–d e Romanos', label: 'Parênteses (a–d) com X · Perfeita', generator: 'parentheses-lower', condition: 'perfect' },
  { id: 'parentheses-lower', group: 'Parênteses, Aspas, a–d e Romanos', label: 'Parênteses (a–d) com X · Mediana', generator: 'parentheses-lower', condition: 'medium' },
  { id: 'parentheses-lower-shadow', group: 'Parênteses, Aspas, a–d e Romanos', label: 'Parênteses (a–d) · Sombra forte', generator: 'parentheses-lower', condition: 'shadow' },
  { id: 'parentheses-empty-medium', group: 'Parênteses, Aspas, a–d e Romanos', label: 'Parênteses vazios ( ) A–D · Mediana', generator: 'parentheses-empty', condition: 'medium' },
  { id: 'quotes-roman', group: 'Parênteses, Aspas, a–d e Romanos', label: 'Aspas + Romanos "I"–"V" · Mediana', generator: 'quotes-roman', condition: 'medium' },
  { id: 'quotes-roman-bright', group: 'Parênteses, Aspas, a–d e Romanos', label: 'Aspas + Romanos "I"–"V" · Muito clara', generator: 'quotes-roman', condition: 'bright' },
  { id: 'plain-lower-medium', group: 'Parênteses, Aspas, a–d e Romanos', label: 'Letras soltas a b c d (X/círculo) · Mediana', generator: 'plain-lower', condition: 'medium' },

  // Verdadeiro/Falso e Certo/Errado (2 opções)
  { id: 'vf-vertical', group: 'Verdadeiro/Falso e Certo/Errado', label: 'V / F vertical bolhas · Mediana', generator: 'vf-vertical', condition: 'medium' },
  { id: 'vf-vertical-dark', group: 'Verdadeiro/Falso e Certo/Errado', label: 'V / F vertical bolhas · Escura', generator: 'vf-vertical', condition: 'dark' },
  { id: 'vf-horizontal-medium', group: 'Verdadeiro/Falso e Certo/Errado', label: 'V / F horizontal tabela · Mediana', generator: 'vf-horizontal', condition: 'medium' },
  { id: 'ce-parentheses-lowres', group: 'Verdadeiro/Falso e Certo/Errado', label: 'Certo/Errado (C)(E) · Baixa definição', generator: 'ce-parentheses', condition: 'lowres' }
]);

function buildRawSheet(generatorName) {
  switch (generatorName) {
    case 'enem-anomalies':
      return createEnemVerticalSheet({ withAnomalies: true });
    case 'enem-clean':
      return createEnemVerticalSheet({ withAnomalies: false });
    case 'vertical-boxes':
      return createVerticalBoxesSheet();
    case 'horizontal-table':
      return createHorizontalTableSheet();
    case 'horizontal-bubbles':
      return createHorizontalBubblesSheet();
    case 'parentheses-lower':
      return createParenthesesLowerSheet();
    case 'parentheses-empty':
      return createEmptyParenthesesSheet();
    case 'quotes-roman':
      return createQuotesRomanSheet();
    case 'plain-lower':
      return createPlainLowerSheet();
    case 'vf-vertical':
      return createVFVerticalSheet();
    case 'vf-horizontal':
      return createVFHorizontalTableSheet();
    case 'ce-parentheses':
      return createCEParenthesesSheet();
    default:
      return createEnemVerticalSheet({ withAnomalies: true });
  }
}

export function getDemoPresetMeta(presetId) {
  return DEMO_PRESETS.find((p) => p.id === presetId) || DEMO_PRESETS[1];
}

export function generateDemoPhoto(cv, presetId = 'enem-vertical') {
  const preset = getDemoPresetMeta(presetId);
  const raw = buildRawSheet(preset.generator);
  const seed = preset.id.split('').reduce((acc, ch) => acc * 31 + ch.charCodeAt(0), 17);
  const warped = warpSheetAsPhoto(cv, raw.canvas, {
    isLandscape: raw.isLandscape,
    condition: preset.condition,
    seed
  });

  return {
    canvas: warped.canvas,
    documentQuad: warped.documentQuad,
    answers: raw.answers,
    expectedSpecial: raw.expectedSpecial || {},
    answerKeyText: raw.answers.map((ans, idx) => `${idx + 1} ${ans}`).join('\n'),
    questionCount: raw.questionCount,
    optionCount: raw.optionCount,
    optionScheme: raw.optionScheme,
    orientation: raw.orientation,
    markStyle: raw.markStyle,
    condition: preset.condition,
    conditionLabel: CAPTURE_CONDITIONS[preset.condition]?.label || preset.condition,
    presetLabel: preset.label,
    presetGroup: preset.group,
    presetId: preset.id
  };
}
