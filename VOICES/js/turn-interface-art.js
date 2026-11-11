/* Registered module: turn-interface-art */
(function (initialize) {
  if (window.VoicesModules) window.VoicesModules.define('turn-interface-art', initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error('Module loader is missing');
  else initialize();
})(function () {
  'use strict';
  const V=window.V;
  const dir='assets/adventure/turn-interface/';
  const icons=['attack','defend','skills','items','support','context','auto','intents','pulse','track','style','records','health','focus','speed','retreat'];
  const T=V.TurnArt={
    arena:null,
    icon(name){
      const index=icons.indexOf(name);
      if(index<0)return '';
      return `<i class="turn-art-icon" style="--turn-x:${index%4*100/3}%;--turn-y:${Math.floor(index/4)*100/3}%" aria-hidden="true"></i>`;
    }
  };
  const load=V.Assets.load.bind(V.Assets);
  V.Assets.load=async function(...args){
    const arena=new Promise(resolve=>{
      const image=V.Assets.image();
      T.arena=image;
      image.onload=image.onerror=resolve;
      image.src=dir+'arena.webp?v=turns1';
      V.AssetLoader.register(image,resolve);
    });
    const [result]=await Promise.all([load(...args),arena]);
    return result;
  };
});
