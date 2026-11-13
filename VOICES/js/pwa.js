(function () {
  'use strict';
  if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol)) return;
  const install = document.getElementById('pwa-install');
  let prompt = null;
  let updating = false;
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    prompt = event;
    if (install) install.hidden = false;
  });
  window.addEventListener('appinstalled', () => {
    prompt = null;
    if (install) install.hidden = true;
  });
  if (install) install.addEventListener('click', async () => {
    if (!prompt) return;
    const choice = prompt;
    prompt = null;
    install.hidden = true;
    await choice.prompt();
  });
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (updating) location.reload();
  });
  navigator.serviceWorker.register('./sw.js', { scope: './', updateViaCache: 'none' }).then(registration => {
    const showUpdate = () => {
      if (!registration.waiting || !navigator.serviceWorker.controller || document.getElementById('pwa-update')) return;
      const button = document.createElement('button');
      button.id = 'pwa-update';
      button.className = 'quiet';
      button.type = 'button';
      button.textContent = 'Atualizar jogo';
      button.onclick = () => {
        updating = true;
        registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
      };
      document.querySelector('.title-top')?.append(button);
    };
    if (registration.waiting) showUpdate();
    registration.addEventListener('updatefound', () => {
      registration.installing?.addEventListener('statechange', showUpdate);
    });
    document.addEventListener('voices:ready', () => {
      const configuration = document.getElementById('voices-runtime');
      if (!configuration) return;
      try {
        const catalog = JSON.parse(configuration.textContent);
        const urls = [catalog.bootstrap, ...(catalog.styles || []), ...(catalog.modules || []).map(item => item.src), 'assets/fonts/voices-sans.woff'].filter(Boolean);
        navigator.serviceWorker.ready.then(active => active.active?.postMessage({ type: 'WARM_APP', urls })).catch(() => {});
      } catch {}
    });
  }).catch(() => {});
})();
