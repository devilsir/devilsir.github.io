/* ===========================================
   RPG de Química — Raio Atômico & Íons
   Upgrades v3: sprites e movimento suavizados, água com ondas,
   Laboratório com anéis eletrônicos animados, exemplos rápidos,
   mais santuários (6 ao todo) e testes extras.
   =========================================== */

const cvs = document.getElementById('game');
const ctx = cvs.getContext('2d', { alpha:false });
ctx.imageSmoothingEnabled = false;

const TILE = 16;         // tamanho base (pixel art)
let VW = cvs.width;      // usado pela câmera; atualizar se fullscreen mudar
let VH = cvs.height;

const WORLD_W = 110;     // mundo maior
const WORLD_H = 70;

const ui = document.getElementById('ui');
const uicontent = document.getElementById('uicontent');
const doneEl = document.getElementById('done');
const totalEl = document.getElementById('total');
const closeBtn = document.getElementById('closeBtn');
const muteBtn = document.getElementById('muteBtn');
const fsBtn = document.getElementById('fsBtn');
const testBtn = document.getElementById('testBtn');

let keys = {};
window.addEventListener('keydown', (e)=>{ keys[e.key.toLowerCase()] = true; if(e.key==='Escape') hidePanel(); });
window.addEventListener('keyup',   (e)=>{ keys[e.key.toLowerCase()] = false; });

/* ---------- Áudio (SFX) ---------- */
const audio = {
  ctx:null, enabled:true,
  ensure(){ if(!this.ctx){ this.ctx = new (window.AudioContext||window.webkitAudioContext)(); } },
  beep(freq=440, dur=0.08, type='square'){
    if(!this.enabled) return; this.ensure();
    const t0 = this.ctx.currentTime; const o=this.ctx.createOscillator(); const g=this.ctx.createGain();
    o.type=type; o.frequency.value=freq; g.gain.value=0.06; o.connect(g).connect(this.ctx.destination);
    o.start(); g.gain.setValueAtTime(0.06,t0); g.gain.exponentialRampToValueAtTime(0.001, t0+dur);
    o.stop(t0+dur);
  },
  ok(){ this.beep(880,0.06,'square'); setTimeout(()=>this.beep(1320,0.06,'square'),60); },
  no(){ this.beep(220,0.12,'sawtooth'); }
};
muteBtn.addEventListener('click', ()=>{ audio.enabled=!audio.enabled; muteBtn.textContent = audio.enabled? '🔊 FX':'🔇 FX'; });

/* ---------- Util ---------- */
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
function dist(ax,ay,bx,by){const dx=ax-bx, dy=ay-by; return Math.hypot(dx,dy);}    

/* ---------- Mundo (mapa) ---------- */
// 0=grama, 1=rocha, 2=água, 3=solo laboratório
const map = new Array(WORLD_H).fill(0).map(()=>new Array(WORLD_W).fill(0));
for(let y=0;y<WORLD_H;y++){
  for(let x=0;x<WORLD_W;x++){
    if(x===0||y===0||x===WORLD_W-1||y===WORLD_H-1){ map[y][x]=1; continue; }
    const r=Math.random();
    if(r<0.02) map[y][x]=1; else if(r<0.06) map[y][x]=2; else map[y][x]=0;
  }
}
// laboratório (solo especial) e pátio
for(let y=8;y<18;y++){
  for(let x=10;x<28;x++){ map[y][x]=3; }
}

/* ---------- Partículas (poeira ao andar) ---------- */
const particles=[];
class Particle{ constructor(x,y,col){ this.x=x; this.y=y; this.vx=(Math.random()-0.5)*14; this.vy=-Math.random()*10; this.a=1; this.t=0; this.col=col||'#2a3'; this.life=0.45; }
  update(dt){ this.t+=dt; this.x+=this.vx*dt; this.y+=this.vy*dt; this.vy+=20*dt; this.a = 1 - (this.t/this.life); }
  draw(gx,gy){ if(this.a<=0) return; ctx.globalAlpha = Math.max(0,this.a); ctx.fillStyle=this.col; ctx.fillRect(Math.round(this.x-gx), Math.round(this.y-gy), 2,2); ctx.globalAlpha=1; }
}

/* ---------- Entidades ---------- */
class Entity{ constructor(x,y,w,h){this.x=x;this.y=y;this.w=w;this.h=h;} get cx(){return this.x+this.w/2} get cy(){return this.y+this.h/2} }

