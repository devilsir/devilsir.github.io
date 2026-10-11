/* Developer-only authored map inventory and native Canvas visual audit. */
'use strict';
const fs=require('fs'),path=require('path');
const {V,click,native}=require('../tests/runtime-test.js');
async function run(){
 await V.Game.init();click('#new-game');V.$$('[data-grade]')[0].onclick();click('#creation-next');V.$('#creation-name').value='Revisão de cenários';click('#creation-begin');for(let i=0;i<3;i++)click('#intro-next');
 V.state.flags.prologueDone=true;V.state.flags.prologueStarted=true;V.state.unlocked=6;
 const output=path.resolve(__dirname,'../tests/map-audit');fs.mkdirSync(output,{recursive:true});
 const inventory=[],thumbs=[];
 for(const m of Object.values(V.World.maps)){
  V.World.load(m.id);V.World.transition=0;const sheet=native.createCanvas(m.width*48,m.height*48),sc=sheet.getContext('2d');
  for(let y=0;y<sheet.height;y+=540)for(let x=0;x<sheet.width;x+=960){V.World.camera={x,y};V.World.render(V.Engine.ctx);sc.drawImage(V.Engine.canvas._canvas,x,y);}
  fs.writeFileSync(path.join(output,m.id+'.png'),sheet.toBuffer('image/png'));thumbs.push({m,sheet});
  inventory.push({id:m.id,name:m.name,width:m.width,height:m.height,buildings:m.buildings,solids:m.solids,decor:m.decor,pond:m.pond,objects:m.objects.map(o=>({id:o.id,type:o.type,x:o.x/48-.5,y:o.y/48-.5,character:o.character,label:o.label,to:o.to,mission:o.mission}))});
 }
 const contact=native.createCanvas(4*384,Math.ceil(thumbs.length/4)*304),ctx=contact.getContext('2d');ctx.fillStyle='#182538';ctx.fillRect(0,0,contact.width,contact.height);ctx.imageSmoothingEnabled=false;
 thumbs.forEach(({m,sheet},i)=>{const x=i%4*384,y=Math.floor(i/4)*304;ctx.fillStyle='#f4ebd4';ctx.font='16px sans-serif';ctx.fillText(m.id+' · '+m.name.slice(0,32),x+8,y+20);ctx.drawImage(sheet,x+8,y+28,368,268);});
 fs.writeFileSync(path.join(output,'all-maps.png'),contact.toBuffer('image/png'));fs.writeFileSync(path.join(output,'inventory.json'),JSON.stringify(inventory,null,2));
 console.log(JSON.stringify(inventory.map(m=>({id:m.id,objects:m.objects.length,decor:m.decor.length,solids:m.solids.length,npcs:m.objects.filter(o=>['npc','resident','ambient'].includes(o.type)).map(o=>o.character)})),null,2));
}
run().catch(e=>{console.error(e.stack);process.exit(1);});
