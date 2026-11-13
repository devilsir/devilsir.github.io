/* Registered module: playable-art */
(function (initialize) {
  if (window.VoicesModules) window.VoicesModules.define("playable-art", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error('Module loader is missing');
  else initialize();
})(function () {
(function(){
'use strict';
const V=window.V,art=V.PlayableArtData,players=new Set([...V.PlayableCharacters,'campus-researcher']);
Object.assign(V.SpriteFrames.layouts,art.layouts);
const newPlayers=new Set(V.NewPlayableCharacters);
const actionRows={attack:5,cast:4,guard:4,heal:5,dance:5};
const movement=[0,1,0,2];
const turn=[0,2,3,1];
const drawAnimation=V.Animations.draw.bind(V.Animations);
V.Animations.draw=function(c,id,action,x,y,size=96,time=V.Engine.time,flip=false,fit=false,loop){
 if(!newPlayers.has(id)||!V.Assets.ready(V.Assets.images[id]))return drawAnimation(c,id,action,x,y,size,time,flip,fit,loop);
 const img=V.Assets.images[id],key='base-'+id;
 const reduced=V.settings.reducedMotion,tick=reduced?0:Math.floor(Math.max(0,time)*8);
 const world=V.Appearance.scope>0&&id===V.state?.character;
 const direction=world?(V.Player.data?.dir??0):flip?1:2;
 const front=world?direction:flip?1:0;
 const draw=(row,frame)=>V.SpriteFrames.draw(c,img,key,row,frame,x,y,size,false,fit);
 if(action==='walk'||action==='walkBack')return draw(action==='walkBack'?3:direction,movement[tick%4]);
 if(action==='spin')return draw(turn[tick%4],movement[Math.floor(tick/4)%4]);
 if(action==='idle'||action==='ready'){
  const breath=reduced||id==='luiza'?0:Math.sin(time*3)*.006;
  c.save();c.translate(x,y);c.scale(1,1+breath);c.translate(-x,-y);
  try{return draw(front,0);}finally{c.restore();}
 }
 if(Object.hasOwn(actionRows,action))return draw(actionRows[action],reduced?1:action==='dance'?tick%4:Math.min(tick,3));
 return drawAnimation(c,id,action,x,y,size,time,false,fit,loop)||draw(front,0);
};

// Original paths remain valid for saved profiles, the editor and extensions.
// Both original PNGs and their optimized counterparts contain the new artwork.
const resolve=V.ImageFormats.resolve.bind(V.ImageFormats);
V.ImageFormats.resolve=function(value){
 const result=resolve(value);let path;
 try{path=decodeURIComponent(new URL(String(value),document.baseURI).pathname);}catch{return result;}
 const character=path.match(/\/assets\/(?:optimized\/)?characters\/([a-z-]+?)(?:-portrait)?\.(?:png|webp)$/);
 const clip=path.match(/\/assets\/(?:optimized\/)?(?:city|homestead)\/([a-z]+)-(?:motion|actions|daily|music|percussion)\.(?:png|webp)$/);
 const id=character?.[1]||clip?.[1];
 const renewedNpc=V.NpcArt?.paths.has(path.slice(path.indexOf('/assets/')+1));
 if(!players.has(id)&&!renewedNpc)return result;
 const version=renewedNpc||id==='davia'?'20261113-elenco2':newPlayers.has(id)||id==='campus-researcher'?'20261113-elenco1':art.version;
 const url=new URL(result,document.baseURI);url.searchParams.set('v',version);return url.href;
};
// Smooth the illustrated players when scaled to the same height as Mateus.
// The mask keeps its own nearest-neighbor drawing for the requested pixel art.
for(const name of ['sprite','spritePart']){
 const draw=V.Assets[name].bind(V.Assets);V.Assets[name]=function(c,id,...args){if(!players.has(id)&&!V.NpcArt?.ids.has(id)&&V.Assets.characterCell(id)<96)return draw(c,id,...args);c.save();c.imageSmoothingEnabled=true;try{return draw(c,id,...args);}finally{c.restore();}};
}
const draw=V.SpriteFrames.draw.bind(V.SpriteFrames);V.SpriteFrames.draw=function(c,img,key,...args){if(!Object.hasOwn(art.layouts,key))return draw(c,img,key,...args);c.save();c.imageSmoothingEnabled=true;try{return draw(c,img,key,...args);}finally{c.restore();}};
})();

});
