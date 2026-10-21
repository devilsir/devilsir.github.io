(function(){
'use strict';
const V=window.V;
V.PixPresence={
 following(){const s=V.state;if(!s)return false;const story=s.adventure?.story;return !!(s.flags?.prologueStarted||s.flags?.prologueDone||story?.met||story?.awakened||s.completed?.length||s.finished);},
 draw(ctx,p,cam){ctx.save();ctx.globalAlpha=1;ctx.imageSmoothingEnabled=false;V.Assets.sprite(ctx,'pix',p.x-cam.x-38,p.y-cam.y-37+(V.settings.reducedMotion?0:Math.sin(V.Engine.time*2)*2),0,0,34);ctx.restore();}
};
})();
