import { LIMITS } from '../config.js';
import { ImageLoader } from '../utils/image.js';
import {
  clamp,
  defaultQuad,
  orderQuad,
  polygonArea,
  quadDimensions,
  quadRightAngleScore
} from '../utils/math.js';

function matToPoints(mat) {
  const data = mat.data32S;
  const pts = [];
  for (let i = 0; i < data.length; i += 2) {
    pts.push({ x: data[i], y: data[i + 1] });
  }
  return pts;
}

function aspectRatioScore(width, height) {
  const ratio = width / Math.max(1, height);
  if (ratio < 0.34 || ratio > 2.95) return 0;
  const standardRatios = [0.707, 0.75, 1, 1.333, 1.414, 1.8];
  const closest = Math.min(...standardRatios.map((r) => Math.abs(Math.log(ratio / r))));
  return clamp(1 - closest / 0.95, 0.2, 1);
}

function borderTouchPenalty(points, width, height) {
  const margin = Math.min(width, height) * 0.008;
  return (
    points.filter((p) => p.x <= margin || p.y <= margin || p.x >= width - margin || p.y >= height - margin).length *
    0.06
  );
}

function normalizeDocScore(raw) {
  return clamp((raw - 0.25) / 0.58);
}

export class DocumentDetector {
  constructor(cv) {
    this.cv = cv;
  }

  detect(canvas) {
    const cv = this.cv;
    const { canvas: small, scale } = ImageLoader.downscale(canvas, LIMITS.documentDetectionMaxDimension);
    const src = cv.imread(small);
    const gray = new cv.Mat();
    const blurred = new cv.Mat();
    const edges = new cv.Mat();
    const closed = new cv.Mat();
    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();
    const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(7, 7));
    const candidates = [];

    try {
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
      cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT);

      const med = this.#medianGray(gray);
      const low = Math.max(28, Math.round(med * 0.28));
      const high = Math.max(low + 45, Math.round(med * 0.78));

      cv.Canny(blurred, edges, low, high, 3, false);
      cv.morphologyEx(edges, closed, cv.MORPH_CLOSE, kernel, new cv.Point(-1, -1), 2);
      cv.findContours(closed, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);

      const totalArea = small.width * small.height;
      for (let i = 0; i < contours.size(); i += 1) {
        const contour = contours.get(i);
        const areaRatio = Math.abs(cv.contourArea(contour)) / totalArea;
        if (areaRatio < LIMITS.minDocumentAreaRatio || areaRatio > LIMITS.maxDocumentAreaRatio) {
          contour.delete();
          continue;
        }
        const perimeter = cv.arcLength(contour, true);
        let approx = null;
        for (const eps of [0.015, 0.02, 0.028, 0.04, 0.055]) {
          const poly = new cv.Mat();
          cv.approxPolyDP(contour, poly, perimeter * eps, true);
          if (poly.rows === 4 && cv.isContourConvex(poly)) {
            approx?.delete();
            approx = poly;
            break;
          }
          poly.delete();
        }
        contour.delete();
        if (!approx) continue;

        const points = orderQuad(matToPoints(approx));
        const polyArea = polygonArea(points);
        const bbox = cv.boundingRect(approx);
        const rectangularity = clamp(polyArea / Math.max(1, bbox.width * bbox.height));
        const dims = quadDimensions(points);
        const angle = quadRightAngleScore(points);
        const aspect = aspectRatioScore(dims.width, dims.height);
        const areaScore = clamp((areaRatio - LIMITS.minDocumentAreaRatio) / 0.62);
        const structureScore = this.#interiorEdgeDensity(edges, approx, polyArea);
        const borderPenalty = borderTouchPenalty(points, small.width, small.height);
        const score = clamp(
          areaScore * 0.25 + rectangularity * 0.21 + angle * 0.23 + aspect * 0.11 + structureScore * 0.2 - borderPenalty
        );

        candidates.push({
          points,
          score,
          areaRatio,
          rectangularity,
          angleScore: angle,
          aspectScore: aspect,
          structureScore
        });
        approx.delete();
      }

