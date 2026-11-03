'use strict';
const fs=require('fs'),path=require('path'),{createCanvas,loadImage}=require('../.qa/node_modules/@napi-rs/canvas');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'assets/cooking/workshop'),meta=require('../assets/cooking/workshop/generation.json');
(async()=>{const sheets={},contact=createCanvas(1080,1660),cc=contact.getContext('2d');cc.fillStyle='#31534a';cc.fillRect(0,0,1080,1660);let serial=0;
 for(const[id,file]of Object.entries(meta.sources)){
  const image=await loadImage(file),src=createCanvas(image.width,image.height),c=src.getContext('2d');c.drawImage(image,0,0);const pixels=c.getImageData(0,0,src.width,src.height).data,cell=192,bounds=[];
  const rows=id==='empty-cookware'?1:4,labels=new Int32Array(src.width*src.height),queue=new Int32Array(labels.length),parts=[];let serialPart=0;
  for(let start=0;start<labels.length;start++){if(labels[start]||pixels[start*4+3]<128)continue;const label=++serialPart;let head=0,tail=1,minX=src.width,minY=src.height,maxX=0,maxY=0,sx=0,sy=0;queue[0]=start;labels[start]=label;
   while(head<tail){const at=queue[head++],x=at%src.width,y=Math.floor(at/src.width);sx+=x;sy+=y;minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);for(let yy=Math.max(0,y-1);yy<=Math.min(src.height-1,y+1);yy++)for(let xx=Math.max(0,x-1);xx<=Math.min(src.width-1,x+1);xx++){const n=yy*src.width+xx;if(!labels[n]&&pixels[n*4+3]>=128){labels[n]=label;queue[tail++]=n;}}}
   parts.push({label,area:tail,minX,minY,maxX,maxY,cx:sx/tail,cy:sy/tail});
  }
  for(let slot=0;slot<4*rows;slot++){const all=parts.filter(p=>Math.floor(p.cx/src.width*4)===slot%4&&Math.floor(p.cy/src.height*rows)===Math.floor(slot/4)),largest=Math.max(...all.map(p=>p.area)),chosen=all.filter(p=>p.area>=Math.max(12,largest*.001));if(!chosen.length)throw Error(id+' missing silhouette '+slot);const minX=Math.min(...chosen.map(p=>p.minX)),minY=Math.min(...chosen.map(p=>p.minY)),maxX=Math.max(...chosen.map(p=>p.maxX)),maxY=Math.max(...chosen.map(p=>p.maxY));if(minX<2||minY<2||maxX>=src.width-2||maxY>=src.height-2)throw Error(id+' complete silhouette touches image edge '+slot);bounds.push({x:minX-2,y:minY-2,w:maxX-minX+5,h:maxY-minY+5,labels:new Set(chosen.map(p=>p.label))});}
  const out=createCanvas(cell*4,cell*rows),oc=out.getContext('2d');oc.imageSmoothingEnabled=false;const frames=[];
  for(let slot=0;slot<bounds.length;slot++){const b=bounds[slot],same=id==='complete-cookware'?bounds.slice(Math.floor(slot/4)*4,Math.floor(slot/4)*4+4):[b],max=Math.max(...same.map(b=>Math.max(b.w,b.h))),scale=(cell-30)/max,w=Math.round(b.w*scale),h=Math.round(b.h*scale),x=slot%4*cell+Math.round((cell-w)/2),y=Math.floor(slot/4)*cell+Math.round((cell-h)/2),cut=createCanvas(b.w,b.h),cx=cut.getContext('2d'),rgba=cx.createImageData(b.w,b.h);
   for(let yy=0;yy<b.h;yy++)for(let xx=0;xx<b.w;xx++){const sx=b.x+xx,sy=b.y+yy,at=sy*src.width+sx;let keep=b.labels.has(labels[at]);if(!keep&&pixels[at*4+3]>0)for(let dy=-1;dy<=1&&!keep;dy++)for(let dx=-1;dx<=1;dx++)if(b.labels.has(labels[(sy+dy)*src.width+sx+dx])){keep=true;break;}if(keep)for(let k=0;k<4;k++)rgba.data[(yy*b.w+xx)*4+k]=pixels[at*4+k];}
   cx.putImageData(rgba,0,0);oc.drawImage(cut,x,y,w,h);frames.push({x,y,w,h});}
  const bytes=out.toBuffer('image/webp',97);fs.writeFileSync(path.join(dir,id+'.webp'),bytes);fs.copyFileSync(file,path.join(dir,'source',id+'.png'));sheets[id]={file:'assets/cooking/workshop/'+id+'.webp',cell,cols:4,rows,frames,bytes:bytes.length};
  cc.drawImage(out,serial%2*540+12,Math.floor(serial/2)*550+12,516,rows===1?129:516);cc.fillStyle='#f7e7bb';cc.font='18px sans-serif';cc.fillText(id,serial%2*540+20,Math.floor(serial/2)*550+545);serial++;
 }
 fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify({generator:meta.generator,packing:'Complete cells, including disconnected food pieces; generous transparent margins; no browser pixel reads; compressed WebP.',sheets},null,2));
 fs.writeFileSync(path.join(root,'js/cooking-workshop-art-data.js'),'(function(){window.V.CookingWorkshopArtData='+JSON.stringify(sheets)+';})();\n');fs.writeFileSync(path.join(root,'.qa/review/cooking-workshop-atlases.png'),contact.toBuffer('image/png'));console.log(JSON.stringify(Object.fromEntries(Object.entries(sheets).map(([id,s])=>[id,s.bytes]))));
})().catch(e=>{console.error(e.stack);process.exit(1);});
