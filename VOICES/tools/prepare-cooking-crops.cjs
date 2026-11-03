'use strict';
// Prepare silhouette bounds and removal rectangles from the original atlases.
// All pixel inspection stays in this build tool: local file:// canvases can be
// drawn and cleared in the browser, but their pixels cannot safely be read.
const fs=require('fs'),path=require('path');
const {createCanvas,loadImage}=require('../.qa/node_modules/@napi-rs/canvas');
const root=path.resolve(__dirname,'..');
function removalRectangles(pixels,stride,box,seeds){
 const[x,y,w,h]=box,alpha=new Uint8Array(w*h),mask=new Uint8Array(w*h),queue=new Int32Array(w*h);let head=0,tail=0;
 for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++)alpha[yy*w+xx]=pixels[((y+yy)*stride+x+xx)*4+3];
 for(const[sx,sy]of seeds){const at=sy*w+sx;if(at>=0&&at<mask.length&&!mask[at]){mask[at]=1;queue[tail++]=at;}}
 while(head<tail){const at=queue[head++],px=at%w,py=Math.floor(at/w);for(let yy=Math.max(0,py-1);yy<=Math.min(h-1,py+1);yy++)for(let xx=Math.max(0,px-1);xx<=Math.min(w-1,px+1);xx++){const n=yy*w+xx;if(!mask[n]&&alpha[n]>=64){mask[n]=1;queue[tail++]=n;}}}
 const keep=mask.slice();for(let at=0;at<mask.length;at++){if(mask[at]||!alpha[at])continue;const px=at%w,py=Math.floor(at/w);for(let yy=Math.max(0,py-1);yy<=Math.min(h-1,py+1)&&!keep[at];yy++)for(let xx=Math.max(0,px-1);xx<=Math.min(w-1,px+1);xx++)if(mask[yy*w+xx]){keep[at]=1;break;}}
 const rectangles=[];let active=new Map();
 for(let yy=0;yy<h;yy++){
  const next=new Map();let xx=0;
  while(xx<w){if(keep[yy*w+xx]||!alpha[yy*w+xx]){xx++;continue;}const left=xx;while(xx<w&&!keep[yy*w+xx]&&alpha[yy*w+xx])xx++;
   const width=xx-left,key=left+':'+width;let rectangle=active.get(key);if(rectangle)rectangle[3]++;else{rectangle=[left,yy,width,1];rectangles.push(rectangle);}next.set(key,rectangle);
  }
  active=next;
 }
 return rectangles;
}
async function describe(file,rows=4){
 const im=await loadImage(path.join(root,file)),canvas=createCanvas(im.width,im.height),c=canvas.getContext('2d');c.drawImage(im,0,0);
 const pixels=c.getImageData(0,0,im.width,im.height).data,labels=new Uint8Array(im.width*im.height),queue=new Int32Array(labels.length),groups=Array.from({length:rows*4},()=>[]);
 for(let start=0;start<labels.length;start++){
  if(labels[start]||pixels[start*4+3]<64)continue;
  let head=0,tail=1,minX=im.width,minY=im.height,maxX=0,maxY=0,sumX=0,sumY=0;queue[0]=start;labels[start]=1;
  while(head<tail){const at=queue[head++],x=at%im.width,y=Math.floor(at/im.width);minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);sumX+=x;sumY+=y;
   for(let yy=Math.max(0,y-1);yy<=Math.min(im.height-1,y+1);yy++)for(let xx=Math.max(0,x-1);xx<=Math.min(im.width-1,x+1);xx++){const n=yy*im.width+xx;if(!labels[n]&&pixels[n*4+3]>=64){labels[n]=1;queue[tail++]=n;}}
  }
  if(maxY-minY>im.height/rows*1.45||maxX-minX>im.width/4*1.45){
   // A few old steam plumes touch the pan above. Keep those connected
   // silhouettes in their own authored cells instead of joining two dishes.
   const pieces=new Map();for(let i=0;i<tail;i++){const x=queue[i]%im.width,y=Math.floor(queue[i]/im.width),slot=Math.floor(y/im.height*rows)*4+Math.floor(x/im.width*4);let p=pieces.get(slot);if(!p){p={area:0,minX:x,minY:y,maxX:x,maxY:y,seed:[x,y],cellBound:true};pieces.set(slot,p);}p.area++;p.minX=Math.min(p.minX,x);p.maxX=Math.max(p.maxX,x);p.minY=Math.min(p.minY,y);p.maxY=Math.max(p.maxY,y);}for(const[slot,p]of pieces)groups[slot].push(p);
  }else{const col=Math.min(3,Math.floor(sumX/tail/im.width*4)),row=Math.min(rows-1,Math.floor(sumY/tail/im.height*rows));groups[row*4+col].push({area:tail,minX,minY,maxX,maxY,seed:[start%im.width,Math.floor(start/im.width)]});}
 }
 return{width:im.width,height:im.height,cols:4,rows,frames:groups.map((parts,i)=>{
  const largest=Math.max(...parts.map(p=>p.area)),chosen=parts.filter(p=>p.area>=Math.max(8,largest*.0015));if(!chosen.length)throw Error(file+' missing frame '+i);
  const bound=chosen.some(p=>p.cellBound),x=Math.max(bound?i%4*im.width/4:0,Math.min(...chosen.map(p=>p.minX))-2),y=Math.max(bound?Math.floor(i/4)*im.height/rows:0,Math.min(...chosen.map(p=>p.minY))-2),right=Math.min(bound?(i%4+1)*im.width/4:im.width,Math.max(...chosen.map(p=>p.maxX))+3),bottom=Math.min(bound?(Math.floor(i/4)+1)*im.height/rows:im.height,Math.max(...chosen.map(p=>p.maxY))+3);
  const box=[x,y,right-x,bottom-y],seeds=chosen.map(p=>[p.seed[0]-x,p.seed[1]-y]);
  const rectangles=removalRectangles(pixels,im.width,box,seeds);
  // Current food crops fit byte-sized coordinates. Packing the rectangles
  // avoids transferring a much larger JSON list; larger future crops retain
  // the plain coordinate format so the generator does not truncate values.
  const clear=rectangles.every(r=>r.every(value=>Number.isInteger(value)&&value>=0&&value<256))?Buffer.from(rectangles.flat()).toString('base64'):rectangles;
  return{box,seeds,clear};
 })};
}
(async()=>{const sheets={};for(const key of ['prep','batter','heat','extras','sweets','dishes','additional'])sheets[key]=await describe('assets/cooking/'+key+'.webp');for(const key of ['new-prep','new-dishes','fruits'])sheets[key]=await describe('assets/nature/'+key+'.webp',key==='new-dishes'?2:4);
 const output="// Generated by tools/prepare-cooking-crops.cjs; clipping is prepared offline, without browser pixel readback.\nwindow.V.CookingCrops="+JSON.stringify(sheets)+";\n";
 fs.writeFileSync(path.join(root,'js/cooking-crops.js'),output);
 console.log(JSON.stringify({frames:Object.values(sheets).reduce((n,s)=>n+s.frames.length,0),removalRectangles:Object.values(sheets).reduce((n,s)=>n+s.frames.reduce((sum,f)=>sum+(typeof f.clear==='string'?Buffer.from(f.clear,'base64').length/4:f.clear.length),0),0),bytes:Buffer.byteLength(output)}));
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
