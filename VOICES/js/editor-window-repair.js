(function repairArchitecturalWindowSelection(){
'use strict';
const V=window.V,E=V.SceneEditor,A=V.Architecture,D=V.SceneDesign,T=48;
const prev={refs:E.refs.bind(E),bounds:E.bounds.bind(E),hit:E.hit.bind(E),down:E.pointerDown.bind(E),move:E.pointerMove.bind(E),up:E.pointerUp.bind(E),cancel:E.pointerCancel.bind(E),paint:E.paint.bind(E)};
function list(editor){
 const design=editor.design();if(!design)return [];
 const geometry=A.geometry(design);
 // The renderer creates a default window if none is authored. Turn it into an
 // editable real window with identical coordinates when editing an interior.
 if(!geometry.windows.length&&design.adventure?.environment?.indoor){geometry.windows.push({id:'editor-default-window',x:design.width*T/2,y:editor.mapId==='museum'?90:35,w:94,h:66});}
 geometry.windows.forEach((w,i)=>{if(!w.id)w.id='editor-window-'+editor.mapId+'-'+i;});
 return geometry.windows;
}
function windowRef(w){return{kind:'adv-window',id:w.id,name:'Janela',x:w.x/T,y:w.y/T,w:w.w/T,h:w.h/T};}
function windowAt(editor,p){const refs=list(editor).map(windowRef);for(let i=refs.length-1;i>=0;i--){const b=editor.bounds(refs[i]);if(p.x>=b.x-5&&p.x<=b.x+b.w+5&&p.y>=b.y-5&&p.y<=b.y+b.h+5)return refs[i];}return null;}
function clamp(v,min,max){return Math.min(max,Math.max(min,v));}
E.refs=function(){const refs=prev.refs().filter(r=>r.kind!=='adv-window');return refs.concat(list(this).map(windowRef));};
E.bounds=function(ref){if(ref.kind==='adv-window')return{x:ref.x*T,y:ref.y*T,w:ref.w*T,h:ref.h*T};return prev.bounds(ref);};
E.hit=function(p){if(this.tool==='select'){const win=windowAt(this,p);if(win)return win;}return prev.hit(p);};
E.pointerDown=function(e){
 if(this.active&&!this.walk&&!this.drag&&this.tool==='select'&&e.button===0&&!e.altKey&&!V.Input.keys.has(' ')){
  const point=this.worldPoint(e),ref=windowAt(this,point);
  if(ref){e.preventDefault();const canvas=V.$('#editor-canvas');canvas.focus();canvas.setPointerCapture?.(e.pointerId);this.selection={kind:ref.kind,id:ref.id};this.drag={kind:'architectural-window',pointerId:e.pointerId,ref,start:point,x:ref.x,y:ref.y,before:this.capture(),moved:false};this.inspector();this.paint();this.message('Janela selecionada. Arraste para mover, ou ajuste a posição nas propriedades.');return;}
 }
 return prev.down(e);
};
E.pointerMove=function(e){
 const drag=this.drag;
 if(drag?.kind==='architectural-window'){
  if(drag.pointerId!==e.pointerId)return;
  const point=this.worldPoint(e),w=list(this).find(w=>w.id===drag.ref.id);if(!w)return;
  const snap=this.snap*T,round=n=>snap?Math.round(n/snap)*snap:Math.round(n);
  const nx=clamp(round(drag.x*T+point.x-drag.start.x),0,this.preview.width*T-w.w);
  const ny=clamp(round(drag.y*T+point.y-drag.start.y),0,this.preview.height*T-w.h);
  if(w.x!==nx||w.y!==ny){w.x=nx;w.y=ny;drag.moved=true;this.preview=D.preview(this.mapId,this.design());this.image=this.renderWorld();this.paint();}
  const coord=V.$('#editor-coordinates');if(coord)coord.textContent=(w.x/T).toFixed(2)+' · '+(w.y/T).toFixed(2);
  return;
 }
 return prev.move(e);
};
E.pointerUp=function(e){
 if(this.drag?.kind==='architectural-window'){
  if(this.drag.pointerId!==e.pointerId)return;
  const drag=this.drag;this.drag=null;V.$('#editor-canvas').releasePointerCapture?.(e.pointerId);
  if(drag.moved){this.record(drag.before,'Mover janela');this.refresh();}else{this.inspector();this.paint();}
  return;
 }
 return prev.up(e);
};
E.pointerCancel=function(e){if(this.drag?.kind==='architectural-window'){if(this.drag.pointerId!==e.pointerId)return;this.drafts[this.mapId]=this.drag.before;this.drag=null;this.refresh();return;}return prev.cancel(e);};
// Draw an unmistakable bounding box when selected, also when the window is
// above the normal interior floor region (where the original hit test failed).
E.paint=function(){prev.paint();if(!this.active||this.walk||this.selection?.kind!=='adv-window')return;const w=list(this).find(w=>w.id===this.selection.id);if(!w)return;const canvas=V.$('#editor-canvas');if(!canvas)return;const ctx=canvas.getContext('2d');ctx.save();ctx.translate(this.pan.x,this.pan.y);ctx.scale(this.zoom,this.zoom);ctx.setLineDash([6/this.zoom,4/this.zoom]);ctx.lineWidth=3/this.zoom;ctx.strokeStyle='#ffe4a2';ctx.strokeRect(w.x-3/this.zoom,w.y-3/this.zoom,w.w+6/this.zoom,w.h+6/this.zoom);ctx.setLineDash([]);ctx.fillStyle='#ffe4a2';for(const [x,y] of [[w.x,w.y],[w.x+w.w,w.y],[w.x,w.y+w.h],[w.x+w.w,w.y+w.h]])ctx.fillRect(x-4/this.zoom,y-4/this.zoom,8/this.zoom,8/this.zoom);ctx.restore();};
})();
