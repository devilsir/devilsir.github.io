/* Registered module: world-signs */
(function (initialize) {
  if (window.VoicesModules) window.VoicesModules.define("world-signs", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error('Module loader is missing');
  else initialize();
})(function () {
(function(){
'use strict';const V=window.V,W=V.World;
const S=V.WorldSigns={
 lines(c,text,max){const words=String(text||'').replace(/\s+/g,' ').trim().split(' '),lines=[];let line='';for(const word of words){const next=line?line+' '+word:word;if(c.measureText(next).width>max&&line){lines.push(line);line=word;}else line=next;}if(line)lines.push(line);return lines;},
 draw(c,text,x,y,options={}){c.save();const font=options.active?14:13,max=options.maxWidth||230;c.font='600 '+font+'px "VOICES Sans",system-ui,sans-serif';const lines=this.lines(c,text,max-30),width=Math.min(max,Math.max(92,...lines.map(s=>c.measureText(s).width+30))),height=Math.max(34,lines.length*18+18),left=x-width/2,top=y-height/2;c.shadowColor='#173d3030';c.shadowBlur=4;c.shadowOffsetY=3;c.beginPath();if(c.roundRect)c.roundRect(left,top,width,height,6);else c.rect(left,top,width,height);c.fillStyle=options.active?'#375b4a':'#294d40';c.fill();c.shadowBlur=0;c.shadowOffsetY=0;c.strokeStyle=options.active?'#f2d78b':'#c4b17d';c.lineWidth=options.active?2:1.5;c.stroke();c.fillStyle='#f7edd3';c.textAlign='center';c.textBaseline='middle';lines.forEach((line,i)=>c.fillText(line,x,top+height/2+(i-(lines.length-1)/2)*18));c.restore();return{width,height};},
 label(c,text,x,y,active=false){return this.draw(c,text,x,y,{active,maxWidth:260});}
};
V.Architecture.drawSigns=function(c,m,cam){for(const sign of this.geometry(m.design).signs||[])S.draw(c,sign.text,sign.x-cam.x,sign.y-cam.y,{maxWidth:250});};
V.Maritime.label=(c,text,x,y,active=false)=>S.label(c,text,x,y,active);
const draw=V.NatureWorld.draw.bind(V.NatureWorld);V.NatureWorld.draw=function(c,o,cam){if(o.natureLink||o.type==='nature-board'){const x=o.x-cam.x,y=o.y-cam.y;V.SceneShadows.contact(c,x,y+3,23,6,.17);c.save();c.fillStyle='#846743';c.fillRect(x-3,y-48,6,48);c.restore();const name=o.type==='nature-board'?'Patrulha da biodiversidade':V.NatureData.maps.find(m=>m.id===o.to)?.name||V.FastTravel.name(o.to);S.draw(c,name,x,y-55,{maxWidth:220,active:W.nearest?.id===o.id});return true;}return draw(c,o,cam);};
})();

});
