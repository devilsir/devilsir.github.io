(function(){
'use strict';
const V=window.V,art=V.PlayableArtData,players=new Set(['nia','leo','taina','sol']);
Object.assign(V.SpriteFrames.layouts,art.layouts);
// Original paths remain valid for saved profiles, the editor and extensions.
// Both original PNGs and their optimized counterparts contain the new artwork.
const resolve=V.ImageFormats.resolve.bind(V.ImageFormats);
V.ImageFormats.resolve=function(value){
 const result=resolve(value);let path;
 try{path=decodeURIComponent(new URL(String(value),document.baseURI).pathname);}catch{return result;}
 if(!/\/assets\/(?:optimized\/)?(?:characters\/(?:nia|leo|taina|sol)(?:-portrait)?|city\/(?:nia|leo|taina|sol)-(?:motion|actions)|homestead\/(?:nia|leo|taina|sol)-(?:daily|music|percussion))\.(?:png|webp)$/.test(path))return result;
 const url=new URL(result,document.baseURI);url.searchParams.set('v',art.version);return url.href;
};
// Smooth the illustrated players when scaled to the same height as Mateus.
// The mask keeps its own nearest-neighbor drawing for the requested pixel art.
for(const name of ['sprite','spritePart']){
 const draw=V.Assets[name].bind(V.Assets);V.Assets[name]=function(c,id,...args){if(!players.has(id))return draw(c,id,...args);c.save();c.imageSmoothingEnabled=true;try{return draw(c,id,...args);}finally{c.restore();}};
}
const draw=V.SpriteFrames.draw.bind(V.SpriteFrames);V.SpriteFrames.draw=function(c,img,key,...args){if(!Object.hasOwn(art.layouts,key))return draw(c,img,key,...args);c.save();c.imageSmoothingEnabled=true;try{return draw(c,img,key,...args);}finally{c.restore();}};
})();
