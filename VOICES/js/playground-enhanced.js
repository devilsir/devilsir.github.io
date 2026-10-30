/* Challenge-only improvements. Authored SVG previews and Canvas artwork are local. */
(function voicesChallengeEdition() {
'use strict';
const V = window.V, P = V.Playground, D = V.PlaygroundData, C = P.controllers;
const clamp = V.clamp, esc = V.escape, copy = x => JSON.parse(JSON.stringify(x));
const pal = {ink:'#163d3a', paper:'#f4e6c9', gold:'#f4ce83', teal:'#80c5b0', red:'#e39a83', blue:'#9abdd0'};
const rect = (c,x,y,w,h,fill,stroke) => {
  c.fillStyle=fill; c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));
  if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.strokeRect(Math.round(x)+1,Math.round(y)+1,Math.round(w)-2,Math.round(h)-2);}
};
function text(c,s,x,y,size=16,color=pal.ink,limit=1000) {
  c.save(); c.font='700 '+size+'px system-ui,sans-serif';
  if(c.measureText(s).width>limit)c.font='700 '+Math.max(8,Math.floor(size*limit/c.measureText(s).width))+'px system-ui,sans-serif';
  c.textAlign='center';c.textBaseline='middle';c.fillStyle=color;c.fillText(s,x,y);c.restore();
}
function stroke(c,points,color,width=2) {
  c.strokeStyle=color;c.lineWidth=width;c.beginPath();
  points.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.stroke();
}
function plaque(c,s,x,y,w=110,color=pal.paper) { rect(c,x-w/2,y-12,w,24,color,pal.ink);text(c,s,x,y,12,pal.ink,w-12); }
function leaf(c,x,y,size=1) {
  c.save();c.translate(x,y);c.scale(size,size);
  rect(c,-12,0,24,17,'#ba8860');rect(c,-3,-33,6,34,'#40745a');
  rect(c,-21,-26,20,11,'#74aa74');rect(c,3,-37,21,12,'#4d9167');rect(c,-13,-45,14,10,'#94bf85');c.restore();
}
function parcel(c,x,y,kind='parcel',size=1) {
  c.save();c.translate(x,y);c.scale(size,size);
  if(kind==='book'){rect(c,-16,-13,32,25,'#b86556',pal.ink);rect(c,-10,-8,22,14,pal.paper);rect(c,-14,-11,4,21,'#e7b97c');}
  else if(kind==='letter'){rect(c,-17,-11,34,24,pal.paper,pal.ink);stroke(c,[[-16,-9],[0,3],[16,-9]],'#a58159');}
  else if(kind==='photo'){rect(c,-17,-14,34,29,pal.paper,pal.ink);rect(c,-12,-9,24,17,'#81b7b7');rect(c,-7,0,14,8,'#52876c');rect(c,5,-6,5,5,pal.gold);}
  else if(kind==='record'){rect(c,-17,-12,34,25,'#4e676b',pal.paper);rect(c,-12,-7,24,12,pal.ink);text(c,'• •',0,0,14,pal.gold);}
  else {rect(c,-15,-13,30,27,'#d4a574',pal.ink);rect(c,-3,-11,6,23,pal.paper);stroke(c,[[-13,-4],[13,-4]],'#a1774e');}
  c.restore();
}
function pad(host,action,hold=false) {
  const d=document.createElement('div');d.className='pg-pad';
  for(const [id,label,x,y] of [['up','↑',0,-1],['left','←',-1,0],['down','↓',0,1],['right','→',1,0]]) {
    const b=P.button('pg-'+id,label,()=>!hold&&action([x,y]));
    b.setAttribute('aria-label',({up:'Mover para cima',left:'Mover à esquerda',down:'Mover para baixo',right:'Mover à direita'})[id]);
    if(hold) {
      b.onpointerdown=e=>{e.preventDefault();V.Audio.unlock();b.setPointerCapture?.(e.pointerId);P.held={x,y};};
      b.onpointerup=b.onpointercancel=b.onlostpointercapture=()=>{P.held={x:0,y:0};};
    }
    d.append(b);
  }
  host.append(d);
}
const enhancedInfo={
  runner:['Desvie, salte e atravesse 24 portais. Acertos rendem pontos; toda passagem conta.','← → / A D · espaço salta · 1–3 escolhem faixa'],
  courier:['Retire a caixa certa, trace seu caminho pelo bairro e encontre quem espera a entrega.','WASD / setas · E interage · toque no mapa ou nos destinos'],
  room:['Decore oito ambientes com objetos que encaixam de verdade nas posições do pedido.','Arraste ou toque para colocar · setas movem · E confirma'],
  rhythm:['Siga seis arranjos, acerte no tempo e faça o palco responder à sua sequência.','D F J K · toque nas quatro faixas · som opcional'],
  garden:['Cultive três canteiros, cuide da água e das ervas e complete quatro colheitas.','WASD / setas · E cuida · toque nos destinos'],
  bridges:['Restaure seis passarelas, acompanhe as conexões e atravesse a água.','Clique gira · setas selecionam · E gira · Z desfaz · C atravessa'],
  memory:['Resgate registros, use as paredes como cobertura e escape da visão das patrulhas.','WASD / setas · toque traça a rota · E recolhe e entrega'],
  museum:['Planeje os empurrões, restaure as galerias e desfaça um passo quando precisar.','WASD / setas · toque para caminhar · Z desfaz · R reinicia'],
  platform:['Salte por plataformas, colete palavras e enfrente guardiões antes de abrir os portais.','A D / ← → · espaço salta · ↓ desce · J ataca · K dá impulso'],
  radio:['Ajuste os três canais, estabilize o sinal e transmita antes que a bateria acabe.','1–3 selecionam · ← → ajustam · toque no dial · E transmite']
};
for(const g of D.games) {g.description=enhancedInfo[g.id][0];g.keys=enhancedInfo[g.id][1];}
D.guides.runner[2].text='Atravesse a palavra em inglês. No jogo, toda passagem avança a rodada, mesmo com erro. Espaço ou Saltar permitem pular barreiras; a cidade ao fundo fica estática.';
D.guides.rhythm.at(-1).after='Ótimo! A partida tem seis arranjos. Cada faixa mantém sua letra e sua cor; no modo tranquilo, a nota espera por você.';
D.guides.memory[0].text='Paredes bloqueiam a visão das patrulhas. O círculo indica o alcance; a barra de alerta dá um instante para você sair.';
D.guides.platform[1].text='Espaço, W ou ↑ fazem o salto. Segure para ir mais alto; J lança energia e K dá um impulso. Colete palavras e derrote o guardião das fases 3 e 6.';
D.guides.radio[2].text='Depois de acertar os três canais, mantenha a sintonia por um instante. A barra SIGNAL confirma quando você pode transmitir.';

// Dedicated local previews replace generic canvases and font-dependent icons.
const oldMenu=P.menu.bind(P);
// Avoid legacy canvas crop/readback work; this catalog uses its own SVG assets.
P.covers=function(){};
P.menu=function() {
  oldMenu();
  const modal=V.$('.modal');if(!modal)return;modal.classList.add('pg-catalog');
  V.$$('.pg-game-card').forEach((card,i)=>{
    const game=D.games[i],cover=card.querySelector('.pg-cover');
    cover.replaceChildren();
    const img=document.createElement('img');img.src='assets/challenges/'+game.id+'-preview.svg?v=20261030-imageopt1';
    img.alt='Preview de '+game.title;img.width=640;img.height=288;img.decoding='async';
    const badge=document.createElement('small');badge.className='pg-cover-index';badge.textContent=String(i+1).padStart(2,'0')+' / '+game.stages+' FASES';
    cover.append(img,badge);
    const title=card.querySelector('h3'),icon=document.createElement('img');
    icon.src='assets/challenges/'+game.id+'-icon.svg';icon.alt='';icon.width=32;icon.height=32;title.prepend(icon);
    const tag=document.createElement('span');tag.className='pg-card-tag';tag.textContent=game.tag;title.after(tag);
    card.querySelector('[data-pg-play]')?.setAttribute('aria-label','Jogar '+game.title);
    card.querySelector('[data-pg-train]')?.setAttribute('aria-label','Treinar '+game.title);
  });
};

// Small, bounded effects live outside saved runs. Stage transitions protect inputs.
P.fx=[];P.banner=null;P.noticeTime=0;
const oldHit=P.hit.bind(P),oldFeedback=P.feedback.bind(P),oldStage=P.stageClear.bind(P);
P.hit=function(points=100) {oldHit(points);if(!this.active)return;this.fx.push({text:'+'+points,t:.7,color:pal.gold});this.fx=this.fx.slice(-5);};
P.feedback=function(message,wrong=false) {
  oldFeedback(message,wrong);this.noticeTime=wrong?1.5:.7;
  const el=V.$('#pg-feedback');if(el)el.dataset.kind=wrong?'error':'success';
};
P.stageClear=function(r,stage) {
  oldStage(r,stage);
  if(r.training||r.finished)return;
  this.banner={t:1.25,title:'FASE '+(stage+1)+' CONCLUÍDA',sub:this.game(r.game).title};
  V.Input.clear();this.held={x:0,y:0};this.drag=null;
};
const oldAttach=P.attach.bind(P),oldDetach=P.detach.bind(P),oldUpdate=P.update.bind(P),oldRender=P.render.bind(P),oldKey=P.key.bind(P),oldAction=P.action.bind(P);
P.attach=function(r){this.fx=[];this.banner=null;this.noticeTime=0;if(r.game==='runner')r.data.correctChoices??=Math.max(0,r.data.round-(r.data.wrongChoices||0));oldAttach(r);const root=V.$('#playground-root');if(root){root.dataset.game=r.game;const badge=document.createElement('img');badge.className='pg-title-icon';badge.alt='';badge.width=38;badge.height=38;badge.src='assets/challenges/'+r.game+'-icon.svg';root.querySelector('.pg-top').prepend(badge);} };
P.detach=function(){this.fx=[];this.banner=null;oldDetach();};
P.key=function(k,e){if(this.banner&&k!=='escape'&&k!=='p')return;if(e?.repeat&&['runner','rhythm','radio','room','bridges','museum','platform'].includes(this.active?.game))return;return oldKey(k,e);};
P.action=function(name,arg){if(this.banner)return;return oldAction(name,arg);};
P.update=function(dt) {
  if(!this.active||V.modal)return;
  dt=clamp(dt,0,.04);this.fx.forEach(f=>f.t-=dt);this.fx=this.fx.filter(f=>f.t>0);
  this.noticeTime=Math.max(0,this.noticeTime-dt);
  if(this.banner){this.banner.t-=dt;if(this.banner.t<=0){this.banner=null;V.Input.clear();this.held={x:0,y:0};}return;}
  const r=this.active,stamp=()=>[r.finished,r.data.stage,r.data.cycle,r.data.round,r.data.resolved,r.data.done,r.data.delivered,r.data.wordIndex?.length,r.data.checkpoint,r.data.hearts].join(':');
  const before=stamp();oldUpdate(dt);
  // Save the new stage after the controller replaces its data, not the departing one.
  if(this.active===r&&stamp()!==before)this.save();
};
P.render=function(c) {
  oldRender(c);if(!this.active)return;
  const area=this.sceneBounds();
  c.save();c.beginPath();c.rect(area.x,area.y,area.w,area.h);c.clip();
  if(this.fx.length&&!V.settings.reducedMotion) {
    const f=this.fx.at(-1);text(c,f.text,area.x+area.w-40,area.y+30+(1-f.t/.7)*-10,19,f.color,80);
  }
  if(this.banner&&!this.active.finished) {
    const w=Math.min(380,area.w-24),x=area.x+area.w/2,y=area.y+area.h/2;
    rect(c,x-w/2,y-43,w,86,pal.ink,pal.gold);text(c,this.banner.title,x,y-10,19,pal.gold,w-20);text(c,this.banner.sub,x,y+18,13,pal.paper,w-20);
  }
  c.restore();
};
window.addEventListener('pointerup',()=>{P.held={x:0,y:0};});
window.addEventListener('pointercancel',()=>{P.held={x:0,y:0};P.drag=null;if(P.active?.game==='room')C.room.cancelDrag(P.active);});
const oldPointer=P.pointer.bind(P);
P.pointer=function(type,e){if(this.banner)return;if(type==='cancel'&&this.active?.game==='room'){C.room.cancelDrag(this.active);this.drag=null;return;}return oldPointer(type,e);};
P.layout=function(){
  const area=this.sceneBounds(),id=this.active?.game;
  const bounds={runner:[0,102,960,410],courier:[42,126,876,360],garden:[42,126,876,369],room:[260,146,530,334],rhythm:[20,155,920,330],bridges:[270,158,590,322],memory:[110,83,735,450],museum:[213,78,534,455],platform:[0,158,960,330],radio:[138,151,684,354]}[id]||[0,0,960,540];
  const [x,y,w,h]=bounds,scale=Math.max(.01,Math.min(Math.max(1,area.w-16)/w,Math.max(1,area.h-12)/h));
  return{scale,x:area.x+(area.w-w*scale)/2-x*scale,y:area.y+(area.h-h*scale)/2-y*scale};
};