      candidates.sort((a, b) => b.score - a.score);
      const best = candidates[0];
      if (!best || best.score < 0.34) {
        return {
          points: defaultQuad(canvas.width, canvas.height, 0.035),
          confidence: best ? normalizeDocScore(best.score) * 0.5 : 0.08,
          automatic: false,
          candidates: candidates.slice(0, 5).map((cand) => this.#scaleCandidate(cand, 1 / scale)),
          message: 'Não foi possível confirmar todo o contorno do papel. Ajuste os quatro cantos manualmente.'
        };
      }

      const confidence = normalizeDocScore(best.score);
      return {
        ...this.#scaleCandidate(best, 1 / scale),
        confidence,
        automatic: true,
        candidates: candidates.slice(0, 5).map((cand) => this.#scaleCandidate(cand, 1 / scale)),
        message:
          confidence < 0.62
            ? 'O limite da folha foi estimado com confiança moderada. Confira principalmente os cantos inferiores.'
            : null
      };
    } finally {
      src.delete();
      gray.delete();
      blurred.delete();
      edges.delete();
      closed.delete();
      contours.delete();
      hierarchy.delete();
      kernel.delete();
      small.width = 1;
      small.height = 1;
    }
  }

  #medianGray(grayMat) {
    const samples = [];
    const step = Math.max(1, Math.floor(Math.sqrt((grayMat.rows * grayMat.cols) / 18000)));
    for (let y = 0; y < grayMat.rows; y += step) {
      const rowOffset = y * grayMat.cols;
      for (let x = 0; x < grayMat.cols; x += step) {
        samples.push(grayMat.data[rowOffset + x]);
      }
    }
    samples.sort((a, b) => a - b);
    return samples[Math.floor(samples.length / 2)] ?? 128;
  }

  #interiorEdgeDensity(edgesMat, polyMat, area) {
    const cv = this.cv;
    const mask = cv.Mat.zeros(edgesMat.rows, edgesMat.cols, cv.CV_8UC1);
    const masked = new cv.Mat();
    try {
      cv.fillConvexPoly(mask, polyMat, new cv.Scalar(255));
      cv.bitwise_and(edgesMat, mask, masked);
      return clamp((cv.countNonZero(masked) / Math.max(1, area) - 0.004) / 0.055);
    } finally {
      mask.delete();
      masked.delete();
    }
  }

  #scaleCandidate(cand, factor) {
    return {
      ...cand,
      points: cand.points.map((pt) => ({ x: pt.x * factor, y: pt.y * factor }))
    };
  }
}

export function computeRectifiedGeometry(points, { maxDimension = LIMITS.rectifiedMaxDimension, minSide = 160 } = {}) {
  const ordered = orderQuad(points);
  const dimensions = quadDimensions(ordered);
  const longest = Math.max(dimensions.width, dimensions.height);
  const shortest = Math.max(1, Math.min(dimensions.width, dimensions.height));
  const maxScale = maxDimension / Math.max(1, longest);
  const minScale = minSide / shortest;
  const scale = Math.min(maxScale, Math.max(Math.min(1, maxScale), minScale));
  return {
    points: ordered,
    dimensions,
    scale,
    width: Math.max(2, Math.round(dimensions.width * scale)),
    height: Math.max(2, Math.round(dimensions.height * scale))
  };
}

export class PerspectiveCorrector {
  constructor(cv) {
    this.cv = cv;
  }

  rectify(sourceCanvas, points, { maxDimension = LIMITS.rectifiedMaxDimension } = {}) {
    const cv = this.cv;
    const geom = computeRectifiedGeometry(points, { maxDimension });
    const { points: ordered, scale, width, height } = geom;

    const src = cv.imread(sourceCanvas);
    const dst = new cv.Mat();
    const srcPts = cv.matFromArray(4, 1, cv.CV_32FC2, ordered.flatMap((p) => [p.x, p.y]));
    const dstPts = cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, width - 1, 0, width - 1, height - 1, 0, height - 1]);
    const homography = cv.getPerspectiveTransform(srcPts, dstPts);

    const outCanvas = document.createElement('canvas');
    outCanvas.width = width;
    outCanvas.height = height;

    try {
      cv.warpPerspective(src, dst, homography, new cv.Size(width, height), cv.INTER_CUBIC, cv.BORDER_REPLICATE);
      cv.imshow(outCanvas, dst);
      return {
        canvas: outCanvas,
        width,
        height,
        sourcePoints: ordered,
        scale,
        homography: Array.from(homography.data64F?.length ? homography.data64F : homography.data32F || [])
      };
    } finally {
      src.delete();
      dst.delete();
      srcPts.delete();
      dstPts.delete();
      homography.delete();
    }
  }
}
