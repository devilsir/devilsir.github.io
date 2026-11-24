import { formatOptionRange, getOptionLabels, getOptionScheme, resolveOptionCount } from '../config.js';
import {
  clamp,
  cluster1D,
  coeffOfVariation,
  fitRobustLine,
  mean,
  median,
  modePeak,
  mad
} from '../utils/math.js';

function transposeCandidate(c) {
  return {
    ...c,
    centerX: c.centerY,
    centerY: c.centerX,
    radiusX: c.radiusY,
    radiusY: c.radiusX,
    angle: c.angle ? 90 - c.angle : 0,
    bbox: {
      x: c.bbox.y,
      y: c.bbox.x,
      width: c.bbox.height,
      height: c.bbox.width
    },
    aspectRatio: 1 / Math.max(0.05, c.aspectRatio || 1)
  };
}

function untransposeBubble(b) {
  return {
    ...b,
    centerX: b.centerY,
    centerY: b.centerX,
    radiusX: b.radiusY,
    radiusY: b.radiusX,
    angle: b.angle ? 90 - b.angle : 0,
    bbox: {
      x: b.bbox.y,
      y: b.bbox.x,
      width: b.bbox.height,
      height: b.bbox.width
    }
  };
}

function mergeCloseClusters(clusters, mergeTol) {
  const sorted = [...clusters].sort((a, b) => a.center - b.center);
  const merged = [];
  for (const cluster of sorted) {
    const prev = merged[merged.length - 1];
    if (prev && Math.abs(prev.center - cluster.center) <= mergeTol) {
      prev.items.push(...cluster.items);
      prev.center = median(prev.items.map((c) => c.centerY));
    } else {
      merged.push({ center: cluster.center, items: [...cluster.items] });
    }
  }
  return merged;
}

function estimateOptionGap(vClusters, diameter, optionCount, shapeKind = 'bubble') {
  const gaps = [];
  const weights = [];
  const minGapFactor = shapeKind === 'box' ? 0.62 : 1.05;
  const maxGapFactor = optionCount <= 2 ? 7.5 : 6.2;

  for (const cluster of vClusters) {
    const items = [...cluster.items].sort((a, b) => a.centerX - b.centerX);
    for (let i = 1; i < items.length; i += 1) {
      const dx = items[i].centerX - items[i - 1].centerX;
      if (dx >= diameter * minGapFactor && dx <= diameter * maxGapFactor) {
        gaps.push(dx);
        weights.push(((items[i].shapeScore ?? 0.5) + (items[i - 1].shapeScore ?? 0.5)) / 2);
      }
    }
  }
  if (!gaps.length) return diameter * 1.75;
  const peakLog = modePeak(
    gaps.map((g) => Math.log(g)),
    { bins: 30, weights }
  );
  const peak = Math.exp(peakLog);
  const near = gaps.filter((g) => g >= peak * 0.72 && g <= peak * 1.38);
  return median(near.length ? near : gaps);
}

function matchSlots(items, u0, gap, optionCount, diameter) {
  const tol = Math.min(gap * 0.38, Math.max(diameter * 0.56, gap * 0.28));
  const used = new Set();
  const slots = [];
  let totalError = 0;

  for (let i = 0; i < optionCount; i += 1) {
    const expectedU = u0 + i * gap;
    let best = null;
    let bestErr = Infinity;
    for (const cand of items) {
      if (used.has(cand.id)) continue;
      const err = Math.abs(cand.centerX - expectedU);
      if (err < bestErr && err <= tol) {
        best = cand;
        bestErr = err;
      }
    }
    if (best) {
      used.add(best.id);
      totalError += bestErr;
      slots.push({ optionIndex: i, candidate: best, expectedX: expectedU, error: bestErr, inferred: false });
    } else {
      slots.push({ optionIndex: i, candidate: null, expectedX: expectedU, error: tol, inferred: true });
    }
  }

  const matches = slots.filter((s) => s.candidate);
  return {
    slots,
    matches,
    tolerance: tol,
    meanError: matches.length ? totalError / matches.length : tol
  };
}

function scoreSegment(fit, gap, globalGap, optionCount) {
  const coverage = fit.matches.length / optionCount;
  const align = clamp(1 - fit.meanError / Math.max(1, fit.tolerance));
  const shape = mean(fit.matches.map((m) => m.candidate.shapeScore ?? 0.5));
  const gapConsistency = clamp(1 - Math.abs(Math.log(gap / Math.max(1, globalGap))) / Math.log(2.2));
  const missingPenalty = (optionCount - fit.matches.length) * 0.035;

  if (optionCount <= 2) {
    return clamp(coverage * 0.5 + align * 0.16 + shape * 0.14 + gapConsistency * 0.2 - missingPenalty);
  }
  return clamp(coverage * 0.62 + align * 0.17 + shape * 0.12 + gapConsistency * 0.09 - missingPenalty);
}

