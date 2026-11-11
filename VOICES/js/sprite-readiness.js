/* Registered module: sprite-readiness */
(function (initialize) {
  if (window.VoicesModules) window.VoicesModules.define("sprite-readiness", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error('Module loader is missing');
  else initialize();
})(function () {
(function(){
'use strict';const V=window.V,L=V.AssetLoader;
// Late arrivals and retried images must invalidate silhouettes generated from
// the previous art. Never reuse a temporary NPC outline after its sprite loads.
const loaded=L.loaded.bind(L);L.loaded=function(record,...args){
 if(record.state==='cancelled'||record.state==='loaded')return;
 // A load event can precede the browser's bitmap decoding. Keep the loading
 // slot and promise until that bitmap can actually be drawn, including retries.
 if(record.img.naturalWidth&&typeof record.img.decode==='function'&&!record.decodeComplete){
  const attempt=record.attempt;if(record.decodePromise&&record.decodeAttempt===attempt)return record.decodePromise;
  record.decodeAttempt=attempt;
  record.decodePromise=record.img.decode().then(()=>{
   if(record.state!=='loading'||record.attempt!==attempt)return;
   record.decodeComplete=true;record.decodePromise=null;L.loaded(record,...args);
  },()=>{if(record.state!=='loading'||record.attempt!==attempt)return;record.decodePromise=null;L.errored(record,args[0]);});
  return record.decodePromise;
 }
 const before=record.state,out=loaded(record,...args);
 if(before!=='loaded'&&record.state==='loaded'){V.SceneShadows.discard(record.img);V.ObjectiveGuide._targetOutlines?.clear();}
 return out;
};
const frame=V.SpriteFrames.draw.bind(V.SpriteFrames);V.SpriteFrames.draw=function(c,image,...args){return V.Assets.ready(image)?frame(c,image,...args):false;};
})();

});
