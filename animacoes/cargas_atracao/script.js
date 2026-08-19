// ======= Utilitários =======
const ARENA_W = 900, ARENA_H = 540, K = 1200;
const DIP_FACTOR = 1.35; // reforço na interação com dipolos induzidos
const COLORS = { pos:"#ef4444", neg:"#3b82f6", target:"#f59e0b", force:"#22c55e", neutral:"#e5e7eb" };
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const dist2=(a,b)=>(a.x-b.x)**2+(a.y-b.y)**2;
const distance=(a,b)=>Math.sqrt(dist2(a,b));
let uid=0; const newid=()=>++uid;
const TRIBO_SERIES=["Vidro","Pele","Seda","Madeira","Lã","Âmbar","Poliestireno","Teflon"];
const TRIBO_INDEX=Object.fromEntries(TRIBO_SERIES.map((m,i)=>[m,i]));
function forceBetween(q1,x1,y1,q2,x2,y2){ const dx=x1-x2, dy=y1-y2; const r2=Math.max(100,dx*dx+dy*dy), r=Math.sqrt(r2); const f=(K*q1*q2)/r2; return {fx:f*(dx/r), fy:f*(dy/r)}; }
function eFieldAt(x,y,sources){ let Ex=0,Ey=0; for(const s of sources){ const dx=x-s.x, dy=y-s.y; const r2=Math.max(100,dx*dx+dy*dy), r=Math.sqrt(r2); const e=(K*s.q)/r2; Ex+=e*(dx/r); Ey+=e*(dy/r);} return {Ex,Ey}; }

