(()=>{
'use strict';
const CELL=64,RADIUS=530,caches=new WeakMap(),surface=document.createElement('canvas');
function record(l,campaign){
 if(!l||!campaign)return null;let cache=caches.get(campaign);if(!cache){cache=new Map();caches.set(campaign,cache);}let rec=cache.get(l.id),cols=Math.ceil(l.bounds[2]/CELL),rows=Math.ceil(l.bounds[3]/CELL);
 if(rec&&rec.cols===cols&&rec.rows===rows)return rec;
 const bytes=new Uint8Array(Math.ceil(cols*rows/8)),saved=campaign.exploration?.[l.id];
 if(saved?.cell===CELL&&saved.cols===cols&&saved.rows===rows&&(typeof saved.data==='string'||Array.isArray(saved.data)))try{const raw=atob(Array.isArray(saved.data)?saved.data.join(''):saved.data);for(let i=0;i<Math.min(raw.length,bytes.length);i++)bytes[i]=raw.charCodeAt(i);}catch{}
 const canvas=document.createElement('canvas');canvas.width=cols;canvas.height=rows;const context=canvas.getContext('2d');context.fillStyle='#fff';let count=0;for(let i=0;i<cols*rows;i++)if(bytes[i>>3]&(1<<(i&7))){context.fillRect(i%cols,Math.floor(i/cols),1,1);count++;}
 rec={cols,rows,bytes,canvas,context,count,dirty:false,lastX:NaN,lastY:NaN};cache.set(l.id,rec);return rec;
}
function reveal(l,campaign,player){
 if(!l||!player)return;const rec=record(l,campaign);if(Math.hypot(player.x-rec.lastX,player.y-rec.lastY)<20)return;rec.lastX=player.x;rec.lastY=player.y;
 for(let y=Math.max(0,Math.floor((player.y-RADIUS)/CELL));y<=Math.min(rec.rows-1,Math.ceil((player.y+RADIUS)/CELL));y++)for(let x=Math.max(0,Math.floor((player.x-RADIUS)/CELL));x<=Math.min(rec.cols-1,Math.ceil((player.x+RADIUS)/CELL));x++){
  if(Math.hypot((x+.5)*CELL-player.x,(y+.5)*CELL-player.y)>RADIUS+CELL*.3)continue;const i=y*rec.cols+x,bit=1<<(i&7);if(rec.bytes[i>>3]&bit)continue;rec.bytes[i>>3]|=bit;rec.context.fillRect(x,y,1,1);rec.count++;rec.dirty=true;
 }
}
function sync(campaign){const cache=caches.get(campaign);if(!cache)return;campaign.exploration=campaign.exploration||{};for(const [id,r]of cache)if(r.dirty){let raw='';for(const byte of r.bytes)raw+=String.fromCharCode(byte);campaign.exploration[id]={cell:CELL,cols:r.cols,rows:r.rows,data:btoa(raw).match(/.{1,2048}/g)||[]};r.dirty=false;}}
function explored(l,campaign,x,y){const r=record(l,campaign);if(!r)return false;const cx=Math.floor(x/CELL),cy=Math.floor(y/CELL);if(cx<0||cy<0||cx>=r.cols||cy>=r.rows)return false;const i=cy*r.cols+cx;return !!(r.bytes[i>>3]&(1<<(i&7)));}
function visible(l,campaign,x,y,player){return !!player&&Math.hypot(player.x-x,player.y-y)<RADIUS-50;}
function layer(l,campaign,player,width,height,view,zoom){
 const rec=record(l,campaign);if(surface.width!==width||surface.height!==height){surface.width=width;surface.height=height;}
 const c=surface.getContext('2d');c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,width,height);c.fillStyle='rgba(2,6,12,.985)';c.fillRect(0,0,width,height);
 c.globalCompositeOperation='destination-out';c.globalAlpha=.44;c.imageSmoothingEnabled=true;c.drawImage(rec.canvas,width/2-view.x*zoom,height/2-view.y*zoom,rec.cols*CELL*zoom,rec.rows*CELL*zoom);c.globalAlpha=1;
 if(player){const x=width/2+(player.x-view.x)*zoom,y=height/2+(player.y-view.y)*zoom,r=RADIUS*zoom,g=c.createRadialGradient(x,y,r*.7,x,y,r);g.addColorStop(0,'#000');g.addColorStop(1,'#0000');c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();}
 c.globalCompositeOperation='source-over';return surface;
}
function draw(ctx,l,campaign,player,view,w,h){if(!l)return;const im=layer(l,campaign,player,w,h,view,view.zoom);ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(im,0,0);ctx.restore();}
function atlas(ctx,l,campaign,player,box){
 const k=box.scale,w=box.width,h=box.height,view={x:box.cx,y:box.cy};const im=layer(l,campaign,player,w,h,view,k);ctx.save();ctx.setTransform(box.dpr||1,0,0,box.dpr||1,0,0);ctx.drawImage(im,0,0,w,h);ctx.restore();
}
function percent(l,campaign){const r=record(l,campaign);return r?Math.round(r.count/(r.cols*r.rows)*100):0;}
window.CHEMSCAPE_FOG={reveal,sync,explored,visible,draw,atlas,percent,radius:RADIUS};
})();
