(function(){
'use strict';
const V=window.V;
// Keep gameplay, pointer input and tutorial coordinates in the existing logical
// viewport. Only the presentation surface uses the display's physical pixels.
const H=V.ChallengePresentation={
 surface:null,source:null,
 active(){return V.Game.screen==='game'&&V.Game.mode==='minigame'&&(!V.DuoWorld?.enabled?.()||V.DuoChallenges?.isChild);},
 prepare(source){
  const host=source?.parentElement,box=source?.getBoundingClientRect();if(!host||!box?.width||!box.height)return null;
  if(!this.surface||this.source!==source||!this.surface.isConnected){this.hide();this.surface?.remove();const canvas=document.createElement('canvas');canvas.className='challenge-presentation';canvas.setAttribute('aria-hidden','true');host.insertBefore(canvas,source);this.surface=canvas;this.source=source;}
  const dpr=V.clamp(window.devicePixelRatio||1,1,2),width=Math.max(1,Math.round(box.width*dpr)),height=Math.max(1,Math.round(box.height*dpr)),parent=host.getBoundingClientRect();
  const canvas=this.surface;if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
  Object.assign(canvas.style,{left:(box.left-parent.left-host.clientLeft)+'px',top:(box.top-parent.top-host.clientTop)+'px',width:box.width+'px',height:box.height+'px'});canvas.hidden=false;source.classList.add('challenge-presentation-source');
  const ctx=canvas.getContext('2d');ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,width,height);ctx.setTransform(width/source.width,0,0,height/source.height,0,0);ctx.imageSmoothingEnabled=false;return ctx;
 },
 hide(){this.source?.classList.remove('challenge-presentation-source');if(this.surface)this.surface.hidden=true;},
 render(draw,fallback){if(!this.active()){this.hide();return draw(fallback);}const context=this.prepare(V.Engine.canvas);return draw(context||fallback);}
};
const render=V.Game.render.bind(V.Game);V.Game.render=function(c){return H.render(render,c);};
const title=V.Game.toTitle.bind(V.Game);V.Game.toTitle=function(...args){H.hide();return title(...args);};
})();