function fitRowSegments(cluster, optionCount, diameter, globalGap, shapeKind) {
  const items = [...cluster.items].sort((a, b) => a.centerX - b.centerX);
  const minMatches = optionCount <= 2 ? 2 : optionCount === 3 ? 2 : Math.max(3, optionCount - 2);
  const minGapFactor = shapeKind === 'box' ? 0.62 : 1.05;
  const maxGapFactor = optionCount <= 2 ? 7.2 : 5.8;
  const proposals = [];

  for (let i = 0; i < items.length; i += 1) {
    for (let j = i + 1; j < items.length; j += 1) {
      const span = items[j].centerX - items[i].centerX;
      for (let step = 1; step < optionCount; step += 1) {
        const gap = span / step;
        if (gap < diameter * minGapFactor || gap > diameter * maxGapFactor) continue;
        if (gap < globalGap * 0.5 || gap > globalGap * 2.05) continue;

        for (let startSlot = 0; startSlot + step < optionCount; startSlot += 1) {
          const u0 = items[i].centerX - startSlot * gap;
          const fit = matchSlots(items, u0, gap, optionCount, diameter);
          if (fit.matches.length < minMatches) continue;
          const score = scoreSegment(fit, gap, globalGap, optionCount);
          if (score < (optionCount <= 2 ? 0.55 : 0.48)) continue;

          proposals.push({
            x0: u0,
            gap,
            y: median(fit.matches.map((m) => m.candidate.centerY)),
            score,
            ...fit
          });
        }
      }
    }
  }

  const unique = [];
  proposals
    .sort((a, b) => b.score - a.score || b.matches.length - a.matches.length)
    .forEach((prop) => {
      const dup = unique.find(
        (u) =>
          Math.abs(u.x0 - prop.x0) < Math.min(u.gap, prop.gap) * 0.36 &&
          Math.abs(u.gap - prop.gap) < globalGap * 0.34
      );
      if (!dup) unique.push(prop);
    });

  // Prefer trailing K slots when a row has (K+1) uniform items (e.g. [Q# | A | B | C | D] or [01. (a) (b) (c) (d)])
  if ((shapeKind === 'box' || shapeKind === 'delimited' || shapeKind === 'plain') && unique.length >= 2) {
    unique.forEach((prop) => {
      const shiftedRight = unique.find(
        (other) =>
          other !== prop &&
          Math.abs(other.gap - prop.gap) < globalGap * 0.22 &&
          Math.abs(other.x0 - (prop.x0 + prop.gap)) < prop.gap * 0.34 &&
          other.matches.length >= prop.matches.length - 1
      );
      if (shiftedRight) {
        const furtherRight = items.some(
          (cand) => Math.abs(cand.centerX - (shiftedRight.x0 + optionCount * shiftedRight.gap)) < shiftedRight.gap * 0.35
        );
        if (!furtherRight && shiftedRight.matches.length >= prop.matches.length) {
          shiftedRight.score = clamp(shiftedRight.score + 0.08, 0, 1.08);
        }
      }
    });
    unique.sort((a, b) => b.score - a.score || b.matches.length - a.matches.length);
  }

  const selected = [];
  for (const prop of unique) {
    const ids = new Set(prop.matches.map((m) => m.candidate.id));
    const start = prop.x0;
    const end = prop.x0 + prop.gap * (optionCount - 1);
    const overlaps = selected.some((existing) => {
      const shared = existing.matches.filter((m) => ids.has(m.candidate.id)).length;
      const eStart = existing.x0;
      const eEnd = existing.x0 + existing.gap * (optionCount - 1);
      const inter = Math.max(0, Math.min(end, eEnd) - Math.max(start, eStart));
      const minSpan = Math.max(1, Math.min(end - start, eEnd - eStart));
      // A physical mark can belong to at most ONE question segment on the same line.
      // Rejecting any shared candidate prevents stray "bridge" blocks across inter-band gaps!
      return shared >= 1 || inter > minSpan * 0.25;
    });
    if (!overlaps) selected.push(prop);
  }

  return selected;
}

function buildBubble(slot, vCenter, diameter, optionLabel, shapeKind) {
  const cand = slot.candidate;
  const r = diameter / 2;
  return {
    option: optionLabel,
    optionIndex: slot.optionIndex,
    centerX: cand?.centerX ?? slot.expectedX,
    centerY: cand?.centerY ?? vCenter,
    radiusX: cand?.radiusX ?? r,
    radiusY: cand?.radiusY ?? r,
    angle: cand?.angle ?? 0,
    bbox: cand?.bbox ?? { x: slot.expectedX - r, y: vCenter - r, width: diameter, height: diameter },
    contourDetected: Boolean(cand),
    inferred: !cand,
    candidateId: cand?.id ?? null,
    shapeKind: cand?.shapeKind ?? shapeKind ?? 'bubble',
    geometryConfidence: cand
      ? clamp((cand.shapeScore ?? 0.6) * (1 - slot.error / Math.max(1, slot.error + diameter)))
      : 0.22,
    circularity: cand?.circularity ?? null,
    shapeScore: cand?.shapeScore ?? 0
  };
}

function segmentToRow(segment, diameter, optionLabels, shapeKind) {
  const bubbles = segment.slots.map((slot, idx) => buildBubble(slot, segment.y, diameter, optionLabels[idx], shapeKind));
  const coverage = segment.matches.length / optionLabels.length;
  return {
    source: 'detected',
    detected: true,
    inferred: false,
    unresolved: false,
    yCenter: median(bubbles.filter((b) => b.contourDetected).map((b) => b.centerY)),
    xStart: segment.x0,
    columnGap: segment.gap,
    bubbles,
    rowConfidence: clamp(Math.min(1, segment.score) * 0.75 + coverage * 0.25),
    matchedBubbleCount: segment.matches.length
  };
}

