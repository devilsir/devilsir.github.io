(function(){
'use strict';
const V=window.V,D=V.SceneDesign,C=V.Cozy,W=V.World,E=V.SceneEditor,T=48;
const boxes=new WeakMap(),hosts=new WeakMap(),surfaces=new WeakSet();
const O=V.ObjectEditing={
special(m){return !!(m?.maritime||m?.capeRegion||m?.salon||m?.africanMuseum);},
offset(m){return m.africanMuseum ? .5 : 0;},
prime(){if(this.catalogued)return;this.catalogued=true;const copy=x=>JSON.parse(JSON.stringify(x));for(const owner of [V.Maritime,V.CapeRegion,V.AfricanMuseum])for(const id of owner.ids){owner.build(id,copy(C.layouts[id]));D.objectRegistry[id]['waypoint-'+id]={id:'waypoint-'+id,type:'fast-travel'};}V.Salon.build(copy(C.layouts[V.Salon.id]));D.objectRegistry[V.Salon.id]['waypoint-'+V.Salon.id]={id:'waypoint-'+V.Salon.id,type:'fast-travel'};},
point(x,y,cx,cy,scale,rotation,tx=cx,ty=cy){let a=(x-cx)*scale,b=(y-cy)*scale;for(let n=0;n<rotation/90;n++)[a,b]=[-b,a];return{x:tx+a,y:ty+b};},
apply(m){
 if(!m?.design)return m;
 const fountain=m.objects.find(o=>o.type==='fountain');
 if(fountain)for(const f of m.solids)if(!f.owner&&f.x===14*T&&f.y===9*T&&f.w===4*T)f.owner=fountain.id;
 for(const o of m.objects){
  const edit=m.design.objectEdits?.[o.id],scale=edit?.scale??1,rotation=edit?.rotation??0;
  o.visualScale=scale;o.visualRotation=rotation;
  if(C.person(o)&&edit)o.dir=({0:0,90:1,180:3,270:2})[rotation];
  if(!edit){const s=o.scene;if(s?.hostDecor?.startsWith('solid-')&&(s.rotation||s.flip))for(const f of m.solids.filter(f=>f.owner===s.hostDecor)){let b=boxes.get(f);if(!b){b={...f};boxes.set(f,b);}Object.assign(f,D.rotateBox(b,o.x,o.y-(s.size||1)*T*.49,s.rotation||0,s.flip));}continue;}
  const linked=m.decor.filter(d=>d.linked===o.id),owners=new Set([o.id,'host-'+o.id,o.scene?.hostDecor,...linked.map(d=>d.id)].filter(Boolean));
  for(const f of m.solids.filter(f=>owners.has(f.owner))){
   let b=boxes.get(f);
   if(!b){b={x:f.x,y:f.y,w:f.w,h:f.h,cx:o.type==='fountain'?16*T:o.x,cy:o.type==='fountain'?12.7*T:o.y};boxes.set(f,b);}
   const p=this.point(b.x,b.y,b.cx,b.cy,scale,rotation,o.x,o.y),q=this.point(b.x+b.w,b.y+b.h,b.cx,b.cy,scale,rotation,o.x,o.y);
   Object.assign(f,{x:Math.min(p.x,q.x),y:Math.min(p.y,q.y),w:Math.abs(q.x-p.x),h:Math.abs(q.y-p.y)});
  }
  for(const h of linked){
   let b=hosts.get(h);if(!b){b={x:h.x+h.size/2,y:h.y+h.size/2,size:h.size,rotation:h.rotation||0,cx:o.x,cy:o.y};hosts.set(h,b);}
   const p=this.point(b.x,b.y,b.cx,b.cy,scale,rotation,o.x,o.y);h.size=b.size*scale;h.x=p.x-h.size/2;h.y=p.y-h.size/2;h.rotation=(b.rotation+rotation)%360;
  }
  o.appliedScale=scale;
 }
 return m;
},
finish(m){
 if(!m?.design)return m;
 const coast=V.CoastalExploration.regions[m.id];if(coast){m.coastalNavigation=true;if(m.id==='muizenberg')for(const s of m.solids)if(s.owner==='cape-waterline'){s.w=(m.width-2)*T;s.h=(m.height-31)*T;}if(!m.objects.some(o=>o.id==='coastal-dock-'+m.id))m.objects.push({id:'coastal-dock-'+m.id,type:'sea-dock',...V.Maritime.point(coast.dock.land),label:'Barcos, botes e desafio de pesca',interactionRange:115});}
 if(this.special(m)){
  if(m.id==='cape-town')V.CapeRegion.portLinks(m);
  m.decor||=[];m.anchors||=new Map();m.chats||=[];
  for(const [i,row]of (m.design.decor||[]).entries())if(!m.decor.some(o=>o.id===(row[6]?.id||'prop-'+m.id+'-'+i)))D.addDecor(m,row,i);
  for(const scene of m.design.scenes||[])if(!m.objects.some(o=>o.scene?.id===scene.id)){C.addScene(m,scene);m.objects.at(-1).editorAdded=true;}
  for(const o of m.objects){
   const p=m.design.positions?.[o.id];if(!p||o.editorAdded||o.mounted)continue;
   const x=(p[0]+this.offset(m))*T,y=(p[1]+this.offset(m))*T,dx=x-o.x,dy=y-o.y;
   if(!dx&&!dy)continue;o.x=x;o.y=y;
   for(const f of m.solids.filter(f=>f.owner===o.id||f.owner==='host-'+o.id)){f.x+=dx;f.y+=dy;}
   for(const a of m.anchors.values())if(a.id===o.id||a.object===o){a.x+=dx;a.y+=dy;}
  }
  if(!m.editorHydrated){V.Architecture.hydrate(m);m.editorHydrated=true;}
 }
 D.removeObjects(m);this.apply(m);
 m.editorDecorVisual=(m.decor||[]).filter(d=>d.layer!=='ground').map(d=>({id:'editor-draw-'+d.id,type:'editor-decor',x:d.x+d.size/2,y:d.y+d.size,editorDecor:d}));
 return m;
},
surface(m){
 const canvas=m.cache;if(!this.special(m)||!canvas||surfaces.has(canvas))return;
 surfaces.add(canvas);const c=canvas.getContext('2d');c.save();c.imageSmoothingEnabled=false;
 for(const [x,y,w,h]of m.design.paths||[]){c.fillStyle='#8e856b';c.fillRect(x*T,y*T,w*T,h*T);c.fillStyle=c.createPattern(V.EditorMaterials.floorTile(0),'repeat');c.fillRect(x*T+2,y*T+2,w*T-4,h*T-4);}
 for(const [x,y,w,h,color]of m.design.rugs||[]){c.fillStyle=color;c.fillRect(x*T,y*T,w*T,h*T);}
 for(const d of m.decor||[])if(d.layer==='ground')D.drawDecor(c,d,{x:0,y:0});c.restore();
},
draw(ctx,o,cam,fn,owner,args){
 if(o.type==='editor-decor')return D.drawDecor(ctx,o.editorDecor,cam);
 if(o.editorAdded&&owner!==C)return C.drawObject(ctx,o,cam,{accent:'#d6ba82'});
 const scale=o.visualScale||1,rotation=C.person(o)?0:o.visualRotation||0;
 if(scale===1&&!rotation)return fn.apply(owner,args);
 const values={scale:o.visualScale,rotation:o.visualRotation,drawing:o.editorDrawing};
 ctx.save();ctx.translate(o.x-cam.x,o.y-cam.y);ctx.rotate(rotation*Math.PI/180);ctx.scale(scale,scale);ctx.translate(-o.x+cam.x,-o.y+cam.y);
 o.visualScale=1;o.visualRotation=0;o.editorDrawing=true;
 try{return fn.apply(owner,args);}finally{o.visualScale=values.scale;o.visualRotation=values.rotation;o.editorDrawing=values.drawing;ctx.restore();}
},
scene(ctx,o,cam,paint){const s=o.scene;if(!s||!s.rotation&&!s.flip)return paint();if(!['home','home-plus','community-details','apartment-details'].includes(s.family)&&!V.TerreirosCollection.item(o))return paint();const rotation=s.rotation,flip=s.flip,z=(s.size||1)*T,x=o.x-cam.x,y=o.y-cam.y-z*.49;ctx.save();ctx.translate(x,y);ctx.rotate((rotation||0)*Math.PI/180);if(flip)ctx.scale(-1,1);ctx.translate(-x,-y);s.rotation=0;s.flip=false;try{return paint();}finally{s.rotation=rotation;s.flip=flip;ctx.restore();}},
wrapDraw(owner){const draw=owner.drawObject;owner.drawObject=function(ctx,o,cam,...rest){const paint=()=>O.draw(ctx,o,cam,draw,this,[ctx,o,cam,...rest]);return owner===C?O.scene(ctx,o,cam,paint):paint();};},
wrapSpecial(owner){
 this.wrapDraw(owner);
 if(owner.shadow){const shadow=owner.shadow;owner.shadow=function(ctx,o,cam){if(o.type==='editor-decor'||o.editorAdded)return;return O.draw(ctx,o,cam,shadow,this,[ctx,o,cam]);};}
 const ground=owner.ground;owner.ground=function(m){const r=ground.call(this,m);O.surface(m);return r;};
 const render=owner.render;owner.render=function(ctx){const m=W.current;if(m.editorRendering)return render.call(this,ctx);const original=m.objects;m.editorRendering=true;m.objects=original.concat(m.editorDecorVisual||[]);try{return render.call(this,ctx);}finally{m.objects=original;m.editorRendering=false;}};
},
baseBounds(o,m){
 if(o.w&&o.h)return{x:o.x-o.w/2,y:o.y-o.h,w:o.w,h:o.h};
 if(o.type==='sea-decor')return{x:o.x-38,y:o.y-76,w:76,h:76};
 if(['sea-person','cape-person','salon-stylist'].includes(o.type))return{x:o.x-32,y:o.y-64,w:64,h:64};
 if(o.scene?.kind==='seat'&&!o.scene.family)return{x:o.x-48,y:o.y-48,w:96,h:48};
 if(this.special(m))return{x:o.x-40,y:o.y-76,w:80,h:88};
 return null;
},
bounds(b,o){const scale=o.visualScale||1,r=C.person(o)?0:o.visualRotation||0,points=[[b.x,b.y],[b.x+b.w,b.y],[b.x,b.y+b.h],[b.x+b.w,b.y+b.h]].map(([x,y])=>this.point(x,y,o.x,o.y,scale,r)),xs=points.map(p=>p.x),ys=points.map(p=>p.y);return{x:Math.min(...xs),y:Math.min(...ys),w:Math.max(...xs)-Math.min(...xs),h:Math.max(...ys)-Math.min(...ys)};}
};
const compose=C.compose;C.compose=function(m){const coast=V.CoastalExploration.regions[m.id];if(coast){m.width=coast.width;m.height=coast.height;}const result=compose.call(this,m);O.finish(m);return result;};
for(const owner of [V.Maritime,V.CapeRegion,V.AfricanMuseum,V.Salon]){const build=owner.build;owner.build=function(...args){return O.finish(build.apply(this,args));};}
const preview=D.preview;D.preview=function(...args){return O.finish(preview.apply(this,args));};
const init=W.init;W.init=function(...args){O.prime();const result=init.apply(this,args);for(const m of Object.values(this.maps))O.finish(m);return result;};
O.wrapDraw(C);for(const owner of [V.Maritime,V.CapeRegion,V.Salon,V.AfricanMuseum,V.AfricanCuration])O.wrapSpecial(owner);
const fountain=C.fountain;C.fountain=function(ctx,cam){const o=W.current?.objects.find(o=>o.type==='fountain');return o?O.draw(ctx,o,cam,fountain,this,[ctx,cam]):fountain.call(this,ctx,cam);};
const essential=D.essentialObject;D.essentialObject=function(o){return !!o&&(['fast-travel','sea-person','sea-dock','sea-fishing','sea-book','sea-note','cape-person','cape-note','cape-routes','af-word','af-instrument','af-person','af-curator','af-catalog','af-roda','salon-station','salon-stylist','salon-wash','salon-info'].includes(o.type)||o.capeLink||o.seaFerry)||essential.call(this,o);};
const validate=D.validate;D.validate=function(m){if(!O.special(m))return validate.call(this,m);const objects=m.objects;m.objects=objects.filter(o=>!['sea-building','sea-decor','cape-building','cape-decor'].includes(o.type));try{return validate.call(this,m);}finally{m.objects=objects;}};
const refs=E.refs;E.refs=function(){return refs.call(this).map(r=>r.kind==='object'&&O.special(this.preview)?{...r,name:V.CapeVisuals.labels[r.object.art]||r.name,x:r.object.x/T-O.offset(this.preview),y:r.object.y/T-O.offset(this.preview)}:r);};
const bounds=E.bounds;E.bounds=function(ref){if(ref.kind!=='object')return bounds.call(this,ref);const o=ref.object,b=O.baseBounds(o,this.preview);if(b)return O.bounds(b,o);const old=bounds.call(this,ref),s=o.visualScale||1;return O.bounds({x:o.x+(old.x-o.x)/s,y:o.y+(old.y-o.y)/s,w:old.w/s,h:old.h/s},o);};
const inspector=E.inspector;E.inspector=function(){const result=inspector.call(this),ref=this.find();if(!ref||!['decor','scene','object'].includes(ref.kind))return result;const input=V.$('#editor-size');if(input){input.max='12';input.step='0.25';const initial=Number(input.value),commit=()=>{if(input.isConnected&&Number(input.value)!==initial)this.scale(Number(input.value));};input.onchange=commit;input.onblur=commit;input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();e.stopPropagation();commit();}};input.setAttribute('aria-label',ref.kind==='object'?'Tamanho do objeto · escala de 0,5 a 12':'Tamanho em blocos · de 0,5 a 12');const label=input.closest('label');if(ref.kind==='object'&&label?.firstChild?.nodeType===Node.TEXT_NODE)label.firstChild.textContent='Tamanho · escala ';}const slider=V.$('#editor-scale-slider');if(slider){slider.max='12';slider.step='0.25';const out=slider.parentElement.querySelector('output'),show=value=>{out.textContent=Number(value).toLocaleString('pt-BR')+(ref.kind==='object'?'×':' blocos');};show(input.value);slider.oninput=e=>show(e.target.value);}return result;};
})();
