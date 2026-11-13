const VERSION = 'voices-pwa-20261113a';
const APP = new URL('./', self.registration.scope);
const SHELL = VERSION + '-shell';
const FILES = VERSION + '-files';
const IMAGES = VERSION + '-images';
const LIMIT = 96;
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'js/app-loader.js', 'js/pwa.js?v=20261113a', 'css/styles.css?v=20261030-imageopt1', 'css/interface.css?v=20261112-pause1', 'assets/ui/favicon.svg', 'assets/ui/pwa-icon.svg', 'assets/ui/pwa-icon.svg'];
const allowed = url => url.origin === APP.origin && url.pathname.startsWith(APP.pathname);
async function remember(cacheName, key, response, limit = 0) {
  if (!response.ok || response.type !== 'basic') return;
  try {
    const cache = await caches.open(cacheName);
    await cache.put(key, response.clone());
    if (!limit) return;
    const keys = await cache.keys();
    for (let i = 0; i < keys.length - limit; i++) await cache.delete(keys[i]);
  } catch {}
}
function imageKey(request) {
  const url = new URL(request.url);
  url.searchParams.delete('_voices_retry');
  return new Request(url.href);
}
async function networkFirst(request, cacheName, fallback = null) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) await remember(cacheName, request, response);
    return response;
  } catch {
    return await cache.match(request) || (fallback ? await caches.match(fallback) : null) || Response.error();
  }
}
async function cacheFirst(request, cacheName, limit) {
  const key = imageKey(request);
  const cache = await caches.open(cacheName);
  const cached = await cache.match(key);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) await remember(cacheName, key, response, limit);
    return response;
  } catch {
    return Response.error();
  }
}
async function warm(urls) {
  if (!Array.isArray(urls)) return;
  const list = [...new Set(urls.slice(0, 600).map(value => {
    try {
      const url = new URL(value, APP);
      return allowed(url) && /\.(?:js|css|woff2?)(?:$)/.test(url.pathname) ? url.href : null;
    } catch { return null; }
  }).filter(Boolean))];
  const cache = await caches.open(FILES);
  let cursor = 0;
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (cursor < list.length) {
      const request = new Request(list[cursor++], { cache: 'force-cache' });
      if (await cache.match(request)) continue;
      try {
        const response = await fetch(request);
        if (response.ok && response.type === 'basic') await cache.put(request, response);
      } catch {}
    }
  }));
}
self.addEventListener('install', event => {
  event.waitUntil(caches.open(SHELL).then(cache => cache.addAll(CORE.map(path => new URL(path, APP).href))));
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith('voices-pwa-') && ![SHELL, FILES, IMAGES].includes(name)).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
  if (event.data?.type === 'WARM_APP') event.waitUntil(warm(event.data.urls));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (!allowed(url) || url.pathname.endsWith('/sw.js')) return;
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, SHELL, new URL('./', APP).href));
    return;
  }
  if (request.destination === 'image' || /\.(?:png|webp|jpe?g|gif|svg|avif)$/.test(url.pathname)) {
    event.respondWith(cacheFirst(request, IMAGES, LIMIT));
    return;
  }
  if (request.destination === 'font' || /\.(?:woff2?|ttf|otf)$/.test(url.pathname)) {
    event.respondWith(cacheFirst(request, FILES, 0));
    return;
  }
  if (/\.(?:js|css|json|webmanifest)$/.test(url.pathname)) {
    event.respondWith(networkFirst(request, FILES));
  }
});
