(function(){
'use strict';const V=window.V;
const load=V.Assets.load.bind(V.Assets);V.Assets.load=async function(...args){await load(...args);await Promise.all([['props','props-polished'],['world-props','world-props-polished']].map(([id,file])=>new Promise(resolve=>{const image=V.Assets.image();image.onload=()=>{this.images[id]=image;resolve();};image.onerror=resolve;image.src='assets/tilesets/'+file+'.webp?v=20261102-polish1';})));};
V.Assets.prop=function(c,index,x,y,size=48){const image=this.images.props;if(!image?.width)return;const cell=image.width/12;c.save();c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';c.drawImage(image,index%12*cell,Math.floor(index/12)*cell,cell,cell,Math.round(x),Math.round(y),size,size);c.restore();};
V.Living.richProp=function(c,index,x,y,size=48){const image=V.Assets.images['world-props'];if(!image?.width)return;const cell=image.width/8;c.save();c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';c.drawImage(image,index%8*cell,Math.floor(index/8)*cell,cell,cell,Math.round(x),Math.round(y),size,size);c.restore();};
})();
