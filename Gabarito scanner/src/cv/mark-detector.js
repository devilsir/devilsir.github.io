import { clamp, cluster1D, distance, median, modePeak, percentile } from '../utils/math.js';

function fitCandidateEllipse(cv, contour, bbox) {
  if (contour.rows >= 5) {
    try {
      const rotRect = cv.fitEllipse(contour);
      const rx = rotRect.size.width / 2;
      const ry = rotRect.size.height / 2;
      if (
        Number.isFinite(rx) &&
        Number.isFinite(ry) &&
        rx > 1 &&
        ry > 1 &&
        rx <= bbox.width * 1.15 &&
        ry <= bbox.height * 1.15
      ) {
        return {
          centerX: rotRect.center.x,
          centerY: rotRect.center.y,
          radiusX: rx,
          radiusY: ry,
          angle: rotRect.angle
        };
      }
    } catch {}
  }
  return {
    centerX: bbox.x + bbox.width / 2,
    centerY: bbox.y + bbox.height / 2,
    radiusX: bbox.width / 2,
    radiusY: bbox.height / 2,
    angle: 0
  };
}

function closedShapeScore({ circularity, aspectRatio, extent, hasChild }) {
  const aspectScore = clamp(1 - Math.abs(Math.log(Math.max(0.05, aspectRatio))) / Math.log(2.4));
  const circScore = clamp((circularity - 0.2) / 0.62);
  const extentScore = clamp((extent - 0.18) / 0.62);
  return clamp(aspectScore * 0.4 + circScore * 0.34 + extentScore * 0.21 + (hasChild ? 0.05 : 0));
}

function dominantDiameter(candidates) {
  if (!candidates.length) return 0;
  const peakLog = modePeak(
    candidates.map((c) => Math.log(Math.max(1, c.diameter))),
    { bins: 28, weights: candidates.map((c) => 0.3 + (c.shapeScore ?? 0.5) ** 2) }
  );
  const peak = Math.exp(peakLog);
  const near = candidates.map((c) => c.diameter).filter((d) => d >= peak * 0.65 && d <= peak * 1.52);
  return median(near.length >= 5 ? near : candidates.map((c) => c.diameter));
}

function deduplicateCandidates(candidates, minDist) {
  const sorted = [...candidates].sort((a, b) => (b.shapeScore ?? 0) - (a.shapeScore ?? 0) || (b.area ?? 0) - (a.area ?? 0));
  const kept = [];
  for (const cand of sorted) {
    const duplicate = kept.find(
      (existing) =>
        distance({ x: cand.centerX, y: cand.centerY }, { x: existing.centerX, y: existing.centerY }) <
        Math.max(2, minDist)
    );
    if (!duplicate) {
      kept.push(cand);
    } else if (cand.source !== duplicate.source && (cand.source === 'hough' || duplicate.source === 'hough')) {
      duplicate.shapeScore = clamp(Math.max(duplicate.shapeScore, cand.shapeScore) + 0.06);
      duplicate.houghConfirmed = true;
    }
  }
  return kept.sort((a, b) => a.centerY - b.centerY || a.centerX - b.centerX);
}

/**
 * Computes hierarchy depth for every contour in RETR_TREE.
 * On white-ink-on-black-background binary images:
 * - Even depths (0, 2, 4, ...) are INK foreground strokes (even inside a printed page border!)
 * - Odd depths (1, 3, 5, ...) are BACKGROUND holes (page interior, table cells, holes inside letters).
 */
function computeHierarchyDepths(hData, count) {
  const depths = new Int16Array(count);
  depths.fill(-1);
  for (let i = 0; i < count; i += 1) {
    if (depths[i] >= 0) continue;
    const chain = [];
    let cur = i;
    while (cur >= 0 && cur < count && depths[cur] < 0) {
      chain.push(cur);
      cur = hData[cur * 4 + 3] ?? -1;
    }
    let d = cur >= 0 && cur < count ? depths[cur] : -1;
    for (let k = chain.length - 1; k >= 0; k -= 1) {
      d += 1;
      depths[chain[k]] = d;
    }
  }
  return depths;
}

/**
 * Removes inner strokes completely enclosed by a larger ink stroke of mark size
 * (for example, the printed letter "I" sitting inside a hand-drawn circle around "I").
 */
