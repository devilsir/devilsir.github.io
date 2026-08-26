(function(){
  'use strict';

  var deferredInstallPrompt = null;
  var installBtn = document.getElementById('pwaInstallBtn');

  function isStandalone(){
    return window.matchMedia && window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
  }

  function updateInstallButton(){
    if(!installBtn) return;
    var canInstall = !!deferredInstallPrompt && !isStandalone();
    installBtn.classList.toggle('is-visible', canInstall);
    installBtn.hidden = !canInstall;
  }

  window.addEventListener('beforeinstallprompt', function(event){
    event.preventDefault();
    deferredInstallPrompt = event;
    updateInstallButton();
  });

  window.addEventListener('appinstalled', function(){
    deferredInstallPrompt = null;
    updateInstallButton();
  });

  if(installBtn){
    installBtn.addEventListener('click', async function(){
      if(!deferredInstallPrompt) return;
      installBtn.disabled = true;
      try{
        deferredInstallPrompt.prompt();
        await deferredInstallPrompt.userChoice;
      }catch(err){
        console.warn('Não foi possível abrir o prompt de instalação do PWA.', err);
      }finally{
        deferredInstallPrompt = null;
        installBtn.disabled = false;
        updateInstallButton();
      }
    });
  }

  if('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')){
    window.addEventListener('load', function(){
      navigator.serviceWorker.register('./service-worker.js', {scope:'./'}).catch(function(err){
        console.warn('Falha ao registrar o service worker.', err);
      });
    });
  }

  updateInstallButton();
})();
