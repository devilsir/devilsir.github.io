'use strict';

const CACHE_NAME = 'roleta-quimica-cafe-v15-separated-question-hint-images';
const APP_SHELL = [
  './assets/embedded/adicionar-perguntas-c315fc0b.png',
  './assets/embedded/adicionar-perguntas_hover-eaef1d34.png',
  './assets/embedded/angel-5eacf7b2.png',
  './assets/embedded/angelb-a3d2ca5c.png',
  './assets/embedded/botao-generico-iniciarintroducao-294b6971.png',
  './assets/embedded/botao-generico-iniciarintroducao_hover-9ecef2e2.png',
  './assets/embedded/botao-generico-listarperguntas-5222e552.png',
  './assets/embedded/botao-generico-listarperguntas_hover-a722a3f0.png',
  './assets/embedded/botao-generico-listarperguntaseditar-de9287af.png',
  './assets/embedded/botao-generico-listarperguntaseditar_hover-8d73f801.png',
  './assets/embedded/botao-generico-popup-generico-28b2177f.png',
  './assets/embedded/botao-generico-popup-generico_hover-a6d7fcea.png',
  './assets/embedded/botao-generico-telainicial-efc355cd.png',
  './assets/embedded/botao-generico-telainicial_hover-abe467cc.png',
  './assets/embedded/botao_girar-06ef5759.png',
  './assets/embedded/botao_girar_hover-34b8fb0b.png',
  './assets/embedded/cardinstrucoes-5ed48ed4.png',
  './assets/embedded/comecar-c97099db.png',
  './assets/embedded/comecar_hover-5f084f97.png',
  './assets/embedded/configurar-93691e9e.png',
  './assets/embedded/configurar_hover-4e6c2518.png',
  './assets/embedded/copo-quebrando-8a0cb89b.mp3',
  './assets/embedded/copoenchendo-ede21b12.mp3',
  './assets/embedded/creditos-a6218e07.png',
  './assets/embedded/creditos_hover-0d7051b5.png',
  './assets/embedded/fabio-fabd9d50.png',
  './assets/embedded/fabiob-98d6aa49.png',
  './assets/embedded/fundo-generico-35075197.jpg',
  './assets/embedded/fundo-generico2-4a139ab0.jpg',
  './assets/embedded/fundo_creditos-3cc2c7c6.png',
  './assets/embedded/fundotransparente-ae1c10bc.png',
  './assets/embedded/historico-0750f58f.png',
  './assets/embedded/historico_hover-ff360518.png',
  './assets/embedded/iniciar-jogo-8145f789.png',
  './assets/embedded/iniciar-jogo_hover-00a085f3.png',
  './assets/embedded/iniciarintroducao-906b8981.png',
  './assets/embedded/instrucoes-ca2439e4.png',
  './assets/embedded/instrucoes_hover-2673dc12.png',
  './assets/embedded/introducao-cartoon-06cb01db.jpg',
  './assets/embedded/introducao-d5e84240.mp4',
  './assets/embedded/listar-perguntas-fa274fa2.png',
  './assets/embedded/listar-perguntas_hover-5d178026.png',
  './assets/embedded/listarperguntas-f733cdf0.jpg',
  './assets/embedded/listarperguntas_hover-038aa750.jpg',
  './assets/embedded/lucas-1318302f.png',
  './assets/embedded/lucasb-996389e4.png',
  './assets/embedded/musicadefundo-extendida-remix-0788b973.mp3',
  './assets/embedded/popup-generico-2-fe6926c0.png',
  './assets/embedded/popup-generico-4-849e183b.png',
  './assets/embedded/popup-generico-e0dc605d.png',
  './assets/embedded/popup-generico-hd-f5efdaa8.png',
  './assets/embedded/popup-generico-sem-fundo-transparente-4f18150a.png',
  './assets/embedded/popupc-3e6d4a59.png',
  './assets/embedded/predefinicoes-87c19a91.png',
  './assets/embedded/predefinicoes_hover-84d2bbb7.png',
  './assets/embedded/roda-629f6a20.png',
  './assets/embedded/setadica-a73eebc2.png',
  './assets/embedded/setavoltar-ef48b6cc.png',
  './assets/embedded/setavoltar_hover-1df2caf8.png',
  './assets/embedded/telainicial-9d720876.png',
  './assets/embedded/transicao-roleta-c23d7618.mp4',
  './assets/embedded/transparent-pixel.gif',
  './assets/embedded/viviane-3ac5989d.png',
  './assets/embedded/vivianeb-e1244cda.png',
  './assets/embedded/volume-ee711135.png',
  './assets/embedded/volume_hover-1ef88e8f.png',
  './assets/embedded/xicara-de-cima-be589b91.png',
  './assets/embedded/xicara-de-cima-tablet.webp',
  './assets/embedded/botao-girar-tablet.webp',
  './assets/embedded/botao-girar-hover-tablet.webp',
  './assets/embedded/setavoltar-tablet.webp',
  './assets/embedded/setavoltar-hover-tablet.webp',
  './assets/embedded/setadica-tablet.webp',
  './editmode-v3-style.css',
  './english-banks.js',
  './english-presets.js',
  './icons/apple-touch-icon.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png',
  './index.css',
  './index.html',
  './index.js',
  './manifest.webmanifest',
  './payload.js',
  './pwa.css',
  './pwa.js',
  './xlsx-lite.js',
  './assets/questions/7ano_cat_box.svg',
  './assets/questions/7ano_ball_table.svg',
  './assets/questions/7ano_book_table.svg',
  './assets/questions/7ano_library_between.svg',
  './assets/questions/6ano_lamp_table.svg',
  './assets/questions/6ano_cat_chair.svg',
  './assets/questions/6ano_school_between.svg',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if(url.origin !== self.location.origin) return;

  if(event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put('./index.html', copy));
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request, {ignoreSearch:true}).then(cached => {
      if(cached) return cached;
      return fetch(event.request).then(response => {
        if(response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        }
        return response;
      });
    })
  );
});