function deduplicateRowsInBlock(rows, minVGap) {
  const kept = [];
  [...rows]
    .sort((a, b) => a.yCenter - b.yCenter || b.rowConfidence - a.rowConfidence)
    .forEach((row) => {
      const idx = kept.findIndex((existing) => Math.abs(existing.yCenter - row.yCenter) < minVGap);
      if (idx < 0) kept.push(row);
      else if (row.rowConfidence > kept[idx].rowConfidence) kept[idx] = row;
    });
  return kept.sort((a, b) => a.yCenter - b.yCenter);
}

function estimateRowPitch(rows, diameter) {
  if (rows.length < 2) return diameter * 2.2;
  const diffs = [];
  for (let i = 1; i < rows.length; i += 1) {
    const dy = rows[i].yCenter - rows[i - 1].yCenter;
    if (dy >= diameter * 0.78 && dy <= diameter * 12) diffs.push(dy);
  }
  if (!diffs.length) return diameter * 2.2;

  const expanded = diffs.flatMap((dy) => {
    const vals = [dy];
    for (let k = 2; k <= 4; k += 1) {
      const sub = dy / k;
      if (sub >= diameter * 0.88 && sub <= diameter * 5.0) vals.push(sub);
    }
    return vals;
  });
  const peak = modePeak(expanded, { bins: 30, min: diameter * 0.82, max: diameter * 5.2 });
  const near = expanded.filter((v) => v >= peak * 0.78 && v <= peak * 1.25);
  return median(near.length ? near : diffs);
}

function createInferredRow(vCenter, uStart, optionGap, diameter, optionLabels, blockId, shapeKind) {
  const bubbles = optionLabels.map((lbl, idx) =>
    buildBubble(
      { optionIndex: idx, candidate: null, expectedX: uStart + idx * optionGap, error: diameter, inferred: true },
      vCenter,
      diameter,
      lbl,
      shapeKind
    )
  );
  return {
    source: 'inferred-spacing',
    detected: false,
    inferred: true,
    unresolved: false,
    blockId,
    yCenter: vCenter,
    xStart: uStart,
    columnGap: optionGap,
    bubbles,
    rowConfidence: 0.28,
    matchedBubbleCount: 0
  };
}

/**
 * Discovers the consensus K option-axis tracks for a block using ALL raw candidates inside the block's v-span.
 * If the block contains (K + 1) regularly-spaced tracks (e.g., a question-number header row/column
 * plus K option rows/columns), drops the leading header track (track 0 at u_min) and snaps every row
 * in the block cleanly onto tracks [1..K] so no row can ever shift out of phase!
 */
function alignBlockToConsensusTracks(rows, allCandidates, optionLabels, diameter, shapeKind) {
  const k = optionLabels.length;
  if (rows.length < 2 || !allCandidates.length) return rows;

  const medGap = median(rows.map((r) => r.columnGap));
  const medU0 = median(rows.map((r) => r.xStart));
  const vMin = Math.min(...rows.map((r) => r.yCenter)) - diameter * 0.8;
  const vMax = Math.max(...rows.map((r) => r.yCenter)) + diameter * 0.8;

  // Gather candidates in this block's v-range.
  // Allow searching up to 1.35*medGap BEFORE medU0 (to catch a leading question-number header track),
  // but keep the trailing bound tight (+0.55*medGap) so we NEVER grab candidates from a neighboring block!
  const uSearchMin = medU0 - medGap * 1.35;
  const uSearchMax = medU0 + (k - 1) * medGap + medGap * 0.55;
  const localCands = allCandidates.filter(
    (c) => c.centerY >= vMin && c.centerY <= vMax && c.centerX >= uSearchMin && c.centerX <= uSearchMax
  );
  if (localCands.length < k * 2) return rows;

  const uClusters = cluster1D(localCands, (c) => c.centerX, Math.min(medGap * 0.36, diameter * 0.55))
    .filter((cl) => cl.items.length >= Math.max(2, Math.floor(rows.length * 0.38)))
    .sort((a, b) => a.center - b.center);

  if (uClusters.length < k) return rows;

  // Find longest evenly-spaced chain of tracks matching medGap
  let bestChain = [];
  for (let start = 0; start < uClusters.length; start += 1) {
    const chain = [uClusters[start]];
    for (let next = start + 1; next < uClusters.length; next += 1) {
      const last = chain[chain.length - 1];
      const du = uClusters[next].center - last.center;
      if (du >= medGap * 0.74 && du <= medGap * 1.28) {
        chain.push(uClusters[next]);
      } else if (du > medGap * 1.28) {
        break;
      }
    }
    if (chain.length > bestChain.length) bestChain = chain;
  }

  let selectedTracks = null;
  if (bestChain.length === k + 1) {
    // Classic (K + 1) grid: Track 0 is the question-number header (01..10), Tracks 1..K are the options!
    selectedTracks = bestChain.slice(1, k + 1);
  } else if (bestChain.length === k) {
    selectedTracks = bestChain;
  } else if (bestChain.length > k + 1) {
    // Pick the K tracks closest to medU0 (skipping track 0 if shapeKind is box/delimited)
    const startIdx = shapeKind === 'box' || shapeKind === 'delimited' ? 1 : 0;
    selectedTracks = bestChain.slice(startIdx, startIdx + k);
  }

  if (!selectedTracks || selectedTracks.length !== k) return rows;

  const consensusU0 = selectedTracks[0].center;
  const trackGaps = selectedTracks.slice(1).map((t, idx) => t.center - selectedTracks[idx].center);
  const consensusGap = trackGaps.length ? median(trackGaps) : medGap;
  const vTol = Math.max(diameter * 0.55, consensusGap * 0.38);
  const uTol = Math.min(consensusGap * 0.38, Math.max(diameter * 0.52, consensusGap * 0.28));

  // Re-snap every row in the block directly onto the exact consensus tracks!
  return rows.map((row) => {
    const vCenter = row.yCenter;
    const used = new Set();
    const bubbles = selectedTracks.map((track, optIdx) => {
      const expectedU = track.center;
      let best = null;
      let bestScore = Infinity;
      for (const c of localCands) {
        if (used.has(c.id)) continue;
        const du = Math.abs(c.centerX - expectedU);
        const dv = Math.abs(c.centerY - vCenter);
        if (du <= uTol && dv <= vTol) {
          const dist = Math.hypot(du, dv);
          if (dist < bestScore) {
            best = c;
            bestScore = dist;
          }
        }
      }
      if (best) used.add(best.id);
      return buildBubble(
        {
          optionIndex: optIdx,
          candidate: best,
          expectedX: expectedU,
          error: best ? bestScore : uTol,
          inferred: !best
        },
        vCenter,
        diameter,
        optionLabels[optIdx],
        shapeKind
      );
    });

    const matched = bubbles.filter((b) => b.contourDetected).length;
    const medRx = median(localCands.map((c) => c.radiusX));
    const medRy = median(localCands.map((c) => c.radiusY));
    bubbles.forEach((b) => {
      if (b.inferred) {
        b.radiusX = medRx || b.radiusX;
        b.radiusY = medRy || b.radiusY;
        b.bbox = { x: b.centerX - b.radiusX, y: b.centerY - b.radiusY, width: b.radiusX * 2, height: b.radiusY * 2 };
      }
    });

    return {
      ...row,
      xStart: consensusU0,
      columnGap: consensusGap,
      yCenter: matched ? median(bubbles.filter((b) => b.contourDetected).map((b) => b.centerY)) : vCenter,
      bubbles,
      matchedBubbleCount: matched,
      detected: matched >= Math.max(1, k - 2),
      inferred: matched === 0,
      rowConfidence: clamp(0.32 + (matched / k) * 0.68)
    };
  });
}