function suppressEnclosedStrokes(strokes) {
  if (strokes.length <= 1) return strokes;
  const sorted = [...strokes].sort((a, b) => b.bbox.width * b.bbox.height - a.bbox.width * a.bbox.height);
  const kept = [];
  for (const s of sorted) {
    const sx1 = s.bbox.x;
    const sy1 = s.bbox.y;
    const sx2 = sx1 + s.bbox.width;
    const sy2 = sy1 + s.bbox.height;
    const enclosed = kept.some((outer) => {
      const ox1 = outer.bbox.x;
      const oy1 = outer.bbox.y;
      const ox2 = ox1 + outer.bbox.width;
      const oy2 = oy1 + outer.bbox.height;
      return sx1 >= ox1 - 2 && sy1 >= oy1 - 2 && sx2 <= ox2 + 2 && sy2 <= oy2 + 2;
    });
    if (!enclosed) kept.push(s);
  }
  return kept;
}

/**
 * Groups nearby horizontal ink strokes into unified option tokens:
 * handles (A), (a), (I), (III), ( ), "A", 'a', [A], and standalone letters/numerals.
 */
function buildTokenCandidates(rawStrokes, imgWidth, imgHeight, { mergeGapFactor = 0.52, pairEmptyDelimiters = true } = {}) {
  if (!rawStrokes.length) return [];
  const minDim = Math.min(imgWidth, imgHeight);
  const minH = Math.max(6, minDim * 0.0055);
  const maxH = minDim * 0.095;
  const maxW = minDim * 0.14;

  const filteredRaw = rawStrokes.filter(
    (s) =>
      s.bbox.height >= minH * 0.35 &&
      s.bbox.height <= maxH &&
      s.bbox.width >= 2 &&
      s.bbox.width <= maxW &&
      s.bbox.x > 1 &&
      s.bbox.y > 1 &&
      s.bbox.x + s.bbox.width < imgWidth - 1 &&
      s.bbox.y + s.bbox.height < imgHeight - 1
  );
  if (filteredRaw.length < 4) return [];

  const strokes = suppressEnclosedStrokes(filteredRaw);

  // Estimate typical character/delimiter height (ignoring tiny punctuation like quote ticks)
  const tallStrokes = strokes.filter((s) => s.bbox.height >= minH * 1.1);
  const charH =
    tallStrokes.length >= 6
      ? Math.exp(modePeak(tallStrokes.map((s) => Math.log(s.bbox.height)), { bins: 24 }))
      : median(strokes.map((s) => s.bbox.height));

  // Keep strokes relevant to this scale (including small quote ticks near the top of letters,
  // and larger hand-drawn circles/X marks up to 3.6x charH around lowercase letters like 'a' or 'c')
  const usable = strokes.filter(
    (s) => s.bbox.height >= charH * 0.15 && s.bbox.height <= charH * 3.6 && s.bbox.width <= charH * 4.4
  );
  if (usable.length < 4) return [];

  // Cluster into horizontal text bands by vertical center
  const bands = cluster1D(usable, (s) => s.centerY, charH * 0.65);
  const tokens = [];
  let tokenId = 0;

  for (const band of bands) {
    const items = [...band.items].sort((a, b) => a.bbox.x - b.bbox.x);
    const groups = [];

    for (const stroke of items) {
      const prev = groups[groups.length - 1];
      if (prev) {
        const horizGap = stroke.bbox.x - prev.x2;
        const prevH = prev.y2 - prev.y1;
        const yOverlap = Math.min(prev.y2, stroke.bbox.y + stroke.bbox.height) - Math.max(prev.y1, stroke.bbox.y);
        const minHeight = Math.min(prevH, stroke.bbox.height);
        const refHeight = Math.max(prevH, stroke.bbox.height, charH * 0.85);
        const isSmallPunct = stroke.bbox.height < charH * 0.55 || prevH < charH * 0.55;
        const allowedGap = refHeight * (isSmallPunct ? mergeGapFactor * 0.95 : mergeGapFactor);
        const combinedW = Math.max(prev.x2, stroke.bbox.x + stroke.bbox.width) - prev.x1;

        const verticallyCompatible =
          yOverlap >= -refHeight * 0.16 && (yOverlap >= minHeight * 0.15 || isSmallPunct);

        if (horizGap <= allowedGap && verticallyCompatible && combinedW <= charH * 3.6) {
          prev.x1 = Math.min(prev.x1, stroke.bbox.x);
          prev.y1 = Math.min(prev.y1, stroke.bbox.y);
          prev.x2 = Math.max(prev.x2, stroke.bbox.x + stroke.bbox.width);
          prev.y2 = Math.max(prev.y2, stroke.bbox.y + stroke.bbox.height);
          prev.strokes.push(stroke);
          continue;
        }
      }
      groups.push({
        x1: stroke.bbox.x,
        y1: stroke.bbox.y,
        x2: stroke.bbox.x + stroke.bbox.width,
        y2: stroke.bbox.y + stroke.bbox.height,
        strokes: [stroke]
      });
    }

    // Pair empty parentheses / brackets like "(   )" or "[   ]"
    const paired = [];
    for (let i = 0; i < groups.length; i += 1) {
      const curr = groups[i];
      const next = groups[i + 1];
      if (pairEmptyDelimiters && next) {
        const w1 = curr.x2 - curr.x1;
        const h1 = curr.y2 - curr.y1;
        const w2 = next.x2 - next.x1;
        const h2 = next.y2 - next.y1;
        const gap = next.x1 - curr.x2;
        const avgH = (h1 + h2) / 2;
        const heightMatch = Math.abs(h1 - h2) / Math.max(1, avgH) <= 0.35;
        const bothThinDelims =
          curr.strokes.length === 1 &&
          next.strokes.length === 1 &&
          w1 / Math.max(1, h1) <= 0.62 &&
          w2 / Math.max(1, h2) <= 0.62 &&
          h1 >= charH * 0.62 &&
          h2 >= charH * 0.62;
        const yAligned = Math.abs((curr.y1 + curr.y2) / 2 - (next.y1 + next.y2) / 2) <= avgH * 0.3;

        if (bothThinDelims && heightMatch && yAligned && gap >= avgH * 0.25 && gap <= avgH * 2.0) {
          paired.push({
            x1: curr.x1,
            y1: Math.min(curr.y1, next.y1),
            x2: next.x2,
            y2: Math.max(curr.y2, next.y2),
            strokes: [...curr.strokes, ...next.strokes],
            isDelimitedPair: true
          });
          i += 1;
          continue;
        }
      }
      paired.push(curr);
    }

    for (const grp of paired) {
      const w = grp.x2 - grp.x1;
      const h = grp.y2 - grp.y1;
      if (h < charH * 0.45 || h > charH * 3.65 || w > charH * 4.4) continue;

      // Normalize sampling box to a stable consistent size around charH so "I", "a", "III",
      // and circled/X-marked options all share comparable geometry in the grid reconstructor
      const normW = clamp(Math.max(w, charH * 1.05), charH * 0.95, charH * 2.7);
      const normH = clamp(Math.max(h, charH * 1.05), charH * 0.95, charH * 2.4);
      const cx = (grp.x1 + grp.x2) / 2;
      const cy = (grp.y1 + grp.y2) / 2;
      const rx = normW / 2;
      const ry = normH / 2;
      const diam = Math.sqrt(normW * normH);
      const aspect = normW / Math.max(1, normH);
      const hasMultiStroke = grp.strokes.length >= 2 || grp.isDelimitedPair;

      const hConsistency = clamp(1 - Math.abs(Math.log(Math.min(h, charH * 1.8) / Math.max(1, charH))) / 0.95);
      const aspectScore = clamp(1 - Math.abs(Math.log(Math.max(0.25, aspect))) / Math.log(3.0));
      const shapeScore = clamp(hConsistency * 0.50 + aspectScore * 0.34 + (hasMultiStroke ? 0.16 : 0.06));

      tokens.push({
        id: `token-${tokenId++}`,
        centerX: cx,
        centerY: cy,
        radiusX: rx,
        radiusY: ry,
        angle: 0,
        bbox: { x: cx - rx, y: cy - ry, width: normW, height: normH },
        rawBbox: { x: grp.x1, y: grp.y1, width: w, height: h },
        area: normW * normH,
        perimeter: 2 * (normW + normH),
        diameter: diam,
        aspectRatio: aspect,
        circularity: 0.74,
        extent: 0.78,
        hasChild: false,
        shapeKind: grp.isDelimitedPair || grp.strokes.length >= 2 ? 'delimited' : 'plain',
        shapeScore,
        source: 'token-group'
      });
    }
  }

  const dom = dominantDiameter(tokens);
  if (!dom) return [];
  const filtered = tokens.filter((t) => t.diameter >= dom * 0.46 && t.diameter <= dom * 2.65);
  return deduplicateCandidates(filtered, dom * 0.35);
}