// ======= Aprender (com dinâmica, atrito e dipolo-dipolo) =======
const A = {
  canvas:null, ctx:null, playing:false, last:0, speed:1, showForce:true, showInduction:true,
  dynamicCharges:true, dipoleInteract:true, frictionMode:true, Ethreshold:0.02,
  test:{x:140,y:ARENA_H/2,vx:0,vy:0,q:+1},
  charges:[], neutrals:[], target:{x:ARENA_W-80,y:ARENA_H/2}, drag:null
};
function A_addCharge(q){ A.charges.push({id:newid(),x:140+Math.random()*(ARENA_W-280),y:100+Math.random()*(ARENA_H-200),q, vx:0,vy:0}); }
function A_addNeutral(material="Vidro"){ A.neutrals.push({id:newid(),x:ARENA_W/2,y:ARENA_H/2-60,vx:0,vy:0,r:18,d:36,alpha:0.02,qmax:2.2,q_static:0,q_static_max:3.0,material,qind:0,dipUx:1,dipUy:0}); }
function A_reset(){ A.test={x:140,y:ARENA_H/2,vx:0,vy:0,q:+1}; A.charges=[{id:newid(),x:ARENA_W/2-110,y:ARENA_H/2,q:+1,vx:0,vy:0},{id:newid(),x:ARENA_W/2+110,y:ARENA_H/2,q:-1,vx:0,vy:0}]; A.neutrals=[{id:newid(),x:ARENA_W/2,y:ARENA_H/2-80,vx:0,vy:0,r:18,d:36,alpha:0.02,qmax:2.2,q_static:0,q_static_max:3.0,material:"Vidro",qind:0,dipUx:1,dipUy:0},{id:newid(),x:ARENA_W/2-160,y:ARENA_H/2+40,vx:0,vy:0,r:18,d:36,alpha:0.02,qmax:2.2,q_static:0,q_static_max:3.0,material:"Teflon",qind:0,dipUx:1,dipUy:0}]; }
function A_sourcesReal(){ return [...A.charges.map(c=>({x:c.x,y:c.y,q:c.q})), ...A.neutrals.filter(n=>Math.abs(n.q_static)>1e-4).map(n=>({x:n.x,y:n.y,q:n.q_static}))]; }
function A_update(dt){
  const real=A_sourcesReal();
  for(const n of A.neutrals){ const {Ex,Ey}=eFieldAt(n.x,n.y, real); const Emag=Math.hypot(Ex,Ey); if(Emag>=A.Ethreshold){ n.qind=Math.min(n.alpha*Emag,n.qmax); n.dipUx=Emag>0?Ex/Emag:1; n.dipUy=Emag>0?Ey/Emag:0; } else { n.qind=0; } }
  if(A.playing){
    // mover q
    let fx=0,fy=0; for(const s of real){ const F=forceBetween(A.test.q,A.test.x,A.test.y,s.q,s.x,s.y); fx+=F.fx; fy+=F.fy; }
    if(A.showInduction){ for(const n of A.neutrals){ if(n.qind>1e-5){ const dx=(n.d/2)*n.dipUx, dy=(n.d/2)*n.dipUy; const plus={x:n.x+dx,y:n.y+dy,q:+n.qind}, minus={x:n.x-dx,y:n.y-dy,q:-n.qind}; const Fp=forceBetween(A.test.q,A.test.x,A.test.y,plus.q,plus.x,plus.y); const Fm=forceBetween(A.test.q,A.test.x,A.test.y,minus.q,minus.x,minus.y); fx+=DIP_FACTOR*(Fp.fx+Fm.fx); fy+=DIP_FACTOR*(Fp.fy+Fm.fy); } } }
    const damping=0.985; A.test.vx=(A.test.vx+fx*dt)*damping; A.test.vy=(A.test.vy+fy*dt)*damping;
    A.test.x=clamp(A.test.x+A.test.vx,12,ARENA_W-12); A.test.y=clamp(A.test.y+A.test.vy,12,ARENA_H-12);
    if(A.test.x<=12||A.test.x>=ARENA_W-12) A.test.vx*=-0.5; if(A.test.y<=12||A.test.y>=ARENA_H-12) A.test.vy*=-0.5;

    // cargas dinâmicas
    if(A.dynamicCharges){
      for(const c of A.charges){
        let cfx=0, cfy=0;
        for(const o of A.charges){ if(o!==c){ const F=forceBetween(c.q,c.x,c.y,o.q,o.x,o.y); cfx+=F.fx; cfy+=F.fy; } }
        const Ft=forceBetween(c.q,c.x,c.y,A.test.q,A.test.x,A.test.y); cfx+=Ft.fx; cfy+=Ft.fy;
        const mass=2.0,damping=0.985;
        c.vx=((c.vx||0)+(cfx/mass)*dt)*damping; c.vy=((c.vy||0)+(cfy/mass)*dt)*damping;
        c.x=clamp(c.x+c.vx,16,ARENA_W-16); c.y=clamp(c.y+c.vy,16,ARENA_H-16);
        if(c.x<=16||c.x>=ARENA_W-16) c.vx*=-0.5; if(c.y<=16||c.y>=ARENA_H-16) c.vy*=-0.5;
      }
    }

    // neutros dinâmicos + dipolo-dipolo + atrito
    const dips=A.neutrals.map(n=>{
      const active=n.qind>1e-5; const dx=(n.d/2)*n.dipUx, dy=(n.d/2)*n.dipUy;
      return {n,active, q:n.qind||0, plus:{x:n.x+dx,y:n.y+dy}, minus:{x:n.x-dx,y:n.y-dy}};
    });
    for(const n of A.neutrals){
      let nfx=0, nfy=0;
      for(const s of real){ const F=forceBetween(+1,n.x,n.y,s.q,s.x,s.y); nfx+=F.fx; nfy+=F.fy; }
      if(Math.abs(n.q_static)>1e-5){ for(const s of real){ const F=forceBetween(n.q_static,n.x,n.y,s.q,s.x,s.y); nfx+=F.fx; nfy+=F.fy; } }
      if(A.dipoleInteract){
        const di=dips.find(d=>d.n===n); if(di && di.active){
          for(const dj of dips){ if(dj===di||!dj.active) continue;
            const qi=di.q,qj=dj.q;
            const Fpp=forceBetween(+qi,di.plus.x,di.plus.y,+qj,dj.plus.x,dj.plus.y);
            const Fpm=forceBetween(+qi,di.plus.x,di.plus.y,-qj,dj.minus.x,dj.minus.y);
            const Fmp=forceBetween(-qi,di.minus.x,di.minus.y,+qj,dj.plus.x,dj.plus.y);
            const Fmm=forceBetween(-qi,di.minus.x,di.minus.y,-qj,dj.minus.x,dj.minus.y);
            nfx+=DIP_FACTOR*(Fpp.fx+Fpm.fx+Fmp.fx+Fmm.fx);
            nfy+=DIP_FACTOR*(Fpp.fy+Fpm.fy+Fmp.fy+Fmm.fy);
          }
        }
      }
      const mass=3.5,damping=0.985;
      n.vx=((n.vx||0)+(nfx/mass)*dt)*damping; n.vy=((n.vy||0)+(nfy/mass)*dt)*damping;
      n.x=clamp(n.x+n.vx,n.r,ARENA_W-n.r); n.y=clamp(n.y+n.vy,n.r,ARENA_H-n.r);
      if(n.x<=n.r||n.x>=ARENA_W-n.r) n.vx*=-0.4; if(n.y<=n.r||n.y>=ARENA_H-n.r) n.vy*=-0.4;
    }
    if(A.frictionMode){
      for(let i=0;i<A.neutrals.length;i++){
        for(let j=i+1;j<A.neutrals.length;j++){
          const ni=A.neutrals[i], nj=A.neutrals[j];
          const touching = distance(ni,nj) < (ni.r+nj.r+1);
          if(touching){
            const ri=TRIBO_INDEX[ni.material]??0, rj=TRIBO_INDEX[nj.material]??0;
            if(ri!==rj){
              const donor = ri<rj ? ni : nj; const receiver = ri<rj ? nj : ni;
              const dq=0.05;
              donor.q_static = Math.max(-donor.q_static_max, Math.min(donor.q_static_max,(donor.q_static||0)+dq));
              receiver.q_static = Math.max(-receiver.q_static_max, Math.min(receiver.q_static_max,(receiver.q_static||0)-dq));
            }
          }
        }
      }
    }
  }
}
function A_draw(){
  const ctx=A.ctx; ctx.clearRect(0,0,ARENA_W,ARENA_H);
  ctx.save(); ctx.globalAlpha=0.2; ctx.strokeStyle="rgba(255,255,255,0.15)"; ctx.lineWidth=1;
  for(let x=0;x<=ARENA_W;x+=40){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,ARENA_H); ctx.stroke(); }
  for(let y=0;y<=ARENA_H;y+=40){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(ARENA_W,y); ctx.stroke(); }
  ctx.restore();
  ctx.fillStyle=COLORS.target; ctx.beginPath(); ctx.arc(A.target.x,A.target.y,14,0,Math.PI*2); ctx.fill();
  ctx.fillStyle="#111"; ctx.font="700 12px system-ui"; ctx.textAlign="center"; ctx.fillText("★",A.target.x,A.target.y+4);
  if(A.showForce){
    let fx=0,fy=0; const real=A_sourcesReal();
    for(const s of real){ const F=forceBetween(A.test.q,A.test.x,A.test.y,s.q,s.x,s.y); fx+=F.fx; fy+=F.fy; }
    if(A.showInduction){ for(const n of A.neutrals){ if(n.qind>1e-5){ const dx=(n.d/2)*n.dipUx, dy=(n.d/2)*n.dipUy; const plus={x:n.x+dx,y:n.y+dy,q:+n.qind}, minus={x:n.x-dx,y:n.y-dy,q:-n.qind}; const Fp=forceBetween(A.test.q,A.test.x,A.test.y,plus.q,plus.x,plus.y); const Fm=forceBetween(A.test.q,A.test.x,A.test.y,minus.q,minus.x,minus.y); fx+=DIP_FACTOR*(Fp.fx+Fm.fx); fy+=DIP_FACTOR*(Fp.fy+Fm.fy); } } }
    ctx.strokeStyle=COLORS.force; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(A.test.x,A.test.y); ctx.lineTo(A.test.x+clamp(fx*6,-100,100), A.test.y+clamp(fy*6,-100,100)); ctx.stroke();
  }
  for(const c of A.charges){ ctx.fillStyle = c.q>0?COLORS.pos:COLORS.neg; ctx.strokeStyle="#fff"; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(c.x,c.y,16,0,Math.PI*2); ctx.fill(); ctx.stroke(); ctx.fillStyle="#fff"; ctx.font="800 16px system-ui"; ctx.textAlign="center"; ctx.fillText(c.q>0?"+":"−", c.x, c.y+5); }
  for(const n of A.neutrals){ ctx.fillStyle=COLORS.neutral; ctx.strokeStyle="#fff"; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,Math.PI*2); ctx.fill(); ctx.stroke();
    if(A.showInduction && n.qind>1e-5){ const ux=n.dipUx, uy=n.dipUy; const dx=(n.d/2)*ux, dy=(n.d/2)*uy; const plus={x:n.x+dx,y:n.y+dy}, minus={x:n.x-dx,y:n.y-dy};
      ctx.strokeStyle="#111827"; ctx.globalAlpha=0.6; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(minus.x,minus.y); ctx.lineTo(plus.x,plus.y); ctx.stroke(); ctx.globalAlpha=1;
      ctx.fillStyle=COLORS.pos; ctx.strokeStyle="#fff"; ctx.lineWidth=1.5; ctx.beginPath(); ctx.arc(plus.x,plus.y,7,0,Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.fillStyle="#fff"; ctx.font="800 10px system-ui"; ctx.textAlign="center"; ctx.fillText("+", plus.x, plus.y+3);
      ctx.fillStyle=COLORS.neg; ctx.strokeStyle="#fff"; ctx.lineWidth=1.5; ctx.beginPath(); ctx.arc(minus.x,minus.y,7,0,Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.fillStyle="#fff"; ctx.font="800 10px system-ui"; ctx.textAlign="center"; ctx.fillText("−", minus.x, minus.y+3);
    }
  }
  ctx.fillStyle="#10b981"; ctx.strokeStyle="#fff"; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(A.test.x,A.test.y,12,0,Math.PI*2); ctx.fill(); ctx.stroke(); ctx.fillStyle="#083344"; ctx.font="800 12px system-ui"; ctx.textAlign="center"; ctx.fillText(A.test.q>0?"q+":"q−", A.test.x, A.test.y+4);
  ctx.strokeStyle="rgba(255,255,255,0.15)"; ctx.lineWidth=1; ctx.strokeRect(4,4,ARENA_W-8,ARENA_H-8);
}
function A_tick(now){ if(!A.last) A.last=now; const dt=clamp(((now-A.last)/1000)*A.speed,0,0.05); A.last=now; if(A.playing) A_update(dt); A_draw(); requestAnimationFrame(A_tick); }
function A_hitTest(x,y){ for(let i=A.charges.length-1;i>=0;i--){ const c=A.charges[i]; if(distance({x,y},c)<18) return {type:'charge',id:c.id}; } for(let i=A.neutrals.length-1;i>=0;i--){ const n=A.neutrals[i]; if(distance({x,y},n)<n.r+2) return {type:'neutral',id:n.id}; } if(distance({x,y},A.test)<14) return {type:'test'}; return null; }
function A_pointerDown(e){ const rect=A.canvas.getBoundingClientRect(); const x=(e.clientX-rect.left)/rect.width*ARENA_W; const y=(e.clientY-rect.top)/rect.height*ARENA_H; const pick=A_hitTest(x,y); if(!pick) return; A.drag=pick; }
function A_pointerMove(e){ if(!A.drag) return; const rect=A.canvas.getBoundingClientRect(); const x=clamp((e.clientX-rect.left)/rect.width*ARENA_W,0,ARENA_W); const y=clamp((e.clientY-rect.top)/rect.height*ARENA_H,0,ARENA_H); if(A.drag.type==='test'){ A.test.x=clamp(x,12,ARENA_W-12); A.test.y=clamp(y,12,ARENA_H-12); A.test.vx=0; A.test.vy=0; } else if(A.drag.type==='charge'){ const c=A.charges.find(c=>c.id===A.drag.id); if(c){ c.x=clamp(x,16,ARENA_W-16); c.y=clamp(y,16,ARENA_H-16); c.vx=0; c.vy=0; } } else if(A.drag.type==='neutral'){ const n=A.neutrals.find(n=>n.id===A.drag.id); if(n){ n.x=clamp(x,n.r,ARENA_W-n.r); n.y=clamp(y,n.r,ARENA_H-n.r); n.vx=0; n.vy=0; } } }
function A_pointerUp(){ A.drag=null; }