function consolidateBlock(rows, blockId, diameter, optionLabels, shapeKind, allCandidates) {
  const clean0 = deduplicateRowsInBlock(rows, diameter * 0.65);
  let clean = alignBlockToConsensusTracks(clean0, allCandidates, optionLabels, diameter, shapeKind);
  const vPitch = estimateRowPitch(clean, diameter);

  // Drop an isolated top column-header row (e.g. "A B C D" printed above Q01) when it sits
  // clearly closer to row 1 than the uniform row spacing of rows 1..N!
  if (clean.length >= 4) {
    const firstGap = clean[1].yCenter - clean[0].yCenter;
    const restGaps = clean.slice(2).map((r, i) => r.yCenter - clean[i + 1].yCenter);
    const restMed = median(restGaps);
    if (restMed > 0 && firstGap < restMed * 0.76 && coeffOfVariation(restGaps) < 0.14) {
      clean = clean.slice(1);
    }
  }

  const gaps = clean.map((r) => r.columnGap);
  const medGap = median(gaps);

  const driftLine = fitRobustLine(
    clean.map((r) => ({ x: r.yCenter, y: r.xStart })),
    0.06
  );
  const expectedUAt = (v) => driftLine.intercept + driftLine.slope * (v - driftLine.refX);

  const uResiduals = clean.map((r) => Math.abs(r.xStart - expectedUAt(r.yCenter)));
  const uSpread = Math.max(diameter * 0.25, median(uResiduals) * 1.4826);
  const gapSpread = Math.max(diameter * 0.18, mad(gaps, medGap) * 1.4826);

  clean.forEach((row) => {
    row.blockId = blockId;
    const uAlign = clamp(1 - Math.abs(row.xStart - expectedUAt(row.yCenter)) / (uSpread * 3.5));
    const gAlign = clamp(1 - Math.abs(row.columnGap - medGap) / (gapSpread * 3.5));
    row.rowConfidence = clamp(row.rowConfidence * 0.72 + uAlign * 0.16 + gAlign * 0.12);
  });

  const filled = [];
  for (let i = 0; i < clean.length; i += 1) {
    filled.push(clean[i]);
    const next = clean[i + 1];
    if (!next) continue;
    const dv = next.yCenter - clean[i].yCenter;
    const mult = Math.round(dv / vPitch);
    const fracErr = Math.abs(dv / vPitch - mult);
    if (mult >= 2 && mult <= 4 && fracErr <= 0.28) {
      for (let k = 1; k < mult; k += 1) {
        const vPos = clean[i].yCenter + vPitch * k;
        filled.push(createInferredRow(vPos, expectedUAt(vPos), medGap, diameter, optionLabels, blockId, shapeKind));
      }
    }
  }

  const ordered = filled.sort((a, b) => a.yCenter - b.yCenter);
  const spacings = [];
  for (let i = 1; i < ordered.length; i += 1) {
    spacings.push(ordered[i].yCenter - ordered[i - 1].yCenter);
  }

  return {
    id: blockId,
    xStart: driftLine.intercept,
    driftSlope: driftLine.slope,
    driftRefV: driftLine.refX,
    expectedUAt,
    columnGap: medGap,
    verticalGap: vPitch,
    rows: ordered,
    confidence: clamp(
      mean(clean.map((r) => r.rowConfidence)) * 0.65 +
        clamp(1 - coeffOfVariation(spacings)) * 0.2 +
        clamp(clean.length / 8) * 0.15
    )
  };
}