// CORRIDA: visible collection plane, jumpable hazards and 24 real attempts.
const runner=C.runner;
function choices(r) {
  const d=r.data,w=D.words[(r.training?0:d.round)%D.words.length],right=r.training?2:(d.round*2+Math.floor(d.round/3))%3,words=w.wrong.slice();
  words.splice(right,0,w.en);return {w,right,words};
}
runner.model=function(r) {
  const d=r.data,q=choices(r);
  return {request:(r.training?'Treino':'Distrito '+(d.stage+1)+'/6')+' · Encontre: '+q.w.pt,
    support:(d.correctChoices||0)+' acertos · '+(d.wrongChoices||0)+' palavras erradas · '+d.coins+' moedas · '+d.shield+' escudos',
    progress:d.round,total:r.training?1:24,hint:'Toda passagem conta. Troque de faixa; salte sobre as barreiras vermelhas.'};
};
runner.controls=function(r,host) {host.append(P.button('pg-left','← Esquerda',()=>P.action('left')),P.button('pg-jump','Saltar · espaço',()=>P.action('jump'),'primary'),P.button('pg-right','Direita →',()=>P.action('right')));};
const oldRunnerAction=runner.action.bind(runner);
runner.action=function(r,name,arg) {
  const d=r.data;
  if(name==='jump'){if(!(d.jump>0)&&!(d.jumpCooldown>0)){d.jump=.72;d.jumpCooldown=.9;r.moves++;V.Audio.sfx('menu');}return;}
  if(name==='lane'){const target=clamp(arg,0,2);while(d.lane!==target)oldRunnerAction(r,d.lane>target?'left':'right');return;}
  oldRunnerAction(r,name);
};
runner.key=function(r,k){if(['arrowleft','a'].includes(k)){P.action('left');return true;}if(['arrowright','d'].includes(k)){P.action('right');return true;}if([' ','w','arrowup'].includes(k)){P.action('jump');return true;}if(['1','2','3'].includes(k)){P.action('lane',+k-1);return true;}return false;};
runner.pointer=function(r,type,p,drag){if(type==='up'&&drag&&Math.abs(p.x-drag.x)<24&&Math.abs(p.y-drag.y)<24)P.action('lane',p.x<370?0:p.x>590?2:1);};
runner.hint=function(r){const q=choices(r);r.data.hintLane=q.right;r.data.hintTime=3;P.feedback(q.w.pt+' = '+q.w.en+' · faixa '+(q.right+1)+'.');};
runner.update=function(r,dt) {
  const d=r.data,q=choices(r);d.x+=([260,480,700][d.lane]-d.x)*Math.min(1,dt*18);
  d.jump=Math.max(0,(d.jump||0)-dt);d.jumpCooldown=Math.max(0,(d.jumpCooldown||0)-dt);d.hintTime=Math.max(0,(d.hintTime||0)-dt);
  if(r.training&&r.step<2)return;
  if(d.wait>0){d.wait=Math.max(0,d.wait-dt);return;}
  d.z+=dt/Math.max(2.6,([5.6,4.3,3.5][P.difficulty(r)]-Math.min(.5,d.stage*.08)));
  if(r.training&&d.z>.94&&d.lane!==q.right)d.z=.94;
  const hazard=d.stage>0&&d.round%3===1,barrierLane=(d.round+d.stage*2)%3,coinLane=(d.round*2+d.stage+1)%3;
  if(d.z>=.68&&!d.bonus){d.bonus=true;if(!r.training&&d.lane===coinLane){d.coins++;P.hit(20);if(d.coins%5===0)d.shield=Math.min(3,d.shield+1);}}
  if(d.z>=.82&&!d.barrier){d.barrier=true;if(!r.training&&hazard&&d.lane===barrierLane&&!(d.jump>.12)){d.shield=Math.max(0,d.shield-1);P.feedback('Barreira! Troque de faixa ou salte antes da linha.',true);}}
  if(d.z<1)return;
  if(d.lane===q.right){P.hit(110);d.correctChoices=(d.correctChoices||0)+1;P.feedback('✓ '+q.w.en+' = '+q.w.pt);if(!r.training)V.PixCollection.collect(q.w.en,'Corrida das Palavras');}
  else {d.wrongChoices=(d.wrongChoices||0)+1;d.shield=Math.max(0,d.shield-1);P.feedback('Passagem contada. '+q.w.pt+' = '+q.w.en+'. Próxima palavra!',true);}
  d.round++;d.z=0;d.wait=.65;d.bonus=false;d.barrier=false;
  if(r.training){P.event('runner-hit');return;}
  if(d.round%4===0){P.stageClear(r,d.stage);if(d.round>=24){P.finish();return;}d.stage++;d.shield=Math.min(3,d.shield+1);}
};
const runnerBackground=runner.draw.bind(runner);
runner.draw=function(c,r) {
  // Keep the authored district fixed; redraw only the playfield objects.
  const d=r.data,savedZ=d.z,savedBonus=d.bonus,savedBarrier=d.barrier;
  d.z=-.11;d.bonus=true;d.barrier=true;runnerBackground(c,r);d.z=savedZ;d.bonus=savedBonus;d.barrier=savedBarrier;
  const q=choices(r),z=clamp(d.z,0,1);
  // Cover old player and tiny negative-depth panels with the road, then repaint.
  c.save();c.beginPath();c.moveTo(375,187);c.lineTo(585,187);c.lineTo(930,514);c.lineTo(30,514);c.closePath();c.clip();
  rect(c,0,187,960,327,'#375752');
  for(let i=0;i<4;i++)stroke(c,[[375+i*70,187],[30+i*300,514]],i===0||i===3?pal.paper:'#91ad99',i===0||i===3?4:2);
  for(let i=1;i<9;i++){const t=i/9,y=187+t*t*327,w=210+t*t*690;stroke(c,[[480-w/2,y],[480+w/2,y]],'#72917b',1);}
  c.restore();
  const depth=.12+z*.88,py=194+depth*depth*260,spread=78+depth*142,scale=.42+depth*.58;
  q.words.forEach((word,i)=>{
    const x=480+(i-1)*spread,w=190*scale,h=51*scale,marked=(r.training&&i===q.right)||(d.hintTime>0&&i===d.hintLane);
    rect(c,x-w/2+4,py-h+6,w,h,'#123e3890');rect(c,x-w/2,py-h,w,h,marked?pal.gold:pal.paper,marked?'#fff2bc':'#bca677');
    rect(c,x-w/2+4,py-h+4,w-8,3,marked?'#fff0b8':'#88af9b');text(c,word,x,py-h/2,Math.max(11,20*scale),pal.ink,w-13);
  });
  const projected=(depth,ln)=>({x:480+(ln-1)*(78+depth*142),y:194+depth*depth*260});
  if(!r.training&&!d.bonus){const p=projected(Math.min(1,depth+.27),(d.round*2+d.stage+1)%3);rect(c,p.x-8,p.y-25,16,21,pal.gold,'#946d38');}
  if(!r.training&&d.stage>0&&d.round%3===1&&!d.barrier){const p=projected(Math.min(1,depth+.16),(d.round+d.stage*2)%3);rect(c,p.x-24,p.y-32,48,32,'#bd6e60',pal.paper);stroke(c,[[p.x-18,p.y-8],[p.x-6,p.y-25],[p.x+5,p.y-8],[p.x+17,p.y-25]],pal.gold,4);}
  stroke(c,[[144,455],[816,455]],pal.gold,4);
  const jump=d.jump>0?Math.sin((.72-d.jump)/.72*Math.PI)*74:0;
  c.fillStyle='#15392e66';c.beginPath();c.ellipse(d.x,481,22,6,0,0,Math.PI*2);c.fill();
  P.person(c,d.x,470-jump,true,3,76);
  ['1','2','3'].forEach((s,i)=>plaque(c,s,260+i*220,499,40,d.lane===i?pal.gold:pal.paper));
};

