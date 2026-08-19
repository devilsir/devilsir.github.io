(function(){
const clubOverlay=document.getElementById("clubOverlay");
const lightField=document.getElementById("lightField");
const discoBallCanvas=document.getElementById("discoBallCanvas");
let lightDotsReady=false;
let discoBallAnimationStarted=false;
let discoBallStartTime=0;
let cachedCanvasSize=0;
let lastDiscoDrawTime=0;
let discoFrameId=0;
let pageIsVisible=!document.hidden;
function fitCanvas(force){
  const rect=discoBallCanvas.getBoundingClientRect();
  const ratio=Math.min(window.devicePixelRatio||1,2);
  const size=Math.max(120,Math.round(Math.min(rect.width||198,rect.height||198)*ratio));
  if(force||cachedCanvasSize!==size){
    cachedCanvasSize=size;
    discoBallCanvas.width=size;
    discoBallCanvas.height=size;
    return true;
  }
  return false;
}
function drawDiscoBallFrame(shift){
  if(!discoBallCanvas)return;
  const ctx=discoBallCanvas.getContext("2d");
  const w=discoBallCanvas.width;
  const h=discoBallCanvas.height;
  const cx=w/2;
  const cy=h/2;
  const r=Math.min(w,h)*.465;
  ctx.globalCompositeOperation="source-over";
  ctx.clearRect(0,0,w,h);
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx,cy,r+2,0,Math.PI*2);
  ctx.clip();
  const bg=ctx.createRadialGradient(cx-r*.258,cy-r*.28,r*.086,cx,cy,r);
  bg.addColorStop(0,"#fbfbfd");
  bg.addColorStop(.25,"#c9ccd3");
  bg.addColorStop(.5,"#6f7278");
  bg.addColorStop(.76,"#191a1f");
  bg.addColorStop(1,"#050507");
  ctx.fillStyle=bg;
  ctx.fillRect(cx-r-6,cy-r-6,r*2+12,r*2+12);
  const rows=13;
  const gap=Math.max(1,r*.011);
  const offsetPx=shift*r*.183;
  for(let row=0;row<rows;row++){
    const y0=-r+(row/rows)*r*2;
    const y1=-r+((row+1)/rows)*r*2;
    const ym=(y0+y1)*.5;
    const rowHalf=Math.sqrt(Math.max(0,r*r-ym*ym));
    const tileH=Math.max(8,(y1-y0)-gap);
    const tileW=r*.172;
    const pitch=tileW+gap;
    const startX=-rowHalf-pitch*3+(offsetPx%pitch);
    const endX=rowHalf+pitch*3;
    for(let x=startX;x<endX;x+=pitch){
      const x0=Math.max(-rowHalf,x);
      const x1=Math.min(rowHalf,x+tileW);
      if(x1<=x0)continue;
      const mx=(x0+x1)*.5;
      const nx=mx/r;
      const ny=ym/r;
      const nz=Math.sqrt(Math.max(0,1-nx*nx-ny*ny));
      const base=38+nz*118;
      const highlightA=Math.pow(Math.max(0,1-Math.abs(nx+.58)*4.2-Math.abs(ny+.10)*1.8),4);
      const highlightB=Math.pow(Math.max(0,1-Math.abs(nx-.02)*5-Math.abs(ny-.98)*5.4),4);
      const tint=(Math.sin((mx+offsetPx)*.045)+1)*.5;
      const rr=Math.min(255,base+highlightA*120+tint*12);
      const gg=Math.min(255,base+highlightA*110+tint*8);
      const bb=Math.min(255,base+highlightA*130+18);
      const sy=cy+y0+gap*.5;
      const sx=cx+x0;
      const sw=Math.max(1,x1-x0);
      ctx.beginPath();
      ctx.rect(sx,sy,sw,Math.max(1,tileH));
      ctx.fillStyle=`rgb(${rr|0},${gg|0},${bb|0})`;
      ctx.fill();
      ctx.strokeStyle=`rgba(245,245,248,${.14+nz*.26})`;
      ctx.lineWidth=Math.max(.7,r*.0048);
      ctx.stroke();
      const shine=Math.max(highlightA*.9,highlightB*.85);
      if(shine>.03){
        ctx.fillStyle=`rgba(255,255,255,${Math.min(.78,shine*.75)})`;
        ctx.fill();
      }
    }
  }
  ctx.globalCompositeOperation="screen";
  const leftFlash=ctx.createRadialGradient(cx-r*.538,cy-r*.301,0,cx-r*.538,cy-r*.301,r*.312);
  leftFlash.addColorStop(0,"rgba(255,255,255,1)");
  leftFlash.addColorStop(.18,"rgba(255,255,255,.78)");
  leftFlash.addColorStop(.5,"rgba(255,255,255,.22)");
  leftFlash.addColorStop(1,"rgba(255,255,255,0)");
  ctx.fillStyle=leftFlash;
  ctx.beginPath();
  ctx.arc(cx-r*.538,cy-r*.301,r*.312,0,Math.PI*2);
  ctx.fill();
  const bottomFlash=ctx.createRadialGradient(cx+r*.022,cy+r*.677,0,cx+r*.022,cy+r*.677,r*.237);
  bottomFlash.addColorStop(0,"rgba(255,255,255,.82)");
  bottomFlash.addColorStop(.42,"rgba(255,255,255,.24)");
  bottomFlash.addColorStop(1,"rgba(255,255,255,0)");
  ctx.fillStyle=bottomFlash;
  ctx.beginPath();
  ctx.arc(cx+r*.022,cy+r*.677,r*.237,0,Math.PI*2);
  ctx.fill();
  ctx.globalCompositeOperation="source-over";
  const vignette=ctx.createRadialGradient(cx,cy,r*.34,cx,cy,r+4);
  vignette.addColorStop(0,"rgba(0,0,0,0)");
  vignette.addColorStop(.7,"rgba(0,0,0,.05)");
  vignette.addColorStop(1,"rgba(0,0,0,.5)");
  ctx.fillStyle=vignette;
  ctx.beginPath();
  ctx.arc(cx,cy,r+4,0,Math.PI*2);
  ctx.fill();
  ctx.restore();
  ctx.beginPath();
  ctx.arc(cx,cy,r+1,0,Math.PI*2);
  ctx.strokeStyle="rgba(255,255,255,.2)";
  ctx.lineWidth=Math.max(1,r*.006);
  ctx.stroke();
}
function startDiscoBallCanvas(){
  if(discoBallAnimationStarted)return;
  discoBallAnimationStarted=true;
  discoBallStartTime=0;
  fitCanvas(true);
  const cycleMs=420;
  const loop=time=>{
    if(!pageIsVisible){
      discoFrameId=0;
      return;
    }
    if(!discoBallStartTime)discoBallStartTime=time;
    if(time-lastDiscoDrawTime>=33){
      lastDiscoDrawTime=time;
      const elapsed=time-discoBallStartTime;
      const shift=(elapsed%cycleMs)/cycleMs;
      drawDiscoBallFrame(shift);
    }
    discoFrameId=requestAnimationFrame(loop);
  };
  discoFrameId=requestAnimationFrame(loop);
}
function resumeDiscoBallCanvas(){
  if(pageIsVisible && discoBallAnimationStarted && !discoFrameId){
    lastDiscoDrawTime=0;
    discoFrameId=requestAnimationFrame(time=>{
      discoFrameId=0;
      discoBallAnimationStarted=false;
      startDiscoBallCanvas();
    });
  }
}
function createPartyLights(){
  if(lightDotsReady)return;
  lightDotsReady=true;
  const palette=["#59d7ff","#ff4fd8","#ffd84d","#8e6bff","#53ffb2","#ffffff","#ff7a42"];
  const count=44;
  for(let i=0;i<count;i++){
    const dot=document.createElement("span");
    dot.className="light-dot";
    const size=8+Math.random()*20;
    dot.style.width=`${size}px`;
    dot.style.height=`${size}px`;
    dot.style.left=`${Math.random()*100}%`;
    dot.style.top=`${18+Math.random()*72}%`;
    dot.style.color=palette[i%palette.length];
    dot.style.animationDelay=`${(Math.random()*1.5).toFixed(2)}s`;
    dot.style.animationDuration=`${(1.3+Math.random()*1.6).toFixed(2)}s`;
    dot.style.setProperty("--dx",`${(-120+Math.random()*240).toFixed(0)}px`);
    dot.style.setProperty("--dy",`${(-90+Math.random()*180).toFixed(0)}px`);
    lightField.appendChild(dot);
  }
}
function startWidget(){
  startDiscoBallCanvas();
  createPartyLights();
  clubOverlay.classList.remove("show");
  void clubOverlay.offsetWidth;
  clubOverlay.classList.add("show");
}
window.addEventListener("resize",()=>fitCanvas(true),{passive:true});
document.addEventListener("visibilitychange",()=>{
  pageIsVisible=!document.hidden;
  if(pageIsVisible)resumeDiscoBallCanvas();
});

if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",startWidget)}else{startWidget()}
})();