function deduplicateOverlappingBlocks(blocks, optionCount) {
  if (blocks.length <= 1) return blocks;
  const meta = blocks.map((blk) => {
    const uMin = blk.xStart;
    const uMax = blk.xStart + blk.columnGap * Math.max(1, optionCount - 1);
    const detectedCount = blk.rows.reduce((acc, r) => acc + (r.matchedBubbleCount || 0), 0);
    const totalSlots = Math.max(1, blk.rows.length * optionCount);
    const coverage = detectedCount / totalSlots;
    const rank = blk.confidence * 0.5 + coverage * 0.5 + Math.min(0.4, blk.rows.length * 0.03);
    return { blk, uMin, uMax, coverage, rank };
  });

  meta.sort((a, b) => b.rank - a.rank);
  const kept = [];
  for (const item of meta) {
    const overlaps = kept.some((existing) => {
      const inter = Math.max(0, Math.min(item.uMax, existing.uMax) - Math.max(item.uMin, existing.uMin));
      const minSpan = Math.max(1, Math.min(item.uMax - item.uMin, existing.uMax - existing.uMin));
      return inter > minSpan * 0.15;
    });
    if (!overlaps) kept.push(item);
  }
  return kept.map((k) => k.blk).sort((a, b) => a.xStart - b.xStart);
}

function normalizeMultiBlockGrid(blocks, expectedQuestions, readingOrder, diameter, optionLabels, shapeKind) {
  if (readingOrder !== 'columns' || !Number.isInteger(expectedQuestions) || expectedQuestions < 1 || blocks.length < 2) {
    return blocks;
  }
  const sortedBlocks = [...blocks].sort((a, b) => a.xStart - b.xStart);
  const blockCount = sortedBlocks.length;
  const basePerBlock = Math.floor(expectedQuestions / blockCount);
  const remainder = expectedQuestions % blockCount;
  if (basePerBlock < 1) return blocks;

  const pitches = sortedBlocks.map((b) => b.verticalGap).filter((v) => Number.isFinite(v) && v > 0);
  const medPitch = median(pitches);
  if (!Number.isFinite(medPitch) || medPitch <= 0) return blocks;

  const vTol = Math.max(diameter * 0.85, medPitch * 0.34);
  const samples = [];
  sortedBlocks.forEach((blk, bIdx) => {
    blk.rows
      .filter((r) => Number.isFinite(r.yCenter))
      .forEach((r) => samples.push({ v: r.yCenter, block: bIdx, confidence: r.rowConfidence || 0 }));
  });
  samples.sort((a, b) => a.v - b.v);

  const bands = [];
  for (const s of samples) {
    const last = bands[bands.length - 1];
    if (last && Math.abs(median(last.values) - s.v) <= vTol) {
      last.values.push(s.v);
      last.blocks.add(s.block);
      last.confidence += s.confidence;
    } else {
      bands.push({ values: [s.v], blocks: new Set([s.block]), confidence: s.confidence });
    }
  }

  const maxPerBlock = basePerBlock + (remainder ? 1 : 0);
  if (bands.length < maxPerBlock) return blocks;

  const topBands = [...bands]
    .sort((a, b) => b.blocks.size - a.blocks.size || b.confidence - a.confidence)
    .slice(0, maxPerBlock)
    .map((b) => ({ v: median(b.values), support: b.blocks.size }))
    .sort((a, b) => a.v - b.v);

  const avgSupport = topBands.reduce((acc, b) => acc + b.support, 0) / Math.max(1, topBands.length * blockCount);
  if (avgSupport < 0.48) return blocks;

  const snapTol = Math.max(diameter * 1.25, medPitch * 0.46);
  sortedBlocks.forEach((blk, bIdx) => {
    const quota = basePerBlock + (bIdx < remainder ? 1 : 0);
    if (quota < 1) return;
    const targetBands = topBands.slice(0, quota);
    const existing = [...blk.rows].sort((a, b) => a.yCenter - b.yCenter);
    const used = new Set();
    const rebuilt = [];

    for (const band of targetBands) {
      let bestIdx = null;
      let bestDist = Infinity;
      for (let i = 0; i < existing.length; i += 1) {
        if (used.has(i) || !Number.isFinite(existing[i].yCenter)) continue;
        const d = Math.abs(existing[i].yCenter - band.v);
        if (d < bestDist) {
          bestIdx = i;
          bestDist = d;
        }
      }
      if (bestIdx != null && bestDist <= snapTol) {
        used.add(bestIdx);
        rebuilt.push(existing[bestIdx]);
      } else {
        const uAtV = blk.expectedUAt ? blk.expectedUAt(band.v) : blk.xStart;
        rebuilt.push(createInferredRow(band.v, uAtV, blk.columnGap, diameter, optionLabels, blk.id, shapeKind));
      }
    }

    blk.rows = rebuilt.sort((a, b) => a.yCenter - b.yCenter);
    blk.confidence = clamp(mean(blk.rows.map((r) => r.rowConfidence)) * 0.7 + blk.confidence * 0.3);
  });

  return sortedBlocks;
}

