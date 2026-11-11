/* Registered module: portal-spacing */
(function (initialize) {
  if (window.VoicesModules) window.VoicesModules.define("portal-spacing", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error('Module loader is missing');
  else initialize();
})(function () {
/* Freestanding entrances need room for their art and for choosing a destination. */
(function(){
'use strict';
const V=window.V,W=V.World,T=48;
const S=V.PortalSpacing={gap:216,
 target(o){return ['travel','portal','fast-travel'].includes(o.type)&&!o.interiorDoor&&!o.onWall&&!o.door;},
 movable(o){return o.type!=='fast-travel'&&!o.seaFerry&&!o.door&&!o.mounted;},
 bounds(m,o,p=o){
  let half=94,top=100,bottom=34;
  if(o.type==='fast-travel'){half=30;top=58;bottom=14;}
  else if(o.type==='portal'){half=40;top=88;bottom=18;}
  else if(o.afLink&&!m.africanMuseum){half=86;top=140;bottom=18;}
  else if(o.salonLink){half=130;top=160;bottom=24;}
  else if(o.seaLink){half=110;top=55;bottom=46;}
  const scale=o.visualScale||1,a=(o.visualRotation||0)*Math.PI/180;
  const corners=[[-half,-top],[half,-top],[half,bottom],[-half,bottom]].map(([x,y])=>({x:p.x+(x*Math.cos(a)-y*Math.sin(a))*scale,y:p.y+(x*Math.sin(a)+y*Math.cos(a))*scale}));
  return{left:Math.min(...corners.map(p=>p.x)),right:Math.max(...corners.map(p=>p.x)),top:Math.min(...corners.map(p=>p.y)),bottom:Math.max(...corners.map(p=>p.y))};
 },
 separated(m,o,p,other){
  if(Math.hypot(p.x-other.x,p.y-other.y)<this.gap)return false;
  const a=this.bounds(m,o,p),b=this.bounds(m,other),margin=18;
  return a.right+margin<=b.left||b.right+margin<=a.left||a.bottom+margin<=b.top||b.bottom+margin<=a.top;
 },
 obstacles(m){
  const rects=(m.decor||[]).filter(o=>o.layer!=='ground'&&o.family!=='floor').map(o=>({left:o.x,right:o.x+o.size,top:o.y,bottom:o.y+o.size}));
  for(const b of m.buildings||[])rects.push({left:b.x-12,right:b.x+b.w+12,top:b.y-30,bottom:b.y+b.h});
  for(const o of m.objects)if(!this.target(o)&&o.w&&o.h)rects.push({left:o.x-o.w/2,right:o.x+o.w/2,top:o.y-o.h,bottom:o.y});
  return rects;
 },
 clear(m,o,p,targets,reserved,obstacles){
  const b=this.bounds(m,o,p);
  if(b.left<36||b.right>m.width*T-36||b.top<48||b.bottom>m.height*T-36)return false;
  if(reserved.some(other=>!this.separated(m,o,p,other)))return false;
  const facade=o.afLink&&!m.africanMuseum||o.salonLink||o.seaLink;
  if(facade&&obstacles.some(a=>b.left<a.right+12&&b.right>a.left-12&&b.top<a.bottom+12&&b.bottom>a.top-12))return false;
  if(!V.FastTravel.clear(m,p,18)||!V.FastTravel.clear(m,{x:p.x,y:p.y+40},14))return false;
  if(!V.ObjectiveGuide.interactionClear(m,{x:p.x,y:p.y+40},p))return false;
  return !m.objects.some(other=>other!==o&&!targets.has(other)&&!V.Cozy.person(other)&&Math.hypot(other.x-p.x,other.y-p.y)<72);
 },
 arrange(m,relayout=false){
  if(!m)return 0;const targets=m.objects.filter(o=>this.target(o));if(targets.length<2)return 0;
  const set=new Set(targets),obstacles=this.obstacles(m),reserved=targets.filter(o=>!this.movable(o)||!relayout&&targets.every(other=>o===other||this.separated(m,o,o,other)));
  const area=o=>{const b=this.bounds(m,o);return(b.right-b.left)*(b.bottom-b.top);};
  const moving=targets.filter(o=>!reserved.includes(o)).sort((a,b)=>area(b)-area(a)||a.id.localeCompare(b.id));
  let changed=0;
  for(const o of moving){
   let at=null;const limit=Math.hypot(m.width*T,m.height*T);
   for(let r=0;r<=limit&&!at;r+=24)for(let i=0;i<(r?24:1);i++){
    const a=i*Math.PI/12,p={x:Math.round((o.x+Math.cos(a)*r)/6)*6,y:Math.round((o.y+Math.sin(a)*r)/6)*6};
    if(this.clear(m,o,p,set,reserved,obstacles)){at=p;break;}
   }
   if(at&&(at.x!==o.x||at.y!==o.y)){
    const dx=at.x-o.x,dy=at.y-o.y;Object.assign(o,at);
    for(const solid of m.solids)if(solid.owner===o.id||solid.owner==='host-'+o.id){solid.x+=dx;solid.y+=dy;}
    for(const anchor of m.anchors?.values()||[])if(anchor.object===o||anchor.id===o.id){anchor.x+=dx;anchor.y+=dy;}
    const original=V.SceneDesign.objectRegistry[m.id]?.[o.id];if(original)Object.assign(original,at);
    changed++;
   }
   reserved.push(o);
  }
  if(changed){m.geometryRevision=(m.geometryRevision||0)+1;V.ObjectiveGuide.invalidate();V.Atlas.cache.clear();}
  // Late expansions can fill the remaining gaps. If the local repair cannot
  // place a facade, allow the other movable signs to make room as a whole.
  if(!relayout&&targets.some((o,i)=>targets.slice(i+1).some(other=>!this.separated(m,o,o,other))))changed+=this.arrange(m,true);
  return changed;
 },
 all(){let changed=0;for(const m of Object.values(W.maps))changed+=this.arrange(m);return changed;}
};
const init=W.init.bind(W);W.init=function(...args){const result=init(...args);S.all();return result;};
const load=W.load.bind(W);W.load=function(id,...args){S.arrange(this.maps[id]);return load(id,...args);};
if(Object.keys(W.maps).length)S.all();
})();

});
