(function (App) {
  "use strict";

  const { isFileProtocol, getPreferredCorePath } = App.config;

  const loadedScripts = new Map();
  let workerInstance = null;
  let workerLanguage = "";
  let activeProgressHandler = null;
  let cancelRequested = false;

  // Direct WASM state (used automatically when opened via file:// with no server)
  let directCorePromise = null;
  const loadedDirectLangs = new Set();

  const STATUS_LABELS = {
    "loading tesseract core": "Carregando núcleo OCR…",
    "initializing tesseract": "Inicializando motor OCR…",
    "loading language traineddata": "Carregando dicionário de idioma…",
    "initializing api": "Preparando reconhecimento…",
    "recognizing text": "Reconhecendo texto da página…"
  };

  function loadScriptOnce(src) {
    if (loadedScripts.has(src)) return loadedScripts.get(src);

    const promise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        loadedScripts.delete(src);
        reject(new Error(`Falha ao carregar script local: ${src}`));
      };
      document.head.appendChild(script);
    });

    loadedScripts.set(src, promise);
    return promise;
  }

  async function loadLocalOcrEngine() {
    if (isFileProtocol()) {
      await loadScriptOnce(getPreferredCorePath());
      if (typeof window.TesseractCore !== "function") {
        throw new Error("TesseractCore não foi encontrado após carregar o núcleo WASM.");
      }
      return window.TesseractCore;
    }

    await loadScriptOnce("./vendor/tesseract.min.js");
    if (!window.Tesseract) {
      throw new Error("Tesseract não foi encontrado após carregar o script local.");
    }
    return window.Tesseract;
  }

  async function terminateOcrWorker() {
    const current = workerInstance;
    workerInstance = null;
    workerLanguage = "";
    if (current) {
      try {
        await current.terminate();
      } catch {}
    }
  }

  async function cancelOcr() {
    cancelRequested = true;
    await terminateOcrWorker();
  }

  // ---- Mode 1: Direct TesseractCore WASM (works on file:// with zero server) ----

  function base64ToUint8Array(base64) {
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  async function gunzipBytes(gzBytes) {
    if (typeof DecompressionStream === "function") {
      const ds = new DecompressionStream("gzip");
      const stream = new Blob([gzBytes]).stream().pipeThrough(ds);
      const buffer = await new Response(stream).arrayBuffer();
      return new Uint8Array(buffer);
    }
    throw new Error("Este navegador não suporta DecompressionStream para descompactar idiomas via file://.");
  }

  async function ensureDirectCore() {
    await loadLocalOcrEngine();
    if (!directCorePromise) {
      directCorePromise = window.TesseractCore();
    }
    return directCorePromise;
  }

  async function ensureDirectLanguages(core, language, onProgress) {
    const langs = String(language || "por").split("+").filter(Boolean);

    for (let i = 0; i < langs.length; i++) {
      const lang = langs[i];
      if (loadedDirectLangs.has(lang)) continue;

      onProgress?.({
        status: "loading language traineddata",
        label: `Carregando idioma (${lang})…`,
        progress: 25 + Math.round((i / langs.length) * 30)
      });

      await loadScriptOnce(`./vendor/lang/${lang}.traineddata.js`);
      const b64 = window.__LEITOR_LANG_GZ__?.[lang];
      if (!b64) {
        throw new Error(`Pacote de idioma local ausente: vendor/lang/${lang}.traineddata.js`);
      }

      const gzBytes = base64ToUint8Array(b64);
      const rawBytes = await gunzipBytes(gzBytes);
      core.FS.writeFile(`./${lang}.traineddata`, rawBytes);
      loadedDirectLangs.add(lang);
    }
  }

  async function recognizeDirect(imageBlob, { language, psm, onProgress }) {
    onProgress?.({
      status: "loading tesseract core",
      label: "Inicializando motor WASM local…",
      progress: 12
    });

    const core = await ensureDirectCore();
    if (cancelRequested) return { text: "", confidence: 0, canceled: true };

    await ensureDirectLanguages(core, language, onProgress);
    if (cancelRequested) return { text: "", confidence: 0, canceled: true };

    onProgress?.({
      status: "recognizing text",
      label: "Reconhecendo texto da página…",
      progress: 65
    });

    // Yield one frame so the progress bar paints before synchronous WASM OCR runs
    await new Promise((resolve) => setTimeout(resolve, 30));
    if (cancelRequested) return { text: "", confidence: 0, canceled: true };

    const api = new core.TessBaseAPI();
    try {
      const initRes = api.Init(null, language, 1);
      if (initRes === -1) {
        throw new Error(`Falha ao inicializar Tesseract para o idioma "${language}".`);
      }

      api.SetVariable("tessedit_pageseg_mode", String(psm || "3"));
      api.SetVariable("preserve_interword_spaces", "1");
      api.SetVariable("user_defined_dpi", "300");

      const imageBytes = new Uint8Array(await imageBlob.arrayBuffer());
      core.FS.writeFile("/input", imageBytes);

      if (api.SetImageFile(1, 0) === 1) {
        throw new Error("Não foi possível decodificar a imagem no motor OCR.");
      }

      api.Recognize(null);
      const text = (api.GetUTF8Text() || "").trim();
      const confidence = Math.round(api.MeanTextConf() || 0);

      try {
        core.FS.unlink("/input");
      } catch {}

      onProgress?.({
        status: "recognizing text",
        label: "Finalizando reconhecimento…",
        progress: 98
      });

      return { text, confidence, canceled: false };
    } finally {
      try { api.End(); } catch {}
      try { core.destroy(api); } catch {}
    }
  }

  // ---- Mode 2: Web Worker Tesseract.js (non-blocking on http:// and https://) ----

  async function ensureWorker(language) {
    await loadLocalOcrEngine();

    if (workerInstance && workerLanguage === language) {
      return workerInstance;
    }

    await terminateOcrWorker();

    const base = new URL("./", window.location.href);
    const workerPath = new URL("vendor/worker.min.js", base).href;
    const langPath = new URL("vendor/lang", base).href.replace(/\/$/, "");
    const corePath = new URL("vendor/core", base).href.replace(/\/$/, "");

    const worker = await window.Tesseract.createWorker(language, 1, {
      workerPath,
      langPath,
      corePath,
      workerBlobURL: false,
      cacheMethod: "none",
      gzip: true,
      logger: (message) => {
        if (!message || !activeProgressHandler) return;
        const pct = typeof message.progress === "number" ? Math.round(message.progress * 100) : 0;
        const label = STATUS_LABELS[message.status] || "Processando…";
        activeProgressHandler({ status: message.status, label, progress: pct });
      },
      errorHandler: (err) => {
        console.error("Tesseract worker:", err);
      }
    });

    workerInstance = worker;
    workerLanguage = language;
    return worker;
  }

  async function recognizeWithWorker(imageBlob, { language, psm, onProgress }) {
    activeProgressHandler = onProgress || null;
    try {
      const worker = await ensureWorker(language);
      if (cancelRequested) return { text: "", confidence: 0, canceled: true };

      try {
        await worker.setParameters({
          tessedit_pageseg_mode: String(psm || "3"),
          preserve_interword_spaces: "1",
          user_defined_dpi: "300"
        });
      } catch (paramErr) {
        console.warn("Não foi possível aplicar parâmetros extras do Tesseract:", paramErr);
      }

      const result = await worker.recognize(imageBlob);
      if (cancelRequested) return { text: "", confidence: 0, canceled: true };

      return {
        text: (result?.data?.text || "").trim(),
        confidence: Math.round(result?.data?.confidence || 0),
        canceled: false
      };
    } catch (err) {
      if (cancelRequested) return { text: "", confidence: 0, canceled: true };
      await terminateOcrWorker();
      throw err;
    } finally {
      activeProgressHandler = null;
    }
  }

  async function recognizePage(imageBlob, { language = "por", psm = "3", onProgress } = {}) {
    cancelRequested = false;
    if (isFileProtocol()) {
      return recognizeDirect(imageBlob, { language, psm, onProgress });
    }
    return recognizeWithWorker(imageBlob, { language, psm, onProgress });
  }

  App.ocr = {
    loadLocalOcrEngine,
    recognizePage,
    cancelOcr,
    terminateOcrWorker
  };
})((window.LeitorApp = window.LeitorApp || {}));