function orderRows(blocks, readingOrder) {
  const sortedBlocks = [...blocks].sort((a, b) => a.xStart - b.xStart);
  if (readingOrder === 'rows') {
    return sortedBlocks.flatMap((b) => b.rows).sort((a, b) => a.yCenter - b.yCenter || a.xStart - b.xStart);
  }
  return sortedBlocks.flatMap((b) => [...b.rows].sort((a, b) => a.yCenter - b.yCenter));
}

function unresolvedRow(question) {
  return {
    question,
    source: 'unresolved',
    detected: false,
    inferred: false,
    unresolved: true,
    yCenter: null,
    xStart: null,
    columnGap: null,
    bubbles: [],
    rowConfidence: 0,
    matchedBubbleCount: 0
  };
}

export class GridReconstructor {
  reconstruct(
    pool,
    {
      optionCount = 5,
      optionScheme = 'upper',
      expectedQuestions = 50,
      readingOrder = 'columns',
      orientation = 'vertical',
      imageWidth,
      imageHeight
    } = {}
  ) {
    const isHorizontal = orientation === 'horizontal';
    const labels = getOptionLabels(optionScheme, optionCount);
    const k = labels.length;
    const shapeKind = pool.shapeKind || 'bubble';

    const rawCandidates = pool.candidates || [];
    const diameter = pool.bubbleDiameter || 0;
    if (!rawCandidates.length || !diameter) {
      return this.#emptyResult(expectedQuestions, k, orientation, 'Nenhuma marca geométrica foi detectada.');
    }

    const candidates = isHorizontal ? rawCandidates.map(transposeCandidate) : rawCandidates;

    const minClusterSize = k <= 2 ? 2 : k === 3 ? 2 : Math.max(3, k - 2);
    const vClusters = mergeCloseClusters(
      cluster1D(candidates, (c) => c.centerY, diameter * 0.56),
      diameter * 0.34
    ).filter((cl) => cl.items.length >= minClusterSize);

    const optionGap = estimateOptionGap(vClusters, diameter, k, shapeKind);
    const fittedRows = vClusters.flatMap((cl) =>
      fitRowSegments(cl, k, diameter, optionGap, shapeKind).map((seg) => segmentToRow(seg, diameter, labels, shapeKind))
    );

    if (!fittedRows.length) {
      return this.#emptyResult(
        expectedQuestions,
        k,
        orientation,
        `Foram encontrados ${rawCandidates.length} elementos candidatos, mas eles não formaram grupos consistentes de ${k} alternativas (${formatOptionRange(optionScheme, k)}).`
      );
    }

    const minRowsPerBlock = k <= 2 ? (expectedQuestions <= 3 ? 1 : 3) : fittedRows.length <= 3 ? 1 : 2;
    // Cluster blocks by u-center (mid-point of the row's u-span) with tolerance <= optionGap * 1.6
    // so blocks separated by whitespace stay distinct while rows within a table band that initially shifted
    // by 1 slot still group together and get cleanly aligned by alignBlockToConsensusTracks!
    const blockSpan = optionGap * Math.max(1, k - 1);
    const blockTol = Math.max(optionGap * 1.25, Math.min(blockSpan * 0.48, optionGap * 1.8));
    let blocks = cluster1D(fittedRows, (r) => r.xStart + (r.columnGap * (k - 1)) / 2, blockTol)
      .filter((cl) => cl.items.length >= minRowsPerBlock)
      .map((cl, idx) => consolidateBlock(cl.items, `block-${idx + 1}`, diameter, labels, shapeKind, candidates));

    if (!blocks.length) {
      blocks = [consolidateBlock(fittedRows, 'block-1', diameter, labels, shapeKind, candidates)];
    }

    blocks = deduplicateOverlappingBlocks(blocks, k);

    const effectiveOrder = isHorizontal ? 'columns' : readingOrder;
    blocks = normalizeMultiBlockGrid(blocks, expectedQuestions, effectiveOrder, diameter, labels, shapeKind);

    let ordered = orderRows(blocks, effectiveOrder);
    if (expectedQuestions > 0 && ordered.length > expectedQuestions) {
      const keep = new Set(
        [...ordered]
          .sort((a, b) => b.rowConfidence - a.rowConfidence || Number(a.inferred) - Number(b.inferred))
          .slice(0, expectedQuestions)
      );
      blocks.forEach((blk) => {
        blk.rows = blk.rows.filter((r) => keep.has(r));
      });
      ordered = orderRows(blocks, effectiveOrder);
    }

    if (isHorizontal) {
      blocks = blocks.map((blk) => ({
        ...blk,
        orientation: 'horizontal',
        yStart: blk.xStart,
        optionGap: blk.columnGap,
        questionGap: blk.verticalGap,
        rows: blk.rows.map((r) => {
          const untransposedBubbles = r.bubbles.map(untransposeBubble);
          return {
            ...r,
            orientation: 'horizontal',
            xCenter: r.yCenter,
            yStart: r.xStart,
            yCenter: median(untransposedBubbles.map((b) => b.centerY)),
            xStart: untransposedBubbles[0]?.centerX ?? r.yCenter,
            bubbles: untransposedBubbles
          };
        })
      }));
      ordered = blocks.flatMap((blk) => blk.rows);
    } else {
      blocks.forEach((blk) => {
        blk.orientation = 'vertical';
        blk.optionGap = blk.columnGap;
        blk.questionGap = blk.verticalGap;
      });
      ordered.forEach((r) => {
        r.orientation = 'vertical';
      });
    }