// ======= Desafios (5 níveis, mais difíceis + dipolos mais fortes) =======
const D = {
  canvas:null, ctx:null, playing:false, last:0, level:1, showForce:true,
  charges:[], neutrals:[], test:{x:140,y:ARENA_H/2,vx:0,vy:0,q:+1}, target:{x:ARENA_W-100,y:ARENA_H/2}, drag:null,
  cfg:null, Ethreshold:0.02
};
// eth: limiar menor => obstáculos polarizam mais fácil; harder coloca alvos em cantos e mais obstáculos
const D_LEVELS=[
  {maxCharges:1, allowed:'both', induction:false, eth:0.02, neutrals:[], target:{x:ARENA_W-120,y:ARENA_H/2}, testStart:{x:140,y:ARENA_H/2}, hint:'Use 1 carga para empurrar/atrair q até a estrela.'},
  {maxCharges:2, allowed:'both', induction:false, eth:0.02, neutrals:[], target:{x:ARENA_W-140,y:100}, testStart:{x:ARENA_W/2,y:ARENA_H-80}, hint:'Agora 2 cargas. Combine forças e aproveite as paredes.'},
  {maxCharges:2, allowed:'both', induction:true,  eth:0.018, neutrals:[{x:ARENA_W/2-40,y:ARENA_H/2-20,r:20,d:40,alpha:0.02,qmax:2.0},{x:ARENA_W/2+70,y:ARENA_H/2+10,r:20,d:40,alpha:0.02,qmax:2.0}], target:{x:ARENA_W-150,y:ARENA_H-110}, testStart:{x:120,y:120}, hint:'Dois obstáculos polarizáveis deslocados: evite ficar “preso” entre os dipolos.'},
  {maxCharges:2, allowed:'pos',  induction:true,  eth:0.016, neutrals:[{x:ARENA_W/2-140,y:ARENA_H/2,r:20,d:40,alpha:0.02,qmax:2.2},{x:ARENA_W/2+40,y:ARENA_H/2-80,r:20,d:40,alpha:0.02,qmax:2.2},{x:ARENA_W/2+120,y:ARENA_H/2+60,r:20,d:40,alpha:0.02,qmax:2.2}], target:{x:ARENA_W-160,y:ARENA_H/2-40}, testStart:{x:140,y:ARENA_H-100}, hint:'Somente positivas (+). Três dipolos exigem rota em zigue-zague.'},
  {maxCharges:2, allowed:'neg',  induction:true,  eth:0.014, neutrals:[{x:ARENA_W/2-100,y:ARENA_H/2-120,r:20,d:40,alpha:0.02,qmax:2.4},{x:ARENA_W/2-160,y:ARENA_H/2+40,r:20,d:40,alpha:0.02,qmax:2.4},{x:ARENA_W/2+120,y:ARENA_H/2-10,r:20,d:40,alpha:0.02,qmax:2.4},{x:ARENA_W/2+10,y:ARENA_H/2+110,r:20,d:40,alpha:0.02,qmax:2.4}], target:{x:ARENA_W-120,y:80}, testStart:{x:110,y:ARENA_H-100}, hint:'Somente negativas (−) e quatro dipolos — os “puxões” ficaram mais intensos.'}
];
function D_resetToConfig(){
  D.charges=[];
  D.neutrals = (D.cfg.neutrals||[]).map(n=>({id:newid(),vx:0,vy:0,q_static:0,qind:0,dipUx:1,dipUy:0,...n}));
  D.target={...D.cfg.target};
  D.test={x:D.cfg.testStart.x,y:D.cfg.testStart.y,vx:0,vy:0,q:+1};
  updateConstraintsUI();
  document.getElementById('d-hint').textContent = D.cfg.hint || '';
}
function D_setLevel(n){
  D.level=n; D.cfg = D_LEVELS[n-1]; document.getElementById('pill-nivel').textContent='Nível: '+n;
  D.playing=false; D.last=0; D_resetToConfig();
}
function updateConstraintsUI(){
  document.getElementById('d-max').textContent = D.cfg.maxCharges;
  document.getElementById('d-sign').textContent = D.cfg.allowed==='pos'?'+':(D.cfg.allowed==='neg'?'−':'±');
  document.getElementById('btn-d-add-plus').disabled = (D.cfg.allowed==='neg');
  document.getElementById('btn-d-add-minus').disabled = (D.cfg.allowed==='pos');
}
function D_addCharge(q){
  if(D.charges.length>=D.cfg.maxCharges) return;
  if(D.cfg.allowed==='pos' && q<0) return;
  if(D.cfg.allowed==='neg' && q>0) return;
  D.charges.push({id:newid(),x:ARENA_W/2,y:ARENA_H/2,q, vx:0,vy:0});
}
function D_sourcesReal(){ return [...D.charges.map(c=>({x:c.x,y:c.y,q:c.q})), {x:D.test.x,y:D.test.y,q:D.test.q}]; }
function D_update(dt){
  if(!D.playing) return;
  if(D.cfg.induction){
    const real = D_sourcesReal();
    for(const n of D.neutrals){
      const {Ex,Ey}=eFieldAt(n.x,n.y, real);
      const Emag=Math.hypot(Ex,Ey);
      const Eth = D.cfg.eth ?? D.Ethreshold;
      if(Emag>=Eth){
        n.qind=Math.min(n.alpha*Emag,n.qmax);
        n.dipUx=Emag>0?Ex/Emag:1; n.dipUy=Emag>0?Ey/Emag:0;
      } else { n.qind=0; }
    }
  }
  let fx=0, fy=0;
  for(const c of D.charges){ const F=forceBetween(D.test.q,D.test.x,D.test.y,c.q,c.x,c.y); fx+=F.fx; fy+=F.fy; }
  if(D.cfg.induction){
    for(const n of D.neutrals){
      if(n.qind>1e-5){
        const dx=(n.d/2)*n.dipUx, dy=(n.d/2)*n.dipUy;
        const plus={x:n.x+dx,y:n.y+dy,q:+n.qind}, minus={x:n.x-dx,y:n.y-dy,q:-n.qind};
        const Fp=forceBetween(D.test.q,D.test.x,D.test.y,plus.q,plus.x,plus.y);
        const Fm=forceBetween(D.test.q,D.test.x,D.test.y,minus.q,minus.x,minus.y);
        fx+=DIP_FACTOR*(Fp.fx+Fm.fx); fy+=DIP_FACTOR*(Fp.fy+Fm.fy);
      }
    }
  }
  const damping=0.985;
  D.test.vx=(D.test.vx+fx*dt)*damping; D.test.vy=(D.test.vy+fy*dt)*damping;
  D.test.x=clamp(D.test.x+D.test.vx,12,ARENA_W-12); D.test.y=clamp(D.test.y+D.test.vy,12,ARENA_H-12);
  if(D.test.x<=12||D.test.x>=ARENA_W-12) D.test.vx*=-0.5;
  if(D.test.y<=12||D.test.y>=ARENA_H-12) D.test.vy*=-0.5;
}
function D_draw(){
  const ctx=D.ctx; ctx.clearRect(0,0,ARENA_W,ARENA_H);
  ctx.save(); ctx.globalAlpha=0.2; ctx.strokeStyle="rgba(255,255,255,0.15)"; ctx.lineWidth=1;
  for(let x=0;x<=ARENA_W;x+=40){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,ARENA_H); ctx.stroke(); }
  for(let y=0;y<=ARENA_H;y+=40){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(ARENA_W,y); ctx.stroke(); }
  ctx.restore();
  ctx.fillStyle=COLORS.target; ctx.beginPath(); ctx.arc(D.target.x,D.target.y,14,0,Math.PI*2); ctx.fill();
  ctx.fillStyle="#111"; ctx.font="700 12px system-ui"; ctx.textAlign="center"; ctx.fillText("★",D.target.x,D.target.y+4);
  if(D.showForce){
    let fx=0,fy=0; for(const c of D.charges){ const F=forceBetween(D.test.q,D.test.x,D.test.y,c.q,c.x,c.y); fx+=F.fx; fy+=F.fy; }
    if(D.cfg.induction){ for(const n of D.neutrals){ if(n.qind>1e-5){ const dx=(n.d/2)*n.dipUx, dy=(n.d/2)*n.dipUy; const plus={x:n.x+dx,y:n.y+dy,q:+n.qind}, minus={x:n.x-dx,y:n.y-dy,q:-n.qind}; const Fp=forceBetween(D.test.q,D.test.x,D.test.y,plus.q,plus.x,plus.y); const Fm=forceBetween(D.test.q,D.test.x,D.test.y,minus.q,minus.x,minus.y); fx+=DIP_FACTOR*(Fp.fx+Fm.fx); fy+=DIP_FACTOR*(Fp.fy+Fm.fy); } } }
    ctx.strokeStyle=COLORS.force; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(D.test.x,D.test.y); ctx.lineTo(D.test.x+clamp(fx*6,-100,100), D.test.y+clamp(fy*6,-100,100)); ctx.stroke();
  }
  // obstáculos polarizáveis
  for(const n of D.neutrals){
    ctx.fillStyle=COLORS.neutral; ctx.strokeStyle="#fff"; ctx.lineWidth=2;
    ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,Math.PI*2); ctx.fill(); ctx.stroke();
    if(D.cfg.induction && n.qind>1e-5){
      const ux=n.dipUx, uy=n.dipUy; const dx=(n.d/2)*ux, dy=(n.d/2)*uy; const plus={x:n.x+dx,y:n.y+dy}, minus={x:n.x-dx,y:n.y-dy};
      ctx.strokeStyle="#111827"; ctx.globalAlpha=0.6; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(minus.x,minus.y); ctx.lineTo(plus.x,plus.y); ctx.stroke(); ctx.globalAlpha=1;
      ctx.fillStyle=COLORS.pos; ctx.strokeStyle="#fff"; ctx.lineWidth=1.5; ctx.beginPath(); ctx.arc(plus.x,plus.y,7,0,Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.fillStyle="#fff"; ctx.font="800 10px system-ui"; ctx.textAlign="center"; ctx.fillText("+", plus.x, plus.y+3);
      ctx.fillStyle=COLORS.neg; ctx.strokeStyle="#fff"; ctx.lineWidth=1.5; ctx.beginPath(); ctx.arc(minus.x,minus.y,7,0,Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.fillStyle="#fff"; ctx.font="800 10px system-ui"; ctx.textAlign="center"; ctx.fillText("−", minus.x, minus.y+3);
    }
  }
  for(const c of D.charges){ ctx.fillStyle = c.q>0?COLORS.pos:COLORS.neg; ctx.strokeStyle="#fff"; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(c.x,c.y,16,0,Math.PI*2); ctx.fill(); ctx.stroke(); ctx.fillStyle="#fff"; ctx.font="800 16px system-ui"; ctx.textAlign="center"; ctx.fillText(c.q>0?"+":"−", c.x, c.y+5); }
  ctx.fillStyle="#10b981"; ctx.strokeStyle="#fff"; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(D.test.x,D.test.y,12,0,Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.fillStyle="#083344"; ctx.font="800 12px system-ui"; ctx.textAlign="center"; ctx.fillText("q", D.test.x, D.test.y+4);
  ctx.strokeStyle="rgba(255,255,255,0.15)"; ctx.lineWidth=1; ctx.strokeRect(4,4,ARENA_W-8,ARENA_H-8);
}
function D_tick(now){ if(!D.last) D.last=now; const dt=clamp((now-D.last)/1000,0,0.05); D.last=now; D_update(dt); D_draw(); requestAnimationFrame(D_tick); }
function D_hitTest(x,y){ for(let i=D.charges.length-1;i>=0;i--){ const c=D.charges[i]; if(distance({x,y},c)<18) return {type:'charge',id:c.id}; } if(distance({x,y},D.test)<14) return {type:'test'}; return null; }
function D_pointerDown(e){ const rect=D.canvas.getBoundingClientRect(); const x=(e.clientX-rect.left)/rect.width*ARENA_W; const y=(e.clientY-rect.top)/rect.height*ARENA_H; const pick=D_hitTest(x,y); if(pick && pick.type==='charge'){ D.drag=pick; } } // q não arrasta
function D_pointerMove(e){ if(!D.drag) return; const rect=D.canvas.getBoundingClientRect(); const x=clamp((e.clientX-rect.left)/rect.width*ARENA_W,0,ARENA_W); const y=clamp((e.clientY-rect.top)/rect.height*ARENA_H,0,ARENA_H); if(D.drag.type==='charge'){ const c=D.charges.find(c=>c.id===D.drag.id); if(c){ c.x=clamp(x,16,ARENA_W-16); c.y=clamp(y,16,ARENA_H-16); } } }
function D_pointerUp(){ D.drag=null; }

// ======= Quiz (3 níveis) =======
const Q = { level:1, round:0, score:0, total:8, data:{} };
const qLevelLabel = document.getElementById('quiz-level-label');
const qNum = document.getElementById('qNum');
const qTotal = document.getElementById('qTotal');
const qScore = document.getElementById('qScore');
qTotal.textContent = Q.total;
function Q_setLevel(n){ Q.level = n; Q.round = 0; Q.score = 0; qLevelLabel.textContent = 'Nível ' + n; qNum.textContent = 1; qScore.textContent = 0; document.getElementById('quiz-L1').classList.toggle('hidden', n!==1); document.getElementById('quiz-L2').classList.toggle('hidden', n!==2); document.getElementById('quiz-L3').classList.toggle('hidden', n!==3); if(n===3){ Q_initCanvas(); } Q_next(); }
function Q_next(){ if(Q.round>=Q.total){ alert(`Fim do quiz! Você acertou ${Q.score} de ${Q.total}.`); Q.round=0; Q.score=0; } qNum.textContent = Q.round+1; qScore.textContent = Q.score;
  if(Q.level===1){ const a=Math.random()<0.5?+1:-1; const b=Math.random()<0.5?+1:-1; Q.data = {a,b,correct: (a===b?"Repele":"Atrai")}; document.getElementById('q1A').textContent = a>0?"+":"−"; document.getElementById('q1B').textContent = b>0?"+":"−"; }
  else if(Q.level===2){ const t=Math.random()<0.5?+1:-1; const c=Math.random()<0.5?+1:-1; const near = Math.random()<0.5; const type = (t===c) ? "Repele" : "Atrai"; const mag = near ? "forte" : "fraca"; Q.data = {t,c,near,correct:`${type} ${mag}`}; const sym = (x)=> x>0?"+":"−"; document.getElementById('q2Prompt').textContent = `Uma partícula q${sym(t)} está ${near?"PERTO":"LONGE"} de uma carga ${sym(c)}. O que acontece?`; }
  else if(Q.level===3){ const positions = ["left","right","up","down"]; function posCoord(p){ const cx=120, cy=120, off=70; if(p==="left") return {x:cx-off,y:cy}; if(p==="right") return {x:cx+off,y:cy}; if(p==="up") return {x:cx,y:cy-off}; return {x:cx,y:cy+off}; }
    const p1 = positions[Math.floor(Math.random()*positions.length)]; let p2 = positions[Math.floor(Math.random()*positions.length)]; if(p2===p1){ p2 = positions[(positions.indexOf(p1)+2)%positions.length]; }
    const s1 = Math.random()<0.5?+1:-1; const s2 = Math.random()<0.5?+1:-1; const tQ = +1; const c1 = {...posCoord(p1), q:s1}; const c2 = {...posCoord(p2), q:s2}; const cx=120, cy=120; function Ffrom(c){ const F=forceBetween(tQ,cx,cy,c.q,c.x,c.y); return F; } const F1=Ffrom(c1), F2=Ffrom(c2); const Fx=F1.fx+F2.fx, Fy=F1.fy+F2.fy; const ang=Math.atan2(Fy,Fx);
    function quantize(a){ const dirs=[{d:"→",a:0},{d:"↗",a:Math.PI/4},{d:"↑",a:Math.PI/2},{d:"↖",a:3*Math.PI/4},{d:"←",a:Math.PI},{d:"↙",a:-3*Math.PI/4},{d:"↓",a:-Math.PI/2},{d:"↘",a:-Math.PI/4}]; let best="→", besterr=1e9; for(const it of dirs){ const err=Math.abs(Math.atan2(Math.sin(a-it.a), Math.cos(a-it.a))); if(err<besterr){ besterr=err; best=it.d; } } return best; }
    const correct = quantize(ang); Q.data = {c1,c2,correct}; Q_drawCanvas(); } }
document.querySelectorAll('#quiz-L1 .answer-btn').forEach(btn=>btn.onclick=()=>Q_answer(btn.dataset.choice));
document.querySelectorAll('#quiz-L2 .answer-btn').forEach(btn=>btn.onclick=()=>Q_answer(btn.dataset.choice));
document.querySelectorAll('#quiz-L3 .answer-btn').forEach(btn=>btn.onclick=()=>Q_answer(btn.dataset.choice));
document.querySelectorAll('[data-qlevel]').forEach(btn=>btn.onclick=()=>Q_setLevel(parseInt(btn.dataset.qlevel)));
document.getElementById('btn-q-reset').onclick=()=>Q_setLevel(Q.level);
function Q_answer(choice){ if(choice===Q.data.correct) Q.score++; Q.round++; Q_next(); }
let QCV=null, QCTX=null; function Q_initCanvas(){ QCV=document.getElementById('quiz-canvas'); QCTX=QCV.getContext('2d'); }
function Q_drawCanvas(){ const ctx=QCTX; const w=QCV.width, h=QCV.height; ctx.clearRect(0,0,w,h); ctx.save(); ctx.globalAlpha=0.2; ctx.strokeStyle="rgba(255,255,255,0.15)"; ctx.lineWidth=1; for(let x=0;x<=w;x+=30){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); } for(let y=0;y<=h;y+=30){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); } ctx.restore(); const cx=w/2, cy=h/2; ctx.fillStyle="#10b981"; ctx.strokeStyle="#fff"; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(cx,cy,10,0,Math.PI*2); ctx.fill(); ctx.stroke(); ctx.fillStyle="#083344"; ctx.font="800 11px system-ui"; ctx.textAlign="center"; ctx.fillText("q+", cx, cy+4);
  function drawC(c){ ctx.fillStyle = c.q>0?COLORS.pos:COLORS.neg; ctx.strokeStyle="#fff"; ctx.lineWidth=1.5; ctx.beginPath(); ctx.arc(c.x,c.y,12,0,Math.PI*2); ctx.fill(); ctx.stroke(); ctx.fillStyle="#fff"; ctx.font="800 14px system-ui"; ctx.textAlign="center"; ctx.fillText(c.q>0?"+":"−", c.x, c.y+4); }
  drawC(Q.data.c1); drawC(Q.data.c2); }

