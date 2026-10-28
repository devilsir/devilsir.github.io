'use strict';

const CACHE_PREFIX = 'roleta-quimica-cafe-';
const CACHE_NAME = CACHE_PREFIX + 'v26-reliable-install';
const APP_SHELL = [
  './index.html',
  './manifest.webmanifest',
  './index.css',
  './editmode-v3-style.css',
  './pwa.css',
  './payload.js',
  './english-banks.js',
  './english-presets.js',
  './xlsx-lite.js',
  './index.js',
  './pwa.js',
  './icons/apple-touch-icon.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png',
  './assets/embedded/introducao-cartoon-06cb01db.jpg',
  './assets/embedded/telainicial-9d720876.png',
  './assets/embedded/comecar-c97099db.png',
  './assets/embedded/instrucoes-ca2439e4.png',
  './assets/embedded/configurar-93691e9e.png',
  './assets/embedded/creditos-a6218e07.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => Promise.allSettled(APP_SHELL.map(async path => {
        const response = await fetch(new Request(path, {cache: 'reload'}));
        if(!response.ok || response.status !== 200) throw new Error(path + ': HTTP ' + response.status);
        await cache.put(path, response);
      })))
      .then(results => {
        const failed = results.filter(result => result.status === 'rejected');
        if(failed.length) console.warn('Alguns arquivos não ficaram disponíveis offline:', failed.length);
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys
        .filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
        .map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

function cacheResponse(event, key, response){
  if(!response || !response.ok || response.status !== 200) return;
  const copy = response.clone();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.put(key, copy))
      .catch(error => console.warn('Cache indisponível:', error))
  );
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if(request.method !== 'GET' || request.headers.has('range')) return;

  const url = new URL(request.url);
  if(url.origin !== self.location.origin ||
     !url.pathname.startsWith(new URL(self.registration.scope).pathname)) return;

  const navigation = request.mode === 'navigate';
  const updatedSource = /\.(?:js|css|webmanifest)$/i.test(url.pathname);
  const fallback = navigation ? './index.html' : request;

  if(navigation || updatedSource){
    event.respondWith(
      fetch(request)
        .then(response => {
          cacheResponse(event, fallback, response);
          return response;
        })
        .catch(async () => (await caches.match(fallback, {ignoreSearch:true})) || Response.error())
    );
    return;
  }

  event.respondWith(
    caches.match(request, {ignoreSearch:true}).then(async cached => {
      if(cached) return cached;
      try{
        const response = await fetch(request);
        cacheResponse(event, request, response);
        return response;
      }catch(error){
        return Response.error();
      }
    })
  );
});
