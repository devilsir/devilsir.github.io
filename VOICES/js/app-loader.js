/* Keep the title usable before preparing the game, including under file://. */
(function () {
  'use strict';
  window.VOICES_MANUAL_BOOT = true;
  const manifest = JSON.parse(document.getElementById('voices-runtime').textContent);
  const actions = new Set(['new-game', 'continue-game', 'teacher-button', 'settings-button', 'credits-button', 'title-sound']);
  const features = manifest.features || {};
  const deferred = Object.values(features).flatMap(feature => feature.modules);
  const deferredIds = new Set(deferred);
  const entries = new Map(manifest.modules.map(entry => [entry.id, entry]));
  const resources = new Map(), loading = new Map(), loadedFeatures = new Set();
  let pending = null, ready = false, requested = null;

  function resource(tag, url) {
    const key = tag + ':' + url;
    if (resources.has(key)) return resources.get(key);
    const request = new Promise((resolve, reject) => {
      const node = document.createElement(tag);
      if (tag === 'script') { node.src = url; node.async = true; }
      else { node.rel = 'stylesheet'; node.href = url; }
      node.onload = resolve;
      node.onerror = () => { node.remove(); reject(new Error('Não foi possível carregar ' + url)); };
      (tag === 'script' ? document.body : document.head).append(node);
    }).catch(error => { resources.delete(key); throw error; });
    resources.set(key, request);
    return request;
  }

  function prepared(urls) {
    document.dispatchEvent(new CustomEvent('voices:resources', { detail: urls }));
  }

  function loadFeature(name) {
    if (loadedFeatures.has(name)) return Promise.resolve();
    if (loading.has(name)) return loading.get(name);
    const group = features[name];
    if (!group) return Promise.reject(new Error('Recurso desconhecido: ' + name));
    const scripts = group.scripts || group.modules.map(id => entries.get(id).src);
    const request = Promise.all([
      ...group.styles.map(url => resource('link', url)),
      ...scripts.map(url => resource('script', url))
    ]).then(() => {
      if (group.modules.length) window.VoicesModules.activate(group.modules);
      loadedFeatures.add(name);
      prepared([...group.styles, ...scripts]);
    }).finally(() => loading.delete(name));
    loading.set(name, request);
    return request;
  }

  function withFeature(name, action) {
    if (loadedFeatures.has(name)) return action();
    const V = window.V, panel = V.DuoPanels, owner = panel?.context ?? -1;
    const run = fn => owner >= 0 ? panel.withOwner(owner, fn) : fn();
    const host = run(() => V.$('#modal-root'));
    const view = host?.firstElementChild, state = V.state, screen = V.Game.screen;
    const current = () => V.state === state && V.Game.screen === screen && host?.firstElementChild === view;
    return loadFeature(name).then(() => {
      if (current()) return run(action);
    }, error => {
      console.error(error);
      if (current()) run(() => V.UI.toast('Não foi possível carregar esta atividade.', 'error', {
        label: 'Tentar novamente',
        run: () => run(() => withFeature(name, action))
      }));
    });
  }

  async function boot() {
    const overlay = document.getElementById('loading');
    overlay.hidden = false;
    try {
      window.VOICES_MODULE_MODE = true;
      await Promise.all(manifest.styles.map(url => resource('link', url)));
      if (manifest.bootstrap) await resource('script', manifest.bootstrap);
      const scripts = manifest.scripts || manifest.modules.filter(entry => !deferredIds.has(entry.id)).map(entry => entry.src);
      await Promise.all(scripts.map(url => resource('script', url)));
      window.VoicesModules.start(manifest.modules, deferred);
      prepared([manifest.bootstrap, ...manifest.styles, ...scripts]);
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
  window.VoicesApp = { ready() { return pending || (pending = boot()); }, get loaded() { return ready; }, externalResearch: manifest.externalResearch === true, featureReady: name => loadedFeatures.has(name), loadFeature, withFeature };
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
