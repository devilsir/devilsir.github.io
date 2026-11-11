'use strict';
const fs=require('fs'),path=require('path'),{createCanvas,loadImage}=require('@napi-rs/canvas');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'assets/marine-life'),meta=require('../assets/marine-life/generation.json');
const source=fs.readFileSync(path.join(__dirname,'prepare-nature-assets.cjs'),'utf8');
const pack=new Function('createCanvas',source.slice(source.indexOf('function pack('),source.indexOf('(async()=>'))+';return pack;')(createCanvas);
(async()=>{
 const sheets=[],contact=createCanvas(1000,460),c=contact.getContext('2d');c.fillStyle='#326f79';c.fillRect(0,0,1000,460);
 for(const [i,[id,file]] of Object.entries(meta.sources).entries()){
  const image=await loadImage(file),probe=createCanvas(image.width,image.height),p=probe.getContext('2d');p.drawImage(image,0,0);
  const rgba=p.getImageData(0,0,image.width,image.height).data;let transparent=0;for(let n=3;n<rgba.length;n+=4)if(rgba[n]<8)transparent++;
  if(transparent<image.width*image.height*.15)throw Error(id+': transparency missing');
  fs.copyFileSync(file,path.join(dir,'source',id+'.png'));
  const cell=id==='marine-fish'?96:160,canvas=pack(image,4,cell,true),pixels=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data,frames=[];
  for(let row=0;row<4;row++)for(let col=0;col<4;col++){
   let minX=cell,minY=cell,maxX=0,maxY=0;
   for(let y=0;y<cell;y++)for(let x=0;x<cell;x++)if(pixels[((row*cell+y)*canvas.width+col*cell+x)*4+3]>128){minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);}
   frames.push({x:col*cell+minX,y:row*cell+minY,w:maxX-minX+1,h:maxY-minY+1});
  }
  const bytes=canvas.toBuffer('image/webp',96);fs.writeFileSync(path.join(dir,id+'.webp'),bytes);
  sheets.push({id,file:'assets/marine-life/'+id+'.webp',cell,cols:4,rows:4,bytes:bytes.length,frames});
  c.drawImage(canvas,i*330+8,12,320,390);c.fillStyle='#f7e5bb';c.font='16px sans-serif';c.fillText(id,i*330+16,430);
 }
 fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify({generator:meta.generator,packing:'Complete connected silhouettes; shared scale and baseline per animation row; nearest-neighbour resizing; alpha retained.',sheets},null,2));
 fs.writeFileSync(path.join(root,'js/marine-art-data.js'),'(function(){window.V.MarineArtData='+JSON.stringify(Object.fromEntries(sheets.map(s=>[s.id,s])))+';})();\n');
 fs.mkdirSync(path.join(root,'.qa/review'),{recursive:true});fs.writeFileSync(path.join(root,'.qa/review/marine-atlases.png'),contact.toBuffer('image/png'));
 console.log(JSON.stringify(sheets.map(({id,bytes,cell})=>({id,bytes,cell}))));
})().catch(e=>{console.error(e.stack);process.exit(1);});
