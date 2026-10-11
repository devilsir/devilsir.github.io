const Mobile=(()=>{
 const ua=navigator.userAgent||'';
 const handset=/Android|iPhone|iPad|iPod|Mobile|Tablet/i.test(ua)||navigator.userAgentData?.mobile===true;
 const touchDevice=handset||(matchMedia('(pointer:coarse)').matches&&Math.min(screen.width,screen.height)<=1024);
 const $=id=>document.getElementById(id);
 const stage=$('gameStage'),stack=document.querySelector('.viewer-stack'),deck=document.querySelector('.combat-dock');
 const strip=document.querySelector('.status-strip'),eventBar=$('spaceEvent'),tower=$('towerPanel');
 let resizeFrame=0,handledTouchAt=0,down=null;
 function portrait(){return innerHeight>innerWidth}
 function landscape(){return touchDevice&&!portrait()}
 function sync(){
  document.body.classList.toggle('mobile-device',touchDevice);
  document.body.classList.toggle('mobile-portrait',touchDevice&&portrait());
  document.body.classList.toggle('mobile-landscape',landscape());
  document.body.classList.toggle('mobile-tablet',landscape()&&innerHeight>=600&&innerWidth/innerHeight<1.78);
  if(landscape()){
   if(tower.parentElement!==deck)deck.appendChild(tower);
  }else{
   if(tower.parentElement!==stage)stage.appendChild(tower);
   stage.style.removeProperty('width');stage.style.removeProperty('height');
  }
  fit();
 }
 function fit(){
  cancelAnimationFrame(resizeFrame);
  resizeFrame=requestAnimationFrame(()=>{
   if(!landscape()||!stack?.clientWidth||!stack?.clientHeight)return;
   const statusH=strip?.offsetHeight||0;
   const eventH=eventBar&&!eventBar.classList.contains('hidden')?eventBar.offsetHeight:0;
   const available=Math.max(120,stack.clientHeight-statusH-eventH-2);
   const width=Math.max(120,Math.floor(Math.min(stack.clientWidth,available*16/9)));
   stage.style.width=width+'px';stage.style.height=Math.floor(width*9/16)+'px';
  });
 }
 async function lock(){
  if(!touchDevice||!screen.orientation?.lock)return;
  try{await screen.orientation.lock('landscape')}catch{}
 }
 canvas.addEventListener('pointerdown',e=>{
  if(e.pointerType==='touch')down={id:e.pointerId,x:e.clientX,y:e.clientY};
 });
 canvas.addEventListener('pointerup',e=>{
  if(e.pointerType!=='touch'||!down||down.id!==e.pointerId)return;
  const moved=Math.hypot(e.clientX-down.x,e.clientY-down.y);
  down=null;
  if(moved>17)return;
  e.preventDefault();handledTouchAt=performance.now();
  placeAt(getCanvasPos(e));
 });
 canvas.addEventListener('pointercancel',()=>down=null);
 canvas.addEventListener('click',e=>{
  if(touchDevice&&performance.now()-handledTouchAt<750){e.stopImmediatePropagation();e.preventDefault()}
 },true);
 const watcher=new MutationObserver(fit);
 watcher.observe(eventBar,{attributes:true,attributeFilter:['class']});
 addEventListener('resize',sync);
 addEventListener('orientationchange',sync);
 document.addEventListener('fullscreenchange',()=>setTimeout(sync,80));
 if(window.visualViewport)visualViewport.addEventListener('resize',sync);
 if(window.ResizeObserver)new ResizeObserver(fit).observe(stack);
 sync();
 return {sync,lock,get active(){return landscape()},get supported(){return touchDevice}}
})();