// Shared neighbourhood painter. Labels, paths and buildings have separate space.
const blocked=(x,y)=>x===5&&y>=2&&y<=4||x===9&&y>=2&&y<=3;
const tile=p=>({x:90+p.x*60,y:197+p.y*38});
function route(from,to,w=14,h=7,blocks=blocked) {
  const start=[Math.round(from.x),Math.round(from.y)],goal=[Math.round(to.x),Math.round(to.y)],key=p=>p.join(',');
  const q=[start],seen=new Map([[key(start),null]]);
  for(let i=0;i<q.length;i++){
    const p=q[i];if(key(p)===key(goal)){const out=[];let n=p;while(seen.get(key(n))!==null){out.unshift({x:n[0],y:n[1]});n=seen.get(key(n));}return out;}
    for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const n=[p[0]+dx,p[1]+dy],k=key(n);if(n[0]<0||n[0]>=w||n[1]<0||n[1]>=h||blocks(...n)||seen.has(k))continue;seen.set(k,p);q.push(n);}
  }return null;
}
function nearest(r,sites) {return Object.entries(sites).map(([id,p])=>({id,...p,dist:Math.hypot(r.data.player.x-p.x,r.data.player.y-p.y)})).sort((a,b)=>a.dist-b.dist)[0];}
function building(c,site,p) {
  const x=p.x-46,y=p.y-62,color=site.color||'#98b99b',name=site.name||'';
  rect(c,x+5,y+13,95,61,'#294e3f33');
  if(name==='seeds'){
    rect(c,x,y+32,92,28,'#ae8157',pal.ink);rect(c,x+7,y+37,78,4,'#dbb67d');rect(c,x+5,y-5,5,40,'#7e6348');rect(c,x+82,y-5,5,40,'#7e6348');
    for(let i=0;i<6;i++)rect(c,x-4+i*17,y-9,17,18,i%2?pal.paper:'#729b76',pal.ink);
    for(let i=0;i<3;i++){rect(c,x+13+i*24,y+17,16,18,'#dac18c',pal.ink);rect(c,x+19+i*24,y+21,4,10,'#5c8b62');}
    for(const wx of [x+15,x+75]){rect(c,wx-8,y+59,16,16,pal.ink);rect(c,wx-4,y+63,8,8,'#8c9e82');}
  }else if(name==='water'){
    rect(c,x+12,y+24,68,39,'#a5b4a1',pal.ink);rect(c,x+19,y+29,54,14,'#4f878c');
    for(let j=0;j<2;j++)for(let i=0;i<4;i++)rect(c,x+14+i*16+(j%2)*3,y+45+j*9,13,1,'#677f73');
    rect(c,x+15,y-5,5,43,'#7d694a');rect(c,x+72,y-5,5,43,'#7d694a');rect(c,x+7,y-15,79,14,'#59796d',pal.ink);rect(c,x+44,y-1,3,35,'#d7c294');rect(c,x+37,y+21,19,16,'#b99a6a',pal.ink);
  }else if(name==='garden'){
    rect(c,x-4,y+23,104,42,'#80a77d',pal.ink);
    for(let i=0;i<8;i++)rect(c,x+i*13,y+43,4,25,'#e1d3ac');
    for(let i=0;i<3;i++)leaf(c,x+19+i*29,y+35,.7);
    rect(c,x+12,y-10,5,46,'#7b8e64');rect(c,x+75,y-10,5,46,'#7b8e64');rect(c,x+7,y-14,79,9,'#bfd0a0');
  }else{
    rect(c,x,y,92,66,color,pal.ink);rect(c,x+4,y+4,84,5,'#e8dcc077');
    rect(c,x-6,y-15,104,18,name==='library'?'#775749':name==='school'?'#496e78':'#61735a',pal.ink);
    for(let i=0;i<6;i++)rect(c,x-1+i*16,y-10,11,3,'#ffffff22');
    if(name==='museum'){
      rect(c,x-7,y+55,106,10,'#d8c399',pal.ink);
      for(const cx of [x+8,x+69]){rect(c,cx,y+9,15,46,pal.paper);rect(c,cx-2,y+8,19,6,'#b3a581');rect(c,cx-2,y+48,19,6,'#b3a581');}
      rect(c,x+34,y+16,25,40,'#385b52');rect(c,x+39,y+20,15,19,'#98b7a8');
    }else{
      for(const wx of [x+11,x+61]){rect(c,wx,y+15,21,24,'#456d68',pal.ink);rect(c,wx+3,y+18,15,17,'#e9d7a4');stroke(c,[[wx+10,y+18],[wx+10,y+35]],'#a6956a',2);rect(c,wx-2,y+39,25,4,'#d8c69a');}
      rect(c,x+36,y+28,21,38,'#385e52',pal.ink);rect(c,x+40,y+32,13,18,'#80aaa2');rect(c,x+50,y+55,3,3,pal.gold);
      if(name==='library'){
        for(let i=0;i<3;i++)rect(c,x+14+i*5,y+23,4,12,['#c88e71','#8eafa1','#e2bb73'][i]);
        for(let i=0;i<6;i++)rect(c,x-3+i*17,y+4,17,10,i%2?pal.paper:'#a36653');
      }
      if(name==='school'){rect(c,x+36,y-12,23,23,pal.paper,pal.ink);stroke(c,[[x+47,y-7],[x+47,y],[x+53,y]],'#466f6a',2);}
      if(name==='herb house'){leaf(c,x-10,y+58,.7);leaf(c,x+100,y+58,.8);}
    }
    rect(c,x+31,y+66,32,5,'#b0aa88');rect(c,x+27,y+71,40,4,'#c9bea0');
  }
  const title=site.label||site.name;plaque(c,title,p.x,p.y-92,Math.max(88,title.length*8+16));
}
function neighbourhood(c,r,sites) {
  rect(c,0,0,960,540,'#8faf91');rect(c,47,159,866,317,'#496f5b');rect(c,51,163,858,309,'#a8ba94');
  for(let y=0;y<7;y++)for(let x=0;x<14;x++){
    const p=tile({x,y});rect(c,p.x-29,p.y-18,58,36,(x+y)%2?'#ded0af':'#d8cba9');
    stroke(c,[[p.x-26,p.y-15],[p.x+24,p.y-15]],'#e9dcba',2);
    if((x+y*3)%5===0){rect(c,p.x-17,p.y+8,12,2,'#c6b794');rect(c,p.x+11,p.y-7,6,2,'#c6b794');}
    if(blocked(x,y)){rect(c,p.x-29,p.y-18,58,36,'#72986c');leaf(c,p.x,p.y, .8);}
  }
  for(const p of Object.values(sites))building(c,p,tile(p));
  if(r.data.route?.length){const points=[tile(r.data.player),...r.data.route.map(tile)];c.save();c.setLineDash([6,7]);stroke(c,points.map(p=>[p.x,p.y+6]),'#846b4e',3);c.restore();}
}
function mapPointer(sites) {return function(r,type,p) {
  if(type!=='down')return;let goal={x:clamp(Math.round((p.x-90)/60),0,13),y:clamp(Math.round((p.y-197)/38),0,6)};
  for(const site of Object.values(sites)){const t=tile(site);if(Math.abs(p.x-t.x)<55&&p.y>t.y-82&&p.y<t.y+18){goal=site;break;}}
  const path=route(r.data.player,goal);if(path){r.data.route=path;r.moves++;}else P.feedback('Esse espaço tem um canteiro. Escolha a passagem ao lado.');
};}
const courier=C.courier;
courier.model=function(r) {
  const d=r.data,t=D.deliveries[d.stage%D.deliveries.length],n=nearest(r,D.places),library=n.id==='library';
  return{request:'Take the '+t.item+' to the '+D.places[t.to].name+'.',support:(d.cargo?'Carrying: '+d.cargo:'Collect a package at the Library')+' · Delivery '+Math.min(5,d.stage+1)+'/5',
    progress:d.stage,total:r.training?1:5,action:n.dist>=1.35?'Move closer':library?(d.cargo?'Change package · E':'Pick up package · E'):'Deliver package · E',disabled:n.dist>=1.35,
    hint:d.cargo?'Find the '+D.places[t.to].name+'.':'Every delivery begins at the Library.'};
};
courier.pointer=mapPointer(D.places);
courier.action=function(r,name,arg) {
  const d=r.data,n=nearest(r,D.places);if(n.dist>=1.35)return;
  if(name==='cargo'){
    if(n.id!=='library'||!d.cargoOpen||!['book','letter','parcel'].includes(arg))return;
    d.cargo=arg;d.cargoOpen=false;r.moves++;
    P.feedback('Carrying: '+arg+'. Find the '+D.places[D.deliveries[d.stage%5].to].name+'.');if(arg==='book')P.event('cargo-book');return;
  }
  if(name!=='use')return;
  r.moves++;if(n.id==='library'){d.cargoOpen=true;P.event('cargo-open');P.hud();return;}
  const t=D.deliveries[d.stage%5];
  if(!d.cargo)return P.feedback('Collect a package at the Library first.');
  if(n.id!==t.to)return P.feedback('This is the '+n.name+'. Find the '+D.places[t.to].name+'.',true);
  if(d.cargo!==t.item)return P.feedback('This delivery needs a '+t.item+'. Change the package at the Library.',true);
  const stage=d.stage;d.cargo=null;d.stage++;P.hit(180);P.feedback('✓ Delivered! '+(d.stage<5?'Return to the Library for your next package.':'All deliveries complete.'));
  if(r.training)P.event('delivery');else {P.stageClear(r,stage);if(d.stage>=5)P.finish();}
};
courier.draw=function(c,r) {
  neighbourhood(c,r,D.places);const d=r.data,t=D.deliveries[d.stage%5],goal=d.cargo?D.places[t.to]:D.places.library,p=tile(d.player),g=tile(goal);
  c.save();c.strokeStyle='#f6d598';c.lineWidth=3;c.beginPath();c.ellipse(g.x,g.y+9,27,12,0,0,Math.PI*2);c.stroke();c.restore();
  P.person(c,p.x,p.y+11,d.walking,d.player.dir,54);if(d.cargo)parcel(c,p.x+22,p.y-18,d.cargo,.65);
};