class Player extends Entity{
  constructor(x,y){ super(x,y,12,12); this.speed=110; this.dir='down'; this.anim=0; this.step=0; this.vx=0; this.vy=0; this.acc=600; this.fric=8; this.blinkTimer=0; }
  update(dt){
    let ix=0, iy=0;
    if(keys['w']||keys['arrowup'])   { iy-=1; this.dir='up'; }
    if(keys['s']||keys['arrowdown']) { iy+=1; this.dir='down'; }
    if(keys['a']||keys['arrowleft']) { ix-=1; this.dir='left'; }
    if(keys['d']||keys['arrowright']){ ix+=1; this.dir='right'; }
    // aceleração com normalização
    const mag = (ix||iy)? Math.hypot(ix,iy):1; ix/=mag; iy/=mag;
    this.vx += ix*this.acc*dt; this.vy += iy*this.acc*dt;
    // atrito
    this.vx -= this.vx*this.fric*dt; this.vy -= this.vy*this.fric*dt;
    // limita velocidade
    const vmax=this.speed; const vm=Math.hypot(this.vx,this.vy); if(vm>vmax){ this.vx=this.vx/vm*vmax; this.vy=this.vy/vm*vmax; }
    // tentativa de movimento com colisão
    this.moveWithCollisions(this.vx*dt,0); this.moveWithCollisions(0,this.vy*dt);
    // animação baseada na velocidade
    const moving = Math.hypot(this.vx,this.vy)>5; if(moving){ this.step += dt* (4 + 6*(vm/vmax)); this.anim = Math.floor(this.step)%2; if(Math.random()<0.08) spawnDust(this); } else { this.step=0; this.anim=0; }
    // piscar ocasional
    this.blinkTimer += dt; if(this.blinkTimer>3.2){ if(Math.random()<0.02) this.blinkTimer=0; }
  }
  moveWithCollisions(vx,vy){ this.x += vx; if(this.collides()) this.x -= vx; this.y += vy; if(this.collides()) this.y -= vy; this.x = clamp(this.x, 1*TILE, WORLD_W*TILE - TILE - this.w); this.y = clamp(this.y, 1*TILE, WORLD_H*TILE - TILE - this.h); }
  collides(){ const tiles = sampleTiles(this.x, this.y, this.w, this.h); for(const t of tiles){ if(isSolid(t.tx,t.ty)) return true; } return false; }
  draw(gx,gy){ drawPlayerSprite(this.x-gx, this.y-gy, this.dir, this.anim, this.blinkTimer<0.15); }
}

function spawnDust(p){ const tx=Math.floor(p.x/TILE), ty=Math.floor(p.y/TILE); const tile=map[ty]?.[tx]; if(tile===0||tile===3) particles.push(new Particle(p.x+6,p.y+12,tile===0?'#2a4':'#445')); }

function isSolid(tx,ty){ const t = map[ty]?.[tx]; return t===1 || t===2; }
function sampleTiles(x,y,w,h){ const x0=Math.floor(x/TILE), x1=Math.floor((x+w-1)/TILE); const y0=Math.floor(y/TILE), y1=Math.floor((y+h-1)/TILE); const arr=[]; for(let ty=y0;ty<=y1;ty++){ for(let tx=x0;tx<=x1;tx++){ arr.push({tx,ty}); } } return arr; }

/* ---------- Sprites: jogador multi-direção ---------- */
const spr = document.createElement('canvas'); spr.width=16; spr.height=16; const sctx = spr.getContext('2d'); sctx.imageSmoothingEnabled=false;
const C = { skin:'#f6d6b8', hair:'#2b2b3a', coat:'#5fd3f3', pant:'#3a5b9b', shoe:'#1b1b28', outline:'#0c0c12' };
function pxRect(x,y,w,h,color){ sctx.fillStyle=color; sctx.fillRect(x,y,w,h); }
function drawPlayerSprite(x,y,dir,frame,blink){
  sctx.clearRect(0,0,16,16);
  // cabeça
  pxRect(5,2,6,6,C.skin); pxRect(4,2,8,1,C.hair);
  // olhos direção (com blink)
  if(!blink){ if(dir==='left'){ pxRect(6,4,1,1,'#111'); } else if(dir==='right'){ pxRect(9,4,1,1,'#111'); } else { pxRect(7,4,1,1,'#111'); } }
  // corpo
  pxRect(4,8,8,5,C.coat); pxRect(3,9,1,3,C.coat); pxRect(12,9,1,3,C.coat);
  // pernas alternando
  const alt = (frame%2===0)?0:1; pxRect(5,13,2,3,C.pant); pxRect(9,13-alt,2,3+alt,C.pant);
  // sapatos
  pxRect(5,16,2,1,C.shoe); pxRect(9,16,2,1,C.shoe);
  ctx.drawImage(spr, Math.round(x), Math.round(y), 16,16);
}

/* ---------- NPCs e Objetos ---------- */
class NPC extends Entity{ constructor(x,y,text){ super(x,y,12,12); this.text=text; this.name='Prof. Dalton'; } draw(gx,gy){ sctx.clearRect(0,0,16,16); pxRect(5,2,6,6,'#ffd7b3'); pxRect(4,8,8,6,'#e7f0f7'); pxRect(5,14,2,2,'#999'); pxRect(9,14,2,2,'#999'); ctx.drawImage(spr, Math.round(this.x-gx), Math.round(this.y-gy), 16,16); ctx.fillStyle='rgba(0,0,0,.35)'; ctx.fillRect(Math.round(this.x-gx-6), Math.round(this.y-gy-10), 28,8); ctx.fillStyle='#fff'; ctx.font='6px monospace'; ctx.fillText('Prof.', Math.round(this.x-gx-3), Math.round(this.y-gy-4)); } }
class Shrine extends Entity{ constructor(x,y,title,id){ super(x,y,16,16); this.title=title; this.id=id; this.completed=false; } draw(gx,gy){ const X=Math.round(this.x-gx), Y=Math.round(this.y-gy); ctx.fillStyle='#262a45'; ctx.fillRect(X,Y,16,16); ctx.fillStyle=this.completed?'#76e39f':'#6cf'; ctx.fillRect(X+3,Y+3,10,10); ctx.fillStyle='#0a0b12'; ctx.fillRect(X+6,Y+6,4,4); ctx.font='7px monospace'; ctx.fillStyle='#ccd'; ctx.fillText(this.completed?'✔':'?', X-2, Y-2); } }
class Terminal extends Entity{ constructor(x,y){ super(x,y,14,14); } draw(gx,gy){ const X=Math.round(this.x-gx), Y=Math.round(this.y-gy); ctx.fillStyle='#1b2038'; ctx.fillRect(X,Y,14,14); ctx.fillStyle='#6cf'; ctx.fillRect(X+3,Y+3,8,6); ctx.fillStyle='#0f0'; ctx.fillRect(X+4,Y+5,6,2); ctx.font='7px monospace'; ctx.fillStyle='#9cf'; ctx.fillText('LAB', X-4, Y-2); } }