    ordered.forEach((row, idx) => {
      row.question = idx + 1;
      row.bubbles.forEach((b) => {
        b.question = row.question;
      });
    });

    const resolvedCount = ordered.length;
    if (expectedQuestions > ordered.length) {
      for (let q = ordered.length + 1; q <= expectedQuestions; q += 1) {
        ordered.push(unresolvedRow(q));
      }
    }

    const activeRows = ordered.filter((r) => !r.unresolved);
    const inferredRows = activeRows.filter((r) => r.inferred).length;
    const detectedBubbles = activeRows.reduce((acc, r) => acc + r.bubbles.filter((b) => b.contourDetected).length, 0);
    const expectedBubbles = activeRows.length * k;
    const bubbleCoverage = expectedBubbles ? detectedBubbles / expectedBubbles : 0;
    const confidence = clamp(
      mean(blocks.map((b) => b.confidence)) * 0.42 +
        bubbleCoverage * 0.34 +
        clamp(resolvedCount / Math.max(1, expectedQuestions || resolvedCount)) * 0.24
    );

    const warnings = [];
    if (resolvedCount < expectedQuestions) {
      warnings.push(
        `A geometria resolveu ${resolvedCount} de ${expectedQuestions} questões esperadas; as demais exigem revisão manual.`
      );
    }
    if (bubbleCoverage < 0.82) {
      warnings.push(`Apenas ${Math.round(bubbleCoverage * 100)}% das posições possuem marca física confirmada.`);
    }
    if (inferredRows) {
      warnings.push(
        `${inferredRows} questão(ões) foram reconstruídas pela cadência ${isHorizontal ? 'horizontal' : 'vertical'}.`
      );
    }

    return {
      rows: ordered,
      blocks,
      orientation,
      shapeKind,
      optionScheme,
      optionLabels: labels,
      bubbleDiameter: diameter,
      horizontalGap: optionGap,
      optionGap,
      confidence,
      diagnostics: {
        detectorPool: pool.name || 'default',
        shapeKind,
        orientation,
        optionScheme,
        inputCandidates: rawCandidates.length,
        yClusters: vClusters.length,
        blockCount: blocks.length,
        detectedRows: activeRows.filter((r) => r.detected).length,
        inferredRows,
        unresolvedRows: ordered.filter((r) => r.unresolved).length,
        detectedBubbleCount: detectedBubbles,
        expectedBubbleCount: expectedBubbles,
        bubbleCoverage,
        pageWidth: imageWidth,
        pageHeight: imageHeight,
        warnings
      }
    };
  }

  #emptyResult(expectedQuestions, optionCount, orientation, warning) {
    const rows = Array.from({ length: Math.max(0, expectedQuestions) }, (_, idx) => unresolvedRow(idx + 1));
    return {
      rows,
      blocks: [],
      orientation,
      shapeKind: 'bubble',
      bubbleDiameter: 0,
      horizontalGap: 0,
      optionGap: 0,
      confidence: 0,
      diagnostics: {
        detectorPool: 'none',
        orientation,
        inputCandidates: 0,
        yClusters: 0,
        blockCount: 0,
        detectedRows: 0,
        inferredRows: 0,
        unresolvedRows: rows.length,
        detectedBubbleCount: 0,
        expectedBubbleCount: rows.length * optionCount,
        bubbleCoverage: 0,
        warnings: [warning]
      }
    };
  }
}

function scoreStructureCandidate(structure, inputCandidateCount, expectedQuestions) {
  const diag = structure?.diagnostics || {};
  const totalRef = Math.max(
    1,
    expectedQuestions || (diag.detectedRows || 0) + (diag.inferredRows || 0) + (diag.unresolvedRows || 0)
  );
  const detectedRatio = clamp((diag.detectedRows || 0) / totalRef);
  const resolvedRatio = clamp(((diag.detectedRows || 0) + (diag.inferredRows || 0)) / totalRef);
  const coverage = clamp(diag.bubbleCoverage || 0);
  const candidateUsage = clamp((diag.detectedBubbleCount || 0) / Math.max(1, inputCandidateCount));
  const inferredRatio = clamp((diag.inferredRows || 0) / totalRef);

  return clamp(
    clamp(structure?.confidence || 0) * 0.34 +
      coverage * 0.24 +
      detectedRatio * 0.18 +
      resolvedRatio * 0.12 +
      candidateUsage * 0.12 -
      inferredRatio * 0.08
  );
}

function poolStyleBonus(pool, markStyle) {
  if (markStyle === 'auto') {
    if (pool.name === 'fused-bubbles' || pool.name === 'table-cells') return 0.025;
    if (pool.name === 'contour-shapes') return 0.012;
    return 0;
  }
  if (markStyle === 'bubble' && (pool.name === 'fused-bubbles' || pool.name === 'hough-bubbles' || pool.name === 'contour-shapes')) {
    return 0.06;
  }
  if (markStyle === 'box' && (pool.name === 'table-cells' || pool.shapeKind === 'box')) {
    return 0.06;
  }
  if (markStyle === 'delimited' && (pool.name === 'tokens-delimited' || pool.name === 'tokens-tight')) {
    return 0.06;
  }
  if (markStyle === 'plain' && (pool.name === 'tokens-tight' || pool.name === 'tokens-delimited')) {
    return 0.06;
  }
  return 0;
}

