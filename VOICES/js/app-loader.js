/* Keep the title usable before preparing the game, including under file://. */
(function () {
  'use strict';
  window.VOICES_MANUAL_BOOT = true;
  const manifest = JSON.parse(document.getElementById('voices-runtime').textContent);
  const actions = new Set(['new-game', 'continue-game', 'teacher-button', 'settings-button', 'credits-button', 'title-sound']);
  let pending = null, ready = false, requested = null;
  function resource(tag, url) {
    return new Promise((resolve, reject) => {
      const node = document.createElement(tag);
      if (tag === 'script') { node.src = url; node.async = true; }
      else { node.rel = 'stylesheet'; node.href = url; }
      node.onload = resolve;
      node.onerror = () => { node.remove(); reject(new Error('Não foi possível carregar ' + url)); };
      (tag === 'script' ? document.body : document.head).append(node);
    });
  }
  async function boot() {
    const overlay = document.getElementById('loading');
    overlay.hidden = false;
    try {
      window.VOICES_MODULE_MODE = true;
      await Promise.all(manifest.styles.map(url => resource('link', url)));
      if (manifest.bootstrap) await resource('script', manifest.bootstrap);
      const scripts = manifest.scripts || manifest.modules.map(entry => entry.src);
      await Promise.all(scripts.map(url => resource('script', url)));
      window.VoicesModules.start(manifest.modules);
      await window.V.Game.init();
      ready = true;
      document.dispatchEvent(new Event('voices:ready'));
    } catch (error) {
      overlay.hidden = true;
      const host = document.getElementById('modal-root');
      host.replaceChildren();
      const panel = document.createElement('div');
      panel.className = 'modal-backdrop';
      const card = document.createElement('div');
      card.className = 'modal';
      card.setAttribute('role', 'alertdialog');
      card.setAttribute('aria-label', 'Não foi possível preparar o jogo');
      const body = document.createElement('div');
      body.className = 'modal-body';
      const message = document.createElement('p');
      message.textContent = 'Não foi possível preparar o jogo. Confira a conexão ou os arquivos extraídos e tente novamente.';
      const retry = document.createElement('button');
      retry.className = 'primary'; retry.textContent = 'Tentar novamente';
      retry.onclick = () => location.reload();
      body.append(message, retry); card.append(body); panel.append(card); host.append(panel); retry.focus();
      console.error(error);
      throw error;
    }
  }
  window.VoicesApp = { ready() { return pending || (pending = boot()); }, get loaded() { return ready; } };
  document.addEventListener('click', event => {
    const button = event.target.closest?.('button');
    if (ready || !button || !actions.has(button.id)) return;
    event.preventDefault(); event.stopImmediatePropagation();
    if (requested) return;
    requested = button.id;
    window.VoicesApp.ready().then(() => {
      const id = requested; requested = null;
      document.getElementById(id)?.click();
    }).catch(() => { requested = null; });
  }, true);
  const continueButton = document.getElementById('continue-game');
  if (continueButton) { continueButton.hidden = false; continueButton.firstChild.textContent = 'Meus perfis '; }
  if (new URLSearchParams(location.search).has('voices-duo')) window.VoicesApp.ready().catch(() => {});
})();
