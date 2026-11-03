(function(){
'use strict';const V=window.V,L=V.AssetLoader;
// Late arrivals and retried images must invalidate silhouettes generated from
// the previous art. Never reuse a temporary NPC outline after its sprite loads.
const loaded=L.loaded.bind(L);L.loaded=function(record,...args){const before=record.state,out=loaded(record,...args);if(before!=='loaded'&&record.state==='loaded'){V.SceneShadows.discard(record.img);V.ObjectiveGuide._targetOutlines?.clear();}return out;};
const frame=V.SpriteFrames.draw.bind(V.SpriteFrames);V.SpriteFrames.draw=function(c,image,...args){return V.Assets.ready(image)?frame(c,image,...args):false;};
})();