export class StructureSelector {
  constructor(gridReconstructor) {
    this.gridReconstructor = gridReconstructor;
  }

  select(detection, options = {}) {
    const schemeId = options.optionScheme || 'upper';
    const scheme = getOptionScheme(schemeId);
    const requestedCount = resolveOptionCount(schemeId, options.optionCount);
    const markStyle = options.markStyle || 'auto';
    const pools = detection.pools?.length
      ? detection.pools
      : [{ name: 'default', shapeKind: detection.shapeKind || 'bubble', candidates: detection.candidates, bubbleDiameter: detection.bubbleDiameter }];

    const candidateCounts =
      scheme.fixedCount != null
        ? [scheme.fixedCount]
        : requestedCount <= 3
          ? [requestedCount]
          : [...new Set([requestedCount, 4, 5, 6])].filter((n) => n >= scheme.minCount && n <= scheme.maxCount);

    const evaluations = [];
    for (const pool of pools) {
      if (!pool.candidates?.length) continue;
      for (const optCount of candidateCounts) {
        const structure = this.gridReconstructor.reconstruct(pool, {
          ...options,
          optionCount: optCount,
          optionScheme: schemeId
        });
        const baseScore = scoreStructureCandidate(structure, pool.candidates.length, options.expectedQuestions);
        const bonus = poolStyleBonus(pool, markStyle);
        evaluations.push({
          pool,
          optionCount: optCount,
          structure,
          baseScore,
          score: clamp(baseScore + bonus)
        });
      }
    }

    if (!evaluations.length) {
      const empty = this.gridReconstructor.reconstruct(
        { name: 'empty', candidates: [], bubbleDiameter: 0 },
        { ...options, optionCount: requestedCount, optionScheme: schemeId }
      );
      return {
        structure: empty,
        optionCount: requestedCount,
        requestedOptionCount: requestedCount,
        automaticallyAdjusted: false,
        hypotheses: []
      };
    }

    const bestRequested = evaluations
      .filter((e) => e.optionCount === requestedCount)
      .sort((a, b) => b.score - a.score)[0];

    const bestOverall = [...evaluations].sort((a, b) => b.score - a.score)[0];

    // Respect user's explicit optionCount whenever it resolves the sheet cleanly!
    // Never auto-increase optionCount (e.g. 4 -> 5 by absorbing the question-number column)
    // unless requestedCount completely failed (< 40% resolved). Only auto-decrease when fewer tracks exist.
    const margin = bestOverall.score - (bestRequested?.score ?? 0);
    const reqDiag = bestRequested?.structure?.diagnostics || {};
    const reqResolvedRatio =
      ((reqDiag.detectedRows || 0) + (reqDiag.inferredRows || 0)) / Math.max(1, options.expectedQuestions || 1);
    const tryingToIncrease = bestOverall.optionCount > requestedCount;
    const reqHealthy = tryingToIncrease
      ? reqResolvedRatio >= 0.4 && (reqDiag.bubbleCoverage || 0) >= 0.5
      : reqResolvedRatio >= 0.75 && (reqDiag.bubbleCoverage || 0) >= 0.7;
    const clearlyFewerTracks = bestOverall.optionCount < requestedCount && margin >= 0.05;
    const shouldSwitchCount =
      scheme.fixedCount == null &&
      bestOverall.optionCount !== requestedCount &&
      bestOverall.baseScore >= 0.55 &&
      margin >= 0.045 &&
      (!reqHealthy || clearlyFewerTracks);

    const chosen = shouldSwitchCount ? bestOverall : bestRequested || bestOverall;
    const adjusted = chosen.optionCount !== requestedCount;

    chosen.structure.diagnostics.requestedOptionCount = requestedCount;
    chosen.structure.diagnostics.detectedOptionCount = chosen.optionCount;
    chosen.structure.diagnostics.winningPool = chosen.pool.name;
    chosen.structure.diagnostics.poolHypotheses = evaluations
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((e) => ({
        pool: e.pool.name,
        shapeKind: e.pool.shapeKind,
        optionCount: e.optionCount,
        score: Math.round(e.score * 1000) / 1000,
        detectedRows: e.structure.diagnostics.detectedRows,
        inferredRows: e.structure.diagnostics.inferredRows,
        bubbleCoverage: Math.round((e.structure.diagnostics.bubbleCoverage || 0) * 1000) / 1000
      }));

    if (adjusted) {
      chosen.structure.diagnostics.warnings.unshift(
        `A configuração indicava ${requestedCount} alternativas, mas a grade física forma grupos consistentes de ${chosen.optionCount}. A leitura foi ajustada automaticamente para ${formatOptionRange(schemeId, chosen.optionCount)}.`
      );
    }

    return {
      structure: chosen.structure,
      optionCount: chosen.optionCount,
      requestedOptionCount: requestedCount,
      automaticallyAdjusted: adjusted,
      winningPool: chosen.pool.name,
      hypotheses: chosen.structure.diagnostics.poolHypotheses
    };
  }
}
