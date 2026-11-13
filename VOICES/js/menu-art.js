/* Registered module: menu-art */
(function (initialize) {
  if (window.VoicesModules) window.VoicesModules.define("menu-art", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error('Module loader is missing');
  else initialize();
})(function () {
(function(){
'use strict';const V=window.V;
const M=V.MenuArt={image:null,props:null,
 load(){return Promise.all([['image','assets/ui/menu/world-journey.webp'],['props','assets/tilesets/cozy-props-polished.webp']].map(([key,path])=>new Promise(resolve=>{const im=V.Assets.image();this[key]=im;im.onload=im.onerror=resolve;im.src=path+'?v=20261102-living3';V.AssetLoader.register(im,resolve); })));},
 decorate(){const title=V.$('#title-screen');if(title.dataset.menuArt)return;title.dataset.menuArt='true';V.$('.title-copy h1')?.insertAdjacentHTML('beforebegin','<img class="title-emblem" src="assets/ui/menu/journey-emblem.svg" width="64" height="64" alt="" aria-hidden="true">');const tags=V.$('.title-discover'),links=V.$('.title-links');if(tags&&links)links.before(tags);V.$('.title-art')?.setAttribute('aria-hidden','true');V.$('.title-footer')?.insertAdjacentHTML('beforebegin','<div class="title-landscape-caption" aria-hidden="true"><span>UM MUNDO PARA DESCOBRIR</span><strong>Da cidade às trilhas.<br>Histórias em cada encontro.</strong></div>');for(const[id,icon]of [['teacher-button','teacher'],['settings-button','settings'],['credits-button','book']]){const button=V.$('#'+id);if(button&&!button.querySelector('img')){button.textContent=button.textContent.replace('✎ ','');button.insertAdjacentHTML('afterbegin',V.Interface.icon(icon));}}}
};
M.decorate();
const load=V.Assets.load.bind(V.Assets);V.Assets.load=async function(...args){await Promise.all([load(...args),M.load()]);};
const prop=V.Cozy.prop.bind(V.Cozy);V.Cozy.prop=function(c,family,index,x,y,size=48){if(family==='cozy'&&M.props?.naturalWidth){const im=M.props,cell=im.naturalWidth/8,sx=index%8*cell,sy=Math.floor(index/8)*cell;V.SceneShadows.cast(c,im,x+size/2,y+size*.9,size,size,{frame:[sx,sy,cell,cell],alpha:.13});c.save();c.imageSmoothingEnabled=true;c.drawImage(im,sx,sy,cell,cell,Math.round(x),Math.round(y),size,size);c.restore();return;}return prop(c,family,index,x,y,size);};
// Keep original IDs and collision footprints; editor thumbnails use the HD crop.
for(const a of V.sceneAssets||[]){if(a.path==='assets/tilesets/cozy-props.png'){a.path='assets/tilesets/cozy-props-polished.webp';a.width=1024;a.height=768;a.frameWidth=128;a.frameHeight=128;}}
})();

});
