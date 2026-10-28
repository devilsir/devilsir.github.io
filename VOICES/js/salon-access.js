(function(){
'use strict';
const V=window.V,W=V.World,S=V.Salon,A=V.Appearance,B=V.SalonCollection,id=S.id;
const Gate=V.SalonAccess={pending:null,afterStart:null,
unlocked(){return V.state?.flags?.salonUnlocked===true;},
request(resume){
if(!V.state||V.Game.screen!=='game'||V.Game.mode!=='explore'||V.Dialogue.active)return false;
if(this.unlocked())return resume();
if(this.pending?.state===V.state&&V.$('#salon-access-form')){V.$('#salon-access-password').focus();return false;}
const state=V.state,session={state,resume};
V.UI.modal('Acesso ao Salão Íris','UMA SENHA · UM NOVO VISUAL',`<form id="salon-access-form" class="salon-access-form" novalidate><p>Para entrar no salão e mudar seu visual, informe a senha secreta. Você só precisa fazer isso uma vez neste perfil.</p><label class="field" for="salon-access-password">Senha secreta<input id="salon-access-password" name="salon-password" type="password" maxlength="64" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false" aria-describedby="salon-access-feedback" required></label><label class="toggle"><input id="salon-access-show" type="checkbox">Mostrar senha</label><p id="salon-access-feedback" class="salon-access-feedback" role="status" aria-live="polite"></p></form>`,`<button id="salon-access-cancel" class="secondary" type="button">Voltar</button><button id="salon-access-unlock" class="primary" type="submit" form="salon-access-form">Desbloquear</button>`);
V.$('.modal').classList.add('salon-modal','salon-access-modal');this.pending=session;
V.UI.onClose=()=>{if(this.pending===session)this.pending=null;};
const input=V.$('#salon-access-password'),feedback=V.$('#salon-access-feedback');
V.$('#salon-access-show').onchange=e=>{input.type=e.target.checked?'text':'password';};
input.oninput=()=>{input.removeAttribute('aria-invalid');feedback.textContent='';};
V.$('#salon-access-cancel').onclick=()=>V.UI.close();
V.$('#salon-access-form').onsubmit=e=>{
e.preventDefault();if(this.pending!==session||V.state!==state)return;
const value=input.value.trim();if(value!=='lucas'){input.setAttribute('aria-invalid','true');feedback.textContent=value?'Senha incorreta. Tente novamente.':'Digite a senha para continuar.';input.focus();input.select();return;}
state.flags.salonUnlocked=true;V.Save.save();this.pending=null;V.UI.close();V.Audio.sfx('collect');resume();
};
input.focus();return false;
},
checkStart(){const pending=this.afterStart;if(!pending)return;if(pending.state!==V.state||V.Game.screen!=='game'){this.afterStart=null;return;}if(performance.now()<pending.readyAt||V.modal||V.Dialogue.active||V.Game.mode!=='explore')return;this.afterStart=null;this.request(pending.resume);}
};
const load=W.load.bind(W);W.load=function(map,...args){if(map===id&&!Gate.unlocked())return Gate.request(()=>load(map,...args));return load(map,...args);};
const travel=V.FastTravel.travel.bind(V.FastTravel);V.FastTravel.travel=function(map,...args){if(map===id&&!Gate.unlocked())return Gate.request(()=>travel(map,...args));return travel(map,...args);};
const status=V.FastTravel.status.bind(V.FastTravel);V.FastTravel.status=function(map){const result=status(map);return map===id&&!Gate.unlocked()?{...result,label:'Acesso secreto · senha necessária',button:'Desbloquear salão',reason:'Informe a senha de entrada para liberar o salão e a personalização neste perfil.'}:result;};
for(const [target,key]of [[A,'open'],[A,'emblem'],[S,'overview'],[S,'greet'],[S,'wash'],[B,'visit']]){const action=target[key].bind(target);target[key]=function(...args){return Gate.request(()=>action(...args));};}
const start=V.Game.startGame.bind(V.Game);V.Game.startGame=function(...args){const state=V.state,locked=state?.map===id&&!Gate.unlocked(),position=state?.position;if(locked){state.map='market';state.position=null;}const result=start(...args);if(locked){Gate.afterStart={state,readyAt:performance.now()+240,resume:()=>W.load(id,position)};queueMicrotask(()=>Gate.checkStart());}return result;};
const update=V.Game.update.bind(V.Game);V.Game.update=function(...args){const result=update(...args);Gate.checkStart();return result;};
const title=V.Game.toTitle.bind(V.Game);V.Game.toTitle=function(...args){Gate.pending=null;Gate.afterStart=null;return title(...args);};
})();
