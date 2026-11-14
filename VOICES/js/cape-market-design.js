/* Registered module: cape-market-design */
(function(initialize){if(window.VoicesModules)window.VoicesModules.define('cape-market-design',initialize);else if(window.VOICES_MODULE_MODE)throw new Error('Module loader is missing');else initialize();})(function(){
'use strict';
const V=window.V,M=V.Markets,D=V.HomeDesign,W=V.World,C=V.Cozy,T=48;
const layout={thandi:[8.5,14.8,0],amina:[31.5,14.8,1],zola:[8.5,25.5,2],sizwe:[31.5,23.5,3],nandi:[8.5,20.2,3]};
const K=V.CapeMarketDesign={
 arrange(m){if(m?.id!=='cape-market')return m;
  for(const v of V.MarketData.vendors.filter(v=>v.map===m.id)){const p=layout[v.id];if(!p)continue;v.at=p.slice(0,2);const o=m.objects.find(o=>o.id==='market-stall-'+v.id),npc=m.objects.find(o=>o.id==='market-vendor-'+v.id);if(o){Object.assign(o,{x:p[0]*T,y:p[1]*T,w:204,h:204,capeDesignFrame:p[2]});const s=m.solids.find(s=>s.owner===o.id);if(s)Object.assign(s,{x:o.x-82,y:o.y-24,w:164,h:22});}if(npc){Object.assign(npc,{x:(p[0]+(p[0]<20?2.6:-2.6))*T,y:(p[1]+.45)*T});npc.home={x:npc.x,y:npc.y};}}
  for(const o of m.objects){if(o.marketWater||o.marketKitchen){o.x=(o.marketWater?16:25.5)*T;o.y=18.6*T;const s=m.solids.find(s=>s.owner===o.id);if(s)Object.assign(s,{x:o.x-45,y:o.y-28,w:90,h:26});}}
  if(!m.objects.some(o=>o.id==='cape-design-pots-left'))for(const[id,x,y,frame,w,h]of [['pots-left',3,17.5,18,84,88],['pots-right',37,19,19,86,110],['tea-garden',27.9,19.3,16,74,96]]){m.objects.push({id:'cape-design-'+id,type:'cape-design-prop',x:x*T,y:y*T,frame,w,h});m.solids.push({x:x*T-w*.3,y:y*T-15,w:w*.6,h:20,owner:'cape-design-'+id});}
  m.marketFacades=[2,14.2,26.4].map(x=>({x:x*T,y:3.2*T,w:11.3*T,h:6.7*T}));
  m.capeDesign=true;m.cache=null;m.geometryRevision=(m.geometryRevision||0)+1;return m;
 },
 ground(m){const canvas=V.GroundCache.create(m,m.width*T,m.height*T),c=canvas.getContext('2d'),width=m.width*T,height=m.height*T;c.fillStyle='#e6dcc2';c.fillRect(0,0,width,height);
  for(let y=T;y<height-T;y+=T)for(let x=T;x<width-T;x+=T){c.fillStyle=(x/T+y/T)%2?'#d5c5a5':'#deceb0';c.fillRect(x+1,y+1,T-2,T-2);c.strokeStyle='#af987326';c.beginPath();c.moveTo(x+7,y+12);c.lineTo(x+31,y+18);c.stroke();}
  c.fillStyle='#efe5cc';c.fillRect(15.1*T,10*T,9.8*T,18*T);c.fillRect(3*T,21.3*T,34*T,1.5*T);for(const x of [15.1,24.8]){c.fillStyle='#345e56';c.fillRect(x*T,10*T,5,18*T);c.fillStyle='#b89b63';c.fillRect(x*T+7,10*T,2,18*T);}
  for(const v of V.MarketData.vendors.filter(v=>v.map===m.id)){const p=layout[v.id];if(!p)continue;const x=p[0]*T,y=p[1]*T;c.fillStyle='#b69a7050';c.beginPath();c.ellipse(x,y+11,112,31,0,0,Math.PI*2);c.fill();c.fillStyle='#f0e2bf';c.fillRect(x-112,y+27,224,47);c.fillStyle='#48685e';c.fillRect(x-112,y+27,224,2);}
  c.fillStyle='#c7d7ce';c.fillRect(T,T,width-2*T,4.5*T);const mountain=(color,points)=>{c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x*T,y*T):c.moveTo(x*T,y*T));c.closePath();c.fill();};mountain('#9bb5ad',[[1,5.5],[5,4.3],[12,3.7],[16,2.6],[28,2.6],[33,4],[39,5],[39,5.5]]);mountain('#769a90',[[1,5.5],[10,4.8],[15,3.5],[28,3.5],[32,4.4],[39,5.2],[39,5.5]]);
  for(const row of m.marketFacades)D.art(c,'cape-design',4,row.x,row.y,row.w,row.h);
  c.fillStyle='#254d43';c.fillRect(T,T,width-2*T,43);c.fillStyle='#bda06a';c.fillRect(T,T+43,width-2*T,3);V.Engine.text(c,'ÁGUA E COZINHA COMUNITÁRIA',20.5*T,20.2*T,'#3c6554',12,'center');m.cache=canvas;
 },
 draw(c,o,cam){const cape=o.capeDesignFrame!==undefined||M.vendor(o.marketVendor)?.map==='cape-market'||W.current?.id==='cape-market';if(!cape)return false;const x=o.x-cam.x,y=o.y-cam.y;
  if(o.type==='market-stall'){const frame=o.capeDesignFrame??layout[o.marketVendor]?.[2]??0;D.art(c,'cape-design',frame,x-o.w/2,y-o.h,o.w,o.h);return true;}
  if(o.type==='cape-design-prop'){D.art(c,'home-decor',o.frame,x-o.w/2,y-o.h,o.w,o.h);return true;}
  if(o.scene?.id?.startsWith('cape-market-seat-')){D.art(c,'home-design',16,x-89,y-95,178,95);return true;}
  if(o.marketWater){D.art(c,'cape-design',5,x-64,y-126,128,126);c.save();c.strokeStyle='#c5e6e3';c.lineWidth=1.6;const t=V.settings.reducedMotion?0:V.Engine.time;for(let n=0;n<2;n++){c.beginPath();c.moveTo(x-43,y-33+n*3);c.quadraticCurveTo(x-37,y-34+n*3+Math.sin(t*2+n)*1.5,x-31,y-33+n*3);c.stroke();}c.restore();return true;}
  if(o.marketKitchen){D.art(c,'cape-design',0,x-74,y-146,148,146);return true;}return false;
 }
};
for(const v of V.MarketData.vendors.filter(v=>v.map==='cape-market'))if(layout[v.id])v.at=layout[v.id].slice(0,2);
const install=M.install.bind(M);M.install=function(m){install(m);K.arrange(m);};
const ground=M.ground.bind(M);M.ground=function(m){return m.id==='cape-market'?K.ground(m):ground(m);};
const draw=M.draw.bind(M);M.draw=function(c,o,cam){return K.draw(c,o,cam)||draw(c,o,cam);};
const stall=V.FoodExpansion.drawStall.bind(V.FoodExpansion);V.FoodExpansion.drawStall=function(c,o,cam){return o.type==='market-stall'&&M.vendor(o.marketVendor)?.map==='cape-market'?K.draw(c,o,cam):stall(c,o,cam);};
});
