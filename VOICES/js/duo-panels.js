/* Native menus keep their existing actions, scoped to the person who opened them. */
(function(){
'use strict';
const V=window.V,D=V.DuoWorld,C=V.DuoTutorial;
if(!D||V.DuoChallenges.isChild)return;
const query=V.$,queryAll=V.$$;
const P=V.DuoPanels={context:-1,eventOwner:-1,lastOwner:0,states:[{},{}],bound:null,
 enabled(){return D.enabled()&&V.Game.screen==='game'&&V.Game.mode==='explore'&&!V.SceneEditor?.active;},
 owner(focus=false){if(this.context>=0)return this.context;if(C?.currentOwner>=0)return C.currentOwner;if(this.eventOwner>=0)return this.eventOwner;if(C?.eventOwner>=0)return C.eventOwner;if(D.context>=0)return D.context;const root=focus&&document.activeElement?.closest?.('[data-duo-panel-player]');return root?+root.dataset.duoPanelPlayer:-1;},
 root(i){this.mount();return this.states[i]?.root;},
 has(i){return !!this.states[i]?.root?.querySelector('.modal');},
 loading(i){return this.enabled()&&[...V.MapAssets.tasks].some(t=>t.duoPanelOwner===i);},
 mount(){if(!this.enabled()||!D.root)return;
  if(this.bound!==V.state){this.reset();this.bound=V.state;}
  for(let i=0;i<2;i++){if(this.states[i].root?.isConnected)continue;const root=document.createElement('div');root.className='duo-modal-root';root.dataset.duoPanelPlayer=i;root.dataset.duoOwner=i;D.root.querySelectorAll('.duo-world-view')[i].append(root);this.states[i].root=root;const observer=new MutationObserver(changes=>{for(const change of changes)for(const node of change.addedNodes)if(node.nodeType===1)this.bind(node,i);});observer.observe(root,{subtree:true,childList:true});this.states[i].observer=observer;}
 },
 withOwner(i,fn){if(!this.enabled()||i<0)return fn();this.mount();const before=this.context;this.context=i;const swap=before===i?()=>{}:this.swapWidgets(i);try{return C.withOwner(i,()=>D.withActor(i,fn));}finally{swap();this.context=before;}},
 swapWidgets(i){const specs=[[V.ChallengeCatalog,['group','query','page','selected']],[V.WorldAtlas,['view','selected','zoom','pan','drag','mapId','cw','ch','dpr','fitZoom','observer','query','category','scope','showPeople','marks','filter']],[V.Homestead,['organizeId','placement']]],restores=[];
  const widgets=this.states[i].widgets||=new Map();for(const[obj,keys]of specs){if(!obj)continue;let own=widgets.get(obj);if(!own){own={};for(const k of keys)if(Object.hasOwn(obj,k))own[k]=obj[k];widgets.set(obj,own);}const previous={};for(const k of keys){previous[k]={exists:Object.hasOwn(obj,k),value:obj[k]};if(Object.hasOwn(own,k))obj[k]=own[k];else delete obj[k];}restores.push(()=>{for(const k of keys){if(Object.hasOwn(obj,k))own[k]=obj[k];else delete own[k];if(previous[k].exists)obj[k]=previous[k].value;else delete obj[k];}});}
  return()=>restores.reverse().forEach(fn=>fn());
 },
 scoped(q,all=false){const original=all?queryAll:query;if(!this.enabled())return original(q);const i=this.owner(),root=i>=0?this.root(i):null;if(q==='#modal-root')return root||query('#modal-root');
  if(root){const result=all?Array.from(root.querySelectorAll(q)):root.querySelector(q);if(all?result.length:result)return result;}
  const matches=queryAll(q).filter(el=>!el.closest('.duo-modal-root'));return all?matches:matches[0]||null;
 },
 clearInput(i){C.clearInput(i);if(!i)V.Input.touch={x:0,y:0};},
 bind(root,i){if(!root?.isConnected)return;for(const el of [root,...root.querySelectorAll('*')])for(const key of ['onclick','onchange','oninput','onsubmit','onkeydown','onkeyup','onpointerdown','onpointermove','onpointerup','onpointercancel','onwheel']){const fn=el[key];if(typeof fn!=='function'||fn.duoPanelOwner===i)continue;const wrapped=function(...args){return P.withOwner(i,()=>fn.apply(this,args));};wrapped.duoPanelOwner=i;el[key]=wrapped;}},
 close(i){return this.withOwner(i,()=>V.UI.close());},
 closeAll(){for(let i=0;i<2;i++)if(this.has(i))this.close(i);},
 reset(){for(const s of this.states){s.observer?.disconnect();s.root?.remove();s.loading?.remove();s.onClose=null;s.previousFocus=null;}this.states=[{},{}];this.bound=null;this.eventOwner=-1;},
 keyPlayer(code){return /^(Arrow|Numpad)/.test(code)||['Enter','ShiftRight','ControlRight','Slash','Period'].includes(code)?1:/^(Key[A-Z]|Space|Digit[123])$/.test(code)?0:-1;},
 navigate(i,code){const root=this.root(i),buttons=[...root.querySelectorAll('button,input,select,textarea,a[href]')].filter(el=>!el.disabled&&!el.hidden&&!el.closest('[hidden]')&&el.getClientRects().length);if(!buttons.length)return;
  const active=buttons.includes(document.activeElement)?document.activeElement:buttons.includes(this.states[i].focused)?this.states[i].focused:buttons[0],delta=['KeyW','KeyA','ArrowUp','ArrowLeft'].includes(code)?-1:1;const next=buttons[(buttons.indexOf(active)+delta+buttons.length)%buttons.length];this.states[i].focused=next;next.focus();
 },
 handleKey(e,down){if(!this.enabled())return false;const local=e.target.closest?.('[data-duo-panel-player]'),focused=local?+local.dataset.duoPanelPlayer:-1;
  if(e.code==='Tab'&&focused>=0){if(down)this.withOwner(focused,()=>V.UI.focusTrap(e));return true;}
  const i=e.code==='Escape'?(focused>=0?focused:this.lastOwner):this.keyPlayer(e.code);if(i<0)return false;if(this.loading(i))return true;if(!this.has(i))return false;
  if(/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)&&e.code!=='Escape')return false;
  if(down&&!e.repeat)this.withOwner(i,()=>{if(e.code==='Escape'){V.UI.close();return;}if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)){this.navigate(i,e.code);return;}if((i?['Enter','Numpad0']:['Space','KeyE']).includes(e.code)){const target=this.states[i].focused?.isConnected?this.states[i].focused:document.activeElement;if(target?.closest('[data-duo-panel-player]')===this.root(i)&&target.tagName==='BUTTON')target.click();}});
  this.clearInput(i);return true;
 }
};
V.$=q=>P.scoped(q);V.$$=q=>P.scoped(q,true);
// Modal state is local inside an actor context and global outside the split world.
let globalModal=V.modal;
Object.defineProperty(V,'modal',{configurable:true,get(){const i=P.enabled()?P.owner():-1;return i>=0?P.has(i):globalModal;},set(value){const i=P.enabled()?P.owner():-1;if(i>=0)P.states[i].modal=!!value;else globalModal=value;}});
for(const key of ['onClose','previousFocus']){let value=V.UI[key];Object.defineProperty(V.UI,key,{configurable:true,get(){const i=P.enabled()?P.owner():-1;return i>=0?P.states[i][key]:value;},set(next){const i=P.enabled()?P.owner():-1;if(i>=0)P.states[i][key]=next;else value=next;}});}
const modal=V.UI.modal.bind(V.UI),close=V.UI.close.bind(V.UI);
V.UI.modal=function(...args){if(!P.enabled())return modal(...args);const i=P.owner(true)>=0?P.owner(true):0;return P.withOwner(i,()=>{P.lastOwner=i;const out=modal(...args),root=P.root(i),dialog=root.querySelector('.modal');dialog?.setAttribute('aria-modal','false');dialog?.removeAttribute('aria-labelledby');dialog?.removeAttribute('aria-describedby');dialog?.setAttribute('aria-label',args[0]+' · jogador '+(i+1));queueMicrotask(()=>P.bind(root,i));return out;});};
V.UI.close=function(...args){if(!P.enabled())return close(...args);const i=P.owner(true)>=0?P.owner(true):P.lastOwner;return P.withOwner(i,()=>close(...args));};
const clear=V.Input.clear.bind(V.Input);V.Input.clear=function(){const i=P.enabled()?P.owner():-1;return i>=0?P.clearInput(i):clear();};
const menu=D.menu.bind(D);D.menu=function(i,key){return P.withOwner(i,()=>menu(i,key));};
const M=V.MapAssets,ensure=M.ensure.bind(M),show=M.show.bind(M),hide=M.hide.bind(M),progress=M.progress.bind(M);
function privateProgress(){if(!P.enabled())return;P.mount();for(let i=0;i<2;i++){const tasks=[...M.tasks].filter(t=>t.duoPanelOwner===i),s=P.states[i];if(!tasks.length){s.loading?.remove();s.loading=null;continue;}if(!s.loading){s.loading=document.createElement('section');s.loading.className='duo-pane-loading';s.loading.setAttribute('role','status');s.loading.innerHTML='<strong></strong><p></p><progress max="1" value="0"></progress><button class="secondary" hidden>Tentar novamente</button>';s.loading.querySelector('button').onclick=()=>{for(const task of M.tasks)if(task.duoPanelOwner===i)task.retry?.();};D.root.querySelectorAll('.duo-world-view')[i].append(s.loading);}const rows=[...new Set(tasks.flatMap(t=>t.rows))],done=rows.filter(r=>r.state==='loaded').length,failed=rows.some(r=>r.state==='failed');s.loading.querySelector('strong').textContent=tasks.at(-1).label;s.loading.querySelector('p').textContent=failed?'O carregamento falhou. Tente novamente.':'Preparando as imagens… '+done+' / '+rows.length;s.loading.querySelector('button').hidden=!failed;const bar=s.loading.querySelector('progress');bar.max=Math.max(1,rows.length);bar.value=done;}}
function globalTasks(){return !P.enabled()||[...M.tasks].some(t=>t.duoPanelOwner===undefined);}
Object.defineProperty(M,'busy',{configurable:true,get(){if(!P.enabled())return this.tasks.size>0;const i=P.owner();return [...this.tasks].some(t=>t.duoPanelOwner===undefined||t.duoPanelOwner===i);}});
M.show=function(){privateProgress();if(globalTasks())return show();};M.progress=function(){privateProgress();if(globalTasks())return progress();};M.hide=function(){privateProgress();if(!globalTasks()||!M.tasks.size)return hide();};
M.ensure=function(groups,label,after,...args){const i=P.enabled()?P.owner():-1,state=V.state,before=new Set(this.tasks),guarded=after&&i>=0?(...values)=>V.state===state&&P.enabled()?P.withOwner(i,()=>after(...values)):undefined:after,result=ensure(groups,label,guarded,...args);if(i>=0&&!D.loading&&!D.starting&&!V.SceneEditor?.active){for(const task of this.tasks)if(!before.has(task))task.duoPanelOwner=i;if(!globalTasks())hide();privateProgress();}return result;};
M.whenReady=async function(){await Promise.resolve();return new Promise(resolve=>{const check=()=>this.tasks.size?setTimeout(check,20):resolve();check();});};
// Menu callbacks registered through addEventListener need the same owner as onclick.
const add=EventTarget.prototype.addEventListener,remove=EventTarget.prototype.removeEventListener,listeners=new WeakMap();
EventTarget.prototype.addEventListener=function(type,fn,options){const root=this.closest?.('[data-duo-panel-player]');if(!root||typeof fn!=='function')return add.call(this,type,fn,options);let map=listeners.get(this);if(!map)listeners.set(this,map=new Map());const capture=typeof options==='boolean'?options:!!options?.capture,key=type+':'+capture;let byType=map.get(key);if(!byType)map.set(key,byType=new WeakMap());let wrapped=byType.get(fn);if(!wrapped){const i=+root.dataset.duoPanelPlayer;wrapped=function(...args){return P.withOwner(i,()=>fn.apply(this,args));};byType.set(fn,wrapped);}return add.call(this,type,wrapped,options);};
EventTarget.prototype.removeEventListener=function(type,fn,options){const capture=typeof options==='boolean'?options:!!options?.capture;return remove.call(this,type,listeners.get(this)?.get(type+':'+capture)?.get(fn)||fn,options);};
for(const type of ['click','input','change','keydown','pointerdown','pointermove','pointerup','wheel'])document.addEventListener(type,e=>{const root=e.target.closest?.('[data-duo-panel-player]');if(!root||!P.enabled())return;const before=P.eventOwner;P.eventOwner=+root.dataset.duoPanelPlayer;queueMicrotask(()=>P.eventOwner=before);},true);
document.addEventListener('focusin',e=>{const root=e.target.closest?.('[data-duo-panel-player]');if(root)P.states[+root.dataset.duoPanelPlayer].focused=e.target;});
for(const key of ['setTimeout','requestAnimationFrame']){const schedule=window[key];window[key]=function(fn,...args){const i=P.enabled()?P.owner():-1,state=V.state;return schedule.call(this,typeof fn==='function'&&i>=0&&P.has(i)?(...values)=>{if(V.state===state)P.withOwner(i,()=>fn(...values));}:fn,...args);};}
const Observer=window.ResizeObserver;window.ResizeObserver=class extends Observer{constructor(fn){const i=P.enabled()?P.owner():-1,state=V.state;super(i>=0?(...args)=>{if(V.state===state&&P.enabled())P.withOwner(i,()=>fn(...args));}:fn);}};
// Keyboard shortcuts, header buttons and direct menu links enter a complete scope,
// including the bindings installed after UI.modal returns.
for(const[obj,keys]of [[V.Game,['onKey','interact','pause','settings','map','glossary','gallery']],[V.Quests,['inventory','journal','badges']],[V.ChallengeCatalog,['open','detail','render']],[V.WorldAtlas,['open']],[V.Living,['journal']],[V.Homestead,['panel','organize']],[V.Progress,['character']],[V.FishingChallenge,['open']]])for(const key of keys){if(typeof obj?.[key]!=='function')continue;const original=obj[key].bind(obj);obj[key]=function(...args){if(!P.enabled())return original(...args);const i=P.owner()>=0?P.owner():0;return P.context===i?original(...args):P.withOwner(i,()=>original(...args));};}
const title=V.Game.toTitle.bind(V.Game);V.Game.toTitle=function(...args){P.closeAll();const out=title(...args);P.reset();globalModal=false;return out;};
})();