const player = new Player(18*TILE, 12*TILE);
const prof = new NPC(16*TILE, 11*TILE, [
  'Bem-vindo ao Campus Periodicum!',
  'Missão: conquistar os Selos do Raio Atômico e dominar íons.',
  'Use o Terminal do LAB para visualizar raios em tempo real.'
].join('\n'));
const labTerm = new Terminal(18*TILE, 10*TILE);

const shrines = [
  new Shrine(30*TILE, 20*TILE, 'Tendências do Raio', 'trend'),
  new Shrine(70*TILE, 12*TILE, 'Cátions vs Ânions', 'ions'),
  new Shrine(44*TILE, 48*TILE, 'Série Isoeletrônica', 'iso'),
  new Shrine(80*TILE, 40*TILE, 'Blindagem & Z (conceito)', 'zeff'),
  new Shrine(20*TILE, 56*TILE, 'Desafios por Grupo', 'period2'),
  new Shrine(96*TILE, 22*TILE, 'Ordem Mista de Raios', 'mix')
];

/* ---------- Câmera (suavizada) ---------- */
const camera = { x:0,y:0, w:VW, h:VH };
function updateCamera(){
  const tx = clamp(player.x + player.w/2 - camera.w/2, 0, WORLD_W*TILE - camera.w);
  const ty = clamp(player.y + player.h/2 - camera.h/2, 0, WORLD_H*TILE - camera.h);
  // lerp suave
  camera.x = lerp(camera.x, tx, 0.15); camera.y = lerp(camera.y, ty, 0.15);
}

/* ---------- Desenho do Mundo (com água animada + partículas) ---------- */
let timeSec=0;
function drawWorld(){
  const gx = Math.floor(camera.x), gy = Math.floor(camera.y);
  const x0=Math.floor(gx/TILE), y0=Math.floor(gy/TILE); const x1=Math.ceil((gx+VW)/TILE), y1=Math.ceil((gy+VH)/TILE);
  for(let ty=y0; ty<y1; ty++){
    for(let tx=x0; tx<x1; tx++){
      const t = map[ty]?.[tx]??1; const X=tx*TILE-gx, Y=ty*TILE-gy;
      if(t===0){ // grama com flores
        ctx.fillStyle='#11251a'; ctx.fillRect(X,Y,TILE,TILE);
        ctx.fillStyle='#183f27'; if(((tx+ty)&1)===0) ctx.fillRect(X+5,Y+7,1,1); if(((tx*3+ty)&3)===0) ctx.fillRect(X+10,Y+3,1,1);
        if(((tx*7+ty*5)&15)===0){ ctx.fillStyle='#ffd66b'; ctx.fillRect(X+8,Y+6,1,1); }
      }else if(t===1){ // rocha
        ctx.fillStyle='#262a45'; ctx.fillRect(X,Y,TILE,TILE); ctx.fillStyle='#313863'; ctx.fillRect(X+3,Y+9,2,2); ctx.fillRect(X+9,Y+4,1,1);
      }else if(t===2){ // água animada
        const wave = Math.sin((tx+ty)*0.7 + timeSec*2.2)*0.5+0.5; const c1 = `rgba(12,60,104,1)`; const c2 = `rgba(10,35,70,1)`;
        ctx.fillStyle = wave>0.5?c1:c2; ctx.fillRect(X,Y,TILE,TILE); ctx.fillStyle = 'rgba(200,230,255,0.15)'; ctx.fillRect(X+(wave>0.5?2:1),Y+2,1,1);
      }else if(t===3){ // piso laboratório
        ctx.fillStyle='#2b2f49'; ctx.fillRect(X,Y,TILE,TILE); ctx.fillStyle='#353b61'; ctx.fillRect(X+6,Y+6,1,1);
      }
    }
  }
  // entidades
  prof.draw(gx,gy); labTerm.draw(gx,gy); for(const s of shrines) s.draw(gx,gy); player.draw(gx,gy);
  // partículas
  for(let i=particles.length-1;i>=0;i--){ const p=particles[i]; p.update(dtGlobal); p.draw(gx,gy); if(p.a<=0) particles.splice(i,1); }

  // dica de interação
  let near = (dist(player.cx,player.cy,prof.cx,prof.cy)<22) || (dist(player.cx,player.cy,labTerm.cx,labTerm.cy)<22);
  for(const s of shrines) if(dist(player.cx,player.cy,s.cx,s.cy)<22) near=true;
  if(near){ ctx.font='10px monospace'; ctx.fillStyle='#fff'; ctx.fillText('E: Interagir', Math.round(player.x-gx-8), Math.round(player.y-gy-8)); }
}

/* ---------- Interação ---------- */
function tryInteract(){
  if(dist(player.cx,player.cy,prof.cx,prof.cy)<22){
    openDialog('Prof. Dalton', prof.text, [ {label:'Ok, vamos lá!', cb:()=>startGame()}, {label:'Relembrar teoria (H)', cb:()=>openTheory()} ]); return;
  }
  if(dist(player.cx,player.cy,labTerm.cx,labTerm.cy)<22){ openLab(); return; }
  for(const s of shrines){ if(dist(player.cx,player.cy,s.cx,s.cy)<22){ openQuizById(s.id, s); return; } }
}