// GARDEN: precise care states and no accidental early end after a partial delivery.
const garden=C.garden,beds=[{x:3,y:2},{x:7,y:3},{x:9,y:4}];
const gardenSites={seeds:{x:1,y:5,label:'Seed Cart',name:'seeds',color:'#c5a16d'},water:{x:11,y:5,label:'Water Well',name:'water',color:'#83adb7'},botica:{x:11,y:1,label:'Herb House',name:'herb house',color:'#96ad84'}};
function gardenPoints(r) {return {...gardenSites,...Object.fromEntries(beds.slice(0,r.training?1:3).map((b,i)=>['bed'+i,{...b,label:'Garden Bed '+(i+1),name:'garden bed'}]))};}
const careNeeded=r=>!r.training&&[1,3].includes(r.data.cycle)?2:1;
garden.model=function(r) {
  const d=r.data,n=nearest(r,gardenPoints(r)),near=n.dist<1.35,b=n.id.startsWith('bed')?d.beds[+n.id.slice(3)]:null;
  let action=!near?'Move closer':n.id==='seeds'?'Collect seeds · E':n.id==='water'?'Fill watering can · E':n.id==='botica'?'Deliver harvest · E':b.status==='empty'?'Plant · E':b.status==='planted'?'Water · E':b.status==='growing'?'Growing…':b.status==='harvested'?'Bed complete':d.cycle>=2&&!r.training&&!d.care[+n.id.slice(3)].clean?'Clear weeds · E':'Harvest · E';
  return{request:r.training?'Plant, water, harvest and deliver':'Stage '+(d.cycle+1)+'/4 · '+['First Harvest','Dry Week','Wild Weeds','Community Harvest'][d.cycle],
    support:'Seeds '+d.seeds+' · Water '+d.water+'/6 · Harvest '+d.harvest+' · Delivered '+d.delivered+' · '+careNeeded(r)+' watering(s) per bed',progress:d.delivered,total:r.training?1:3,
    action,disabled:!near||b?.status==='growing'||b?.status==='harvested',hint:'Seed Cart → Garden Bed → Water Well → Garden Bed → Herb House'};
};
garden.action=function(r,name) {
  if(name!=='use')return;const d=r.data,n=nearest(r,gardenPoints(r));if(n.dist>=1.35)return;r.moves++;
  d.care||=beds.map(()=>({watered:0,clean:false}));
  if(n.id==='seeds'){d.seeds=3;P.feedback('Seeds collected! Choose an empty Garden Bed.');P.event('seeds');return;}
  if(n.id==='water'){d.water=6;P.feedback('Watering can full: six portions.');P.event('water-pick');return;}
  if(n.id==='botica'){
    if(!d.harvest)return P.feedback('Bring a harvest from the Garden Beds.');
    d.delivered+=d.harvest;d.harvest=0;P.hit(140);P.feedback('✓ Harvest delivered!');
    if(r.training){P.event('harvest-delivery');return;}
    if(d.delivered<3)return;
    P.stageClear(r,d.cycle);if(d.cycle>=3){P.finish();return;}
    d.cycle++;d.delivered=0;d.beds=beds.map(()=>({status:'empty',growth:0}));d.care=beds.map(()=>({watered:0,clean:false}));d.seeds=0;d.water=0;return;
  }
  const i=+n.id.slice(3),b=d.beds[i],care=d.care[i];
  if(b.status==='empty'){if(!d.seeds)return P.feedback('Collect seeds at the Seed Cart.');d.seeds--;b.status='planted';care.watered=0;care.clean=false;P.feedback('Planted! Bring water to this bed.');P.event('plant');}
  else if(b.status==='planted'){
    if(!d.water)return P.feedback('Refill at the Water Well.');
    d.water--;care.watered++;P.event('water');
    if(care.watered>=careNeeded(r)){b.status='growing';b.growth=0;P.feedback('Watered! Watch your crop grow.');}
    else P.feedback('Dry soil: one more portion of water is needed.');
  }else if(b.status==='ready'){
    if(!r.training&&d.cycle>=2&&!care.clean){care.clean=true;P.hit(25);P.feedback('Weeds cleared. Your crop is ready to harvest!');return;}
    b.status='harvested';d.harvest++;P.hit(80);P.feedback('Harvest collected! Bring it to Herb House.');
  }else P.feedback(b.status==='growing'?'The crop is growing. You can care for the other beds.':'This bed has completed its cycle.');
};
garden.pointer=function(r,...args){return mapPointer(gardenPoints(r))(r,...args);};
garden.draw=function(c,r) {
  const d=r.data;neighbourhood(c,r,gardenSites);
  for(let i=0;i<(r.training?1:3);i++){
    const b=d.beds[i],p=tile(beds[i]),care=d.care?.[i]||{watered:0,clean:false};
    rect(c,p.x-27,p.y-18,54,37,'#76563c','#b18c60');
    for(let j=0;j<3;j++)stroke(c,[[p.x-17+j*17,p.y-13],[p.x-17+j*17,p.y+12]],'#473c2d',2);
    if(['growing','ready'].includes(b.status)){
      const size=b.status==='ready'?1:.35+.65*Math.min(1,b.growth/3.5);
      for(let j=0;j<3;j++)leaf(c,p.x-16+j*16,p.y+3,size*.65);
      if(!r.training&&d.cycle>=2&&b.status==='ready'&&!care.clean)for(let j=0;j<3;j++)stroke(c,[[p.x-21+j*20,p.y+10],[p.x-27+j*20,p.y-16]],'#a4b46c',3);
    }else if(b.status==='planted')for(let j=0;j<3;j++)rect(c,p.x-18+j*15,p.y-1,5,4,pal.gold);
    const status={empty:'Empty',planted:'Water '+care.watered+'/'+careNeeded(r),growing:'Growing',ready:!r.training&&d.cycle>=2&&!care.clean?'Clear weeds':'Harvest!',harvested:'Complete'}[b.status];
    plaque(c,'Bed '+(i+1)+' · '+status,p.x,p.y+43,120,b.status==='ready'?pal.gold:pal.paper);
    if(b.status==='growing'){rect(c,p.x-24,p.y+23,48,5,'#526a50');rect(c,p.x-24,p.y+23,48*clamp(b.growth/3.5,0,1),5,pal.teal);}
  }
  const p=tile(d.player);P.person(c,p.x,p.y+10,d.walking,d.player.dir,54);
  if(d.harvest)leaf(c,p.x+22,p.y-10,.4);else if(d.water)rect(c,p.x+17,p.y-19,15,14,pal.blue,pal.ink);
};

// ROOM: tap, drag, keyboard and cancellation share one snapped placement.
const room=C.room;
room.controls=function(r,host){pad(host,d=>P.action('move',d));host.append(P.button('pg-action','Pegar objeto · E',()=>P.action('use'),'primary'),P.button('pg-cancel','Devolver à caixa',()=>{r.data.pos=D.roomRounds[r.data.round%8].start.slice();r.data.picked=false;r.data.dragging=false;P.hud();}));};
room.cancelDrag=function(r){if(r.data.dragOrigin)r.data.pos=r.data.dragOrigin.slice();r.data.dragging=false;delete r.data.dragOrigin;delete r.data.tapPlace;};
room.pointer=function(r,type,p,drag) {
  const d=r.data,s=D.roomRounds[d.round%8],at={x:345+d.pos[0]*76,y:232+d.pos[1]*57},t=[clamp(Math.round((p.x-345)/76),0,5),clamp(Math.round((p.y-232)/57),0,3)];
  if(type==='down'){
    if(p.x<287||p.x>766||p.y<184||p.y>447)return;
    d.dragOrigin=d.pos.slice();d.dragMoved=false;d.tapPlace=d.picked&&Math.hypot(p.x-at.x,p.y-at.y)>52;
    if(!d.picked){if(Math.hypot(p.x-at.x,p.y-at.y)>58)return;this.action(r,'use');}
    d.dragging=true;if(d.tapPlace)d.pos=t;
  }
  if(type==='move'&&d.dragging&&drag&&Math.hypot(p.x-drag.x,p.y-drag.y)>8){
    d.dragMoved=true;d.pos=t;if(s.goals.some(g=>g[0]===t[0]&&g[1]===t[1]))P.event('room-move');
  }
  if(type==='up'&&d.dragging){
    const place=d.dragMoved||d.tapPlace;d.dragging=false;delete d.dragOrigin;delete d.tapPlace;d.dragMoved=false;
    if(place&&d.picked&&(!r.training||r.step===2)&&!r.ack)this.place(r);
  }
};
function furniture(c,kind,x,y,size=1) {
  c.save();c.translate(x,y);c.scale(size,size);
  if(kind.startsWith('sofa')){
    rect(c,-42,-42,84,47,'#b77a6c',pal.ink);rect(c,-36,-53,72,28,'#ddad94',pal.ink);rect(c,-47,-28,13,34,'#ce9580',pal.ink);rect(c,34,-28,13,34,'#ce9580',pal.ink);
    rect(c,-30,-24,27,16,'#efc4a4');rect(c,3,-24,27,16,'#efc4a4');
  }else if(kind==='table'){rect(c,-34,-29,68,24,'#b98c60',pal.ink);rect(c,-28,-5,7,22,'#6e573e');rect(c,22,-5,7,22,'#6e573e');}
  else if(kind==='window'){rect(c,-30,-68,60,48,'#709ba9',pal.paper);stroke(c,[[0,-66],[0,-22]],pal.paper,3);stroke(c,[[-28,-45],[28,-45]],pal.paper,3);}
  else if(kind==='plant')leaf(c,0,-13,1.1);
  else if(kind==='bed'){rect(c,-29,-53,58,63,'#95674e',pal.ink);rect(c,-25,-49,50,21,pal.paper);rect(c,-25,-23,50,30,'#92b3b1');stroke(c,[[-23,-9],[23,-9]],'#6c979b',3);}
  else if(kind==='chair'){rect(c,-20,-48,40,27,'#98b6a3',pal.ink);rect(c,-20,-18,40,15,'#c7ac7b',pal.ink);rect(c,-17,-3,6,17,'#546a56');rect(c,11,-3,6,17,'#546a56');}
  else if(kind==='picture'){rect(c,-24,-48,48,34,'#a27d4d',pal.ink);rect(c,-18,-42,36,22,'#8db5ad');rect(c,-12,-31,22,11,'#557b5d');rect(c,8,-38,6,6,pal.gold);}
  else if(kind==='book')parcel(c,0,-17,'book',.85);
  c.restore();
}
room.draw=function(c,r) {
  const d=r.data,s=D.roomRounds[d.round%8],point=a=>({x:345+a[0]*76,y:232+a[1]*57}),a=point(s.at),b=point(d.pos);
  rect(c,0,0,960,540,'#78988b');rect(c,273,154,506,293,pal.ink);rect(c,280,160,492,64,'#e2ccb0');rect(c,280,224,492,216,'#c4a37b');
  for(let y=0;y<4;y++)for(let x=0;x<6;x++){
    const p=point([x,y]);rect(c,p.x-36,p.y-25,72,53,(x+y)%2?'#d7b992':'#e2c8a2','#b79770');
    if(d.hint&&s.goals.some(g=>g[0]===x&&g[1]===y))rect(c,p.x-33,p.y-22,66,47,'#9ac49f','#50866d');
  }
  plaque(c,s.relation==='above'?'WALL':'BACK OF THE ROOM',526,176,174);
  const labels=[];
  function ref(at,kind){furniture(c,kind,at.x,at.y,1);labels.push([kind==='sofas'?'sofa':kind,at.x,at.y+23]);}
  if(s.relation==='above'){rect(c,511,211,109,176,'#e4d3b8','#c3ac8c');ref({x:a.x,y:388},'table');}
  else if(s.relation==='behind'&&d.pos[1]<s.at[1]){furniture(c,s.item,b.x,b.y);ref(a,s.ref);}
  else ref(a,s.ref);
  if(s.other)ref(point(s.other),'sofa');
  if(!(s.relation==='behind'&&d.pos[1]<s.at[1]))furniture(c,s.item,b.x,b.y);
  if(d.picked){c.save();c.strokeStyle=pal.teal;c.lineWidth=3;c.setLineDash([5,3]);c.strokeRect(b.x-34,b.y-61,68,78);c.restore();}
  // Labels are drawn last, away from both the reference and the movable object.
  labels.push([s.name,b.x,b.y+27]);
  const placed=[];
  for(const [name,x,y]of labels){
    let px=x,py=y;
    while(placed.some(p=>Math.abs(p.x-px)<85&&Math.abs(p.y-py)<27))py+=27;
    if(py>430){px=clamp(px+70,330,714);py=clamp(y-75,205,415);}
    plaque(c,name,px,py,Math.max(66,name.length*8+16));placed.push({x:px,y:py});
  }
  rect(c,292,454,45,25,'#a77c52',pal.ink);text(c,'BOX',314,467,10,pal.paper);
  plaque(c,'ENTRANCE',526,467,142);
};

