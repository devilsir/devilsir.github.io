const CACHE_NAME = 'pocket-companions-v7-position-games-fix';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/base.css',
  './css/components.css',
  './css/responsive.css',
  './js/app.js?v=7-position-games-fix',
  './js/config.js',
  './js/utils.js',
  './js/store.js',
  './js/audio.js',
  './js/animations.js',
  './js/scene.js',
  './js/games.js',
  './vendor/three.module.js',
  './vendor/GLTFLoader.js',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/audio/click.wav',
  './assets/audio/positive.wav',
  './assets/audio/feed.wav',
  './assets/audio/crunch.wav',
  './assets/audio/treat.wav',
  './assets/audio/water.wav',
  './assets/audio/clean.wav',
  './assets/audio/toy.wav',
  './assets/audio/jump.wav',
  './assets/audio/land.wav',
  './assets/audio/sleep.wav',
  './assets/audio/medicine.wav',
  './assets/audio/character-apollo.wav',
  './assets/audio/character-lilith.wav',
  './assets/audio/character-pietro.wav',
  './assets/audio/ambient-room.wav',
  './assets/audio/ambient-garden.wav',
  './assets/audio/ambient-night.wav',
  './assets/audio/music-home.wav'
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
  const isSourceFile = /\.(?:js|css|html|webmanifest)$/.test(url.pathname) || request.mode === 'navigate';

  if (isSourceFile) {
    event.respondWith(
      fetch(request, { cache: 'no-store' })
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      if (response && response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
      }
      return response;
    }))
  );
});
