import { clamp, mean, percentile } from '../utils/math.js';

function laplacianVariance(grayMat) {
  const step = Math.max(1, Math.floor(Math.min(grayMat.cols, grayMat.rows) / 720));
  const values = [];
  for (let y = step; y < grayMat.rows - step; y += step) {
    for (let x = step; x < grayMat.cols - step; x += step) {
      const center = grayMat.data[y * grayMat.cols + x];
      const left = grayMat.data[y * grayMat.cols + x - step];
      const right = grayMat.data[y * grayMat.cols + x + step];
      const up = grayMat.data[(y - step) * grayMat.cols + x];
      const down = grayMat.data[(y + step) * grayMat.cols + x];
      values.push(left + right + up + down - center * 4);
    }
  }
  const avg = mean(values);
  return mean(values.map((v) => (v - avg) ** 2));
}

function lightingUniformity(grayMat) {
  const cells = [];
  for (let r = 0; r < 8; r += 1) {
    for (let c = 0; c < 6; c += 1) {
      const x1 = Math.floor((c / 6) * grayMat.cols);
      const x2 = Math.floor(((c + 1) / 6) * grayMat.cols);
      const y1 = Math.floor((r / 8) * grayMat.rows);
      const y2 = Math.floor(((r + 1) / 8) * grayMat.rows);
      const samples = [];
      const step = Math.max(1, Math.floor(Math.min(x2 - x1, y2 - y1) / 24));
      for (let y = y1; y < y2; y += step) {
        for (let x = x1; x < x2; x += step) {
          samples.push(grayMat.data[y * grayMat.cols + x]);
        }
      }
      cells.push(percentile(samples, 0.72));
    }
  }
  const spread = percentile(cells, 0.9) - percentile(cells, 0.1);
  return {
    score: clamp(1 - Math.max(0, spread - 12) / 92),
    spread,
    darkestCell: Math.min(...cells),
    brightestCell: Math.max(...cells)
  };
}

function normalizeSharpness(lapVar) {
  const lo = Math.log1p(14);
  const hi = Math.log1p(240);
  return clamp((Math.log1p(lapVar) - lo) / (hi - lo));
}

export class QualityEstimator {
  estimate({ preprocessed, documentConfidence, bubbleDetection, structure, classified }) {
    const sharpnessVariance = laplacianVariance(preprocessed.gray);
    const sharpness = normalizeSharpness(sharpnessVariance);
    const lightingStats = lightingUniformity(preprocessed.gray);
    const medianBrightness = preprocessed.diagnostics.medianBrightness;
    const exposureScore = clamp(1 - Math.abs(medianBrightness - 214) / 175);
    const clippingPenalty = clamp(
      preprocessed.diagnostics.darkClippingRatio * 2.8 + preprocessed.diagnostics.brightClippingRatio * 0.8
    );
    const lighting = clamp(lightingStats.score * 0.7 + exposureScore * 0.3 - clippingPenalty * 0.25);
    const perspective = clamp(documentConfidence);
    const rowDetection = clamp(structure.confidence);
    const bubbleDetectionScore = clamp(bubbleDetection.confidence * 0.38 + (structure.diagnostics.bubbleCoverage || 0) * 0.62);
    const classificationScore = clamp(classified.confidence);

    const overall = clamp(
      sharpness * 0.18 +
        lighting * 0.17 +
        perspective * 0.16 +
        rowDetection * 0.23 +
        bubbleDetectionScore * 0.2 +
        classificationScore * 0.06
    );

    const issues = [...(structure.diagnostics.warnings || [])];
    if (sharpness < 0.38) {
      issues.push('A foto está desfocada; refaça a captura mantendo o celular firme e paralelo à folha.');
    }
    if (lightingStats.score < 0.55) {
      issues.push('A iluminação varia muito ao longo da página; sombras podem afetar algumas questões.');
    }
    if (preprocessed.diagnostics.darkClippingRatio > 0.06) {
      issues.push('Há áreas muito escuras sem detalhe recuperável.');
    }
    if (perspective < 0.5) {
      issues.push('O contorno automático da página teve baixa confiança; confira o recorte manual.');
    }
    if (bubbleDetectionScore < 0.48) {
      issues.push('A repetição geométrica das alternativas está inconsistente.');
    }
    if (classified.lowConfidenceQuestions.length) {
      issues.push(`${classified.lowConfidenceQuestions.length} questão(ões) possuem baixa confiança e foram separadas para revisão.`);
    }
    if (!issues.length) {
      issues.push('Não foram encontrados problemas relevantes nesta leitura.');
    }

    return {
      overall,
      components: {
        sharpness,
        lighting,
        perspective,
        rowDetection,
        bubbleDetection: bubbleDetectionScore
      },
      diagnostics: {
        sharpnessVariance,
        lightingSpread: lightingStats.spread,
        medianBrightness,
        darkClippingRatio: preprocessed.diagnostics.darkClippingRatio,
        brightClippingRatio: preprocessed.diagnostics.brightClippingRatio,
        lowConfidenceQuestions: classified.lowConfidenceQuestions
      },
      issues
    };
  }
}