/**
 * Extracts table cells (odd-depth rectangular holes enclosed by a printed grid parent contour).
 */
function buildTableCellCandidates(allContoursMeta, imgWidth, imgHeight) {
  const byParent = new Map();
  for (const item of allContoursMeta) {
    if (item.parentIdx < 0 || item.depth % 2 === 0) continue; // holes always have odd depth
    if (item.extent < 0.68 || item.aspectRatio < 0.32 || item.aspectRatio > 3.2) continue;
    if (!byParent.has(item.parentIdx)) byParent.set(item.parentIdx, []);
    byParent.get(item.parentIdx).push(item);
  }

  const cells = [];
  for (const [, children] of byParent.entries()) {
    if (children.length < 6) continue;
    const medW = median(children.map((c) => c.bbox.width));
    const medH = median(children.map((c) => c.bbox.height));
    const consistent = children.filter(
      (c) =>
        c.bbox.width >= medW * 0.55 &&
        c.bbox.width <= medW * 1.75 &&
        c.bbox.height >= medH * 0.55 &&
        c.bbox.height <= medH * 1.75
    );
    if (consistent.length < 6) continue;

    for (const cell of consistent) {
      const w = cell.bbox.width;
      const h = cell.bbox.height;
      if (cell.bbox.x <= 1 || cell.bbox.y <= 1 || cell.bbox.x + w >= imgWidth - 1 || cell.bbox.y + h >= imgHeight - 1) {
        continue;
      }
      const diam = Math.sqrt(w * h);
      const sizeScore = clamp(
        1 - (Math.abs(Math.log(w / Math.max(1, medW))) + Math.abs(Math.log(h / Math.max(1, medH)))) / 1.1
      );
      cells.push({
        id: `cell-${cell.contourIdx}`,
        centerX: cell.bbox.x + w / 2,
        centerY: cell.bbox.y + h / 2,
        radiusX: w / 2,
        radiusY: h / 2,
        angle: 0,
        bbox: { ...cell.bbox },
        area: cell.area,
        perimeter: cell.perimeter,
        diameter: diam,
        aspectRatio: cell.aspectRatio,
        circularity: cell.circularity,
        extent: cell.extent,
        hasChild: cell.hasChild,
        shapeKind: 'box',
        shapeScore: clamp(0.66 + sizeScore * 0.24 + clamp((cell.extent - 0.68) / 0.32) * 0.1),
        source: 'table-cell'
      });
    }
  }

  if (cells.length < 6) return [];
  const dom = dominantDiameter(cells);
  return deduplicateCandidates(
    cells.filter((c) => c.diameter >= dom * 0.55 && c.diameter <= dom * 1.7),
    dom * 0.35
  );
}

