(function(){
'use strict';const V=window.V;
V.SceneShadows={cache:new Map(),bytes:0,budget:32*1024*1024,identities:new WeakMap(),sources:new WeakMap(),serial:0,
 identity(image){if(!this.identities.has(image))this.identities.set(image,++this.serial);return this.identities.get(image);},
 discard(image){const id=this.identities.get(image);if(!id)return;const prefix=id+':';for(const[key,canvas]of this.cache)if(key.startsWith(prefix)){this.bytes-=canvas.width*canvas.height*4;this.cache.delete(key);}},
 mask(image,frame){
  if(!V.Assets.ready(image))return null;
  const width=image.naturalWidth||image.width,height=image.naturalHeight||image.height,f=frame||[0,0,width,height];
  if(f.length!==4||!f.every(Number.isFinite)||f[0]<0||f[1]<0||f[2]<=0||f[3]<=0||f[0]+f[2]>width+.01||f[1]+f[3]>height+.01)return null;
  // Mutable canvases must not retain a silhouette from an earlier frame.
  const cacheable=typeof image.naturalWidth==='number',key=this.identity(image)+':'+width+'x'+height+':'+f.join(':'),source=image.currentSrc||image.src||'';
  if(cacheable&&this.sources.get(image)!==source){this.discard(image);this.sources.set(image,source);V.ObjectiveGuide?._targetOutlines?.clear();}
  if(cacheable&&this.cache.has(key)){const hit=this.cache.get(key);this.cache.delete(key);this.cache.set(key,hit);return hit;}
  const canvas=document.createElement('canvas');canvas.width=Math.ceil(f[2]);canvas.height=Math.ceil(f[3]);const c=canvas.getContext('2d');
  c.drawImage(image,...f,0,0,canvas.width,canvas.height);c.globalCompositeOperation='source-in';c.fillStyle='#183c36';c.fillRect(0,0,canvas.width,canvas.height);c.globalCompositeOperation='source-over';
  if(cacheable){this.cache.set(key,canvas);this.bytes+=canvas.width*canvas.height*4;while(this.bytes>this.budget&&this.cache.size>1){const first=this.cache.keys().next().value,old=this.cache.get(first);this.bytes-=old.width*old.height*4;this.cache.delete(first);}}
  return canvas;
 },
 contact(c,x,y,w,h,alpha=.2){c.save();c.globalAlpha*=alpha;c.fillStyle='#13372f';c.beginPath();c.ellipse(Math.round(x),Math.round(y),w,h,0,0,Math.PI*2);c.fill();c.restore();},
 cast(c,image,x,y,w,h,options={}){const mask=this.mask(image,options.frame);if(!mask)return;const indoor=options.indoor??V.World.current?.design?.adventure?.environment?.indoor;c.save();c.globalAlpha*=options.alpha??(indoor?.16:.23);c.translate(Math.round(x),Math.round(y));c.transform(1,0,indoor?-.2:-.48,indoor?-.12:-.23,0,0);c.imageSmoothingEnabled=false;c.drawImage(mask,-w/2,-h,w,h);c.restore();if(options.contact!==false)this.contact(c,x,y+1,w*.32,Math.max(3,Math.min(12,w*.075)),indoor?.16:.22);},
 character(c,id,x,y,size=60,row=0,frame=0,indoor=false){const image=V.Assets.images[id];if(!V.Assets.ready(image))return;const cell=V.Assets.characterCell(id),r=V.clamp(Math.floor(row)||0,0,Math.floor((image.naturalHeight||image.height)/cell)-1),f=(((Math.floor(frame)||0)%4)+4)%4;this.cast(c,image,x,y+6,size,size,{frame:[f*cell,r*cell,cell,cell],indoor,alpha:indoor?.16:.22});}
};
})();
