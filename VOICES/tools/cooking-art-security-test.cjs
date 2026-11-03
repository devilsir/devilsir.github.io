'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {environment}=require('./runtime-upgrade-test.cjs');
// Reference the original pixel isolation to check that precomputed clipping
// still keeps exactly the same food pixels and transparent fringes.
function reference(w,image,entry){
 const[x,y,width,height]=entry.box,canvas=w.document.createElement('canvas');canvas.width=width;canvas.height=height;
 const c=canvas.getContext('2d');c.drawImage(image,x,y,width,height,0,0,width,height);
 const rgba=c.getImageData(0,0,width,height),mask=new Uint8Array(width*height),queue=new Int32Array(mask.length);let head=0,tail=0;
 for(const[sx,sy]of entry.seeds){const at=sy*width+sx;if(at>=0&&at<mask.length&&!mask[at]){mask[at]=1;queue[tail++]=at;}}
 while(head<tail){const at=queue[head++],px=at%width,py=Math.floor(at/width);for(let yy=Math.max(0,py-1);yy<=Math.min(height-1,py+1);yy++)for(let xx=Math.max(0,px-1);xx<=Math.min(width-1,px+1);xx++){const n=yy*width+xx;if(!mask[n]&&rgba.data[n*4+3]>=64){mask[n]=1;queue[tail++]=n;}}}
 const keep=mask.slice();for(let at=0;at<mask.length;at++){if(mask[at]||!rgba.data[at*4+3])continue;const px=at%width,py=Math.floor(at/width);for(let yy=Math.max(0,py-1);yy<=Math.min(height-1,py+1)&&!keep[at];yy++)for(let xx=Math.max(0,px-1);xx<=Math.min(width-1,px+1);xx++)if(mask[yy*width+xx]){keep[at]=1;break;}}
 for(let at=0;at<keep.length;at++)if(!keep[at])rgba.data[at*4+3]=0;
 return rgba;
}
(async()=>{
 const{V,w,dom}=await environment();let failures=0;
 const check=async(name,fn)=>{try{await fn();console.log('PASS',name);}catch(e){failures++;console.error('FAIL',name,e.stack);}};
 try{
  await V.Game.init();await V.CookingArt.ensure();await V.NatureArt.ensure('food');await V.MapAssets.whenReady();
  const A=V.CookingArt,frames=Object.entries(V.CookingCrops).flatMap(([sheet,meta])=>meta.frames.map((entry,slot)=>({sheet,meta,entry,slot}))),get=w.HTMLCanvasElement.prototype.getContext;
  await check('tainted-canvas security cannot interrupt any cooking or nature-food frame',()=>{
   let reads=0;A.crops=new WeakMap();
   w.HTMLCanvasElement.prototype.getContext=function(...args){const c=get.apply(this,args);return new Proxy(c,{get(target,key){if(key==='getImageData'||key==='putImageData')return()=>{reads++;throw new w.DOMException('The canvas has been tainted by cross-origin data.','SecurityError');};const value=Reflect.get(target,key);return typeof value==='function'?value.bind(target):value;},set(target,key,value){target[key]=value;return true;}});};
   try{
    const canvas=w.document.createElement('canvas');canvas.width=360;canvas.height=240;const c=canvas.getContext('2d');
    for(const{sheet,slot}of frames)assert(A.frame(c,sheet,Math.floor(slot/4),slot%4,0,0,320,200),sheet+': '+slot);
    assert(A.frame(c,'cover',0,0,0,0,320,200));assert.equal(reads,0,'runtime rendering must not read image pixels');
   }finally{w.HTMLCanvasElement.prototype.getContext=get;}
  });
  await check('all prepared crops retain the original visible pixels and alpha at native size',()=>{
   A.crops=new WeakMap();let excluded=0;
   for(const{sheet,entry,slot}of frames){
    const image=A.images[sheet]||V.NatureArt.images[sheet],expected=reference(w,image,entry),canvas=A.crop(sheet,Math.floor(slot/4),slot%4);
    assert(canvas,sheet+': '+slot);assert.equal(canvas.width,entry.box[2]);assert.equal(canvas.height,entry.box[3]);
    const actual=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height);
    for(let at=0;at<actual.data.length;at+=4){assert.equal(actual.data[at+3],expected.data[at+3],sheet+': '+slot+' alpha at '+at);if(expected.data[at+3])for(let k=0;k<3;k++)assert.equal(actual.data[at+k],expected.data[at+k],sheet+': '+slot+' colour at '+at);}
    excluded+=entry.clear.length;assert.equal(A.crop(sheet,Math.floor(slot/4),slot%4),canvas,'prepared crop should be reused');
   }
   assert(frames.length>=150);assert(excluded>0,'neighbouring sprites must still be removed');
   console.log('Verified',frames.length,'complete food frames.');
  });
  await check('cooking rendering has no runtime pixel-readback dependency or extra image downloads',()=>{
   const source=fs.readFileSync(path.join(__dirname,'../js/cooking-art.js'),'utf8');assert(!/\.(?:getImageData|putImageData)\s*\(/.test(source));
   assert.equal(A.names.length,9);assert(fs.statSync(path.join(__dirname,'../js/cooking-crops.js')).size<130000);
  });
 }finally{V.MapAssets.cancel();dom.window.close();}
 process.exit(failures?1:0);
})().catch(e=>{console.error(e.stack);process.exit(1);});
