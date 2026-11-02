'use strict';
// Production atlas packing. Artwork is generated with image_gen; originals are preserved.
const fs=require('fs'),path=require('path');
const {createCanvas,loadImage}=require('../.qa/node_modules/@napi-rs/canvas');
const dir=path.resolve(__dirname,'../assets/cooking'),meta=require('../assets/cooking/generation.json');
function packWorld(img){
 const src=createCanvas(img.width,img.height),sc=src.getContext('2d');sc.drawImage(img,0,0);const rgba=sc.getImageData(0,0,img.width,img.height).data,labels=new Int32Array(img.width*img.height),queue=new Int32Array(labels.length),parts=[];let serial=0;
 for(let start=0;start<labels.length;start++){if(labels[start]||rgba[start*4+3]<30)continue;const id=++serial;let head=0,tail=1,minX=img.width,minY=img.height,maxX=0,maxY=0,sumX=0,sumY=0;queue[0]=start;labels[start]=id;while(head<tail){const at=queue[head++],x=at%img.width,y=Math.floor(at/img.width);minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);sumX+=x;sumY+=y;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const nx=x+dx,ny=y+dy;if(nx<0||nx>=img.width||ny<0||ny>=img.height)continue;const n=ny*img.width+nx;if(!labels[n]&&rgba[n*4+3]>=30){labels[n]=id;queue[tail++]=n;}}}parts.push({id,area:tail,minX,minY,maxX,maxY,x:sumX/tail,y:sumY/tail});}
 const frames=Array.from({length:8},(_,i)=>parts.filter(p=>Math.floor(p.x/img.width*4)===i%4&&Math.floor(p.y/img.height*2)===Math.floor(i/4)).sort((a,b)=>b.area-a.area)[0]);if(frames.some(f=>!f))throw Error('Missing world sprite');
 const out=createCanvas(1024,512),c=out.getContext('2d');c.imageSmoothingEnabled=false;const fountainSize=Math.max(...frames.slice(4).map(f=>Math.max(f.maxX-f.minX+1,f.maxY-f.minY+1)));
 for(let i=0;i<8;i++){const f=frames[i],w=f.maxX-f.minX+1,h=f.maxY-f.minY+1,crop=createCanvas(w,h),ctx=crop.getContext('2d'),pixels=ctx.createImageData(w,h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const from=(f.minY+y)*img.width+f.minX+x;if(labels[from]!==f.id)continue;for(let k=0;k<4;k++)pixels.data[(y*w+x)*4+k]=rgba[from*4+k];}ctx.putImageData(pixels,0,0);const scale=240/(i>=4?fountainSize:Math.max(w,h)),dw=Math.round(w*scale),dh=Math.round(h*scale);c.drawImage(crop,i%4*256+Math.round((256-dw)/2),Math.floor(i/4)*256+248-dh,dw,dh);}
 return out;
}
(async()=>{
 const sheets=[];let index=0;const contact=createCanvas(1200,1200),cc=contact.getContext('2d');cc.fillStyle='#31544a';cc.fillRect(0,0,1200,1200);
 for(const [key,file] of Object.entries(meta.sources)){
  const img=await loadImage(file),cols=key==='cover'?1:4,rows=key==='cover'?1:key==='world'?2:4;
  const width=key==='cover'?960:key==='world'?1024:768,height=key==='cover'?540:key==='world'?512:576;
  const canvas=key==='world'?packWorld(img):createCanvas(width,height),c=canvas.getContext('2d');if(key!=='world'){c.imageSmoothingEnabled=false;c.drawImage(img,0,0,width,height);}
  const bytes=canvas.toBuffer('image/webp',93);fs.writeFileSync(path.join(dir,key+'.webp'),bytes);
  sheets.push({key,file:'assets/cooking/'+key+'.webp',cols,rows,width,height,bytes:bytes.length});
  cc.drawImage(canvas,(index%3)*400,Math.floor(index/3)*400,400,300);cc.font='20px sans-serif';cc.fillStyle='#ffeac0';cc.fillText(key,(index%3)*400+12,Math.floor(index/3)*400+330);index++;
 }
 fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify({generator:meta.generator,packing:'Nearest-neighbour packing; world silhouettes isolated to prevent adjacent facade bleed. Fountain frames share a fixed scale and baseline. Alpha preserved.',sheets},null,2));
 fs.mkdirSync(path.resolve(__dirname,'../.qa/review'),{recursive:true});fs.writeFileSync(path.resolve(__dirname,'../.qa/review/cooking-sheets.png'),contact.toBuffer('image/png'));
 console.log(sheets);
})().catch(e=>{console.error(e);process.exit(1);});
