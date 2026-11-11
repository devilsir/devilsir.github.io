(function () {
  'use strict';
  const catalog = JSON.parse(document.getElementById('voices-editor-modules').textContent);
  window.VOICES_MODULE_MODE = true;
  Promise.all(catalog.map(entry => new Promise((resolve, reject) => {
    const script = document.createElement('script'); script.src = entry.src;
    script.onload = resolve; script.onerror = () => reject(new Error('Não foi possível carregar ' + entry.src));
    document.body.append(script);
  }))).then(() => window.VoicesModules.start(catalog)).catch(error => {
    const status = document.getElementById('folder-status');
    if (status) status.textContent = 'Não foi possível preparar o editor. Recarregue a página.';
    console.error(error);
  });
})();
