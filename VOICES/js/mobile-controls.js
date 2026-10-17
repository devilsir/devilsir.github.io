(function mobileControls(){
'use strict';
const V=window.V;
const M=V.MobileControls={ready:false,wasPaused:false,
 init(){if(this.ready)return;this.ready=true;this.media=window.matchMedia('(pointer: coarse), (max-width: 600px)');this.stage=V.$('#stage');this.game=V.$('#game-screen');this.controls=V.$('#touch-controls');this.stick=V.$('#stick');const refresh=()=>{this.sync();V.Viewport.resize();};this.media.addEventListener('change',refresh);window.addEventListener('resize',refresh);window.visualViewport?.addEventListener('resize',refresh);
 const mission=V.$('.mission-hud');this.hudObserver=new ResizeObserver(()=>this.stage.style.setProperty('--touch-mission-height',Math.ceil(mission.getBoundingClientRect().height)+'px'));this.hudObserver.observe(mission);
 const reset=()=>{V.Input.touch={x:0,y:0};this.stick.style.transform='';};V.$('#joystick').addEventListener('lostpointercapture',reset);V.$('#joystick').addEventListener('contextmenu',e=>e.preventDefault());this.sync();},
 sync(){if(!this.ready)return;const enabled=this.media.matches,paused=!!(V.modal||V.Dialogue.active||V.SceneEditor.active||V.Game.screen!=='game'||V.Game.mode!=='explore');this.stage.classList.toggle('touch-layout',enabled);this.stage.classList.toggle('touch-input-paused',enabled&&paused);this.game.classList.toggle('touch-game',enabled);this.controls.hidden=!enabled||paused;
 if(paused&&!this.wasPaused){V.Input.touch={x:0,y:0};this.stick.style.transform='';}this.wasPaused=paused;
 const cart=V.$('#home-cart');if(cart&&cart!==this.cart){cart.setAttribute('aria-label','Casa: comprar, vender e guardar móveis');cart.title='Casa: comprar, vender e guardar móveis';this.cart=cart;}
 }
};
const init=V.Game.init.bind(V.Game);V.Game.init=async function(...args){const result=await init(...args);M.init();return result;};
const render=V.Game.render.bind(V.Game);V.Game.render=function(...args){const result=render(...args);M.sync();return result;};
})();
