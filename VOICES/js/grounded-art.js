(function(){
'use strict';const V=window.V,D=V.GroundedArtData;
const G=V.GroundedArt={
metadata:new WeakMap(),
meta(img){if(!img)return null;const src=img.src,cached=this.metadata.get(img);if(cached?.src===src)return cached.meta;let meta=null;try{const path=decodeURIComponent(new URL(src,document.baseURI).pathname);const key=path.slice(path.indexOf('/assets/')+1);meta=D.images[V.ImageFormats?.canonical(key)||key]||null;}catch{}this.metadata.set(img,{src,meta});return meta;},
geometry(img,x,y,w,h){const meta=this.meta(img);if(!meta)return{source:[0,0,img?.naturalWidth||1,img?.naturalHeight||1],x,y,w,h};const[l,t,r,b]=meta.bounds,sx=w/meta.size[0],sy=h/meta.size[1],vw=(r-l)*sx,vh=(b-t)*sy;return{source:[l,t,r-l,b-t],x:x+(w-vw)/2,y:y+h-vh,w:vw,h:vh};},
draw(c,img,x,y,w,h){if(!img)return;const f=this.geometry(img,x,y,w,h);c.drawImage(img,...f.source,Math.round(f.x),Math.round(f.y),f.w,f.h);},
fit(c,img,x,y,size,shadow=false){if(!img)return;const ratio=img.naturalWidth/img.naturalHeight,w=size*Math.min(1,ratio),h=size*Math.min(1,1/ratio);if(shadow)this.shadow(c,img,x+size/2,y+size,w,h,{alpha:.17});this.draw(c,img,x+(size-w)/2,y+size-h,w,h);},
shadow(c,img,x,y,w,h,options={}){if(!img)return;const f=this.geometry(img,x-w/2,y-h,w,h);V.SceneShadows.cast(c,img,x,y,f.w,f.h,{...options,frame:f.source});},
iris(c,img,x,y,row,frame,shadow=false){if(!img)return;const b=D.iris[row*4+frame],w=b[2]-b[0],h=b[3]-b[1],source=[frame*64+b[0],row*64+b[1],w,h];if(shadow)V.SceneShadows.cast(c,img,x-32+(b[0]+b[2])/2,y,w,h,{frame:source,indoor:true,alpha:.14});else c.drawImage(img,...source,Math.round(x-32+b[0]),Math.round(y-h),w,h);}
};
})();
