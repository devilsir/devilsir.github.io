(function houseWindowLights(){
'use strict';
const V=window.V,F=V.CityFacades,E=V.Environment,W=V.World;
const L=V.HouseWindowLights={
 hour(m=W.current){const profile=m?E.profile(m):{};return E.preview?.hour??({dawn:6.3,day:12,sunset:18,night:22}[profile.sky])??(E.state()?.clock.daylight?12:E.time());},
 band(m=W.current){const h=this.hour(m);return h>=19&&h<23?'evening':h>=23||h<5?'late':h<6.5?'dawn':'day';},
 lit(profile,index,night){if(!night)return false;const band=this.band(),seed=profile.seed>>>0;if(band==='day')return false;const houseOn=band==='late'?seed%5===0:band==='dawn'?seed%5<2:seed%5<3;if(!houseOn)return false;return index===0||(Math.imul(seed^(index*97),31)>>>0)%(band==='late'?5:3)===0;},
 windows(m){if(this.band(m)==='day')return[];const out=[];for(const b of m.buildings||[]){if(!b.facade)continue;const cached=F.cache.get(b);if(!cached?.windows?.length||cached.lightBand!==this.band(m))continue;for(const window of cached.windows)out.push({b,cached,...window,x:b.x+window.x,y:b.y+window.y});}return out;},
 draw(ctx,m,cam){const night=this.band(m);if(night==='day')return;ctx.save();ctx.imageSmoothingEnabled=false;for(const w of this.windows(m)){const x=Math.round(w.x-cam.x),y=Math.round(w.y-cam.y);if(x+w.w< -35||x>ctx.canvas.width+35||y+w.h< -35||y>ctx.canvas.height+35)continue;const radius=Math.max(30,w.w*.85),cx=x+w.w/2,cy=y+w.h/2,g=ctx.createRadialGradient(cx,cy,2,cx,cy,radius);g.addColorStop(0,'#ffcf7738');g.addColorStop(1,'#ffcf7700');ctx.fillStyle=g;ctx.fillRect(cx-radius,cy-radius,radius*2,radius*2);ctx.globalAlpha=.86;ctx.drawImage(w.cached.canvas,w.x-w.b.x+35,w.y-w.b.y+41,w.w-6,w.h-6,x+3,y+1,w.w-6,w.h-6);ctx.globalAlpha=1;}ctx.restore();}
};
const lights=E.lights.bind(E);E.lights=function(m){const list=lights(m);if(L.band(m)==='day')return list;const byBuilding=new Map();for(const w of L.windows(m))if(!byBuilding.has(w.b))byBuilding.set(w.b,w);for(const[b,w]of byBuilding)list.push({id:'home-window-'+(b.door||b.label),x:Math.round(w.x+w.w/2),y:Math.round(b.y+b.h+12),radius:108,intensity:.44,color:'#ffd291',softness:.9,moving:false});return list;};
const lighting=E.lighting.bind(E);E.lighting=function(ctx,m,cam){const result=lighting(ctx,m,cam);L.draw(ctx,m,cam);return result;};
const signature=V.Atlas.signature.bind(V.Atlas);V.Atlas.signature=function(m){return signature(m)+'|windows-'+L.band(m);};
})();
