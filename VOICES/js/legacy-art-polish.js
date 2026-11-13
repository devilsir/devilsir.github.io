/* Registered module: legacy-art-polish */
(function (initialize) {
  if (window.VoicesModules) window.VoicesModules.define("legacy-art-polish", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error('Module loader is missing');
  else initialize();
})(function () {
(function(){
'use strict';const V=window.V;
const load=V.Assets.load.bind(V.Assets);V.Assets.load=async function(...args){
 await Promise.all([load(...args),this.loadEntries(['props','world-props'].map(id=>[id,'assets/tilesets/'+id+'-polished.webp?v=20261102-polish1']))]);
};
V.Assets.prop=function(c,index,x,y,size=48){const image=this.images.props;if(!image?.width)return;const cell=image.width/12;c.save();c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';c.drawImage(image,index%12*cell,Math.floor(index/12)*cell,cell,cell,Math.round(x),Math.round(y),size,size);c.restore();};
V.Living.richProp=function(c,index,x,y,size=48){const image=V.Assets.images['world-props'];if(!image?.width)return;const cell=image.width/8;c.save();c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';c.drawImage(image,index%8*cell,Math.floor(index/8)*cell,cell,cell,Math.round(x),Math.round(y),size,size);c.restore();};
})();

});
