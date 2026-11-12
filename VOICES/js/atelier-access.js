/* Registered module: atelier-access */
(function(init){
  if(window.VoicesModules)window.VoicesModules.define('atelier-access',init);
  else init();
})(function(){
  'use strict';
  const V=window.V??={};
  const stamp='a39b3df7b09e34a799b84985779f144c9bfea18e82e8daa510c0472f33e5dee1';
  const context='vh/2026/';
  V.AtelierAccess={
    async check(value){
      const bytes=new TextEncoder().encode(context+value);
      const digest=await window.crypto.subtle.digest('SHA-256',bytes);
      return Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('')===stamp;
    },
    bind(form,onAccept){
      const field=form.querySelector('input'),button=form.querySelector('button[type="submit"]');
      const feedback=form.querySelector('[role="status"]');
      form.addEventListener('submit',async e=>{
        e.preventDefault();
        if(button.disabled)return;
        button.disabled=true;
        try{
          const valid=await this.check(field.value);
          if(!form.isConnected||form.hidden)return;
          field.value='';
          if(valid){onAccept();return;}
          feedback.textContent='Senha incorreta.';
          field.focus();
        }catch{
          if(form.isConnected)feedback.textContent='Abra o jogo via HTTPS ou localhost para verificar a senha.';
        }finally{button.disabled=false;}
      });
      field.focus();
    }
  };
});
