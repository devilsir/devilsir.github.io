(function(){
'use strict';
const V=window.V;
for(const id of ['nia','leo','taina','sol','librarian','zambeto'])V.AdventureArt['actions-'+id]='assets/city/'+id+'-actions.png';
for(const id of ['courtyard','studio','gallery','lab','city'])V.AdventureArt['battle-'+id]='assets/city/battle-'+id+'.png';
V.AdventureArt['combat-fx']='assets/city/combat-fx.webp';V.AdventureArt['home-appliances']='assets/city/home-appliances.webp';
const A=V.Animations={
clips:{idle:0,ready:1,attack:2,cast:3,guard:4,heal:5},guardian:{idle:0,walk:1,dance:2,spin:3,guard:4,cast:5,heal:6},
frame(id,action,time=0,loop=!['attack','guard','cast','heal'].includes(action)){
 const row=(id==='zambeto'?this.guardian:this.clips)[action]??0,tick=Math.floor(Math.max(0,time)*(action==='idle'?3.2:action==='ready'?5:10));
 return {row,index:V.settings.reducedMotion?0:loop?tick%8:Math.min(7,tick)};
},
draw(ctx,id,action,x,y,size=96,time=V.Engine.time,flip=false,fit=false,loop){const key='actions-'+id,img=V.Assets.images[key];if(!img)return false;const f=this.frame(id,action,time,loop);return V.SpriteFrames.draw(ctx,img,key,f.row,f.index,x,y,size,flip,fit);},
fx(ctx,row,x,y,size,time){const img=V.Assets.images['combat-fx'];if(!img)return;const f=V.settings.reducedMotion?4:Math.min(7,Math.floor(Math.max(0,time)*10));ctx.save();ctx.globalAlpha=V.settings.reducedMotion?.5:1;ctx.drawImage(img,f*160,row*160,160,160,x-size/2,y-size/2,size,size);ctx.restore();}
};
const render=V.Player.render.bind(V.Player);V.Player.render=function(ctx){const p=this.data;if(!p||p.moving||p.seated)return render(ctx);const x=p.x-V.World.camera.x,y=p.y-V.World.camera.y;ctx.fillStyle='#172c2848';ctx.beginPath();ctx.ellipse(x,y+4,17,5,0,0,Math.PI*2);ctx.fill();if(!A.draw(ctx,V.state.character,p.celebrateTime?'heal':p.actionTime?'cast':'idle',x,y+5,64,p.celebrateTime?Math.max(0,2-p.celebrateTime):p.actionTime?Math.max(0,.8-p.actionTime):V.Engine.time,p.dir===1))render(ctx);};
const draw=V.Story.draw.bind(V.Story);V.Story.draw=function(ctx,o,cam){if(o.type!=='zambeto')return draw(ctx,o,cam);if(!this.visible(o))return true;const x=o.x-cam.x,y=o.y-cam.y,action=o.animationUntil>V.Engine.time?o.animation:o.walking?'walk':this.pulseTime>0?'cast':'idle';ctx.save();if(o.vanishTime>0)ctx.globalAlpha=Math.min(1,o.vanishTime/.4);if(o.appearTime>0)ctx.globalAlpha=Math.min(1,1-o.appearTime/.8);ctx.fillStyle='#15262a44';ctx.beginPath();ctx.ellipse(x,y+4,36,10,0,0,Math.PI*2);ctx.fill();A.draw(ctx,'zambeto',action,x,y+10,150,V.Engine.time-(o.animationStart||0),o.dir===1);if(V.World.nearest?.id===o.id)V.Living.marker(ctx,x,y-139,'E','#e8cc82');ctx.restore();return true;};
V.Story.perform=function(action){const o=V.World.current.objects.find(o=>o.type==='zambeto'&&o.companion);if(!o)return;o.animation=action;o.animationStart=V.Engine.time;o.animationUntil=V.Engine.time+3.2;V.UI.close();V.Audio.sfx('observe');};
const guide=V.Story.guide.bind(V.Story);V.Story.guide=function(){guide();const root=V.$('.modal-footer');if(root){const div=document.createElement('div');div.className='row';div.innerHTML='<button id="guardian-dance" class="secondary">Dançar</button><button id="guardian-spin" class="secondary">Rodopiar</button>';root.prepend(div);V.$('#guardian-dance').onclick=()=>this.perform('dance');V.$('#guardian-spin').onclick=()=>this.perform('spin');}};
})();