function summarizePool(name, candidates, shapeKind = 'bubble') {
  const dom = dominantDiameter(candidates);
  const maxFactor = shapeKind === 'delimited' || shapeKind === 'plain' ? 2.6 : 1.95;
  const clean = dom
    ? deduplicateCandidates(
        candidates.filter((c) => c.diameter >= dom * 0.5 && c.diameter <= dom * maxFactor),
        dom * 0.34
      )
    : [];
  const finalDom = dominantDiameter(clean);
  const medCirc = median(clean.map((c) => c.circularity ?? 0.72));
  const medAspect = median(clean.map((c) => c.aspectRatio ?? 1));
  const confidence = clamp(
    (clean.length / 50) * 0.28 +
      clamp((medCirc - 0.22) / 0.58) * 0.38 +
      clamp(1 - Math.abs(Math.log(Math.max(0.05, medAspect))) / 0.72) * 0.34
  );
  return {
    name,
    shapeKind,
    candidates: clean,
    bubbleDiameter: finalDom,
    confidence,
    medianCircularity: medCirc,
    medianAspectRatio: medAspect
  };
}

export class MarkDetector {
  constructor(cv) {
    this.cv = cv;
  }

  detect(preprocessed, { markStyle = 'auto' } = {}) {
    const cv = this.cv;
    const bin = preprocessed.structureBinary;
    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();
    const minDim = Math.min(bin.cols, bin.rows);
    const totalArea = bin.cols * bin.rows;
    const minDiam = Math.max(5, minDim * 0.0035);
    const maxDiam = minDim * 0.14;

    const closedContours = [];
    const allMeta = [];
    const inkStrokes = [];

    try {
      cv.findContours(bin, contours, hierarchy, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE);
      const count = contours.size();
      const hData = hierarchy.data32S || [];
      const depths = computeHierarchyDepths(hData, count);

      for (let i = 0; i < count; i += 1) {
        const contour = contours.get(i);
        const bbox = cv.boundingRect(contour);
        const w = bbox.width;
        const h = bbox.height;
        const diam = Math.sqrt(w * h);
        const area = Math.abs(cv.contourArea(contour));
        const perimeter = cv.arcLength(contour, true);
        const aspectRatio = w / Math.max(1, h);
        const circularity = perimeter > 0 ? (4 * Math.PI * area) / (perimeter * perimeter) : 0;
        const extent = area / Math.max(1, w * h);
        const hIdx = i * 4;
        const childIdx = hData[hIdx + 2] ?? -1;
        const parentIdx = hData[hIdx + 3] ?? -1;
        const hasChild = childIdx >= 0;
        const depth = depths[i];

        const touchesEdge = bbox.x <= 1 || bbox.y <= 1 || bbox.x + w >= bin.cols - 1 || bbox.y + h >= bin.rows - 1;

        if (!touchesEdge && diam >= minDiam && diam <= maxDiam * 1.4 && area / totalArea >= 2e-6 && area / totalArea <= 0.015) {
          allMeta.push({
            contourIdx: i,
            bbox,
            area,
            perimeter,
            diameter: diam,
            aspectRatio,
            circularity,
            extent,
            hasChild,
            parentIdx,
            depth
          });
        }

        // Even-depth contours are ink foreground components (works inside printed page borders too!)
        if (depth % 2 === 0 && !touchesEdge && area >= 4 && area / totalArea <= 0.012 && w < bin.cols * 0.2 && h < bin.rows * 0.15) {
          inkStrokes.push({
            contourIdx: i,
            bbox,
            centerX: bbox.x + w / 2,
            centerY: bbox.y + h / 2,
            area,
            diameter: diam,
            aspectRatio,
            depth
          });
        }

        // Closed bubble / square / oval candidates
        if (
          !touchesEdge &&
          diam >= minDiam &&
          diam <= maxDiam &&
          area / totalArea >= 2e-6 &&
          area / totalArea <= 0.0035 &&
          aspectRatio >= 0.45 &&
          aspectRatio <= 2.25 &&
          circularity >= 0.19 &&
          extent >= 0.15
        ) {
          const fitted = fitCandidateEllipse(cv, contour, bbox);
          const isBoxLike = extent >= 0.78 && circularity >= 0.58 && circularity <= 0.86;
          const cand = {
            id: `contour-${i}`,
            ...fitted,
            bbox: { x: bbox.x, y: bbox.y, width: w, height: h },
            area,
            perimeter,
            diameter: diam,
            aspectRatio,
            circularity,
            extent,
            hasChild,
            shapeKind: isBoxLike ? 'box' : 'bubble',
            source: 'contour'
          };
          cand.shapeScore = closedShapeScore(cand);
          closedContours.push(cand);
        }

        contour.delete();
      }

      // Channel 2: Hough Circles
      const houghCandidates = [];
      if (markStyle === 'auto' || markStyle === 'bubble') {
        let resized = null;
        let blurred = null;
        let circles = null;
        let scale = 1;
        try {
          const gray = preprocessed.gray;
          const maxSide = Math.max(gray.cols, gray.rows);
          const target = 1200;
          resized = new cv.Mat();
          if (maxSide > target) {
            scale = target / maxSide;
            cv.resize(
              gray,
              resized,
              new cv.Size(Math.max(2, Math.round(gray.cols * scale)), Math.max(2, Math.round(gray.rows * scale))),
              0,
              0,
              cv.INTER_AREA
            );
          } else {
            gray.copyTo(resized);
          }
          blurred = new cv.Mat();
          cv.medianBlur(resized, blurred, 5);
          circles = new cv.Mat();
          const smallMin = Math.min(blurred.cols, blurred.rows);
          const minR = Math.max(5, Math.round(smallMin * 0.012));
          const maxR = Math.max(minR + 4, Math.round(smallMin * 0.07));
          const minDist = Math.max(minR * 1.75, smallMin * 0.025);
          cv.HoughCircles(blurred, circles, cv.HOUGH_GRADIENT, 1.2, minDist, 110, 32, minR, maxR);
          const data = circles.data32F || [];
          for (let i = 0; i + 2 < data.length; i += 3) {
            const cx = data[i] / scale;
            const cy = data[i + 1] / scale;
            const r = data[i + 2] / scale;
            const d = r * 2;
            houghCandidates.push({
              id: `hough-${i / 3}`,
              centerX: cx,
              centerY: cy,
              radiusX: r,
              radiusY: r,
              angle: 0,
              bbox: { x: cx - r, y: cy - r, width: d, height: d },
              area: Math.PI * r * r,
              perimeter: 2 * Math.PI * r,
              diameter: d,
              aspectRatio: 1,
              circularity: 1,
              extent: Math.PI / 4,
              hasChild: true,
              shapeKind: 'bubble',
              shapeScore: 0.94,
              source: 'hough'
            });
          }
        } catch {} finally {
          circles?.delete?.();
          blurred?.delete?.();
          resized?.delete?.();
        }
      }

      const minBubbleSize = Math.max(9, minDim * 0.0085);
      const strongClosed = closedContours.filter(
        (c) => c.diameter >= minBubbleSize && c.shapeScore >= 0.36 && c.aspectRatio >= 0.52 && c.aspectRatio <= 1.92
      );
      const closedBase = strongClosed.length >= 6 ? strongClosed : closedContours;
      const closedDom = dominantDiameter(closedBase);
      const filteredClosed = closedDom
        ? closedContours.filter(
            (c) =>
              c.diameter >= closedDom * 0.56 &&
              c.diameter <= closedDom * 1.75 &&
              c.shapeScore >= 0.24 &&
              c.diameter >= minBubbleSize * 0.8
          )
        : [];

      const houghDom = houghCandidates.length ? dominantDiameter(houghCandidates) : 0;
      const filteredHough = houghDom
        ? houghCandidates.filter((c) => c.diameter >= houghDom * 0.72 && c.diameter <= houghDom * 1.38)
        : [];

      const pools = [];

      if (filteredHough.length >= 6) {
        const scalesAgree = closedDom > 0 && houghDom >= closedDom * 0.72 && houghDom <= closedDom * 1.38;
        if (scalesAgree) {
          pools.push(summarizePool('fused-bubbles', [...filteredHough, ...filteredClosed], 'bubble'));
        } else {
          pools.push(summarizePool('hough-bubbles', filteredHough, 'bubble'));
        }
      }

      if (filteredClosed.length >= 4) {
        const boxRatio = filteredClosed.filter((c) => c.shapeKind === 'box').length / filteredClosed.length;
        pools.push(summarizePool('contour-shapes', filteredClosed, boxRatio > 0.55 ? 'box' : 'bubble'));
      }

      // Channel 3: Table cells (rectangular grid holes)
      if (markStyle === 'auto' || markStyle === 'box') {
        const tableCells = buildTableCellCandidates(allMeta, bin.cols, bin.rows);
        if (tableCells.length >= 6) {
          pools.push(summarizePool('table-cells', tableCells, 'box'));
        }
      }

      // Channel 4: Open delimiters ((A), (a), "A", 'a', [A], ( )) & character tokens (I..V, V/F)
      if (markStyle === 'auto' || markStyle === 'delimited' || markStyle === 'plain') {
        const fineStrokes = this.#extractFineInkStrokes(preprocessed.adaptiveFine, minDim, totalArea);
        const strokeSource = fineStrokes.length >= inkStrokes.length * 0.65 ? fineStrokes : inkStrokes;

        const tightTokens = buildTokenCandidates(strokeSource, bin.cols, bin.rows, {
          mergeGapFactor: 0.45,
          pairEmptyDelimiters: true
        });
        if (tightTokens.length >= 6) {
          pools.push(summarizePool('tokens-tight', tightTokens, markStyle === 'plain' ? 'plain' : 'delimited'));
        }

        const wideTokens = buildTokenCandidates(strokeSource, bin.cols, bin.rows, {
          mergeGapFactor: 0.72,
          pairEmptyDelimiters: true
        });
        if (wideTokens.length >= 6) {
          pools.push(summarizePool('tokens-delimited', wideTokens, 'delimited'));
        }
      }

      const preferredOrder =
        markStyle === 'box'
          ? ['table-cells', 'contour-shapes', 'tokens-tight', 'fused-bubbles']
          : markStyle === 'delimited'
            ? ['tokens-delimited', 'tokens-tight', 'contour-shapes', 'table-cells']
            : markStyle === 'plain'
              ? ['tokens-tight', 'tokens-delimited', 'contour-shapes']
              : ['fused-bubbles', 'table-cells', 'contour-shapes', 'hough-bubbles', 'tokens-delimited', 'tokens-tight'];

      const sortedPools = [...pools].sort((a, b) => {
        const ia = preferredOrder.indexOf(a.name);
        const ib = preferredOrder.indexOf(b.name);
        return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
      });

      const primary = sortedPools[0] || summarizePool('empty', [], 'bubble');

      return {
        candidates: primary.candidates,
        bubbleDiameter: primary.bubbleDiameter,
        confidence: primary.confidence,
        shapeKind: primary.shapeKind,
        pools: sortedPools,
        rawCandidateCount: closedContours.length + houghCandidates.length + inkStrokes.length,
        diagnostics: {
          rawCandidateCount: closedContours.length,
          filteredCandidateCount: primary.candidates.length,
          rawDiameterP25: percentile(closedContours.map((c) => c.diameter), 0.25),
          rawDiameterMedian: median(closedContours.map((c) => c.diameter)),
          rawDiameterP75: percentile(closedContours.map((c) => c.diameter), 0.75),
          rawDiameterP90: percentile(closedContours.map((c) => c.diameter), 0.9),
          medianCircularity: primary.medianCircularity,
          medianAspectRatio: primary.medianAspectRatio,
          bubbleDiameter: primary.bubbleDiameter,
          houghCandidateCount: houghCandidates.length,
          houghFilteredCount: filteredHough.length,
          inkStrokeCount: inkStrokes.length,
          poolSummary: sortedPools.map((p) => ({
            name: p.name,
            kind: p.shapeKind,
            count: p.candidates.length,
            diameter: Math.round(p.bubbleDiameter * 10) / 10
          })),
          detector: primary.name
        }
      };
    } finally {
      contours.delete();
      hierarchy.delete();
    }
  }