// ======= UI wiring =======
function showTab(name){ for(const id of ["aprender","desafios","quiz"]){ document.getElementById("view-"+id).classList.toggle("hidden", id!==name); document.getElementById("tab-"+id).classList.toggle("active", id===name); } }
function initAprender(){
  A.canvas=document.getElementById('canvas-aprender'); A.ctx=A.canvas.getContext('2d'); A_reset(); A_draw(); requestAnimationFrame(A_tick);
  A.canvas.addEventListener('pointerdown',A_pointerDown); window.addEventListener('pointermove',A_pointerMove); window.addEventListener('pointerup',A_pointerUp);
  document.getElementById('btn-add-plus').onclick=()=>A_addCharge(+1); document.getElementById('btn-add-minus').onclick=()=>A_addCharge(-1); document.getElementById('btn-rem-charge').onclick=()=>A.charges.pop();
  document.getElementById('btn-add-neutral').onclick=()=>{ const m=document.getElementById('matSel').value; A_addNeutral(m); }; document.getElementById('btn-rem-neutral').onclick=()=>A.neutrals.pop();
  document.getElementById('chk-force').onchange=(e)=>A.showForce=e.target.checked; document.getElementById('chk-ind').onchange=(e)=>A.showInduction=e.target.checked;
  document.getElementById('chk-dync').onchange=(e)=>A.dynamicCharges=e.target.checked; document.getElementById('chk-dipdip').onchange=(e)=>A.dipoleInteract=e.target.checked; document.getElementById('chk-fric').onchange=(e)=>A.frictionMode=e.target.checked;
  document.getElementById('rng-speed').oninput=(e)=>A.speed=parseFloat(e.target.value); document.getElementById('rng-eth').oninput=(e)=>A.Ethreshold=parseFloat(e.target.value);
  document.getElementById('btn-play').onclick=()=>{ A.playing=!A.playing; document.getElementById('btn-play').textContent=A.playing?'Pausar':'Iniciar'; };
  document.getElementById('btn-reset-q').onclick=()=>{ A.test.x=140; A.test.y=ARENA_H/2; A.test.vx=0; A.test.vy=0; };
  document.getElementById('btn-swap-q').onclick=()=>{ A.test.q*=-1; };
  document.getElementById('btn-reset').onclick=()=>A_reset();
}
function initDesafios(){
  D.canvas=document.getElementById('canvas-desafios'); D.ctx=D.canvas.getContext('2d'); D_setLevel(1); D_draw(); requestAnimationFrame(D_tick);
  D.canvas.addEventListener('pointerdown',D_pointerDown); window.addEventListener('pointermove',D_pointerMove); window.addEventListener('pointerup',D_pointerUp);
  document.querySelectorAll('#view-desafios [data-lvl]').forEach(btn=>btn.onclick=()=>D_setLevel(parseInt(btn.dataset.lvl)));
  document.getElementById('btn-d-add-plus').onclick=()=>D_addCharge(+1);
  document.getElementById('btn-d-add-minus').onclick=()=>D_addCharge(-1);
  document.getElementById('btn-d-rem').onclick=()=>D.charges.pop();
  document.getElementById('chk-d-force').onchange=(e)=>D.showForce=e.target.checked;
  document.getElementById('btn-d-play').onclick=()=>{ D.playing=!D.playing; document.getElementById('btn-d-play').textContent=D.playing?'Pausar':'Iniciar'; };
  document.getElementById('btn-d-resetq').onclick=()=>{ D.test.x=D.cfg.testStart.x; D.test.y=D.cfg.testStart.y; D.test.vx=0; D.test.vy=0; };
  document.getElementById('btn-d-reset').onclick=()=>D_resetToConfig();
}
function initQuiz(){ Q_setLevel(1); }
document.getElementById('tab-aprender').onclick=()=>showTab('aprender');
document.getElementById('tab-desafios').onclick=()=>showTab('desafios');
document.getElementById('tab-quiz').onclick=()=>showTab('quiz');
initAprender(); initDesafios(); initQuiz();
