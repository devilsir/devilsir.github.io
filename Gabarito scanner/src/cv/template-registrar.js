import { STORAGE_KEYS, getOptionLabels } from '../config.js';
import { clamp, distance, mean, median } from '../utils/math.js';

function isValidTemplate(tpl) {
  return (
    (tpl?.version === 1 || tpl?.version === 2) &&
    Number.isInteger(tpl.optionCount) &&
    tpl.optionCount >= 2 &&
    Array.isArray(tpl.rows) &&
    tpl.rows.length > 0 &&
    tpl.rows.every((r) => Array.isArray(r.bubbles) && r.bubbles.length === tpl.optionCount)
  );
}

function nearestCandidate(candidates, usedIds, point, maxDist) {
  let best = null;
  let bestDist = maxDist;
  for (const cand of candidates) {
    if (usedIds.has(cand.id)) continue;
    const d = distance({ x: cand.centerX, y: cand.centerY }, point);
    if (d < bestDist) {
      best = cand;
      bestDist = d;
    }
  }
  return { candidate: best, distance: bestDist };
}

export class TemplateRegistrar {
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.template) || localStorage.getItem(STORAGE_KEYS.legacyTemplate);
      const parsed = raw ? JSON.parse(raw) : null;
      return isValidTemplate(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  hasTemplate() {
    return Boolean(this.load());
  }

  save(structure, width, height, optionCount, { optionScheme = 'upper', orientation = 'vertical', shapeKind = 'bubble' } = {}) {
    const validRows = structure.rows.filter((r) => !r.unresolved && r.bubbles.length === optionCount);
    if (validRows.length < 2) {
      throw new Error('É preciso detectar pelo menos duas questões para salvar um modelo.');
    }
    const payload = {
      version: 2,
      createdAt: new Date().toISOString(),
      optionCount,
      optionScheme,
      orientation,
      shapeKind,
      questionCount: validRows.length,
      pageAspectRatio: width / height,
      rows: validRows.map((row) => ({
        question: row.question,
        blockId: row.blockId,
        y: (row.yCenter ?? 0) / height,
        xStart: (row.xStart ?? 0) / width,
        columnGap: (row.columnGap ?? 0) / width,
        bubbles: row.bubbles.map((b) => ({
          option: b.option,
          x: b.centerX / width,
          y: b.centerY / height,
          radiusX: b.radiusX / width,
          radiusY: b.radiusY / height
        }))
      }))
    };
    localStorage.setItem(STORAGE_KEYS.template, JSON.stringify(payload));
    return payload;
  }

  clear() {
    localStorage.removeItem(STORAGE_KEYS.template);
    localStorage.removeItem(STORAGE_KEYS.legacyTemplate);
  }

  register(template, detection, { width, height, expectedQuestions, optionCount, optionScheme = 'upper' }) {
    if (!isValidTemplate(template)) {
      throw new Error('O modelo salvo está corrompido ou incompleto.');
    }
    if (template.optionCount !== optionCount) {
      throw new Error(`O modelo usa ${template.optionCount} alternativas, mas a prova atual está configurada com ${optionCount}.`);
    }

    const orientation = template.orientation || 'vertical';
    const shapeKind = template.shapeKind || detection.shapeKind || 'bubble';
    const labels = getOptionLabels(optionScheme || template.optionScheme || 'upper', optionCount);

    // Combine all candidate pools for template snapping
    const allCandidates = detection.candidates?.length
      ? detection.candidates
      : detection.pools?.flatMap((p) => p.candidates) || [];

    const diam =
      detection.bubbleDiameter ||
      median(template.rows.flatMap((r) => r.bubbles.map((b) => b.radiusX * width * 2)));

    const expectedPoints = template.rows.flatMap((r, rIdx) =>
      r.bubbles.map((b, oIdx) => ({ rowIndex: rIdx, optionIndex: oIdx, x: b.x * width, y: b.y * height }))
    );

    const offsets = [];
    expectedPoints.forEach((pt) => {
      const { candidate, distance: d } = nearestCandidate(allCandidates, new Set(), pt, diam * 2.6);
      if (candidate && d < diam * 1.45) {
        offsets.push({ x: candidate.centerX - pt.x, y: candidate.centerY - pt.y });
      }
    });

    const shift = {
      x: offsets.length ? median(offsets.map((o) => o.x)) : 0,
      y: offsets.length ? median(offsets.map((o) => o.y)) : 0
    };

    const used = new Set();
    const rows = template.rows.slice(0, expectedQuestions || template.rows.length).map((tplRow, idx) => {
      const bubbles = tplRow.bubbles.map((tb, oIdx) => {
        const target = { x: tb.x * width + shift.x, y: tb.y * height + shift.y };
        const match = nearestCandidate(allCandidates, used, target, diam * 1.25);
        const cand = match.candidate;
        if (cand) used.add(cand.id);
        const rx = cand?.radiusX ?? tb.radiusX * width;
        const ry = cand?.radiusY ?? tb.radiusY * height;
        return {
          question: idx + 1,
          option: labels[oIdx] || tb.option,
          optionIndex: oIdx,
          centerX: cand?.centerX ?? target.x,
          centerY: cand?.centerY ?? target.y,
          radiusX: rx,
          radiusY: ry,
          angle: cand?.angle ?? 0,
          bbox: cand?.bbox ?? { x: target.x - rx, y: target.y - ry, width: rx * 2, height: ry * 2 },
          contourDetected: Boolean(cand),
          inferred: !cand,
          candidateId: cand?.id ?? null,
          shapeKind,
          geometryConfidence: cand ? clamp((cand.shapeScore ?? 0.6) * (1 - match.distance / (diam * 2))) : 0.3,
          circularity: cand?.circularity ?? null,
          shapeScore: cand?.shapeScore ?? 0
        };
      });

      const matched = bubbles.filter((b) => b.contourDetected).length;
      const optionGaps = bubbles.slice(1).map((b, i) =>
        orientation === 'horizontal' ? b.centerY - bubbles[i].centerY : b.centerX - bubbles[i].centerX
      );
      return {
        question: idx + 1,
        source: 'template-registered',
        orientation,
        detected: matched > 0,
        inferred: matched < optionCount,
        unresolved: false,
        blockId: tplRow.blockId || 'template-block',
        yCenter: median(bubbles.map((b) => b.centerY)),
        xStart: bubbles[0].centerX,
        columnGap: optionGaps.length ? median(optionGaps) : diam * 1.8,
        bubbles,
        rowConfidence: clamp(0.28 + (matched / optionCount) * 0.72),
        matchedBubbleCount: matched
      };
    });

    if (expectedQuestions > rows.length) {
      for (let q = rows.length + 1; q <= expectedQuestions; q += 1) {
        rows.push({
          question: q,
          source: 'unresolved',
          orientation,
          detected: false,
          inferred: false,
          unresolved: true,
          yCenter: null,
          xStart: null,
          columnGap: null,
          bubbles: [],
          rowConfidence: 0,
          matchedBubbleCount: 0
        });
      }
    }

    const active = rows.filter((r) => !r.unresolved);
    const coverage = mean(active.map((r) => r.matchedBubbleCount / optionCount));
    const byBlock = new Map();
    active.forEach((r) => {
      if (!byBlock.has(r.blockId)) byBlock.set(r.blockId, []);
      byBlock.get(r.blockId).push(r);
    });

    const blocks = [...byBlock.entries()].map(([id, blkRows]) => ({
      id,
      orientation,
      rows: blkRows,
      xStart: median(blkRows.map((r) => r.xStart)),
      columnGap: median(blkRows.map((r) => r.columnGap)),
      verticalGap: median(blkRows.slice(1).map((r, i) => r.yCenter - blkRows[i].yCenter)),
      confidence: mean(blkRows.map((r) => r.rowConfidence))
    }));

    const warnings = [];
    if (coverage < 0.75) {
      warnings.push('O modelo foi aplicado, mas várias posições não encaixaram em marcas físicas desta foto.');
    }
    if (Math.abs(width / height - template.pageAspectRatio) > 0.12) {
      warnings.push('A proporção da página difere do modelo salvo; confira o recorte e os overlays.');
    }

    return {
      rows,
      blocks,
      orientation,
      shapeKind,
      optionScheme: optionScheme || template.optionScheme || 'upper',
      optionLabels: labels,
      bubbleDiameter: diam,
      horizontalGap: median(active.map((r) => r.columnGap)),
      optionGap: median(active.map((r) => r.columnGap)),
      confidence: clamp(coverage * 0.72 + mean(active.map((r) => r.rowConfidence)) * 0.28),
      diagnostics: {
        detectorPool: 'template',
        orientation,
        shapeKind,
        optionScheme: optionScheme || template.optionScheme || 'upper',
        inputCandidates: allCandidates.length,
        yClusters: null,
        blockCount: blocks.length,
        detectedRows: active.filter((r) => r.detected).length,
        inferredRows: active.filter((r) => r.inferred).length,
        unresolvedRows: rows.filter((r) => r.unresolved).length,
        detectedBubbleCount: used.size,
        expectedBubbleCount: active.length * optionCount,
        bubbleCoverage: coverage,
        registrationOffset: shift,
        warnings,
        mode: 'template'
      }
    };
  }
}
