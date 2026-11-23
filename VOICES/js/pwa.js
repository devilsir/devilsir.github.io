(function () {
  'use strict';
  if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol)) return;
  const worker = navigator.serviceWorker;
  const install = document.getElementById('pwa-install');
  let prompt = null;
  let updating = false;

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    prompt = event;
    install.hidden = false;
  });
  window.addEventListener('appinstalled', () => {
    prompt = null;
    install.hidden = true;
  });
  install.addEventListener('click', async () => {
    if (!prompt) return;
    const choice = prompt;
    prompt = null;
    install.hidden = true;
    try { await choice.prompt(); } catch {}
  });

  function warm(urls) {
    worker.ready.then(registration => {
      registration.active?.postMessage({ type: 'WARM_APP', urls: urls.filter(Boolean) });
    }).catch(() => {});
  }
  document.addEventListener('voices:resources', event => warm(event.detail));
  worker.addEventListener('controllerchange', () => {
    if (updating) location.reload();
  });
  worker.register('./sw.js', { scope: './', updateViaCache: 'none' }).then(registration => {
    function showUpdate() {
      if (!registration.waiting || !worker.controller || document.getElementById('pwa-update')) return;
      const button = document.createElement('button');
      button.id = 'pwa-update';
      button.className = 'quiet';
      button.type = 'button';
      button.textContent = 'Atualizar jogo';
      button.onclick = () => {
        if (!registration.waiting) return;
        updating = true;
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      };
      document.querySelector('.title-top')?.append(button);
    }
    showUpdate();
    registration.addEventListener('updatefound', () => {
      registration.installing?.addEventListener('statechange', showUpdate);
    });
  }).catch(() => {});
})();
