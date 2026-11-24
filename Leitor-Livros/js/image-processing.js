(function (App) {
  "use strict";

  function clampByte(value) {
    return value < 0 ? 0 : value > 255 ? 255 : value;
  }

  function buildIntegralImage(gray, width, height) {
    const stride = width + 1;
    const integral = new Float64Array(stride * (height + 1));

    for (let y = 0; y < height; y++) {
      let rowSum = 0;
      const rowOffset = y * width;
      const prevRow = y * stride;
      const currRow = (y + 1) * stride;
      for (let x = 0; x < width; x++) {
        rowSum += gray[rowOffset + x];
        integral[currRow + x + 1] = integral[prevRow + x + 1] + rowSum;
      }
    }
    return integral;
  }

  function windowMean(integral, stride, width, height, x, y, radius) {
    const x0 = Math.max(0, x - radius);
    const y0 = Math.max(0, y - radius);
    const x1 = Math.min(width - 1, x + radius);
    const y1 = Math.min(height - 1, y + radius);

    const area = (x1 - x0 + 1) * (y1 - y0 + 1);
    const a = integral[y0 * stride + x0];
    const b = integral[y0 * stride + (x1 + 1)];
    const c = integral[(y1 + 1) * stride + x0];
    const d = integral[(y1 + 1) * stride + (x1 + 1)];
    return (d - b - c + a) / area;
  }

  function normalizeIllumination(gray, width, height) {
    const radius = Math.max(18, Math.round(Math.min(width, height) * 0.032));
    const integral = buildIntegralImage(gray, width, height);
    const stride = width + 1;
    const out = new Uint8ClampedArray(width * height);

    for (let y = 0; y < height; y++) {
      const rowOffset = y * width;
      for (let x = 0; x < width; x++) {
        const idx = rowOffset + x;
        const localBg = Math.max(24, windowMean(integral, stride, width, height, x, y, radius));
        out[idx] = clampByte((gray[idx] / localBg) * 238);
      }
    }
    return out;
  }

  function percentileStretch(gray) {
    const hist = new Uint32Array(256);
    for (let i = 0; i < gray.length; i++) hist[gray[i]]++;

    const total = gray.length;
    const lowTarget = total * 0.015;
    const highTarget = total * 0.985;

    let acc = 0;
    let low = 0;
    for (let i = 0; i < 256; i++) {
      acc += hist[i];
      if (acc >= lowTarget) {
        low = i;
        break;
      }
    }

    acc = 0;
    let high = 255;
    for (let i = 0; i < 256; i++) {
      acc += hist[i];
      if (acc >= highTarget) {
        high = i;
        break;
      }
    }

    const range = Math.max(36, high - low);
    const out = new Uint8ClampedArray(gray.length);
    for (let i = 0; i < gray.length; i++) {
      out[i] = clampByte(((gray[i] - low) * 255) / range);
    }
    return out;
  }

  function sharpenGray(gray, width, height, amount = 0.35) {
    const out = new Uint8ClampedArray(gray.length);
    for (let y = 0; y < height; y++) {
      const yPrev = y > 0 ? y - 1 : 0;
      const yNext = y < height - 1 ? y + 1 : height - 1;
      const row = y * width;
      const rowPrev = yPrev * width;
      const rowNext = yNext * width;

      for (let x = 0; x < width; x++) {
        const xPrev = x > 0 ? x - 1 : 0;
        const xNext = x < width - 1 ? x + 1 : width - 1;

        const avg =
          (gray[rowPrev + xPrev] +
            gray[rowPrev + x] +
            gray[rowPrev + xNext] +
            gray[row + xPrev] +
            gray[row + x] +
            gray[row + xNext] +
            gray[rowNext + xPrev] +
            gray[rowNext + x] +
            gray[rowNext + xNext]) /
          9;

        const idx = row + x;
        out[idx] = clampByte(gray[idx] + amount * (gray[idx] - avg));
      }
    }
    return out;
  }

  function adaptiveBinarize(gray, width, height) {
    const radius = Math.max(12, Math.round(Math.min(width, height) * 0.018));
    const integral = buildIntegralImage(gray, width, height);
    const stride = width + 1;
    const out = new Uint8ClampedArray(width * height);
    const thresholdFactor = 0.88;

    for (let y = 0; y < height; y++) {
      const rowOffset = y * width;
      for (let x = 0; x < width; x++) {
        const idx = rowOffset + x;
        const mean = windowMean(integral, stride, width, height, x, y, radius);
        out[idx] = gray[idx] < mean * thresholdFactor ? 0 : 255;
      }
    }
    return out;
  }

  async function drawBitmapToCanvas(file, canvas, { maxDimension = 2400, rotation = 0 } = {}) {
    const bitmap = await createImageBitmap(file);
    try {
      const normalizedRot = ((rotation % 360) + 360) % 360;
      const swapped = normalizedRot === 90 || normalizedRot === 270;
      const srcW = bitmap.width;
      const srcH = bitmap.height;

      const scale = Math.min(1, maxDimension / Math.max(srcW, srcH));
      const drawW = Math.max(1, Math.round(srcW * scale));
      const drawH = Math.max(1, Math.round(srcH * scale));

      canvas.width = swapped ? drawH : drawW;
      canvas.height = swapped ? drawW : drawH;

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      ctx.save();
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (normalizedRot === 90) {
        ctx.translate(canvas.width, 0);
        ctx.rotate(Math.PI / 2);
      } else if (normalizedRot === 180) {
        ctx.translate(canvas.width, canvas.height);
        ctx.rotate(Math.PI);
      } else if (normalizedRot === 270) {
        ctx.translate(0, canvas.height);
        ctx.rotate((3 * Math.PI) / 2);
      }

      ctx.drawImage(bitmap, 0, 0, drawW, drawH);
      ctx.restore();
      return { width: canvas.width, height: canvas.height, ctx };
    } finally {
      bitmap.close?.();
    }
  }

  async function preprocessImage(file, canvas, options = {}) {
    const {
      rotation = 0,
      grayscale = true,
      contrast = true,
      removeShadow = true,
      binarize = false,
      maxDimension = 2400
    } = options;

    const needsPixelWork = grayscale || contrast || removeShadow || binarize;
    if (!needsPixelWork && ((rotation % 360) + 360) % 360 === 0) {
      return file;
    }

    const { width, height, ctx } = await drawBitmapToCanvas(file, canvas, {
      maxDimension,
      rotation
    });

    if (needsPixelWork) {
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;

      if (grayscale || removeShadow || binarize) {
        let gray = new Uint8ClampedArray(width * height);
        for (let i = 0, p = 0; i < data.length; i += 4, p++) {
          gray[p] = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
        }

        if (removeShadow) gray = normalizeIllumination(gray, width, height);
        if (contrast) {
          gray = percentileStretch(gray);
          gray = sharpenGray(gray, width, height, 0.32);
        }
        if (binarize) gray = adaptiveBinarize(gray, width, height);

        for (let i = 0, p = 0; i < data.length; i += 4, p++) {
          const v = gray[p];
          data[i] = v;
          data[i + 1] = v;
          data[i + 2] = v;
        }
      } else if (contrast) {
        const lum = new Uint8ClampedArray(width * height);
        for (let i = 0, p = 0; i < data.length; i += 4, p++) {
          lum[p] = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
        }
        const hist = new Uint32Array(256);
        for (let i = 0; i < lum.length; i++) hist[lum[i]]++;
        let acc = 0, low = 0, high = 255;
        for (let i = 0; i < 256; i++) {
          acc += hist[i];
          if (acc >= lum.length * 0.015) { low = i; break; }
        }
        acc = 0;
        for (let i = 0; i < 256; i++) {
          acc += hist[i];
          if (acc >= lum.length * 0.985) { high = i; break; }
        }
        const range = Math.max(36, high - low);
        for (let i = 0; i < data.length; i += 4) {
          data[i] = clampByte(((data[i] - low) * 255) / range);
          data[i + 1] = clampByte(((data[i + 1] - low) * 255) / range);
          data[i + 2] = clampByte(((data[i + 2] - low) * 255) / range);
        }
      }

      ctx.putImageData(imgData, 0, 0);
    }

    const mime = binarize ? "image/png" : "image/jpeg";
    const quality = binarize ? undefined : 0.94;
    return await new Promise((resolve) =>
      canvas.toBlob((blob) => resolve(blob || file), mime, quality)
    );
  }

  async function compressImageForHistory(file, rotation = 0) {
    try {
      const canvas = document.createElement("canvas");
      await drawBitmapToCanvas(file, canvas, { maxDimension: 1400, rotation });
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.8));
      return blob || file;
    } catch {
      return file;
    }
  }

  App.imageProcessing = {
    preprocessImage,
    compressImageForHistory
  };
})((window.LeitorApp = window.LeitorApp || {}));
