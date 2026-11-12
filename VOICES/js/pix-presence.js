/* Registered module: pix-presence */
(function (initialize) {
  if (window.VoicesModules) window.VoicesModules.define("pix-presence", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error('Module loader is missing');
  else initialize();
})(function () {
(function(){
'use strict';
const V=window.V;
V.PixPresence={
 following(){const s=V.state;if(!s||!V.settings.showPix)return false;const story=s.adventure?.story;return !!(s.flags?.prologueStarted||s.flags?.prologueDone||story?.met||story?.awakened||s.completed?.length||s.finished);},
 draw(ctx,p,cam){
  const slot=V.FollowerPositions.point('pix',p);
  ctx.save();ctx.globalAlpha=1;ctx.imageSmoothingEnabled=false;
  V.Assets.sprite(ctx,'pix',slot.x-cam.x,slot.y-cam.y+(V.settings.reducedMotion?0:Math.sin(V.Engine.time*2)*2),0,0,34);
  ctx.restore();
 }
};
})();

});
