const CACHE = "leitor-livros-v1.1.0";
const BASE = new URL("./", self.location.href);

const APP_SHELL = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./vendor/lang/por.traineddata.gz",
  "./vendor/lang/eng.traineddata.gz"
];

const MIRRORS = [
  {
    local: "vendor/tesseract.min.js",
    urls: [
      "https://cdn.jsdelivr.net/npm/tesseract.js@6.0.1/dist/tesseract.min.js",
      "https://unpkg.com/tesseract.js@6.0.1/dist/tesseract.min.js"
    ],
    type: "application/javascript; charset=utf-8"
  },
  {
    local: "vendor/worker.min.js",
    urls: [
      "https://cdn.jsdelivr.net/npm/tesseract.js@6.0.1/dist/worker.min.js",
      "https://unpkg.com/tesseract.js@6.0.1/dist/worker.min.js"
    ],
    type: "application/javascript; charset=utf-8"
  },
  ...[
    "tesseract-core.wasm.js",
    "tesseract-core-simd.wasm.js",
    "tesseract-core-lstm.wasm.js",
    "tesseract-core-simd-lstm.wasm.js"
  ].map(name => ({
    local: `vendor/core/${name}`,
    urls: [
      `https://cdn.jsdelivr.net/npm/tesseract.js-core@6.0.0/${name}`,
      `https://unpkg.com/tesseract.js-core@6.0.0/${name}`
    ],
    type: "application/javascript; charset=utf-8"
  }))
];

async function notify(message) {
  const clients = await self.clients.matchAll({ includeUncontrolled: true, type: "window" });
  clients.forEach(client => client.postMessage(message));
}

async function fetchMirror(item) {
  let lastError;
  for (const url of item.urls) {
    try {
      const res = await fetch(url, { mode: "cors", cache: "no-store" });
      if (!res.ok) throw new Error(`${res.status} ${url}`);
      const bytes = await res.arrayBuffer();

      // Rebuild the response so a cross-origin CDN response becomes a clean,
      // same-origin virtual file when served by this service worker.
      return new Response(bytes, {
        status: 200,
        headers: {
          "Content-Type": item.type,
          "Cache-Control": "public, max-age=31536000, immutable"
        }
      });
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error(`Falha ao baixar ${item.local}`);
}

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);

    await notify({
      type: "OFFLINE_PROGRESS",
      progress: 5,
      label: "Salvando interface e idiomas…"
    });

    await cache.addAll(APP_SHELL.map(p => new URL(p, BASE).href));

    for (let i = 0; i < MIRRORS.length; i++) {
      const item = MIRRORS[i];
      const response = await fetchMirror(item);
      const localUrl = new URL(item.local, BASE).href;
      await cache.put(localUrl, response);

      await notify({
        type: "OFFLINE_PROGRESS",
        progress: Math.round(15 + ((i + 1) / MIRRORS.length) * 82),
        label: `Motor OCR: ${i + 1} de ${MIRRORS.length} componentes…`
      });
    }

    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
    await notify({ type: "OFFLINE_READY" });
  })());
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Only handle files that belong to this GitHub Pages app.
  if (!url.href.startsWith(BASE.href)) return;

  if (event.request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(event.request);
        const cache = await caches.open(CACHE);
        cache.put(new URL("./index.html", BASE).href, fresh.clone());
        return fresh;
      } catch {
        return (await caches.match(new URL("./index.html", BASE).href)) ||
               (await caches.match(new URL("./", BASE).href));
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;

    try {
      const response = await fetch(event.request);
      if (response.ok) {
        const cache = await caches.open(CACHE);
        cache.put(event.request, response.clone());
      }
      return response;
    } catch {
      return new Response("Offline: recurso não encontrado.", {
        status: 503,
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      });
    }
  })());
});