/* ---------- Painel UI ---------- */
function showPanel(html){ uicontent.innerHTML = html; ui.classList.add('show'); }
function hidePanel(){ ui.classList.remove('show'); labOpen=false; if(labAnimId) cancelAnimationFrame(labAnimId); }
function openDialog(title, text, actions=[{label:'Fechar', cb:()=>hidePanel()}]){
  const btns = actions.map((a,i)=>`<div class=\"btn\" data-i=\"${i}\">${a.label}</div>`).join(' ');
  showPanel(`<h2>${title}</h2><pre style=\"white-space:pre-wrap\">${escapeHtml(text)}</pre><div class=\"sep\"></div><div class=\"foot\">${btns}</div>`);
  [...uicontent.querySelectorAll('.btn[data-i]')].forEach(el=>el.addEventListener('click',()=>{ const i=+el.dataset.i; actions[i].cb(); }));
}
closeBtn.addEventListener('click', hidePanel);
ui.addEventListener('click', (e)=>{ if(e.target===ui) hidePanel(); });
function escapeHtml(s){return s.replace(/[&<>"']/g,m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;','\'':'&#39;' }[m]));}

/* ---------- Ficha de Teoria ---------- */
function openTheory(){
  showPanel(`
    <h2>Ficha de Química — Raio Atômico</h2>
    <ul class=\"theory\">
      <li><b>Raio atômico</b>: distância efetiva do núcleo à borda da nuvem eletrônica (definição operacional).</li>
      <li><b>Tendências:</b> aumenta <u>para baixo</u> no grupo (novas camadas) e <u>para a esquerda</u> no período (menor Z<sub>efetiva</sub>).</li>
      <li><b>Íons:</b> cátion (M<sup>n+</sup>) perde e⁻ ⇒ <b>menor</b>; ânion (X<sup>n−</sup>) ganha e⁻ ⇒ <b>maior</b>.</li>
      <li><b>Série isoeletrônica</b>: mesma contagem de e⁻ ⇒ quem tem maior Z (mais prótons) puxa mais ⇒ <b>menor raio</b>.</li>
    </ul>
    <div class=\"sep\"></div>
    <p>Use o <b>LAB</b> para visualizar o efeito de cargas nos raios em tempo real.</p>
  `);
}

/* ---------- Laboratório Interativo (anéis + exemplos) ---------- */
const NEUTRAL_PM = { // covalentes aproximados (H→Ar)
  1:53, 2:31, 3:167, 4:112, 5:87, 6:67, 7:56, 8:48, 9:42, 10:38,
  11:190, 12:145, 13:118, 14:111, 15:98, 16:88, 17:79, 18:71
};
function ionRadiusApprox(Z, q){ // q>0 cátion diminui; q<0 ânion aumenta (didático)
  const base = NEUTRAL_PM[Z] || 100; let scale = 1 - 0.22*q; // q negativo aumenta
  scale = clamp(scale, 0.45, 1.85); return Math.round(base*scale);
}
function symbolOf(Z){ const sy=['','H','He','Li','Be','B','C','N','O','F','Ne','Na','Mg','Al','Si','P','S','Cl','Ar']; return sy[Z]||'Z'+Z; }
function electronsToShells(e){ // até Ar: 2,8,8
  const s1 = Math.min(2, e); e-=s1; const s2 = Math.min(8, Math.max(0,e)); e-=s2; const s3 = Math.min(8, Math.max(0,e));
  return [s1,s2,s3];
}

// Mostra ordem esperada para a série clássica de 10e⁻
function showIsoSeries(E=10){
  // exemplo comum: O²⁻, F⁻, Na⁺, Mg²⁺, Al³⁺
  const series = [ {Z:8,q:-2}, {Z:9,q:-1}, {Z:11,q:+1}, {Z:12,q:+2}, {Z:13,q:+3} ];
  const arr = series.map(s=>({ ...s, r: ionRadiusApprox(s.Z,s.q), sym: symbolOf(s.Z) }));
  arr.sort((a,b)=>b.r - a.r); // maior → menor
  const list = arr.map(o=>`${o.sym}${o.q>0?`+${o.q}`:o.q}: ${o.r} pm`).join('<br>');
  showPanel(`<h2>Série Isoeletrônica (10 e⁻)</h2><p>Ordem (maior → menor):</p><div class=\"pill\" style=\"display:block;margin:8px 0\">${list}</div><div class=\"foot\"><div class=\"btn\" id=\"backLab\">Voltar ao LAB</div></div>`);
  document.getElementById('backLab').onclick=()=>openLab();
}

let labOpen=false, labAnimId=null;
function openLab(){
  labOpen=true;
  let Z=11, q=+1; // Na→Na+
  let animate=true;
  render();
  function render(){
    const eCount = Z - q; const r0 = NEUTRAL_PM[Z]||100; const rIon = ionRadiusApprox(Z,q);
    showPanel(`
      <h2>Laboratório: Visualizador de Raio Atômico & Íons</h2>
      <div class=\"row\">
        <div class=\"col\">
          <label>Elemento (Z): <b>${symbolOf(Z)}</b> — Z=${Z}</label>
          <input id=\"zRange\" type=\"range\" min=\"1\" max=\"18\" value=\"${Z}\">
          <label>Carga (q): <b>${q>0?`+${q}`:q}</b> <span class=\"small\">(q>0 cátion, q<0 ânion)</span></label>
          <input id=\"qRange\" type=\"range\" min=\"-3\" max=\"3\" value=\"${q}\">
          <div class=\"pill\">Elétrons: <b>${eCount}</b></div>
          <div>Raio neutro ≈ <b>${r0} pm</b> | Raio do íon ≈ <b>${rIon} pm</b></div>
          <div class=\"row\">
            <div class=\"btn\" id=\"btnIso\">Série isoeletrônica (10 e⁻)</div>
            <div class=\"btn\" id=\"btnIsoAny\">Série isoeletrônica (E variável)</div>
          </div>
          <div class=\"row\">
            <div class=\"btn\" id=\"btnExamples\">Exemplos rápidos</div>
            <div class=\"btn\" id=\"btnReset\">Reset (Na⁺)</div>
            <div class=\"btn\" id=\"btnAnim\">${animate?'⏸️ Pausar':'▶️ Animar'}</div>
          </div>
        </div>
        <div class=\"col\" style=\"flex:1;min-width:420px\">
          <canvas id=\"labviz\" width=\"520\" height=\"280\" style=\"background:#0b0f1c; outline:1px solid #2a2f49\"></canvas>
        </div>
      </div>
      <div class=\"sep\"></div>
      <p class=\"small\">* Modelo visual didático com valores aproximados. Mostra <i>n</i> camadas (até Ar), distribuição de e⁻ (2,8,8), e comparação de raios.</p>
    `);

    // canvas e contexto disponíveis para drawViz
    const c = document.getElementById('labviz');
    const g = c.getContext('2d');

    // desenhista principal AGORA no escopo de render() => zR/qR podem chamá-lo
    function drawViz(){
      const W=c.width,H=c.height; g.imageSmoothingEnabled=false; g.clearRect(0,0,W,H);
      // fundo gradiente sutil
      const grd=g.createLinearGradient(0,0,0,H); grd.addColorStop(0,'#0c1224'); grd.addColorStop(1,'#0b0f1c'); g.fillStyle=grd; g.fillRect(0,0,W,H);
      // área esquerda: neutro | direita: íon
      const r0v=(NEUTRAL_PM[Z]||100), rIv=ionRadiusApprox(Z,q); const scale=100/Math.max(r0v,rIv);
      drawAtom(g, W*0.3, H*0.58, r0v*scale, electronsToShells(Z), '#6cf', `${symbolOf(Z)} (0)\n${r0v} pm`);
      drawAtom(g, W*0.7, H*0.58, rIv*scale, electronsToShells(Z-q), q>=0?'#76e39f':'#ffd66b', `${symbolOf(Z)} ${q>=0?`+${q}`:q}\n${rIv} pm`);
      // barras comparativas
      g.fillStyle='#9fb'; g.font='12px monospace'; g.fillText('neutro', W*0.22, 24); g.fillText('íon', W*0.62, 24);
      bar(g, W*0.18, 36, 180, r0v, Math.max(40,r0v,rIv)); bar(g, W*0.58, 36, 180, rIv, Math.max(40,r0v,rIv));
    }

    function drawAtom(g, cx, cy, r, shells, color, label){
      // núcleo
      g.fillStyle='#223'; g.beginPath(); g.arc(cx,cy,8,0,Math.PI*2); g.fill();
      // anéis
      g.strokeStyle='#2f3b67'; g.lineWidth=1.2; const radii=[18,32,46]; for(let i=0;i<shells.length;i++){ if(shells[i]>0){ g.beginPath(); g.arc(cx,cy,radii[i],0,Math.PI*2); g.stroke(); }}
      // elétrons animados
      const t = performance.now()/1000; for(let i=0;i<shells.length;i++){ const n=shells[i]; const rad=radii[i]; for(let k=0;k<n;k++){ const ang = t*(0.5+i*0.3) + (k/n)*Math.PI*2; const ex=cx+Math.cos(ang)*rad, ey=cy+Math.sin(ang)*rad; g.fillStyle='#cfe6ff'; g.fillRect(Math.round(ex-1),Math.round(ey-1),2,2); }}
      // círculo do "raio" (escala visual)
      g.strokeStyle=color; g.lineWidth=2; g.beginPath(); g.arc(cx,cy,r,0,Math.PI*2); g.stroke();
      // rótulo
      g.fillStyle='#ccd'; g.font='12px monospace'; const lines=label.split('\n'); lines.forEach((ln,i)=>g.fillText(ln, cx-40, cy+r+16+i*14));
    }

    function bar(g,x,y,w,val,max){ g.fillStyle='#2a2f49'; g.fillRect(x,y,w,6); g.fillStyle='#6cf'; g.fillRect(x,y, (val/max)*w,6); g.fillStyle='#9fb'; g.fillText(`${Math.round(val)} pm`, x+w+6, y+6); }

    // listeners AGORA chamam drawViz com segurança
    const zR = document.getElementById('zRange'); const qR = document.getElementById('qRange');
    zR.oninput = ()=>{ Z=+zR.value; drawViz(); };
    qR.oninput = ()=>{ q=+qR.value; drawViz(); };
    document.getElementById('btnReset').onclick=()=>{ Z=11; q=+1; render(); };
    document.getElementById('btnIso').onclick=()=> showIsoSeries(10);
    document.getElementById('btnIsoAny').onclick=()=> openIsoGeneric(eCount);
    document.getElementById('btnAnim').onclick=()=>{ animate=!animate; render(); };
    document.getElementById('btnExamples').onclick=()=> openExamples();

    // loop de animação
    if(labAnimId) cancelAnimationFrame(labAnimId);
    (function anim(){ if(!labOpen){ return; } if(animate){ drawViz(); } labAnimId=requestAnimationFrame(anim); })();
    // também desenha imediatamente no estado atual
    drawViz();
  }

  function openExamples(){
    const ex=[
      {label:'Li → Li⁺',Z:3,q:+1},{label:'Mg → Mg²⁺',Z:12,q:+2},{label:'Al → Al³⁺',Z:13,q:+3},
      {label:'O → O²⁻',Z:8,q:-2},{label:'F → F⁻',Z:9,q:-1},{label:'Cl → Cl⁻',Z:17,q:-1},
      {label:'Na → Na⁺',Z:11,q:+1},{label:'Si → Si⁴⁺',Z:14,q:+4}
    ];
    const grid = ex.map((e,i)=>`<div class=\"btn\" data-i=\"${i}\">${e.label}</div>`).join('');
    showPanel(`<h2>Exemplos rápidos</h2><div class=\"grid\">${grid}</div><div class=\"sep\"></div><div class=\"foot\"><div class=\"btn\" id=\"backLab\">Voltar ao LAB</div></div>`);
    [...uicontent.querySelectorAll('.btn[data-i]')].forEach(el=>el.addEventListener('click',()=>{
      (function(Znew,qnew){ openLab(); setTimeout(()=>{ // set sliders após abrir
        const zR=document.getElementById('zRange'), qR=document.getElementById('qRange'); zR.value=Znew; qR.value=qnew; zR.dispatchEvent(new Event('input')); qR.dispatchEvent(new Event('input')); },30); })(ex[+el.dataset.i].Z, ex[+el.dataset.i].q);
    }));
    document.getElementById('backLab').onclick=()=>openLab();
  }

  function openIsoGeneric(Einit){
    let E=Math.max(2,Math.min(18,Einit||10));
    showPanel(`<h2>Série Isoeletrônica</h2>
      <p>Escolha o número total de elétrons (E): <b id=\"Eval\">${E}</b></p>
      <input id=\"Erange\" type=\"range\" min=\"2\" max=\"18\" value=\"${E}\">
      <div id=\"isoList\" style=\"margin-top:8px\"></div>
      <div class=\"sep\"></div>
      <div class=\"foot\"><div class=\"btn\" id=\"backLab\">Voltar ao LAB</div></div>`);
    const Er = document.getElementById('Erange'); const Eval=document.getElementById('Eval'); const out=document.getElementById('isoList');
    function renderList(){ Eval.textContent=E; const items=[]; for(let Z=1;Z<=18;Z++){ const q = Z - E; if(Math.abs(q)<=3){ const r=ionRadiusApprox(Z,q); items.push({Z,q,r,sym:symbolOf(Z)}); } }
      items.sort((a,b)=>b.r-a.r); out.innerHTML = items.map(o=>`<div class=\"pill\" style=\"display:block;margin-bottom:6px\">${o.sym}${o.q>0?`+${o.q}`:o.q}: <b>${o.r} pm</b></div>`).join(''); }
    Er.oninput=()=>{ E=+Er.value; renderList(); }; renderList();
    document.getElementById('backLab').onclick=()=>openLab();
  }
}

/* ---------- Quizzes ---------- */
const quizzes = {
  trend: { title:'Santuário 1 — Tendências do Raio', items:[
    { q:'No período 3 (Na → Ar), a tendência geral do raio atômico é:', choices:['Aumentar da esquerda para a direita','Diminuir da esquerda para a direita','Permanecer constante'], correct:1, why:'Z efetiva aumenta à direita: nuvem é puxada, raio diminui.' },
    { q:'Ao descer um grupo (ex.: Li → Cs), o raio atômico:', choices:['Diminui','Aumenta','Permanece igual'], correct:1, why:'Cada passo adiciona uma camada eletrônica (n maior): distância média aumenta.' },
    { q:'Qual seta melhor representa o aumento do raio na Tabela?', choices:['↑ e →','↓ e ←','↑ e ←'], correct:1, why:'Aumenta para baixo (↓) e para a esquerda (←).' }
  ]},
  ions: { title:'Santuário 2 — Cátions vs Ânions', items:[
    { q:'Compare Cl e Cl⁻. Quem tem raio maior?', choices:['Cl (neutro)','Cl⁻ (ânion)'], correct:1, why:'Ânions: +e⁻ ⇒ repulsão maior ⇒ raio aumenta.' },
    { q:'Compare Na e Na⁺. Quem tem raio maior?', choices:['Na (neutro)','Na⁺ (cátion)'], correct:0, why:'Cátions perdem e⁻: menor repulsão e, muitas vezes, menos camada ⇒ raio diminui.' },
    { q:'Mg²⁺ vs Al³⁺ (mesma linha vizinha): quem é menor?', choices:['Mg²⁺ é menor','Al³⁺ é menor'], correct:1, why:'Maior carga positiva atrai mais fortemente os elétrons: Al³⁺ tende a ser menor.' }
  ]},
  iso: { title:'Santuário 3 — Série Isoeletrônica', items:[
    { q:'Ordem correta (maior → menor) para O²⁻, F⁻, Na⁺, Mg²⁺, Al³⁺?', choices:['Al³⁺ > Mg²⁺ > Na⁺ > F⁻ > O²⁻','O²⁻ > F⁻ > Na⁺ > Mg²⁺ > Al³⁺','Na⁺ > F⁻ > O²⁻ > Mg²⁺ > Al³⁺'], correct:1, why:'Mesmos 10 e⁻. Quem tem maior Z é menor: O²⁻ maior, Al³⁺ menor.' },
    { q:'Em séries isoeletrônicas, o que domina o tamanho?', choices:['Número de nêutrons','Carga nuclear efetiva (Z)','Número quântico magnético'], correct:1, why:'Mesma contagem de e⁻ ⇒ varia a atração do núcleo (Z efetiva).' }
  ]},
  zeff: { title:'Santuário 4 — Blindagem & Z (conceito)', items:[
    { q:'Por que o raio cresce ao descer no grupo?', choices:['Porque Z diminui','Porque há mais camadas (n) e blindagem','Porque o núcleo perde prótons'], correct:1, why:'Adicionar camadas aumenta a distância e a blindagem, superando o aumento de Z.' },
    { q:'O que acontece com o raio ao <i>aumentar</i> a carga positiva (mesmo elemento)?', choices:['Aumenta','Diminui','Fica igual'], correct:1, why:'Mais carga positiva puxa a nuvem com mais força: raio diminui.' },
    { q:'Qual afirmação é mais correta?', choices:['Z por si só decide o raio','Blindagem (screening) modula a atração nuclear','Elétrons não se repelem'], correct:1, why:'Repulsão e blindagem entre e⁻ reduzem a atração sentida pelos de valência.' }
  ]},
  period2: { title:'Santuário 5 — Desafios por Grupo/Período', items:[
    { q:'Quem é maior: P ou S (mesmo período)?', choices:['P','S'], correct:0, why:'No período, raio diminui à direita: P (à esquerda) é maior que S.' },
    { q:'Quem é maior: K ou Na (mesmo grupo)?', choices:['K','Na'], correct:0, why:'Descendo o grupo aumenta número de camadas ⇒ K > Na.' },
    { q:'Quem é maior: Mg²⁺ ou Na⁺?', choices:['Mg²⁺','Na⁺'], correct:0, why:'Ambos ~10 e⁻; maior Z (Mg) puxa mais ⇒ Mg²⁺ menor ⇒ então Na⁺ é maior.' }
  ]},
  mix: { title:'Santuário 6 — Ordem Mista de Raios', items:[
    { q:'Ordene (maior → menor): S²⁻, Cl⁻, Ar, K⁺', choices:['S²⁻ > Cl⁻ > Ar > K⁺','Cl⁻ > S²⁻ > Ar > K⁺','Ar > Cl⁻ > S²⁻ > K⁺'], correct:0, why:'Ânions maiores que neutros; cátions menores. Série ~isoelet. 18e⁻: S²⁻ > Cl⁻ > Ar > K⁺.' },
    { q:'Qual é maior: Si ou Si⁴⁺?', choices:['Si','Si⁴⁺'], correct:0, why:'Cátion 4+ é muito menor que o átomo neutro.' },
    { q:'Entre F⁻ e O²⁻ (ambos com 10 e⁻), quem é maior?', choices:['F⁻','O²⁻'], correct:1, why:'Mesmos 10 e⁻; menor Z (O) puxa menos ⇒ O²⁻ é maior.' }
  ]}
};

function openQuizById(id, shrineRef){ const pack = quizzes[id]; if(!pack) return; let idx=0, score=0; render();
  function render(feedback){ const item=pack.items[idx]; let html=`<h2>${pack.title}</h2><div><b>Pergunta ${idx+1}/${pack.items.length}</b></div><p style=\"margin-top:6px\">${escapeHtml(item.q)}</p><div class=\"choices\">`;
    item.choices.forEach((c,i)=>{ html += `<div class=\"choice\" data-i=\"${i}\">${escapeHtml(c)}</div>`; }); html += `</div>`; if(feedback){ html += `<div class=\"sep\"></div><div>${feedback}</div>`; }
    showPanel(html);
    [...uicontent.querySelectorAll('.choice')].forEach(el=>{ el.addEventListener('click',()=>{ const i=+el.dataset.i; const correct=(i===item.correct); score += correct?1:0; if(correct) audio.ok(); else audio.no(); [...uicontent.querySelectorAll('.choice')].forEach((c,j)=>{ c.classList.add(j===item.correct?'ok':'no'); }); setTimeout(()=>{ idx++; if(idx<pack.items.length){ render(`<span class=\"pill\">${correct?'✔ Correto!':'✖ Quase!'}</span> ${escapeHtml(item.why)}`); } else { const ok = score===pack.items.length; if(ok){ shrineComplete(shrineRef); audio.ok(); } const msg = ok? `Parabéns! Você conquistou o selo <b>${escapeHtml(pack.title)}</b> 🎉` : `Boa! Você fez ${score}/${pack.items.length}. Revise e tente novamente.`; showPanel(`<h2>${pack.title} — Resultado</h2><p>${msg}</p><div class=\"sep\"></div><div class=\"foot\">${ok?'<div class=\"btn\" id=\"okBack\">Voltar ao jogo</div>':'<div class=\"btn\" id=\"retry\">Tentar novamente</div>'}</div>`); const r=document.getElementById('retry'); const ob=document.getElementById('okBack'); if(r) r.addEventListener('click',()=>{ idx=0; score=0; render(); }); if(ob) ob.addEventListener('click', hidePanel); }
        }, 350);
      }, {once:true}); }); }
}

function shrineComplete(s){ if(s.completed) return; s.completed=true; saveProgress(); updateDone(); if(shrines.every(x=>x.completed)) showCertificate(); }
function updateDone(){ doneEl.textContent = shrines.filter(s=>s.completed).length; totalEl.textContent = shrines.length; }

/* ---------- Certificado ---------- */
function showCertificate(){ showPanel(`<div class=\"cert\"><h2>Certificado: Guardião do Raio Atômico</h2><p>Você concluiu todas as missões!</p><p class=\"pill\">Domínio: tendências, íons, séries isoeletrônicas e raciocínio misto.</p><p>Mostre este painel ao professor para validar a atividade. 👩‍🔬👨‍🔬</p></div>`); }

/* ---------- Progressão (localStorage) ---------- */
const SAVEKEY='rpg_quimica_raio_v2';
function saveProgress(){ const data = { shrines: shrines.map(s=>s.completed) }; localStorage.setItem(SAVEKEY, JSON.stringify(data)); }
function loadProgress(){ try{ const data = JSON.parse(localStorage.getItem(SAVEKEY)||'null'); if(!data) return; shrines.forEach((s,i)=> s.completed = !!data.shrines[i]); }catch(e){}
}

/* ---------- Auto-teste (test cases) ---------- */
function assert(cond, msg){ if(!cond) throw new Error(msg); }
function runTests(){
  const results = [];
  try{
    // 1) Monotonia catiônica: r(q=2) < r(q=1) < r(q=0)
    const z=11; const r0=ionRadiusApprox(z,0), r1=ionRadiusApprox(z,1), r2=ionRadiusApprox(z,2); results.push(['monotonia_cation', r2<r1 && r1<r0]);
    // 2) Ânion maior que neutro
    const ra=ionRadiusApprox(9,-1); results.push(['anion_maior', ra>ionRadiusApprox(9,0)]);
    // 3) Série isoeletrônica 10e⁻ ordem O2- > F- > Na+ > Mg2+ > Al3+
    const seq=[{Z:8,q:-2},{Z:9,q:-1},{Z:11,q:1},{Z:12,q:2},{Z:13,q:3}].map(s=>ionRadiusApprox(s.Z,s.q));
    results.push(['iso_10e_ordem', seq[0]>seq[1] && seq[1]>seq[2] && seq[2]>seq[3] && seq[3]>seq[4]]);
    // 4) symbolOf mapeia 1..18
    results.push(['symbol_map', symbolOf(1)==='H' && symbolOf(18)==='Ar']);
    // 5) distribuição eletrônica até Ar
    const shells = electronsToShells(10); results.push(['shells_10e', shells[0]===2 && shells[1]===8 && shells[2]===0]);
    // 6) quantidade de santuários
    results.push(['shrines_total', shrines.length===6]);
    // 7) join/split com \n funcionando
    const s='a\nb'; results.push(['newline_join', s.includes('\n') && s.split('\n').length===2]);
    // 8) função showIsoSeries disponível
    results.push(['showIso_defined', typeof showIsoSeries==='function']);
    // 9) openQuizById disponível
    results.push(['openQuiz_defined', typeof openQuizById==='function']);
    // 10) distribuição 18e⁻
    const sh18 = electronsToShells(18); results.push(['shells_18e', sh18[0]===2 && sh18[1]===8 && sh18[2]===8]);
    // 11) startGame existe
    results.push(['startGame_defined', typeof startGame==='function']);
  }catch(e){ results.push(['exception', false, e.message]); }
  return results;
}
function openTestsPanel(){
  const res = runTests();
  const html = res.map(([name, ok, extra])=>`<div class=\"pill\" style=\"border-color:${ok?'#2b5':'#b44'}\">${ok?'✔':'✖'} ${name}${extra?` — ${extra}`:''}</div>`).join('');
  showPanel(`<h2>Testes automáticos</h2><div class=\"col\" style=\"gap:6px\">${html}</div><div class=\"sep\"></div><div class=\"small\">Os testes também são logados no console do navegador.</div>`);
  console.table(res.map(([name, ok])=>({teste:name, ok})));
}

testBtn.addEventListener('click', openTestsPanel);

/* ---------- Loop do jogo ---------- */
let last=0, dtGlobal=0;
function loop(t){ const now = t/1000; dtGlobal = Math.min(0.033, (last? now-last:0.016)); last=now; timeSec = now; if(keys['e']){ keys['e']=false; tryInteract(); } if(keys['h']){ keys['h']=false; openTheory(); }
  player.update(dtGlobal); updateCamera(); ctx.fillStyle='#000'; ctx.fillRect(0,0,VW,VH); drawWorld(); requestAnimationFrame(loop); }

/* ---------- Inicialização ---------- */
function start(){
  loadProgress(); updateDone();
  openDialog('Bem-vindo!', `Explore o campus, fale com o Prof. Dalton, use o Terminal do LAB e complete os santuários (6 missões).\nControles: WASD/Setas mover, E interagir, H teoria.`, [{label:'Começar', cb:()=>startGame()}]);
  requestAnimationFrame(loop);
}
start();

/* ---------- Atalhos UI ---------- */
document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') hidePanel(); if(e.key.toLowerCase()==='t') openTestsPanel(); });
fsBtn.addEventListener('click', toggleFullscreen);
function toggleFullscreen(){ const el = document.documentElement; if(!document.fullscreenElement){ el.requestFullscreen?.(); } else { document.exitFullscreen?.(); } setTimeout(()=>{ VW=cvs.width; VH=cvs.height; camera.w=VW; camera.h=VH; },100); }

/* ---------- Helpers ---------- */
function symbolCharge(sym, q){ return sym + (q>0?`+${q}`:q===0?'':`${q}`); }
function startGame(){ hidePanel(); }

/* ---------- Fim ---------- */