// RHYTHM: nearest eligible note, consistent stage boundaries and varied patterns.
const rhythm=C.rhythm,oldRhythmCreate=rhythm.create.bind(rhythm);
const trackNames=['Primeiro pulso','Respostas da rua','Encontro de timbres','Contratempos','Vozes em roda','Banda completa'];
const laneColors=[pal.gold,'#c1a9d4',pal.teal,pal.red];
rhythm.controls=function(r,host){
  ['D','F','J','K'].forEach((k,i)=>{const b=P.button('pg-drum'+i,k,()=>{},'pg-drum');b.setAttribute('aria-label','Tocar faixa '+k);b.onclick=null;b.onpointerdown=e=>{e.preventDefault();V.Audio.unlock();P.action('drum',i);};host.append(b);});
};
rhythm.pointer=function(r,type,p){if(type==='down'&&p.x>=281&&p.x<=679&&p.y>=175&&p.y<=477)P.action('drum',clamp(Math.floor((p.x-281)/100),0,3));};
rhythm.create=function(training){
  const d=oldRhythmCreate(training);if(training)return d;
  let at=2;
  d.notes=Array.from({length:48},(_,i)=>{
    const stage=Math.floor(i/8),j=i%8,lane=[0,1,2,3,2,1,3,0][(j+stage)%8];
    const note={lane:stage%2?3-lane:lane,at,done:false};
    at+=[.88,.8,.72,.68,.64,.6][stage]*(j%4===2&&stage>1?.75:1);return note;
  });d.perfect=0;d.good=0;return d;
};
function rhythmResolve(r){
  const d=r.data;if(r.training){if(r.step===1)P.event('rhythm-hit');else if(d.hit>=4)P.event('rhythm-sequence');return;}
  if(d.resolved%8===0){P.stageClear(r,d.resolved/8-1);if(d.resolved>=d.notes.length)P.finish();}
}
rhythm.model=function(r){
  const d=r.data,n=Math.min(5,Math.floor(d.resolved/8));
  return {request:r.training?'Acerte os sinais na linha dourada':'Arranjo '+(n+1)+'/6 · '+trackNames[n],
    support:d.hit+' acertos · '+(d.perfect||0)+' perfeitos · '+(d.resolved-d.hit)+' perdidos · D F J K',
    progress:r.training?d.hit:d.resolved,total:r.training?(r.step===2?4:1):48,
    hint:r.calm?'Modo tranquilo: cada nota espera na linha.':'Acerte na linha dourada. O som é opcional; letras e cores indicam a faixa.'};
};
rhythm.action=function(r,name,n){
  if(name!=='drum'||!Number.isInteger(n)||n<0||n>3)return;
  const d=r.data;r.moves++;d.flash[n]=.16;V.Audio.drum(n%2?'hat':'kick');
  if(r.training&&r.step===0){if(n===0)P.event('drum');return;}
  const window=[.35,.25,.19][P.difficulty(r)],note=d.notes.filter(a=>!a.done&&a.lane===n).sort((a,b)=>Math.abs(a.at-d.time)-Math.abs(b.at-d.time))[0];
  if(!note||Math.abs(note.at-d.time)>window){P.feedback('Espere o sinal desta faixa chegar à linha.',!r.training);d.judgement='ESPERE';d.judgeTime=.4;return;}
  const error=Math.abs(note.at-d.time),perfect=error<=.09;
  note.done=true;d.hit++;d.resolved++;d.perfect=(d.perfect||0)+(perfect?1:0);d.good=(d.good||0)+(perfect?0:1);
  d.judgement=perfect?'PERFEITO!':'NO TEMPO!';d.judgeTime=.65;P.hit(perfect?100:70);P.feedback(d.judgement);rhythmResolve(r);
};
rhythm.update=function(r,dt){
  const d=r.data;d.flash=d.flash.map(t=>Math.max(0,t-dt));d.judgeTime=Math.max(0,(d.judgeTime||0)-dt);
  if(r.training&&r.step===0)return;const next=d.notes.find(n=>!n.done);if(!next)return;
  const before=d.time;d.time+=dt;
  if(r.calm&&d.time>=next.at)d.time=next.at;
  const beat=Math.floor(d.time/.5);
  if(!r.training&&!V.settings.muted&&beat!==Math.floor(before/.5))V.Audio.drum(beat%4===0?'kick':'hat');
  const window=[.35,.25,.19][P.difficulty(r)];
  if(!r.calm&&d.time>next.at+window){next.done=true;d.resolved++;r.mistakes++;r.combo=0;d.judgement='PRÓXIMA!';d.judgeTime=.55;r.feedback='Sinal perdido. Continue na próxima nota.';rhythmResolve(r);}
};
rhythm.draw=function(c,r){
  const d=r.data,t=V.settings.reducedMotion?0:r.elapsed;
  rect(c,0,0,960,540,'#19383b');rect(c,40,161,880,322,'#284b49',pal.ink);
  rect(c,55,164,850,13,'#547362');
  for(let i=0;i<8;i++){rect(c,55+i*112,180,7,270,'#355b52');rect(c,60+i*112,180,31,6,'#4d7663');}
  for(let i=0;i<4;i++){
    const x=330+i*100;rect(c,x-45,176,90,267,'#193d3d','#6b8d79');
    if(d.flash[i]>0){c.save();c.globalAlpha=.28;rect(c,x-43,178,86,263,laneColors[i]);c.restore();}
    for(let j=0;j<6;j++)rect(c,x-35,186+j*37,70,1,'#375b52');
    rect(c,x-42,432,84,44,d.flash[i]>0?laneColors[i]:'#325850',laneColors[i]);text(c,['D','F','J','K'][i],x,454,22,d.flash[i]>0?pal.ink:laneColors[i]);
  }
  stroke(c,[[281,416],[680,416]],pal.gold,5);
  const speed=[116,135,155][P.difficulty(r)];
  for(const n of d.notes){
    if(n.done)continue;const y=416-(n.at-d.time)*speed;if(y<178||y>436)continue;
    const x=330+n.lane*100;rect(c,x-35,y-12,70,25,laneColors[n.lane],pal.paper);text(c,['D','F','J','K'][n.lane],x,y,13,pal.ink);
  }
  for(let side=0;side<2;side++){
    const x=145+side*665;V.Assets.sprite(c,side?'percussionist':'musician',x,375,0,V.settings.reducedMotion?0:Math.floor(t*(r.combo?6:2))%4,84);
    for(let j=0;j<6;j++){const h=12+Math.min(45,r.combo*3)*(.3+.7*Math.abs(Math.sin(t*3+j)));rect(c,x-43+j*15,444-h,10,h,laneColors[(j+side)%4]);}
    plaque(c,side?'PERCUSSION':'VOICES',x,464,130);
  }
  if(d.judgeTime>0)plaque(c,d.judgement,480,194,150,pal.gold);
};

// BRIDGES: undo and reset without losing previous stages; every connector is visible.
const bridges=C.bridges,oldBridgeAction=bridges.action.bind(bridges),oldBridgeUpdate=bridges.update.bind(bridges);
const dirs=[[0,-1],[1,0],[0,1],[-1,0]],ports=cell=>cell.base.map(n=>(n+cell.rot)%4);
function bridgeLink(d){
  if(!ports(d.cells[10]).includes(3))return {seen:[],path:null};
  const q=[10],prev=new Map([[10,null]]);
  for(let i=0;i<q.length;i++){
    const at=q[i];if(at===14&&ports(d.cells[at]).includes(1)){const path=[];let n=at;while(n!==null){path.unshift(n);n=prev.get(n);}return{seen:[...prev.keys()],path};}
    for(const p of ports(d.cells[at])){const x=at%5+dirs[p][0],y=Math.floor(at/5)+dirs[p][1],n=y*5+x;
      if(x<0||x>4||y<0||y>4||prev.has(n)||!ports(d.cells[n]).includes((p+2)%4))continue;prev.set(n,at);q.push(n);}
  }return{seen:[...prev.keys()],path:null};
}
bridges.controls=function(r,host){
  host.append(P.button('pg-undo','↶ Desfazer · Z',()=>P.action('undo')),P.button('pg-rotate','Girar · E',()=>P.action('rotate')),P.button('pg-action','Atravessar · C',()=>P.action('cross'),'primary'),P.button('pg-reset','Reiniciar fase',()=>P.action('reset')));
};
bridges.key=function(r,k){
  const dir={arrowup:[0,-1],w:[0,-1],arrowdown:[0,1],s:[0,1],arrowleft:[-1,0],a:[-1,0],arrowright:[1,0],d:[1,0]}[k];
  if(dir){P.action('move',dir);return true;}if(k==='z'){P.action('undo');return true;}if(k==='r'){P.action('reset');return true;}
  if(['e','enter',' '].includes(k)){P.action('rotate');return true;}if(k==='c'){P.action('cross');return true;}return false;
};
bridges.action=function(r,name,arg){
  const d=r.data;if(d.crossing)return;
  if(name==='undo'){const h=d.history?.pop();if(h){d.cells[h.index].rot=h.rot;d.cursor=[h.index%5,Math.floor(h.index/5)];P.feedback('Última rotação desfeita.');}return;}
  if(name==='reset'){r.data=this.create(r.training,d.stage);P.feedback('Passarela reiniciada. As outras fases continuam concluídas.');return;}
  if(name==='rotate'){const index=d.cursor[1]*5+d.cursor[0];d.history||=[];d.history.push({index,rot:d.cells[index].rot});d.history=d.history.slice(-100);}
  return oldBridgeAction(r,name,arg);
};
bridges.update=function(r,dt){const old=r.data.stage;oldBridgeUpdate(r,dt);if(r.data.stage!==old)r.data.history=[];};
bridges.draw=function(c,r){
  const d=r.data,link=bridgeLink(d),point=i=>({x:430+i%5*68,y:207+Math.floor(i/5)*47});
  rect(c,0,0,960,540,'#94b69d');rect(c,365,166,405,302,'#467f88');
  for(let j=0;j<11;j++)stroke(c,[[375+(j%2)*9,176+j*27],[755,176+j*27]],'#70aaad',2);
  rect(c,276,170,85,290,'#bbc79f');rect(c,773,170,85,290,'#bbc79f');
  d.cells.forEach((cell,i)=>{
    const p=point(i),lit=link.seen.includes(i);rect(c,p.x-30,p.y-21,60,42,lit?'#e5c88f':'#8d9b80',pal.ink);
    for(const port of ports(cell)){
      const [dx,dy]=dirs[port],end=[p.x+dx*34,p.y+dy*23.5];
      stroke(c,[[p.x,p.y],end],lit?'#ae8455':'#526c59',15);
      stroke(c,[[p.x,p.y],end],lit?pal.gold:'#a0ad89',3);
    }
    rect(c,p.x-3,p.y-3,6,6,lit?pal.paper:'#63836b');
    if(i===d.cursor[1]*5+d.cursor[0]||i===d.hint){c.save();c.strokeStyle=i===d.hint?pal.gold:pal.paper;c.lineWidth=3;c.strokeRect(p.x-32,p.y-23,64,46);c.restore();}
  });
  plaque(c,'START',319,369,74);plaque(c,'FINISH',815,369,82);
  rect(c,319,290,79,22,'#ba9a6a',pal.paper);rect(c,731,290,82,22,link.path?pal.gold:'#ba9a6a',pal.paper);
  let pos={x:339,y:301};
  if(d.crossing){const ps=[pos,...d.crossing.path.map(point),{x:807,y:301}],i=Math.min(ps.length-2,Math.floor(d.crossing.t)),f=clamp(d.crossing.t-i,0,1);pos={x:ps[i].x+(ps[i+1].x-ps[i].x)*f,y:ps[i].y+(ps[i+1].y-ps[i].y)*f};}
  P.person(c,pos.x,pos.y+8,!!d.crossing,2,54);leaf(c,312,441,1);leaf(c,816,441,1);
  plaque(c,link.path?'CONNECTED · CROSS!':'CONNECT THE TWO BANKS',566,454,264,link.path?pal.gold:pal.paper);
};

