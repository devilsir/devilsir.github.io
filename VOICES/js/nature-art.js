(function(){
'use strict';const V=window.V;
const A=V.NatureArt={images:{},names:['south-africa-a','south-africa-b','brazil-a','brazil-b','habitats','people','fruits','new-dishes','new-prep'],
 load(){if(this.ready)return this.ready;this.ready=Promise.all(this.names.map(key=>new Promise(resolve=>{const img=V.Assets.image();this.images[key]=img;img.onload=img.onerror=resolve;img.src='assets/nature/'+key+'.webp?v=20261102-nature1';V.AssetLoader.register(img,resolve);})));return this.ready;},
 cell(sheet,row=0,col=0){if(['south-africa','brazil'].includes(sheet)){sheet+='-'+(row<4?'a':'b');row%=4;}return{sheet,row,col,rows:sheet==='new-dishes'?2:4};},
 frame(c,sheet,row,col,x,y,w,h){const f=this.cell(sheet,row,col),img=this.images[f.sheet];if(!img?.naturalWidth)return false;const sw=img.naturalWidth/4,sh=img.naturalHeight/f.rows;c.save();c.imageSmoothingEnabled=false;c.drawImage(img,f.col*sw,f.row*sh,sw,sh,Math.round(x),Math.round(y),Math.round(w),Math.round(h));c.restore();return true;},
 icon(sheet,row,col,size=72){const f=this.cell(sheet,row,col);return `<span class="nature-art" aria-hidden="true" style="width:${size}px;height:${size}px;background-image:url('assets/nature/${f.sheet}.webp?v=20261102-nature1');background-size:400% ${f.rows*100}%;background-position:${f.col*100/3}% ${f.row*100/(f.rows-1)}%"></span>`;},
 ensure(group='world'){return V.MapAssets.ensure([group==='food'?'nature-food':'nature'],'Preparando os novos cenários');}
};
const group=V.AssetLoader.group.bind(V.AssetLoader);V.AssetLoader.group=function(key){if(key.startsWith('assets/nature/'))return /\/(?:fruits|new-dishes|new-prep)\./.test(key)?'nature-food':'nature';return group(key);};
const load=V.Assets.load.bind(V.Assets);V.Assets.load=async function(...args){await Promise.all([load(...args),A.load()]);};
})();
