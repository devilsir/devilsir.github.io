(() => {
'use strict';
const waterTypes={
 water:['Água corrente','#428e9b'],water_fresh:['Rio cristalino','#478fa7'],
 water_deep:['Lago profundo','#285d83'],water_ocean:['Mar e ondas','#367b9e'],
 water_swamp:['Água de brejo','#58765c'],water_arcane:['Água arcana','#7862ae'],
 water_coolant:['Fluido refrigerante','#3daba3'],water_hot:['Fonte termal','#76a5ab']
};
const tileCache=new Map(),buffer=document.createElement('canvas'),bctx=buffer.getContext('2d');
function waterTile(type,color,phase,overlay=false){
 const frame=Math.floor(phase*7)%8,key=[type,overlay?'':color,frame,overlay].join('|');
 if(tileCache.has(key)){const v=tileCache.get(key);tileCache.delete(key);tileCache.set(key,v);return v;}
 const tile=document.createElement('canvas');tile.width=tile.height=64;const c=tile.getContext('2d');
 if(!overlay){c.fillStyle=color;c.fillRect(0,0,64,64);c.fillStyle='#031f3621';for(let y=0;y<64;y+=8)c.fillRect(0,y,64,1);}
 const wave=type==='water_ocean',arcane=type==='water_arcane',swamp=type==='water_swamp';
 c.fillStyle=arcane?'#e0c3ff65':swamp?'#ced79835':overlay?'#d4f9ff38':'#bdf4ff49';
 for(let y=0;y<64;y+=16){const x=((y/16)*19+frame*(wave?3:2))%64,yy=y+((frame+Math.floor(y/16))%3);for(const shift of [-64,0,64]){c.fillRect(x+shift,yy,wave?28:14,2);c.fillRect(x+shift+3,yy+2,wave?16:6,1);}}
 c.fillStyle=arcane?'#efbaff8f':'#ffffff57';
 for(let i=0;i<5;i++){const x=(i*17+frame*2)%64,y=(i*23+(frame+i)%4)%64;c.fillRect(x,y,2,1);}
 if(type==='water_hot'){c.fillStyle='#edf9fa24';for(let i=0;i<3;i++)c.fillRect((i*23+frame)%64,(i*19-frame+64)%64,7,2);}
 tileCache.set(key,tile);while(tileCache.size>64){const k=tileCache.keys().next().value;tileCache.get(k).width=0;tileCache.delete(k);}return tile;
}
function paintMasks(keys,l,resolution,cx,cy){
 const F=window.CHEMSCAPE_FLOOR_LAYERS,tiles=[...keys].filter(k=>F.visible(l,k)).sort((a,b)=>F.compare(l,a,b)),groups=new Map();
 for(const key of tiles){const t=l.paint.tiles[key];if(t&&waterTypes[t.type]){const id=t.type;if(!groups.has(id)){const canvas=document.createElement('canvas');canvas.width=canvas.height=resolution;groups.set(id,{canvas,type:t.type,color:t.color});}}}
 for(const key of tiles){const t=l.paint.tiles[key];if(!t)continue;const [s,x,y]=key.split(':').map(Number),rx=(x*s-cx*512)*resolution/512,ry=(y*s-cy*512)*resolution/512,rw=s*resolution/512;
  for(const [id,g]of groups){const c=g.canvas.getContext('2d');c.save();if(t.circle){c.beginPath();c.arc((t.circle[0]-cx*512)*resolution/512,(t.circle[1]-cy*512)*resolution/512,t.circle[2]*resolution/512,0,Math.PI*2);c.clip();}c.clearRect(rx,ry,rw,rw);if(id===t.type){c.fillStyle='#fff';c.fillRect(rx,ry,rw,rw);}c.restore();}
 }
 return [...groups.values()];
}
function paintWater(c,rec,time){
 if(!rec.waterFrames){const masks=rec.waterMasks||[];if(!masks.length)return;const n=masks[0].canvas.width;rec.waterFrames=[];if(buffer.width!==n)buffer.width=buffer.height=n;
  for(let phase=0;phase<8;phase++){const frame=document.createElement('canvas');frame.width=frame.height=n;const out=frame.getContext('2d');out.imageSmoothingEnabled=false;
   for(const g of masks){bctx.setTransform(1,0,0,1,0,0);bctx.clearRect(0,0,n,n);bctx.globalCompositeOperation='source-over';bctx.imageSmoothingEnabled=false;bctx.save();bctx.scale(n/512,n/512);bctx.translate(-rec.x,-rec.y);const pattern=bctx.createPattern(waterTile(g.type,g.color,phase/7+.001,true),'repeat');pattern.setTransform(new DOMMatrix().scale(2));bctx.fillStyle=pattern;bctx.fillRect(rec.x,rec.y,512,512);bctx.restore();bctx.globalCompositeOperation='destination-in';bctx.drawImage(g.canvas,0,0,n,n);bctx.globalCompositeOperation='source-over';out.drawImage(buffer,0,0);}
   rec.waterFrames.push(frame);
  }
  for(const g of masks)g.canvas.width=0;rec.waterMasks=[];
 }
 c.drawImage(rec.waterFrames[Math.floor(time*7)%8],rec.x,rec.y,512,512);
}
function animateRiver(c,l,view,time,W,H){
 if(view.zoom<.35)return;const bx=view.x-W/2/view.zoom,by=view.y-H/2/view.zoom,bw=W/view.zoom,bh=H/view.zoom;
 const regions=(l.obstacles||[]).filter(o=>o.kind==='water'&&o.x<bx+bw&&o.x+o.w>bx&&o.y<by+bh&&o.y+o.h>by);
 if(!regions.length)return;c.save();c.beginPath();for(const r of regions)c.rect(r.x+1,r.y,r.w-2,r.h);c.clip();
 c.fillStyle=c.createPattern(waterTile(l.world==='alchemy'?'water_fresh':'water',waterTypes.water[1],time,true),'repeat');c.fillRect(bx,by,bw,bh);c.restore();
}
function shadow(c,o,m,player,ready){
 if(!m||!ready||o.hidden||o.shadow===false||m.shadow===false||m.groundPlane)return false;
 const meta=window.CHEMSCAPE_ASSET_META?.[o.sprite],actor=o===player||o.maxHp!==undefined||o.pathIndex!==undefined||['npc','creature'].includes(meta?.entity)||o.activity!==undefined;
 const item=o.drop||o.itemId||['pickup','drop'].includes(o.kind),tree=o.kind==='tree'||meta?.entity==='tree';
 const k=(m.scale??1)*(typeof o.scale==='number'?o.scale:1),fw=m.sheet?.fw||m.cell?.[2]||m.w,fh=m.sheet?.fh||m.cell?.[3]||m.h,v=m.visualBounds||[0,0,fw,fh],anchor=o.anchor||m.anchor||[fw/2,fh],angle=actor?0:(o.rotation||0)*Math.PI/180;
 let dx=(v[0]+v[2]/2-anchor[0])*k,dy=(v[1]+v[3]-anchor[1])*k+2,rx=Math.max(4,Math.min(actor?30:item?21:100,v[2]*k*(actor ? .23 : item ? .3 : .34))),ry=Math.max(2,Math.min(actor?8:18,rx*.24));
 if(!actor&&o.solid){const scale=typeof o.scale==='number'?o.scale:1;dx=(o.solid[0]+o.solid[2]/2)*scale;dy=(o.solid[1]+o.solid[3])*scale+3;rx=Math.max(5,Math.min(125,o.solid[2]*scale*.44));ry=Math.max(3,Math.min(20,o.solid[3]*scale*.24));}
 if(tree){rx=Math.min(34,rx);ry=Math.min(10,ry);}dx*=o.flipX?-1:1;dy*=o.flipY?-1:1;const x=o.x+dx*Math.cos(angle)-dy*Math.sin(angle),y=o.y+dx*Math.sin(angle)+dy*Math.cos(angle),height=Math.min(200,v[3]*k);
 c.save();if(!m.hasShadow){c.fillStyle=actor?'#08132145':item?'#08132150':'#0813213d';for(const [scale,alpha]of [[1.18,.22],[1,.45],[.72,.55]]){c.globalAlpha=alpha;c.beginPath();c.ellipse(x,y,rx*scale,ry*scale,angle,0,Math.PI*2);c.fill();}}
 c.globalAlpha=1;c.fillStyle=actor?'#09182a21':'#09182a1c';c.beginPath();c.ellipse(x+height*.12,y+height*.055,rx*(tree?1.75:1.1),Math.max(2,ry+height*.055),angle+.18,0,Math.PI*2);c.fill();c.restore();return true;
}

function dropGlow(c,o,m,time){
 if(!m||!o.drop)return;c.save();c.translate(o.x,o.y);c.fillStyle='#f1dc9d25';c.beginPath();c.ellipse(0,0,16,5,0,0,Math.PI*2);c.fill();
 if(Math.sin(time*3+(o.x+o.y)*.01)>.72){c.fillStyle='#ffe8a2';c.fillRect(10,-32,1,6);c.fillRect(8,-30,5,1);}c.restore();
}
function rift(c,bridge,time){
 const x=bridge.x-110,y=bridge.y-32,w=250,h=60;c.save();c.fillStyle='#1e2533';c.fillRect(x,y,w,h);
 c.fillStyle='#111721';c.beginPath();c.moveTo(x+4,y+12);c.lineTo(x+21,y+5);c.lineTo(x+65,y+11);c.lineTo(x+94,y+4);c.lineTo(x+139,y+10);c.lineTo(x+185,y+5);c.lineTo(x+w-8,y+15);c.lineTo(x+w-15,y+h-8);c.lineTo(x+179,y+h-4);c.lineTo(x+135,y+h-12);c.lineTo(x+87,y+h-5);c.lineTo(x+37,y+h-10);c.lineTo(x+7,y+h-5);c.closePath();c.fill();
 c.fillStyle='#7862ae55';for(let i=0;i<12;i++){const px=x+12+i*19,py=y+21+Math.sin(i*1.7+time*.8)*9;c.fillRect(px,py,6,2);}
 for(const edge of [0,1])for(let i=0;i<17;i++){const rx=x+i*15,ry=y+(edge?h-7:0)+(i%3-1)*3;c.fillStyle=i%2?'#7c8290':'#626977';c.fillRect(rx,ry,14,7);c.fillStyle='#a9adba';c.fillRect(rx+2,ry,9,2);c.fillStyle='#343c4d';c.fillRect(rx+4,ry+5,10,2);}
 c.fillStyle='#9b7ec755';c.fillRect(x+7,y+10,w-14,2);c.fillRect(x+5,y+h-10,w-10,2);c.restore();
}
function beacon(c,x,y,time,color){
 const pulse=(time*.6)%1;c.save();c.strokeStyle=color;c.globalAlpha=(1-pulse)*.35;c.lineWidth=1.5;c.beginPath();c.ellipse(x,y,15+pulse*15,5+pulse*5,0,0,Math.PI*2);c.stroke();c.restore();
}
window.CHEMSCAPE_VISUAL={waterTypes,waterTile,paintMasks,paintWater,animateRiver,shadow,dropGlow,beacon,rift};
})();
