import { clamp, mad, mean, median, percentile, relativeStd, sigmoid, stdDev } from '../utils/math.js';

function pixelAt(mat, x, y) {
  return mat.data[y * mat.cols + x];
}

function safeMedian(arr, fallback) {
  return arr.length ? median(arr) : fallback;
}

function measureBubble(
  gray,
  normalized,
  adaptive,
  inkDelta,
  bubble,
  fallbackDiameter,
  shapeKind,
  slotRadii = null,
  optionGap = 0
) {
  const baseRx = slotRadii?.rx ?? bubble.radiusX ?? fallbackDiameter / 2;
  const baseRy = slotRadii?.ry ?? bubble.radiusY ?? fallbackDiameter / 2;
  const rx = clamp(baseRx, fallbackDiameter * 0.34, fallbackDiameter * 1.05);
  const ry = clamp(baseRy, fallbackDiameter * 0.34, fallbackDiameter * 1.05);
  const isBox = shapeKind === 'box' || bubble.shapeKind === 'box';
  const isOpen =
    shapeKind === 'delimited' ||
    shapeKind === 'plain' ||
    bubble.shapeKind === 'delimited' ||
    bubble.shapeKind === 'plain';
  const isWideBox = isBox && (rx / Math.max(1, ry) > 1.28 || ry / Math.max(1, rx) > 1.28);
  const coreR = Math.min(rx, ry) * 0.88;

  // For open symbols like "I" or small lowercase "a"/"b"/"c"/"d", a hand-drawn circle
  // scales with the available spacing around the character (~0.24 * optionGap) rather than just tiny x-height!
  const gapScaledHalo = optionGap > 0 ? optionGap * 0.24 : fallbackDiameter * 0.62;
  const maxSafeHalo = optionGap > 0 ? (optionGap * 0.46) / 1.54 : fallbackDiameter * 0.95;
  const haloRx = isOpen ? Math.min(maxSafeHalo, Math.max(rx, ry, gapScaledHalo)) : rx;
  const haloRy = isOpen ? Math.min(maxSafeHalo, Math.max(ry, rx * 0.85, gapScaledHalo)) : ry;

  const spanX = isOpen ? Math.max(rx * 2.1, haloRx * 2.05) : isBox ? rx * 1.48 : rx * 1.75;
  const spanY = isOpen ? Math.max(ry * 2.1, haloRy * 2.05) : isBox ? ry * 1.48 : ry * 1.75;

  const xMin = Math.max(0, Math.floor(bubble.centerX - spanX));
  const xMax = Math.min(gray.cols - 1, Math.ceil(bubble.centerX + spanX));
  const yMin = Math.max(0, Math.floor(bubble.centerY - spanY));
  const yMax = Math.min(gray.rows - 1, Math.ceil(bubble.centerY + spanY));

  const samples = {
    inner: [],
    innerNorm: [],
    innerBinary: [],
    innerDelta: [],
    core: [],
    coreNorm: [],
    coreBinary: [],
    coreDelta: [],
    center: [],
    edge: [],
    background: [],
    backgroundNorm: [],
    bgQuads: [[], [], [], []],
    bgNormQuads: [[], [], [], []],
    diagonal: [],
    quadrants: [[], [], [], []],
    halo: [],
    haloQuads: [[], [], [], []]
  };

  for (let y = yMin; y <= yMax; y += 1) {
    const dy = y - bubble.centerY;
    const sy = dy / ry;
    const hsy = dy / haloRy;
    for (let x = xMin; x <= xMax; x += 1) {
      const dx = x - bubble.centerX;
      const sx = dx / rx;
      const hsx = dx / haloRx;
      const dist = Math.hypot(sx, sy);
      const haloDist = Math.hypot(hsx, hsy);
      const boxDist = Math.max(Math.abs(sx), Math.abs(sy));
      const gVal = pixelAt(gray, x, y);
      const nVal = pixelAt(normalized, x, y);
      const aVal = Number(pixelAt(adaptive, x, y) > 0);
      const dVal = pixelAt(inkDelta, x, y);
      const qIdx = (dy >= 0 ? 2 : 0) + (dx >= 0 ? 1 : 0);

      const inInner = isBox ? boxDist <= 0.72 : isOpen ? dist <= 0.86 : dist <= 0.66;
      if (inInner) {
        samples.inner.push(gVal);
        samples.innerNorm.push(nVal);
        samples.innerBinary.push(aVal);
        samples.innerDelta.push(dVal);
        samples.quadrants[qIdx].push(gVal);

        if (Math.abs(Math.abs(sx) - Math.abs(sy)) <= 0.18 && dist >= 0.16) {
          samples.diagonal.push(gVal);
        }
      }

      if (isWideBox && Math.hypot(dx, dy) <= coreR) {
        samples.core.push(gVal);
        samples.coreNorm.push(nVal);
        samples.coreBinary.push(aVal);
        samples.coreDelta.push(dVal);
      }

      if (dist <= 0.34) {
        samples.center.push(gVal);
      }

      if (dist >= 0.78 && dist <= 1.12) {
        samples.edge.push(gVal);
      }

      // Outer halo captures hand-drawn circles around open symbols/letters
      const haloLo = isOpen ? 0.70 : 0.88;
      const haloHi = isOpen ? 1.52 : 1.36;
      if (haloDist >= haloLo && haloDist <= haloHi) {
        samples.halo.push(gVal);
        samples.haloQuads[qIdx].push(gVal);
      }

      // Local paper background ring
      let inBg = false;
      if (isBox) {
        inBg = boxDist >= 1.08 && boxDist <= 1.44;
      } else if (isOpen) {
        inBg = haloDist >= 1.58 && haloDist <= 1.98;
      } else {
        inBg = dist >= 1.24 && dist <= 1.72;
      }

      if (inBg) {
        samples.background.push(gVal);
        samples.backgroundNorm.push(nVal);
        samples.bgQuads[qIdx].push(gVal);
        samples.bgNormQuads[qIdx].push(nVal);
      }
    }
  }

  // Shadow-immune local paper brightness:
  // Take the 75th percentile inside each background quadrant, then take the MEDIAN across quadrants!
  // If a hard diagonal shadow passes right next to an empty cell, 1 sunny quadrant can NEVER pull up
  // the paper reference of a shaded cell.
  const quadBgPapers = samples.bgQuads
    .filter((q) => q.length >= 6)
    .map((q) => percentile(q, 0.75));
  const quadNormPapers = samples.bgNormQuads
    .filter((q) => q.length >= 6)
    .map((q) => percentile(q, 0.75));

  const rawBgPaper = samples.background.length ? percentile(samples.background, 0.76) : 225;
  let bgPaper = quadBgPapers.length >= 3 ? median(quadBgPapers) : rawBgPaper;

  // For rectangular table cells, the cell's own corner/margin bright pixels share the exact same shadow
  // plane as the cell interior; blend gently if the outer ring sits across a steep shadow step!
  if (isBox && samples.inner.length >= 20) {
    const innerBright = percentile(samples.inner, 0.88);
    if (bgPaper - innerBright > 22 && mean(samples.innerBinary) < 0.25) {
      bgPaper = innerBright;
    }
  }
  bgPaper = Math.max(70, bgPaper);

  const bgPaperNorm = Math.max(
    75,
    quadNormPapers.length >= 3
      ? median(quadNormPapers)
      : samples.backgroundNorm.length
        ? percentile(samples.backgroundNorm, 0.76)
        : 138
  );

  const bgMed = safeMedian(samples.background, bgPaper);
  const bgMad = Math.max(2, mad(samples.background, bgMed));

  const innerMed = safeMedian(samples.inner, bgPaper);
  const innerMean = samples.inner.length ? mean(samples.inner) : bgPaper;
  const innerNormMed = safeMedian(samples.innerNorm, bgPaperNorm);
  const innerNormMean = samples.innerNorm.length ? mean(samples.innerNorm) : bgPaperNorm;
  const centerMed = safeMedian(samples.center, innerMed);
  const centerMean = samples.center.length ? mean(samples.center) : innerMean;
  const edgeMed = safeMedian(samples.edge, bgPaper);

  const inkCutoff = bgPaper - Math.max(15, bgMad * 2.1);
  const darkPixelRatio = samples.inner.filter((v) => v < inkCutoff).length / Math.max(1, samples.inner.length);
  const adaptiveInkRatio = mean(samples.innerBinary);

  const inkRange = Math.max(95, bgPaper - 24);
  const normRange = Math.max(90, bgPaperNorm - 20);
  const softInkMean = clamp(mean(samples.innerDelta) / Math.max(78, inkRange * 0.64));

  const medianDarkness = clamp((bgPaper - innerMed) / inkRange);
  const meanDarkness = clamp((bgPaper - innerMean) / (inkRange * 0.9));
  const normDarkness = clamp((bgPaperNorm - innerNormMed) / normRange);
  const normMeanDarkness = clamp((bgPaperNorm - innerNormMean) / (normRange * 0.9));
  const centerDarkness = clamp((bgPaper - centerMean) / inkRange);
  const centerVsEdge = clamp((edgeMed - centerMed) / inkRange);
  const inkVariance = clamp(stdDev(samples.inner) / 72);

  const quadrantImbalance = clamp(
    relativeStd(samples.quadrants.map((q) => clamp((bgPaper - safeMedian(q, innerMed)) / inkRange))) / 1.25
  );
  const diagMean = samples.diagonal.length ? mean(samples.diagonal) : innerMean;
  const diagonalDarkness = clamp((bgPaper - diagMean) / (inkRange * 0.85));

  const crossPattern = clamp(
    Math.max(0, diagonalDarkness - medianDarkness * 0.85) * 1.65 * clamp((0.68 - darkPixelRatio) / 0.5)
  );

  // Detect hand-drawn circle around open symbols/letters (dark pixels in >= 3 halo quadrants)
  const haloCutoff = bgPaper - Math.max(15, bgMad * 2.1);
  const haloDarkRatio = samples.halo.filter((v) => v < haloCutoff).length / Math.max(1, samples.halo.length);
  const haloQuadRatios = samples.haloQuads.map(
    (q) => q.filter((v) => v < haloCutoff).length / Math.max(1, q.length)
  );
  const haloCoveredQuads = haloQuadRatios.filter((r) => r >= 0.065).length;
  const circleHaloScore =
    haloCoveredQuads >= 3
      ? clamp(haloDarkRatio * 3.1 * clamp((haloCoveredQuads - 1.5) / 2.5))
      : 0;

  // Illumination-invariant ink summary (immune to cast shadow edges!)
  const illumInvariantInk = clamp(
    normMeanDarkness * 0.34 + adaptiveInkRatio * 0.36 + softInkMean * 0.30
  );

  // Raw gray ink summary (strictly bounded when adaptive/normalized ink is weak so cast shadow edges never spoof ink)
  const rawGrayInk = clamp(
    medianDarkness * 0.24 + meanDarkness * 0.36 + darkPixelRatio * 0.30 + centerDarkness * 0.10
  );
  const lowHighFreqInk = isBox ? adaptiveInkRatio < 0.11 : illumInvariantInk < 0.14;
  const guardedRawGray = lowHighFreqInk
    ? Math.min(rawGrayInk, Math.min(illumInvariantInk, adaptiveInkRatio + 0.04) * 1.45 + 0.03)
    : rawGrayInk;

  let coreInk = clamp(guardedRawGray * 0.54 + illumInvariantInk * 0.46);

  // For wide rectangular table cells (e.g. horizontal tables 118x66), also evaluate a centered square core
  // so an X or dot in the middle of the cell isn't diluted by empty white side margins!
  if (isWideBox && samples.core.length >= 16) {
    const cMeanDark = clamp((bgPaper - mean(samples.core)) / (inkRange * 0.88));
    const cNormDark = clamp((bgPaperNorm - mean(samples.coreNorm)) / (normRange * 0.88));
    const cDarkRatio = samples.core.filter((v) => v < inkCutoff).length / samples.core.length;
    const cAdapt = mean(samples.coreBinary);
    const cDelta = clamp(mean(samples.coreDelta) / Math.max(78, inkRange * 0.64));
    const cInv = clamp(cNormDark * 0.34 + cAdapt * 0.36 + cDelta * 0.30);
    const cRaw = clamp(cMeanDark * 0.52 + cDarkRatio * 0.48);
    const cGuarded =
      cAdapt < 0.13 ? Math.min(cRaw, Math.min(cInv, cAdapt + 0.04) * 1.45 + 0.03) : cRaw;
    const centerSquareInk = clamp(cGuarded * 0.54 + cInv * 0.46);
    coreInk = Math.max(coreInk, centerSquareInk * 0.96);
  }

  // For open delimiters/letters, blend halo evidence without penalizing pure inner solid fills
  const haloWeight = isOpen ? 0.68 : 0.28;
  const rawInkScore = clamp(Math.max(coreInk, coreInk * 0.84 + circleHaloScore * haloWeight));

  const agreement = clamp(
    1 - stdDev([meanDarkness, normMeanDarkness, darkPixelRatio, adaptiveInkRatio, softInkMean]) / 0.48
  );
  const contrastEvidence = clamp((bgPaper - innerMean) / 42 + circleHaloScore * 0.65);
  const clippedRatio =
    (Number(xMin === 0) + Number(yMin === 0) + Number(xMax === gray.cols - 1) + Number(yMax === gray.rows - 1)) / 4;

  const markType =
    circleHaloScore >= 0.18 && coreInk < 0.48
      ? 'circled'
      : crossPattern >= 0.22 && darkPixelRatio >= 0.14 && darkPixelRatio <= 0.62
        ? 'x-mark'
        : darkPixelRatio >= 0.42
          ? 'filled'
          : 'light';

  return {
    rawInkScore,
    markType,
    features: {
      meanInterior: innerMean,
      medianInterior: innerMed,
      centerMedian: centerMed,
      centerMean,
      edgeMedian: edgeMed,
      backgroundMean: mean(samples.background),
      backgroundMedian: bgMed,
      backgroundPaper: bgPaper,
      backgroundMad: bgMad,
      normalizedDarkness: medianDarkness,
      meanDarkness,
      illuminationNormalizedDarkness: normDarkness,
      darkPixelRatio,
      adaptiveInkRatio,
      softInkMean,
      illumInvariantInk,
      centerDarkness,
      centerVsEdge,
      inkVariance,
      quadrantImbalance,
      diagonalDarkness,
      crossOutScore: crossPattern,
      circleHaloScore,
      haloCoveredQuads,
      agreement,
      contrastEvidence,
      clippedRatio,
      sampledPixels: samples.inner.length
    }
  };
}

