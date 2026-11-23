const DEPLOYMENT = 'source';
const APP = new URL('./', self.registration.scope);
const PREFIX = 'voices-pwa-' + encodeURIComponent(APP.pathname) + '-';
const VERSION = PREFIX + '3-' + DEPLOYMENT;
const SHELL = VERSION + '-shell';
const FILES = VERSION + '-files';
const MEDIA = VERSION + '-media';
const LIMIT = 120;
const CORE = ['manifest.webmanifest', 'assets/ui/favicon.svg', 'assets/ui/pwa-192.png', 'assets/ui/pwa-512.png'];
const allowed = url => url.origin === APP.origin && url.pathname.startsWith(APP.pathname);
const canonical = new URL('index.html', APP).href;

async function remember(cacheName, key, response, limit = 0) {
  if (!response.ok || response.status === 206 || response.type !== 'basic') return;
  try {
    const cache = await caches.open(cacheName);
    await cache.put(key, response.clone());
    if (!limit) return;
    const keys = await cache.keys();
    for (const expired of keys.slice(0, Math.max(0, keys.length - limit))) await cache.delete(expired);
  } catch {}
}

async function networkFirst(request, cacheName, fallback = null) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) await remember(cacheName, request, response);
    return response;
  } catch {
    return await cache.match(request) || await (await caches.open(SHELL)).match(request)
      || (fallback && await (await caches.open(SHELL)).match(fallback)) || Response.error();
  }
}

async function media(request) {
  if (request.headers.has('range')) return fetch(request);
  const key = new URL(request.url);
  key.searchParams.delete('_voices_retry');
  const cache = await caches.open(MEDIA);
  const cached = await cache.match(key.href) || await (await caches.open(SHELL)).match(key.href);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    await remember(MEDIA, key.href, response, LIMIT);
    return response;
  } catch {
    return Response.error();
  }
}

async function installShell() {
  const response = await fetch(canonical, { cache: 'reload' });
  if (!response.ok) throw new Error('VOICES shell could not be loaded');
  const html = await response.clone().text();
  const styles = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map(match => match[1]);
  const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map(match => match[1]);
  const titleMedia = ['assets/fonts/voices-sans.woff', 'assets/backgrounds/new-harmony.webp'];
  const urls = new Set([...CORE, ...styles, ...scripts].map(file => new URL(file, APP).href));
  const cache = await caches.open(SHELL);
  await cache.addAll([...urls]);
  await cache.put(canonical, response.clone());
  await cache.put(APP.href, response);
  await Promise.allSettled(titleMedia.map(async file => {
    const url = new URL(file, APP).href;
    await remember(SHELL, url, await fetch(url));
  }));
}

async function warm(urls) {
  if (!Array.isArray(urls)) return;
  const list = [...new Set(urls.slice(0, 600).map(value => {
    try {
      const url = new URL(value, APP);
      return allowed(url) && /\.(?:js|css|woff2?)$/.test(url.pathname) ? url.href : null;
    } catch { return null; }
  }).filter(Boolean))];
  const cache = await caches.open(FILES);
  const shell = await caches.open(SHELL);
  let cursor = 0;
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (cursor < list.length) {
      const url = list[cursor++];
      if (await cache.match(url) || await shell.match(url)) continue;
      try { await remember(FILES, url, await fetch(url, { cache: 'force-cache' })); } catch {}
    }
  }));
}

self.addEventListener('install', event => event.waitUntil(installShell()));
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith(PREFIX) && ![SHELL, FILES, MEDIA].includes(name)).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') event.waitUntil(self.skipWaiting());
  if (event.data?.type === 'WARM_APP') event.waitUntil(warm(event.data.urls));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (!allowed(url) || url.pathname.endsWith('/sw.js')) return;
  if (request.mode === 'navigate') {
    const appPage = url.pathname === APP.pathname || url.pathname === new URL(canonical).pathname;
    event.respondWith(networkFirst(request, SHELL, appPage ? canonical : null));
  } else if (['image', 'audio', 'video'].includes(request.destination) || /\.(?:png|webp|jpe?g|gif|svg|avif|wav|mp3|ogg|mp4)$/.test(url.pathname)) {
    event.respondWith(media(request));
  } else if (/\.(?:js|css|json|webmanifest|woff2?|ttf|otf)$/.test(url.pathname)) {
    event.respondWith(networkFirst(request, FILES));
  }
});
