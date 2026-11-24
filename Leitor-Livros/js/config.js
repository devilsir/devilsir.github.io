(function (App) {
  "use strict";

  const APP_VERSION = "2.3.0";
  const CACHE_NAME = `leitor-livros-v${APP_VERSION}`;
  const SETTINGS_KEY = "bookReaderSettings";

  const HISTORY_DB = "LeitorLivrosMemoria";
  const HISTORY_DB_VERSION = 1;
  const HISTORY_STORE = "pages";

  const CORE_SIMD_PATH = "./vendor/core/tesseract-core-simd-lstm.wasm.js";
  const CORE_FALLBACK_PATH = "./vendor/core/tesseract-core-lstm.wasm.js";

  function isFileProtocol() {
    return typeof window !== "undefined" && window.location.protocol === "file:";
  }

  function supportsWasmSimd() {
    try {
      return (
        typeof WebAssembly === "object" &&
        WebAssembly.validate(
          new Uint8Array([
            0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0,
            10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11
          ])
        )
      );
    } catch {
      return false;
    }
  }

  function getPreferredCorePath() {
    return supportsWasmSimd() ? CORE_SIMD_PATH : CORE_FALLBACK_PATH;
  }

  function getRequiredOfflineAssets() {
    return [
      "./",
      "./index.html",
      "./style.css",
      "./manifest.webmanifest",
      "./icons/icon-192.png",
      "./icons/icon-512.png",
      "./js/config.js",
      "./js/image-processing.js",
      "./js/text-cleaner.js",
      "./js/storage.js",
      "./js/ocr.js",
      "./js/piper-tts.js",
      "./js/tts.js",
      "./js/offline.js",
      "./js/main.js",
      "./samples/dom-casmurro.jpg",
      "./samples/ciencia-universo.jpg",
      "./samples/dialogo-noturno.jpg",
      "./samples/english-classic.jpg",
      "./vendor/tesseract.min.js",
      "./vendor/worker.min.js",
      getPreferredCorePath(),
      "./vendor/lang/por.traineddata.gz",
      "./vendor/lang/eng.traineddata.gz"
    ];
  }

  const DEFAULT_SETTINGS = {
    ocrLanguage: "por",
    ocrPsm: "3",
    ocrAppend: false,
    gray: true,
    contrast: true,
    removeShadow: true,
    binarize: false,
    cleanText: true,
    offlineVoice: true,
    voiceLanguage: "auto",
    voiceURI: "",
    rate: "1",
    volume: "1",
    pitch: "1",
    theme: "paper",
    fontSize: 16,
    text: ""
  };

  App.config = {
    APP_VERSION,
    CACHE_NAME,
    SETTINGS_KEY,
    HISTORY_DB,
    HISTORY_DB_VERSION,
    HISTORY_STORE,
    CORE_SIMD_PATH,
    CORE_FALLBACK_PATH,
    DEFAULT_SETTINGS,
    isFileProtocol,
    supportsWasmSimd,
    getPreferredCorePath,
    getRequiredOfflineAssets
  };
})((window.LeitorApp = window.LeitorApp || {}));
