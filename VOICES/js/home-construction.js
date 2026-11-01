/* Personal house construction. Drafts only reach the world after validation. */
(function(){
'use strict';
const V=window.V,H=V.Homestead,R=V.Rooms,W=V.World,C=V.Cozy,T=48;
const copy=x=>JSON.parse(JSON.stringify(x)),esc=V.escape;
const HC=V.HomeConstruction={
 windows(d){return d.homeWindows||[];},
 drawPlan(c,d,scale=1,selection=null){
  c.save();c.lineCap='square';
  for(const wall of R.wallPieces(d)){
   c.strokeStyle=selection?.id===wall.key?'#ffe59a':'#725c48';c.lineWidth=12;
   c.beginPath();c.moveTo(...wall.a);c.lineTo(...wall.b);c.stroke();
   c.strokeStyle='#e7d1ab';c.lineWidth=3;c.stroke();
  }
  for(const window of this.windows(d)){
   const wall=R.structure(d).rooms.flatMap(r=>R.segments(r)).find(s=>s.room===window.room&&s.key===window.wall);if(!wall)continue;
   const angle=Math.atan2(wall.b[1]-wall.a[1],wall.b[0]-wall.a[0]);
   c.save();c.translate(window.x,window.y);c.rotate(angle);c.fillStyle=selection?.id===window.id?'#fff0a8':'#91d7e5';c.fillRect(-window.width/2,-7,window.width,14);c.strokeStyle='#275a69';c.lineWidth=2;c.strokeRect(-window.width/2,-7,window.width,14);c.beginPath();c.moveTo(0,-7);c.lineTo(0,7);c.stroke();c.restore();
  }
  for(const door of R.structure(d).doors){
   c.save();c.translate(door.x,door.y);c.rotate(Math.atan2(door.normal.y,door.normal.x)-Math.PI/2);
   c.fillStyle=selection?.id===door.id?'#ffe29b':'#e2d4ac';c.fillRect(-door.width/2,-9,door.width,18);c.strokeStyle='#31685a';c.lineWidth=2/scale;c.strokeRect(-door.width/2,-9,door.width,18);
   c.beginPath();c.arc(-door.width/2,0,door.width,-Math.PI/2,0);c.stroke();c.restore();
  }c.restore();
 },
 snapshot(id){const d=C.layouts[id];return{construction:copy(d.construction),windows:copy(d.homeWindows||[])};},
 install(id,value){
  const d=C.layouts[id],m=W.maps[id];if(!d||!m)return;
  d.construction=copy(value.construction);d.homeWindows=copy(value.windows||[]);
  m.objects=m.objects.filter(o=>o.type!=='room-door'&&o.type!=='home-window');
  m.decor=m.decor.filter(o=>o.family!=='room-wall');
  R.hydrate(m,d);
  for(const win of this.windows(d))m.objects.push({id:win.id,type:'home-window',x:win.x,y:win.y,homeWindow:win,label:'Janela',interactionRange:0});
  m.cache=null;m.geometryRevision=(m.geometryRevision||0)+1;
 },
 restore(){const saved=H.ensure()?.constructionEdits;for(const[id,value]of Object.entries(saved||{}))if(H.owned(id))this.install(id,value);},
 validate(id,draft){
  const source=C.layouts[id],allIds=new Set(Object.keys(C.layouts));
  R.normaliseConstruction(draft,id,allIds);
  const windows=this.windows(draft);
  if(windows.length>40)throw Error('Esta casa já tem 40 janelas.');
  for(const win of windows){const wall=R.structure(draft).rooms.flatMap(r=>R.segments(r)).find(s=>s.room===win.room&&s.key===win.wall);if(!wall||!Number.isFinite(win.width)||win.width<36||win.width>160)throw Error('Uma janela precisa estar em um trecho de parede válido.');}
  const openings=[...windows,...R.structure(draft).doors];for(const o of openings){const wall=R.structure(draft).rooms.flatMap(r=>R.segments(r)).find(s=>s.room===o.room&&s.key===o.wall);if(!wall)continue;const len=Math.hypot(wall.b[0]-wall.a[0],wall.b[1]-wall.a[1]);if(!Number.isFinite(o.u)||o.u*len<o.width/2+4||(1-o.u)*len<o.width/2+4)throw Error('A porta ou janela precisa caber inteira na parede.');for(const other of openings)if(other!==o&&other.room===o.room&&other.wall===o.wall&&Math.abs(other.u-o.u)*len<(other.width+o.width)/2+8)throw Error('Portas e janelas não podem se sobrepor.');}
  const m=W.maps[id],old=this.snapshot(id),position=V.Player.data&&{x:V.Player.data.x,y:V.Player.data.y};
  try{
   const testConstruction=copy(draft.construction);for(const door of testConstruction.doors)if(door.homeInternal)door.openUntil=R.clock+100;
   this.install(id,{construction:testConstruction,windows});
   const doors=R.structure(C.layouts[id]).doors.filter(d=>d.to),entry=doors[0];
   const start=entry&&R.approach(m,entry,46)||R.safe(m,{x:(source.spawn[0]+.5)*T,y:(source.spawn[1]+.5)*T});
   if(!start)throw Error('Deixe espaço livre junto à entrada.');
   if(W.current===m&&position&&V.Living.blocked(m,position.x,position.y,12))throw Error('Uma parede ficaria sobre o personagem. Mova o personagem antes de construir aqui.');
   const targets=m.objects.filter(o=>o.household||o.playerFurniture);
   for(const door of doors){const to=R.approach(m,door,46);if(!to||!R.navigation(m,start,to,10).length&&V.dist(start,to)>24)throw Error('Mantenha o caminho até as portas da casa.');}
   for(const o of targets){const to=R.safe(m,{x:o.x,y:o.y+30},10);if(to&&!R.navigation(m,start,to,9).length&&V.dist(start,to)>24)throw Error('A parede isolaria um móvel. Acrescente uma porta ou deixe uma passagem.');}
   return true;
  }finally{this.install(id,old);}
 },
 commit(id,draft){
  this.validate(id,draft);
  const value={construction:copy(draft.construction),windows:copy(this.windows(draft))};
  const h=H.ensure();h.constructionEdits||={};h.constructionEdits[id]=value;this.install(id,value);V.Save.save();return true;
 },
 open(id){
  if(!H.owned(id))return H.property(id);
  const d=copy(C.layouts[id]);if(!d?.construction?.rooms?.length)return;
  d.homeWindows||=[];
  let tool='select',selection=null,start=null,drag=null,dirty=false;
  const history=[],future=[],capture=()=>({construction:copy(d.construction),homeWindows:copy(d.homeWindows)});
  const mark=()=>{history.push(capture());if(history.length>40)history.shift();future.length=0;dirty=true;};
  const points=d.construction.rooms.flatMap(r=>r.polygon),bound=R.box(points),scale=Math.min(820/(bound.w+110),570/(bound.h+110));
  const origin={x:450-(bound.x+bound.w/2)*scale,y:310-(bound.y+bound.h/2)*scale};
  V.UI.modal('Construir · '+d.name,'PAREDES, JANELAS E PORTAS',`<p>Desenhe paredes com dois cliques. Portas e janelas encaixam nas paredes. Selecione um item para mover, ajustar ou remover. Salve para aplicar à casa.</p><div class="home-build-layout"><section><nav class="home-build-tools" aria-label="Ferramentas de construção">${[['select','↖ Selecionar'],['wall','▱ Parede'],['door','▯ Porta'],['window','⊞ Janela']].map(([key,label])=>'<button class="secondary" data-build-tool="'+key+'" aria-pressed="'+(key==='select')+'">'+label+'</button>').join('')}<button id="build-undo" class="quiet">↶ Desfazer</button><button id="build-redo" class="quiet">↷ Refazer</button></nav><canvas id="home-build-plan" width="900" height="620" tabindex="0" aria-label="Planta de construção. Escolha uma ferramenta e clique na planta."></canvas><p id="build-status" role="status" aria-live="polite">As paredes existentes estão visíveis. As entradas externas são preservadas.</p></section><aside id="build-inspector"></aside></div>`,'<button id="build-cancel" class="secondary">Voltar sem aplicar</button><button id="build-save" class="primary">Salvar construção</button>',true);
  V.$('.modal').classList.add('home-editor-dialog');
  const canvas=V.$('#home-build-plan'),c=canvas.getContext('2d'),status=V.$('#build-status');
  const snap=n=>Math.round(n/8)*8;
  const pointer=e=>{const b=canvas.getBoundingClientRect();return{x:snap(((e.clientX-b.left)*canvas.width/b.width-origin.x)/scale),y:snap(((e.clientY-b.top)*canvas.height/b.height-origin.y)/scale)};};
  const walls=()=>d.construction.rooms.flatMap(room=>room.walls.map(w=>({...w,room:room.id})));
  const selected=()=>selection?.kind==='wall'?walls().find(w=>w.id===selection.id):selection?.kind==='door'?d.construction.doors.find(o=>o.id===selection.id):selection?.kind==='window'?d.homeWindows.find(o=>o.id===selection.id):null;
  const protectedItem=o=>selection?.kind==='door'&&!!(o?.to||o?.pair||d.construction.rooms.some(r=>r.entrance===o?.id));
  const setStatus=text=>status.textContent=text;
  const paint=()=>{
   c.imageSmoothingEnabled=false;c.fillStyle='#17362e';c.fillRect(0,0,900,620);c.save();c.translate(origin.x,origin.y);c.scale(scale,scale);
   for(const room of d.construction.rooms){R.trace(c,room.polygon);c.fillStyle='#c5ae89';c.fill();c.save();c.clip();c.strokeStyle='#79634a30';c.lineWidth=1/scale;c.beginPath();const b=R.box(room.polygon);for(let x=b.x;x<=b.x+b.w;x+=T){c.moveTo(x,b.y);c.lineTo(x,b.y+b.h);}for(let y=b.y;y<=b.y+b.h;y+=T){c.moveTo(b.x,y);c.lineTo(b.x+b.w,y);}c.stroke();c.restore();c.fillStyle='#536049';c.font=`${12/scale}px sans-serif`;c.fillText(room.name,b.x+18,b.y+28);}
   for(const o of W.maps[id].objects.filter(o=>o.household||o.playerFurniture)){if(!o.scene)continue;const size=(o.scene.size||2)*T;C.prop(c,o.scene.family,o.scene.prop,o.x-size/2,o.y-size*.99,size);}
   HC.drawPlan(c,d,scale,selection);
   if(start){c.strokeStyle='#fff0a2';c.lineWidth=3/scale;c.beginPath();c.arc(start.x,start.y,9/scale,0,Math.PI*2);c.stroke();}
   const s=selected();if(s?.a)for(const p of [s.a,s.b]){c.fillStyle='#fff0a2';c.fillRect(p[0]-5/scale,p[1]-5/scale,10/scale,10/scale);}
   c.restore();V.$('#build-undo').disabled=!history.length;V.$('#build-redo').disabled=!future.length;
  };
  const remove=()=>{const o=selected();if(!o||protectedItem(o))return;mark();if(selection.kind==='wall'){const room=d.construction.rooms.find(r=>r.id===o.room);room.walls=room.walls.filter(w=>w.id!==o.id);d.construction.doors=d.construction.doors.filter(p=>p.wall!==o.id);d.homeWindows=d.homeWindows.filter(p=>p.wall!==o.id);}else if(selection.kind==='door')d.construction.doors=d.construction.doors.filter(p=>p.id!==o.id);else d.homeWindows=d.homeWindows.filter(p=>p.id!==o.id);selection=null;inspector();paint();};
  const inspector=()=>{
   const o=selected(),host=V.$('#build-inspector');if(!o){host.innerHTML='<h3>Sua planta</h3><p>▱ Paredes internas<br>▯ Portas e passagens<br>⊞ Janelas</p><p>Clique em uma peça para editar. As paredes do contorno mostram os limites dos cômodos.</p><p>Uma porta interna abre com E. As janelas deixam a parede sólida.</p>';return;}
   const protectedValue=protectedItem(o);host.innerHTML='<h3>'+({wall:'Parede interna',door:'Porta',window:'Janela'}[selection.kind])+'</h3>'+(protectedValue?'<p>Esta entrada liga a casa à cidade.</p>':selection.kind==='wall'?'<label class="field">Comprimento (px)<input id="build-size" type="number" min="48" max="1200" step="8" value="'+Math.round(Math.hypot(o.b[0]-o.a[0],o.b[1]-o.a[1]))+'"></label>':'<label class="field">Largura (px)<input id="build-size" type="number" min="'+(selection.kind==='door'?40:36)+'" max="160" step="8" value="'+o.width+'"></label>')+(!protectedValue?'<div class="row">'+[[0,-T,'↑'],[-T,0,'←'],[T,0,'→'],[0,T,'↓']].map(([x,y,label])=>'<button class="secondary" data-build-nudge="'+x+','+y+'" aria-label="Mover '+label+'">'+label+'</button>').join('')+'</div><button id="build-remove" class="quiet">Remover '+({wall:'parede',door:'porta',window:'janela'}[selection.kind])+'</button>':'');
   V.$('#build-size')?.addEventListener('change',e=>{const n=Number(e.target.value);if(!Number.isFinite(n)||n<36)return;mark();if(selection.kind==='wall'){const room=d.construction.rooms.find(r=>r.id===o.room),w=room.walls.find(w=>w.id===o.id),angle=Math.atan2(w.b[1]-w.a[1],w.b[0]-w.a[0]);w.b=[snap(w.a[0]+Math.cos(angle)*V.clamp(n,48,1200)),snap(w.a[1]+Math.sin(angle)*V.clamp(n,48,1200))];reanchor(w,room.id);}else{o.width=V.clamp(n,selection.kind==='door'?40:36,160);}paint();});
   V.$$('[data-build-nudge]').forEach(b=>b.onclick=()=>moveSelected(...b.dataset.buildNudge.split(',').map(Number)));V.$('#build-remove')?.addEventListener('click',remove);
  };
  const reanchor=(wall,roomId)=>{for(const o of [...d.construction.doors,...d.homeWindows].filter(o=>o.room===roomId&&o.wall===wall.id)){o.x=wall.a[0]+(wall.b[0]-wall.a[0])*o.u;o.y=wall.a[1]+(wall.b[1]-wall.a[1])*o.u;}};
  const moveSelected=(dx,dy)=>{const o=selected();if(!o||protectedItem(o))return;mark();if(selection.kind==='wall'){const room=d.construction.rooms.find(r=>r.id===o.room),wall=room.walls.find(w=>w.id===o.id);wall.a=[wall.a[0]+dx,wall.a[1]+dy];wall.b=[wall.b[0]+dx,wall.b[1]+dy];reanchor(wall,room.id);}else{const hit=R.nearestWall(d,{x:o.x+dx,y:o.y+dy});if(hit&&hit.distance<48){const width=o.width,door=R.doorAt(d,{x:o.x+dx,y:o.y+dy},{width});Object.assign(o,{x:door.x,y:door.y,room:door.room,wall:door.wall,u:door.u,normal:door.normal,facing:door.facing});}}paint();inspector();};
  const hit=p=>{const items=[...d.homeWindows.map(o=>({kind:'window',o})),...d.construction.doors.map(o=>({kind:'door',o}))];for(const s of items)if(Math.hypot(s.o.x-p.x,s.o.y-p.y)<Math.max(22,s.o.width/2))return{kind:s.kind,id:s.o.id};for(const w of walls())if(R.distSeg(p,w.a,w.b).distance<16)return{kind:'wall',id:w.id};return null;};
  const click=p=>{
   if(tool==='select'){selection=hit(p);inspector();paint();return;}
   if(tool==='wall'){
    if(!start){if(!d.construction.rooms.some(r=>R.pointIn(p.x,p.y,r.polygon))){setStatus('Comece a parede dentro de um cômodo.');return;}start=p;setStatus('Agora clique na outra ponta da parede.');paint();return;}
    const a=[start.x,start.y],b=Math.abs(p.x-start.x)>=Math.abs(p.y-start.y)?[p.x,start.y]:[start.x,p.y];
    const room=d.construction.rooms.find(r=>Array.from({length:21},(_,i)=>[a[0]+(b[0]-a[0])*i/20,a[1]+(b[1]-a[1])*i/20]).every(([x,y])=>R.pointIn(x,y,r.polygon)));
    if(!room||Math.hypot(b[0]-a[0],b[1]-a[1])<48){setStatus('A parede deve ter ao menos um bloco e ficar dentro do cômodo.');return;}
    mark();const wall={id:R.id('home-wall'),a,b};room.walls.push(wall);selection={kind:'wall',id:wall.id};start=null;inspector();paint();return;
   }
   const wall=R.nearestWall(d,p);if(!wall||wall.distance>36){setStatus('Clique sobre uma parede para encaixar '+(tool==='door'?'a porta.':'a janela.'));return;}
   try{
    const opening=R.doorAt(d,p,{width:64});
    if([...d.construction.doors,...d.homeWindows].some(o=>o.room===opening.room&&o.wall===opening.wall&&Math.hypot(o.x-opening.x,o.y-opening.y)<(o.width+opening.width)/2+16))throw Error('Deixe um espaço entre portas e janelas.');
    mark();if(tool==='door'){opening.name='Porta interna';opening.homeInternal=true;d.construction.doors.push(opening);selection={kind:'door',id:opening.id};}else{const window={id:R.id('home-window'),room:opening.room,wall:opening.wall,u:opening.u,x:opening.x,y:opening.y,width:64};d.homeWindows.push(window);selection={kind:'window',id:window.id};}inspector();paint();
   }catch(e){setStatus(e.message);}
  };
  V.$$('[data-build-tool]').forEach(b=>b.onclick=()=>{tool=b.dataset.buildTool;start=null;V.$$('[data-build-tool]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));setStatus({select:'Clique em uma peça para selecionar.',wall:'Clique nas duas pontas da nova parede.',door:'Clique sobre uma parede. A porta cria uma passagem.',window:'Clique sobre uma parede para instalar a janela.'}[tool]);paint();});
  canvas.addEventListener('pointerdown',e=>{e.preventDefault();canvas.focus();const p=pointer(e);if(tool==='select'){selection=hit(p);inspector();paint();if(selected()&&!protectedItem(selected())){drag={point:p,before:capture()};canvas.setPointerCapture?.(e.pointerId);}}else click(p);});
  canvas.addEventListener('pointerup',e=>{if(!drag)return;const p=pointer(e),dx=p.x-drag.point.x,dy=p.y-drag.point.y;drag=null;if(Math.hypot(dx,dy)>4)moveSelected(dx,dy);});canvas.addEventListener('pointercancel',()=>drag=null);
  canvas.addEventListener('keydown',e=>{const delta={ArrowLeft:[-8,0],ArrowRight:[8,0],ArrowUp:[0,-8],ArrowDown:[0,8]}[e.key];if(delta){e.preventDefault();moveSelected(...delta);}else if(e.key==='Delete'){e.preventDefault();remove();}else if(e.key==='Escape'){e.preventDefault();start=null;selection=null;inspector();paint();}});
  const undo=redo=>{const from=redo?future:history,to=redo?history:future;if(!from.length)return;to.push(capture());Object.assign(d,from.pop());selection=null;start=null;dirty=true;inspector();paint();};V.$('#build-undo').onclick=()=>undo(false);V.$('#build-redo').onclick=()=>undo(true);
  V.$('#build-cancel').onclick=()=>H.organize(id);
  V.$('#build-save').onclick=()=>{try{if(dirty)HC.commit(id,d);H.organize(id);V.UI.toast('Construção salva nesta casa.');}catch(e){setStatus(e.message);}};
  inspector();paint();
 }
};
const start=V.Game.startGame.bind(V.Game);V.Game.startGame=function(...args){HC.restore();return start(...args);};
const transition=R.transition.bind(R);R.transition=function(door,editor=false){if(door.homeInternal&&!editor){door.openUntil=R.clock+2.5;V.Audio.sfx('menu');return true;}return transition(door,editor);};
const draw=C.drawObject.bind(C);C.drawObject=function(c,o,cam,t){
 if(o.type!=='home-window')return draw(c,o,cam,t);
 const w=o.homeWindow,d=W.current?.design,wall=d&&R.structure(d).rooms.flatMap(r=>R.segments(r)).find(s=>s.room===w.room&&s.key===w.wall);if(!wall)return;
 const x=o.x-(cam?.x||0),y=o.y-(cam?.y||0),vertical=Math.abs(wall.b[1]-wall.a[1])>Math.abs(wall.b[0]-wall.a[0]);
 c.save();c.translate(x,y);if(vertical)c.transform(.4,.35,0,1,0,0);c.fillStyle='#695540';c.fillRect(-w.width/2-4,-61,w.width+8,49);c.fillStyle='#91c8d2';c.fillRect(-w.width/2,-57,w.width,41);c.fillStyle='#e9d8a4';c.fillRect(-2,-57,4,41);c.fillRect(-w.width/2,-38,w.width,3);c.fillStyle='#fff4cb66';c.fillRect(-w.width/2+5,-53,8,29);c.restore();
};
})();
