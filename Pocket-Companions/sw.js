const CACHE_NAME = 'pocket-companions-v23-wardrobe-transform-gizmos';
const LOCAL_ASSETS = [
  './',
  './index.html',
  './assets/audio/ambient-garden.wav',
  './assets/audio/ambient-night.wav',
  './assets/audio/ambient-room.wav',
  './assets/audio/character-apollo.wav',
  './assets/audio/character-lilith.wav',
  './assets/audio/character-pietro.wav',
  './assets/audio/clean.wav',
  './assets/audio/click.wav',
  './assets/audio/crunch.wav',
  './assets/audio/feed.wav',
  './assets/audio/jump.wav',
  './assets/audio/land.wav',
  './assets/audio/medicine.wav',
  './assets/audio/music-home.wav',
  './assets/audio/positive.wav',
  './assets/audio/sleep.wav',
  './assets/audio/toy.wav',
  './assets/audio/treat.wav',
  './assets/audio/voices/voice-apollo-call.wav',
  './assets/audio/voices/voice-apollo-calm.wav',
  './assets/audio/voices/voice-apollo-happy.wav',
  './assets/audio/voices/voice-bolt-call.wav',
  './assets/audio/voices/voice-bolt-calm.wav',
  './assets/audio/voices/voice-bolt-happy.wav',
  './assets/audio/voices/voice-caramelo-call.wav',
  './assets/audio/voices/voice-caramelo-calm.wav',
  './assets/audio/voices/voice-caramelo-happy.wav',
  './assets/audio/voices/voice-chica-call.wav',
  './assets/audio/voices/voice-chica-calm.wav',
  './assets/audio/voices/voice-chica-happy.wav',
  './assets/audio/voices/voice-kate-call.wav',
  './assets/audio/voices/voice-kate-calm.wav',
  './assets/audio/voices/voice-kate-happy.wav',
  './assets/audio/voices/voice-kiara-call.wav',
  './assets/audio/voices/voice-kiara-calm.wav',
  './assets/audio/voices/voice-kiara-happy.wav',
  './assets/audio/voices/voice-lilith-call.wav',
  './assets/audio/voices/voice-lilith-calm.wav',
  './assets/audio/voices/voice-lilith-happy.wav',
  './assets/audio/voices/voice-pacoca-call.wav',
  './assets/audio/voices/voice-pacoca-calm.wav',
  './assets/audio/voices/voice-pacoca-happy.wav',
  './assets/audio/voices/voice-pietro-call.wav',
  './assets/audio/voices/voice-pietro-calm.wav',
  './assets/audio/voices/voice-pietro-happy.wav',
  './assets/audio/voices/voice-profiles.json',
  './assets/audio/voices/voice-simba-call.wav',
  './assets/audio/voices/voice-simba-calm.wav',
  './assets/audio/voices/voice-simba-happy.wav',
  './assets/audio/water.wav',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/sponge-cursor.svg',
  './assets/models/apollo_todas_animacoes.glb',
  './assets/models/bolt_todas_animacoes.glb',
  './assets/models/caramelo_todas_animacoes.glb',
  './assets/models/chica_todas_animacoes.glb',
  './assets/models/kate_todas_animacoes.glb',
  './assets/models/kiara_todas_animacoes.glb',
  './assets/models/lilith_todas_animacoes.glb',
  './assets/models/pacoca_todas_animacoes.glb',
  './assets/models/pietro_todas_animacoes.glb',
  './assets/models/simba_todas_animacoes.glb',
  './css/base.css',
  './css/components.css',
  './css/responsive.css',
  './js/animations.js',
  './js/accessory-gizmo.js',
  './js/app-v17.js',
  './js/audio.js',
  './js/config.js',
  './js/games.js',
  './js/i18n.js',
  './js/living-data.js',
  './js/living-systems.js',
  './js/living-ui.js',
  './js/wardrobe.js',
  './js/persistence.js',
  './js/scene.js',
  './js/store.js',
  './js/utils.js',
  './manifest.webmanifest',
  './preview-model.html',
  './vendor/GLTFLoader.js',
  './vendor/LICENSE-three.txt',
  './vendor/three.module.js'
];

async function cacheLocalAssets() {
  const cache = await caches.open(CACHE_NAME);
  const failures = [];
  let cursor = 0;
  const workers = Array.from({ length: 3 }, async () => {
    while (cursor < LOCAL_ASSETS.length) {
      const url = LOCAL_ASSETS[cursor++];
      try {
        const response = await fetch(url, { cache: 'reload' });
        if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
        await cache.put(url, response);
      } catch (error) {
        failures.push(`${url}: ${error?.message || error}`);
      }
    }
  });
  await Promise.all(workers);
  if (failures.length) throw new Error(`Offline installation incomplete: ${failures.join('; ')}`);
}

self.addEventListener('install', (event) => {
  event.waitUntil(cacheLocalAssets().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith('pocket-companions-') && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

async function networkFirst(request, { navigationFallback = false } = {}) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request, { cache: 'no-store' });
    if (response?.ok) await cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;
    if (navigationFallback) {
      const index = await cache.match('./index.html');
      if (index) return index;
    }
    throw error;
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request, { ignoreSearch: true });
  if (cached) return cached;
  const response = await fetch(request);
  if (response && (response.ok || response.type === 'opaque')) {
    await cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, { navigationFallback: true }));
    return;
  }

  if (url.origin !== self.location.origin) return;

  // Code is always refreshed as one coherent build when online. Heavy media/models remain cache-first.
  if (['script', 'style', 'worker'].includes(request.destination)) {
    event.respondWith(networkFirst(request));
  } else {
    event.respondWith(cacheFirst(request));
  }
});