  #extractFineInkStrokes(fineMat, minDim, totalArea) {
    const cv = this.cv;
    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();
    const strokes = [];
    try {
      cv.findContours(fineMat, contours, hierarchy, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE);
      const count = contours.size();
      const hData = hierarchy.data32S || [];
      const depths = computeHierarchyDepths(hData, count);
      for (let i = 0; i < count; i += 1) {
        const c = contours.get(i);
        if (depths[i] % 2 === 0) {
          const bbox = cv.boundingRect(c);
          const area = Math.abs(cv.contourArea(c));
          const touchesEdge =
            bbox.x <= 1 ||
            bbox.y <= 1 ||
            bbox.x + bbox.width >= fineMat.cols - 1 ||
            bbox.y + bbox.height >= fineMat.rows - 1;
          if (
            !touchesEdge &&
            area >= 4 &&
            area / totalArea <= 0.012 &&
            bbox.width < fineMat.cols * 0.2 &&
            bbox.height <= minDim * 0.1
          ) {
            strokes.push({
              contourIdx: i,
              bbox,
              centerX: bbox.x + bbox.width / 2,
              centerY: bbox.y + bbox.height / 2,
              area,
              diameter: Math.sqrt(bbox.width * bbox.height),
              aspectRatio: bbox.width / Math.max(1, bbox.height),
              depth: depths[i]
            });
          }
        }
        c.delete();
      }
      return strokes;
    } finally {
      contours.delete();
      hierarchy.delete();
    }
  }
}