// MUSEUM: authored rooms, pathfinding, deadlock warning and score-safe undo.
const museum=C.museum;
const museumRooms=[
  ['#######','#.....#','#..G..#','#..B..#','#..P..#','#.....#','#######'],
  ['#######','#.....#','#.G.G.#','#..B..#','#.B...#','#..P..#','#######'],
  ['########','#......#','#.G..G.#','#..B.B.#','#......#','#.#P...#','#......#','########'],
  ['########','#...G..#','#......#','#.B#...#','#...B..#','#.G.P..#','#......#','########'],
  ['########','#..G...#','#......#','#.B.BG.#','#......#','#..B.P.#','#....G.#','########'],
  ['########','#.G..G.#','#......#','#.B#B..#','#......#','#...B..#','#.G.P..#','########']
];
function museumParse(stage,training){
  const rows=museumRooms[training?1:stage],walls=[],boxes=[],goals=[];let player=[3,4];
  rows.forEach((row,y)=>[...row].forEach((ch,x)=>{if(ch==='#')walls.push(x+','+y);if(ch==='B')boxes.push([x,y]);if(ch==='G')goals.push([x,y]);if(ch==='P')player=[x,y];}));
  return {stage,w:rows[0].length,h:rows.length,walls,boxes,goals,player,moves:0,history:[],solved:false,awarded:[],walkQueue:[]};
}
const cellKey=p=>p.join(','),same=(a,b)=>a[0]===b[0]&&a[1]===b[1];
museum.create=(training,start=0)=>museumParse(start,training);
museum.action=function(r,name,arg){
  const d=r.data;
  if(name==='reset'){r.data=museumParse(d.stage,r.training);r.data.awarded=(d.awarded||[]).slice();P.feedback('Sala reorganizada. Escolha uma nova rota.');return;}
  if(name==='undo'){
    const last=d.history.pop();d.walkQueue=[];
    if(last){d.player=last.player;d.boxes=last.boxes;d.moves=last.moves;d.solved=false;P.feedback('Último passo desfeito.');}return;
  }
  if(name!=='move'||d.solved||!arg)return;
  const [dx,dy]=arg,n=[d.player[0]+dx,d.player[1]+dy],walls=new Set(d.walls),idx=d.boxes.findIndex(b=>same(b,n));
  if(n[0]<0||n[0]>=d.w||n[1]<0||n[1]>=d.h||walls.has(cellKey(n)))return;
  let beyond;
  if(idx>=0){beyond=[n[0]+dx,n[1]+dy];if(walls.has(cellKey(beyond))||d.boxes.some(b=>same(b,beyond)))return;}
  d.history.push({player:d.player.slice(),boxes:d.boxes.map(b=>b.slice()),moves:d.moves});d.history=d.history.slice(-150);
  d.player=n;d.moves++;r.moves++;P.event('museum-walk');
  if(idx>=0){
    d.boxes[idx]=beyond;P.event('museum-push');d.awarded||=[];
    if(d.goals.some(g=>same(g,beyond))&&!d.awarded.includes(cellKey(beyond))){d.awarded.push(cellKey(beyond));P.hit(40);}
    const corner=(walls.has((beyond[0]-1)+','+beyond[1])||walls.has((beyond[0]+1)+','+beyond[1]))&&(walls.has(beyond[0]+','+(beyond[1]-1))||walls.has(beyond[0]+','+(beyond[1]+1)));
    if(corner&&!d.goals.some(g=>same(g,beyond)))P.feedback('Esta vitrine ficou presa no canto. Use Desfazer · Z.');
  }
  if(d.goals.every(g=>d.boxes.some(b=>same(g,b)))){
    d.solved=true;d.walkQueue=[];P.event('museum-complete');if(r.training)return;
    P.hit(260);P.stageClear(r,d.stage);if(d.stage>=5)P.finish();else {r.data=museumParse(d.stage+1,false);P.feedback('✓ Galeria restaurada! Entre na próxima sala.');}
  }
};
museum.pointer=function(r,type,p){
  if(type!=='down')return;const d=r.data,size=d.w===8?54:63,ox=480-(d.w-1)*size/2,oy=312-(d.h-1)*size/2;
  const goal=[Math.round((p.x-ox)/size),Math.round((p.y-oy)/size)],dx=goal[0]-d.player[0],dy=goal[1]-d.player[1];
  if(Math.abs(dx)+Math.abs(dy)===1){this.action(r,'move',[dx,dy]);return;}
  const wall=new Set([...d.walls,...d.boxes.map(cellKey)]),path=route({x:d.player[0],y:d.player[1]},{x:goal[0],y:goal[1]},d.w,d.h,(x,y)=>wall.has(x+','+y));
  if(path)d.walkQueue=path;
};
museum.update=function(r,dt){
  const d=r.data;if(!d.walkQueue?.length)return;
  d.walkClock=(d.walkClock||0)+dt;if(d.walkClock<.12)return;d.walkClock=0;
  const n=d.walkQueue.shift();this.action(r,'move',[n.x-d.player[0],n.y-d.player[1]]);
};
museum.draw=function(c,r){
  const d=r.data,size=d.w===8?54:63,ox=480-(d.w-1)*size/2,oy=312-(d.h-1)*size/2;
  rect(c,0,0,960,540,'#345654');
  for(let y=0;y<d.h;y++)for(let x=0;x<d.w;x++){
    const px=ox+x*size,py=oy+y*size,wall=d.walls.includes(x+','+y);rect(c,px-size/2+1,py-size/2+1,size-2,size-2,wall?'#426d5d':(x+y)%2?'#d8c7a6':'#e5d4b4',wall?'#35584d':'#c4ad88');
    if(wall){rect(c,px-size/2+5,py-size/2+5,size-10,8,'#76927b');rect(c,px-size/2+5,py+5,size-10,2,'#32574c');}
  }
  for(const [x,y]of d.goals){const px=ox+x*size,py=oy+y*size;c.save();c.translate(px,py);c.rotate(Math.PI/4);c.strokeStyle='#4d9185';c.lineWidth=4;c.strokeRect(-13,-13,26,26);c.restore();}
  for(const [x,y]of d.boxes){
    const px=ox+x*size,py=oy+y*size,on=d.goals.some(g=>g[0]===x&&g[1]===y);
    rect(c,px-22,py-21,44,43,on?'#88bdab':'#c5986d',pal.ink);rect(c,px-16,py-16,32,24,'#a9c7bf',pal.paper);rect(c,px-8,py-11,16,16,on?'#5b987a':'#a58161');rect(c,px-18,py+10,36,5,'#7b644b');
  }
  P.person(c,ox+d.player[0]*size,oy+d.player[1]*size+10,!!d.walkQueue?.length,0,45);
  plaque(c,'GALLERY '+(d.stage+1)+' / 6',480,96,194);
};

