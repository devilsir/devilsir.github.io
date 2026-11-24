(() => {
  const button = document.querySelector('#install-app');
  const help = document.querySelector('#install-help');
  const status = document.querySelector('#install-status');
  const standalone = window.matchMedia('(display-mode: standalone)');
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  let prompt = null;
  let installed = false;

  function showHelp() {
    help.textContent = ios
      ? 'No Safari, toque em Compartilhar, escolha Adicionar à Tela de Início e confirme em Adicionar.'
      : 'Procure “Instalar” ou “Adicionar à tela inicial” na barra de endereço ou no menu do navegador.';
    help.hidden = false;
    button.setAttribute('aria-expanded', 'true');
  }

  function hideHelp() {
    help.hidden = true;
    button.setAttribute('aria-expanded', 'false');
  }

  function updateButton() {
    button.hidden = !window.isSecureContext || standalone.matches || navigator.standalone === true || installed;
    if (button.hidden) hideHelp();
  }

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    prompt = event;
    hideHelp();
    updateButton();
  });

  function markInstalled() {
    installed = true;
    prompt = null;
    status.textContent = 'Central de Projetos instalada.';
    updateButton();
  }

  button.addEventListener('click', async () => {
    if (!prompt) {
      if (help.hidden) showHelp();
      else hideHelp();
      return;
    }

    const request = prompt;
    prompt = null;
    hideHelp();
    button.disabled = true;
    try {
      await request.prompt();
      const {outcome} = await request.userChoice;
      if (outcome === 'accepted') markInstalled();
    } catch {
      if (!installed) showHelp();
    } finally {
      button.disabled = false;
      if (!button.hidden) button.focus();
    }
  });

  window.addEventListener('appinstalled', markInstalled);
  standalone.addEventListener?.('change', updateButton);
  updateButton();

  if (window.isSecureContext && 'serviceWorker' in navigator) {
    navigator.serviceWorker.register('./private-assets-sw.js?v=private20261015c', {updateViaCache: 'none'}).catch((error) => {
      console.warn('Não foi possível preparar o catálogo para abrir offline.', error);
    });
  }
})();
