const CACHE_NAME = 'omr-scanner-v14';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './pwa.js',
  './history-addon.js',
  './src/main.js',
  './src/config.js',
  './src/utils/math.js',
  './src/utils/image.js',
  './src/utils/txt-export.js',
  './src/scoring/answer-key.js',
  './src/cv/document-detector.js',
  './src/cv/preprocessor.js',
  './src/cv/mark-detector.js',
  './src/cv/grid-reconstructor.js',
  './src/cv/bubble-analyzer.js',
  './src/cv/answer-classifier.js',
  './src/cv/quality-estimator.js',
  './src/cv/template-registrar.js',
  './src/cv/omr-engine.js',
  './src/ui/crop-editor.js',
  './src/ui/result-overlay.js',
  './src/ui/zoom-viewer.js',
  './src/demo/demo-sheets.js',
  './assets/index-RXXbEzxx.css',
  './assets/history-addon.css',
  './vendor/opencv.js',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('./index.html', copy));
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Scripts/styles use network-first with no-cache revalidation so new builds are never trapped behind old caches.
  const versionSensitive =
    request.destination === 'script' ||
    request.destination === 'style' ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('/manifest.webmanifest');
  if (versionSensitive) {
    event.respondWith(
      fetch(new Request(request, { cache: 'no-cache' }))
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