function calibrateMeasurements(items, optionCount, optionScheme = 'upper') {
  const k = Math.max(2, optionCount || 5);

  // Group items by row to extract guaranteed-empty bubbles (the lowest K-1 options of every row!).
  // This remains 100% unpoisoned even if a student marks the SAME option (e.g. 'V') on 100% of questions!
  const byRow = new Map();
  items.forEach((it) => {
    const key = it.row;
    if (!byRow.has(key)) byRow.set(key, []);
    byRow.get(key).push(it);
  });

  const rowEmptyScores = [];
  const slotEmptyByIdx = new Map();
  for (const rowItems of byRow.values()) {
    const sortedRow = [...rowItems].sort((a, b) => a.measurement.rawInkScore - b.measurement.rawInkScore);
    const emptyCount = Math.max(1, sortedRow.length - 1);
    for (let i = 0; i < emptyCount; i += 1) {
      const it = sortedRow[i];
      rowEmptyScores.push(it.measurement.rawInkScore);
      const slotIdx = it.bubble.optionIndex ?? 0;
      if (!slotEmptyByIdx.has(slotIdx)) slotEmptyByIdx.set(slotIdx, []);
      slotEmptyByIdx.get(slotIdx).push(it.measurement.rawInkScore);
    }
  }

  const fallbackSorted = items.map((it) => it.measurement.rawInkScore).sort((a, b) => a - b);
  const basePool = rowEmptyScores.length >= 4 ? rowEmptyScores : fallbackSorted.slice(0, Math.max(3, Math.floor(fallbackSorted.length * 0.55)));
  const globalEmpty = median(basePool);
  const globalSpread = Math.max(0.016, mad(basePool, globalEmpty) * 1.4826);

  // Per-option-slot baseline computed STRICTLY from non-winning (empty) bubbles of each slot!
  // Because winning/marked bubbles are excluded, we can safely compensate real printed-glyph differences
  // (like lowercase 'a'/'c' vs tall 'b'/'d', or Roman 'III' vs 'I') without ever poisoning baselines!
  const maxSlotOffset = k <= 2 ? 0.04 : 0.24;
  const slotBaselines = {};
  const slotSpreads = {};

  for (let idx = 0; idx < k; idx += 1) {
    const emptySlotScores = slotEmptyByIdx.get(idx) || [];
    if (emptySlotScores.length >= 4) {
      const sMed = median(emptySlotScores);
      const clampedMed = clamp(sMed, Math.max(0, globalEmpty - maxSlotOffset), globalEmpty + maxSlotOffset);
      slotBaselines[idx] = clampedMed;
      slotSpreads[idx] = Math.max(0.015, mad(emptySlotScores, clampedMed) * 1.4826);
    } else {
      slotBaselines[idx] = globalEmpty;
      slotSpreads[idx] = globalSpread;
    }
  }

  // Compute excess ink over per-slot baseline
  const excesses = items.map((it) => {
    const base = slotBaselines[it.bubble.optionIndex ?? 0] ?? globalEmpty;
    return Math.max(0, it.measurement.rawInkScore - base);
  });

  // High anchor from row winners so dynamic range scales cleanly across K=2..6
  const rowWinnerExcesses = [];
  for (const rowItems of byRow.values()) {
    const maxEx = Math.max(
      ...rowItems.map((it) => {
        const base = slotBaselines[it.bubble.optionIndex ?? 0] ?? globalEmpty;
        return Math.max(0, it.measurement.rawInkScore - base);
      })
    );
    rowWinnerExcesses.push(maxEx);
  }
  const highExcess = rowWinnerExcesses.length >= 4 ? percentile(rowWinnerExcesses, 0.72) : percentile(excesses, 0.9);
  const highAnchor = globalEmpty + highExcess;

  return {
    emptyBaseline: globalEmpty,
    emptySpread: globalSpread,
    slotBaselines,
    slotSpreads,
    highAnchor,
    highExcess,
    dynamicRange: Math.max(0.14, highExcess),
    faintThreshold: Math.max(0.055, globalSpread * 3.0),
    optionCount: k
  };
}

