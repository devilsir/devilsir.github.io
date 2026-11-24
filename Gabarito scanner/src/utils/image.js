import { LIMITS } from '../config.js';

function createCanvas(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  return canvas;
}

function drawResized(source, width, height) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: true });
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas;
}

async function decodeWithBitmap(file) {
  if (!('createImageBitmap' in window)) return null;
  try {
    return await createImageBitmap(file, {
      imageOrientation: 'from-image',
      premultiplyAlpha: 'none'
    });
  } catch {
    return null;
  }
}

function decodeWithImageElement(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('A imagem não pôde ser decodificada. Tente converter para JPG ou PNG.'));
    };
    img.src = url;
  });
}

export class ImageLoader {
  static async fromFile(file, { maxDimension = LIMITS.uploadMaxDimension } = {}) {
    if (!(file instanceof Blob) || !file.size) {
      throw new Error('Selecione um arquivo de imagem válido.');
    }
    const decoded = (await decodeWithBitmap(file)) || (await decodeWithImageElement(file));
    const originalWidth = decoded.width || decoded.naturalWidth;
    const originalHeight = decoded.height || decoded.naturalHeight;
    if (!originalWidth || !originalHeight) {
      throw new Error('A imagem selecionada não possui dimensões válidas.');
    }
    const workingScale = Math.min(1, maxDimension / Math.max(originalWidth, originalHeight));
    const canvas = drawResized(decoded, originalWidth * workingScale, originalHeight * workingScale);
    decoded.close?.();
    return {
      canvas,
      originalWidth,
      originalHeight,
      workingScale,
      name: file.name || 'captura',
      mimeType: file.type || 'image/*'
    };
  }

  static fromCanvas(source, { maxDimension = LIMITS.uploadMaxDimension, name = 'demonstração' } = {}) {
    const workingScale = Math.min(1, maxDimension / Math.max(source.width, source.height));
    return {
      canvas: drawResized(source, source.width * workingScale, source.height * workingScale),
      originalWidth: source.width,
      originalHeight: source.height,
      workingScale,
      name,
      mimeType: 'image/png'
    };
  }

  static rotate(source, direction) {
    const canvas = createCanvas(source.height, source.width);
    const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: true });
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    if (direction === 'clockwise') {
      ctx.translate(canvas.width, 0);
      ctx.rotate(Math.PI / 2);
    } else {
      ctx.translate(0, canvas.height);
      ctx.rotate(-Math.PI / 2);
    }
    ctx.drawImage(source, 0, 0);
    ctx.restore();
    return canvas;
  }

  static clone(source) {
    return drawResized(source, source.width, source.height);
  }

  static downscale(source, maxDimension) {
    const scale = Math.min(1, maxDimension / Math.max(source.width, source.height));
    return {
      canvas: scale < 1 ? drawResized(source, source.width * scale, source.height * scale) : ImageLoader.clone(source),
      scale
    };
  }

  static toDataUrl(canvas, type = 'image/jpeg', quality = 0.9) {
    return canvas.toDataURL(type, quality);
  }
}

let openCVPromise = null;

function stripThenable(moduleObj) {
  if (typeof moduleObj?.then !== 'function') return moduleObj;
  try {
    delete moduleObj.then;
  } catch {}
  if (typeof moduleObj.then === 'function') {
    try {
      Object.defineProperty(moduleObj, 'then', {
        configurable: true,
        enumerable: false,
        value: undefined,
        writable: true
      });
    } catch {
      throw new Error('O OpenCV.js carregou com uma interface assíncrona incompatível.');
    }
  }
  return moduleObj;
}

function waitForOpenCVReady(cvCandidate, timeoutMs) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const timer = globalThis.setTimeout(() => {
      if (!settled) {
        settled = true;
        reject(new Error('O OpenCV.js demorou demais para inicializar. Recarregue a página e tente novamente.'));
      }
    }, timeoutMs);

    const fail = (err) => {
      if (!settled) {
        settled = true;
        globalThis.clearTimeout(timer);
        reject(err instanceof Error ? err : new Error(String(err || 'Falha ao inicializar o OpenCV.js.')));
      }
    };

    const succeed = (cvObj) => {
      if (settled) return;
      if (!cvObj?.Mat || !cvObj?.findContours || !cvObj?.warpPerspective) {
        fail(new Error('A instalação do OpenCV.js está incompleta neste navegador.'));
        return;
      }
      try {
        const clean = stripThenable(cvObj);
        settled = true;
        globalThis.clearTimeout(timer);
        resolve(clean);
      } catch (err) {
        fail(err);
      }
    };

    if (typeof cvCandidate?.then === 'function') {
      try {
        cvCandidate.then(succeed, fail);
      } catch (err) {
        fail(err);
      }
      return;
    }

    if (cvCandidate?.Mat) {
      succeed(cvCandidate);
      return;
    }

    if (!cvCandidate || (typeof cvCandidate !== 'object' && typeof cvCandidate !== 'function')) {
      fail(new Error('O OpenCV.js não criou um módulo válido.'));
      return;
    }

    const previous = cvCandidate.onRuntimeInitialized;
    cvCandidate.onRuntimeInitialized = () => {
      previous?.();
      succeed(cvCandidate);
    };
  });
}

export function loadOpenCV({ onStatus, timeoutMs = 45000 } = {}) {
  if (openCVPromise) return openCVPromise;

  openCVPromise = new Promise((resolve, reject) => {
    onStatus?.('loading');
    const existingScript = document.querySelector('script[data-opencv-runtime]');
    if (existingScript && window.cv) {
      waitForOpenCVReady(window.cv, timeoutMs)
        .then((cv) => {
          onStatus?.('ready');
          resolve(cv);
        })
        .catch(reject);
      return;
    }

    const script = existingScript || document.createElement('script');
    script.dataset.opencvRuntime = 'true';
    script.async = true;
    script.src = new URL('./vendor/opencv.js', document.baseURI).href;

    script.addEventListener(
      'load',
      () => {
        waitForOpenCVReady(window.cv, timeoutMs)
          .then((cv) => {
            onStatus?.('ready');
            resolve(cv);
          })
          .catch((err) => {
            openCVPromise = null;
            onStatus?.('error', err);
            reject(err);
          });
      },
      { once: true }
    );

    script.addEventListener(
      'error',
      () => {
        const err = new Error('Não foi possível carregar o motor local de visão computacional.');
        openCVPromise = null;
        onStatus?.('error', err);
        reject(err);
      },
      { once: true }
    );

    if (!existingScript) document.head.append(script);
  });

  return openCVPromise;
}
