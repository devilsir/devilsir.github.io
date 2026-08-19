(() => {
  const installButton = document.getElementById('installAppButton');
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isSamsungInternet = /SamsungBrowser/i.test(navigator.userAgent);
  let installPrompt = null;

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch((error) => {
        console.warn('Não foi possível registrar o modo instalável:', error);
      });
    });
  }

  if (!installButton || isStandalone) return;

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    installPrompt = event;
    installButton.hidden = false;
  });

  if (isIOS || isSamsungInternet) installButton.hidden = false;
  if (isSamsungInternet) installButton.textContent = 'Instalar no Chrome';

  installButton.addEventListener('click', async () => {
    if (isSamsungInternet) {
      const path = `${location.host}${location.pathname}${location.search}`;
      location.href = `intent://${path}#Intent;scheme=https;package=com.android.chrome;end`;
      return;
    }

    if (installPrompt) {
      installPrompt.prompt();
      await installPrompt.userChoice;
      installPrompt = null;
      installButton.hidden = true;
      return;
    }

    if (isIOS) {
      window.alert('No Safari, toque em Compartilhar e depois em “Adicionar à Tela de Início”.');
    }
  });

  window.addEventListener('appinstalled', () => {
    installPrompt = null;
    installButton.hidden = true;
  });
})();
