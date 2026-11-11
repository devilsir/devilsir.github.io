/* Registered module: performance */
(function (initialize) {
  if (window.VoicesModules) window.VoicesModules.define("performance", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error('Module loader is missing');
  else initialize();
})(function () {
(function(){
'use strict';
const V=window.V,MiB=1024*1024;
const P=V.Performance={mobile:false,lowMemory:false,fps:60,nextFrame:0,lastFPS:0,slowFrames:0,fastFrames:0,frozen:null,
 detect(){
  const coarse=window.matchMedia?.('(pointer: coarse)').matches||false;
  this.mobile=coarse||(navigator.maxTouchPoints>0&&Math.min(screen.width||innerWidth,screen.height||innerHeight)<1000);
  this.lowMemory=this.mobile&&((navigator.deviceMemory>0&&navigator.deviceMemory<=4)||(navigator.hardwareConcurrency>0&&navigator.hardwareConcurrency<=4));
  this.fps=this.lowMemory?30:60;this.nextFrame=0;this.slowFrames=this.fastFrames=0;this.frozen=null;
  this.canvasPixels=this.mobile?(this.lowMemory?480000:720000):Infinity;
  this.lightingScale=this.mobile?.5:1;this.lightRays=this.mobile?32:80;this.lightLimit=this.mobile?9:22;
  this.weatherDensity=this.mobile?.6:1;this.maxParticles=this.mobile?96:512;
  this.groundBudget=(this.mobile?24:64)*MiB;this.groundCount=this.mobile?2:3;
  this.shadowBudget=(this.mobile?8:32)*MiB;
  document.documentElement.classList.toggle('mobile-performance',this.mobile);
 },
 configure(){
  if(V.AssetLoader)V.AssetLoader.limit=this.mobile?(this.lowMemory?4:6):8;
  if(V.MapAssets)V.MapAssets.groundBudget=this.groundBudget;
  if(V.SceneShadows)V.SceneShadows.budget=this.shadowBudget;
 },
 canvasSize(width,height,duo=false){
  if(!this.mobile)return{width:Math.round(width),height:Math.round(height)};
  const budget=this.canvasPixels/(duo?2:1),scale=Math.min(1,Math.sqrt(budget/(width*height)));
  return{width:Math.max(2,Math.floor(width*scale/2)*2),height:Math.max(2,Math.floor(height*scale/2)*2)};
 },
 accept(stamp){
  if(document.hidden){this.nextFrame=0;this.frozen=null;return false;}
  const fps=V.Game?.screen==='title'?15:this.fps,interval=1000/fps;
  if(fps!==this.lastFPS){this.lastFPS=fps;this.nextFrame=stamp;}
  if(stamp+.1<this.nextFrame)return false;
  const late=Math.max(0,stamp-this.nextFrame);this.nextFrame=stamp+interval-late%interval;return true;
 },
 observe(cost){
  if(!this.mobile||this.lowMemory||V.Game?.screen!=='game'||V.modal||V.Dialogue?.active||V.MapAssets?.busy)return;
  if(this.fps===60){this.slowFrames=cost>18?this.slowFrames+1:Math.max(0,this.slowFrames-2);if(this.slowFrames>=90){this.fps=30;this.slowFrames=0;}}
  else{this.fastFrames=cost<10?this.fastFrames+1:0;if(this.fastFrames>=600){this.fps=60;this.fastFrames=0;}}
 },
 renderAllowed(){
  if(V.Game?.screen!=='game'&&!V.SceneEditor?.active){this.frozen=null;return false;}
  const paused=(V.modal||V.Dialogue?.active)&&V.Game.mode==='explore'&&!V.SceneEditor?.active&&!V.DuoWorld?.enabled()&&!V.ProfessorStudio?.editing;
  if(!paused){this.frozen=null;return true;}
  const c=V.Engine.canvas,m=V.World?.current,old=this.frozen;
  const key={state:V.state,map:m,canvas:c,width:c?.width,height:c?.height,x:V.World?.camera?.x,y:V.World?.camera?.y,ground:m?.cache,assets:V.AssetLoader?.serial,loading:V.AssetLoader?.active,busy:V.MapAssets?.busy};
  this.frozen=key;return !old||Object.keys(key).some(k=>key[k]!==old[k]);
 },
 invalidate(){this.frozen=null;this.nextFrame=0;}
};

// Bounds are calculated in drawing coordinates so atlas previews and the editor
// keep every visible object even when the canvas is zoomed or translated.
V.RenderView={
 bounds(c,cam={x:0,y:0}){
  if(typeof c.getTransform!=='function')return null;
  const t=c.getTransform(),det=t.a*t.d-t.b*t.c;
  if(!Number.isFinite(det)||Math.abs(det)<.000001)return null;
  const points=[[0,0],[c.canvas.width,0],[0,c.canvas.height],[c.canvas.width,c.canvas.height]].map(([x,y])=>({x:(t.d*(x-t.e)-t.c*(y-t.f))/det+(cam.x||0),y:(t.a*(y-t.f)-t.b*(x-t.e))/det+(cam.y||0)}));
  return{left:Math.min(...points.map(p=>p.x)),right:Math.max(...points.map(p=>p.x)),top:Math.min(...points.map(p=>p.y)),bottom:Math.max(...points.map(p=>p.y))};
 },
 visible(o,view){
  if(!view||!Number.isFinite(o.x)||!Number.isFinite(o.y))return true;
  const scale=Math.max(1,Math.abs(o.visualScale||1)),w=Math.max(160,o.w||0,o.width||0,o.size||0,o.editorDecor?.size||0)*scale,h=Math.max(200,o.h||0,o.height||0,o.size||0,o.editorDecor?.size||0)*scale;
  if(o.bounds&&Number.isFinite(o.bounds.x)&&o.bounds.x+o.bounds.w>=view.left&&o.bounds.x<=view.right&&o.bounds.y+o.bounds.h>=view.top&&o.bounds.y<=view.bottom)return true;
  return o.x+w>=view.left&&o.x-w<=view.right&&o.y+h>=view.top&&o.y-h<=view.bottom;
 },
 objects(c,m,cam){const view=this.bounds(c,cam);return m.objects.filter(o=>this.visible(o,view));},
 decor(c,m,cam){const view=this.bounds(c,cam);return m.decor.filter(o=>this.visible(o,view));}
};
P.detect();
document.addEventListener('visibilitychange',()=>{P.invalidate();if(V.Engine)V.Engine.last=0;});
})();

});
