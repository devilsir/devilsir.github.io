export function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
}

export function sum(values) {
  return values.reduce((acc, v) => acc + v, 0);
}

export function mean(values) {
  return values.length ? sum(values) / values.length : 0;
}

export function median(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function percentile(values, p) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = clamp(p, 0, 1) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  const frac = idx - lo;
  return sorted[lo] * (1 - frac) + sorted[hi] * frac;
}

export function mad(values, center = median(values)) {
  return median(values.map((v) => Math.abs(v - center)));
}

export function variance(values, avg = mean(values)) {
  return values.length ? mean(values.map((v) => (v - avg) ** 2)) : 0;
}

export function stdDev(values) {
  return Math.sqrt(variance(values));
}

export function coeffOfVariation(values) {
  const avg = mean(values);
  if (!values.length || Math.abs(avg) < 1e-9) return Infinity;
  return Math.sqrt(variance(values, avg)) / Math.abs(avg);
}

export function relativeStd(values) {
  const avg = mean(values);
  return avg > 1e-6 ? stdDev(values) / avg : 0;
}

export function sigmoid(x) {
  if (x >= 0) return 1 / (1 + Math.exp(-x));
  const ex = Math.exp(x);
  return ex / (1 + ex);
}

export function modePeak(values, { bins = 24, min, max, weights } = {}) {
  if (!values.length) return 0;
  const lo = min ?? Math.min(...values);
  const hi = max ?? Math.max(...values);
  if (Math.abs(hi - lo) < 1e-9) return lo;

  const counts = Array.from({ length: bins }, () => 0);
  const buckets = Array.from({ length: bins }, () => []);
  values.forEach((v, idx) => {
    if (v < lo || v > hi) return;
    const bin = Math.min(bins - 1, Math.floor(((v - lo) / (hi - lo)) * bins));
    counts[bin] += weights?.[idx] ?? 1;
    buckets[bin].push(v);
  });

  let bestBin = 0;
  for (let i = 1; i < bins; i += 1) {
    if (counts[i] > counts[bestBin]) bestBin = i;
  }
  const neighborhood = [bestBin - 1, bestBin, bestBin + 1]
    .filter((b) => b >= 0 && b < bins)
    .flatMap((b) => buckets[b]);
  return median(neighborhood.length ? neighborhood : values);
}

export function confidenceLabel(score) {
  return score >= 0.82 ? 'alta' : score >= 0.58 ? 'média' : 'baixa';
}

export function round(value, digits = 3) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function cross2d(a, b, c) {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

export function orderQuad(points) {
  if (!Array.isArray(points) || points.length !== 4) {
    throw new Error('O quadrilátero precisa ter exatamente quatro pontos.');
  }
  const centroid = {
    x: points.reduce((acc, p) => acc + p.x, 0) / 4,
    y: points.reduce((acc, p) => acc + p.y, 0) / 4
  };
  const sorted = [...points].sort(
    (a, b) => Math.atan2(a.y - centroid.y, a.x - centroid.x) - Math.atan2(b.y - centroid.y, b.x - centroid.x)
  );
  const topLeftIdx = sorted.reduce((bestIdx, pt, idx) => {
    const bestSum = sorted[bestIdx].x + sorted[bestIdx].y;
    return pt.x + pt.y < bestSum ? idx : bestIdx;
  }, 0);
  const ordered = [...sorted.slice(topLeftIdx), ...sorted.slice(0, topLeftIdx)];
  return cross2d(ordered[0], ordered[1], ordered[2]) < 0
    ? [ordered[0], ordered[3], ordered[2], ordered[1]]
    : ordered;
}

export function polygonArea(points) {
  let area = 0;
  for (let i = 0; i < points.length; i += 1) {
    const next = (i + 1) % points.length;
    area += points[i].x * points[next].y - points[next].x * points[i].y;
  }
  return Math.abs(area) / 2;
}

export function quadDimensions(points) {
  const [tl, tr, br, bl] = orderQuad(points);
  return {
    width: Math.max(distance(tl, tr), distance(bl, br)),
    height: Math.max(distance(tl, bl), distance(tr, br))
  };
}

export function clampPoint(point, width, height, margin = 0) {
  return {
    x: clamp(point.x, margin, Math.max(margin, width - margin)),
    y: clamp(point.y, margin, Math.max(margin, height - margin))
  };
}

export function defaultQuad(width, height, inset = 0.035) {
  const dx = width * inset;
  const dy = height * inset;
  return [
    { x: dx, y: dy },
    { x: width - dx, y: dy },
    { x: width - dx, y: height - dy },
    { x: dx, y: height - dy }
  ];
}

export function cornerRightAngleScore(prev, curr, next) {
  const u = { x: prev.x - curr.x, y: prev.y - curr.y };
  const v = { x: next.x - curr.x, y: next.y - curr.y };
  const denom = Math.hypot(u.x, u.y) * Math.hypot(v.x, v.y);
  return denom ? clamp(1 - Math.abs((u.x * v.x + u.y * v.y) / denom) / 0.55) : 0;
}

export function quadRightAngleScore(points) {
  const ordered = orderQuad(points);
  return (
    ordered.reduce((acc, pt, idx) => {
      const prev = ordered[(idx + 3) % 4];
      const next = ordered[(idx + 1) % 4];
      return acc + cornerRightAngleScore(prev, pt, next);
    }, 0) / 4
  );
}

export function cluster1D(items, accessor, tolerance) {
  if (!items.length) return [];
  const sorted = [...items].sort((a, b) => accessor(a) - accessor(b));
  const clusters = [];
  for (const item of sorted) {
    const val = accessor(item);
    let best = null;
    let bestDist = Infinity;
    for (const cluster of clusters) {
      const dist = Math.abs(val - cluster.center);
      if (dist <= tolerance && dist < bestDist) {
        best = cluster;
        bestDist = dist;
      }
    }
    if (best) {
      best.items.push(item);
      best.center = median(best.items.map(accessor));
    } else {
      clusters.push({ center: val, items: [item] });
    }
  }
  return clusters;
}

export function rotatePoint(point, width, height, direction) {
  return direction === 'clockwise'
    ? { x: height - point.y, y: point.x }
    : { x: point.y, y: width - point.x };
}

export function ellipseNormDistance(point, bubble) {
  const rx = Math.max(1, bubble.radiusX);
  const ry = Math.max(1, bubble.radiusY);
  return Math.hypot((point.x - bubble.centerX) / rx, (point.y - bubble.centerY) / ry);
}

/**
 * Robust Theil-Sen linear slope fit: y = intercept + slope * (x - refX)
 * Resists outliers when estimating slight sheet tilt along a block.
 */
export function fitRobustLine(points, maxAbsSlope = 0.08) {
  if (!points || points.length < 2) {
    return { slope: 0, refX: points?.[0]?.x ?? 0, intercept: points?.[0]?.y ?? 0 };
  }
  const refX = median(points.map((p) => p.x));
  const slopes = [];
  for (let i = 0; i < points.length; i += 1) {
    for (let j = i + 1; j < points.length; j += 1) {
      const dx = points[j].x - points[i].x;
      if (Math.abs(dx) < 1e-3) continue;
      const s = (points[j].y - points[i].y) / dx;
      if (Math.abs(s) <= maxAbsSlope) slopes.push(s);
    }
  }
  const slope = slopes.length ? clamp(median(slopes), -maxAbsSlope, maxAbsSlope) : 0;
  const intercept = median(points.map((p) => p.y - slope * (p.x - refX)));
  return { slope, refX, intercept };
}
