'use strict';
const fs=require('fs'),path=require('path'),{createCanvas,loadImage}=require('../.qa/node_modules/@napi-rs/canvas');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'assets/words-respect');
(async()=>{
 const generation=JSON.parse(fs.readFileSync(path.join(dir,'generation.json'))),image=await loadImage(path.join(dir,'source.png')),cols=4,rows=2,cell=240;
 const original=createCanvas(image.width,image.height),c=original.getContext('2d');c.drawImage(image,0,0);const pixels=c.getImageData(0,0,image.width,image.height).data;
 const out=createCanvas(cols*cell,rows*cell),oc=out.getContext('2d'),frames=[];oc.imageSmoothingEnabled=false;
 for(let slot=0;slot<8;slot++){
  const ox=Math.round(slot%cols*image.width/cols),oy=Math.round(Math.floor(slot/cols)*image.height/rows),right=Math.round((slot%cols+1)*image.width/cols),bottom=Math.round((Math.floor(slot/cols)+1)*image.height/rows);
  let x0=right,y0=bottom,x1=ox,y1=oy;for(let y=oy;y<bottom;y++)for(let x=ox;x<right;x++)if(pixels[(y*image.width+x)*4+3]>180){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}
  if(x0>=x1)throw Error('Missing asset '+slot);if(x0<=ox||y0<=oy||x1>=right-1||y1>=bottom-1)throw Error('Asset touches cell border '+slot);
  x0=Math.max(ox,x0-2);y0=Math.max(oy,y0-2);x1=Math.min(right-1,x1+2);y1=Math.min(bottom-1,y1+2);
  const sw=x1-x0+1,sh=y1-y0+1,k=(cell-32)/Math.max(sw,sh),w=Math.round(sw*k),h=Math.round(sh*k),x=slot%4*cell+Math.round((cell-w)/2),y=Math.floor(slot/4)*cell+Math.round((cell-h)/2);
  oc.drawImage(image,x0,y0,sw,sh,x,y,w,h);frames.push({x,y,w,h});
 }
 const bytes=out.toBuffer('image/webp',94);fs.writeFileSync(path.join(dir,'courtyard.webp'),bytes);const meta={file:'assets/words-respect/courtyard.webp',cell,cols,rows,frames,bytes:bytes.length};
 fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify({...meta,generator:generation.generator},null,2));fs.writeFileSync(path.join(root,'js/words-respect-art.js'),'(function(){window.V.WordsRespectArt='+JSON.stringify(meta)+';})();\n');
 console.log(JSON.stringify({frames:frames.length,bytes:bytes.length}));
})().catch(e=>{console.error(e.stack);process.exit(1);});
