/* Registered module: engine */
(function (initialize) {
  if (window.VoicesModules) window.VoicesModules.define("engine", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error('Module loader is missing');
  else initialize();
})(function () {
(function(){'use strict';
const V=window.V=window.V||{};
V.$=(q)=>document.querySelector(q); V.$$=(q)=>Array.from(document.querySelectorAll(q));
V.escape=(s)=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
V.lang=(s,grade)=>typeof s==='object'&&s?s[grade||V.state?.grade||6]||s[6]||Object.values(s)[0]:String(s??'');
V.clamp=(v,a,b)=>Math.max(a,Math.min(b,v)); V.rand=(a,b)=>a+Math.random()*(b-a); V.dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
V.Events={listeners:{},on(name,fn){(this.listeners[name]??=[]).push(fn);return()=>{this.listeners[name]=this.listeners[name].filter(x=>x!==fn);};},emit(name,data){(this.listeners[name]||[]).forEach(fn=>fn(data));}};
V.UI={onClose:null,previousFocus:null,
 modal(title,subtitle,body,footer='',wide=false){this.close(false);this.previousFocus=document.activeElement;const theme=V.Interface?.theme(title,body)||'community';V.modal=true;V.$('#modal-root').innerHTML=`<div class="modal-backdrop"><section class="modal ui-${theme} ${wide?'wide':''}" role="dialog" aria-modal="true" aria-labelledby="modal-title" aria-describedby="modal-subtitle"><header class="modal-head"><div class="modal-heading">${V.Interface?.icon(V.Interface.emblem(theme))||''}<div><h2 id="modal-title">${V.escape(title)}</h2><p id="modal-subtitle">${V.escape(subtitle||'')}</p></div></div><button class="close-modal" aria-label="Fechar e voltar ao jogo">×</button></header><div class="modal-body">${body}</div>${footer?`<footer class="modal-footer">${footer}</footer>`:''}</section></div>`;
 const modalRoot=V.$('#modal-root');modalRoot.querySelector('.close-modal').onclick=()=>this.close();setTimeout(()=>modalRoot.querySelector('.modal-body button,.modal-body input,.modal-body select,.modal-footer button,.close-modal')?.focus(),30); V.Input.clear();},
 close(focus=true){const cb=this.onClose;this.onClose=null;V.$('#modal-root').innerHTML='';V.modal=false;if(cb)cb();if(focus&&this.previousFocus?.isConnected)this.previousFocus.focus();V.Input?.clear();},
 toast(message,type='',action=null){
  const el=document.createElement('div');
  el.className='toast '+type;
  el.textContent=message;
  if(action){
   const button=document.createElement('button');
   button.type='button';
   button.textContent=action.label;
   button.onclick=()=>{el.remove();action.run();};
   el.append(button);
  }
  V.$('#toast-root').appendChild(el);
  setTimeout(()=>el.remove(),action?7500:3800);
 },
 confirm(title,text,fn){this.modal(title,'',`<p>${V.escape(text)}</p>`,`<button id="confirm-no" class="secondary">Cancelar</button><button id="confirm-yes" class="primary">Confirmar</button>`);V.$('#confirm-no').onclick=()=>this.close();V.$('#confirm-yes').onclick=()=>{this.close();fn();};},
 portrait(id,expression=0,size=96){return `<canvas class="portrait" data-portrait="${V.escape(id)}" data-expression="${expression}" width="96" height="96" style="width:${size}px;height:${size}px"></canvas>`;},
 fullBody(id){return `<canvas class="character-full-body" data-character-preview="${V.escape(id)}" width="128" height="128" aria-hidden="true"></canvas>`;},
 paintCharacterPreviews(){for(const canvas of V.$$('[data-character-preview]')){
  const c=canvas.getContext('2d');c.clearRect(0,0,128,128);
  const id=canvas.dataset.characterPreview,image=V.Assets.images['character-previews'];
  const index=V.PlayableCharacters.indexOf(id);
  if(V.Assets.ready(image)&&index>=0){
   c.drawImage(image,index%5*112,Math.floor(index/5)*112,112,112,4,4,120,120);
  }else V.Assets.sprite(c,id,64,116,0,0,122);
 }},
 drawPortrait(canvas,id,expression=0,fallback=null){
  if(!canvas)return;
  const image=V.Assets.images[id+'-portrait'];
  const draw=portrait=>{
   if(!V.Assets.ready(portrait))return;
   const ctx=canvas.getContext('2d');
   const frame=V.clamp(Math.trunc(Number(expression)||0),0,Math.max(0,Math.floor(portrait.naturalWidth/96)-1));
   ctx.clearRect(0,0,canvas.width,canvas.height);
   ctx.imageSmoothingEnabled=false;
   ctx.drawImage(portrait,frame*96,0,96,96,0,0,canvas.width,canvas.height);
  };
  if(V.Assets.ready(image))draw(image);
  else{
   draw(V.Assets.images[fallback+'-portrait']);
   V.AssetLoader.request(image).then(loaded=>{if(loaded&&canvas.isConnected)draw(image);});
  }
 },
 paintPortraits(){for(const canvas of V.$$('[data-portrait]'))this.drawPortrait(canvas,canvas.dataset.portrait,canvas.dataset.expression);},
 focusTrap(e){if(e.key!=='Tab')return;const root=V.$('.modal')||V.$('.dialogue-box');if(!root)return;const els=Array.from(root.querySelectorAll('button,input,select,textarea,a[href]')).filter(x=>!x.disabled&&!x.hidden&&(!x.getClientRects||x.getClientRects().length));if(!els.length)return;if(!els.includes(document.activeElement)){e.preventDefault();(e.shiftKey?els.at(-1):els[0]).focus();}else if(e.shiftKey&&document.activeElement===els[0]){e.preventDefault();els.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===els.at(-1)){e.preventDefault();els[0].focus();}}
};
V.Input={keys:new Set(),pressed:new Set(),touch:{x:0,y:0},gamepad:{x:0,y:0},padOld:[],
 down(k){return this.keys.has(k.toLowerCase());},tap(k){const hit=this.pressed.has(k.toLowerCase());this.pressed.delete(k.toLowerCase());return hit;},clear(){this.keys.clear();this.pressed.clear();this.touch={x:0,y:0};},
 axis(){let x=(this.down('d')||this.down('arrowright')?1:0)-(this.down('a')||this.down('arrowleft')?1:0);let y=(this.down('s')||this.down('arrowdown')?1:0)-(this.down('w')||this.down('arrowup')?1:0);x+=this.touch.x+this.gamepad.x;y+=this.touch.y+this.gamepad.y;const len=Math.hypot(x,y);return len>1?{x:x/len,y:y/len}:{x,y};},
 init(){document.addEventListener('keydown',e=>{V.UI.focusTrap(e);if(V.SceneEditor?.active&&e.key==='Escape'&&/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)){V.SceneEditor.key('escape',e);return;}if(/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;const k=e.key.toLowerCase();if(!e.repeat)this.pressed.add(k);this.keys.add(k);if(V.Game?.screen==='game'&&['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k)&&!(V.SceneEditor?.active&&e.target.tagName==='BUTTON'&&k===' '))e.preventDefault();V.Game?.onKey(k,e);});document.addEventListener('keyup',e=>this.keys.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>{this.clear();if(V.Game?.screen==='game'&&!V.modal&&!V.Dialogue?.active)V.Game.pause('A janela perdeu o foco.');});
 const joy=V.$('#joystick'),stick=V.$('#stick');const update=(e)=>{const b=joy.getBoundingClientRect();const x=V.clamp((e.clientX-b.left-b.width/2)/(b.width*.35),-1,1),y=V.clamp((e.clientY-b.top-b.height/2)/(b.height*.35),-1,1);this.touch={x,y};stick.style.transform=`translate(${x*26}px,${y*26}px)`;};joy.onpointerdown=e=>{joy.setPointerCapture(e.pointerId);update(e);};joy.onpointermove=e=>{if(joy.hasPointerCapture(e.pointerId))update(e);};const end=()=>{this.touch={x:0,y:0};stick.style.transform='';};joy.onpointerup=end;joy.onpointercancel=end;V.$('#touch-interact').onpointerdown=e=>{e.preventDefault();this.pressed.add('e');};V.$('#touch-shield').onpointerdown=e=>{e.preventDefault();this.pressed.add(' ');};},
 pollGamepad(){const pad=navigator.getGamepads?.()[0];if(!pad){this.gamepad={x:0,y:0};return;}this.gamepad={x:Math.abs(pad.axes[0]||0)>.18?pad.axes[0]:0,y:Math.abs(pad.axes[1]||0)>.18?pad.axes[1]:0};[0,1,9].forEach((n,i)=>{const on=pad.buttons[n]?.pressed;if(on&&!this.padOld[n]){const key=['e',' ','escape'][i];this.pressed.add(key);if(key==='escape')V.Game.onKey(key,{});}this.padOld[n]=on;});}
};
V.Assets={images:{},errors:[],
 loadEntries(entries){return Promise.all(entries.map(([key,path])=>{
  const existing=this.images[key],record=V.AssetLoader.byImage.get(existing);
  const url=V.ImageFormats?.resolve(path)||path;
  if(record?.url===url&&record.state!=='failed')
   return record.state==='deferred'?Promise.resolve():record.promise;
  if(record?.url===url&&record.state==='failed')V.AssetLoader.cancel(record);
  return new Promise(resolve=>{
   const image=V.Assets.image();
   this.images[key]=image;
   image.onload=resolve;
   image.onerror=()=>{this.errors.push(path);resolve();};
   image.src=path;
   V.AssetLoader.register(image,resolve);
  });
 }));},
 async load(){const ids=[...V.PlayableCharacters,'pix','curator','librarian','scientist','journalist','resident','student','musician','gardener','vendor','guide','archivist','technician','teacher','courier','elder','student2','percussionist'];const entries=ids.flatMap(id=>[[id,`assets/characters/${id}.png`],[id+'-portrait',`assets/characters/${id}-portrait.png`]]);['djglitch','eraser','copycat','clickbait','wall','bias'].forEach(id=>entries.push(['boss-'+id,`assets/characters/boss-${id}.png`]));entries.push(['animals','assets/characters/animals.png'],['tiles','assets/tilesets/tiles.png'],['icons','assets/ui/icons.png'],['badges','assets/ui/badges.png'],['effects','assets/effects/effects.png']);entries.push(['character-previews','assets/characters/character-previews.webp']);await this.loadEntries(entries);return this.errors;},
 ready(img){if(!img)return false;const record=V.AssetLoader?.byImage.get(img);if(record&&record.state!=='loaded'&&record.state!=='cancelled')return false;if(typeof img.naturalWidth==='number')return img.complete!==false&&img.naturalWidth>0&&img.naturalHeight>0;return img.width>0&&img.height>0;},
 characterCell(id){const img=this.images[id];return this.ready(img)?(img.naturalWidth||img.width)/4:32;},
 sprite(ctx,id,x,y,row=0,frame=0,size=48){const img=this.images[id];if(!this.ready(img)){if(V.AssetLoader.byImage.get(img)?.state==='deferred')V.AssetLoader.request(img);return;}const cell=this.characterCell(id),r=V.clamp(Math.floor(row)||0,0,Math.floor((img.naturalHeight||img.height)/cell)-1),f=(((Math.floor(frame)||0)%4)+4)%4;ctx.drawImage(img,f*cell,r*cell,cell,cell,Math.round(x-size/2),Math.round(y-size+10),size,size);},
 spritePart(ctx,id,frame,row,height,x,y,width,drawHeight){const img=this.images[id];if(!this.ready(img))return;const cell=this.characterCell(id),r=V.clamp(Math.floor(row)||0,0,Math.floor((img.naturalHeight||img.height)/cell)-1),f=(((Math.floor(frame)||0)%4)+4)%4;ctx.drawImage(img,f*cell,r*cell,cell,cell*V.clamp(height,0,1),Math.round(x),Math.round(y),width,drawHeight);},
 boss(ctx,id,x,y,frame=0,size=144){const img=this.images['boss-'+id];if(!this.ready(img)){if(V.AssetLoader.byImage.get(img)?.state==='deferred')V.AssetLoader.request(img);return;}ctx.drawImage(img,(frame%4)*96,0,96,96,Math.round(x-size/2),Math.round(y-size/2),size,size);},
 prop(ctx,index,x,y,size=48){const img=this.images.props;if(img)ctx.drawImage(img,(index%12)*32,Math.floor(index/12)*32,32,32,Math.round(x),Math.round(y),size,size);},
 effect(ctx,index,x,y,size=48){const img=this.images.effects;if(img)ctx.drawImage(img,(index%8)*32,Math.floor(index/8)*32,32,32,x-size/2,y-size/2,size,size);}
};
V.Engine={canvas:null,ctx:null,time:0,frames:0,last:0,particles:[],
 init(){this.canvas=V.$('#world-canvas');this.ctx=this.canvas.getContext('2d',{alpha:false});this.ctx.imageSmoothingEnabled=false;V.Performance?.configure();const frame=stamp=>{this.tick(stamp);requestAnimationFrame(frame);};requestAnimationFrame(frame);},
 tick(stamp){if(V.Performance&&!V.Performance.accept(stamp)){if(document.hidden)this.last=0;return false;}const start=performance.now(),dt=this.last?V.clamp((stamp-this.last)/1000,0,.04):0;this.last=stamp;if(!V.modal&&!V.Dialogue?.active&&!V.MapAssets?.busy)this.time+=dt;this.frames++;V.Input.pollGamepad();V.Game?.update(dt);if(!V.Performance||V.Performance.renderAllowed())V.Game?.render(this.ctx);V.Input.pressed.clear();V.Performance?.observe(performance.now()-start);return true;},
 burst(x,y,color='#27c8d8',n=18){if(V.settings?.reducedMotion)n=4;const limit=V.Performance?.maxParticles??512;n=Math.min(n,limit-this.particles.length);for(let i=0;i<n;i++)this.particles.push({x,y,vx:V.rand(-65,65),vy:V.rand(-85,35),life:V.rand(.45,1.1),max:1.1,color});},
 updateParticles(dt){this.particles=this.particles.filter(p=>p.life>0);this.particles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=28*dt;p.life-=dt;});},
 drawParticles(ctx,cam={x:0,y:0}){this.particles.forEach(p=>{ctx.globalAlpha=V.clamp(p.life/.4,0,1);ctx.fillStyle=p.color;ctx.fillRect(Math.round(p.x-cam.x),Math.round(p.y-cam.y),3,3);});ctx.globalAlpha=1;},
 text(ctx,text,x,y,color='#f5f1e8',size=16,align='left'){ctx.font=`600 ${size}px "VOICES Sans","Segoe UI",system-ui,sans-serif`;ctx.textAlign=align;ctx.fillStyle=color;ctx.fillText(text,x,y);ctx.textAlign='left';}
};
})();

});
