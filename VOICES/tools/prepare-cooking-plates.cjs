'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{environment}=require('./runtime-upgrade-test.cjs');
const root=path.resolve(__dirname,'..');
(async()=>{const{V,w,dom,canvases}=await environment();await V.Game.init();await V.CookingArt.ensure();await V.MapAssets.whenReady();const canvas=w.document.createElement('canvas');canvas.width=768;canvas.height=768;const c=canvas.getContext('2d');V.CookingData.recipes.forEach((recipe,index)=>{assert(V.CookingWorkshopData.plans[recipe.id],recipe.id);const r={data:{stage:index,phase:'done',placed:[],platingMotion:[]}};V.CookingWorkshop.plate(c,r,index%4*192+96,Math.floor(index/4)*128+64,.5,true);});
 const pixels=c.getImageData(0,0,768,768).data;for(let slot=0;slot<V.CookingData.recipes.length;slot++){const ox=slot%4*192,oy=Math.floor(slot/4)*128;for(let y=0;y<128;y++)for(let x=0;x<192;x++)if(x<3||x>=189||y<3||y>=125)assert.equal(pixels[((oy+y)*768+ox+x)*4+3],0,'plate margin '+slot);}
 const bytes=canvases.get(canvas).canvas.toBuffer('image/webp',97);fs.writeFileSync(path.join(root,'assets/cooking/workshop/finished-plates.webp'),bytes);console.log(JSON.stringify({recipes:V.CookingData.recipes.length,bytes:bytes.length}));V.MapAssets.cancel();dom.window.close();process.exit(0);
})().catch(e=>{console.error(e.stack);process.exit(1);});
