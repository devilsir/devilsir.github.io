(function(){
 function boot(){
  const root=document.getElementById('app');
  try{
   const save=new ChemCore.SaveSystem();
   const audio=new ChemCore.AudioSystem(save);
   const input=new ChemCore.InputSystem(save);
   const app=new ChemCore.AppUI(root,save,audio,input);
   window.ChemCoreApp=app;
   app.title();
   window.addEventListener('error',event=>{
    console.error(event.error||event.message);
    if(window.ChemCoreApp)window.ChemCoreApp.toast('Um sistema apresentou instabilidade, mas o progresso local foi preservado.','error');
   });
   document.addEventListener('visibilitychange',()=>{if(document.hidden&&app.game&&!app.game.paused)app.pauseGame()});
  }catch(error){
   console.error(error);
   root.innerHTML=`<section class="loading-screen"><div class="loading-card"><p class="eyebrow">Falha de inicialização</p><h1>CHEMCORE</h1><p>O navegador bloqueou um recurso local. Abra novamente pelo GitHub Pages ou por um servidor estático simples. O jogo não exige instalação nem login.</p><pre style="white-space:pre-wrap;color:#ff9bad">${String(error.message||error)}</pre></div></section>`;
  }
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
