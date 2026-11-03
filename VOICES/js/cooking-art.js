(function(){
'use strict';
const V=window.V;
const A=V.CookingArt={images:{},names:['prep','batter','heat','extras','sweets','dishes','additional','world','cover'],
 load(){if(this.ready)return this.ready;this.ready=Promise.all(this.names.map(key=>new Promise(resolve=>{const image=V.Assets.image();this.images[key]=image;image.onload=image.onerror=resolve;image.src='assets/cooking/'+key+'.webp?v=20261101-cook1';V.AssetLoader.register(image,resolve);})));return this.ready;},
 ensure(world=false){return V.MapAssets.ensure([world?'cooking-world':'cooking'],'Preparando a cozinha');},
 crop(sheet,row,col){
  const im=this.images[sheet]||V.NatureArt?.images[sheet],meta=V.CookingCrops?.[sheet],slot=row*4+col,entry=meta?.frames[slot];if(!im?.naturalWidth||!entry)return null;
  this.crops||=new WeakMap();let cache=this.crops.get(im);if(!cache){cache=new Map();this.crops.set(im,cache);}if(cache.has(slot))return cache.get(slot);
  const[x,y,w,h]=entry.box,canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const c=canvas.getContext('2d');c.drawImage(im,x,y,w,h,0,0,w,h);
  // Keep the authored silhouette and alpha fringe without reading pixels from
  // a canvas that may be tainted by file:// image origins. These rectangles
  // remove neighbouring sprites and are generated alongside the crop bounds.
  if(typeof entry.clear==='string'){
   const rectangles=atob(entry.clear);
   for(let i=0;i<rectangles.length;i+=4)c.clearRect(rectangles.charCodeAt(i),rectangles.charCodeAt(i+1),rectangles.charCodeAt(i+2),rectangles.charCodeAt(i+3));
  }else for(const[rx,ry,rw,rh]of entry.clear||[])c.clearRect(rx,ry,rw,rh);
  cache.set(slot,canvas);return canvas;
 },
 frame(c,sheet,row,col,x,y,w,h){const im=this.images[sheet]||V.NatureArt?.images[sheet];if(!im?.naturalWidth)return false;const crop=this.crop(sheet,row,col);c.save();c.imageSmoothingEnabled=false;if(crop){const scale=Math.min(w/crop.width,h/crop.height,1.8),dw=crop.width*scale,dh=crop.height*scale;c.drawImage(crop,Math.round(x+(w-dw)/2),Math.round(y+(h-dh)/2),Math.round(dw),Math.round(dh));}else{const rows=sheet==='world'||sheet==='new-dishes'?2:sheet==='cover'?1:4,cols=sheet==='cover'?1:4,sw=im.naturalWidth/cols,sh=im.naturalHeight/rows;c.drawImage(im,col*sw,row*sh,sw,sh,Math.round(x),Math.round(y),Math.round(w),Math.round(h));}c.restore();return true;},
 stage(c,s,progress,x,y,w,h){const art=s.art,frame=progress>=1?art.to:art.from+Math.floor((art.to-art.from)*V.clamp(progress,0,.999));this.frame(c,art.sheet,art.row,frame,x,y,w,h);},
 dish(id,size=48){const item=V.AdventureData.items[id];if(!item?.cookingItem)return null;const frame=item.cookingFrame??item.frame;return `<span class="cooking-dish-art adv-icon" aria-hidden="true" style="--dish-size:${size}px;--dish-x:${frame%4};--dish-y:${Math.floor(frame/4)};background-image:url('assets/cooking/dishes.webp?v=20261101-cook1')"></span>`;}
};
const group=V.AssetLoader.group.bind(V.AssetLoader);V.AssetLoader.group=function(key){if(key.startsWith('assets/cooking/'))return /\/world\./.test(key)?'cooking-world':'cooking';return group(key);};
const load=V.Assets.load.bind(V.Assets);V.Assets.load=async function(...args){await Promise.all([load(...args),A.load()]);};
const icon=V.Progress.icon.bind(V.Progress);V.Progress.icon=function(id,size){return A.dish(id,size)||icon(id,size);};
})();
