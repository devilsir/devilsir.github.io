(function () {
  'use strict';
  const form=document.getElementById('pixel-entry'),studio=document.querySelector('.studio');
  function open(){
    form.hidden=true;
    studio.hidden=false;
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
  }
  let embedded=false;
  try{
    embedded=window.parent!==window&&new URLSearchParams(location.search).get('professor')==='1'
      &&window.parent.V?.Access?.authorized===true&&window.parent.V.ProfessorStudio?.view==='sprites';
  }catch{}
  if(embedded)open();
  else window.V.AtelierAccess.bind(form,open);
})();
