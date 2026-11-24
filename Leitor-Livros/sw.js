const CACHE = "leitor-livros-v2.4.0";
const BASE = new URL("./", self.location.href);

const CORE_SIMD = "./vendor/core/tesseract-core-simd-lstm.wasm.js";
const CORE_FALLBACK = "./vendor/core/tesseract-core-lstm.wasm.js";

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

const APP_SHELL = [
  "./",
  "./index.html",
  "./style.css",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./js/main.js",
  "./js/config.js",
  "./js/offline.js",
  "./js/storage.js",
  "./js/image-processing.js",
  "./js/text-cleaner.js",
  "./js/ocr.js",
  "./js/piper-tts.js",
  "./js/tts.js",
  "./samples/dom-casmurro.jpg",
  "./samples/ciencia-universo.jpg",
  "./samples/dialogo-noturno.jpg",
  "./samples/english-classic.jpg"
];

function getOcrAssets() {
  return [
    { path: "./vendor/tesseract.min.js", label: "Motor Tesseract (JS)" },
    { path: "./vendor/worker.min.js", label: "Worker OCR local" },
    {
      path: supportsWasmSimd() ? CORE_SIMD : CORE_FALLBACK,
      label: supportsWasmSimd() ? "Núcleo WASM SIMD" : "Núcleo WASM padrão"
    },
    { path: "./vendor/lang/por.traineddata.gz", label: "Idioma Português" },
    { path: "./vendor/lang/eng.traineddata.gz", label: "Idioma Inglês" }
  ];
}

async function notify(message) {
  const clients = await self.clients.matchAll({ includeUncontrolled: true, type: "window" });
  clients.forEach((client) => client.postMessage(message));
}

async function cacheAsset(cache, relativePath) {
  const url = new URL(relativePath, BASE).href;
  const response = await fetch(url, { cache: "no-cache" });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ao salvar ${relativePath}`);
  }
  await cache.put(url, response);
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      const ocrAssets = getOcrAssets();
      const total = APP_SHELL.length + ocrAssets.length;
      let done = 0;

      await notify({
        type: "OFFLINE_PROGRESS",
        progress: 5,
        label: "Salvando interface e módulos do app…"
      });

      for (const path of APP_SHELL) {
        await cacheAsset(cache, path);
        done++;
      }

      await notify({
        type: "OFFLINE_PROGRESS",
        progress: Math.round((done / total) * 100),
        label: "Interface salva. Guardando motor OCR e idiomas…"
      });

      for (const asset of ocrAssets) {
        await cacheAsset(cache, asset.path);
        done++;
        await notify({
          type: "OFFLINE_PROGRESS",
          progress: Math.round((done / total) * 100),
          label: `Salvo: ${asset.label} (${done}/${total})`
        });
      }

      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
      await notify({ type: "OFFLINE_READY" });
    })()
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (!url.href.startsWith(BASE.href)) return;

  // Navigation requests: network-first with instant offline fallback to cached index.html
  if (event.request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(event.request);
          if (fresh.ok) {
            const cache = await caches.open(CACHE);
            cache.put(new URL("./index.html", BASE).href, fresh.clone());
          }
          return fresh;
        } catch {
          return (
            (await caches.match(new URL("./index.html", BASE).href)) ||
            (await caches.match(new URL("./", BASE).href))
          );
        }
      })()
    );
    return;
  }

  // Static & vendor assets: cache-first, populating cache on demand
  event.respondWith(
    (async () => {
      const cached = await caches.match(event.request, { ignoreSearch: true });
      if (cached) return cached;

      try {
        const response = await fetch(event.request);
        if (response.ok) {
          const cache = await caches.open(CACHE);
          cache.put(event.request, response.clone());
        }
        return response;
      } catch {
        return new Response("Offline: recurso não encontrado no cache local.", {
          status: 503,
          headers: { "Content-Type": "text/plain; charset=utf-8" }
        });
      }
    })()
  );
});
