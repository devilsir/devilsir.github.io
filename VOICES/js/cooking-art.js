(function(){
'use strict';
const V=window.V;
const A=V.CookingArt={images:{},names:['prep','batter','heat','extras','sweets','dishes','additional','world','cover'],
 load(){if(this.ready)return this.ready;this.ready=Promise.all(this.names.map(key=>new Promise(resolve=>{const image=V.Assets.image();this.images[key]=image;image.onload=image.onerror=resolve;image.src='assets/cooking/'+key+'.webp?v=20261101-cook1';V.AssetLoader.register(image,resolve);})));return this.ready;},
 ensure(world=false){return V.MapAssets.ensure([world?'cooking-world':'cooking'],'Preparando a cozinha');},
 frame(c,sheet,row,col,x,y,w,h){const im=this.images[sheet];if(!im?.naturalWidth)return false;const rows=sheet==='world'?2:sheet==='cover'?1:4,cols=sheet==='cover'?1:4,sw=im.naturalWidth/cols,sh=im.naturalHeight/rows;c.save();c.imageSmoothingEnabled=false;c.drawImage(im,col*sw,row*sh,sw,sh,Math.round(x),Math.round(y),Math.round(w),Math.round(h));c.restore();return true;},
 stage(c,s,progress,x,y,w,h){const art=s.art,frame=progress>=1?art.to:art.from+Math.floor((art.to-art.from)*V.clamp(progress,0,.999));this.frame(c,art.sheet,art.row,frame,x,y,w,h);},
 dish(id,size=48){const item=V.AdventureData.items[id];if(!item?.cookingItem)return null;const frame=item.cookingFrame??item.frame;return `<span class="cooking-dish-art adv-icon" aria-hidden="true" style="--dish-size:${size}px;--dish-x:${frame%4};--dish-y:${Math.floor(frame/4)};background-image:url('assets/cooking/dishes.webp?v=20261101-cook1')"></span>`;}
};
const group=V.AssetLoader.group.bind(V.AssetLoader);V.AssetLoader.group=function(key){if(key.startsWith('assets/cooking/'))return /\/world\./.test(key)?'cooking-world':'cooking';return group(key);};
const load=V.Assets.load.bind(V.Assets);V.Assets.load=async function(...args){await load(...args);await A.load();};
const icon=V.Progress.icon.bind(V.Progress);V.Progress.icon=function(id,size){return A.dish(id,size)||icon(id,size);};
})();
