(function(){
  'use strict';

  var deferredInstallPrompt = null;
  var installBtn = document.getElementById('pwaInstallBtn');
  var stage = document.getElementById('stage');
  if(!installBtn || !stage) return;

  function isStandalone(){
    return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
      window.navigator.standalone === true;
  }

  function currentScreen(){
    var active = stage.querySelector('.screen.active');
    return active ? active.id : '';
  }

  function updateInstallButton(){
    var screen = currentScreen();
    installBtn.dataset.screen = screen;
    installBtn.hidden = isStandalone() || (screen !== 'intro' && screen !== 'home');
  }

  var help = document.createElement('div');
  help.id = 'pwaInstallHelp';
  help.hidden = true;
  help.innerHTML = '<div class="pwaHelpPanel" role="dialog" aria-modal="true" aria-labelledby="pwaHelpTitle">' +
    '<button type="button" class="pwaHelpClose" aria-label="Fechar orientações">×</button>' +
    '<div class="pwaHelpEyebrow">ROULETA QUÍMICA</div>' +
    '<h2 id="pwaHelpTitle">Instalar o aplicativo</h2>' +
    '<p id="pwaHelpText"></p>' +
    '<p class="pwaHelpNote">Depois de instalado, abra pela tela inicial. Você não precisa baixar nenhum APK.</p>' +
    '<button type="button" class="pwaHelpDone">Entendi</button></div>';
  stage.appendChild(help);
  var helpText = document.getElementById('pwaHelpText');
  var closeButton = help.querySelector('.pwaHelpClose');
  var doneButton = help.querySelector('.pwaHelpDone');

  function instructions(){
    var agent = navigator.userAgent || '';
    if(/iPhone|iPad|iPod/i.test(agent) ||
       (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)){
      return 'No Safari, toque no botão Compartilhar e escolha “Adicionar à Tela de Início”. Se estiver em outro navegador, abra este site no Safari primeiro.';
    }
    if(/Android/i.test(agent)){
      return 'No Chrome, toque no menu de três pontos (⋮) e escolha “Instalar app” ou “Adicionar à tela inicial”. Se estiver dentro de outro aplicativo, abra a página no Chrome.';
    }
    return 'Abra o menu do seu navegador e procure “Instalar app” ou “Criar atalho”. No Chrome e no Edge, a opção também pode aparecer na barra de endereço.';
  }

  function showHelp(){
    helpText.textContent = instructions();
    help.hidden = false;
    closeButton.focus();
  }

  function closeHelp(){
    help.hidden = true;
    installBtn.focus();
  }

  closeButton.addEventListener('click', closeHelp);
  doneButton.addEventListener('click', closeHelp);
  help.addEventListener('click', function(event){
    if(event.target === help) closeHelp();
  });
  document.addEventListener('keydown', function(event){
    if(event.key === 'Escape' && !help.hidden) closeHelp();
  });

  window.addEventListener('beforeinstallprompt', function(event){
    event.preventDefault();
    deferredInstallPrompt = event;
    updateInstallButton();
  });

  window.addEventListener('appinstalled', function(){
    deferredInstallPrompt = null;
    help.hidden = true;
    updateInstallButton();
  });

  installBtn.addEventListener('click', async function(){
    if(!deferredInstallPrompt){
      showHelp();
      return;
    }

    var promptEvent = deferredInstallPrompt;
    deferredInstallPrompt = null;
    installBtn.disabled = true;
    try{
      await promptEvent.prompt();
      var choice = await promptEvent.userChoice;
      if(!choice || choice.outcome !== 'accepted') showHelp();
    }catch(error){
      console.warn('O navegador não abriu a instalação.', error);
      showHelp();
    }finally{
      installBtn.disabled = false;
      updateInstallButton();
    }
  });

  var observer = new MutationObserver(updateInstallButton);
  stage.querySelectorAll('.screen').forEach(function(screen){
    observer.observe(screen, {attributes:true, attributeFilter:['class']});
  });

  if('serviceWorker' in navigator &&
     (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')){
    window.addEventListener('load', function(){
      navigator.serviceWorker.register('./service-worker.js', {scope:'./'})
        .catch(function(error){
          console.warn('Falha ao registrar o modo offline.', error);
        });
    });
  }

  updateInstallButton();
})();