function finalizeBubbleScore(measurement, calibration, bubble) {
  const slotIdx = bubble.optionIndex ?? 0;
  const baseline = calibration.slotBaselines?.[slotIdx] ?? calibration.emptyBaseline;
  const spread = calibration.slotSpreads?.[slotIdx] ?? calibration.emptySpread;
  const excess = Math.max(0, measurement.rawInkScore - baseline);

  const relative = clamp(excess / calibration.dynamicRange);
  const zSig = sigmoid((excess / Math.max(0.032, spread * 2.2) - 1.5) * 1.18);
  const absolute = clamp((excess - 0.032) / 0.38);
  const fillScore = clamp(relative * 0.48 + zSig * 0.28 + absolute * 0.24);

  const geomConf = bubble.geometryConfidence ?? (bubble.inferred ? 0.24 : 0.68);
  const fillConfidence = clamp(
    measurement.features.agreement * 0.32 +
      geomConf * 0.34 +
      measurement.features.contrastEvidence * 0.24 +
      clamp(measurement.features.sampledPixels / 140) * 0.1 -
      measurement.features.clippedRatio * 0.4
  );

  const faintEvidence = excess >= calibration.faintThreshold && fillScore < 0.54;

  return {
    ...bubble,
    ...measurement,
    slotBaseline: baseline,
    excessInk: excess,
    fillScore,
    fillConfidence,
    suspiciousMark: false,
    faintEvidence
  };
}

