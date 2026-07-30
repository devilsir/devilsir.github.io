const CACHE_NAME = 'pocket-companions-v12-gameplay-shop';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/base.css',
  './css/components.css',
  './css/responsive.css',
  './js/app.js?v=12-gameplay-shop',
  './js/i18n.js',
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
  './assets/audio/voices/voice-apollo-call.wav',
  './assets/audio/voices/voice-apollo-happy.wav',
  './assets/audio/voices/voice-apollo-calm.wav',
  './assets/audio/voices/voice-lilith-call.wav',
  './assets/audio/voices/voice-lilith-happy.wav',
  './assets/audio/voices/voice-lilith-calm.wav',
  './assets/audio/voices/voice-pietro-call.wav',
  './assets/audio/voices/voice-pietro-happy.wav',
  './assets/audio/voices/voice-pietro-calm.wav',
  './assets/audio/voices/voice-bolt-call.wav',
  './assets/audio/voices/voice-bolt-happy.wav',
  './assets/audio/voices/voice-bolt-calm.wav',
  './assets/audio/voices/voice-chica-call.wav',
  './assets/audio/voices/voice-chica-happy.wav',
  './assets/audio/voices/voice-chica-calm.wav',
  './assets/audio/voices/voice-kate-call.wav',
  './assets/audio/voices/voice-kate-happy.wav',
  './assets/audio/voices/voice-kate-calm.wav',
  './assets/audio/voices/voice-caramelo-call.wav',
  './assets/audio/voices/voice-caramelo-happy.wav',
  './assets/audio/voices/voice-caramelo-calm.wav',
  './assets/audio/voices/voice-kiara-call.wav',
  './assets/audio/voices/voice-kiara-happy.wav',
  './assets/audio/voices/voice-kiara-calm.wav',
  './assets/audio/voices/voice-pacoca-call.wav',
  './assets/audio/voices/voice-pacoca-happy.wav',
  './assets/audio/voices/voice-pacoca-calm.wav',
  './assets/audio/voices/voice-simba-call.wav',
  './assets/audio/voices/voice-simba-happy.wav',
  './assets/audio/voices/voice-simba-calm.wav',
  './assets/audio/voices/voice-profiles.json',
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