// MEMORY: patrols need time and a clear sightline to detect the player.
const memory=C.memory;
const memoryDest={library:{x:10,y:1,name:'Library',color:'#86b2ac'},museum:{x:10,y:5,name:'Museum',color:'#d6af7a'},square:{x:1,y:1,name:'Town Square',color:'#ab9dbe'}};
const memoryPoint=p=>({x:154+p.x*60,y:150+p.y*43});
function memorySight(d,g){
  const steps=Math.ceil(Math.hypot(d.player.x-g.x,d.player.y-g.y)*5);
  for(let i=1;i<steps;i++){const x=Math.round(g.x+(d.player.x-g.x)*i/steps),y=Math.round(g.y+(d.player.y-g.y)*i/steps);if(d.blocked.includes(x+','+y))return false;}
  return true;
}
const memoryTarget=d=>d.tasks[Math.min(d.done,d.tasks.length-1)];
memory.model=function(r){
  const d=r.data,t=memoryTarget(d),dest=memoryDest[t.to],target=d.carried?dest:{x:t.at[0],y:t.at[1]},near=Math.hypot(d.player.x-target.x,d.player.y-target.y)<1.3;
  return {request:'Stage '+(d.stage+1)+'/6 · '+(d.carried?'Deliver the '+t.item+' to the '+dest.name:'Find the '+t.item),
    support:d.done+'/'+d.tasks.length+' deliveries · Alert '+Math.round((d.alert||0)*100)+'% · Walls block vision',
    progress:d.done,total:d.tasks.length,action:near?(d.carried?'Deliver · E':'Pick up · E'):'Move closer',disabled:!near,
    hint:d.invuln>0?'Temporarily protected. Find your route.':'Stay outside patrol circles. If spotted, leave before the alert bar fills.'};
};
memory.controls=function(r,host){pad(host,null,true);host.append(P.button('pg-action','Interagir · E',()=>P.action('use'),'primary'));};
memory.key=function(r,k){
  if(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d'].includes(k))return true;
  if(['e','enter',' '].includes(k)){P.action('use');return true;}return false;
};
const oldMemoryAction=memory.action.bind(memory);
memory.action=function(r,name,arg){
  const d=r.data;if(name==='step'){const old={...d.player};oldMemoryAction(r,name,arg);if(d.player.x!==old.x||d.player.y!==old.y){d.from=old;d.lerp=0;}return;}
  if(name!=='use')return;
  const t=memoryTarget(d),goal=d.carried?memoryDest[t.to]:{x:t.at[0],y:t.at[1]};
  if(Math.hypot(d.player.x-goal.x,d.player.y-goal.y)>=1.3)return;
  const was=d.carried,score=r.score,combo=r.combo,best=r.bestCombo;
  // Picking up the same dropped record cannot be farmed for points.
  d.pickupAwards||=[];const already=d.pickupAwards.includes(d.done);
  if(!was&&!already)d.pickupAwards.push(d.done);
  oldMemoryAction(r,name,arg);
  if(!was&&already){r.score=score;r.combo=combo;r.bestCombo=best;P.fx=[];}
};
memory.update=function(r,dt){
  const d=r.data;d.invuln=Math.max(0,d.invuln-dt);d.lerp=clamp((d.lerp??1)+dt/.14,0,1);
  const input=V.Input.axis(),ax=input.x+P.held.x,ay=input.y+P.held.y;
  d.moveClock=(d.moveClock||0)+dt;
  if(Math.abs(ax)+Math.abs(ay)>.15){d.route=[];if(d.moveClock>.15){d.moveClock=0;this.action(r,'step',Math.abs(ax)>Math.abs(ay)?[Math.sign(ax),0]:[0,Math.sign(ay)]);}}
  else if(d.route.length&&d.moveClock>.19){d.moveClock=0;const next=d.route.shift(),rest=d.route.slice();this.action(r,'step',[next[0]-d.player.x,next[1]-d.player.y]);d.route=rest;}
  if(r.training)return;
  const difficulty=P.difficulty(r),radius=[1.45,1.75,1.95][difficulty];d.radius=radius;
  for(const [i,g]of d.guards.entries()){g.phase+=dt*[.45,.65,.85][difficulty];g.y=clamp(g.base+Math.sin(g.phase+i)*1.6,.2,5.8);}
  const seen=d.invuln<=0&&d.guards.some(g=>Math.hypot(d.player.x-g.x,d.player.y-g.y)<radius&&memorySight(d,g));
  d.alert=clamp((d.alert||0)+dt*(seen?[.7,.95,1.2][difficulty]:-1.5),0,1);
  if(d.alert>=1){d.alert=0;d.invuln=2.7;d.player={x:1,y:5};d.from={...d.player};d.lerp=1;d.route=[];d.carried=false;P.feedback('Spotted! Your record returned to its pickup point. Use the walls for cover.',true);}
};
memory.draw=function(c,r){
  const d=r.data,t=memoryTarget(d);
  rect(c,0,0,960,540,'#426d65');rect(c,112,116,730,354,'#b7b49a',pal.ink);
  for(let y=0;y<=6;y++)for(let x=0;x<=11;x++){const p=memoryPoint({x,y});rect(c,p.x-29,p.y-20,58,40,(x+y)%2?'#d1c6a9':'#c3b798','#b0a081');}
  for(const g of d.guards){
    const p=memoryPoint(g),radius=d.radius||1.75;c.save();c.beginPath();c.ellipse(p.x,p.y,radius*60,radius*43,0,0,Math.PI*2);
    c.fillStyle=d.alert>0?'#df88672a':'#e6aa7219';c.fill();c.strokeStyle=d.alert>0?'#f8b18a':'#ddab7d';c.lineWidth=2;c.setLineDash([7,6]);c.stroke();c.restore();
  }
  for(const wall of d.blocked){const [x,y]=wall.split(',').map(Number),p=memoryPoint({x,y});rect(c,p.x-28,p.y-22,56,42,'#4a755d',pal.ink);rect(c,p.x-22,p.y-17,44,9,'#87a07a');stroke(c,[[p.x-25,p.y+5],[p.x+25,p.y+5]],'#365846',2);}
  for(const s of Object.values(memoryDest)){
    const p=memoryPoint(s);rect(c,p.x-32,p.y-28,64,52,s.color,pal.ink);rect(c,p.x-37,p.y-40,74,14,'#456c59',pal.ink);
    for(const wx of [p.x-23,p.x+10]){rect(c,wx,p.y-16,14,16,pal.paper,pal.ink);}
    rect(c,p.x-9,p.y+2,18,22,'#35594c');rect(c,p.x-20,p.y+24,40,4,'#d7c59e');plaque(c,s.name,p.x,p.y-54,Math.max(92,s.name.length*8+12));
  }
  if(d.route.length){c.save();c.setLineDash([5,5]);stroke(c,[memoryPoint(d.player),...d.route.map(a=>memoryPoint({x:a[0],y:a[1]}))].map(p=>[p.x,p.y]),pal.gold,3);c.restore();}
  if(!d.carried){const p=memoryPoint({x:t.at[0],y:t.at[1]});parcel(c,p.x,p.y-7,t.item);plaque(c,t.item,p.x,p.y-35,104);}
  for(const g of d.guards){const p=memoryPoint(g);P.person(c,p.x,p.y+8,true,0,45);plaque(c,'GUARD',p.x,p.y-42,58,'#efc69e');}
  const p=memoryPoint(d.player),from=d.from?memoryPoint(d.from):p,f=d.lerp??1,x=from.x+(p.x-from.x)*f,y=from.y+(p.y-from.y)*f;
  P.person(c,x,y+8, f<1,0,50);if(d.carried)parcel(c,x+19,y-20,t.item,.6);
  if(!r.training){rect(c,290,485,380,18,pal.ink,pal.paper);rect(c,294,489,372*(d.alert||0),10,pal.red);text(c,d.invuln>0?'PROTECTED':'DETECTION',480,519,12,pal.paper);}
};
// PLATFORM: unified physics, jump buffer, checkpoints and gated boss exits.
const platform=C.platform,oldPlatformCreate=platform.create.bind(platform),oldPlatformDraw=platform.draw.bind(platform);
function platformReady(r) {
  const d=r.data;
  if(!r.training&&!Array.isArray(d.enemies)){const fresh=oldPlatformCreate(false,d.stage||0);for(const key of ['enemies','boss','hearts','power','checkpoint','defeated'])if(d[key]===undefined)d[key]=fresh[key];}
  d.hearts??=3;d.power??=100;d.enemies||=[];d.bolts||=[];d.shards||=[];d.enemyBolts||=[];
  d.attackCooldown??=0;d.dashCooldown??=0;d.checkpoint??=70;d.defeated??=0;d.invuln??=0;
  d.notes||=[];d.coins||=[];d.wordIndex||=[];return d;
}
platform.create=function(training,start=0){
  const d=oldPlatformCreate(training,start);platformReady({data:d,training});d.y=455;d.grounded=true;return d;
};
platform.controls=function(r,host){
  for(const [id,label,dir]of [['left','←',-1],['right','→',1]]){
    const b=P.button('pg-'+id,label,()=>{});b.setAttribute('aria-label',dir<0?'Mover à esquerda':'Mover à direita');
    b.onpointerdown=e=>{e.preventDefault();V.Audio.unlock();b.setPointerCapture?.(e.pointerId);P.held={x:dir,y:0};};
    b.onpointerup=b.onpointercancel=b.onlostpointercapture=()=>{P.held={x:0,y:0};};host.append(b);
  }
  host.append(P.button('pg-action','Saltar · espaço',()=>P.action('jump'),'primary'),P.button('pg-drop','↓ Descer',()=>P.action('drop')),P.button('pg-attack','Energia · J',()=>P.action('attack')),P.button('pg-dash','Impulso · K',()=>P.action('dash')));
};
const oldPlatformKey=platform.key.bind(platform);
platform.key=function(r,k,e){if(['arrowdown','s'].includes(k)){P.action('drop');return true;}return oldPlatformKey(r,k,e);};
platform.model=function(r){
  const d=platformReady(r);
  return {request:(r.training?'Treino':'Fase '+(d.stage+1)+'/6')+' · '+d.title,
    support:d.wordIndex.length+'/'+d.required+' palavras · '+d.hearts+' vidas · energia '+Math.floor(d.power)+'%'+(d.boss?.alive?' · guardião '+d.boss.hp+'/'+d.boss.max:''),
    progress:Math.min(d.required,d.wordIndex.length),total:d.required,action:'Saltar · espaço',
    hint:d.boss?.alive?'Colete palavras e derrote o guardião para abrir o portal. J ataca · K dá impulso.':'Salte, colete as palavras e alcance o portal. J ataca · K dá impulso.'};
};
platform.action=function(r,name){
  const d=platformReady(r);
  if(name==='drop'){if(d.grounded&&d.y<450){d.dropTimer=.24;d.y+=8;d.vy=90;d.grounded=false;r.moves++;}return;}
  if(name==='jump'){
    d.jumpBuffer=.14;
    if(d.grounded||d.coyote>0){d.vy=-515;d.grounded=false;d.coyote=0;d.jumpBuffer=0;d.jumpHeld=V.Input.down(' ')||V.Input.down('w')||V.Input.down('arrowup');r.moves++;P.event('platform-jump');V.Audio.sfx('menu');}return;
  }
  if(name==='attack'){
    if(r.training)return P.feedback('No treino, pratique o salto e colete a palavra. J lança energia durante a partida.');
    if(d.attackCooldown>0)return;if(d.power<8)return P.feedback('A energia está recarregando.');
    d.attackCooldown=.25;d.power-=8;r.moves++;d.bolts.push({x:d.x+(d.facing===1?-23:23),y:d.y-37,dir:d.facing===1?-1:1,life:1.1});V.Audio.sfx('menu');return;
  }
  if(name==='dash'){
    if(r.training)return;
    if(d.dashCooldown>0)return;if(d.power<28)return P.feedback('O impulso precisa de 28 de energia.');
    d.power-=28;d.dash=.18;d.dashDir=d.facing===1?-1:1;d.dashGlow=.3;d.invuln=Math.max(d.invuln,.28);d.dashCooldown=.85;r.moves++;
  }
};
platform.update=function(r,dt){
  const d=platformReady(r),diff=P.difficulty(r);
  d.elapsed+=dt;d.invuln=Math.max(0,d.invuln-dt);d.attackCooldown=Math.max(0,d.attackCooldown-dt);d.dashCooldown=Math.max(0,d.dashCooldown-dt);d.dashGlow=Math.max(0,(d.dashGlow||0)-dt);
  d.jumpBuffer=Math.max(0,(d.jumpBuffer||0)-dt);d.finishWait=Math.max(0,d.finishWait-dt);d.power=clamp(d.power+dt*12,0,100);
  d.dropTimer=Math.max(0,(d.dropTimer||0)-dt);
  let axis=clamp(V.Input.axis().x+P.held.x,-1,1);
  if(axis){d.facing=axis>0?2:1;P.event('platform-walk');}
  const wasX=d.x,wasY=d.y;
  if(d.dash>0){d.x+=d.dashDir*680*dt;d.dash=Math.max(0,d.dash-dt);}else d.x+=axis*[240,275,305][diff]*dt;
  d.x=clamp(d.x,30,d.length-30);
  const jumpPressed=V.Input.down(' ')||V.Input.down('w')||V.Input.down('arrowup');
  // Touch jump uses the full impulse; keyboard can release for a shorter jump.
  if(d.jumpHeld&&!jumpPressed&&d.vy< -190)d.vy=-190;
  if(!jumpPressed)d.jumpHeld=false;
  d.vy=clamp(d.vy+1120*dt,-650,700);d.y+=d.vy*dt;d.grounded=false;
  const surfaces=[{x:0,y:455,w:d.length},...(d.dropTimer>0?[]:d.platforms)].filter(p=>d.x>=p.x-10&&d.x<=p.x+p.w+10&&d.vy>=0&&wasY<=p.y+4&&d.y>=p.y);
  surfaces.sort((a,b)=>a.y-b.y);
  if(surfaces.length){d.y=surfaces[0].y;d.vy=0;d.grounded=true;d.coyote=.12;if(d.jumpBuffer>0)this.action(r,'jump');}
  else d.coyote=Math.max(0,(d.coyote||0)-dt);
  if(d.x!==wasX)d.walkDistance=(d.walkDistance||0)+Math.abs(d.x-wasX);
  for(const [i,n]of d.notes.entries())if(!d.wordIndex.includes(i)&&Math.hypot(d.x-n.x,d.y-25-n.y)<51){
    d.wordIndex.push(i);P.hit(80);if(!r.training)V.PixCollection.collect(n.word,'Palavras em Movimento');P.feedback('✓ '+n.word+' coletada!');P.event('platform-word');
  }
  for(let i=0;i<Math.ceil(d.length/220);i++)if(!d.coins.includes(i)&&Math.hypot(d.x-(200+i*220),d.y-24-400)<38){d.coins.push(i);d.power=clamp(d.power+8,0,100);P.hit(15);}
  function damage(message){
    if(r.training||d.invuln>0)return;
    d.hearts--;d.invuln=1.6;d.respawns++;d.vy=-190;d.x=clamp(d.x-(d.facing===1?-38:38),30,d.length-30);P.feedback(message,true);
    if(d.hearts<=0){d.hearts=3;d.x=Math.max(70,Math.min(d.checkpoint,d.length-300));d.y=455;d.vy=0;d.enemyBolts=[];P.feedback('Checkpoint restaurado. Suas palavras coletadas continuam com você.');}
  }
  if(d.y>525){d.x=Math.max(70,d.checkpoint);d.y=455;d.vy=0;damage('Volte pelo ponto de controle.');}
  if(!r.training){
    if(d.grounded&&d.hazards.every(x=>Math.abs(x-d.x)>70)){
      const reached=d.x>1210?1190:d.x>660?640:70;if(reached>d.checkpoint){d.checkpoint=reached;P.feedback('✓ Checkpoint! Suas palavras estão guardadas.');}
    }
    if(d.hazards.some(x=>Math.abs(d.x-x)<26&&d.y>414))damage('Barreira! Salte ou use o impulso.');
    for(const e of d.enemies){
      if(!e.alive)continue;e.phase+=dt*(1+d.stage*.08);e.x=e.home+Math.sin(e.phase)*42;
      if(Math.abs(d.x-e.x)<31&&Math.abs(d.y-31-e.y)<39){
        if(d.vy>80&&wasY-10<e.y-20){e.hp--;d.vy=-325;d.invuln=Math.max(d.invuln,.15);if(e.hp<=0)defeat(e);}
        else damage('Guardião no caminho! Salte por cima ou use J.');
      }
    }
    if(d.boss?.alive){
      const b=d.boss;b.phase+=dt;b.shotClock=(b.shotClock||0)+dt;
      b.warning=b.shotClock>[3.8,3.2,2.6][diff]-.65;
      if(b.shotClock>[3.8,3.2,2.6][diff]){
        b.shotClock=0;b.warning=false;
        const dx=d.x-b.x,dy=d.y-30-(b.y-20),len=Math.max(1,Math.hypot(dx,dy)),speed=[150,185,220][diff];
        d.enemyBolts.push({x:b.x,y:b.y-20,vx:dx/len*speed,vy:dy/len*speed,life:6});
      }
      if(Math.abs(d.x-b.x)<54&&Math.abs(d.y-34-b.y)<55)damage('Guardião! Afaste-se e lance energia com J.');
    }
    for(const b of d.bolts){
      b.x+=b.dir*650*dt;b.life-=dt;if(b.life<=0)continue;
      const target=d.enemies.find(e=>e.alive&&Math.abs(e.x-b.x)<31&&Math.abs(e.y-b.y)<46);
      if(target){target.hp--;b.life=0;if(target.hp<=0)defeat(target);continue;}
      if(d.boss?.alive&&Math.abs(d.boss.x-b.x)<53&&Math.abs(d.boss.y-b.y)<64){
        d.boss.hp--;b.life=0;if(d.boss.hp<=0){d.boss.alive=false;d.enemyBolts=[];d.power=100;P.hit(400);P.feedback('✓ Guardião vencido! Colete as palavras restantes e abra o portal.');}
      }
    }
    for(const b of d.enemyBolts){b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;if(Math.hypot(d.x-b.x,d.y-30-b.y)<26){damage('Sinal de energia! Salte para desviar.');b.life=0;}}
  }
  function defeat(e){e.alive=false;d.defeated++;d.power=clamp(d.power+20,0,100);P.hit(65);P.feedback('✓ Caminho livre! +20 de energia.');}
  d.bolts=d.bolts.filter(b=>b.life>0&&b.x>0&&b.x<d.length);d.enemyBolts=d.enemyBolts.filter(b=>b.life>0&&b.x>0&&b.x<d.length);
  if(d.x>=d.length-95){
    if(d.wordIndex.length<d.required||d.boss?.alive){
      if(d.finishWait<=0){P.feedback(d.boss?.alive?'Derrote o guardião para abrir o portal.':'Faltam '+(d.required-d.wordIndex.length)+' palavras para abrir o portal.');d.finishWait=1.5;}
    }else if(r.training)P.event('platform-word');
    else {P.hit(250);P.stageClear(r,d.stage);if(d.stage>=5)P.finish();else{r.data=this.create(false,d.stage+1);P.feedback('✓ Portal aberto! Explore a próxima região.');}}
  }
};
platform.draw=function(c,r){
  const d=platformReady(r),originalInvuln=d.invuln;
  // Existing district art is retained; blinking is replaced by a steady outline.
  d.invuln=0;oldPlatformDraw(c,r);d.invuln=originalInvuln;
  const cam=d.cam;
  for(const x of [640,1190])if(x<d.length-200){const sx=x-cam;if(sx>-30&&sx<990){rect(c,sx,395,4,60,pal.ink);rect(c,sx+4,397,28,18,d.checkpoint>=x?pal.teal:pal.paper,pal.ink);}}
  if(d.invuln>0){const x=d.x-cam;c.save();c.strokeStyle=pal.gold;c.lineWidth=3;c.beginPath();c.ellipse(x,d.y-28,27,36,0,0,Math.PI*2);c.stroke();c.restore();}
  for(const b of d.enemyBolts){const x=b.x-cam;rect(c,x-8,b.y-8,16,16,pal.red,pal.paper);rect(c,x-3,b.y-3,6,6,pal.gold);}
  if(d.boss?.alive&&d.boss.warning)plaque(c,'DODGE!',d.boss.x-cam,d.boss.y-127,100,pal.red);
};
platform.spot=function(r){
  const d=r.data,cam=clamp(d.x-310,0,Math.max(0,d.length-960)),target=r.step===2?d.notes.find((n,i)=>!d.wordIndex.includes(i)):null;
  return{x:clamp((target?.x??d.x)-cam,55,900),y:target?target.y-22:d.y-30,w:135,h:126};
};

// RADIO: direct-touch dials, deliberate signal stabilization and calm mode.
const radio=C.radio;
radio.model=function(r){
  const d=r.data,goal=d.waves[d.segment]||d.waves.at(-1),matched=goal.every((v,i)=>v===d.frequency[i]),locked=matched&&(d.stable||0)>=.65;
  return {request:'Transmissão '+(d.stage+1)+'/6 · '+d.title,support:d.transmitted+'/'+d.waves.length+' mensagens · bateria '+Math.floor(d.energy)+'% · canal '+(d.selected+1),
    progress:d.transmitted,total:d.waves.length,action:locked?'Transmitir · E':matched?'Estabilizando sinal…':'Sintonize os três canais',disabled:!locked,
    hint:'O contorno dourado marca o alvo. Toque no número desejado; espere a barra SIGNAL encher e transmita.'};
};
const oldRadioAction=radio.action.bind(radio);
radio.action=function(r,name,arg){
  const d=r.data;
  if(name==='set'){
    if(arg.channel<0||arg.channel>2||arg.value<0||arg.value>4)return;
    if(arg.channel!==d.selected){d.selected=arg.channel;P.event('radio-select');}
    if(d.frequency[d.selected]!==arg.value){d.frequency[d.selected]=arg.value;d.stable=0;r.moves++;P.event('radio-tune');V.Audio.sfx('menu');}return;
  }
  if(name==='send'&&(d.stable||0)<.65){P.feedback('Acerte os três canais e espere a barra SIGNAL estabilizar.');return;}
  if(name==='tune'){d.stable=0;}
  oldRadioAction(r,name,arg);
  if(name==='send')d.stable=0;
};
radio.key=function(r,k){
  if(['1','2','3'].includes(k)){P.action('select',+k-1);return true;}
  if(['arrowup','w'].includes(k)){P.action('select',(r.data.selected+2)%3);return true;}
  if(['arrowdown','s'].includes(k)){P.action('select',(r.data.selected+1)%3);return true;}
  if(['arrowleft','a'].includes(k)){P.action('tune',-1);return true;}if(['arrowright','d'].includes(k)){P.action('tune',1);return true;}
  if(['e','enter',' '].includes(k)){P.action('send');return true;}return false;
};
radio.pointer=function(r,type,p){
  if(type!=='down'&&!(type==='move'&&P.drag))return;
  if(p.x<327||p.x>728||p.y<234||p.y>448)return;
  const channel=clamp(Math.round((p.y-267)/78),0,2),value=clamp(Math.round((p.x-360)/72),0,4);P.action('set',{channel,value});
};
radio.update=function(r,dt){
  const d=r.data,goal=d.waves[d.segment]||d.waves.at(-1),matched=goal.every((v,i)=>v===d.frequency[i]);
  d.flash=Math.max(0,d.flash-dt);d.stable=matched?Math.min(.65,(d.stable||0)+dt):0;
  if(r.training||r.calm)return;
  const diff=P.difficulty(r),imbalance=goal.reduce((sum,n,i)=>sum+Math.abs(n-d.frequency[i]),0);
  d.energy=clamp(d.energy-dt*([.2,.35,.5][diff]+imbalance*[.06,.13,.19][diff]),0,100);
  if(d.energy<=0){d.energy=75;d.stable=0;r.combo=0;P.feedback('Interferência! A bateria foi recarregada. Suas mensagens transmitidas estão salvas.',true);}
};
const oldRadioDraw=radio.draw.bind(radio);
radio.draw=function(c,r){
  const d=r.data,goal=d.waves[d.segment]||d.waves.at(-1);oldRadioDraw(c,r);
  // The target remains an outline; a separate thumb always shows the actual value.
  for(let i=0;i<3;i++)for(let j=0;j<5;j++){
    const x=360+j*72,y=267+i*78,on=j===d.frequency[i],target=j===goal[i];
    rect(c,x-21,y-15,42,30,on?pal.teal:'#254e49',target?pal.gold:'#769383');text(c,String(j),x,y,15,on?pal.ink:pal.paper);
    if(target){rect(c,x-16,y-21,32,3,pal.gold);}
    if(on){rect(c,x-7,y+20,14,5,pal.paper);}
  }
  const signal=clamp((d.stable||0)/.65,0,1);rect(c,187,227,587,6,'#3c5a50');rect(c,187,227,587*signal,6,signal===1?pal.teal:pal.gold);
  plaque(c,signal===1?'SIGNAL READY':'SIGNAL '+Math.round(signal*100)+'%',480,483,210,signal===1?pal.teal:pal.paper);
};

// Stable stage entry: prepare newly-authored data for selected phases and old saves.
const oldMake=P.make.bind(P);
P.make=function(id,key,context={}) {
  const r=oldMake(id,key,context),stage=r.startStage||0;
  if(id==='rhythm'&&stage){
    const d=r.data;d.resolved=stage*8;d.notes.forEach((n,i)=>{n.done=i<stage*8;});d.time=d.notes[stage*8].at-1.8;
  }
  return r;
};
})();
