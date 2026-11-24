(() => {
const base = new URL('./', self.location.href);
const cachePrefix = 'devilsir-central-';
const cacheName = cachePrefix + 'v2';
const home = base.href;
const index = new URL('./index.html', base).pathname;
const covers = new URL('./capas-projetos/', base).pathname;
const shell = [
  './',
  './index.css',
  './index.js',
  './pwa-install.js',
  './manifest.webmanifest',
  './pwa-icons/central-180.png',
  './pwa-icons/central-192.png',
  './pwa-icons/central-512.png',
  './pwa-icons/central-maskable-512.png'
].map((path) => new URL(path, base).href);
const coverFiles = new Set([
  './Festa%20Gen%C3%A9tica/assets/floricultura/card-floricultura.jpg',
  './C%C3%A9lulas/assets/em/nucleus.jpg'
].map((path) => new URL(path, base).pathname));

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(cacheName).then((cache) =>
    cache.addAll(shell.map((url) => new Request(url, {cache: 'reload'})))
  ).catch((error) => console.warn('Não foi possível salvar o catálogo offline.', error)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((names) => Promise.all(
    names.filter((name) => name.startsWith(cachePrefix) && name !== cacheName)
      .map((name) => caches.delete(name))
  )));
});

async function fetchOrCache(request, key, store = true) {
  try {
    const response = await fetch(request);
    if (store && response.ok && !response.redirected) {
      const copy = response.clone();
      await caches.open(cacheName).then((cache) => cache.put(key, copy)).catch(() => {});
    }
    return response;
  } catch (error) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(key);
    if (cached) return cached;
    throw error;
  }
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== base.origin) return;

  if (request.mode === 'navigate' && (url.pathname === base.pathname || url.pathname === index)) {
    event.respondWith(fetchOrCache(request, home, !url.search));
    return;
  }

  if (request.mode === 'navigate') return;
  url.search = '';
  const isCover = request.destination === 'image' &&
    (url.pathname.startsWith(covers) || coverFiles.has(url.pathname.replace(/'/g, '%27')));
  if (shell.includes(url.href) || isCover) event.respondWith(fetchOrCache(request, url.href));
});
})();
