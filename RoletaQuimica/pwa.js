(function(){
  'use strict';
  if('serviceWorker' in navigator &&
     (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')){
    window.addEventListener('load', function(){
      navigator.serviceWorker.register('./service-worker.js', {scope:'./'})
        .catch(function(error){
          console.warn('Falha ao registrar o modo offline.', error);
        });
    });
  }
})();
