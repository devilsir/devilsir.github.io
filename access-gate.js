(() => {
  'use strict';
  const script=document.currentScript;
  const scope=script?.dataset.accessProfile;
  if (!['albums','timbo'].includes(scope)) return;
  const API='https://uknijxfkmsuqpbiyllvc.supabase.co/functions/v1/portfolio-access';
  const KEY='portfolio:server-session:v2:'+scope;
  const root=document.documentElement;
  root.classList.add('access-locked');
  let accessToken='';
  function loadSession(){try{return JSON.parse(sessionStorage.getItem(KEY)||'null')}catch{return null}}
  function clearSession(){try{sessionStorage.removeItem(KEY)}catch{}}
  function saveSession(token,expiresIn){try{sessionStorage.setItem(KEY,JSON.stringify({token,exp:Date.now()+expiresIn*1000}))}catch{}}
  function unlock(){root.classList.remove('access-locked');document.getElementById('access-gate')?.remove()}
  async function request(route,data,token){
    const headers={'Content-Type':'application/json'};
    if(token)headers['X-Portfolio-Token']=token;
    const res=await fetch(API+route,{method:'POST',headers,body:JSON.stringify(data),cache:'no-store'});
    const payload=await res.json().catch(()=>({error:'Resposta inválida do servidor'}));
    if(!res.ok)throw Error(payload.error||'Acesso indisponível');
    return payload;
  }
  async function verifyStored(){
    const saved=loadSession();
    if(!saved||!saved.token||saved.exp<Date.now()){clearSession();return false}
    try{
      const result=await request('/check',{scope},saved.token);
      if(result.valid){accessToken=saved.token;unlock();return true}
    }catch(_){}
    clearSession();return false;
  }
  function mount(){
    const gate=document.createElement('div');
    gate.id='access-gate';
    gate.innerHTML=[
      '<main class="access-panel" role="dialog" aria-modal="true" aria-labelledby="access-title">',
      '<div class="access-emblem" aria-hidden="true">✦</div>',
      '<div class="access-eyebrow">ACESSO COM SENHA</div>',
      '<h1 id="access-title"></h1>',
      '<p class="access-description">Digite a senha para continuar.</p>',
      '<form id="access-form">',
      '<label for="access-password">Senha</label>',
      '<div class="access-input-wrap"><input id="access-password" type="password" required autocomplete="current-password" placeholder="Digite a senha" aria-describedby="access-error">',
      '<button id="access-toggle" type="button" aria-label="Mostrar senha">Mostrar</button></div>',
      '<p id="access-error" role="status" aria-live="polite"></p>',
      '<button class="access-submit" type="submit">Desbloquear <span aria-hidden="true">↗</span></button>',
      '</form><a class="access-back" id="access-back">← Voltar aos projetos</a>',
      '<small class="access-note">A senha é verificada pelo servidor. Sessão temporária de até 4 horas.</small>',
      '</main>'
    ].join('');
    document.body.appendChild(gate);
    gate.querySelector('#access-title').textContent=scope==='albums'?'Acesso ao álbum':'Acesso ao projeto';
    gate.querySelector('#access-back').href=script.dataset.accessReturn||'../';
    const form=gate.querySelector('form');
    const input=gate.querySelector('#access-password');
    const status=gate.querySelector('#access-error');
    const submit=gate.querySelector('.access-submit');
    const toggle=gate.querySelector('#access-toggle');
    let busy=false;
    toggle.addEventListener('click',()=>{let show=input.type==='password';input.type=show?'text':'password';toggle.textContent=show?'Ocultar':'Mostrar';toggle.setAttribute('aria-label',show?'Ocultar senha':'Mostrar senha')});
    form.addEventListener('submit',async event=>{
      event.preventDefault();
      if(busy)return;
      busy=true;submit.disabled=true;submit.textContent='Verificando…';status.textContent='';
      try {
        const data=await request('/login',{scope,password:input.value});
        if(!data.token)throw Error('A sessão não foi criada');
        accessToken=data.token;
        saveSession(data.token,data.expiresIn);
        input.value='';unlock();
      }catch(error){
        input.value='';status.textContent=error.message||'Falha de autenticação';input.focus();
      }finally{busy=false;submit.disabled=false;submit.innerHTML='Desbloquear <span aria-hidden="true">↗</span>'}
    });
    verifyStored().then(valid=>{if(!valid){input.focus({preventScroll:true})}});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
  window.PortfolioAccess=Object.freeze({
    scope,
    session:()=>accessToken,
    logout:async()=>{if(accessToken)await request('/logout',{},accessToken).catch(()=>{});accessToken='';clearSession();root.classList.add('access-locked');if(!document.querySelector('#access-gate'))mount();}
  });
})();