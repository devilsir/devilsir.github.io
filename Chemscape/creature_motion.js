(()=>{
'use strict';
const L=window.CHEMSCAPE_LEVELS;
for(const[id,stride]of Object.entries({deer:52,dog:32,sheep:32,'biome-stag':50,'biome-hen':20,'biome-scorpion':25,'biome-rat':24,'biome-wolf':40,'biome-bison':45})){const m=L.sprites[id];if(!m?.sheet)continue;m.stride=stride;m.sheet.animations.idle=[m.sheet.animations.idle[0]];m.sheet.animations.stand=[m.sheet.animations.idle[0]];m.sheet.fpsByAnimation={...m.sheet.fpsByAnimation,walk:3,run:5,idle:1,stand:1};}
function seed(e){let s=2166136261;for(const ch of String(e.id||e.sprite||'animal'))s=Math.imul(s^ch.charCodeAt(0),16777619);return s>>>0||1;}
function random(m){m.seed=(Math.imul(m.seed,1664525)+1013904223)>>>0;return m.seed/4294967296;}
function rest(e,m,seconds){e.state='idle';m.wait=seconds;m.target=null;m.blocked=0;}
function wander(e,dt,env){
 const m=e.wanderMotion||(e.wanderMotion={seed:seed(e),wait:1+(seed(e)%37)/10,target:null,blocked:0});
 if(m.wait>0){m.wait=Math.max(0,m.wait-dt);e.state='idle';return;}
 if(!m.target){const b=env.bounds||[0,0,20000,20000];for(let i=0;i<5;i++){const angle=random(m)*Math.PI*2,radius=28+random(m)*60,x=Math.max(b[0]+16,Math.min(b[0]+b[2]-16,e.homeX+Math.cos(angle)*radius)),y=Math.max(b[1]+16,Math.min(b[1]+b[3]-16,e.homeY+Math.sin(angle)*radius));if(!env.blocked?.(x,y)){m.target=[x,y];break;}}if(!m.target){rest(e,m,2+random(m)*3);return;}}
 const dx=m.target[0]-e.x,dy=m.target[1]-e.y,d=Math.hypot(dx,dy),speed=Math.max(8,Math.min(env.speed||26,30)),step=Math.min(d,speed*dt);
 if(d<3){rest(e,m,2.5+random(m)*5);return;}
 const x=e.x,y=e.y;env.move(dx/d*step,dy/d*step);const moved=Math.hypot(e.x-x,e.y-y);
 if(moved>.01){e.walkDistance=(e.walkDistance||0)+moved;e.state='run';m.blocked=0;if(Math.abs(dx)>4&&Math.abs(dx)/d>.22)e.face=dx<0?-1:1;}else{e.state='idle';m.blocked+=dt;if(m.blocked>.3)rest(e,m,1.5+random(m)*2);}
}
function frame(o,m,action,frames,fps,clock,preview=false){if(!frames.length)return 0;if(!preview&&m.stride&&/^(walk|run)$/.test(action)&&Number.isFinite(o.walkDistance))return frames[Math.floor(o.walkDistance/m.stride*frames.length)%frames.length];return frames[action==='death'?Math.min(frames.length-1,Math.floor(clock*fps)):Math.floor(clock*fps)%frames.length];}
window.CHEMSCAPE_MOTION={wander,frame};
})();