export class BubbleAnalyzer {
  analyze(preprocessed, structure) {
    const items = [];
    const fallbackDiam = structure.bubbleDiameter || 20;
    const shapeKind = structure.shapeKind || 'bubble';

    const slotRxMap = new Map();
    const slotRyMap = new Map();
    structure.rows.forEach((row) => {
      if (row.unresolved) return;
      row.bubbles.forEach((b) => {
        const idx = b.optionIndex ?? 0;
        if (!slotRxMap.has(idx)) {
          slotRxMap.set(idx, []);
          slotRyMap.set(idx, []);
        }
        if (Number.isFinite(b.radiusX) && b.radiusX > 1) slotRxMap.get(idx).push(b.radiusX);
        if (Number.isFinite(b.radiusY) && b.radiusY > 1) slotRyMap.get(idx).push(b.radiusY);
      });
    });

    const slotRadiiByIndex = new Map();
    for (const [idx, rxs] of slotRxMap.entries()) {
      const rys = slotRyMap.get(idx) || [];
      if (rxs.length >= 3 && rys.length >= 3) {
        slotRadiiByIndex.set(idx, {
          rx: percentile(rxs, 0.4),
          ry: percentile(rys, 0.4)
        });
      }
    }

    const optionGap = structure.optionGap || structure.horizontalGap || 0;
    structure.rows.forEach((row) => {
      if (row.unresolved) return;
      row.bubbles.forEach((bubble) => {
        const slotRadii = slotRadiiByIndex.get(bubble.optionIndex ?? 0) || null;
        items.push({
          row,
          bubble,
          measurement: measureBubble(
            preprocessed.gray,
            preprocessed.normalized,
            preprocessed.adaptive,
            preprocessed.inkDelta,
            bubble,
            fallbackDiam || Math.max(bubble.radiusX, bubble.radiusY) * 2,
            shapeKind,
            slotRadii,
            optionGap
          )
        });
      });
    });

    if (!items.length) {
      return {
        rows: structure.rows,
        calibration: {
          emptyBaseline: 0,
          emptySpread: 0,
          slotBaselines: {},
          highAnchor: 0,
          dynamicRange: 0,
          faintThreshold: 0
        },
        confidence: 0
      };
    }

    const optionCount =
      structure.optionLabels?.length || structure.rows.find((r) => r.bubbles?.length)?.bubbles.length || 5;
    const calibration = calibrateMeasurements(items, optionCount, structure.optionScheme || 'upper');
    const updatedMap = new Map();
    items.forEach(({ bubble, measurement }) => {
      updatedMap.set(bubble, finalizeBubbleScore(measurement, calibration, bubble));
    });

    const rows = structure.rows.map((row) => ({
      ...row,
      bubbles: row.bubbles.map((b) => updatedMap.get(b) || b)
    }));

    return {
      rows,
      calibration,
      confidence: mean(rows.flatMap((r) => r.bubbles.map((b) => b.fillConfidence ?? 0)))
    };
  }
}
