'use strict';
const fs=require('fs'),path=require('path'),{createCanvas,loadImage}=require('../.qa/node_modules/@napi-rs/canvas');
const root=path.resolve(__dirname,'..'),meta=require('../assets/cooking/generation-interiors.json');
// Reuse the production silhouette packer; originals stay in generated_images.
const source=fs.readFileSync(path.join(__dirname,'prepare-nature-assets.cjs'),'utf8');
const pack=new Function('createCanvas',source.slice(source.indexOf('function pack('),source.indexOf('(async()=>'))+';return pack;')(createCanvas);
(async()=>{const sheets=[],contact=createCanvas(960,960),c=contact.getContext('2d');c.fillStyle='#385c48';c.fillRect(0,0,960,960);let index=0;
 for(const[key,file]of Object.entries(meta.sources)){const image=await loadImage(file),canvas=pack(image,4,160,false),bytes=canvas.toBuffer('image/webp',94),dest='assets/cooking/'+key+'.webp';fs.writeFileSync(path.join(root,dest),bytes);sheets.push({key,file:dest,cols:4,rows:4,cell:160,bytes:bytes.length});c.drawImage(canvas,index*480,0,480,480);c.font='20px sans-serif';c.fillStyle='#f5dfac';c.fillText(key,index*480+12,520);index++;}
 fs.writeFileSync(path.join(root,'assets/cooking/manifest-interiors.json'),JSON.stringify({generator:meta.generator,packing:'Isolated transparent silhouettes in 160px cells; original alpha and source files preserved.',sheets},null,2));fs.writeFileSync(path.join(root,'.qa/review/culinary-interiors-atlas.png'),contact.toBuffer('image/png'));console.log(JSON.stringify(sheets));
})().catch(e=>{console.error(e.stack);process.exit(1);});
