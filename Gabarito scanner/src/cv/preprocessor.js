import { clamp, median } from '../utils/math.js';

function oddKernelSize(val) {
  const n = Math.max(3, Math.round(val));
  return n % 2 ? n : n + 1;
}

function matToCanvas(cv, mat) {
  const canvas = document.createElement('canvas');
  canvas.width = mat.cols;
  canvas.height = mat.rows;
  cv.imshow(canvas, mat);
  return canvas;
}

export class Preprocessor {
  constructor(cv) {
    this.cv = cv;
  }

  process(canvas) {
    const cv = this.cv;
    const rgba = cv.imread(canvas);
    const gray = new cv.Mat();
    const denoised = new cv.Mat();
    const claheOut = new cv.Mat();
    const bgBlur = new cv.Mat();
    const normalized = new cv.Mat();
    const inkDelta = new cv.Mat();
    const adaptive = new cv.Mat();
    const adaptiveFine = new cv.Mat();
    const otsu = new cv.Mat();
    const blackhat = new cv.Mat();
    const structureBinary = new cv.Mat();

    const minDim = Math.min(canvas.width, canvas.height);
    const bgKernel = oddKernelSize(clamp(minDim / 22, 31, 85));
    const adaptiveBlock = oddKernelSize(clamp(minDim / 34, 25, 71));
    const fineBlock = oddKernelSize(clamp(minDim / 56, 15, 41));
    const bhSize = oddKernelSize(clamp(minDim / 180, 5, 15));
    const bhKernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(bhSize, bhSize));
    let clahe = null;

    try {
      cv.cvtColor(rgba, gray, cv.COLOR_RGBA2GRAY);
      cv.medianBlur(gray, denoised, 3);

      // Gentle CLAHE improves contrast on low-contrast pencil/pen strokes and shadows
      try {
        clahe = new cv.CLAHE(1.8, new cv.Size(8, 8));
        clahe.apply(denoised, claheOut);
      } catch {
        denoised.copyTo(claheOut);
      }

      // Local background illumination removal
      cv.GaussianBlur(denoised, bgBlur, new cv.Size(bgKernel, bgKernel), 0);
      cv.addWeighted(denoised, 1, bgBlur, -1, 128, normalized);
      cv.normalize(normalized, normalized, 0, 255, cv.NORM_MINMAX);

      // Soft ink delta map: positive values indicate pixels darker than local paper background
      // Crucial for thin strokes (X, slash, circle-around-letter, parentheses, quotes)
      cv.subtract(bgBlur, denoised, inkDelta);

      // Adaptive threshold (standard + finer for small printed characters/parentheses/quotes)
      cv.adaptiveThreshold(
        normalized,
        adaptive,
        255,
        cv.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv.THRESH_BINARY_INV,
        adaptiveBlock,
        7
      );
      cv.adaptiveThreshold(
        claheOut,
        adaptiveFine,
        255,
        cv.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv.THRESH_BINARY_INV,
        fineBlock,
        9
      );

      cv.threshold(normalized, otsu, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU);
      cv.morphologyEx(normalized, blackhat, cv.MORPH_BLACKHAT, bhKernel);

      // Clean combined binary for structure detection
      cv.bitwise_or(adaptive, otsu, structureBinary);
      const closeKernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(3, 3));
      cv.morphologyEx(structureBinary, structureBinary, cv.MORPH_CLOSE, closeKernel, new cv.Point(-1, -1), 1);
      closeKernel.delete();

      const diagnostics = this.#measureDiagnostics(gray, normalized);
      const snapshots = {
        normalized: matToCanvas(cv, normalized),
        threshold: matToCanvas(cv, adaptive)
      };

      rgba.delete();
      denoised.delete();
      bgBlur.delete();
      bhKernel.delete();
      clahe?.delete?.();

      return {
        gray,
        clahe: claheOut,
        normalized,
        inkDelta,
        adaptive,
        adaptiveFine,
        otsu,
        blackhat,
        structureBinary,
        diagnostics,
        snapshots,
        dispose() {
          gray.delete();
          claheOut.delete();
          normalized.delete();
          inkDelta.delete();
          adaptive.delete();
          adaptiveFine.delete();
          otsu.delete();
          blackhat.delete();
          structureBinary.delete();
        }
      };
    } catch (err) {
      rgba.delete();
      gray.delete();
      denoised.delete();
      claheOut.delete();
      bgBlur.delete();
      normalized.delete();
      inkDelta.delete();
      adaptive.delete();
      adaptiveFine.delete();
      otsu.delete();
      blackhat.delete();
      structureBinary.delete();
      bhKernel.delete();
      clahe?.delete?.();
      throw err;
    }
  }

  #measureDiagnostics(grayMat, normMat) {
    const step = Math.max(1, Math.floor(Math.sqrt((grayMat.rows * grayMat.cols) / 48000)));
    const graySamples = [];
    const normSamples = [];
    for (let y = 0; y < grayMat.rows; y += step) {
      const offset = y * grayMat.cols;
      for (let x = 0; x < grayMat.cols; x += step) {
        graySamples.push(grayMat.data[offset + x]);
        normSamples.push(normMat.data[offset + x]);
      }
    }
    return {
      medianBrightness: median(graySamples),
      normalizedMedian: median(normSamples),
      darkClippingRatio: graySamples.filter((v) => v < 16).length / Math.max(1, graySamples.length),
      brightClippingRatio: graySamples.filter((v) => v > 247).length / Math.max(1, graySamples.length)
    };
  }
}
